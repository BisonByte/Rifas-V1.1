import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'

// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic'

/**
 * GET /api/auth/me  
 * Retorna información del usuario autenticado actual
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser()

    if (!user) {
      return NextResponse.json(
        { 
          success: false,
          error: 'No autenticado' 
        },
        { status: 401 }
      )
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol
      }
    })

  } catch (error) {
    console.error('Error obteniendo usuario actual:', error)
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Error interno del servidor' 
      },
      { status: 500 }
    )
  }
}
