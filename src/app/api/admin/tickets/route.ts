import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, isAdmin } from '@/lib/auth'
import { Prisma } from '@prisma/client'
import { z } from 'zod'

// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic'

const QuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  // When provided, filter tickets belonging to the specified raffle
  // Using cuid validation to match the Rifa model id type
  rifaId: z.string().cuid().optional(),
  estado: z.string().optional(),
  search: z.string().optional()
})

/**
 * GET /api/admin/tickets
 * Listar tickets con filtros
 */
export async function GET(request: NextRequest) {
  try {
    const currentUser = await requireAuth(request)
    if (!currentUser || !isAdmin(currentUser)) {
      return NextResponse.json(
        { success: false, error: 'Acceso denegado' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const params = Object.fromEntries(searchParams)
    const { page, limit, rifaId, estado, search } = QuerySchema.parse(params)

    const skip = (page - 1) * limit
    const where: Prisma.TicketWhereInput = {}

    if (rifaId) {
      where.rifaId = rifaId
    }

    if (estado) {
      where.estado = estado
    }

    if (search) {
      const numero = parseInt(search)
      // SQLite doesn't support case-insensitive query mode in Prisma types.
      // Use simple contains for now (SQLite LIKE is case-insensitive for ASCII by default).
      where.OR = [
        ...(isNaN(numero) ? [] : [{ numero }]),
        { participante: { nombre: { contains: search } } },
        { participante: { celular: { contains: search } } }
      ]
    }

    const [tickets, total] = await Promise.all([
      prisma.ticket.findMany({
        where,
        include: {
          rifa: { select: { nombre: true } },
          participante: { select: { nombre: true, celular: true } }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.ticket.count({ where })
    ])

    return NextResponse.json({
      success: true,
      data: tickets,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error listando tickets:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
