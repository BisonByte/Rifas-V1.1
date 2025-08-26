import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const redes = await prisma.redSocial.findMany({
      where: { activo: true },
      orderBy: { orden: 'asc' }
    })

    return NextResponse.json({ success: true, data: redes })
  } catch (error) {
    console.error('Error obteniendo redes sociales:', error)
    return NextResponse.json(
      { success: false, error: 'Error obteniendo redes sociales' },
      { status: 500 }
    )
  }
}
