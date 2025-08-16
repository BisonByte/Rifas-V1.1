import { NextRequest, NextResponse } from 'next/server'

// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/prisma'
import { emitNotification } from '@/lib/notificationEmitter'
import { z } from 'zod'
import { requireAuth, isAdmin } from '@/lib/auth'

const MarcarLeidaSchema = z.object({
  notificacionId: z.string()
})

const CrearNotificacionSchema = z.object({
  tipo: z.string(),
  titulo: z.string().min(1),
  mensaje: z.string().min(1),
  datos: z.record(z.any()).optional(),
  participanteId: z.string().optional(),
  paraAdministradores: z.boolean().default(false)
})

// GET: Listar notificaciones para administradores
export async function GET(request: NextRequest) {
  try {
    const currentUser = await requireAuth(request)
    if (!currentUser || !isAdmin(currentUser)) {
      return NextResponse.json(
        { success: false, error: 'Acceso denegado' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
    const tipo = searchParams.get('tipo')
    const leidas = searchParams.get('leidas') === 'true'

    const skip = (page - 1) * limit
    
    const where: any = {
      paraAdministradores: true
    }
    
    if (tipo) where.tipo = tipo
    if (leidas !== null) where.leida = leidas
    
    const [notificaciones, total, noLeidas] = await Promise.all([
      prisma.notificacion.findMany({
        where,
        select: {
          id: true,
          tipo: true,
          titulo: true,
          mensaje: true,
          leida: true,
          usuarioId: true,
          participanteId: true,
          paraAdministradores: true,
          metadata: true,
          fechaLectura: true,
          creadaPor: true,
          leidaPor: true,
          createdAt: true,
          updatedAt: true
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      
      prisma.notificacion.count({ where }),
      
      prisma.notificacion.count({
        where: {
          paraAdministradores: true,
          leida: false
        }
      })
    ])
    
    // Agrupar notificaciones por tipo para estadísticas
    const tiposCount = await prisma.notificacion.groupBy({
      by: ['tipo'],
      where: {
        paraAdministradores: true,
        leida: false
      },
      _count: true
    })
    
    const estadisticas = {
      totalNoLeidas: noLeidas,
      porTipo: tiposCount.reduce((acc: Record<string, number>, item: any) => {
        acc[item.tipo] = item._count
        return acc
      }, {} as Record<string, number>)
    }
    
    return NextResponse.json({
      success: true,
      data: notificaciones,
      estadisticas,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    })
    
  } catch (error) {
    console.error('Error al listar notificaciones:', error)
    return NextResponse.json(
      { success: false, error: 'Error al cargar notificaciones' },
      { status: 500 }
    )
  }
}

// POST: Crear notificación o marcar como leída
export async function POST(request: NextRequest) {
  try {
    const currentUser = await requireAuth(request)
    if (!currentUser || !isAdmin(currentUser)) {
      return NextResponse.json(
        { success: false, error: 'Acceso denegado' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const action = body.action
    
    if (action === 'marcar_leida') {
      const { notificacionId } = MarcarLeidaSchema.parse(body)
      const adminId = currentUser.id
      
      const notificacion = await prisma.notificacion.update({
        where: { id: notificacionId },
        data: { 
          leida: true,
          fechaLectura: new Date(),
          leidaPor: adminId
        }
      })
      
      return NextResponse.json({
        success: true,
        data: { mensaje: 'Notificación marcada como leída' }
      })
      
    } else if (action === 'crear') {
      const datosNotificacion = CrearNotificacionSchema.parse(body)
      const adminId = currentUser.id

      const notificacion = await prisma.notificacion.create({
        data: {
          ...datosNotificacion,
          creadaPor: adminId
        }
      })
        emitNotification({ id: notificacion.id, tipo: notificacion.tipo, titulo: notificacion.titulo, mensaje: notificacion.mensaje })
      
      // Registro de auditoría
      await prisma.auditLog.create({
        data: {
          evento: 'CREAR_NOTIFICACION',
          accion: 'CREAR_NOTIFICACION',
          entidad: 'NOTIFICACION',
          entidadId: notificacion.id,
          payload: JSON.stringify({
            tipo: notificacion.tipo,
            titulo: notificacion.titulo,
            paraAdministradores: notificacion.paraAdministradores,
            participanteId: notificacion.participanteId
          }),
          usuarioId: adminId,
          ipAddress: request.headers.get('x-forwarded-for') || 'admin-panel'
        }
      })
      
      return NextResponse.json({
        success: true,
        data: { 
          notificacionId: notificacion.id,
          mensaje: 'Notificación creada exitosamente' 
        }
      })
    }
    
    return NextResponse.json(
      { success: false, error: 'Acción no válida' },
      { status: 400 }
    )
    
  } catch (error) {
    console.error('Error al procesar notificación:', error)
    return NextResponse.json(
      { success: false, error: 'Error al procesar notificación' },
      { status: 500 }
    )
  }
}

// PATCH: Marcar todas como leídas
export async function PATCH(request: NextRequest) {
  try {
    const currentUser = await requireAuth(request)
    if (!currentUser || !isAdmin(currentUser)) {
      return NextResponse.json(
        { success: false, error: 'Acceso denegado' },
        { status: 403 }
      )
    }
    const adminId = currentUser.id
    
    const resultado = await prisma.notificacion.updateMany({
      where: {
        paraAdministradores: true,
        leida: false
      },
      data: {
        leida: true,
        fechaLectura: new Date(),
        leidaPor: adminId
      }
    })
    
    return NextResponse.json({
      success: true,
      data: {
        mensaje: `${resultado.count} notificaciones marcadas como leídas`,
        notificacionesActualizadas: resultado.count
      }
    })
    
  } catch (error) {
    console.error('Error al marcar todas como leídas:', error)
    return NextResponse.json(
      { success: false, error: 'Error al actualizar notificaciones' },
      { status: 500 }
    )
  }
}
