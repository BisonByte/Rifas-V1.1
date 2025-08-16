import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
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
