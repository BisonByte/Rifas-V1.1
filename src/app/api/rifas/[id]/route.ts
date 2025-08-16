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
          orderBy: { orden: 'asc' },
          include: {
            ticketGanador: {
              include: {
                participante: {
                  select: {
                    nombre: true,
                    celular: true
                  }
                }
              }
            }
          }
        },
        tickets: {
          select: {
            numero: true,
            estado: true,
            participanteId: true
          },
          orderBy: { numero: 'asc' }
        },
        _count: {
          select: {
            tickets: true,
            compras: true
          }
        }
      }
    })
    
    if (!rifa) {
      return NextResponse.json(
        { success: false, error: 'Rifa no encontrada' },
        { status: 404 }
      )
    }
    
    // Calcular estadísticas
    const ticketsVendidos = rifa.tickets.filter(t => t.estado === 'PAGADO').length
    const ticketsReservados = rifa.tickets.filter(t => t.estado === 'RESERVADO').length
    const ticketsDisponibles = rifa.tickets.filter(t => t.estado === 'DISPONIBLE').length
    
    const rifaConStats = {
      ...rifa,
      estadisticas: {
        ticketsVendidos,
        ticketsReservados,
        ticketsDisponibles,
        totalRecaudado: ticketsVendidos * rifa.precioPorBoleto,
        porcentajeVendido: (ticketsVendidos / rifa.totalBoletos) * 100
      }
    }
    
    return NextResponse.json({
      success: true,
      data: rifaConStats
    })
    
  } catch (error) {
    console.error('Error al obtener rifa:', error)
    return NextResponse.json(
      { success: false, error: 'Error al obtener rifa' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Solo admins pueden actualizar rifas
    const isAdmin = request.headers.get('admin') === 'true'
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      )
    }
    
    const { id } = params
    const body = await request.json()
    
    const rifa = await prisma.rifa.update({
      where: { id },
      data: body,
      include: {
        premios: true,
        _count: {
          select: {
            tickets: true
          }
        }
      }
    })
    
    return NextResponse.json({
      success: true,
      data: rifa,
      message: 'Rifa actualizada exitosamente'
    })
    
  } catch (error) {
    console.error('Error al actualizar rifa:', error)
    return NextResponse.json(
      { success: false, error: 'Error al actualizar rifa' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Solo admins pueden eliminar rifas
    const isAdmin = request.headers.get('admin') === 'true'
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      )
    }
    
    const { id } = params
    
    // Verificar si la rifa tiene tickets vendidos
    const ticketsVendidos = await prisma.ticket.count({
      where: {
        rifaId: id,
        estado: 'PAGADO'
      }
    })
    
    if (ticketsVendidos > 0) {
      return NextResponse.json(
        { success: false, error: 'No se puede eliminar una rifa con tickets vendidos' },
        { status: 400 }
      )
    }
    
    // Eliminar rifa (cascade elimina tickets y otros datos relacionados)
    await prisma.rifa.delete({
      where: { id }
    })
    
    return NextResponse.json({
      success: true,
      message: 'Rifa eliminada exitosamente'
    })
    
  } catch (error) {
    console.error('Error al eliminar rifa:', error)
    return NextResponse.json(
      { success: false, error: 'Error al eliminar rifa' },
      { status: 500 }
    )
  }
}
