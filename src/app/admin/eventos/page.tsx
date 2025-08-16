'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/badge'
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

export default function EventosPage() {
  const [eventos, setEventos] = useState<Evento[]>([
    {
      id: '1',
      nombre: 'EVENTO AZUL ES HOY',
      descripcion: 'Evento especial con premios increíbles',
      fechaInicio: '2025-08-01',
      fechaFin: '2025-08-31',
      fechaSorteo: '2025-09-01',
      estado: 'ACTIVO',
      participantes: 1019,
      ticketsVendidos: 5420,
      precioTicket: 50
    },
    {
      id: '2',
      nombre: 'EVENTO GRATIS',
      descripcion: 'Evento gratuito para todos',
      fechaInicio: '2025-08-15',
      fechaFin: '2025-09-15',
      fechaSorteo: '2025-09-20',
      estado: 'ACTIVO',
      participantes: 2500,
      ticketsVendidos: 8900,
      precioTicket: 0
    },
  ])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

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

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Gestión de Eventos</h1>
          <p className="text-gray-400 mt-1">Administra todos los eventos del sistema</p>
        </div>
        <Button className="bg-teal-600 hover:bg-teal-700 text-white">
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Evento
        </Button>
      </div>

      {/* Filtros y búsqueda */}
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar eventos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
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

      {/* Lista de eventos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {eventos.map((evento) => (
          <Card key={evento.id} className="bg-gray-800 border-gray-700">
            <CardHeader className="border-b border-gray-700">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-white text-lg">{evento.nombre}</CardTitle>
                  <p className="text-gray-400 text-sm mt-1">{evento.descripcion}</p>
                </div>
                {getEstadoBadge(evento.estado)}
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              {/* Estadísticas */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="flex items-center justify-center w-10 h-10 bg-blue-500 rounded-lg mx-auto mb-2">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                  <p className="text-lg font-bold text-white">{evento.participantes.toLocaleString()}</p>
                  <p className="text-xs text-gray-400">Participantes</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center w-10 h-10 bg-green-500 rounded-lg mx-auto mb-2">
                    <Ticket className="h-5 w-5 text-white" />
                  </div>
                  <p className="text-lg font-bold text-white">{evento.ticketsVendidos.toLocaleString()}</p>
                  <p className="text-xs text-gray-400">Tickets</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center w-10 h-10 bg-purple-500 rounded-lg mx-auto mb-2">
                    <Calendar className="h-5 w-5 text-white" />
                  </div>
                  <p className="text-lg font-bold text-white">{formatFecha(evento.fechaSorteo)}</p>
                  <p className="text-xs text-gray-400">Sorteo</p>
                </div>
              </div>

              {/* Información adicional */}
              <div className="space-y-2 pt-2 border-t border-gray-700">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Precio Ticket:</span>
                  <span className="text-white font-medium">
                    {evento.precioTicket > 0 ? `$${evento.precioTicket}` : 'Gratis'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Fecha Fin:</span>
                  <span className="text-white">{formatFecha(evento.fechaFin)}</span>
                </div>
              </div>

              {/* Acciones */}
              <div className="flex gap-2 pt-2">
                <Button size="sm" variant="outline" className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700">
                  <Eye className="h-4 w-4 mr-2" />
                  Ver
                </Button>
                <Button size="sm" variant="outline" className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700">
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Button>
                <Button size="sm" variant="outline" className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Estado vacío */}
      {eventos.length === 0 && (
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-12 text-center">
            <Calendar className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-white mb-2">No hay eventos</h3>
            <p className="text-gray-400 mb-6">Comienza creando tu primer evento</p>
            <Button className="bg-teal-600 hover:bg-teal-700 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Crear Evento
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
