import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { sendEmail } from '@/lib/sendEmail'

export async function POST(request: NextRequest) {
  const user = await getAuthUser()
  if (!user || (user.rol !== 'ADMIN' && user.rol !== 'SUPER_ADMIN')) {
    return NextResponse.json(
      { success: false, error: 'No autorizado' },
      { status: 403 }
    )
  }

  try {
    const { to } = await request.json()
    const email = to || user.email
    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email no disponible' },
        { status: 400 }
      )
    }

    await sendEmail(
      email,
      'Prueba de correo',
      'La configuración de correo funciona correctamente.',
      'SISTEMA'
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error enviando correo de prueba:', error)
    return NextResponse.json(
      { success: false, error: 'Error enviando correo' },
      { status: 500 }
    )
  }
}
