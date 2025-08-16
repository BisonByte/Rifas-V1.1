import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { MOCK_MODE, MOCK_PAGOS_PENDIENTES } from '@/lib/mock-data'

// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic'

const VerificarPagoSchema = z.object({
  compraId: z.string(),
  accion: z.enum(['APROBAR', 'RECHAZAR']),
  comentarios: z.string().optional(),
  adminId: z.string() // En producción vendría del JWT/session
})

export async function GET(request: NextRequest) {
  try {
    // Si estamos en modo demo/mock, devolver datos ficticios
    if (MOCK_MODE) {
      const searchParams = request.nextUrl.searchParams
      const estado = searchParams.get('estado') || 'EN_VERIFICACION'
      const limit = parseInt(searchParams.get('limit') || '10')
      
      return NextResponse.json({
        success: true,
        data: MOCK_PAGOS_PENDIENTES.slice(0, limit)
      })
    }
    
    // Código original para base de datos real...
    const searchParams = request.nextUrl.searchParams
    const estado = searchParams.get('estado') || 'EN_VERIFICACION'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    const compras = await prisma.compra.findMany({
      where: { estadoPago: estado as any },
      include: {
        participante: {
          select: { nombre: true, celular: true, email: true }
        },
        rifa: {
          select: { nombre: true }
        }
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({
      success: true,
      data: compras
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
  // Si estamos en modo demo/mock, simular respuesta exitosa
  if (MOCK_MODE) {
    const body = await request.json()
    console.log('DEMO: Acción de pago simulada:', body)
    
    return NextResponse.json({
      success: true,
      message: `Pago ${body.accion === 'APROBAR' ? 'aprobado' : 'rechazado'} exitosamente (MODO DEMO)`
    })
  }

  const transaction = await prisma.$transaction(async (tx: any) => {
    try {
      const body = await request.json()
      const { compraId, accion, comentarios, adminId } = VerificarPagoSchema.parse(body)
      
      // TODO: Verificar autenticación de administrador
      const admin = await tx.usuario.findUnique({
        where: { id: adminId },
        select: { id: true, nombre: true, rol: true }
      })
      
      if (!admin || admin.rol !== 'ADMIN') {
        throw new Error('No autorizado')
      }
      
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
        // Aprobar pago
        await tx.compra.update({
          where: { id: compraId },
          data: {
            estadoPago: 'CONFIRMADO',
            fechaConfirmacion: new Date(),
            comentariosAdmin: comentarios,
            verificadoPor: adminId
          }
        })
        
        // Confirmar todos los tickets
        await tx.ticket.updateMany({
          where: { compraId: compraId },
          data: {
            estado: 'PAGADO',
            fechaConfirmacion: new Date()
          }
        })
        
        // Notificar al participante
        await tx.notificacion.create({
          data: {
            tipo: 'PAGO_CONFIRMADO',
            titulo: '¡Pago confirmado!',
            mensaje: `Tu pago por ${compra.tickets.length} tickets de "${compra.rifa.nombre}" ha sido confirmado. ¡Ya participas en el sorteo!`,
            datos: {
              compraId: compra.id,
              tickets: compra.tickets.map((t: any) => t.numero),
              fechaSorteo: compra.rifa.fechaSorteo
            },
            participanteId: compra.participanteId
          }
        })
        
      } else if (accion === 'RECHAZAR') {
        // Rechazar pago
        await tx.compra.update({
          where: { id: compraId },
          data: {
            estadoPago: 'RECHAZADO',
            fechaRechazo: new Date(),
            comentariosAdmin: comentarios,
            verificadoPor: adminId
          }
        })
        
        // Cancelar tickets para liberar números
        await tx.ticket.updateMany({
          where: { compraId: compraId },
          data: { estado: 'CANCELADO' }
        })
        
        // Notificar rechazo al participante
        await tx.notificacion.create({
          data: {
            tipo: 'PAGO_RECHAZADO',
            titulo: 'Pago no verificado',
            mensaje: `No pudimos verificar tu pago por ${compra.tickets.length} tickets de "${compra.rifa.nombre}". ${comentarios || 'Contacta con soporte para más información.'}`,
            datos: {
              compraId: compra.id,
              tickets: compra.tickets.map((t: any) => t.numero),
              razon: comentarios
            },
            participanteId: compra.participanteId
          }
        })
      }
      
      // Registro de auditoría
      await tx.auditLog.create({
        data: {
          accion: `VERIFICACION_${accion}`,
          entidad: 'COMPRA',
          entidadId: compraId,
          detalles: {
            participante: compra.participante.celular,
            tickets: compra.tickets.map((t: any) => t.numero),
            monto: compra.monto,
            referencia: compra.numeroReferencia,
            comentarios
          },
          usuarioId: adminId,
          ip: request.headers.get('x-forwarded-for') || 'admin-panel'
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
