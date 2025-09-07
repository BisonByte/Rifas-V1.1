import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/prisma'
import { requireAuth, isAdmin } from '@/lib/auth'

// GET /api/admin/participantes
// Opcional: ?rifaId=... para filtrar por sorteo
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
    const rifaId = searchParams.get('rifaId') || undefined

    if (rifaId) {
      // Agrupar por participante dentro de la rifa indicada
      const grupos = await prisma.ticket.groupBy({
        by: ['participanteId'],
        where: {
          rifaId,
          participanteId: { not: null }
        },
        _count: { _all: true }
      })

      const participanteIds = grupos.map(g => g.participanteId).filter(Boolean) as string[]
      if (participanteIds.length === 0) {
        return NextResponse.json({ success: true, data: [] })
      }

      const participantes = await prisma.participante.findMany({
        where: { id: { in: participanteIds } },
        select: {
          id: true,
          nombre: true,
          celular: true,
          email: true,
          createdAt: true,
          updatedAt: true,
        }
      })

      const byId = new Map(participantes.map(p => [p.id, p]))
      const data = grupos
        .filter(g => !!g.participanteId)
        .map(g => {
          const p = byId.get(g.participanteId as string)!
          return {
            id: p.id,
            nombre: p.nombre,
            cedula: '', // no existe en esquema; placeholder
            telefono: p.celular,
            email: p.email || '',
            fechaRegistro: p.createdAt,
            totalTickets: g._count._all,
            eventosParticipados: [rifaId],
            ultimaActividad: p.updatedAt,
            estado: 'ACTIVO' as const,
          }
        })
        // Ordenar por tickets desc, luego por nombre asc
        .sort((a, b) => (b.totalTickets - a.totalTickets) || a.nombre.localeCompare(b.nombre))

      return NextResponse.json({ success: true, data })
    }

    // General: listar todos con conteos y rifas participadas
    const all = await prisma.participante.findMany({
      select: {
        id: true,
        nombre: true,
        celular: true,
        email: true,
        createdAt: true,
        updatedAt: true,
        _count: { select: { tickets: true } },
        tickets: { select: { rifaId: true }, where: { participanteId: { not: null } } },
      },
      orderBy: { createdAt: 'desc' }
    })

    const data = all.map(p => ({
      id: p.id,
      nombre: p.nombre,
      cedula: '', // no existe en esquema; placeholder
      telefono: p.celular,
      email: p.email || '',
      fechaRegistro: p.createdAt,
      totalTickets: p._count.tickets,
      eventosParticipados: Array.from(new Set(p.tickets.map(t => t.rifaId))).filter(Boolean) as string[],
      ultimaActividad: p.updatedAt,
      estado: 'ACTIVO' as const,
    }))

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Error listando participantes:', error)
    return NextResponse.json(
      { success: false, error: 'Error al obtener participantes' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/participantes?id=...
export async function DELETE(request: NextRequest) {
  try {
    const currentUser = await requireAuth(request)
    if (!currentUser || !isAdmin(currentUser)) {
      return NextResponse.json(
        { success: false, error: 'Acceso denegado' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID requerido' },
        { status: 400 }
      )
    }

    // verificar referencias
    const [tickets, compras] = await Promise.all([
      prisma.ticket.count({ where: { participanteId: id } }),
      prisma.compra.count({ where: { participanteId: id } }),
    ])

    if (tickets > 0 || compras > 0) {
      return NextResponse.json(
        { success: false, error: 'No se puede eliminar: participante con tickets o compras asociadas' },
        { status: 400 }
      )
    }

    await prisma.participante.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error eliminando participante:', error)
    return NextResponse.json(
      { success: false, error: 'Error al eliminar participante' },
      { status: 500 }
    )
  }
}