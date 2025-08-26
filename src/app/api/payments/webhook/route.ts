import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getOrder } from '@/lib/paypal'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const paymentId = body?.resource?.id || body?.id
    if (!paymentId) {
      return NextResponse.json({ error: 'paymentId no proporcionado' }, { status: 400 })
    }

    try {
      const order = await getOrder(paymentId)
      if (order?.status === 'COMPLETED') {
        await prisma.compra.updateMany({
          where: { paymentId },
          data: { estadoPago: 'PAGADO' }
        })
      }
    } catch (err) {
      console.error('Error verificando orden PayPal:', err)
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Error en webhook de pagos:', err)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
