import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const rifaId = params.id

    // Verificar que la rifa existe y está activa
    const rifa = await prisma.rifa.findFirst({
      where: {
        id: rifaId,
        estado: 'ACTIVA'
      }
    })

    if (!rifa) {
      return NextResponse.json(
        { error: 'Rifa no encontrada o no activa' },
        { status: 404 }
      )
    }

    // Obtener todos los tickets de la rifa con su estado
    const tickets = await prisma.ticket.findMany({
      where: { rifaId },
      select: {
        numero: true,
        estado: true,
        fechaReserva: true,
        fechaVencimiento: true,
        participante: {
          select: {
            nombre: true
          }
        }
      },
      orderBy: { numero: 'asc' }
    })

    // Limpiar tickets reservados vencidos
    const ticketsVencidos = tickets.filter(ticket => 
      ticket.estado === 'RESERVADO' && 
      ticket.fechaVencimiento && 
      new Date() > ticket.fechaVencimiento
    )

    if (ticketsVencidos.length > 0) {
      await prisma.ticket.updateMany({
        where: {
          rifaId,
          numero: { in: ticketsVencidos.map(t => t.numero) },
          estado: 'RESERVADO'
        },
        data: {
          estado: 'DISPONIBLE',
          participanteId: null,
          compraId: null,
          monto: null,
          fechaReserva: null,
          fechaVencimiento: null
        }
      })

      // Actualizar el estado en la respuesta
      ticketsVencidos.forEach(ticket => {
        ticket.estado = 'DISPONIBLE'
        ticket.participante = null
      })
    }

    // Contar tickets por estado
    const contadores = {
      disponibles: tickets.filter(t => t.estado === 'DISPONIBLE').length,
      reservados: tickets.filter(t => t.estado === 'RESERVADO').length,
      vendidos: tickets.filter(t => t.estado === 'VENDIDO').length,
      total: tickets.length
    }

    return NextResponse.json({
      success: true,
      rifa: {
        id: rifa.id,
        nombre: rifa.nombre,
        precioPorBoleto: rifa.precioPorBoleto,
        totalBoletos: rifa.totalBoletos,
        limitePorPersona: rifa.limitePorPersona,
        tiempoReserva: rifa.tiempoReserva
      },
      tickets,
      contadores
    })

  } catch (error) {
    console.error('Error obteniendo tickets:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
