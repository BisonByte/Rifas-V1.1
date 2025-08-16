import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
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

const RifaSchema = z.object({
  nombre: z.string().min(3).max(200),
  descripcion: z.string().min(10).max(1000),
  fechaSorteo: z.coerce.date(),
  precioPorBoleto: z.number().min(0.01).max(10000),
  totalBoletos: z.number().min(1).max(100000),
  limitePorPersona: z.number().min(1).max(100).optional(),
  tiempoReserva: z.number().min(5).max(120).default(30),
  moneda: z.string().default('USD'),
  zonaHoraria: z.string().default('UTC')
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
    if (!request.headers.get('admin')) {
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
    const isAdmin = request.headers.get('admin') === 'true'
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      )
    }
    
    const body = await request.json()
    const rifaData = RifaSchema.parse(body)
    
    // Crear rifa en transacción
    const rifa = await prisma.$transaction(async (tx: any) => {
      // Crear la rifa
      const nuevaRifa = await tx.rifa.create({
        data: {
          ...rifaData,
          estado: EstadoRifa.BORRADOR
        }
      })
      
      // Crear todos los tickets
      const tickets = []
      for (let i = 1; i <= rifaData.totalBoletos; i++) {
        tickets.push({
          numero: i,
          rifaId: nuevaRifa.id,
          estado: 'DISPONIBLE' as const,
          monto: rifaData.precioPorBoleto
        })
      }
      
      await tx.ticket.createMany({
        data: tickets
      })
      
      return nuevaRifa
    })
    
    return NextResponse.json({
      success: true,
      data: rifa,
      message: 'Rifa creada exitosamente'
    })
    
  } catch (error) {
    console.error('Error al crear rifa:', error)
    return NextResponse.json(
      { success: false, error: 'Error al crear rifa' },
      { status: 500 }
    )
  }
}
