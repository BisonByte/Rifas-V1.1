import { NextRequest, NextResponse } from 'next/server'

// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { requireAuth, isAdmin } from '@/lib/auth'
import { sendEmail } from '@/lib/sendEmail'
import { sendSMS } from '@/lib/sendSMS'
import { CONFIG } from '@/lib/config'

const RealizarSorteoSchema = z.object({
  rifaId: z.string(),
  metodoSorteo: z.enum(['ALEATORIO', 'MANUAL']),
  semilla: z.string().optional(), // Para reproducibilidad
  numerosGanadores: z.array(z.number()).optional() // Para sorteo manual
})

// Función para generar números aleatorios con semilla
function seededRandom(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  return function() {
    hash = hash * 1103515245 + 12345;
    return (hash / 2147483647) % 1;
  }
}

export async function POST(request: NextRequest) {
  const currentUser = await requireAuth(request)
  if (!currentUser || !isAdmin(currentUser)) {
    return NextResponse.json(
      { success: false, error: 'Acceso denegado' },
      { status: 403 }
    )
  }

  const transaction = await prisma.$transaction(async (tx: any) => {
    try {
      const body = await request.json()
      const { rifaId, metodoSorteo, semilla, numerosGanadores } = RealizarSorteoSchema.parse(body)
      const adminId = currentUser.id
      
      // Verificar que la rifa existe y está lista para sorteo
  const rifa = await tx.rifa.findUnique({
        where: { id: rifaId },
        include: {
          premios: {
            orderBy: { orden: 'asc' }
          },
          tickets: {
            where: { estado: 'PAGADO' },
            include: {
              participante: true
            }
          }
        }
      })
      
      if (!rifa) {
        throw new Error('Rifa no encontrada')
      }
      
      if (rifa.estado !== 'ACTIVA') {
        throw new Error('La rifa debe estar activa para realizar el sorteo')
      }
      
      if (new Date() < rifa.fechaSorteo) {
        throw new Error('Aún no es la fecha del sorteo')
      }
      
      if (rifa.tickets.length === 0) {
        throw new Error('No hay tickets vendidos para esta rifa')
      }
      
      // Verificar si ya existe un sorteo
      const sorteoExistente = await tx.sorteo.findUnique({
        where: { rifaId }
      })
      
      if (sorteoExistente) {
        throw new Error('Ya se realizó el sorteo para esta rifa')
      }
      
      // Preparar mapa de tickets y participantes para acceso rápido
      const ticketsParticipantes = rifa.tickets.map((ticket: any) => ({
        id: ticket.id,
        numero: ticket.numero,
        participanteId: ticket.participanteId,
        participanteName: ticket.participante?.nombre,
        participanteCelular: ticket.participante?.celular || null,
      }))
      const ticketsByNumero = new Map<number, { id: string; participanteId: string; participanteName: string; participanteCelular: string | null }>()
      for (const t of ticketsParticipantes) {
        ticketsByNumero.set(t.numero, {
          id: t.id,
          participanteId: t.participanteId,
          participanteName: t.participanteName,
          participanteCelular: t.participanteCelular,
        })
      }
      
      let ganadores: Array<{
        premioId: string;
        ticketGanador: number;
        participanteId: string;
        participanteName: string;
        participanteCelular: string;
      }> = []
      
      if (metodoSorteo === 'ALEATORIO') {
        // Sorteo aleatorio
        const semillaFinal = semilla || `${rifaId}-${Date.now()}-${Math.random()}`
        const random = seededRandom(semillaFinal)
        
        // Copiar array para manipular sin afectar original
        let ticketsDisponibles = [...ticketsParticipantes]
        
        for (const premio of rifa.premios) {
          if (ticketsDisponibles.length === 0) break
          
          const indiceGanador = Math.floor(random() * ticketsDisponibles.length)
          const ticketGanador = ticketsDisponibles[indiceGanador]
          
          ganadores.push({
            premioId: premio.id,
            ticketGanador: ticketGanador.numero,
            participanteId: ticketGanador.participanteId,
            participanteName: ticketGanador.participanteName,
            participanteCelular: ticketGanador.participanteCelular
          })
          
          // Remover ticket ganador para evitar duplicados
          ticketsDisponibles.splice(indiceGanador, 1)
        }
        
      } else if (metodoSorteo === 'MANUAL') {
        // Sorteo manual
        if (!numerosGanadores || numerosGanadores.length !== rifa.premios.length) {
          throw new Error(`Se requieren exactamente ${rifa.premios.length} números ganadores`)
        }
        
        // Verificar que todos los números existen y están pagados
        for (const numero of numerosGanadores) {
          const ticket = ticketsParticipantes.find((t: any) => t.numero === numero)
          if (!ticket) {
            throw new Error(`El número ${numero} no existe o no está pagado`)
          }
        }
        
        // Verificar que no hay duplicados
        const numerosUnicos = new Set(numerosGanadores)
        if (numerosUnicos.size !== numerosGanadores.length) {
          throw new Error('No puede haber números ganadores duplicados')
        }
        
        // Asignar ganadores según orden de premios
        for (let i = 0; i < rifa.premios.length; i++) {
          const premio = rifa.premios[i]
          const numeroGanador = numerosGanadores[i]
          const ticket = ticketsParticipantes.find((t: any) => t.numero === numeroGanador)!
          
          ganadores.push({
            premioId: premio.id,
            ticketGanador: ticket.numero,
            participanteId: ticket.participanteId,
            participanteName: ticket.participanteName,
            participanteCelular: ticket.participanteCelular
          })
        }
      }
      
      // Crear registro del sorteo
      const sorteo = await tx.sorteo.create({
        data: {
          rifaId,
          fechaSorteo: new Date(),
          metodo: metodoSorteo,
          semilla: metodoSorteo === 'ALEATORIO' ? semilla || `auto-${Date.now()}` : null,
          ticketsParticipantes: ticketsParticipantes.length,
          realizadoPor: adminId,
          estado: 'COMPLETADO',
          detallesSorteo: {
            ticketsParticipantes: ticketsParticipantes.map((t: any) => t.numero),
            metodo: metodoSorteo,
            timestamp: new Date().toISOString(),
            admin: currentUser.nombre
          }
        }
      })
      
      // Actualizar premios con ticket ganador y preparar datos de respuesta
      const ganadoresDetallados: Array<{
        posicion: number
        numeroTicket: number
        premio: { id: string; nombre: string }
        participante: { id: string; nombre: string; celular: string | null }
      }> = []
      for (let index = 0; index < ganadores.length; index++) {
        const g = ganadores[index]
        const tinfo = ticketsByNumero.get(g.ticketGanador)
        if (!tinfo) continue
        // Actualizar el premio con el ticket ganador
        await tx.premio.update({
          where: { id: g.premioId },
          data: { ticketGanadorId: tinfo.id }
        })
        const premio = rifa.premios.find((p: any) => p.id === g.premioId)!
        ganadoresDetallados.push({
          posicion: index + 1,
          numeroTicket: g.ticketGanador,
          premio: { id: premio.id, nombre: premio.titulo || premio.nombre || 'Premio' },
          participante: { id: tinfo.participanteId, nombre: tinfo.participanteName, celular: tinfo.participanteCelular }
        })
      }
      
      // Actualizar estado de la rifa
      await tx.rifa.update({
        where: { id: rifaId },
        data: { estado: 'SORTEADA' }
      })
      
      // Crear notificaciones para ganadores
      for (const ganadorCreado of ganadoresDetallados) {
        await tx.notificacion.create({
          data: {
            tipo: 'GANADOR',
            titulo: `¡Felicitaciones! Has ganado: ${ganadorCreado.premio.nombre}`,
            mensaje: `Tu ticket #${ganadorCreado.numeroTicket} resultó ganador del premio "${ganadorCreado.premio.nombre}" en la rifa "${rifa.nombre}". ¡Contacta con nosotros para reclamar tu premio!`,
            datos: {
              rifaId: rifa.id,
              rifaNombre: rifa.nombre,
              premioId: ganadorCreado.premio.id,
              premioNombre: ganadorCreado.premio.nombre,
              ticketNumero: ganadorCreado.numeroTicket,
              posicion: ganadorCreado.posicion
            },
            participanteId: ganadorCreado.participante.id
          }
        })
      }
      
      // Notificación general del sorteo realizado
      await tx.notificacion.create({
        data: {
          tipo: 'SORTEO_REALIZADO',
          titulo: `Sorteo realizado: ${rifa.nombre}`,
          mensaje: `Se ha completado el sorteo de "${rifa.nombre}" con ${ganadoresDetallados.length} ganadores.`,
          datos: {
            rifaId: rifa.id,
            rifaNombre: rifa.nombre,
            totalGanadores: ganadoresDetallados.length,
            ticketsParticipantes: ticketsParticipantes.length,
            fechaSorteo: sorteo.fechaSorteo
          },
          paraAdministradores: true
        }
      })
      
      // Registro de auditoría
      await tx.auditLog.create({
        data: {
          accion: 'REALIZAR_SORTEO',
          entidad: 'SORTEO',
          entidadId: sorteo.id,
          detalles: {
            rifaId,
            rifaNombre: rifa.nombre,
            metodo: metodoSorteo,
            ticketsParticipantes: ticketsParticipantes.length,
            ganadores: ganadores.map(g => ({
              ticket: g.ticketGanador,
              participante: g.participanteName
            }))
          },
          usuarioId: adminId,
          ip: request.headers.get('x-forwarded-for') || 'admin-panel'
        }
      })
      
      return {
        success: true,
        data: {
          sorteoId: sorteo.id,
          rifaNombre: rifa.nombre,
          fechaSorteo: sorteo.fechaSorteo,
          metodo: metodoSorteo,
          ticketsParticipantes: ticketsParticipantes.length,
          ganadores: ganadoresDetallados.map(g => ({
            posicion: g.posicion,
            ticket: g.numeroTicket,
            premio: g.premio.nombre,
            participante: {
              nombre: g.participante.nombre,
              celular: (g.participante.celular || '').replace(/(\d{3})(\d{3})(\d{4})/, '$1-***-$3')
            }
          }))
        }
      }
      
    } catch (error) {
      console.error('Error al realizar sorteo:', error)
      throw error
    }
  }, {
    timeout: 30000 // 30 segundos timeout para sorteos grandes
  })

  // Enviar notificaciones básicas al admin (sin recorrer modelo Ganador inexistente)
  if (transaction.success) {
    try {
      if (CONFIG.ADMIN.EMAIL) {
        await sendEmail(
          CONFIG.ADMIN.EMAIL,
          `Sorteo realizado: ${transaction.data.rifaNombre}`,
          `Se completó el sorteo con ${transaction.data.ganadores.length} ganadores.`
        )
      }
      if (CONFIG.ADMIN.PHONE) {
        await sendSMS(
          CONFIG.ADMIN.PHONE,
          `Sorteo ${transaction.data.rifaNombre} con ${transaction.data.ganadores.length} ganadores.`
        )
      }
    } catch (err) {
      console.error('Error enviando notificaciones de sorteo', err)
    }
  }

  return NextResponse.json(transaction)
}

// GET: Listar sorteos realizados
export async function GET(request: NextRequest) {
  try {
    const currentUser = await requireAuth(request)
    if (!currentUser || !isAdmin(currentUser)) {
      return NextResponse.json(
        { success: false, error: 'Acceso denegado' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const rifaId = searchParams.get('rifaId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50)

    
    const skip = (page - 1) * limit
    const where = rifaId ? { rifaId } : {}
    
    const [sorteos, total] = await Promise.all([
      prisma.sorteo.findMany({
        where,
        include: {
          rifa: {
            select: {
              nombre: true,
              fechaSorteo: true,
              totalBoletos: true,
              premios: {
                where: {
                  ticketGanadorId: { not: null }
                },
                include: {
                  ticketGanador: {
                    include: {
                      participante: {
                        select: {
                          nombre: true,
                          celular: true
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        orderBy: { fechaHora: 'desc' },
        skip,
        take: limit
      }),
      
      prisma.sorteo.count({ where })
    ])
    
    const sorteosConDetalles = sorteos.map((sorteo: any) => ({
      ...sorteo,
      ganadores: sorteo.ganadores.map((g: any) => ({
        ...g,
        participante: {
          nombre: g.participante.nombre,
          celular: '***-' + g.participante.celular.slice(-4) // Enmascarar
        }
      }))
    }))
    
    return NextResponse.json({
      success: true,
      data: sorteosConDetalles,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
    
  } catch (error) {
    console.error('Error al listar sorteos:', error)
    return NextResponse.json(
      { success: false, error: 'Error al cargar sorteos' },
      { status: 500 }
    )
  }
}
