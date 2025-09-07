import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
// PayPal eliminado: no se crean órdenes externas

const UrlOrRelativeImage = z.string().refine((v) => {
  if (!v) return false
  return v.startsWith('http://') || v.startsWith('https://') || v.startsWith('/')
}, { message: 'URL de imagen inválida' })

const CompraSchema = z.object({
  rifaId: z.string().min(1, 'ID de rifa requerido'),
  participante: z.object({
    nombre: z.string().min(2, 'Nombre debe tener al menos 2 caracteres'),
    celular: z.string().min(10, 'Celular debe tener al menos 10 dígitos'),
    cedula: z.string().min(5, 'Cédula inválida').optional(),
    email: z.string().email('Email inválido').optional()
  }),
  // Modo 1: lista de números específicos
  ticketsSeleccionados: z.array(z.number().int().min(0)).optional(),
  // Modo 2: solo cantidad; el servidor asigna automáticamente
  cantidadTickets: z.number().int().positive().optional(),
  metodoPago: z.object({
    id: z.string().min(1, 'Método de pago requerido'),
    referencia: z.string().min(1, 'Referencia de pago requerida').optional(),
    montoTotal: z.number().positive('Monto debe ser positivo'),
  imagenComprobante: UrlOrRelativeImage.nullable().optional()
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
      // Validar rango 0000–9999
      const fueraDeRango = validatedData.ticketsSeleccionados.filter(n => n < 0 || n > 9999)
      if (fueraDeRango.length > 0) {
        return NextResponse.json(
          { error: 'Los tickets deben estar entre 0000 y 9999' },
          { status: 400 }
        )
      }
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
      // Selección aleatoria de tickets disponibles, en transacción para consistencia
      const cantidad = validatedData.cantidadTickets
      const asignados = await prisma.$transaction(async (tx) => {
        // Obtener IDs de tickets disponibles
        const disponibles = await tx.ticket.findMany({
      where: { rifaId: validatedData.rifaId, estado: 'DISPONIBLE', numero: { lte: 9999 } },
          select: { id: true, numero: true },
        })
        if (disponibles.length < cantidad) {
          return null
        }
        // Shuffle (Fisher–Yates) y tomar N
        for (let i = disponibles.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1))
          const tmp = disponibles[i]
          disponibles[i] = disponibles[j]
          disponibles[j] = tmp
        }
        const elegidos = disponibles.slice(0, cantidad)
        return elegidos
      })
      if (!asignados) {
        return NextResponse.json(
          { error: 'No hay suficientes tickets disponibles en este momento' },
          { status: 400 }
        )
      }
      numerosAReservar = asignados.map(t => t.numero)
    } else {
      return NextResponse.json(
        { error: 'Debe indicar ticketsSeleccionados o cantidadTickets' },
        { status: 400 }
      )
    }

    // Verificar método de pago
    let metodos: any[] = []
    try {
      const base = new URL(request.url).origin
      const metodoResponse = await fetch(`${base}/api/metodos-pago`)
      if (!metodoResponse.ok) {
        return NextResponse.json(
          { error: 'No se pudieron obtener los métodos de pago' },
          { status: 502 }
        )
      }
      const metodoJson = await metodoResponse.json()
      metodos = metodoJson?.success ? metodoJson.data : metodoJson
      if (!Array.isArray(metodos)) {
        return NextResponse.json(
          { error: 'Respuesta inválida de métodos de pago' },
          { status: 502 }
        )
      }
    } catch (e) {
      return NextResponse.json(
        { error: 'No se pudieron obtener los métodos de pago' },
        { status: 502 }
      )
    }
    const metodoPago = metodos.find((m: any) => m.id === validatedData.metodoPago.id && m.activo)

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
      // Armar datos dinámicos para compatibilidad con BD sin columna 'cedula'
      const participantData: any = {
        nombre: validatedData.participante.nombre,
        celular: validatedData.participante.celular,
        email: validatedData.participante.email
      }
      if (validatedData.participante.cedula) participantData.cedula = validatedData.participante.cedula
      try {
        participante = await prisma.participante.create({ data: participantData })
      } catch (err: any) {
        // Si la columna no existe (BD sin migrar), reintentar sin 'cedula'
        const msg = String(err?.message || '')
        if (participantData.cedula && (msg.includes('no such column') || msg.includes('Unknown column') || msg.includes('Unknown arg `cedula`'))) {
          delete participantData.cedula
          participante = await prisma.participante.create({ data: participantData })
        } else {
          throw err
        }
      }
    } else if (validatedData.participante.cedula && !participante.cedula) {
      // Completar cédula si no estaba guardada (si la columna existe)
      try {
        participante = await prisma.participante.update({
          where: { id: participante.id },
          data: { cedula: validatedData.participante.cedula }
        })
      } catch (err) {
        // Ignorar si la columna no existe; mantener compatibilidad
      }
    }

    // Crear la compra y reservar tickets en una transacción atómica
    const compra = await prisma.$transaction(async (tx) => {
      const compraNueva = await tx.compra.create({
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

      const upd = await tx.ticket.updateMany({
        where: {
          rifaId: validatedData.rifaId,
          numero: { in: numerosAReservar },
          estado: 'DISPONIBLE'
        },
        data: {
          estado: 'RESERVADO',
          participanteId: participante.id,
          compraId: compraNueva.id,
          monto: rifa.precioPorBoleto,
          fechaReserva: new Date(),
          fechaVencimiento: new Date(Date.now() + (rifa.tiempoReserva * 60 * 1000))
        }
      })
      if (upd.count !== numerosAReservar.length) {
        // Forzar rollback si hubo carrera
        throw new Error('CONFLICT_TICKETS')
      }
      return compraNueva
    })

    // Pasarela PayPal eliminada: mantener compatibilidad sin enlazar a proveedor externo
    const paymentLink: string | null = null
    const paymentId: string | null = null

  // Notificación para administradores (después de reserva exitosa)

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
      paymentId,
      paymentLink,
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
    if (error instanceof Error && error.message === 'CONFLICT_TICKETS') {
      return NextResponse.json(
        { error: 'Algunos tickets ya fueron tomados, intenta nuevamente' },
        { status: 409 }
      )
    }
    
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
