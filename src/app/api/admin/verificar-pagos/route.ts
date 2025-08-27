import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { requireAuth, isAdmin } from '@/lib/auth'

// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic'

const VerificarPagoSchema = z.object({
  compraId: z.string(),
  accion: z.enum(['APROBAR', 'RECHAZAR']),
  comentarios: z.string().optional()
})

export async function GET(request: NextRequest) {
  try {
    const currentUser = await requireAuth(request)
    if (!currentUser || !isAdmin(currentUser)) {
      return NextResponse.json(
        { success: false, error: 'Acceso denegado' },
        { status: 403 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    // El parámetro "estado" puede ser una lista separada por comas o "TODOS"
    const estadoParam = searchParams.get('estado')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    const where: any = {}
    if (estadoParam && estadoParam !== 'TODOS') {
      const estados = estadoParam.split(',')
      where.estadoPago = { in: estados as any }
    }

    const compras = await prisma.compra.findMany({
      where,
      include: {
        participante: {
          select: { nombre: true, celular: true, email: true }
        },
        rifa: {
          select: { nombre: true }
        },
        tickets: {
          select: { numero: true },
          orderBy: { numero: 'asc' }
        }
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' }
    })

    // Adaptar datos a lo que espera el panel admin
    const data = compras.map((c: any) => ({
      ...c,
      numerosTickets: Array.isArray(c.tickets) ? c.tickets.map((t: any) => t.numero) : [],
      numeroReferencia: c.referencia ?? null,
      comprobante: c.imagenComprobante ?? c.voucherUrl ?? null,
      fechaCreacion: c.createdAt
    }))

    return NextResponse.json({
      success: true,
      data
    })
  } catch (error) {
    console.error('Error al listar pagos:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  const currentUser = await requireAuth(request)
  if (!currentUser || !isAdmin(currentUser)) {
    return NextResponse.json(
      { success: false, error: 'Acceso denegado' },
      { status: 403 }
    )
  }

  const transaction = await prisma.$transaction(async (tx: any) => {
    try {
      const body = await request.json()
      const { compraId, accion, comentarios } = VerificarPagoSchema.parse(body)
      const adminId = currentUser.id
      
      // Buscar la compra
      const compra = await tx.compra.findUnique({
        where: { id: compraId },
        include: {
          tickets: true,
          participante: true,
          rifa: true
        }
      })
      
      if (!compra) {
        throw new Error('Compra no encontrada')
      }
      
      if (compra.estadoPago !== 'EN_VERIFICACION') {
        throw new Error('Esta compra no está pendiente de verificación')
      }
      
      if (accion === 'APROBAR') {
        // Aprobar pago (usar solo campos existentes)
        await tx.compra.update({
          where: { id: compraId },
          data: {
            estadoPago: 'CONFIRMADO'
          }
        })
        // Confirmar todos los tickets
        await tx.ticket.updateMany({
          where: { compraId: compraId },
          data: {
            estado: 'PAGADO'
          }
        })
        // Notificar al participante
        await tx.notificacion.create({
          data: {
            tipo: 'PAGO_CONFIRMADO',
            titulo: '¡Pago confirmado!',
            mensaje: `Tu pago por ${compra.tickets.length} tickets de "${compra.rifa.nombre}" ha sido confirmado. ¡Ya participas en el sorteo!`,
            participanteId: compra.participanteId,
            metadata: JSON.stringify({
              compraId: compra.id,
              tickets: compra.tickets.map((t: any) => t.numero),
              fechaSorteo: compra.rifa.fechaSorteo
            })
          }
        })
        
      } else if (accion === 'RECHAZAR') {
        // Rechazar pago
        await tx.compra.update({
          where: { id: compraId },
          data: {
            estadoPago: 'RECHAZADO'
          }
        })
        // Liberar tickets para que vuelvan a estar disponibles
        await tx.ticket.updateMany({
          where: { compraId: compraId },
          data: {
            estado: 'DISPONIBLE',
            participanteId: null,
            compraId: null,
            fechaReserva: null,
            fechaVencimiento: null
          }
        })
        // Notificar rechazo al participante
        await tx.notificacion.create({
          data: {
            tipo: 'PAGO_RECHAZADO',
            titulo: 'Pago no verificado',
            mensaje: `No pudimos verificar tu pago por ${compra.tickets.length} tickets de "${compra.rifa.nombre}". ${comentarios || 'Contacta con soporte para más información.'}`,
            participanteId: compra.participanteId,
            metadata: JSON.stringify({
              compraId: compra.id,
              tickets: compra.tickets.map((t: any) => t.numero),
              razon: comentarios
            })
          }
        })
      }
      
      // Registro de auditoría
      await tx.auditLog.create({
        data: {
          accion: `VERIFICACION_${accion}`,
          entidad: 'COMPRA',
          entidadId: compraId,
          detalles: JSON.stringify({
            participante: compra.participante.celular,
            tickets: compra.tickets.map((t: any) => t.numero),
            monto: compra.monto,
            referencia: compra.referencia,
            comentarios
          }),
          usuarioId: adminId,
          ipAddress: request.headers.get('x-forwarded-for') || 'admin-panel'
        }
      })
      
      return {
        success: true,
        data: {
          mensaje: `Pago ${accion.toLowerCase()} exitosamente`,
          compraId: compra.id,
          accion,
          tickets: compra.tickets.length
        }
      }
      
    } catch (error) {
      console.error('Error en verificación:', error)
      throw error
    }
  })
  
  return NextResponse.json(transaction)
}
