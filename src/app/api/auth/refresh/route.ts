import { NextRequest, NextResponse } from 'next/server'
import { verifyJWT, generateJWT } from '@/lib/auth'

// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic'

/**
 * POST /api/auth/refresh
 * Genera un nuevo access token usando el refresh token
 */
export async function POST(request: NextRequest) {
  try {
    const refreshToken = request.cookies.get('refresh-token')?.value
    if (!refreshToken) {
      return NextResponse.json(
        { success: false, error: 'No refresh token' },
        { status: 401 }
      )
    }

    const payload = await verifyJWT(refreshToken)
    if (!payload || payload.tokenType !== 'refresh') {
      return NextResponse.json(
        { success: false, error: 'Token inválido' },
        { status: 401 }
      )
    }

    const user = {
      id: payload.sub,
      nombre: payload.nombre,
      email: payload.email,
      rol: payload.rol as 'SUPER_ADMIN' | 'ADMIN' | 'VENDEDOR' | 'AUDITOR'
    }

    const newAccessToken = await generateJWT(user, '15m', 'access')

    const response = NextResponse.json({ success: true })
    response.cookies.set('auth-token', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60,
      path: '/'
    })

    return response
  } catch (error) {
    console.error('Error refreshing token:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
