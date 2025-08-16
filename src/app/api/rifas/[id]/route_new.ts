import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    
    const rifa = await prisma.rifa.findUnique({
      where: { id },
      include: {
        premios: {
          select: {
            id: true,
            titulo: true,
            descripcion: true,
            cantidad: true,
            orden: true
          },
          orderBy: { orden: 'asc' }
        },
        tickets: {
          select: {
            estado: true
          }
        }
      }
    })

    if (!rifa) {
      return NextResponse.json(
        { error: 'Rifa no encontrada' },
        { status: 404 }
      )
    }

    // Calcular estadísticas
    const ticketsVendidos = rifa.tickets.filter(t => t.estado === 'VENDIDO' || t.estado === 'PAGADO').length
    const ticketsReservados = rifa.tickets.filter(t => t.estado === 'RESERVADO').length
    const ticketsDisponibles = rifa.tickets.filter(t => t.estado === 'DISPONIBLE').length + (rifa.totalBoletos - rifa.tickets.length)

    // Preparar respuesta
    const rifaData = {
      id: rifa.id,
      nombre: rifa.nombre,
      descripcion: rifa.descripcion,
      fechaSorteo: rifa.fechaSorteo,
      precioPorBoleto: rifa.precioPorBoleto,
      totalBoletos: rifa.totalBoletos,
      limitePorPersona: rifa.limitePorPersona,
      estado: rifa.estado,
      tiempoReserva: rifa.tiempoReserva,
      premios: rifa.premios,
      estadisticas: {
        ticketsVendidos,
        ticketsReservados,
        ticketsDisponibles,
        totalRecaudado: ticketsVendidos * rifa.precioPorBoleto,
        porcentajeVendido: Math.round((ticketsVendidos / rifa.totalBoletos) * 100)
      },
      createdAt: rifa.createdAt,
      updatedAt: rifa.updatedAt
    }

    return NextResponse.json(rifaData)

  } catch (error) {
    console.error('Error al obtener rifa:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
