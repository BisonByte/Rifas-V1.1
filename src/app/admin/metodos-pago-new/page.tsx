'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

interface MetodoPago {
  id: string
  nombre: string
  tipo: 'BANCO' | 'PAGO_MOVIL' | 'BILLETERA' | 'CRIPTOMONEDA' | 'OTRO'
  icono: string
  activo: boolean
  datos: string
}

export default function MetodosPagoPage() {
  const [metodos, setMetodos] = useState<MetodoPago[]>([])
  const [loading, setLoading] = useState(true)
  const [editingMethod, setEditingMethod] = useState<Partial<MetodoPago> | null>(null)
  const [isCreating, setIsCreating] = useState(false)

  useEffect(() => {
    cargarMetodos()
  }, [])

  const cargarMetodos = async () => {
    try {
      const response = await fetch('/api/admin/metodos-pago')
      const data = await response.json()
      setMetodos(data)
    } catch (error) {
      console.error('Error cargando métodos de pago:', error)
    } finally {
      setLoading(false)
    }
  }

  const crearMetodo = () => {
    setEditingMethod({
      nombre: '',
      tipo: 'BANCO',
      icono: '🏦',
      activo: true,
      datos: '{}'
    })
    setIsCreating(true)
  }

  const editarMetodo = (metodo: MetodoPago) => {
    setEditingMethod(metodo)
    setIsCreating(false)
  }

  const guardarMetodo = async () => {
    if (!editingMethod) return

    try {
      const method = isCreating ? 'POST' : 'PUT'
      const url = '/api/admin/metodos-pago'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingMethod)
      })

      if (response.ok) {
        alert(isCreating ? 'Método creado exitosamente' : 'Método actualizado exitosamente')
        setEditingMethod(null)
        cargarMetodos()
      }
    } catch (error) {
      console.error('Error guardando método:', error)
      alert('Error guardando método')
    }
  }

  const toggleActivo = async (id: string, activo: boolean) => {
    try {
      await fetch('/api/admin/metodos-pago', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, activo })
      })
      cargarMetodos()
    } catch (error) {
      console.error('Error actualizando estado:', error)
    }
  }

  const eliminarMetodo = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este método de pago?')) return

    try {
      await fetch(`/api/admin/metodos-pago?id=${id}`, {
        method: 'DELETE'
      })
      alert('Método eliminado exitosamente')
      cargarMetodos()
    } catch (error) {
      console.error('Error eliminando método:', error)
      alert('Error eliminando método')
    }
  }

  const renderFormularioDatos = (tipo: string, datos: string, onChange: (datos: string) => void) => {
    let datosObj: any = {}
    try {
      datosObj = JSON.parse(datos)
    } catch {}

    const updateDatos = (key: string, value: string) => {
      const newDatos = { ...datosObj, [key]: value }
      onChange(JSON.stringify(newDatos))
    }

    switch (tipo) {
      case 'BANCO':
        return (
          <div className="space-y-3">
            <Input
              placeholder="Nombre del banco"
              value={datosObj.banco || ''}
              onChange={(e) => updateDatos('banco', e.target.value)}
            />
            <Input
              placeholder="Número de cuenta"
              value={datosObj.numeroCuenta || ''}
              onChange={(e) => updateDatos('numeroCuenta', e.target.value)}
            />
            <Input
              placeholder="Titular de la cuenta"
              value={datosObj.titular || ''}
              onChange={(e) => updateDatos('titular', e.target.value)}
            />
            <select
              value={datosObj.tipoCuenta || 'CORRIENTE'}
              onChange={(e) => updateDatos('tipoCuenta', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="CORRIENTE">Corriente</option>
              <option value="AHORRO">Ahorro</option>
            </select>
            <Input
              placeholder="Cédula del titular"
              value={datosObj.cedulaTitular || ''}
              onChange={(e) => updateDatos('cedulaTitular', e.target.value)}
            />
          </div>
        )

      case 'PAGO_MOVIL':
        return (
          <div className="space-y-3">
            <Input
              placeholder="Banco"
              value={datosObj.banco || ''}
              onChange={(e) => updateDatos('banco', e.target.value)}
            />
            <Input
              placeholder="Teléfono"
              value={datosObj.telefono || ''}
              onChange={(e) => updateDatos('telefono', e.target.value)}
            />
            <Input
              placeholder="Cédula"
              value={datosObj.cedula || ''}
              onChange={(e) => updateDatos('cedula', e.target.value)}
            />
          </div>
        )

      case 'BILLETERA':
        return (
          <div className="space-y-3">
            <Input
              placeholder="Usuario/Email"
              value={datosObj.usuario || ''}
              onChange={(e) => updateDatos('usuario', e.target.value)}
            />
            <Input
              placeholder="Teléfono"
              value={datosObj.telefono || ''}
              onChange={(e) => updateDatos('telefono', e.target.value)}
            />
          </div>
        )

      case 'CRIPTOMONEDA':
        return (
          <div className="space-y-3">
            <Input
              placeholder="Moneda (BTC, ETH, USDT, etc.)"
              value={datosObj.moneda || ''}
              onChange={(e) => updateDatos('moneda', e.target.value)}
            />
            <Input
              placeholder="Dirección de wallet"
              value={datosObj.direccion || ''}
              onChange={(e) => updateDatos('direccion', e.target.value)}
            />
            <Input
              placeholder="Red (ERC20, TRC20, BEP20, etc.)"
              value={datosObj.red || ''}
              onChange={(e) => updateDatos('red', e.target.value)}
            />
          </div>
        )

      default:
        return (
          <textarea
            placeholder="Información del método de pago (JSON)"
            value={datos}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            rows={4}
          />
        )
    }
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Métodos de Pago</h1>
        <Button onClick={crearMetodo} className="bg-green-600 hover:bg-green-700">
          + Agregar Método
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {metodos.map((metodo) => (
          <Card key={metodo.id} className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">{metodo.icono}</span>
                <h3 className="font-semibold">{metodo.nombre}</h3>
              </div>
              <div className="flex space-x-1">
                <Button
                  size="sm"
                  variant={metodo.activo ? "default" : "outline"}
                  onClick={() => toggleActivo(metodo.id, !metodo.activo)}
                >
                  {metodo.activo ? '✓' : '○'}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => editarMetodo(metodo)}
                >
                  ✏️
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => eliminarMetodo(metodo.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  🗑️
                </Button>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-2">Tipo: {metodo.tipo}</p>
            <p className="text-xs text-gray-500">
              Estado: {metodo.activo ? 'Activo' : 'Inactivo'}
            </p>
          </Card>
        ))}
      </div>

      {editingMethod && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-4">
              {isCreating ? 'Crear Método de Pago' : 'Editar Método de Pago'}
            </h2>
            
            <div className="space-y-4">
              <Input
                placeholder="Nombre del método"
                value={editingMethod.nombre || ''}
                onChange={(e) => setEditingMethod({...editingMethod, nombre: e.target.value})}
              />

              <select
                value={editingMethod.tipo || 'BANCO'}
                onChange={(e) => setEditingMethod({...editingMethod, tipo: e.target.value as any})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="BANCO">Transferencia Bancaria</option>
                <option value="PAGO_MOVIL">Pago Móvil</option>
                <option value="BILLETERA">Billetera Digital</option>
                <option value="CRIPTOMONEDA">Criptomoneda</option>
                <option value="OTRO">Otro</option>
              </select>

              <Input
                placeholder="Icono (emoji)"
                value={editingMethod.icono || ''}
                onChange={(e) => setEditingMethod({...editingMethod, icono: e.target.value})}
              />

              <div>
                <label className="block text-sm font-medium mb-2">Información del método:</label>
                {renderFormularioDatos(
                  editingMethod.tipo || 'BANCO',
                  editingMethod.datos || '{}',
                  (datos) => setEditingMethod({...editingMethod, datos})
                )}
              </div>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={editingMethod.activo || false}
                  onChange={(e) => setEditingMethod({...editingMethod, activo: e.target.checked})}
                />
                <span>Método activo</span>
              </label>
            </div>

            <div className="flex space-x-2 mt-6">
              <Button onClick={guardarMetodo} className="flex-1 bg-blue-600 hover:bg-blue-700">
                Guardar
              </Button>
              <Button 
                onClick={() => setEditingMethod(null)}
                variant="outline"
                className="flex-1"
              >
                Cancelar
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
