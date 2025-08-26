import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const rows = await prisma.metodoPago.findMany({
      where: { activo: true },
      orderBy: { orden: 'asc' }
    })

    const metodos = rows.map((m: any) => {
      let datos = '{}'
      try {
        if (m.descripcion && typeof m.descripcion === 'string') {
          const parsed = JSON.parse(m.descripcion)
          if (parsed && typeof parsed === 'object') datos = JSON.stringify(parsed)
        }
      } catch {}
      if (datos === '{}' ) {
        const base: any = {}
        if (m.numeroCuenta) base.numeroCuenta = m.numeroCuenta
        if (m.tipoCuenta) base.tipoCuenta = m.tipoCuenta
        if (m.cedula) base.cedula = m.cedula
        if (m.telefono) base.telefono = m.telefono
        datos = JSON.stringify(base)
      }
      return { ...m, datos }
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
