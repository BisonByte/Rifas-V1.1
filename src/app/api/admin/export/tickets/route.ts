import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, isAdmin } from '@/lib/auth'

export const dynamic = 'force-dynamic'

function escapeCsv(value: any) {
  if (value === null || value === undefined) return ''
  let s = String(value)
  if (s.includes('"')) s = s.replace(/"/g, '""')
  if (s.includes(',') || s.includes('\n') || s.includes('"')) return `"${s}"`
  return s
}

export async function GET(request: NextRequest) {
  try {
    const currentUser = await requireAuth(request)
    if (!currentUser || !isAdmin(currentUser)) {
      return NextResponse.json(
        { success: false, error: 'Acceso denegado' },
        { status: 403 }
      )
    }

    const url = new URL(request.url)
    const rifaId = url.searchParams.get('rifaId')
    if (!rifaId) {
      return NextResponse.json({ success: false, error: 'Missing rifaId' }, { status: 400 })
    }

    const tickets = await prisma.ticket.findMany({
      where: { rifaId },
      include: {
        rifa: { select: { nombre: true } },
        participante: { select: { nombre: true, celular: true } }
      },
      orderBy: { numero: 'asc' }
    })

    const rows = ['numero,estado,rifa,participante,celular,fecha,monto']
    tickets.forEach((t) => {
      const fecha = t.createdAt.toISOString()
      const participante = t.participante?.nombre || ''
      const celular = t.participante?.celular || ''
      const rifaNombre = t.rifa?.nombre || ''
      const monto = t.monto ?? ''
      rows.push([
        escapeCsv(t.numero),
        escapeCsv(t.estado),
        escapeCsv(rifaNombre),
        escapeCsv(participante),
        escapeCsv(celular),
        escapeCsv(fecha),
        escapeCsv(monto),
      ].join(','))
    })

    return new NextResponse(rows.join('\n'), {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="tickets.csv"'
      }
    })
  } catch (error) {
    console.error('Error exportando tickets:', error)
    return NextResponse.json({ success: false, error: 'Error exportando tickets' }, { status: 500 })
  }
}
