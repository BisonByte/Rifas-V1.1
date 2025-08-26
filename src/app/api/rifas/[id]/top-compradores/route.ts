import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const rifaId = params.id
  try {
    // Considerar solo compras confirmadas para el ranking
    const compras = await prisma.compra.findMany({
      where: { rifaId, estadoPago: 'CONFIRMADO' },
      select: {
        participanteId: true,
        cantidadTickets: true,
        montoTotal: true,
        participante: { select: { nombre: true, celular: true } },
      },
    })

    const mapa = new Map<string, {
      participanteId: string
      nombre: string
      celular: string | null
      totalTickets: number
      totalMonto: number
    }>()

    for (const c of compras) {
      const key = c.participanteId
      const prev = mapa.get(key)
      if (prev) {
        prev.totalTickets += c.cantidadTickets
        prev.totalMonto += c.montoTotal
      } else {
        mapa.set(key, {
          participanteId: key,
          nombre: c.participante?.nombre || 'Cliente',
          celular: c.participante?.celular || null,
          totalTickets: c.cantidadTickets,
          totalMonto: c.montoTotal,
        })
      }
    }

    const lista = Array.from(mapa.values())
      .sort((a, b) => b.totalTickets - a.totalTickets || b.totalMonto - a.totalMonto)
      .slice(0, 20)

    return NextResponse.json({ success: true, data: lista })
  } catch (error) {
    console.error('Error obteniendo top compradores:', error)
    return NextResponse.json({ success: false, error: 'Error interno' }, { status: 500 })
  }
}
