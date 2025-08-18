import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const user = await getAuthUser()
  if (!user || (user.rol !== 'ADMIN' && user.rol !== 'SUPER_ADMIN')) {
    return NextResponse.json(
      { success: false, error: 'No autorizado' },
      { status: 403 }
    )
  }
  try {
    const configuraciones = await prisma.configuracionSitio.findMany({
      orderBy: { clave: 'asc' }
    })

    const config = configuraciones.reduce((acc, item) => {
      acc[item.clave] = item.valor as any
      return acc
    }, {} as Record<string, any>)

    return NextResponse.json({ success: true, data: config })
  } catch (error) {
    console.error('Error obteniendo configuraciones:', error)
    return NextResponse.json(
      { success: false, error: 'Error obteniendo configuraciones' },
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
    const { configuraciones } = body

    if (!configuraciones || typeof configuraciones !== 'object') {
      return NextResponse.json(
        { success: false, error: 'Datos de configuración inválidos' },
        { status: 400 }
      )
    }

    // Actualizar configuraciones
    for (const [clave, valor] of Object.entries(configuraciones)) {
      await prisma.configuracionSitio.upsert({
        where: { clave },
        update: { valor },
        create: {
          clave,
          valor,
          tipo: typeof valor === 'string' ? 'text' : 'json'
        }
      })
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error actualizando configuraciones:', error)
    return NextResponse.json(
      { success: false, error: 'Error actualizando configuraciones' },
      { status: 500 }
    )
  }
}
