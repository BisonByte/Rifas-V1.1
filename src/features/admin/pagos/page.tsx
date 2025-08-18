'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/badge'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { get, post } from '@/lib/api-client'
import { 
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Download,
  CreditCard
} from 'lucide-react'

interface Pago {
  id: string
  participante: {
    nombre: string
    cedula: string
    telefono: string
  }
  evento: {
    nombre: string
  }
  monto: number
  metodoPago: string
  referencia: string
  estado: 'PENDIENTE' | 'CONFIRMADO' | 'RECHAZADO'
  fechaCreacion: string
  tickets: number[]
  comprobante?: string
}

export default function PagosPage() {
  const [pagos, setPagos] = useState<Pago[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionMessage, setActionMessage] = useState<
    { type: 'success' | 'error'; text: string } | null
  >(null)

  const fetchPagos = async () => {
    try {
      const json = await get('/api/admin/verificar-pagos', { cache: 'no-store' })
      const mapped = (json.data || []).map((p: any) => ({
        id: p.id,
        participante: {
          nombre: p.participante?.nombre || '',
          cedula: p.participante?.cedula || '',
          telefono: p.participante?.celular || ''
        },
        evento: { nombre: p.rifa?.nombre || '' },
        monto: p.monto,
        metodoPago: p.metodoPago || '',
        referencia: p.numeroReferencia || '',
        estado:
          p.estadoPago === 'CONFIRMADO'
            ? 'CONFIRMADO'
            : p.estadoPago === 'RECHAZADO'
            ? 'RECHAZADO'
            : 'PENDIENTE',
        fechaCreacion: p.fechaCreacion || p.createdAt,
        tickets: p.numerosTickets || p.tickets || [],
        comprobante: p.comprobante || undefined
      }))
      setPagos(mapped)
    } catch (err: any) {
      setError(err.message || 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPagos()
  }, [])
  
  const [filtroEstado, setFiltroEstado] = useState<string>('TODOS')
  const [searchTerm, setSearchTerm] = useState('')

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'PENDIENTE':
        return <Badge className="bg-yellow-500 text-black flex items-center"><Clock className="h-3 w-3 mr-1" />Pendiente</Badge>
      case 'CONFIRMADO':
        return <Badge className="bg-green-500 text-white flex items-center"><CheckCircle className="h-3 w-3 mr-1" />Confirmado</Badge>
      case 'RECHAZADO':
        return <Badge className="bg-red-500 text-white flex items-center"><XCircle className="h-3 w-3 mr-1" />Rechazado</Badge>
      default:
        return <Badge className="bg-gray-500 text-white">{estado}</Badge>
    }
  }

  const formatFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleAction = async (
    pagoId: string,
    accion: 'APROBAR' | 'RECHAZAR',
    comentarios = ''
  ) => {
    try {
      await post('/api/admin/verificar-pagos', {
        compraId: pagoId,
        accion,
        comentarios,
      })
      await fetchPagos()
      setActionMessage({
        type: 'success',
        text:
          accion === 'APROBAR'
            ? 'Pago confirmado correctamente'
            : 'Pago rechazado correctamente',
      })
    } catch (err: any) {
      setActionMessage({
        type: 'error',
        text:
          err.message ||
          (accion === 'APROBAR'
            ? 'Error al confirmar el pago'
            : 'Error al rechazar el pago'),
      })
    }
  }

  const aprobarPago = async (pagoId: string) => {
    await handleAction(pagoId, 'APROBAR')
  }

  const rechazarPago = async (pagoId: string) => {
    const razon = prompt('Motivo del rechazo:')
    if (!razon) return
    await handleAction(pagoId, 'RECHAZAR', razon)
  }

  const pagosFiltrados = pagos.filter(pago => {
    const matchEstado = filtroEstado === 'TODOS' || pago.estado === filtroEstado
    const matchBusqueda = searchTerm === '' || 
      pago.participante.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pago.participante.cedula.includes(searchTerm) ||
      pago.referencia.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchEstado && matchBusqueda
  })

  const contadorEstados = {
    TODOS: pagos.length,
    PENDIENTE: pagos.filter(p => p.estado === 'PENDIENTE').length,
    CONFIRMADO: pagos.filter(p => p.estado === 'CONFIRMADO').length,
    RECHAZADO: pagos.filter(p => p.estado === 'RECHAZADO').length
  }

  if (loading) {
    return (
      <div className="p-6">
        <LoadingSpinner />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {actionMessage && (
        <Alert variant={actionMessage.type === 'success' ? 'success' : 'destructive'}>
          <AlertTitle>{actionMessage.type === 'success' ? 'Éxito' : 'Error'}</AlertTitle>
          <AlertDescription>{actionMessage.text}</AlertDescription>
        </Alert>
      )}
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Gestión de Pagos</h1>
          <p className="text-gray-400 mt-1">Administra y verifica todos los pagos del sistema</p>
        </div>
        <Button className="bg-teal-600 hover:bg-teal-700 text-white">
          <Download className="h-4 w-4 mr-2" />
          Exportar
        </Button>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-white">{contadorEstados.TODOS}</p>
                <p className="text-sm text-gray-400">Total Pagos</p>
              </div>
              <CreditCard className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-yellow-500">{contadorEstados.PENDIENTE}</p>
                <p className="text-sm text-gray-400">Pendientes</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-green-500">{contadorEstados.CONFIRMADO}</p>
                <p className="text-sm text-gray-400">Confirmados</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-red-500">{contadorEstados.RECHAZADO}</p>
                <p className="text-sm text-gray-400">Rechazados</p>
              </div>
              <XCircle className="h-8 w-8 text-red-500" />
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
                placeholder="Buscar por nombre, cédula o referencia..."
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

      {/* Lista de pagos */}
      <div className="space-y-4">
        {pagosFiltrados.map((pago) => (
          <Card key={pago.id} className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-white">{pago.participante.nombre}</h3>
                      <p className="text-gray-400 text-sm">
                        {pago.participante.cedula} • {pago.participante.telefono}
                      </p>
                      <p className="text-gray-500 text-sm mt-1">
                        {pago.evento.nombre}
                      </p>
                    </div>
                    {getEstadoBadge(pago.estado)}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Monto:</span>
                      <p className="text-white font-medium">
                        {pago.monto > 0 ? `$${pago.monto.toLocaleString()}` : 'Gratis'}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-400">Método:</span>
                      <p className="text-white">{pago.metodoPago}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Referencia:</span>
                      <p className="text-white font-mono">{pago.referencia}</p>
                    </div>
                  </div>
                  
                  <div className="mt-3">
                    <span className="text-gray-400 text-sm">Tickets: </span>
                    <span className="text-white text-sm">{pago.tickets.join(', ')}</span>
                  </div>
                  
                  <div className="mt-2">
                    <span className="text-gray-400 text-sm">Fecha: </span>
                    <span className="text-white text-sm">{formatFecha(pago.fechaCreacion)}</span>
                  </div>
                </div>

                {/* Acciones */}
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700">
                    <Eye className="h-4 w-4 mr-2" />
                    Ver
                  </Button>
                  {pago.estado === 'PENDIENTE' && (
                    <>
                      <Button 
                        size="sm" 
                        className="bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => aprobarPago(pago.id)}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Aprobar
                      </Button>
                      <Button 
                        size="sm" 
                        className="bg-red-600 hover:bg-red-700 text-white"
                        onClick={() => rechazarPago(pago.id)}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Rechazar
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Estado vacío */}
      {pagosFiltrados.length === 0 && (
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-12 text-center">
            <CreditCard className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-white mb-2">No hay pagos</h3>
            <p className="text-gray-400">No se encontraron pagos que coincidan con los filtros seleccionados</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
