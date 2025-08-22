import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const metodos = await prisma.metodoPago.findMany({
      where: { activo: true },
      orderBy: { orden: 'asc' }
    })

    return NextResponse.json({ success: true, data: metodos })
  } catch (error) {
    console.error('Error obteniendo métodos de pago:', error)
    return NextResponse.json(
      { success: false, error: 'Error obteniendo métodos de pago' },
      { status: 500 }
    )
  }
}
