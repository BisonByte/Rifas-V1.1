import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, isAdmin, hashPassword } from '@/lib/auth'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const UpdateSchema = z.object({
  nombre: z.string().min(2).optional(),
  email: z.string().email().optional(),
  password: z.string().min(6).optional(),
  rol: z.enum(['SUPER_ADMIN', 'ADMIN', 'VENDEDOR', 'AUDITOR']).optional(),
  celular: z.string().optional(),
  activo: z.boolean().optional(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const currentUser = await requireAuth(request)
    if (!currentUser || !isAdmin(currentUser)) {
      return NextResponse.json({ success: false, error: 'Acceso denegado' }, { status: 403 })
    }
    const id = params.id
    const user = await prisma.usuario.findUnique({
      where: { id },
      select: {
        id: true,
        nombre: true,
        email: true,
        celular: true,
        rol: true,
        activo: true,
        createdAt: true,
        updatedAt: true,
      },
    })
    if (!user) return NextResponse.json({ success: false, error: 'No encontrado' }, { status: 404 })
    return NextResponse.json({ success: true, data: user })
  } catch (err) {
    console.error('Error obteniendo usuario:', err)
    return NextResponse.json({ success: false, error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const currentUser = await requireAuth(request)
    if (!currentUser || !isAdmin(currentUser)) {
      return NextResponse.json({ success: false, error: 'Acceso denegado' }, { status: 403 })
    }
    const id = params.id
    const body = await request.json()
    const payload = UpdateSchema.parse(body)

    const data: any = { ...payload }
    if (payload.password) {
      data.password = await hashPassword(payload.password)
    }
    // Evitar cambiar email a uno ya existente
    if (payload.email) {
      const exists = await prisma.usuario.findUnique({ where: { email: payload.email } })
      if (exists && exists.id !== id) {
        return NextResponse.json({ success: false, error: 'Email ya en uso' }, { status: 400 })
      }
    }
    const updated = await prisma.usuario.update({ where: { id }, data })
    return NextResponse.json({ success: true, data: { id: updated.id } })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: 'Datos inválidos', details: err.errors }, { status: 400 })
    }
    console.error('Error actualizando usuario:', err)
    return NextResponse.json({ success: false, error: 'Error interno del servidor' }, { status: 500 })
  }
}

