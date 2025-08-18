import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
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

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser()
    if (!user || (user.rol !== 'ADMIN' && user.rol !== 'SUPER_ADMIN')) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const red = await prisma.redSocial.create({
      data: body
    })

    return NextResponse.json({ success: true, data: red })

  } catch (error) {
    console.error('Error creando red social:', error)
    return NextResponse.json(
      { success: false, error: 'Error creando red social' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getAuthUser()
    if (!user || (user.rol !== 'ADMIN' && user.rol !== 'SUPER_ADMIN')) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { id, ...data } = body

    const red = await prisma.redSocial.update({
      where: { id },
      data
    })

    return NextResponse.json({ success: true, data: red })

  } catch (error) {
    console.error('Error actualizando red social:', error)
    return NextResponse.json(
      { success: false, error: 'Error actualizando red social' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getAuthUser()
    if (!user || (user.rol !== 'ADMIN' && user.rol !== 'SUPER_ADMIN')) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID requerido' },
        { status: 400 }
      )
    }

    await prisma.redSocial.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error eliminando red social:', error)
    return NextResponse.json(
      { success: false, error: 'Error eliminando red social' },
      { status: 500 }
    )
  }
}
