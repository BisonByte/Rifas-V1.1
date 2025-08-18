import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
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
    const metodo = await prisma.metodoPago.create({
      data: body
    })

    return NextResponse.json({ success: true, data: metodo })

  } catch (error) {
    console.error('Error creando método de pago:', error)
    return NextResponse.json(
      { success: false, error: 'Error creando método de pago' },
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

    const metodo = await prisma.metodoPago.update({
      where: { id },
      data
    })

    return NextResponse.json({ success: true, data: metodo })

  } catch (error) {
    console.error('Error actualizando método de pago:', error)
    return NextResponse.json(
      { success: false, error: 'Error actualizando método de pago' },
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

    await prisma.metodoPago.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error eliminando método de pago:', error)
    return NextResponse.json(
      { success: false, error: 'Error eliminando método de pago' },
      { status: 500 }
    )
  }
}
