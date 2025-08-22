import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const configuraciones = await prisma.configuracionSitio.findMany({
      orderBy: { clave: 'asc' }
    })

    const config = configuraciones.reduce((acc, item) => {
      try {
        if (item.tipo === 'json') {
          acc[item.clave] = JSON.parse(item.valor)
        } else {
          acc[item.clave] = item.valor
        }
      } catch {
        acc[item.clave] = item.valor
      }
      return acc
    }, {} as Record<string, any>)

    const SENSITIVE_KEYS = [
      'PAYPAL_CLIENT_ID',
      'PAYPAL_CLIENT_SECRET',
      'SMTP_HOST',
      'SMTP_PORT',
      'SMTP_USER',
      'SMTP_PASSWORD',
    ]

    for (const key of SENSITIVE_KEYS) {
      delete (config as any)[key]
    }

    return NextResponse.json({ success: true, data: config })
  } catch (error) {
    console.error('Error obteniendo configuraciones:', error)
    return NextResponse.json(
      { success: false, error: 'Error obteniendo configuraciones' },
      { status: 500 }
    )
  }
}
