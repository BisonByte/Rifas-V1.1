import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const cuentas = await prisma.cuentaBancaria.findMany({
      where: { activa: true },
      select: {
        id: true,
        banco: true,
        numero: true,
        titular: true,
        tipoCuenta: true
      },
      orderBy: { banco: 'asc' }
    })

    return NextResponse.json({
      success: true,
      data: cuentas
    })

  } catch (error) {
    console.error('Error obteniendo cuentas bancarias:', error)
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor'
    }, { status: 500 })
  }
}
