'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/badge'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { get, del } from '@/lib/api-client'
import { AdminHeader } from '@/features/admin/ui/AdminHeader'
import { AdminSection } from '@/features/admin/ui/AdminSection'
import { 
  Search,
  Filter,
  UserPlus,
  Edit,
  Trash2,
  Eye,
  Phone,
  Mail,
  Calendar,
  Users,
  Ticket
} from 'lucide-react'
import type { Rifa } from '@/types'

interface Participante {
  id: string
  nombre: string
  cedula: string
  telefono: string
  email: string
  fechaRegistro: string
  totalTickets: number
  eventosParticipados: string[]
  ultimaActividad: string
  estado: 'ACTIVO' | 'INACTIVO' | 'BLOQUEADO'
}

export default function ParticipantesPage() {
  const router = useRouter()
  const [participantes, setParticipantes] = useState<Participante[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionMessage, setActionMessage] = useState<
    { type: 'success' | 'error'; text: string } | null
  >(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [rifas, setRifas] = useState<Rifa[]>([])
  const [rifaId, setRifaId] = useState<string>('')

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true)
      try {
        // cargar rifas para el selector (una vez)
        if (rifas.length === 0) {
          try {
            const rf = await get<any>('/api/rifas?page=1&limit=100&orderBy=createdAt&orderDir=desc', { cache: 'no-store' })
            const list = (rf?.success ? rf.data : rf?.data) || []
            setRifas(list)
          } catch {}
        }
        const url = rifaId ? `/api/admin/participantes?rifaId=${encodeURIComponent(rifaId)}` : '/api/admin/participantes'
        const data = await get<any>(url, { cache: 'no-store' })
        setParticipantes((data?.success ? data.data : data) || [])
      } catch (err: any) {
        setError(err.message || 'Error desconocido')
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [rifaId])
  
  const [filtroEstado, setFiltroEstado] = useState<string>('TODOS')
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'ACTIVO':
        return <Badge className="bg-green-500 text-white">Activo</Badge>
      case 'INACTIVO':
        return <Badge className="bg-gray-500 text-white">Inactivo</Badge>
      case 'BLOQUEADO':
        return <Badge className="bg-red-500 text-white">Bloqueado</Badge>
      default:
        return <Badge className="bg-gray-500 text-white">{estado}</Badge>
    }
  }

  const formatFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const participantesFiltrados = participantes.filter(participante => {
    const matchEstado = filtroEstado === 'TODOS' || participante.estado === filtroEstado
    const matchBusqueda = searchTerm === '' || 
      participante.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      participante.cedula.includes(searchTerm) ||
      participante.telefono.includes(searchTerm) ||
      participante.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchEstado && matchBusqueda
  })

  const contadorEstados = {
    TODOS: participantes.length,
    ACTIVO: participantes.filter(p => p.estado === 'ACTIVO').length,
    INACTIVO: participantes.filter(p => p.estado === 'INACTIVO').length,
    BLOQUEADO: participantes.filter(p => p.estado === 'BLOQUEADO').length
  }

  // Render inline errors/skeletons within sections instead of early returns

  const totalPages = Math.ceil(participantesFiltrados.length / itemsPerPage)
  const paginatedParticipantes = participantesFiltrados.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const crearParticipante = () => router.push('/admin/participantes/nuevo')

  const verParticipante = (id: string) => router.push(`/admin/participantes/${id}`)

  const editarParticipante = (id: string) => router.push(`/admin/participantes/${id}/editar`)

  const eliminarParticipante = async (id: string) => {
    if (!confirm('¿Eliminar participante?')) return
    setDeletingId(id)
    setActionMessage(null)
    try {
      await del(`/api/admin/participantes?id=${id}`)
      setParticipantes(prev => prev.filter(p => p.id !== id))
      setActionMessage({ type: 'success', text: 'Participante eliminado' })
    } catch (err: any) {
      setActionMessage({ type: 'error', text: err.message || 'Error al eliminar' })
    } finally {
      setDeletingId(null)
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

      {/* Header */}
      <AdminHeader
        title="🧑‍🤝‍🧑 Gestión de Participantes"
        description="Administra todos los participantes del sistema"
        right={(
          <Button onClick={crearParticipante} className="bg-teal-600 hover:bg-teal-700 text-white">
            <UserPlus className="h-4 w-4 mr-2" />
            Nuevo Participante
          </Button>
        )}
      />

      {/* Estadísticas rápidas */}
      <AdminSection title="Resumen">
        {loading && participantes.length === 0 ? (
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
                    <p className="text-2xl font-bold text-white">{contadorEstados.TODOS}</p>
                    <p className="text-sm text-gray-400">Total Participantes</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-green-500">{contadorEstados.ACTIVO}</p>
                    <p className="text-sm text-gray-400">Activos</p>
                  </div>
                  <Users className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-gray-400">{contadorEstados.INACTIVO}</p>
                    <p className="text-sm text-gray-400">Inactivos</p>
                  </div>
                  <Users className="h-8 w-8 text-gray-400" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-red-500">{contadorEstados.BLOQUEADO}</p>
                    <p className="text-sm text-gray-400">Bloqueados</p>
                  </div>
                  <Users className="h-8 w-8 text-red-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </AdminSection>

      {/* Filtros */}
      <AdminSection title="Búsqueda y filtros" subtitle="Filtra por estado o busca por datos de contacto">
        {loading && participantes.length === 0 ? (
          <div className="flex flex-col sm:flex-row gap-4 items-center animate-pulse">
            <div className="h-10 bg-gray-700 rounded-lg w-full" />
            <div className="h-10 bg-gray-700 rounded-lg w-64" />
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nombre, cédula, teléfono o email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-gray-300 text-sm">Sorteo:</label>
              <select
                value={rifaId}
                onChange={(e) => { setRifaId(e.target.value); setCurrentPage(1) }}
                className="bg-gray-700 border border-gray-600 rounded-lg text-white px-3 py-2"
              >
                <option value="">Todos</option>
                {rifas.map((r) => (
                  <option key={r.id} value={r.id}>{r.nombre}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-2 flex-wrap">
              {Object.keys(contadorEstados).map((estado) => (
                <Button
                  key={estado}
                  variant={filtroEstado === estado ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFiltroEstado(estado)}
                  className={filtroEstado === estado ? 'bg-teal-600 text-white' : 'border-gray-600 text-gray-300 hover:bg-gray-700'}
                >
                  {estado} ({contadorEstados[estado as keyof typeof contadorEstados]})
                </Button>
              ))}
            </div>
          </div>
        )}
      </AdminSection>

      {/* Tabla de participantes */}
      <AdminSection title="Lista de Participantes" subtitle={paginatedParticipantes.length > 0 ? `Mostrando ${paginatedParticipantes.length} de ${participantesFiltrados.length}` : undefined}>
        {loading && participantes.length === 0 ? (
          <div className="space-y-2 animate-pulse">
            <div className="h-10 bg-gray-800/60 border border-gray-700 rounded" />
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-10 bg-gray-800/60 border border-gray-700 rounded" />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-750">
                <tr className="border-b border-gray-600">
                  <th className="text-left p-4 text-gray-300 font-medium text-sm">Participante</th>
                  <th className="text-left p-4 text-gray-300 font-medium text-sm">Contacto</th>
                  <th className="text-left p-4 text-gray-300 font-medium text-sm">Tickets</th>
                  <th className="text-left p-4 text-gray-300 font-medium text-sm">Registro</th>
                  <th className="text-left p-4 text-gray-300 font-medium text-sm">Estado</th>
                  <th className="text-left p-4 text-gray-300 font-medium text-sm">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-gray-800">
                {paginatedParticipantes.map((participante) => (
                  <tr key={participante.id} className="border-b border-gray-700 hover:bg-gray-700/30 transition-colors">
                    <td className="p-4">
                      <div>
                        <p className="text-white font-medium">{participante.nombre}</p>
                        <p className="text-gray-400 text-sm font-mono">{participante.cedula}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="space-y-1">
                        <div className="flex items-center text-sm text-gray-300">
                          <Phone className="h-3 w-3 mr-2 text-gray-400" />
                          {participante.telefono}
                        </div>
                        <div className="flex items-center text-sm text-gray-300">
                          <Mail className="h-3 w-3 mr-2 text-gray-400" />
                          {participante.email}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-center">
                        <p className="text-lg font-bold text-white">{participante.totalTickets}</p>
                        <p className="text-xs text-gray-400">{participante.eventosParticipados.length} eventos</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center text-sm text-gray-300">
                        <Calendar className="h-3 w-3 mr-2 text-gray-400" />
                        {formatFecha(participante.fechaRegistro)}
                      </div>
                    </td>
                    <td className="p-4">
                      {getEstadoBadge(participante.estado)}
                    </td>
                    <td className="p-4">
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-gray-600 text-gray-300 hover:bg-gray-700 p-2"
                          onClick={() => verParticipante(participante.id)}
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-gray-600 text-gray-300 hover:bg-gray-700 p-2"
                          onClick={() => editarParticipante(participante.id)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white p-2"
                          onClick={() => eliminarParticipante(participante.id)}
                          disabled={deletingId === participante.id}
                        >
                          {deletingId === participante.id ? (
                            <LoadingSpinner className="h-3 w-3" />
                          ) : (
                            <Trash2 className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminSection>

      {/* Paginación */}
      {totalPages > 1 && (
        <AdminSection title="Paginación">
          <div className="flex items-center justify-between">
            <p className="text-gray-400 text-sm">
              Mostrando {((currentPage - 1) * itemsPerPage) + 1} a {Math.min(currentPage * itemsPerPage, participantesFiltrados.length)} de {participantesFiltrados.length} participantes
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                Anterior
              </Button>
              <span className="px-3 py-2 text-white">
                Página {currentPage} de {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                Siguiente
              </Button>
            </div>
          </div>
        </AdminSection>
      )}
    </div>
  )
}
