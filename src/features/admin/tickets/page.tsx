'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/badge'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { get } from '@/lib/api-client'
import { PaginatedResponse, Rifa } from '@/types'
import { AdminHeader } from '@/features/admin/ui/AdminHeader'
import { AdminSection } from '@/features/admin/ui/AdminSection'
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
  const [rifas, setRifas] = useState<Rifa[]>([])
  const [selectedRifa, setSelectedRifa] = useState('')
  const [tickets, setTickets] = useState<TicketData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const limit = 10
  const [exporting, setExporting] = useState(false)
  const [exportError, setExportError] = useState<string | null>(null)
  const [actionMessage, setActionMessage] = useState<
    { type: 'success' | 'error'; text: string } | null
  >(null)
  const [stats, setStats] = useState({
    disponibles: 0,
    vendidos: 0,
    reservados: 0,
    ganadores: 0,
  })

  // Load available raffles for selection
  useEffect(() => {
    const fetchRifas = async () => {
      try {
        const res = await get<PaginatedResponse<Rifa>>('/api/rifas?limit=100', {
          cache: 'no-store',
        })
        if (res.success && res.data) {
          setRifas(res.data)
          if (res.data.length > 0) {
            setSelectedRifa(res.data[0].id)
          }
        } else if (!res.success) {
          throw new Error(res.error || 'Error al cargar rifas')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar rifas')
      }
    }
    fetchRifas()
  }, [])

  useEffect(() => {
    const fetchTickets = async () => {
      if (!selectedRifa) return
      setLoading(true)
      setError(null)
      try {
        const url = `/api/admin/tickets?page=${page}&limit=${limit}&search=${encodeURIComponent(
          searchTerm
        )}&rifaId=${selectedRifa}`
        const data = await get<PaginatedResponse<TicketData>>(url, { cache: 'no-store' })
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
  }, [page, searchTerm, selectedRifa])

  useEffect(() => {
    const fetchStats = async () => {
      if (!selectedRifa) return
      try {
        const [dispRes, vendRes, resRes, ganRes] = await Promise.all([
          get<PaginatedResponse<TicketData>>(
            `/api/admin/tickets?rifaId=${selectedRifa}&estado=DISPONIBLE&limit=1`,
            { cache: 'no-store' }
          ),
          get<PaginatedResponse<TicketData>>(
            `/api/admin/tickets?rifaId=${selectedRifa}&estado=PAGADO&limit=1`,
            { cache: 'no-store' }
          ),
          get<PaginatedResponse<TicketData>>(
            `/api/admin/tickets?rifaId=${selectedRifa}&estado=RESERVADO&limit=1`,
            { cache: 'no-store' }
          ),
          get<PaginatedResponse<TicketData>>(
            `/api/admin/tickets?rifaId=${selectedRifa}&estado=GANADOR&limit=1`,
            { cache: 'no-store' }
          ),
        ])
        if (!dispRes.success || !vendRes.success || !resRes.success || !ganRes.success) {
          throw new Error('Error al cargar estadísticas de tickets')
        }
        setStats({
          disponibles: dispRes.pagination.total,
          vendidos: vendRes.pagination.total,
          reservados: resRes.pagination.total,
          ganadores: ganRes.pagination.total,
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar estadísticas')
      }
    }

    fetchStats()
  }, [selectedRifa])

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

  const handleExport = async () => {
    if (!selectedRifa) return
    setExportError(null)
    setActionMessage(null)
    setExporting(true)
    try {
      const res = await fetch(`/api/admin/export/tickets?rifaId=${selectedRifa}`)
      if (!res.ok) {
        throw new Error('Error al exportar tickets')
      }
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'tickets.csv'
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      setActionMessage({ type: 'success', text: 'Tickets exportados' })
    } catch (err: any) {
      setExportError(err.message || 'Error al exportar tickets')
    } finally {
      setExporting(false)
    }
  }

  return (
  <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {actionMessage && (
        <Alert variant={actionMessage.type === 'error' ? 'destructive' : 'default'}>
          <AlertTitle>{actionMessage.type === 'error' ? 'Error' : 'Éxito'}</AlertTitle>
          <AlertDescription>{actionMessage.text}</AlertDescription>
        </Alert>
      )}

      <AdminHeader
        title="🎟️ Gestión de Tickets"
        description="Administra todos los tickets del sistema"
        right={(
          <div className="flex flex-col items-end">
            <Button
              className="bg-teal-600 hover:bg-teal-700 text-white"
              onClick={handleExport}
              disabled={exporting || !selectedRifa}
            >
              {exporting ? (
                <>
                  <LoadingSpinner className="h-4 w-4 mr-2" />
                  Exportando...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Exportar Tickets
                </>
              )}
            </Button>
            <p className="mt-1 text-xs text-gray-400">
              Formato CSV: numero,estado,rifa,participante,celular,fecha,monto
            </p>
            {exportError && (
              <p className="mt-1 text-xs text-red-400">{exportError}</p>
            )}
          </div>
        )}
      />

      {/* Estadísticas */}
      <AdminSection title="Resumen">
        {loading && tickets.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-pulse">
            {[1,2,3,4].map((i) => (
              <div key={i} className="bg-gray-800/60 border border-gray-700 rounded-lg p-4 h-20">
                <div className="h-5 w-24 bg-gray-700 rounded" />
                <div className="h-4 w-36 bg-gray-700 rounded mt-3" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="stat-number text-gray-400">{stats.disponibles.toLocaleString()}</p>
                    <p className="stat-title">Disponibles</p>
                  </div>
                  <Ticket className="h-8 w-8 text-gray-400" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="stat-number stat-number--accent">{stats.vendidos.toLocaleString()}</p>
                    <p className="stat-title">Vendidos</p>
                  </div>
                  <Ticket className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="stat-number text-blue-400">{stats.reservados.toLocaleString()}</p>
                    <p className="stat-title">Reservados</p>
                  </div>
                  <Ticket className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="stat-number text-yellow-400">{stats.ganadores.toLocaleString()}</p>
                    <p className="stat-title">Ganadores</p>
                  </div>
                  <Ticket className="h-8 w-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </AdminSection>

      {/* Filtros */}
      <AdminSection
        title="Búsqueda y filtros"
        subtitle="Encuentra tickets por número o participante"
        actions={(
          <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700">
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
        )}
      >
        {loading && tickets.length === 0 ? (
          <div className="flex gap-4 items-center animate-pulse">
            <div className="h-10 bg-gray-700 rounded-lg w-full" />
            <div className="h-10 bg-gray-700 rounded-lg w-28" />
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row gap-4 items-center w-full">
            <select
              value={selectedRifa}
              onChange={(e) => {
                setSelectedRifa(e.target.value)
                setPage(1)
              }}
              className="w-full sm:w-64 bg-gray-700 border border-gray-600 rounded-lg text-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              {rifas.map((rifa) => (
                <option key={rifa.id} value={rifa.id}>
                  {rifa.nombre}
                </option>
              ))}
            </select>
            <div className="relative flex-1 w-full">
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
          </div>
        )}
      </AdminSection>

      {/* Lista de tickets */}
      <AdminSection title="Lista de Tickets" subtitle={tickets.length > 0 ? `Mostrando ${tickets.length} resultados` : undefined}>
        {loading && tickets.length === 0 ? (
          <div className="space-y-4">
            <div className="h-10 bg-gray-800/60 border border-gray-700 rounded" />
            <div className="space-y-2 animate-pulse">
              {[...Array(8)].map((_, idx) => (
                <div key={idx} className="h-10 bg-gray-800/60 border border-gray-700 rounded" />
              ))}
            </div>
          </div>
        ) : (
          <>
            {tickets.length === 0 ? (
              <div className="py-12 text-center">
                <Ticket className="h-10 w-10 text-gray-500 mx-auto mb-2" />
                <p className="text-white font-medium">No se encontraron tickets</p>
                <p className="text-gray-400 text-sm">Prueba cambiando la búsqueda o filtros</p>
              </div>
            ) : (
              <>
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
              </>
            )}
          </>
        )}
      </AdminSection>
    </div>
  )
}
