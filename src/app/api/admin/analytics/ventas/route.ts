import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { MOCK_MODE } from '@/lib/mock-data'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const now = new Date()
    const start = new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000)

    if (MOCK_MODE) {
      const data = Array.from({ length: 7 }).map((_, i) => {
        const d = new Date(start.getTime() + i * 24 * 60 * 60 * 1000)
        return { fecha: d.toISOString().slice(0, 10), monto: Math.floor(Math.random() * 1000) }
      })
      return NextResponse.json({ success: true, data })
    }

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
