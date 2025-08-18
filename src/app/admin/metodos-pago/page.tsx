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

    const inputClass = "w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 font-medium text-gray-700 placeholder-gray-400"

    switch (tipo) {
      case 'BANCO':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide">Banco</label>
              <Input
                placeholder="Ej: Banesco, Mercantil, Venezuela"
                value={datosObj.banco || ''}
                onChange={(e) => updateDatos('banco', e.target.value)}
                className={inputClass}
              />
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide">Número de Cuenta</label>
              <Input
                placeholder="0134-0123-45-1234567890"
                value={datosObj.numeroCuenta || ''}
                onChange={(e) => updateDatos('numeroCuenta', e.target.value)}
                className={inputClass}
              />
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide">Titular</label>
              <Input
                placeholder="Nombre del titular"
                value={datosObj.titular || ''}
                onChange={(e) => updateDatos('titular', e.target.value)}
                className={inputClass}
              />
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide">Tipo de Cuenta</label>
              <select
                value={datosObj.tipoCuenta || 'CORRIENTE'}
                onChange={(e) => updateDatos('tipoCuenta', e.target.value)}
                className={inputClass}
              >
                <option value="CORRIENTE">💼 Corriente</option>
                <option value="AHORRO">💰 Ahorro</option>
              </select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide">Cédula del Titular</label>
              <Input
                placeholder="V-12345678"
                value={datosObj.cedulaTitular || ''}
                onChange={(e) => updateDatos('cedulaTitular', e.target.value)}
                className={inputClass}
              />
            </div>
          </div>
        )

      case 'PAGO_MOVIL':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide">Banco</label>
              <Input
                placeholder="Ej: 0102 - Banco de Venezuela"
                value={datosObj.banco || ''}
                onChange={(e) => updateDatos('banco', e.target.value)}
                className={inputClass}
              />
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide">Teléfono</label>
              <Input
                placeholder="0412-1234567"
                value={datosObj.telefono || ''}
                onChange={(e) => updateDatos('telefono', e.target.value)}
                className={inputClass}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide">Cédula</label>
              <Input
                placeholder="V-12345678"
                value={datosObj.cedula || ''}
                onChange={(e) => updateDatos('cedula', e.target.value)}
                className={inputClass}
              />
            </div>
          </div>
        )

      case 'BILLETERA':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide">Usuario/Email</label>
              <Input
                placeholder="usuario@paypal.com"
                value={datosObj.usuario || ''}
                onChange={(e) => updateDatos('usuario', e.target.value)}
                className={inputClass}
              />
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide">Teléfono</label>
              <Input
                placeholder="0412-1234567"
                value={datosObj.telefono || ''}
                onChange={(e) => updateDatos('telefono', e.target.value)}
                className={inputClass}
              />
            </div>
          </div>
        )

      case 'CRIPTOMONEDA':
        return (
          <div className="grid grid-cols-1 gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide">Moneda</label>
                <Input
                  placeholder="BTC, ETH, USDT, BNB, etc."
                  value={datosObj.moneda || ''}
                  onChange={(e) => updateDatos('moneda', e.target.value)}
                  className={inputClass}
                />
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide">Red</label>
                <Input
                  placeholder="ERC20, TRC20, BEP20, etc."
                  value={datosObj.red || ''}
                  onChange={(e) => updateDatos('red', e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide">Dirección de Wallet</label>
              <Input
                placeholder="0x1A2B3C4D5E6F7A8B9C0D1E2F3A4B5C6D7E8F9A0B"
                value={datosObj.direccion || ''}
                onChange={(e) => updateDatos('direccion', e.target.value)}
                className={inputClass}
              />
            </div>
          </div>
        )

      default:
        return (
          <div className="space-y-2">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide">Información del Método (JSON)</label>
            <textarea
              placeholder='{"descripcion": "Información del método de pago"}'
              value={datos}
              onChange={(e) => onChange(e.target.value)}
              className={inputClass + " min-h-[120px]"}
              rows={6}
            />
          </div>
        )
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner />
        <p className="text-gray-600 font-medium mt-4">Cargando métodos de pago...</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">💳 Métodos de Pago</h1>
              <p className="text-gray-600 font-medium">Gestiona los métodos de pago disponibles para tus usuarios</p>
            </div>
            <Button 
              onClick={crearMetodo} 
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              <span className="flex items-center">
                ➕ Agregar Método
              </span>
            </Button>
          </div>
        </div>

        {/* Grid de métodos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {metodos.map((metodo) => (
            <div key={metodo.id} className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className={`p-4 ${metodo.activo ? 'bg-gradient-to-r from-green-500 to-green-600' : 'bg-gradient-to-r from-gray-400 to-gray-500'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-3xl bg-white bg-opacity-20 p-2 rounded-lg">{metodo.icono}</span>
                    <div>
                      <h3 className="font-bold text-white text-lg">{metodo.nombre}</h3>
                      <p className="text-white text-sm opacity-90">{metodo.tipo.replace('_', ' ')}</p>
                    </div>
                  </div>
                  <div className="flex flex-col space-y-1">
                    <Button
                      size="sm"
                      variant={metodo.activo ? "default" : "outline"}
                      onClick={() => toggleActivo(metodo.id, !metodo.activo)}
                      className={`text-xs px-2 py-1 ${metodo.activo ? 'bg-white text-green-600 hover:bg-gray-100' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
                    >
                      {metodo.activo ? '✅ Activo' : '⭕ Inactivo'}
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="p-4">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-600">
                    <p className="font-medium">Estado: <span className={metodo.activo ? 'text-green-600' : 'text-red-600'}>{metodo.activo ? 'Activo' : 'Inactivo'}</span></p>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => editarMetodo(metodo)}
                      className="text-blue-600 border-blue-200 hover:bg-blue-50"
                    >
                      ✏️
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => eliminarMetodo(metodo.id)}
                      className="text-red-600 border-red-200 hover:bg-red-50"
                    >
                      🗑️
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {metodos.length === 0 && (
            <div className="col-span-full text-center py-12">
              <div className="text-6xl mb-4">💳</div>
              <h3 className="text-xl font-bold text-gray-700 mb-2">No hay métodos de pago</h3>
              <p className="text-gray-500 mb-4">Agrega tu primer método de pago para comenzar</p>
              <Button 
                onClick={crearMetodo}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
              >
                ➕ Crear Primer Método
              </Button>
            </div>
          )}
        </div>
      </div>

      {editingMethod && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-screen overflow-y-auto">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 rounded-t-2xl">
              <h2 className="text-2xl font-bold text-white flex items-center">
                {isCreating ? '➕ Crear Método de Pago' : '✏️ Editar Método de Pago'}
              </h2>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-gray-800 uppercase tracking-wide">
                    Nombre del Método
                  </label>
                  <Input
                    placeholder="Ej: Banesco - Transferencia"
                    value={editingMethod.nombre || ''}
                    onChange={(e) => setEditingMethod({...editingMethod, nombre: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 font-medium text-gray-700"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-bold text-gray-800 uppercase tracking-wide">
                    Tipo de Método
                  </label>
                  <select
                    value={editingMethod.tipo || 'BANCO'}
                    onChange={(e) => setEditingMethod({...editingMethod, tipo: e.target.value as any})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 font-medium text-gray-700"
                  >
                    <option value="BANCO">🏦 Transferencia Bancaria</option>
                    <option value="PAGO_MOVIL">📱 Pago Móvil</option>
                    <option value="BILLETERA">💰 Billetera Digital</option>
                    <option value="CRIPTOMONEDA">₿ Criptomoneda</option>
                    <option value="OTRO">🔧 Otro</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-bold text-gray-800 uppercase tracking-wide">
                    Icono (Emoji)
                  </label>
                  <Input
                    placeholder="🏦"
                    value={editingMethod.icono || ''}
                    onChange={(e) => setEditingMethod({...editingMethod, icono: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 font-medium text-gray-700 text-center text-2xl"
                  />
                </div>

                <div className="flex items-center space-x-3">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingMethod.activo || false}
                      onChange={(e) => setEditingMethod({...editingMethod, activo: e.target.checked})}
                      className="w-5 h-5 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 focus:ring-2"
                    />
                    <span className="font-bold text-gray-800">Método Activo</span>
                  </label>
                </div>
              </div>

              <div className="border-t pt-6">
                <label className="block text-sm font-bold text-gray-800 uppercase tracking-wide mb-4">
                  📋 Información del Método
                </label>
                {renderFormularioDatos(
                  editingMethod.tipo || 'BANCO',
                  editingMethod.datos || '{}',
                  (datos) => setEditingMethod({...editingMethod, datos})
                )}
              </div>
            </div>

            <div className="flex space-x-3 p-6 bg-gray-50 rounded-b-2xl">
              <Button 
                onClick={guardarMetodo} 
                className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                💾 Guardar
              </Button>
              <Button 
                onClick={() => setEditingMethod(null)}
                variant="outline"
                className="flex-1 border-2 border-gray-300 hover:bg-gray-100 font-bold py-3 px-6 rounded-lg transition-all duration-200"
              >
                ❌ Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
