import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

const querySchema = z.object({
  rifaId: z.string().cuid()
})

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const result = querySchema.safeParse({
      rifaId: searchParams.get('rifaId')
    })

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: 'ID de rifa inválido', details: result.error.issues },
        { status: 400 }
      )
    }

    const { rifaId } = result.data

    // Verificar que la rifa existe y está activa
    const rifa = await prisma.rifa.findFirst({
      where: { id: rifaId },
      select: {
        id: true,
        nombre: true,
        totalBoletos: true,
        estado: true,
        precioPorBoleto: true,
        limitePorPersona: true
      }
    })

    if (!rifa) {
      return NextResponse.json(
        { success: false, error: 'Rifa no encontrada' },
        { status: 404 }
      )
    }

    // Obtener TODOS los tickets de la rifa
    const tickets = await prisma.ticket.findMany({
      where: { rifaId },
      select: {
        numero: true,
        estado: true,
        fechaReserva: true,
        participante: {
          select: {
            nombre: true
          }
        }
      },
      orderBy: { numero: 'asc' }
    })

    // Crear mapa de números ocupados
    const numerosOcupados = new Set(tickets.map(t => t.numero))

    // Generar array completo de disponibilidad
    const disponibilidad = []
    for (let numero = 1; numero <= rifa.totalBoletos; numero++) {
      const ticket = tickets.find(t => t.numero === numero)
      
      if (ticket) {
        // Ticket ocupado - enmascarar nombre del participante
        const nombreEnmascarado = ticket.participante?.nombre 
          ? ticket.participante.nombre.charAt(0) + '***'
          : null

        disponibilidad.push({
          numero,
          disponible: ticket.estado === 'DISPONIBLE',
          estado: ticket.estado,
          fechaReserva: ticket.fechaReserva,
          participante: nombreEnmascarado
        })
      } else {
        // Ticket disponible
        disponibilidad.push({
          numero,
          disponible: true,
          estado: 'DISPONIBLE',
          fechaReserva: null,
          participante: null
        })
      }
    }

    // Estadísticas generales
    const estadisticas = {
      totalTickets: rifa.totalBoletos,
      disponibles: disponibilidad.filter(t => t.disponible).length,
      vendidos: tickets.filter(t => t.estado === 'VENDIDO').length,
      reservados: tickets.filter(t => t.estado === 'RESERVADO').length,
      porcentajeVendido: Math.round((tickets.filter(t => t.estado === 'VENDIDO').length / rifa.totalBoletos) * 100)
    }

    return NextResponse.json({
      success: true,
      data: {
        rifa: {
          id: rifa.id,
          nombre: rifa.nombre,
          totalBoletos: rifa.totalBoletos,
          precioPorBoleto: rifa.precioPorBoleto,
          limitePorPersona: rifa.limitePorPersona
        },
        tickets: disponibilidad,
        estadisticas
      }
    })

  } catch (error) {
    console.error('Error al consultar disponibilidad:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
