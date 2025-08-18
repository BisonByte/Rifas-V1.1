import { NextRequest, NextResponse } from 'next/server'

// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/prisma'
import { requireAuth, isAdmin } from '@/lib/auth'

// GET: Dashboard principal con estadísticas
export async function GET(request: NextRequest) {
  try {
    const currentUser = await requireAuth(request)
    if (!currentUser || !isAdmin(currentUser)) {
      return NextResponse.json(
        { success: false, error: 'Acceso denegado' },
        { status: 403 }
      )
    }
    
    const ahora = new Date()
    const hace24h = new Date(ahora.getTime() - 24 * 60 * 60 * 1000)
    const hace7d = new Date(ahora.getTime() - 7 * 24 * 60 * 60 * 1000)
    
    // Estadísticas generales
    const [
      totalRifas,
      rifasActivas,
      totalParticipantes,
      totalTicketsVendidos,
      ingresosTotales,
      pagosPendientes,
      ticketsPendientesVerificacion,
      ventasUltimas24h,
      ventasUltimos7d
    ] = await Promise.all([
      // Total de rifas
      prisma.rifa.count(),
      
      // Rifas activas
      prisma.rifa.count({
        where: { estado: 'ACTIVA' }
      }),
      
      // Total de participantes únicos
      prisma.participante.count(),
      
      // Total de tickets vendidos (pagados)
      prisma.ticket.count({
        where: { estado: 'PAGADO' }
      }),
      
      // Ingresos totales
      prisma.compra.aggregate({
        where: { estadoPago: 'APROBADO' as any },
        _sum: { monto: true }
      }),
      
      // Pagos pendientes
      prisma.compra.count({
        where: { estadoPago: 'EN_VERIFICACION' as any }
      }),
      
      // Tickets pendientes de verificación
      prisma.ticket.count({
        where: { estado: 'EN_VERIFICACION' as any }
      }),
      
      // Ventas últimas 24h
      prisma.compra.aggregate({
        where: {
          estadoPago: 'APROBADO' as any,
          updatedAt: { gte: hace24h }
        },
        _count: true,
        _sum: { monto: true }
      }),
      
      // Ventas últimos 7 días
      prisma.compra.aggregate({
        where: {
          estadoPago: 'APROBADO' as any,
          updatedAt: { gte: hace7d }
        },
        _count: true,
        _sum: { monto: true }
      })
    ])
    
    // Top rifas por ventas
    const topRifas = await prisma.rifa.findMany({
      select: {
        id: true,
        nombre: true,
        precioPorBoleto: true,
        totalBoletos: true,
        fechaSorteo: true,
        estado: true,
        _count: {
          select: {
            tickets: {
              where: { estado: 'PAGADO' as any }
            }
          }
        }
      },
      orderBy: {
        tickets: {
          _count: 'desc'
        }
      },
      take: 5
    })
    
    const topRifasConEstadisticas = topRifas.map((rifa: any) => ({
      ...rifa,
      ticketsVendidos: rifa._count.tickets,
      porcentajeVendido: Math.round((rifa._count.tickets / rifa.totalBoletos) * 100),
      ingresos: rifa._count.tickets * rifa.precioPorBoleto
    }))
    
    // Actividad reciente
    const actividadReciente = await prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        evento: true,
        accion: true,
        usuarioId: true,
        creadaPor: true,
        entidad: true,
        entidadId: true,
        detalles: true,
        ipAddress: true,
        createdAt: true
      }
    })
    
    // Notificaciones pendientes
    const notificacionesPendientes = await prisma.notificacion.count({
      where: {
        paraAdministradores: true,
        leida: false
      }
    })
    
    // Próximos sorteos
    const proximosSorteos = await prisma.rifa.findMany({
      where: {
        fechaSorteo: { gte: ahora },
        estado: 'ACTIVA'
      },
      select: {
        id: true,
        nombre: true,
        fechaSorteo: true,
        totalBoletos: true,
        _count: {
          select: {
            tickets: {
              where: { estado: 'PAGADO' as any }
            }
          }
        }
      },
      orderBy: { fechaSorteo: 'asc' },
      take: 5
    })
    
    return NextResponse.json({
      success: true,
      data: {
        estadisticas: {
          totalRifas,
          rifasActivas,
          totalParticipantes,
          totalTicketsVendidos,
          ingresosTotales: ingresosTotales._sum.monto || 0,
          pagosPendientes,
          ticketsPendientesVerificacion,
          ventasUltimas24h: {
            cantidad: ventasUltimas24h._count,
            monto: ventasUltimas24h._sum.monto || 0
          },
          ventasUltimos7d: {
            cantidad: ventasUltimos7d._count,
            monto: ventasUltimos7d._sum.monto || 0
          }
        },
        topRifas: topRifasConEstadisticas,
        proximosSorteos: proximosSorteos.map((rifa: any) => ({
          ...rifa,
          ticketsVendidos: rifa._count.tickets,
          porcentajeVendido: Math.round((rifa._count.tickets / rifa.totalBoletos) * 100),
          diasRestantes: Math.ceil((rifa.fechaSorteo.getTime() - ahora.getTime()) / (1000 * 60 * 60 * 24))
        })),
        actividadReciente: actividadReciente.map((log: any) => ({
          id: log.id,
          accion: log.accion,
          entidad: log.entidad,
          fecha: log.createdAt,
          usuario: log.usuario?.nombre || 'Sistema',
          detalles: log.payload
        })),
        alertas: {
          notificacionesPendientes,
          pagosPendientes,
          rifasPorVencer: proximosSorteos.filter((r: any) => 
            (r.fechaSorteo.getTime() - ahora.getTime()) < (7 * 24 * 60 * 60 * 1000) // 7 días
          ).length
        }
      }
    })
    
  } catch (error) {
    console.error('Error en dashboard:', error)
    return NextResponse.json(
      { success: false, error: 'Error al cargar dashboard' },
      { status: 500 }
    )
  }
}
