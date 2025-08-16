import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const ReservarSchema = z.object({
  rifaId: z.string().cuid(),
  numeros: z.array(z.number().int().min(1)),
  participante: z.object({
    nombre: z.string().min(1, 'Nombre es requerido'),
    celular: z.string().min(10, 'Celular debe tener al menos 10 dígitos'),
    email: z.string().email('Email inválido').optional()
  })
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { rifaId, numeros, participante } = ReservarSchema.parse(body)

    const resultado = await prisma.$transaction(async (tx) => {
      // Verificar que la rifa existe y está activa
      const rifa = await tx.rifa.findUnique({
        where: { id: rifaId, estado: 'ACTIVA' }
      })

      if (!rifa) {
        throw new Error('Rifa no encontrada o inactiva')
      }

      // Verificar que los números están en rango válido
      const numerosInvalidos = numeros.filter(n => n < 1 || n > rifa.totalBoletos)
      if (numerosInvalidos.length > 0) {
        throw new Error(`Números inválidos: ${numerosInvalidos.join(', ')}`)
      }

      // Verificar límite por persona
      if (rifa.limitePorPersona && numeros.length > rifa.limitePorPersona) {
        throw new Error(`Máximo ${rifa.limitePorPersona} tickets por persona`)
      }

      // Verificar que los números están disponibles
      const ticketsOcupados = await tx.ticket.findMany({
        where: {
          rifaId,
          numero: { in: numeros },
          estado: { not: 'DISPONIBLE' }
        },
        select: { numero: true }
      })

      if (ticketsOcupados.length > 0) {
        const numerosOcupados = ticketsOcupados.map(t => t.numero)
        throw new Error(`Los siguientes números ya están ocupados: ${numerosOcupados.join(', ')}`)
      }

      // Crear o encontrar participante
      let participanteRecord = await tx.participante.findFirst({
        where: {
          OR: [
            { celular: participante.celular },
            ...(participante.email ? [{ email: participante.email }] : [])
          ]
        }
      })

      if (!participanteRecord) {
        participanteRecord = await tx.participante.create({
          data: {
            nombre: participante.nombre,
            celular: participante.celular,
            email: participante.email
          }
        })
      }

      // Crear compra
      const fechaVencimiento = new Date(Date.now() + rifa.tiempoReserva * 60 * 1000)
      const compra = await tx.compra.create({
        data: {
          rifaId,
          participanteId: participanteRecord.id,
          cantidadTickets: numeros.length,
          monto: rifa.precioPorBoleto, // Precio unitario
          montoTotal: numeros.length * rifa.precioPorBoleto, // Total calculado
          metodoPago: 'TRANSFERENCIA', // Valor por defecto
          estadoPago: 'PENDIENTE',
          fechaVencimiento
        }
      })

      // Reservar tickets
      const ticketsCreados = []
      for (const numero of numeros) {
        // Verificar si el ticket ya existe
        const ticketExistente = await tx.ticket.findUnique({
          where: { rifaId_numero: { rifaId, numero } }
        })

        if (ticketExistente) {
          if (ticketExistente.estado !== 'DISPONIBLE') {
            throw new Error(`El número ${numero} ya está ocupado`)
          }
          // Actualizar ticket existente
          const ticket = await tx.ticket.update({
            where: { id: ticketExistente.id },
            data: {
              estado: 'RESERVADO',
              participanteId: participanteRecord.id,
              compraId: compra.id,
              fechaReserva: new Date(),
              fechaVencimiento,
              monto: rifa.precioPorBoleto
            }
          })
          ticketsCreados.push(ticket)
        } else {
          // Crear nuevo ticket
          const ticket = await tx.ticket.create({
            data: {
              numero,
              rifaId,
              estado: 'RESERVADO',
              participanteId: participanteRecord.id,
              compraId: compra.id,
              fechaReserva: new Date(),
              fechaVencimiento,
              monto: rifa.precioPorBoleto
            }
          })
          ticketsCreados.push(ticket)
        }
      }

      return {
        compra,
        tickets: ticketsCreados,
        participante: participanteRecord
      }
    })

    return NextResponse.json({
      success: true,
      compraId: resultado.compra.id,
      tickets: resultado.tickets.map(t => t.numero),
      montoTotal: resultado.compra.montoTotal,
      fechaVencimiento: resultado.compra.fechaVencimiento,
      participante: {
        nombre: resultado.participante.nombre,
        celular: resultado.participante.celular
      }
    })

  } catch (error) {
    console.error('Error al reservar tickets:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error interno del servidor' },
      { status: 400 }
    )
  }
}
