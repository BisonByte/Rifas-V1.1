'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/badge'
import { 
  Plus,
  CreditCard,
  Smartphone,
  Building2,
  Edit,
  Trash2,
  ToggleLeft,
  ToggleRight
} from 'lucide-react'

interface MetodoPago {
  id: string
  nombre: string
  tipo: 'TRANSFERENCIA' | 'PAGO_MOVIL' | 'EFECTIVO' | 'CRIPTOMONEDA'
  descripcion: string
  datos: {
    banco?: string
    numeroCuenta?: string
    cedula?: string
    telefono?: string
    direccionWallet?: string
  }
  activo: boolean
  fechaCreacion: string
}

export default function MetodosPagoPage() {
  const [metodosPago, setMetodosPago] = useState<MetodoPago[]>([
    {
      id: '1',
      nombre: 'Banesco - Transferencia',
      tipo: 'TRANSFERENCIA',
      descripcion: 'Cuenta corriente principal',
      datos: {
        banco: 'Banesco',
        numeroCuenta: '0134-0123-45-1234567890',
        cedula: 'V-12345678'
      },
      activo: true,
      fechaCreacion: '2025-01-15T10:30:00Z'
    },
    {
      id: '2',
      nombre: 'Pago Móvil',
      tipo: 'PAGO_MOVIL',
      descripcion: 'Pago móvil interbancario',
      datos: {
        banco: 'Banesco',
        telefono: '0424-123-4567',
        cedula: 'V-12345678'
      },
      activo: true,
      fechaCreacion: '2025-01-15T10:35:00Z'
    },
    {
      id: '3',
      nombre: 'USDT TRC-20',
      tipo: 'CRIPTOMONEDA',
      descripción: 'Wallet de Tether en red Tron',
      datos: {
        direccionWallet: 'TQn9Y2khEsLJW1ChVWFMSMeRDow5KcbLSE'
      },
      activo: false,
      fechaCreacion: '2025-02-01T14:20:00Z'
    }
  ])

  const getIconoTipo = (tipo: string) => {
    switch (tipo) {
      case 'TRANSFERENCIA':
        return <Building2 className="h-6 w-6 text-blue-500" />
      case 'PAGO_MOVIL':
        return <Smartphone className="h-6 w-6 text-green-500" />
      case 'EFECTIVO':
        return <CreditCard className="h-6 w-6 text-yellow-500" />
      case 'CRIPTOMONEDA':
        return <CreditCard className="h-6 w-6 text-purple-500" />
      default:
        return <CreditCard className="h-6 w-6 text-gray-500" />
    }
  }

  const toggleActivo = (id: string) => {
    setMetodosPago(metodosPago.map(metodo => 
      metodo.id === id ? { ...metodo, activo: !metodo.activo } : metodo
    ))
  }

  const formatearDatos = (metodo: MetodoPago) => {
    const { datos, tipo } = metodo
    
    switch (tipo) {
      case 'TRANSFERENCIA':
        return (
          <div className="space-y-1 text-sm">
            <p><span className="text-gray-400">Banco:</span> <span className="text-white">{datos.banco}</span></p>
            <p><span className="text-gray-400">Cuenta:</span> <span className="text-white font-mono">{datos.numeroCuenta}</span></p>
            <p><span className="text-gray-400">Cédula:</span> <span className="text-white">{datos.cedula}</span></p>
          </div>
        )
      case 'PAGO_MOVIL':
        return (
          <div className="space-y-1 text-sm">
            <p><span className="text-gray-400">Banco:</span> <span className="text-white">{datos.banco}</span></p>
            <p><span className="text-gray-400">Teléfono:</span> <span className="text-white">{datos.telefono}</span></p>
            <p><span className="text-gray-400">Cédula:</span> <span className="text-white">{datos.cedula}</span></p>
          </div>
        )
      case 'CRIPTOMONEDA':
        return (
          <div className="space-y-1 text-sm">
            <p><span className="text-gray-400">Dirección:</span></p>
            <p className="text-white font-mono text-xs break-all">{datos.direccionWallet}</p>
          </div>
        )
      default:
        return <p className="text-gray-400 text-sm">Sin datos específicos</p>
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Métodos de Pago</h1>
          <p className="text-gray-400 mt-1">Configura los métodos de pago disponibles</p>
        </div>
        <Button className="bg-teal-600 hover:bg-teal-700 text-white">
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Método
        </Button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-white">{metodosPago.length}</p>
                <p className="text-sm text-gray-400">Total Métodos</p>
              </div>
              <CreditCard className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-green-500">{metodosPago.filter(m => m.activo).length}</p>
                <p className="text-sm text-gray-400">Activos</p>
              </div>
              <ToggleRight className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-400">{metodosPago.filter(m => !m.activo).length}</p>
                <p className="text-sm text-gray-400">Inactivos</p>
              </div>
              <ToggleLeft className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-blue-500">{metodosPago.filter(m => m.tipo === 'TRANSFERENCIA').length}</p>
                <p className="text-sm text-gray-400">Transferencias</p>
              </div>
              <Building2 className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de métodos de pago */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {metodosPago.map((metodo) => (
          <Card key={metodo.id} className="bg-gray-800 border-gray-700">
            <CardHeader className="border-b border-gray-700">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  {getIconoTipo(metodo.tipo)}
                  <div>
                    <CardTitle className="text-white text-lg">{metodo.nombre}</CardTitle>
                    <p className="text-gray-400 text-sm">{metodo.descripcion}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={`${metodo.activo ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'}`}>
                    {metodo.activo ? 'Activo' : 'Inactivo'}
                  </Badge>
                  <Badge variant="outline" className="border-gray-600 text-gray-300">
                    {metodo.tipo.replace('_', ' ')}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              {/* Datos del método */}
              <div>
                <h4 className="text-white font-medium mb-2">Información de Pago</h4>
                {formatearDatos(metodo)}
              </div>

              {/* Acciones */}
              <div className="flex items-center justify-between pt-2 border-t border-gray-700">
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700">
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Eliminar
                  </Button>
                </div>
                <Button
                  size="sm"
                  onClick={() => toggleActivo(metodo.id)}
                  className={`${
                    metodo.activo 
                      ? 'bg-gray-600 hover:bg-gray-700 text-white' 
                      : 'bg-green-600 hover:bg-green-700 text-white'
                  }`}
                >
                  {metodo.activo ? <ToggleLeft className="h-4 w-4 mr-2" /> : <ToggleRight className="h-4 w-4 mr-2" />}
                  {metodo.activo ? 'Desactivar' : 'Activar'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Estado vacío */}
      {metodosPago.length === 0 && (
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-12 text-center">
            <CreditCard className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-white mb-2">No hay métodos de pago</h3>
            <p className="text-gray-400 mb-6">Comienza agregando tu primer método de pago</p>
            <Button className="bg-teal-600 hover:bg-teal-700 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Agregar Método
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
