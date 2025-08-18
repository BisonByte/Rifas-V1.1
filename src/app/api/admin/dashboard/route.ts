import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/prisma'
import { requireAuth, isAdmin } from '@/lib/auth'

// GET /api/admin/dashboard
export async function GET(request: NextRequest) {
  try {
    const currentUser = await requireAuth(request)
    if (!currentUser || !isAdmin(currentUser)) {
      return NextResponse.json(
        { success: false, error: 'Acceso denegado' },
        { status: 403 }
      )
    }

    const [totalEventos, totalParticipantes, totalTickets, ingresosTotales] =
      await Promise.all([
        prisma.rifa.count(),
        prisma.participante.count(),
        prisma.ticket.count({ where: { estado: 'PAGADO' as any } }),
        prisma.compra.aggregate({
          where: { estadoPago: 'APROBADO' as any },
          _sum: { monto: true }
        })
      ])

    const eventosTopDB = await prisma.rifa.findMany({
      select: {
        id: true,
        nombre: true,
        precioPorBoleto: true,
        estado: true,
        _count: {
          select: {
            tickets: { where: { estado: 'PAGADO' as any } }
          }
        }
      },
      orderBy: {
        tickets: { _count: 'desc' }
      },
      take: 5
    })

    const eventosTop = eventosTopDB.map((evento) => ({
      id: evento.id,
      nombre: evento.nombre,
      ticketsVendidos: evento._count.tickets,
      ingresos: evento._count.tickets * evento.precioPorBoleto,
      estado: evento.estado
    }))

    return NextResponse.json({
      stats: {
        totalEventos,
        totalParticipantes,
        totalTickets,
        totalIngresos: ingresosTotales._sum.monto || 0
      },
      eventosTop
    })
  } catch (error) {
    console.error('Error cargando dashboard:', error)
    return NextResponse.json(
      { success: false, error: 'Error al obtener datos del dashboard' },
      { status: 500 }
    )
  }
}

