import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword, requireAuth, isAdmin } from '@/lib/auth'
import { z } from 'zod'
import { RolUsuario } from '@prisma/client'

// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic'

const CreateUserSchema = z.object({
  nombre: z.string().min(2, 'Nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Contraseña debe tener al menos 6 caracteres'),
  rol: z.nativeEnum(RolUsuario),
  celular: z.string().optional()
})

/**
 * POST /api/admin/usuarios
 * Crear un nuevo usuario (solo administradores)
 */
export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación y permisos
    const currentUser = await requireAuth(request)
    if (!currentUser || !isAdmin(currentUser)) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Acceso denegado' 
        },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validatedData = CreateUserSchema.parse(body)
    const { nombre, email, password, rol, celular } = validatedData

    // Verificar que el email no esté en uso
    const existingUser = await prisma.usuario.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Email ya está en uso' 
        },
        { status: 400 }
      )
    }

    // Hashear contraseña
    const hashedPassword = await hashPassword(password)

    // Crear usuario
    const newUser = await prisma.usuario.create({
      data: {
        nombre,
        email,
        password: hashedPassword,
        rol,
        celular: celular || null,
        activo: true
      },
      select: {
        id: true,
        nombre: true,
        email: true,
        rol: true,
        celular: true,
        activo: true,
        createdAt: true
      }
    })

    // Log de auditoría
    await prisma.auditLog.create({
      data: {
        evento: 'CREATE_USER',
        usuarioId: currentUser.id,
        accion: 'CREATE_USER',
        entidad: 'USUARIO',
        entidadId: newUser.id,
        payload: JSON.stringify({
          nombre: newUser.nombre,
          email: newUser.email,
          rol: newUser.rol,
          creadoPor: currentUser.nombre
        })
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Usuario creado exitosamente',
      data: newUser
    })

  } catch (error) {
    console.error('Error creando usuario:', error)

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

/**
 * GET /api/admin/usuarios
 * Listar usuarios (solo administradores)
 */
export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación y permisos
    const currentUser = await requireAuth(request)
    if (!currentUser || !isAdmin(currentUser)) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Acceso denegado' 
        },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const rol = searchParams.get('rol')
    const activo = searchParams.get('activo')
    const search = searchParams.get('search')

    const skip = (page - 1) * limit

    // Construir filtros
    const where: any = {}
    
    if (rol && Object.values(RolUsuario).includes(rol as RolUsuario)) {
      where.rol = rol as RolUsuario
    }
    
    if (activo !== null && activo !== undefined) {
      where.activo = activo === 'true'
    }
    
    if (search) {
      where.OR = [
        { nombre: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ]
    }

    const [usuarios, total] = await Promise.all([
      prisma.usuario.findMany({
        where,
        select: {
          id: true,
          nombre: true,
          email: true,
          rol: true,
          celular: true,
          activo: true,
          createdAt: true,
          updatedAt: true
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.usuario.count({ where })
    ])

    return NextResponse.json({
      success: true,
      data: usuarios,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Error listando usuarios:', error)
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Error interno del servidor' 
      },
      { status: 500 }
    )
  }
}
