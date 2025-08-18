'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/badge'
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
  const [participantes, setParticipantes] = useState<Participante[]>([
    {
      id: '1',
      nombre: 'Yanibel Pérez',
      cedula: '12345678',
      telefono: '+58 424-123-4567',
      email: 'yanibel@email.com',
      fechaRegistro: '2025-01-15T10:30:00Z',
      totalTickets: 10,
      eventosParticipados: ['EVENTO AZUL ES HOY', 'EVENTO GRATIS'],
      ultimaActividad: '2025-08-16T09:30:00Z',
      estado: 'ACTIVO'
    },
    {
      id: '2',
      nombre: 'Kike Rodriguez',
      cedula: '87654321',
      telefono: '+58 414-987-6543',
      email: 'kike@email.com',
      fechaRegistro: '2025-02-20T14:15:00Z',
      totalTickets: 5,
      eventosParticipados: ['EVENTO GRATIS'],
      ultimaActividad: '2025-08-15T16:45:00Z',
      estado: 'ACTIVO'
    },
    {
      id: '3',
      nombre: 'Xavier Morales',
      cedula: '11223344',
      telefono: '+58 412-555-0123',
      email: 'xavier@email.com',
      fechaRegistro: '2025-03-10T11:20:00Z',
      totalTickets: 5,
      eventosParticipados: ['EVENTO AZUL ES HOY'],
      ultimaActividad: '2025-08-14T12:30:00Z',
      estado: 'ACTIVO'
    },
    {
      id: '4',
      nombre: 'Derek Williams',
      cedula: '55667788',
      telefono: '+58 426-789-0123',
      email: 'derek@email.com',
      fechaRegistro: '2025-04-05T09:45:00Z',
      totalTickets: 5,
      eventosParticipados: ['EVENTO GRATIS'],
      ultimaActividad: '2025-08-13T18:20:00Z',
      estado: 'ACTIVO'
    }
  ])
  
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

  const totalPages = Math.ceil(participantesFiltrados.length / itemsPerPage)
  const paginatedParticipantes = participantesFiltrados.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Gestión de Participantes</h1>
          <p className="text-gray-400 mt-1">Administra todos los participantes del sistema</p>
        </div>
        <Button className="bg-teal-600 hover:bg-teal-700 text-white">
          <UserPlus className="h-4 w-4 mr-2" />
          Nuevo Participante
        </Button>
      </div>

      {/* Estadísticas rápidas */}
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

      {/* Filtros */}
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-4">
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
            <div className="flex gap-2">
              {Object.keys(contadorEstados).map((estado) => (
                <Button
                  key={estado}
                  variant={filtroEstado === estado ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFiltroEstado(estado)}
                  className={filtroEstado === estado ? "bg-teal-600 text-white" : "border-gray-600 text-gray-300 hover:bg-gray-700"}
                >
                  {estado} ({contadorEstados[estado as keyof typeof contadorEstados]})
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de participantes */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader className="border-b border-gray-700 pb-4">
          <CardTitle className="text-xl text-white">Lista de Participantes</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
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
                        <Button size="sm" variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700 p-2">
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700 p-2">
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline" className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white p-2">
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Paginación */}
      {totalPages > 1 && (
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
      )}
    </div>
  )
}
