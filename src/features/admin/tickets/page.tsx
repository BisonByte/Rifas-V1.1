'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/badge'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { get } from '@/lib/api-client'
import { PaginatedResponse } from '@/types'
import {
  Search,
  Filter,
  Ticket,
  Calendar,
  Eye,
  Download
} from 'lucide-react'

interface TicketData {
  id: string
  numero: number
  rifa: { nombre: string }
  participante?: {
    nombre: string
    celular: string
  }
  createdAt: string
  estado: string
  monto?: number
}

export default function TicketsPage() {
  const [tickets, setTickets] = useState<TicketData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const limit = 10
  const [stats, setStats] = useState({ total: 0, activos: 0, ganadores: 0, usados: 0 })

  useEffect(() => {
    const fetchTickets = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await get<PaginatedResponse<TicketData>>(
          `/api/admin/tickets?page=${page}&limit=${limit}&search=${encodeURIComponent(searchTerm)}`,
          { cache: 'no-store' }
        )
        if (!data?.success) {
          throw new Error(data?.error || 'Error al cargar tickets')
        }
        setTickets(data.data || [])
        setTotalPages(data.pagination.totalPages)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido')
      } finally {
        setLoading(false)
      }
    }

    fetchTickets()
  }, [page, searchTerm])

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [totalRes, activosRes, ganadoresRes] = await Promise.all([
          get<PaginatedResponse<TicketData>>('/api/admin/tickets?limit=1', { cache: 'no-store' }),
          get<PaginatedResponse<TicketData>>('/api/admin/tickets?estado=DISPONIBLE&limit=1', {
            cache: 'no-store'
          }),
          get<PaginatedResponse<TicketData>>('/api/admin/tickets?estado=GANADOR&limit=1', {
            cache: 'no-store'
          })
        ])
        if (!totalRes.success || !activosRes.success || !ganadoresRes.success) {
          throw new Error('Error al cargar estadísticas de tickets')
        }
        const total = totalRes.pagination.total
        const activos = activosRes.pagination.total
        const ganadores = ganadoresRes.pagination.total
        const usados = total - activos - ganadores
        setStats({ total, activos, ganadores, usados })
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar estadísticas')
      }
    }

    fetchStats()
  }, [])

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'PAGADO':
        return <Badge className="bg-green-500 text-white">Pagado</Badge>
      case 'GANADOR':
        return <Badge className="bg-yellow-500 text-black">Ganador</Badge>
      case 'RESERVADO':
        return <Badge className="bg-blue-500 text-white">Reservado</Badge>
      case 'PENDIENTE_PAGO':
        return <Badge className="bg-orange-500 text-white">Pendiente</Badge>
      case 'DISPONIBLE':
        return <Badge className="bg-gray-500 text-white">Disponible</Badge>
      default:
        return <Badge className="bg-gray-500 text-white">{estado}</Badge>
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Gestión de Tickets</h1>
          <p className="text-gray-400 mt-1">Administra todos los tickets del sistema</p>
        </div>
        <Button className="bg-teal-600 hover:bg-teal-700 text-white">
          <Download className="h-4 w-4 mr-2" />
          Exportar Tickets
        </Button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-white">{stats.total.toLocaleString()}</p>
                <p className="text-sm text-gray-400">Total Tickets</p>
              </div>
              <Ticket className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-green-500">{stats.activos.toLocaleString()}</p>
                <p className="text-sm text-gray-400">Activos</p>
              </div>
              <Ticket className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-yellow-500">{stats.ganadores.toLocaleString()}</p>
                <p className="text-sm text-gray-400">Ganadores</p>
              </div>
              <Ticket className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-400">{stats.usados.toLocaleString()}</p>
                <p className="text-sm text-gray-400">Usados</p>
              </div>
              <Ticket className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar tickets por número, participante..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setPage(1)
                }}
                className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700">
              <Filter className="h-4 w-4 mr-2" />
              Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de tickets */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader className="border-b border-gray-700 pb-4">
          <CardTitle className="text-xl text-white">Lista de Tickets</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-750">
                <tr className="border-b border-gray-600">
                  <th className="text-left p-4 text-gray-300 font-medium text-sm">Número</th>
                  <th className="text-left p-4 text-gray-300 font-medium text-sm">Evento</th>
                  <th className="text-left p-4 text-gray-300 font-medium text-sm">Participante</th>
                  <th className="text-left p-4 text-gray-300 font-medium text-sm">Fecha</th>
                  <th className="text-left p-4 text-gray-300 font-medium text-sm">Monto</th>
                  <th className="text-left p-4 text-gray-300 font-medium text-sm">Estado</th>
                  <th className="text-left p-4 text-gray-300 font-medium text-sm">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-gray-800">
                {tickets.map((ticket) => (
                  <tr key={ticket.id} className="border-b border-gray-700 hover:bg-gray-700/30 transition-colors">
                    <td className="p-4">
                      <span className="text-white font-mono font-bold text-lg">#{ticket.numero}</span>
                    </td>
                    <td className="p-4">
                      <span className="text-white text-sm">{ticket.rifa.nombre}</span>
                    </td>
                    <td className="p-4">
                      {ticket.participante ? (
                        <div>
                          <p className="text-white font-medium text-sm">{ticket.participante.nombre}</p>
                          <p className="text-gray-400 text-xs">{ticket.participante.celular}</p>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">-</span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center text-sm text-gray-300">
                        <Calendar className="h-3 w-3 mr-2 text-gray-400" />
                        {new Date(ticket.createdAt).toLocaleDateString('es-ES')}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-white font-medium">
                        {ticket.monto && ticket.monto > 0 ? `$${ticket.monto}` : 'Gratis'}
                      </span>
                    </td>
                    <td className="p-4">
                      {getEstadoBadge(ticket.estado)}
                    </td>
                    <td className="p-4">
                      <Button size="sm" variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700 p-2">
                        <Eye className="h-3 w-3" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between p-4 border-t border-gray-700">
            <span className="text-sm text-gray-400">Página {page} de {totalPages}</span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                Siguiente
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
