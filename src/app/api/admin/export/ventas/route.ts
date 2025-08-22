import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, isAdmin } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const currentUser = await requireAuth(request)
    if (!currentUser || !isAdmin(currentUser)) {
      return NextResponse.json(
        { success: false, error: 'Acceso denegado' },
        { status: 403 }
      )
    }

    const ventas = await prisma.compra.findMany({
      select: {
        id: true,
        monto: true,
        createdAt: true,
        participante: { select: { nombre: true } }
      }
    })

    const rows = ['id,participante,monto,fecha']
    ventas.forEach(v => {
      const fecha = v.createdAt.toISOString()
      const nombre = v.participante?.nombre || ''
      rows.push(`${v.id},${nombre},${v.monto},${fecha}`)
    })

    return new NextResponse(rows.join('\n'), {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="ventas.csv"'
      }
    })
  } catch (error) {
    console.error('Error exportando ventas:', error)
    return NextResponse.json({ success: false, error: 'Error exportando ventas' }, { status: 500 })
  }
}
