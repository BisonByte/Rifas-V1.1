import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import { requireAuth, isAdmin } from '@/lib/auth'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isSetupRoute = pathname === '/setup' || pathname.startsWith('/api/setup')
  const isStatic =
    pathname.startsWith('/_next') ||
    pathname === '/favicon.ico' ||
    /\.[^/]+$/.test(pathname)
  const firstRunActive = process.env.FIRST_RUN !== 'false' && !fs.existsSync('setup.lock')

  if (firstRunActive && !isSetupRoute && !isStatic) {
    return NextResponse.redirect(new URL('/setup', request.url))
  }

  // Solo aplicar middleware a rutas administrativas
  if (!pathname.startsWith('/admin') && !pathname.startsWith('/api/admin')) {
    return NextResponse.next()
  }

  // Permitir acceso a páginas públicas del admin
  if (pathname === '/admin/login' || pathname === '/admin/access-denied') {
    return NextResponse.next()
  }

  try {
    // Verificar autenticación
    const user = await requireAuth(request)

    if (!user) {
      // Si es una API, retornar JSON
      if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          { 
            success: false,
            error: 'No autenticado' 
          },
          { status: 401 }
        )
      }

      // Si es una página, redirigir al login
      const loginUrl = new URL('/admin/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }

    // Verificar permisos de administrador para rutas admin
    if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
      if (!isAdmin(user)) {
        // Si es una API, retornar JSON
        if (pathname.startsWith('/api/')) {
          return NextResponse.json(
            { 
              success: false,
              error: 'Permisos insuficientes' 
            },
            { status: 403 }
          )
        }

        // Si es una página, redirigir a acceso denegado
        return NextResponse.redirect(new URL('/admin/access-denied', request.url))
      }
    }

    // Usuario autenticado y autorizado - continuar
    const response = NextResponse.next()
    
    // Agregar headers con información del usuario para uso en components
    response.headers.set('x-user-id', user.id)
    response.headers.set('x-user-role', user.rol)
    
    return response

  } catch (error) {
    console.error('Error en middleware de autenticación:', error)

    // En caso de error, redirigir al login
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Error de autenticación' 
        },
        { status: 500 }
      )
    }

    return NextResponse.redirect(new URL('/admin/login', request.url))
  }
}

// Configurar en qué rutas aplicar el middleware
export const config = {
  matcher: [
    '/:path*'
  ]
}
