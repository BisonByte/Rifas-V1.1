import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser, logAuthEvent } from '@/lib/auth'
import { headers } from 'next/headers'

// Force dynamic rendering for API routes  
export const dynamic = 'force-dynamic'

/**
 * POST /api/auth/logout
 * Cierra la sesión del usuario actual
 */
export async function POST(request: NextRequest) {
  try {
    // Obtener usuario actual para auditoria
    const currentUser = await getAuthUser()

    if (currentUser) {
      // Obtener información del request para auditoría
      const headersList = headers()
      const ip = headersList.get('x-forwarded-for') || 
                 headersList.get('x-real-ip') || 
                 request.ip || 
                 'unknown'
      const userAgent = headersList.get('user-agent') || 'unknown'

      // Log del evento de logout
      await logAuthEvent(
        currentUser.id,
        'LOGOUT',
        { email: currentUser.email },
        ip,
        userAgent
      )
    }

    // Crear response y limpiar cookies
    const response = NextResponse.json({
      success: true,
      message: 'Logout exitoso'
    })

    // Eliminar cookies de autenticación
    response.cookies.set('auth-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0,
      path: '/'
    })

    response.cookies.set('refresh-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0,
      path: '/'
    })

    return response

  } catch (error) {
    console.error('Error en logout:', error)
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Error interno del servidor' 
      },
      { status: 500 }
    )
  }
}
