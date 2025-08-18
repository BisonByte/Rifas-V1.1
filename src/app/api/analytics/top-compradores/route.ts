import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const rifaId = searchParams.get('rifaId') || undefined
    const limit = Number(searchParams.get('limit') || 10)

    // Aggregate by participante over compras CONFIRMADO + PENDIENTE (optionally per rifa)
    const where: any = {
      estadoPago: { in: ['CONFIRMADO', 'PENDIENTE'] },
    }
    if (rifaId) where.rifaId = rifaId

    // Get totals per participante
    const compras = await prisma.compra.findMany({
      where,
      select: {
        participanteId: true,
        montoTotal: true,
      },
    })

    // Aggregate in memory (SQLite friendly)
    const map = new Map<string, { total: number; count: number }>()
    for (const c of compras) {
      const key = c.participanteId
      const cur = map.get(key) || { total: 0, count: 0 }
      cur.total += c.montoTotal
      cur.count += 1
      map.set(key, cur)
    }

    const participantesIds = Array.from(map.keys())
    const participantes = await prisma.participante.findMany({
      where: { id: { in: participantesIds } },
      select: { id: true, nombre: true, celular: true, email: true }
    })

    const items = participantes
      .map(p => ({
        id: p.id,
        nombre: p.nombre,
        celular: p.celular,
        email: p.email,
        total: map.get(p.id)!.total,
        compras: map.get(p.id)!.count,
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, Math.max(1, Math.min(100, limit)))

    return NextResponse.json({ success: true, data: items })
  } catch (e) {
    console.error('Error top-compradores:', e)
    return NextResponse.json({ success: false, error: 'Error obteniendo top compradores' }, { status: 500 })
  }
}
