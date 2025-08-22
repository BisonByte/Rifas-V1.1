import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, isAdmin } from '@/lib/auth'

// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic'

interface RouteParams {
  params: {
    id: string
  }
}

// Generador aleatorio determinista basado en semilla
function seededRandom(seed: string) {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }

  return function() {
    hash = hash * 1103515245 + 12345
    return (hash / 2147483647) % 1
  }
}

// GET: Obtener detalles completos de un sorteo
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const currentUser = await requireAuth(request)
    if (!currentUser || !isAdmin(currentUser)) {
      return NextResponse.json(
        { success: false, error: 'Acceso denegado' },
        { status: 403 }
      )
    }

    const sorteo = await prisma.sorteo.findUnique({
      where: { id: params.id },
      include: {
        rifa: true,
        ticketGanador: {
          include: {
            participante: {
              select: { nombre: true, celular: true }
            }
          }
        }
      }
    })

    if (!sorteo) {
      return NextResponse.json(
        { success: false, error: 'Sorteo no encontrado' },
        { status: 404 }
      )
    }

    const ticketGanador = sorteo.ticketGanador
      ? {
          ...sorteo.ticketGanador,
          participante: sorteo.ticketGanador.participante
            ? {
                ...sorteo.ticketGanador.participante,
                celular: sorteo.ticketGanador.participante.celular
                  ? '***-' + sorteo.ticketGanador.participante.celular.slice(-4)
                  : null
              }
            : null
        }
      : null

    return NextResponse.json({
      success: true,
      data: { ...sorteo, ticketGanador }
    })
  } catch (error) {
    console.error('Error al obtener sorteo:', error)
    return NextResponse.json(
      { success: false, error: 'Error al cargar detalles del sorteo' },
      { status: 500 }
    )
  }
}

// POST: Verificar reproducibilidad del sorteo
export async function POST(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const currentUser = await requireAuth(request)
    if (!currentUser || !isAdmin(currentUser)) {
      return NextResponse.json(
        { success: false, error: 'Acceso denegado' },
        { status: 403 }
      )
    }

    const sorteo = await prisma.sorteo.findUnique({
      where: { id: params.id },
      include: {
        rifa: {
          include: {
            tickets: {
              where: { estado: 'PAGADO' },
              orderBy: { numero: 'asc' }
            }
          }
        },
        ticketGanador: true
      }
    })

    if (!sorteo) {
      return NextResponse.json(
        { success: false, error: 'Sorteo no encontrado' },
        { status: 404 }
      )
    }

    if (!sorteo.semilla) {
      return NextResponse.json(
        { success: false, error: 'Sorteo sin semilla para verificación' },
        { status: 400 }
      )
    }

    const tickets = sorteo.rifa.tickets
    if (tickets.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No hay tickets para verificar' },
        { status: 400 }
      )
    }

    const random = seededRandom(sorteo.semilla)
    const indice = Math.floor(random() * tickets.length)
    const ticketCalculado = tickets[indice]

    const reproducible = sorteo.ticketGanadorId === ticketCalculado.id

    return NextResponse.json({
      success: true,
      data: {
        reproducible,
        ticketRegistrado: {
          id: sorteo.ticketGanadorId,
          numero: sorteo.numeroGanador
        },
        ticketCalculado: {
          id: ticketCalculado.id,
          numero: ticketCalculado.numero
        }
      }
    })
  } catch (error) {
    console.error('Error al verificar sorteo:', error)
    return NextResponse.json(
      { success: false, error: 'Error al verificar reproducibilidad del sorteo' },
      { status: 500 }
    )
  }
}
