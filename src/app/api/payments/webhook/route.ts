import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
// PayPal eliminado: webhook queda en no-op para compatibilidad

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const paymentId = body?.resource?.id || body?.id
    if (!paymentId) {
      return NextResponse.json({ error: 'paymentId no proporcionado' }, { status: 400 })
    }

    // Antes se consultaba a PayPal; ahora no hacemos nada aquí

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Error en webhook de pagos:', err)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
