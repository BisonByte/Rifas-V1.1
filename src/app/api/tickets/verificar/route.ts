import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic'

const VerificarSchema = z.object({
  tipo: z.enum(['numero', 'celular', 'cedula', 'referencia']),
  valor: z.string().min(1),
  rifaId: z.string().cuid().optional()
})

/**
 * GET /api/tickets/verificar
 * Verificar tickets por: número, celular, cédula o referencia de compra
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const result = VerificarSchema.safeParse({
      tipo: searchParams.get('tipo'),
      valor: searchParams.get('valor'),
      rifaId: searchParams.get('rifaId')
    })
    
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: 'Parámetros inválidos', details: result.error.errors },
        { status: 400 }
      )
    }

    const { tipo, valor, rifaId } = result.data

    if (tipo === 'numero') {
      // Verificar por número de ticket
      const numeroInt = parseInt(valor)
      if (isNaN(numeroInt)) {
        return NextResponse.json(
          { success: false, error: 'Número de ticket inválido' },
          { status: 400 }
        )
      }

      const whereCondition = rifaId ? 
        { numero: numeroInt, rifaId } : 
        { numero: numeroInt }

      const ticket = await prisma.ticket.findFirst({
        where: whereCondition,
        include: {
          participante: {
            select: { nombre: true, celular: true, email: true }
          },
          rifa: {
            select: { nombre: true, fechaSorteo: true, estado: true }
          }
        }
      })

      if (!ticket) {
        return NextResponse.json(
          { success: false, error: 'Ticket no encontrado' },
          { status: 404 }
        )
      }

      return NextResponse.json({
        success: true,
        ticket: {
          id: ticket.id,
          numero: ticket.numero,
          estado: ticket.estado,
          rifa: ticket.rifa,
          participante: ticket.participante
        }
      })
    }

    if (tipo === 'celular') {
      // Verificar por celular del participante
      const tickets = await prisma.ticket.findMany({
        where: {
          participante: { celular: valor },
          ...(rifaId && { rifaId })
        },
        include: {
          participante: {
            select: { nombre: true, celular: true, email: true }
          },
          rifa: {
            select: { nombre: true, fechaSorteo: true, estado: true }
          }
        },
        orderBy: [
          { rifa: { fechaSorteo: 'desc' } },
          { numero: 'asc' }
        ]
      })

      if (tickets.length === 0) {
        return NextResponse.json(
          { success: false, error: 'No se encontraron tickets para este celular' },
          { status: 404 }
        )
      }

      return NextResponse.json({
        success: true,
        tickets: tickets.map(ticket => ({
          id: ticket.id,
          numero: ticket.numero,
          estado: ticket.estado,
          rifa: ticket.rifa,
          participante: ticket.participante
        }))
      })
    }

    // Buscar por cédula del participante
    if (tipo === 'cedula') {
      try {
        const tickets = await prisma.ticket.findMany({
          where: {
            participante: { cedula: valor },
            ...(rifaId && { rifaId })
          },
          include: {
            participante: { select: { nombre: true, celular: true, email: true, cedula: true } },
            rifa: { select: { nombre: true, fechaSorteo: true, estado: true } }
          },
          orderBy: [ { rifa: { fechaSorteo: 'desc' } }, { numero: 'asc' } ]
        })

        if (tickets.length === 0) {
          return NextResponse.json(
            { success: false, error: 'No se encontraron tickets para esta cédula' },
            { status: 404 }
          )
        }

        return NextResponse.json({
          success: true,
          tickets: tickets.map(t => ({
            id: t.id,
            numero: t.numero,
            estado: t.estado,
            rifa: t.rifa,
            participante: t.participante
          }))
        })
      } catch (err: any) {
        const msg = String(err?.message || '')
        if (msg.includes('no such column') || msg.includes('Unknown column') || msg.includes('Unknown arg `cedula`')) {
          return NextResponse.json(
            { success: false, error: 'La verificación por cédula no está disponible en este momento. Intente por voucher.' },
            { status: 501 }
          )
        }
        throw err
      }
    }

    // Buscar por referencia (voucher) de compra
    if (tipo === 'referencia') {
      const compra = await prisma.compra.findFirst({
        where: { referencia: valor },
        include: {
          tickets: { select: { numero: true, estado: true }, orderBy: { numero: 'asc' } },
          rifa: { select: { nombre: true, fechaSorteo: true } },
          participante: { select: { nombre: true, celular: true, cedula: true } }
        }
      })

      if (!compra) {
        return NextResponse.json(
          { success: false, error: 'Referencia no encontrada' },
          { status: 404 }
        )
      }

      return NextResponse.json({
        success: true,
        compra: {
          id: compra.id,
          estadoPago: compra.estadoPago,
          rifa: compra.rifa,
          participante: compra.participante,
          referencia: compra.referencia,
          tickets: compra.tickets
        },
        tickets: compra.tickets
      })
    }

    return NextResponse.json(
      { success: false, error: 'Tipo de verificación no válido' },
      { status: 400 }
    )

  } catch (error) {
    console.error('❌ Error al verificar tickets:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/tickets/verificar
 * Verificar tickets por número, celular, cédula o referencia (método POST)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const result = VerificarSchema.safeParse(body)
    
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: 'Datos inválidos', details: result.error.errors },
        { status: 400 }
      )
    }

    const { tipo, valor, rifaId } = result.data

    if (tipo === 'numero') {
      const numeroInt = parseInt(valor)
      if (isNaN(numeroInt)) {
        return NextResponse.json(
          { success: false, error: 'Número de ticket inválido' },
          { status: 400 }
        )
      }

      const whereCondition = rifaId ? 
        { numero: numeroInt, rifaId } : 
        { numero: numeroInt }

      const ticket = await prisma.ticket.findFirst({
        where: whereCondition,
        include: {
          participante: {
            select: { nombre: true, celular: true, email: true }
          },
          rifa: {
            select: { nombre: true, fechaSorteo: true, estado: true }
          }
        }
      })

      if (!ticket) {
        return NextResponse.json(
          { success: false, error: 'Ticket no encontrado' },
          { status: 404 }
        )
      }

      return NextResponse.json({
        success: true,
        ticket: {
          id: ticket.id,
          numero: ticket.numero,
          estado: ticket.estado,
          rifa: ticket.rifa,
          participante: ticket.participante
        }
      })
    }

    if (tipo === 'celular') {
      const tickets = await prisma.ticket.findMany({
        where: {
          participante: { celular: valor },
          ...(rifaId && { rifaId })
        },
        include: {
          participante: {
            select: { nombre: true, celular: true, email: true }
          },
          rifa: {
            select: { nombre: true, fechaSorteo: true, estado: true }
          }
        },
        orderBy: [
          { rifa: { fechaSorteo: 'desc' } },
          { numero: 'asc' }
        ]
      })

      if (tickets.length === 0) {
        return NextResponse.json(
          { success: false, error: 'No se encontraron tickets para este celular' },
          { status: 404 }
        )
      }

      return NextResponse.json({
        success: true,
        tickets: tickets.map(ticket => ({
          id: ticket.id,
          numero: ticket.numero,
          estado: ticket.estado,
          rifa: ticket.rifa,
          participante: ticket.participante
        }))
      })
    }

    if (tipo === 'cedula') {
      try {
        const tickets = await prisma.ticket.findMany({
          where: {
            participante: { cedula: valor },
            ...(rifaId && { rifaId })
          },
          include: {
            participante: { select: { nombre: true, celular: true, email: true, cedula: true } },
            rifa: { select: { nombre: true, fechaSorteo: true, estado: true } }
          },
          orderBy: [ { rifa: { fechaSorteo: 'desc' } }, { numero: 'asc' } ]
        })

        if (tickets.length === 0) {
          return NextResponse.json(
            { success: false, error: 'No se encontraron tickets para esta cédula' },
            { status: 404 }
          )
        }

        return NextResponse.json({
          success: true,
          tickets: tickets.map(t => ({
            id: t.id,
            numero: t.numero,
            estado: t.estado,
            rifa: t.rifa,
            participante: t.participante
          }))
        })
      } catch (err: any) {
        const msg = String(err?.message || '')
        if (msg.includes('no such column') || msg.includes('Unknown column') || msg.includes('Unknown arg `cedula`')) {
          return NextResponse.json(
            { success: false, error: 'La verificación por cédula no está disponible en este momento. Intente por voucher.' },
            { status: 501 }
          )
        }
        throw err
      }
    }

    if (tipo === 'referencia') {
      const compra = await prisma.compra.findFirst({
        where: { referencia: valor },
        include: {
          tickets: { select: { numero: true, estado: true }, orderBy: { numero: 'asc' } },
          rifa: { select: { nombre: true, fechaSorteo: true } },
          participante: { select: { nombre: true, celular: true, cedula: true } }
        }
      })

      if (!compra) {
        return NextResponse.json(
          { success: false, error: 'Referencia no encontrada' },
          { status: 404 }
        )
      }

      return NextResponse.json({
        success: true,
        compra: {
          id: compra.id,
          estadoPago: compra.estadoPago,
          rifa: compra.rifa,
          participante: compra.participante,
          referencia: compra.referencia,
          tickets: compra.tickets
        },
        tickets: compra.tickets
      })
    }

    return NextResponse.json(
      { success: false, error: 'Tipo de verificación no válido' },
      { status: 400 }
    )

  } catch (error) {
    console.error('❌ Error al verificar tickets:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
