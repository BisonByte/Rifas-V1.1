import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { requireAuth, isAdmin } from '@/lib/auth'
import { EstadoRifa } from '@/types'
import { z } from 'zod'

// Schema para búsqueda y paginación
const BusquedaSchema = z.object({
  q: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  orderBy: z.string().optional(),
  orderDir: z.enum(['asc', 'desc']).default('desc')
})

const PortadaUrlSchema = z.preprocess((v) => {
  if (typeof v === 'string' && v.trim() === '') return undefined
  return v
}, z.string().refine((val) => {
  if (typeof val !== 'string') return false
  if (val.startsWith('/')) return true
  try { new URL(val); return true } catch { return false }
}, { message: 'Debe ser una URL válida o una ruta que comience con /' }).optional())

const RifaSchema = z.object({
  nombre: z.string().min(3).max(200),
  descripcion: z.string().min(10).max(1000),
  portadaUrl: PortadaUrlSchema,
  fechaSorteo: z.coerce.date(),
  precioPorBoleto: z.number().min(0.01).max(10000),
  // Limitar a 10,000 para respetar rango 0000–9999
  totalBoletos: z.number().min(1, 'Debe ser al menos 1').max(10000, 'Máximo 10,000 (0000–9999)'),
  // Límite por persona deshabilitado: mantener opcional sin validar límites estrictos
  limitePorPersona: z.number().int().positive().optional(),
  tiempoReserva: z.number().min(5).max(120).default(30),
  mostrarTopCompradores: z.boolean().default(false).optional(),
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const params = Object.fromEntries(searchParams)
    
    const { q, page, limit, orderBy, orderDir } = BusquedaSchema.parse(params)
    
    const skip = (page - 1) * limit
    
    // Filtros de búsqueda
    const where: any = {}
    
    if (q) {
      where.OR = [
        { nombre: { contains: q, mode: 'insensitive' } },
        { descripcion: { contains: q, mode: 'insensitive' } }
      ]
    }
    
    // Solo rifas activas para el público
    const currentUser = await requireAuth(request)
    if (!currentUser || !isAdmin(currentUser)) {
      where.estado = EstadoRifa.ACTIVA
    }
    
    // Ordenamiento
    const orderByClause: any = {}
    if (orderBy) {
      orderByClause[orderBy] = orderDir
    } else {
      orderByClause.createdAt = orderDir
    }
    
    // Consulta con paginación
  const [rifas, total] = await Promise.all([
      prisma.rifa.findMany({
        where,
        skip,
        take: limit,
        orderBy: orderByClause,
        include: {
          premios: {
            select: {
              id: true,
              titulo: true,
              descripcion: true,
              cantidad: true,
              orden: true
            }
          },
          _count: {
            select: {
              tickets: {
                where: {
                  estado: 'PAGADO'
                }
              }
            }
          }
        }
      }),
      prisma.rifa.count({ where })
    ])
    
    return NextResponse.json({
      success: true,
      data: rifas,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
    
  } catch (error) {
    console.error('Error al obtener rifas:', error)
    return NextResponse.json(
      { success: false, error: 'Error al obtener rifas' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Solo admins pueden crear rifas
    const currentUser = await requireAuth(request)
    if (!currentUser) {
      return NextResponse.json(
        { success: false, error: 'No autenticado' },
        { status: 401 }
      )
    }
    if (!isAdmin(currentUser)) {
      return NextResponse.json(
        { success: false, error: 'Acceso denegado' },
        { status: 403 }
      )
    }
    
  const body = await request.json()
  const rifaData = RifaSchema.parse(body)
    
    // Crear la rifa primero
  const rifa = await prisma.rifa.create({
      data: {
        nombre: rifaData.nombre,
        descripcion: rifaData.descripcion,
        portadaUrl: rifaData.portadaUrl,
        fechaSorteo: rifaData.fechaSorteo,
        precioPorBoleto: rifaData.precioPorBoleto,
        totalBoletos: rifaData.totalBoletos,
        // Campo opcional; si no se envía, quedará null
        limitePorPersona: rifaData.limitePorPersona,
        tiempoReserva: rifaData.tiempoReserva,
        estado: EstadoRifa.BORRADOR,
      }
    })

    // Luego crear tickets en lotes fuera de una transacción larga
    try {
      const batchSize = 500
      const total = rifaData.totalBoletos
      for (let start = 0; start < total; start += batchSize) {
        const end = Math.min(start + batchSize - 1, total - 1)
        const data = [] as any[]
        for (let n = start; n <= end; n++) {
          data.push({
            numero: n,
            rifaId: rifa.id,
            estado: 'DISPONIBLE' as const,
            monto: rifaData.precioPorBoleto,
          })
        }
        await prisma.ticket.createMany({ data })
      }
    } catch (e) {
      // Limpieza si falla el seeding de tickets
      try { await prisma.rifa.delete({ where: { id: rifa.id } }) } catch {}
      throw e
    }
    
    return NextResponse.json({
      success: true,
      data: rifa,
      message: 'Rifa creada exitosamente'
    })
    
  } catch (error: any) {
    // Validación Zod
    if (error instanceof z.ZodError) {
      const details = error.issues.map(i => `${i.path.join('.')}: ${i.message}`)
      return NextResponse.json(
        { success: false, error: 'Datos inválidos', details },
        { status: 400 }
      )
    }

    // Errores Prisma conocidos
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return NextResponse.json(
        { success: false, error: `DB: ${error.code} - ${error.message}` },
        { status: 400 }
      )
    }

    console.error('Error al crear rifa:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno al crear rifa', details: String(error?.message || error) },
      { status: 500 }
    )
  }
}
