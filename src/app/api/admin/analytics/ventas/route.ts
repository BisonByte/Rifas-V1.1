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

    const now = new Date()
    const start = new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000)

    const ventas = await prisma.compra.findMany({
      where: {
        estadoPago: 'APROBADO' as any,
        createdAt: { gte: start }
      },
      select: { monto: true, createdAt: true }
    })

    const map = new Map<string, number>()
    for (let i = 0; i < 7; i++) {
      const date = new Date(start.getTime() + i * 24 * 60 * 60 * 1000)
      map.set(date.toISOString().slice(0, 10), 0)
    }
    ventas.forEach(v => {
      const key = v.createdAt.toISOString().slice(0, 10)
      map.set(key, (map.get(key) || 0) + v.monto)
    })

    const data = Array.from(map.entries()).map(([fecha, monto]) => ({ fecha, monto }))
    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Error al obtener ventas:', error)
    return NextResponse.json({ success: false, error: 'Error al obtener ventas' }, { status: 500 })
  }
}
