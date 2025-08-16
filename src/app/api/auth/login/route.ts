import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { verifyCredentials, generateJWT, logAuthEvent } from '@/lib/auth'
import { headers } from 'next/headers'

// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic'

const LoginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Contraseña requerida')
})

/**
 * POST /api/auth/login
 * Autentica un usuario y retorna JWT token
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = LoginSchema.parse(body)
    const { email, password } = validatedData

    // Verificar credenciales
    const user = await verifyCredentials(email, password)
    if (!user) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Credenciales inválidas' 
        },
        { status: 401 }
      )
    }

    // Generar JWT token básico
    const token = await generateJWT(user)

    // Obtener información del request para auditoría
    const headersList = headers()
    const ip = headersList.get('x-forwarded-for') || 
               headersList.get('x-real-ip') || 
               request.ip || 
               'unknown'
    const userAgent = headersList.get('user-agent') || 'unknown'

    // Log del evento de login
    await logAuthEvent(
      user.id,
      'LOGIN_SUCCESS',
      { email: user.email, rol: user.rol },
      ip,
      userAgent
    )

    // Configurar respuesta
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol
      },
      message: 'Login exitoso'
    })

    // Configurar cookie HttpOnly para seguridad
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60, // 24 horas en segundos
      path: '/'
    })

    return response

  } catch (error) {
    console.error('Error en login:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Datos inválidos',
          details: error.errors
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { 
        success: false,
        error: 'Error interno del servidor' 
      },
      { status: 500 }
    )
  }
}
