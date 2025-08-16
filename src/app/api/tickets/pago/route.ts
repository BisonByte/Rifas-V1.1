import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const ConfirmarPagoSchema = z.object({
  compraId: z.string(),
  referencia: z.string().min(1),
  voucher: z.string().optional() // Base64 del archivo o URL
})

const AccionPagoSchema = z.object({
  compraId: z.string(),
  accion: z.enum(['aprobar', 'rechazar']),
  notas: z.string().optional()
})

// POST: Confirmar pago con comprobante
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { compraId, referencia, voucher } = ConfirmarPagoSchema.parse(body)
    
    const resultado = await prisma.$transaction(async (tx) => {
      // Buscar la compra
      const compra = await tx.compra.findUnique({
        where: { id: compraId },
        include: {
          tickets: true,
          rifa: true,
          participante: true
        }
      })
      
      if (!compra) {
        throw new Error('Compra no encontrada')
      }
      
      if (compra.estadoPago !== 'PENDIENTE') {
        throw new Error('Esta compra ya fue procesada')
      }
      
      // Verificar que no esté vencida
      if (compra.fechaVencimiento && new Date() > compra.fechaVencimiento) {
        // Liberar tickets vencidos
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
        
        await tx.compra.update({
          where: { id: compra.id },
          data: { estadoPago: 'VENCIDO' }
        })
        
        throw new Error('La reserva ha vencido')
      }
      
      // Actualizar compra con datos de pago
      const compraActualizada = await tx.compra.update({
        where: { id: compraId },
        data: {
          estadoPago: 'EN_VERIFICACION',
          referencia: referencia,
          voucherUrl: voucher
        }
      })
      
      // Actualizar tickets a EN_VERIFICACION
      await tx.ticket.updateMany({
        where: { compraId: compra.id },
        data: { 
          estado: 'EN_VERIFICACION'
        }
      })
      
      return {
        success: true,
        data: {
          mensaje: 'Comprobante recibido correctamente',
          compra: compraActualizada,
          estado: 'EN_VERIFICACION',
          proximoPaso: 'Su pago será verificado en un máximo de 2 horas hábiles'
        }
      }
    })
    
    return NextResponse.json(resultado)
    
  } catch (error) {
    console.error('Error al procesar pago:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Error interno del servidor'
    }, { status: 400 })
  }
}

// PATCH: Aprobar o rechazar pago (admin)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { compraId, accion, notas } = AccionPagoSchema.parse(body)
    
    const resultado = await prisma.$transaction(async (tx) => {
      const compra = await tx.compra.findUnique({
        where: { id: compraId },
        include: { tickets: true }
      })
      
      if (!compra) {
        throw new Error('Compra no encontrada')
      }
      
      if (compra.estadoPago !== 'EN_VERIFICACION') {
        throw new Error('La compra no está en verificación')
      }
      
      const nuevoEstado = accion === 'aprobar' ? 'APROBADO' : 'RECHAZADO'
      
      // Actualizar compra
      const compraActualizada = await tx.compra.update({
        where: { id: compraId },
        data: {
          estadoPago: nuevoEstado
        }
      })
      
      if (accion === 'aprobar') {
        // Marcar tickets como vendidos
        await tx.ticket.updateMany({
          where: { compraId: compraId },
          data: { estado: 'VENDIDO' }
        })
      } else {
        // Liberar tickets rechazados
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
      }
      
      return compraActualizada
    })
    
    return NextResponse.json({
      success: true,
      message: accion === 'aprobar' ? 'Pago aprobado' : 'Pago rechazado',
      data: {
        compraId: resultado.id,
        estadoPago: resultado.estadoPago
      }
    })
    
  } catch (error) {
    console.error('Error en acción de pago:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Error interno del servidor'
    }, { status: 400 })
  }
}

// GET: Consultar estado de pago
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const compraId = searchParams.get('compraId')
    const referencia = searchParams.get('referencia')
    
    if (!compraId && !referencia) {
      return NextResponse.json(
        { success: false, error: 'ID de compra o referencia requeridos' },
        { status: 400 }
      )
    }
    
    const where = compraId 
      ? { id: compraId }
      : { referencia: referencia }
    
    const compra = await prisma.compra.findFirst({
      where,
      include: {
        tickets: {
          select: {
            numero: true,
            estado: true
          },
          orderBy: { numero: 'asc' }
        },
        rifa: {
          select: {
            nombre: true,
            fechaSorteo: true
          }
        },
        participante: {
          select: {
            nombre: true,
            celular: true
          }
        }
      }
    })
    
    if (!compra) {
      return NextResponse.json(
        { success: false, error: 'Compra no encontrada' },
        { status: 404 }
      )
    }
    
    // Enmascarar datos sensibles
    const datosPublicos = {
      id: compra.id,
      monto: compra.monto,
      estadoPago: compra.estadoPago,
      fechaCreacion: compra.createdAt,
      tickets: compra.tickets,
      rifa: compra.rifa,
      participante: {
        nombre: compra.participante.nombre.charAt(0) + '***',
        celular: '***-' + compra.participante.celular.slice(-4)
      },
      // Solo mostrar referencia parcial
      referencia: compra.referencia ?
        '***' + compra.referencia.slice(-4) : null
    }
    
    return NextResponse.json({
      success: true,
      data: datosPublicos
    })
    
  } catch (error) {
    console.error('Error al consultar pago:', error)
    return NextResponse.json(
      { success: false, error: 'Error al consultar estado de pago' },
      { status: 500 }
    )
  }
}
