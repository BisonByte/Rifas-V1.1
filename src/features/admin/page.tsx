'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/badge'
import { 
  Calendar, 
  Users,
  Ticket,
  DollarSign,
  TrendingUp,
  Activity,
  Bell,
  Eye,
  Zap
} from 'lucide-react'

interface DashboardStats {
  totalEventos: number
  totalParticipantes: number
  totalTickets: number
  totalIngresos: number
}

interface EventoResumen {
  id: string
  nombre: string
  ticketsVendidos: number
  ingresos: number
  estado: string
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [eventosTop, setEventosTop] = useState<EventoResumen[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await fetch('/api/admin/dashboard')
        if (!res.ok) throw new Error('Error en la respuesta')
        const data = await res.json()
        setStats(data.stats)
        setEventosTop(data.eventosTop)
      } catch (e) {
        console.error('Error cargando dashboard:', e)
        setError('No se pudo cargar el dashboard')
      } finally {
        setLoading(false)
      }
    }
    fetchDashboard()
  }, [])

  if (loading) {
    return <div className="p-6">Cargando dashboard...</div>
  }

  if (error) {
    return <div className="p-6 text-red-500">{error}</div>
  }

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header Dashboard */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-teal-600/20 rounded-2xl blur-xl"></div>
        <div className="relative bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-4 bg-gradient-to-br from-blue-500 via-purple-500 to-teal-500 rounded-2xl shadow-xl">
                <Activity className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
                  Dashboard Principal
                </h1>
                <p className="text-slate-400 text-lg">Panel de control del sistema de rifas</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-2 px-4 py-2 bg-green-500/20 rounded-full border border-green-500/30">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-green-300 text-sm font-medium">Sistema Activo</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Eventos */}
        <Card className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 border-blue-500/20 backdrop-blur-xl card-hover relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 to-transparent opacity-50"></div>
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-200 text-sm font-medium">Total Eventos</p>
                <p className="text-3xl font-bold text-white mt-1">{stats ? stats.totalEventos : 0}</p>
                <div className="flex items-center space-x-1 mt-2">
                  <TrendingUp className="h-4 w-4 text-green-400" />
                  <span className="text-green-400 text-sm">+12% vs mes anterior</span>
                </div>
              </div>
              <div className="p-3 bg-blue-500/20 rounded-xl">
                <Calendar className="h-6 w-6 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Participantes */}
        <Card className="bg-gradient-to-br from-green-500/20 to-green-600/10 border-green-500/20 backdrop-blur-xl card-hover relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-green-400/10 to-transparent opacity-50"></div>
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-200 text-sm font-medium">Participantes</p>
                <p className="text-3xl font-bold text-white mt-1">{stats ? stats.totalParticipantes.toLocaleString() : 0}</p>
                <div className="flex items-center space-x-1 mt-2">
                  <TrendingUp className="h-4 w-4 text-green-400" />
                  <span className="text-green-400 text-sm">+28% vs mes anterior</span>
                </div>
              </div>
              <div className="p-3 bg-green-500/20 rounded-xl">
                <Users className="h-6 w-6 text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Tickets */}
        <Card className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 border-purple-500/20 backdrop-blur-xl card-hover relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-400/10 to-transparent opacity-50"></div>
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-200 text-sm font-medium">Tickets Vendidos</p>
                <p className="text-3xl font-bold text-white mt-1">{stats ? stats.totalTickets.toLocaleString() : 0}</p>
                <div className="flex items-center space-x-1 mt-2">
                  <TrendingUp className="h-4 w-4 text-green-400" />
                  <span className="text-green-400 text-sm">+45% vs mes anterior</span>
                </div>
              </div>
              <div className="p-3 bg-purple-500/20 rounded-xl">
                <Ticket className="h-6 w-6 text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Ingresos */}
        <Card className="bg-gradient-to-br from-yellow-500/20 to-orange-600/10 border-yellow-500/20 backdrop-blur-xl card-hover relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/10 to-transparent opacity-50"></div>
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-200 text-sm font-medium">Ingresos Totales</p>
                <p className="text-3xl font-bold text-white mt-1">${stats ? stats.totalIngresos.toLocaleString() : 0}</p>
                <div className="flex items-center space-x-1 mt-2">
                  <TrendingUp className="h-4 w-4 text-green-400" />
                  <span className="text-green-400 text-sm">+31% vs mes anterior</span>
                </div>
              </div>
              <div className="p-3 bg-yellow-500/20 rounded-xl">
                <DollarSign className="h-6 w-6 text-yellow-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Eventos */}
        <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-xl shadow-xl">
          <CardHeader className="border-b border-slate-700/50">
            <div className="flex items-center justify-between">
              <CardTitle className="text-white text-xl">Eventos Destacados</CardTitle>
              <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                Top Performers
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {eventosTop.map((evento, index) => (
                <div key={evento.id} className="flex items-center justify-between p-4 bg-slate-700/30 rounded-xl border border-slate-600/30 hover:bg-slate-700/50 transition-all duration-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      #{index + 1}
                    </div>
                    <div>
                      <p className="text-white font-medium">{evento.nombre}</p>
                      <p className="text-slate-400 text-sm">{evento.ticketsVendidos.toLocaleString()} tickets vendidos</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-green-400 font-bold">${evento.ingresos.toLocaleString()}</p>
                    <Badge className={evento.estado === 'ACTIVO' ? 'bg-green-500/20 text-green-300' : 'bg-gray-500/20 text-gray-300'}>
                      {evento.estado}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Activity Feed */}
        <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-xl shadow-xl">
          <CardHeader className="border-b border-slate-700/50">
            <div className="flex items-center justify-between">
              <CardTitle className="text-white text-xl">Actividad Reciente</CardTitle>
              <Bell className="h-5 w-5 text-slate-400" />
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-start space-x-3 p-3 bg-blue-500/10 rounded-lg border-l-4 border-blue-500">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-white text-sm">Nueva compra registrada</p>
                  <p className="text-slate-400 text-xs">Usuario compró 5 tickets - Hace 2 min</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-3 bg-green-500/10 rounded-lg border-l-4 border-green-500">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-white text-sm">Pago aprobado automáticamente</p>
                  <p className="text-slate-400 text-xs">Transferencia por $250 verificada - Hace 5 min</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-3 bg-purple-500/10 rounded-lg border-l-4 border-purple-500">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-white text-sm">Nuevo participante registrado</p>
                  <p className="text-slate-400 text-xs">maria.gonzalez@email.com - Hace 8 min</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-3 bg-yellow-500/10 rounded-lg border-l-4 border-yellow-500">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-white text-sm">Sorteo programado</p>
                  <p className="text-slate-400 text-xs">EVENTO AZUL - 15 Sep 2025 - Hace 1 hora</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
  <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-xl shadow-xl">
        <CardHeader>
          <CardTitle className="text-white text-xl flex items-center">
            <Zap className="h-6 w-6 mr-2 text-yellow-400" />
            Acciones Rápidas
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="p-4 bg-gradient-to-br from-blue-500/20 to-blue-600/10 hover:from-blue-500/30 hover:to-blue-600/20 border border-blue-500/20 rounded-xl transition-all duration-300 transform hover:scale-105 group">
              <Calendar className="h-8 w-8 text-blue-400 mx-auto mb-2 group-hover:scale-110 transition-transform duration-200" />
              <p className="text-white font-medium">Crear Evento</p>
            </button>
            <button className="p-4 bg-gradient-to-br from-green-500/20 to-green-600/10 hover:from-green-500/30 hover:to-green-600/20 border border-green-500/20 rounded-xl transition-all duration-300 transform hover:scale-105 group">
              <Users className="h-8 w-8 text-green-400 mx-auto mb-2 group-hover:scale-110 transition-transform duration-200" />
              <p className="text-white font-medium">Ver Participantes</p>
            </button>
            <button className="p-4 bg-gradient-to-br from-purple-500/20 to-purple-600/10 hover:from-purple-500/30 hover:to-purple-600/20 border border-purple-500/20 rounded-xl transition-all duration-300 transform hover:scale-105 group">
              <Ticket className="h-8 w-8 text-purple-400 mx-auto mb-2 group-hover:scale-110 transition-transform duration-200" />
              <p className="text-white font-medium">Gestionar Tickets</p>
            </button>
            <button className="p-4 bg-gradient-to-br from-yellow-500/20 to-orange-600/10 hover:from-yellow-500/30 hover:to-orange-600/20 border border-yellow-500/20 rounded-xl transition-all duration-300 transform hover:scale-105 group">
              <Eye className="h-8 w-8 text-yellow-400 mx-auto mb-2 group-hover:scale-110 transition-transform duration-200" />
              <p className="text-white font-medium">Ver Reportes</p>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
