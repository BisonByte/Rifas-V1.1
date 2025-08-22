import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, isAdmin } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth(request)
    if (!user || !isAdmin(user)) {
      return NextResponse.json(
        { success: false, error: 'Acceso denegado' },
        { status: 403 }
      )
    }

    const { id } = params

    // Verificar existencia y estado
    const rifa = await prisma.rifa.findUnique({
      where: { id },
      include: { premios: true, tickets: { select: { id: true }, take: 1 } }
    })

    if (!rifa) {
      return NextResponse.json(
        { success: false, error: 'Rifa no encontrada' },
        { status: 404 }
      )
    }

    if (rifa.estado === 'ACTIVA') {
      return NextResponse.json({ success: true, data: rifa, message: 'La rifa ya está activa' })
    }

    // Validaciones mínimas para publicar
    if (!rifa.fechaSorteo || isNaN(new Date(rifa.fechaSorteo).getTime())) {
      return NextResponse.json(
        { success: false, error: 'La rifa debe tener fecha de sorteo válida' },
        { status: 400 }
      )
    }

    if (!rifa.premios || rifa.premios.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Agrega al menos un premio antes de publicar' },
        { status: 400 }
      )
    }

    if (rifa.totalBoletos <= 0) {
      return NextResponse.json(
        { success: false, error: 'Configura la cantidad de boletos antes de publicar' },
        { status: 400 }
      )
    }

    // Publicar (activar)
    const publicada = await prisma.rifa.update({
      where: { id },
      data: { estado: 'ACTIVA' }
    })

    return NextResponse.json({ success: true, data: publicada, message: 'Rifa publicada (activa)' })
  } catch (error) {
    console.error('Error al publicar rifa:', error)
    return NextResponse.json(
      { success: false, error: 'Error al publicar rifa' },
      { status: 500 }
    )
  }
}
