'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/badge'
import { 
  Search,
  Filter,
  Ticket,
  Calendar,
  User,
  Eye,
  Download
} from 'lucide-react'

interface TicketData {
  id: string
  numero: number
  evento: string
  participante: {
    nombre: string
    cedula: string
  }
  fechaCompra: string
  estado: 'ACTIVO' | 'GANADOR' | 'USADO'
  monto: number
}

export default function TicketsPage() {
  const [tickets] = useState<TicketData[]>([
    {
      id: '1',
      numero: 101,
      evento: 'EVENTO AZUL ES HOY',
      participante: { nombre: 'Yanibel Pérez', cedula: '12345678' },
      fechaCompra: '2025-08-16T10:30:00Z',
      estado: 'ACTIVO',
      monto: 50
    },
    {
      id: '2',
      numero: 102,
      evento: 'EVENTO GRATIS',
      participante: { nombre: 'Kike Rodriguez', cedula: '87654321' },
      fechaCompra: '2025-08-15T14:20:00Z',
      estado: 'ACTIVO',
      monto: 0
    }
  ])

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'ACTIVO':
        return <Badge className="bg-green-500 text-white">Activo</Badge>
      case 'GANADOR':
        return <Badge className="bg-yellow-500 text-black">Ganador</Badge>
      case 'USADO':
        return <Badge className="bg-gray-500 text-white">Usado</Badge>
      default:
        return <Badge className="bg-gray-500 text-white">{estado}</Badge>
    }
  }

  return (
    <div className="p-6 space-y-6">
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
                <p className="text-2xl font-bold text-white">46,813</p>
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
                <p className="text-2xl font-bold text-green-500">45,200</p>
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
                <p className="text-2xl font-bold text-yellow-500">10</p>
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
                <p className="text-2xl font-bold text-gray-400">1,603</p>
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
                      <span className="text-white text-sm">{ticket.evento}</span>
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="text-white font-medium text-sm">{ticket.participante.nombre}</p>
                        <p className="text-gray-400 text-xs">{ticket.participante.cedula}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center text-sm text-gray-300">
                        <Calendar className="h-3 w-3 mr-2 text-gray-400" />
                        {new Date(ticket.fechaCompra).toLocaleDateString('es-ES')}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-white font-medium">
                        {ticket.monto > 0 ? `$${ticket.monto}` : 'Gratis'}
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
        </CardContent>
      </Card>
    </div>
  )
}
