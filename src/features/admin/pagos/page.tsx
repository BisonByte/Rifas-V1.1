'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/badge'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { get, post } from '@/lib/api-client'
import { AdminHeader } from '@/features/admin/ui/AdminHeader'
import { AdminSection } from '@/features/admin/ui/AdminSection'
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
  const [selectedPago, setSelectedPago] = useState<Pago | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null)
  const [exporting, setExporting] = useState(false)
  const [exportError, setExportError] = useState<string | null>(null)

  const fetchPagos = async () => {
    try {
      // Solicitar todos los estados al backend
      const json = await get('/api/admin/verificar-pagos?estado=TODOS', { cache: 'no-store' })
      const payload = (json as any)?.success ? (json as any).data : (json as any)
      const mapped = (payload || []).map((p: any) => ({
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
      setActionLoadingId(pagoId)
      await post('/api/admin/verificar-pagos', {
        compraId: pagoId,
        accion,
        comentarios,
      })
      await fetchPagos()
      // Si el modal está abierto para este pago, ciérralo al completar
      if (selectedPago && selectedPago.id === pagoId) {
        setShowModal(false)
        setSelectedPago(null)
      }
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
      setActionLoadingId(null)
  }

  const aprobarPago = async (pagoId: string) => {
    await handleAction(pagoId, 'APROBAR')
  }

  const rechazarPago = async (pagoId: string) => {
    const razon = prompt('Motivo del rechazo:')
    if (!razon) return
    await handleAction(pagoId, 'RECHAZAR', razon)
  }

  const handleExport = async () => {
    setExportError(null)
    setExporting(true)
    try {
      const res = await fetch('/api/admin/export/pagos')
      if (!res.ok) {
        throw new Error('Error al exportar pagos')
      }
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'pagos.csv'
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (err: any) {
      setExportError(err.message || 'Error al exportar pagos')
    } finally {
      setExporting(false)
    }
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

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {actionMessage && (
        <Alert variant={actionMessage.type === 'success' ? 'success' : 'destructive'}>
          <AlertTitle>{actionMessage.type === 'success' ? 'Éxito' : 'Error'}</AlertTitle>
          <AlertDescription>{actionMessage.text}</AlertDescription>
        </Alert>
      )}
      {/* Header */}
      <AdminHeader
        title="💳 Gestión de Pagos"
        description="Administra y verifica todos los pagos del sistema"
        right={(
          <div className="flex flex-col items-end">
            <Button
              className="bg-teal-600 hover:bg-teal-700 text-white"
              onClick={handleExport}
              disabled={exporting}
            >
              {exporting ? (
                <>
                  <LoadingSpinner className="h-4 w-4 mr-2" />
                  Exportando...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </>
              )}
            </Button>
            <p className="mt-1 text-xs text-gray-400">
              Formato CSV: id,nombre,cedula,telefono,evento,monto,metodoPago,referencia,estado,fecha,tickets
            </p>
            {exportError && (
              <p className="mt-1 text-xs text-red-400">{exportError}</p>
            )}
          </div>
        )}
      />

      {/* Estadísticas rápidas */}
      <AdminSection title="Resumen">
        {loading && pagos.length === 0 ? (
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
        )}
      </AdminSection>

      {/* Filtros */}
      <AdminSection title="Búsqueda y filtros" subtitle="Filtra por estado o busca por nombre, cédula o referencia">
        {loading && pagos.length === 0 ? (
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
                placeholder="Buscar por nombre, cédula o referencia..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
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

      {/* Lista de pagos */}
      <AdminSection title="Lista de pagos" subtitle={pagosFiltrados.length > 0 ? `Mostrando ${pagosFiltrados.length} resultados` : undefined}>
        {loading && pagos.length === 0 ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-800/60 border border-gray-700 rounded-lg h-28" />
            ))}
          </div>
        ) : (
          <>
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
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-gray-600 text-gray-300 hover:bg-gray-700"
                          onClick={() => {
                            setSelectedPago(pago)
                            setShowModal(true)
                          }}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Ver
                        </Button>
                        {pago.estado === 'PENDIENTE' && (
                          <>
                            <Button 
                              size="sm" 
                              className="bg-green-600 hover:bg-green-700 text-white"
                              onClick={() => aprobarPago(pago.id)}
                              disabled={actionLoadingId === pago.id}
                            >
                              {actionLoadingId === pago.id ? (
                                <>
                                  <LoadingSpinner className="h-4 w-4 mr-2" />
                                  Procesando...
                                </>
                              ) : (
                                <>
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Aprobar
                                </>
                              )}
                            </Button>
                            <Button 
                              size="sm" 
                              className="bg-red-600 hover:bg-red-700 text-white"
                              onClick={() => rechazarPago(pago.id)}
                              disabled={actionLoadingId === pago.id}
                            >
                              {actionLoadingId === pago.id ? (
                                <>
                                  <LoadingSpinner className="h-4 w-4 mr-2" />
                                  Procesando...
                                </>
                              ) : (
                                <>
                                  <XCircle className="h-4 w-4 mr-2" />
                                  Rechazar
                                </>
                              )}
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
            {!loading && pagosFiltrados.length === 0 && (
              <Card className="bg-gray-800 border-gray-700 mt-4">
                <CardContent className="p-12 text-center">
                  <CreditCard className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-white mb-2">No hay pagos</h3>
                  <p className="text-gray-400">No se encontraron pagos que coincidan con los filtros seleccionados</p>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </AdminSection>

      {/* Modal simple para ver detalles del pago */}
      {showModal && selectedPago && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowModal(false)} />
          <div className="relative bg-gray-900 border border-gray-700 rounded-xl shadow-2xl max-w-2xl w-full mx-4 p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-semibold text-white">Detalle del pago</h3>
                <p className="text-sm text-gray-400">{selectedPago.evento.nombre}</p>
              </div>
              <button
                className="text-gray-400 hover:text-white"
                onClick={() => setShowModal(false)}
                aria-label="Cerrar"
              >
                ×
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 text-sm">
                <div><span className="text-gray-400">Nombre: </span><span className="text-white">{selectedPago.participante.nombre}</span></div>
                <div><span className="text-gray-400">Teléfono: </span><span className="text-white">{selectedPago.participante.telefono}</span></div>
                {selectedPago.participante.cedula && (
                  <div><span className="text-gray-400">Cédula: </span><span className="text-white">{selectedPago.participante.cedula}</span></div>
                )}
                <div><span className="text-gray-400">Monto: </span><span className="text-white">{selectedPago.monto > 0 ? `$${selectedPago.monto.toLocaleString()}` : 'Gratis'}</span></div>
                <div><span className="text-gray-400">Método: </span><span className="text-white">{selectedPago.metodoPago}</span></div>
                <div><span className="text-gray-400">Referencia: </span><span className="text-white font-mono">{selectedPago.referencia}</span></div>
                <div><span className="text-gray-400">Tickets: </span><span className="text-white">{selectedPago.tickets.join(', ')}</span></div>
                <div><span className="text-gray-400">Fecha: </span><span className="text-white">{formatFecha(selectedPago.fechaCreacion)}</span></div>
              </div>
              <div className="flex items-center justify-center">
                {selectedPago.comprobante ? (
                  // Mostrar imagen del comprobante si es URL de imagen
                  <img src={selectedPago.comprobante} alt="Comprobante" className="max-h-64 rounded-lg border border-gray-700" />
                ) : (
                  <div className="text-gray-400 text-sm">Sin comprobante adjunto</div>
                )}
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              {selectedPago.estado === 'PENDIENTE' && (
                <>
                  <Button
                    className="bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => aprobarPago(selectedPago.id)}
                    disabled={actionLoadingId === selectedPago.id}
                  >
                    {actionLoadingId === selectedPago.id ? (
                      <>
                        <LoadingSpinner className="h-4 w-4 mr-2" />
                        Procesando...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Aprobar
                      </>
                    )}
                  </Button>
                  <Button
                    className="bg-red-600 hover:bg-red-700 text-white"
                    onClick={() => rechazarPago(selectedPago.id)}
                    disabled={actionLoadingId === selectedPago.id}
                  >
                    {actionLoadingId === selectedPago.id ? (
                      <>
                        <LoadingSpinner className="h-4 w-4 mr-2" />
                        Procesando...
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4 mr-2" />
                        Rechazar
                      </>
                    )}
                  </Button>
                </>
              )}
              <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700" onClick={() => setShowModal(false)}>
                Cerrar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
