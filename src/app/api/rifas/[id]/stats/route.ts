import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // Verificar que la rifa existe y está activa
    const rifa = await prisma.rifa.findFirst({
      where: { id, estado: 'ACTIVA' }
    })

    if (!rifa) {
      return NextResponse.json(
        { success: false, error: 'Rifa no encontrada o no activa' },
        { status: 404 }
      )
    }

    const [disponibles, vendidos, reservados, total] = await Promise.all([
      prisma.ticket.count({ where: { rifaId: id, estado: 'DISPONIBLE' } }),
      prisma.ticket.count({
        where: {
          rifaId: id,
          estado: { in: ['VENDIDO', 'PAGADO'] }
        }
      }),
      prisma.ticket.count({
        where: {
          rifaId: id,
          estado: { in: ['RESERVADO', 'EN_VERIFICACION'] }
        }
      }),
      prisma.ticket.count({ where: { rifaId: id } })
    ])

    return NextResponse.json({
      success: true,
      data: { disponibles, vendidos, reservados, total }
    })
  } catch (error) {
    console.error('Error obteniendo contadores de tickets:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

