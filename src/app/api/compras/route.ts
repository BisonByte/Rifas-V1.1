import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const CompraSchema = z.object({
  rifaId: z.string().min(1, 'ID de rifa requerido'),
  participante: z.object({
    nombre: z.string().min(2, 'Nombre debe tener al menos 2 caracteres'),
    celular: z.string().min(10, 'Celular debe tener al menos 10 dígitos'),
    email: z.string().email('Email inválido').optional()
  }),
  // Modo 1: lista de números específicos
  ticketsSeleccionados: z.array(z.number().int().positive()).optional(),
  // Modo 2: solo cantidad; el servidor asigna automáticamente
  cantidadTickets: z.number().int().positive().optional(),
  metodoPago: z.object({
    id: z.string().min(1, 'Método de pago requerido'),
    referencia: z.string().min(1, 'Referencia de pago requerida').optional(),
    montoTotal: z.number().positive('Monto debe ser positivo'),
    imagenComprobante: z.string().url('URL de imagen inválida').nullable().optional()
  })
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
  const validatedData = CompraSchema.parse(body)

    // Verificar que la rifa existe y está activa
    const rifa = await prisma.rifa.findFirst({
      where: {
        id: validatedData.rifaId,
        estado: 'ACTIVA'
      }
    })

    if (!rifa) {
      return NextResponse.json(
        { error: 'Rifa no encontrada o no activa' },
        { status: 404 }
      )
    }

    // Resolver tickets a reservar: por números o por cantidad
    let numerosAReservar: number[] = []
    if (validatedData.ticketsSeleccionados && validatedData.ticketsSeleccionados.length > 0) {
      // Validación de disponibilidad cuando el cliente envía números
      const ticketsDisponibles = await prisma.ticket.findMany({
        where: {
          rifaId: validatedData.rifaId,
          numero: { in: validatedData.ticketsSeleccionados },
          estado: 'DISPONIBLE'
        }
      })

      if (ticketsDisponibles.length !== validatedData.ticketsSeleccionados.length) {
        return NextResponse.json(
          { error: 'Algunos tickets ya no están disponibles' },
          { status: 400 }
        )
      }
      numerosAReservar = validatedData.ticketsSeleccionados
    } else if (validatedData.cantidadTickets && validatedData.cantidadTickets > 0) {
      const disponibles = await prisma.ticket.findMany({
        where: { rifaId: validatedData.rifaId, estado: 'DISPONIBLE' },
        orderBy: { numero: 'asc' },
        take: validatedData.cantidadTickets
      })
      if (disponibles.length !== validatedData.cantidadTickets) {
        return NextResponse.json(
          { error: 'No hay suficientes tickets disponibles en este momento' },
          { status: 400 }
        )
      }
      numerosAReservar = disponibles.map(t => t.numero)
    } else {
      return NextResponse.json(
        { error: 'Debe indicar ticketsSeleccionados o cantidadTickets' },
        { status: 400 }
      )
    }

    // Verificar método de pago (usar admin API temporalmente)
    const metodoResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/admin/metodos-pago`)
    const metodoData = await metodoResponse.json()
    const metodoPago = metodoData.data?.find((m: any) => m.id === validatedData.metodoPago.id && m.activo)

    if (!metodoPago) {
      return NextResponse.json(
        { error: 'Método de pago no válido' },
        { status: 400 }
      )
    }

    // Crear o encontrar participante
    let participante = await prisma.participante.findFirst({
      where: { celular: validatedData.participante.celular }
    })

    if (!participante) {
      participante = await prisma.participante.create({
        data: {
          nombre: validatedData.participante.nombre,
          celular: validatedData.participante.celular,
          email: validatedData.participante.email
        }
      })
    }

    // Crear la compra
    const compra = await prisma.compra.create({
      data: {
        rifaId: validatedData.rifaId,
        participanteId: participante.id,
        cantidadTickets: numerosAReservar.length,
        monto: rifa.precioPorBoleto,
        montoTotal: validatedData.metodoPago.montoTotal,
        metodoPago: metodoPago.tipo,
        estadoPago: 'PENDIENTE',
        referencia: validatedData.metodoPago.referencia || `COMPRA-${Date.now()}`,
        imagenComprobante: validatedData.metodoPago.imagenComprobante || null,
        fechaVencimiento: new Date(Date.now() + (rifa.tiempoReserva * 60 * 1000)) // Tiempo en minutos
      }
    })

    // Reservar los tickets seleccionados/asignados
    await prisma.ticket.updateMany({
      where: {
        rifaId: validatedData.rifaId,
        numero: { in: numerosAReservar }
      },
      data: {
        estado: 'RESERVADO',
        participanteId: participante.id,
        compraId: compra.id,
        monto: rifa.precioPorBoleto,
        fechaReserva: new Date(),
        fechaVencimiento: new Date(Date.now() + (rifa.tiempoReserva * 60 * 1000))
      }
    })

    // Crear notificación para administradores
    await prisma.notificacion.create({
      data: {
        tipo: 'INFO',
        titulo: 'Nueva compra realizada',
        mensaje: `${participante.nombre} ha reservado ${numerosAReservar.length} ticket(s) de "${rifa.nombre}"`,
        paraAdministradores: true,
        metadata: JSON.stringify({
          compraId: compra.id,
          rifaId: rifa.id,
          participanteId: participante.id,
          tickets: numerosAReservar
        })
      }
    })

    return NextResponse.json({
      success: true,
      compraId: compra.id,
      mensaje: 'Compra procesada exitosamente',
      detalles: {
        participante: participante.nombre,
        tickets: numerosAReservar,
        montoTotal: validatedData.metodoPago.montoTotal,
        metodoPago: metodoPago.nombre,
        referencia: compra.referencia,
        vencimiento: compra.fechaVencimiento
      }
    })

  } catch (error) {
    console.error('Error procesando compra:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', detalles: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
