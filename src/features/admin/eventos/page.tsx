'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/badge'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { get, post } from '@/lib/api-client'
import type { ApiResponse } from '@/types'
import { AdminHeader } from '@/features/admin/ui/AdminHeader'
import { AdminSection } from '@/features/admin/ui/AdminSection'
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  Calendar,
  Users,
  Ticket
} from 'lucide-react'

interface Evento {
  id: string
  nombre: string
  descripcion: string
  fechaInicio: string
  fechaFin: string
  fechaSorteo: string
  estado: 'ACTIVO' | 'INACTIVO' | 'FINALIZADO'
  participantes: number
  ticketsVendidos: number
  precioTicket: number
}

interface RifaApi {
  id: string
  nombre: string
  descripcion: string
  fechaSorteo: string
  createdAt: string
  estado: string
  precioPorBoleto: number
  _count?: { tickets: number }
}

export default function EventosPage() {
  const router = useRouter()
  const [eventos, setEventos] = useState<Evento[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [stats, setStats] = useState({
    eventos: 0,
    participantes: 0,
    tickets: 0,
    ingresos: 0
  })
  const [publishing, setPublishing] = useState<string | null>(null)

  useEffect(() => {
    const fetchEventos = async () => {
      try {
        const json = await get<ApiResponse<RifaApi[]>>('/api/admin/eventos', { cache: 'no-store' })
        if (!json?.success || !json.data) {
          throw new Error(json?.error || 'Error al cargar eventos')
        }
        const rifas = json.data
        const mapped: Evento[] = rifas.map((r): Evento => ({
          id: r.id,
          nombre: r.nombre,
          descripcion: r.descripcion,
          fechaInicio: r.createdAt,
          fechaFin: r.fechaSorteo,
          fechaSorteo: r.fechaSorteo,
          estado: r.estado === 'ACTIVA'
            ? 'ACTIVO'
            : r.estado === 'FINALIZADA'
              ? 'FINALIZADO'
              : 'INACTIVO',
          participantes: r._count?.tickets ?? 0,
          ticketsVendidos: r._count?.tickets ?? 0,
          precioTicket: r.precioPorBoleto
        }))
        setEventos(mapped)
        const totals = rifas.reduce(
          (acc, r) => {
            const participantes = r._count?.tickets ?? 0
            acc.participantes += participantes
            acc.tickets += participantes
            acc.ingresos += participantes * r.precioPorBoleto
            return acc
          },
          { eventos: rifas.length, participantes: 0, tickets: 0, ingresos: 0 }
        )
        setStats(totals)
      } catch (err) {
        console.error('Error cargando eventos:', err)
        setError(err instanceof Error ? err.message : 'Error al cargar eventos')
      } finally {
        setLoading(false)
      }
    }

    fetchEventos()
  }, [])

  const publicarRifa = async (id: string) => {
    try {
      setPublishing(id)
      const res = await post<any>(`/api/admin/rifas/${id}/publicar`)
      if (!res?.success) throw new Error(res?.error || 'No se pudo publicar')
      // Refrescar estado local a ACTIVO
      setEventos((prev) => prev.map(e => e.id === id ? { ...e, estado: 'ACTIVO' } : e))
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al publicar rifa')
    } finally {
      setPublishing(null)
    }
  }

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'ACTIVO':
        return <Badge className="bg-green-500 text-white">Activo</Badge>
      case 'INACTIVO':
        return <Badge className="bg-gray-500 text-white">Inactivo</Badge>
      case 'FINALIZADO':
        return <Badge className="bg-red-500 text-white">Finalizado</Badge>
      default:
        return <Badge className="bg-gray-500 text-white">{estado}</Badge>
    }
  }

  const formatFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // Inline error display within the page

  return (
  <div className="space-y-8 animate-fade-in-up">
      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <AdminHeader
        title="📅 Gestión de Eventos"
        description="Administra todos los eventos del sistema"
        right={(
          <Button onClick={() => router.push('/admin/eventos/nuevo')} className="bg-gradient-to-r from-blue-500 via-purple-500 to-teal-500 hover:from-blue-600 hover:via-purple-600 hover:to-teal-600 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl hover:shadow-purple-500/25 transform hover:scale-105 transition-all duration-300 font-medium">
            <Plus className="h-5 w-5 mr-2" />
            Crear Evento Nuevo
          </Button>
        )}
      />

      {/* Stats Cards */}
  <AdminSection title="Resumen">
  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 border-blue-500/20 backdrop-blur-xl card-hover">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-500/20 rounded-xl">
                <Calendar className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats.eventos}</p>
                <p className="text-blue-200 text-sm">Total Eventos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/20 to-green-600/10 border-green-500/20 backdrop-blur-xl card-hover">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-green-500/20 rounded-xl">
                <Users className="h-6 w-6 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats.participantes.toLocaleString()}</p>
                <p className="text-green-200 text-sm">Participantes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 border-purple-500/20 backdrop-blur-xl card-hover">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-purple-500/20 rounded-xl">
                <Ticket className="h-6 w-6 text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats.tickets.toLocaleString()}</p>
                <p className="text-purple-200 text-sm">Tickets Vendidos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-500/20 to-orange-600/10 border-yellow-500/20 backdrop-blur-xl card-hover">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-yellow-500/20 rounded-xl">
                <Eye className="h-6 w-6 text-yellow-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">${stats.ingresos.toLocaleString()}</p>
                <p className="text-yellow-200 text-sm">Ingresos Totales</p>
              </div>
            </div>
          </CardContent>
        </Card>
  </div>
  </AdminSection>

      {/* Filtros y búsqueda */}
      <AdminSection title="Búsqueda y filtros">
        <div className="flex flex-col lg:flex-row gap-4 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Buscar eventos por nombre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all duration-200"
            />
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700/50 hover:text-white px-4 py-3 rounded-xl transition-all duration-200">
              <Filter className="h-4 w-4 mr-2" />
              Filtrar
            </Button>
            <Button className="bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 text-white px-4 py-3 rounded-xl transition-all duration-200 transform hover:scale-105">
              <Eye className="h-4 w-4 mr-2" />
              Ver Todo
            </Button>
          </div>
        </div>
      </AdminSection>

      {/* Lista de eventos */}
  <AdminSection title="Lista de eventos">
  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
        {eventos.map((evento) => (
          <Card key={evento.id} className="bg-slate-800/60 border-slate-700/50 backdrop-blur-xl shadow-xl card-hover group relative overflow-hidden">
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <CardHeader className="border-b border-slate-700/50 pb-4 relative z-10">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <CardTitle className="text-white text-xl group-hover:text-blue-300 transition-colors duration-300">{evento.nombre}</CardTitle>
                    {getEstadoBadge(evento.estado)}
                  </div>
                  <p className="text-slate-400 text-sm line-clamp-2">{evento.descripcion}</p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-6 space-y-6 relative z-10">
              {/* Métricas principales */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center group/stat">
                  <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl mx-auto mb-2 shadow-lg group-hover/stat:shadow-blue-500/25 transform group-hover/stat:scale-110 transition-all duration-300">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <p className="text-xl font-bold text-white">{evento.participantes.toLocaleString()}</p>
                  <p className="text-xs text-slate-400">Participantes</p>
                </div>
                <div className="text-center group/stat">
                  <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl mx-auto mb-2 shadow-lg group-hover/stat:shadow-green-500/25 transform group-hover/stat:scale-110 transition-all duration-300">
                    <Ticket className="h-6 w-6 text-white" />
                  </div>
                  <p className="text-xl font-bold text-white">{evento.ticketsVendidos.toLocaleString()}</p>
                  <p className="text-xs text-slate-400">Tickets</p>
                </div>
                <div className="text-center group/stat">
                  <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl mx-auto mb-2 shadow-lg group-hover/stat:shadow-purple-500/25 transform group-hover/stat:scale-110 transition-all duration-300">
                    <Calendar className="h-6 w-6 text-white" />
                  </div>
                  <p className="text-lg font-bold text-white">{formatFecha(evento.fechaSorteo)}</p>
                  <p className="text-xs text-slate-400">Sorteo</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Progreso de Ventas</span>
                  <span className="text-white font-medium">
                    {Math.round((evento.ticketsVendidos / 10000) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-slate-700/50 rounded-full h-2 overflow-hidden">
                  <div 
                    className="h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-teal-500 rounded-full animate-gradient transition-all duration-1000"
                    style={{ width: `${Math.min((evento.ticketsVendidos / 10000) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>

              {/* Información detallada */}
              <div className="space-y-3 p-4 bg-slate-700/30 rounded-xl border border-slate-600/30">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-sm">Precio por Ticket:</span>
                  <span className="text-white font-semibold">
                    {evento.precioTicket > 0 ? (
                      <span className="text-green-400">${evento.precioTicket}</span>
                    ) : (
                      <span className="text-blue-400">Gratis</span>
                    )}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-sm">Fecha Límite:</span>
                  <span className="text-white font-medium">{formatFecha(evento.fechaFin)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-sm">Ingresos:</span>
                  <span className="text-yellow-400 font-semibold">
                    ${(evento.ticketsVendidos * evento.precioTicket).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex gap-3">
                <Link href={`/admin/eventos/${evento.id}`} className="flex-1">
                  <Button 
                    size="sm" 
                    className="w-full bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 hover:text-white border border-slate-600/50 hover:border-slate-500/50 transition-all duration-200"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Ver
                  </Button>
                </Link>
                <Link href={`/admin/eventos/${evento.id}/editar`} className="flex-1">
                  <Button 
                    size="sm" 
                    className="w-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 hover:from-blue-500/30 hover:to-purple-500/30 text-blue-300 hover:text-blue-200 border border-blue-500/30 hover:border-blue-400/50 transition-all duration-200"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </Button>
                </Link>
                {evento.estado !== 'ACTIVO' && (
                  <Button
                    size="sm"
                    onClick={() => publicarRifa(evento.id)}
                    disabled={publishing === evento.id}
                    className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white border border-green-500/40 transition-all duration-200"
                  >
                    {publishing === evento.id ? (
                      <>
                        <span className="mr-2 animate-spin">⏳</span>
                        Publicando...
                      </>
                    ) : (
                      <>
                        <span className="mr-2">🚀</span>
                        Publicar
                      </>
                    )}
                  </Button>
                )}
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="border-red-500/30 text-red-400 hover:bg-red-500/20 hover:text-red-300 hover:border-red-400/50 transition-all duration-200"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
  </div>
  </AdminSection>

      {/* Estado vacío mejorado */}
      {eventos.length === 0 && (
        <AdminSection title="Sin eventos">
          <div className="p-8 text-center">
            <div className="space-y-6">
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mx-auto flex items-center justify-center shadow-2xl animate-float">
                  <Calendar className="h-12 w-12 text-white" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full mx-auto w-24 h-24 animate-ping opacity-20"></div>
              </div>
              <div className="space-y-3">
                <h3 className="text-2xl font-bold text-white">¡Crea tu primer evento!</h3>
                <p className="text-slate-400 max-w-md mx-auto">
                  Comienza a generar rifas emocionantes y atrae a miles de participantes con nuestro sistema avanzado.
                </p>
              </div>
              <Link href="/admin/eventos/nuevo">
                <Button className="bg-gradient-to-r from-blue-500 via-purple-500 to-teal-500 hover:from-blue-600 hover:via-purple-600 hover:to-teal-600 text-white px-8 py-3 rounded-xl font-medium transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-purple-500/25">
                  <Plus className="h-5 w-5 mr-2" />
                  Crear Mi Primer Evento
                </Button>
              </Link>
            </div>
          </div>
        </AdminSection>
      )}
    </div>
  )
}
