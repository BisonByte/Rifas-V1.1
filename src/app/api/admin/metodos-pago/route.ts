import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

function composeDatosFromRecord(rec: any) {
  // Prefer descripcion if it looks like JSON; else build from known fields
  try {
    if (rec?.descripcion && typeof rec.descripcion === 'string') {
      const parsed = JSON.parse(rec.descripcion)
      if (parsed && typeof parsed === 'object') {
        return JSON.stringify(parsed)
      }
    }
  } catch {}
  const base: any = {}
  if (rec.numeroCuenta) base.numeroCuenta = rec.numeroCuenta
  if (rec.tipoCuenta) base.tipoCuenta = rec.tipoCuenta
  if (rec.cedula) base.cedula = rec.cedula
  if (rec.telefono) base.telefono = rec.telefono
  return JSON.stringify(base)
}

export async function GET() {
  const user = await getAuthUser()
  if (!user || (user.rol !== 'ADMIN' && user.rol !== 'SUPER_ADMIN')) {
    return NextResponse.json(
      { success: false, error: 'No autorizado' },
      { status: 403 }
    )
  }

  try {
    const rows = await prisma.metodoPago.findMany({
      orderBy: { orden: 'asc' }
    })

    const metodos = rows.map((m) => ({
      ...m,
      datos: composeDatosFromRecord(m),
    }))

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
    const { icono: _icono, datos, ...rest } = body
    const prismaData: any = { ...rest }
    // Persist full JSON in descripcion and map common fields
    if (typeof datos === 'string') {
      prismaData.descripcion = datos
      try {
        const d = JSON.parse(datos)
        if (d && typeof d === 'object') {
          if (d.numeroCuenta) prismaData.numeroCuenta = String(d.numeroCuenta)
          if (d.tipoCuenta) prismaData.tipoCuenta = String(d.tipoCuenta)
          if (d.cedula) prismaData.cedula = String(d.cedula)
          if (d.telefono) prismaData.telefono = String(d.telefono)
        }
      } catch {}
    }
    const created = await prisma.metodoPago.create({ data: prismaData })
    return NextResponse.json({ success: true, data: { ...created, datos: composeDatosFromRecord(created) } })

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
    const { id, icono: _icono, datos, ...rest } = body
    const prismaData: any = { ...rest }
    if (typeof datos === 'string') {
      prismaData.descripcion = datos
      try {
        const d = JSON.parse(datos)
        if (d && typeof d === 'object') {
          prismaData.numeroCuenta = d.numeroCuenta ? String(d.numeroCuenta) : null
          prismaData.tipoCuenta = d.tipoCuenta ? String(d.tipoCuenta) : null
          prismaData.cedula = d.cedula ? String(d.cedula) : null
          prismaData.telefono = d.telefono ? String(d.telefono) : null
        }
      } catch {}
    }
    const updated = await prisma.metodoPago.update({ where: { id }, data: prismaData })
    return NextResponse.json({ success: true, data: { ...updated, datos: composeDatosFromRecord(updated) } })

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
