import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { GET as publicGet } from '../../configuracion/route'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const user = await getAuthUser()
  if (!user || (user.rol !== 'ADMIN' && user.rol !== 'SUPER_ADMIN')) {
    return NextResponse.json(
      { success: false, error: 'No autorizado' },
      { status: 403 }
    )
  }

  return publicGet()
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
      const valorString = typeof valor === 'string' ? valor : JSON.stringify(valor)
      
      await prisma.configuracionSitio.upsert({
        where: { clave },
        update: { valor: valorString },
        create: { 
          clave, 
          valor: valorString, 
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
