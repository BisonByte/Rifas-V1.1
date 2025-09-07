'use client'

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { get, post, put, del } from '@/lib/api-client'
import { AdminHeader } from '@/features/admin/ui/AdminHeader'

interface MetodoPago {
  id: string
  nombre: string
  tipo: 'BANCO' | 'PAGO_MOVIL' | 'BILLETERA' | 'CRIPTOMONEDA' | 'OTRO'
  icono: string
  imagen?: string
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
      const data = await get('/api/admin/metodos-pago')
      setMetodos((data as any)?.success ? (data as any).data : (data as MetodoPago[]))
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
  icono: '',
  imagen: '',
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
      // Validaciones mínimas para evitar guardar datos incompletos
      const nombreOk = (editingMethod.nombre || '').trim().length > 0
      if (!nombreOk) {
        alert('El nombre del método es obligatorio. Ej: Zelle')
        return
      }

      if ((editingMethod.tipo || 'BANCO') === 'BILLETERA') {
        let datosObj: any = {}
        try { datosObj = JSON.parse(editingMethod.datos || '{}') } catch {}
        const email = (datosObj.email || datosObj.usuario || '').trim()
        const tel = (datosObj.telefono || '').trim()
        if (!email && !tel) {
          alert('Para Billetera Digital (Zelle), ingresa Email o Teléfono (al menos uno).')
          return
        }
      }

      const url = '/api/admin/metodos-pago'

      if (isCreating) {
        await post(url, editingMethod)
      } else {
        await put(url, editingMethod)
      }

      alert(isCreating ? 'Método creado exitosamente' : 'Método actualizado exitosamente')
      setEditingMethod(null)
      cargarMetodos()
    } catch (error: any) {
      console.error('Error guardando método:', error)
      const message = error?.message || 'Error guardando método'
      // Si viene del API, nuestro cliente ya intenta extraer message/error
      alert(message)
    }
  }

  const toggleActivo = async (id: string, activo: boolean) => {
    try {
      await put('/api/admin/metodos-pago', { id, activo })
      cargarMetodos()
    } catch (error) {
      console.error('Error actualizando estado:', error)
    }
  }

  const eliminarMetodo = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este método de pago?')) return

    try {
      await del(`/api/admin/metodos-pago?id=${id}`)
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

  const inputClass = "w-full px-4 py-3 bg-slate-800/60 border border-slate-600/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-200 placeholder-slate-400"

    switch (tipo) {
      case 'BANCO':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-300 uppercase tracking-wide">Banco</label>
              <Input
                placeholder="Ej: Banesco, Mercantil, Venezuela"
                value={datosObj.banco || ''}
                onChange={(e) => updateDatos('banco', e.target.value)}
                className={inputClass}
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-300 uppercase tracking-wide">Número de Cuenta</label>
              <Input
                placeholder="0134-0123-45-1234567890"
                value={datosObj.numeroCuenta || ''}
                onChange={(e) => updateDatos('numeroCuenta', e.target.value)}
                className={inputClass}
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-300 uppercase tracking-wide">Titular</label>
              <Input
                placeholder="Nombre del titular"
                value={datosObj.titular || ''}
                onChange={(e) => updateDatos('titular', e.target.value)}
                className={inputClass}
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-300 uppercase tracking-wide">Tipo de Cuenta</label>
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
              <label className="block text-sm font-semibold text-slate-300 uppercase tracking-wide">Cédula del Titular</label>
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
              <label className="block text-sm font-semibold text-slate-300 uppercase tracking-wide">Banco</label>
              <Input
                placeholder="Ej: 0102 - Banco de Venezuela"
                value={datosObj.banco || ''}
                onChange={(e) => updateDatos('banco', e.target.value)}
                className={inputClass}
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-300 uppercase tracking-wide">Teléfono</label>
              <Input
                placeholder="0412-1234567"
                value={datosObj.telefono || ''}
                onChange={(e) => updateDatos('telefono', e.target.value)}
                className={inputClass}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="block text-sm font-semibold text-slate-300 uppercase tracking-wide">Cédula</label>
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
              <label className="block text-sm font-semibold text-slate-300 uppercase tracking-wide">Usuario/Email</label>
              <Input
                placeholder="usuario@billetera.com"
                value={datosObj.usuario || ''}
                onChange={(e) => updateDatos('usuario', e.target.value)}
                className={inputClass}
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-300 uppercase tracking-wide">Teléfono</label>
              <Input
                placeholder="0412-1234567"
                value={datosObj.telefono || ''}
                onChange={(e) => updateDatos('telefono', e.target.value)}
                className={inputClass}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="block text-sm font-semibold text-slate-300 uppercase tracking-wide">Moneda a mostrar</label>
              <select
                value={datosObj.monedaVisual || ''}
                onChange={(e) => updateDatos('monedaVisual', e.target.value)}
                className={inputClass}
              >
                <option value="">Automático (según tipo)</option>
                <option value="VES">Bolívares (VES)</option>
                <option value="USD">Dólares (USD)</option>
              </select>
              <p className="text-xs text-slate-400">Si eliges USD se mostrará el precio en dólares (requiere precioUSD en la rifa).</p>
            </div>
          </div>
        )

      case 'CRIPTOMONEDA':
        return (
          <div className="grid grid-cols-1 gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-300 uppercase tracking-wide">Moneda</label>
                <Input
                  placeholder="BTC, ETH, Tether, BNB, etc."
                  value={datosObj.moneda || ''}
                  onChange={(e) => updateDatos('moneda', e.target.value)}
                  className={inputClass}
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-300 uppercase tracking-wide">Red</label>
                <Input
                  placeholder="ERC20, TRC20, BEP20, etc."
                  value={datosObj.red || ''}
                  onChange={(e) => updateDatos('red', e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-300 uppercase tracking-wide">Dirección de Wallet</label>
              <Input
                placeholder="0x1A2B3C4D5E6F7A8B9C0D1E2F3A4B5C6D7E8F9A0B"
                value={datosObj.direccion || ''}
                onChange={(e) => updateDatos('direccion', e.target.value)}
                className={inputClass}
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-300 uppercase tracking-wide">Moneda a mostrar</label>
              <select
                value={datosObj.monedaVisual || 'USD'}
                onChange={(e) => updateDatos('monedaVisual', e.target.value)}
                className={inputClass}
              >
                <option value="">Automático (USD)</option>
                <option value="VES">Bolívares (VES)</option>
                <option value="USD">Dólares (USD)</option>
              </select>
            </div>
          </div>
        )

      default:
        return (
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-300 uppercase tracking-wide">Información del Método (JSON)</label>
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
    <div className="p-12 flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner />
        <p className="text-slate-300 font-medium mt-4">Cargando métodos de pago...</p>
      </div>
    </div>
  )

  return (
    <div>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <AdminHeader
          title="💳 Métodos de Pago"
          description="Gestiona los métodos de pago disponibles para tus usuarios"
          right={<Button onClick={crearMetodo} className="btn-shine">➕ Agregar Método</Button>}
        />

        {/* Grid de métodos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {metodos.map((metodo) => (
            <Card key={metodo.id} className="overflow-hidden transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-xl">
              <div className={`p-4 ${metodo.activo ? 'bg-gradient-to-r from-emerald-600 to-green-700' : 'bg-slate-700/70'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {metodo.imagen ? (
                      <img src={metodo.imagen} alt={metodo.nombre} className="w-10 h-10 object-contain bg-white/10 p-1 rounded-lg" />
                    ) : (
                      <span className="text-3xl bg-white/10 p-2 rounded-lg">{metodo.icono || '💳'}</span>
                    )}
                    <div>
                      <h3 className="font-semibold text-white text-lg truncate">{metodo.nombre}</h3>
                      <p className="text-white/80 text-xs">{metodo.tipo.replace('_', ' ')}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleActivo(metodo.id, !metodo.activo)}
                    className={`text-xs px-2 py-1 rounded-md border backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-emerald-400/30 ${metodo.activo ? 'bg-white/20 text-white border-white/20' : 'bg-slate-800/50 text-slate-300 border-slate-600/40'}`}
                  >
                    {metodo.activo ? 'Desactivar' : 'Reactivar'}
                  </button>
                </div>
              </div>
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="text-sm text-slate-300">
                    Estado: <span className={metodo.activo ? 'text-emerald-400' : 'text-red-400'}>{metodo.activo ? 'Activo' : 'Inactivo'}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => editarMetodo(metodo)} className="border-slate-600/50 text-slate-200 hover:bg-slate-700/40">✏️</Button>
                    <Button size="sm" variant="outline" onClick={() => eliminarMetodo(metodo.id)} className="border-red-600/40 text-red-300 hover:bg-red-600/10">🗑️</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {metodos.length === 0 && (
            <div className="col-span-full text-center py-12 text-slate-300">
              <div className="text-6xl mb-4">💳</div>
              <h3 className="text-xl font-semibold mb-2">No hay métodos de pago</h3>
              <p className="opacity-80 mb-4">Agrega tu primer método de pago para comenzar</p>
              <Button 
                onClick={crearMetodo}
                className=""
              >
                ➕ Crear Primer Método
              </Button>
            </div>
          )}
        </div>
      </div>

      {editingMethod && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-screen overflow-y-auto border border-slate-700/50 scrollbar-modern">
            <div className="bg-gradient-to-r from-emerald-600 to-green-700 px-6 py-4 rounded-t-2xl">
              <h2 className="text-2xl font-bold text-white">
                {isCreating ? '➕ Crear Método de Pago' : '✏️ Editar Método de Pago'}
              </h2>
            </div>
            
            <div className="p-6 space-y-6 text-slate-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-300 uppercase tracking-wide">
                    Nombre del Método
                  </label>
                  <Input
                    placeholder={editingMethod?.tipo === 'BILLETERA' ? 'Ej: Zelle' : 'Ej: Banesco - Transferencia'}
                    value={editingMethod.nombre || ''}
                    onChange={(e) => setEditingMethod({...editingMethod, nombre: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-800/60 border border-slate-600/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-200 placeholder-slate-400"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-300 uppercase tracking-wide">
                    Tipo de Método
                  </label>
                  <select
                    value={editingMethod.tipo || 'BANCO'}
                    onChange={(e) => setEditingMethod({...editingMethod, tipo: e.target.value as any})}
                    className="w-full px-4 py-3 bg-slate-800/60 border border-slate-600/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-200"
                  >
                    <option value="BANCO">🏦 Transferencia Bancaria</option>
                    <option value="PAGO_MOVIL">📱 Pago Móvil</option>
                    <option value="BILLETERA">💰 Billetera Digital</option>
                    <option value="CRIPTOMONEDA">₿ Criptomoneda</option>
                    <option value="OTRO">🔧 Otro</option>
                  </select>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-300 uppercase tracking-wide">
                    Icono (Emoji o Imagen) <span className="normal-case text-slate-400">(Opcional)</span>
                  </label>
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="w-12 h-12 rounded-lg border border-slate-700 bg-slate-800/60 flex items-center justify-center">
                      {editingMethod.imagen ? (
                        <img src={editingMethod.imagen} alt="Icono" className="max-w-full max-h-full object-contain" />
                      ) : editingMethod.icono ? (
                        <span className="text-2xl leading-none">{editingMethod.icono}</span>
                      ) : (
                        <span className="text-slate-500 text-xs">Sin icono</span>
                      )}
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0]
                        if (!file) return
                        const fd = new FormData()
                        fd.append('file', file)
                        try {
                          const res = await post('/api/upload', fd as any)
                          const url = (res as any)?.url || (res as any)?.data?.url
                          if (url) {
                            setEditingMethod({ ...editingMethod, imagen: url })
                          }
                        } catch (err) {
                          console.error('Error subiendo imagen de icono:', err)
                          alert('Error subiendo la imagen. Intenta con otra.')
                        } finally {
                          e.currentTarget.value = ''
                        }
                      }}
                      className="block text-sm text-transparent shrink-0 file:mr-2 file:py-2 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-emerald-600 file:text-white hover:file:bg-emerald-700"
                    />
                    {editingMethod.imagen && (
                      <Button
                        variant="outline"
                        onClick={() => setEditingMethod({ ...editingMethod, imagen: '' })}
                        className="border-slate-600/50 text-slate-200 hover:bg-slate-700/40"
                      >
                        Quitar imagen
                      </Button>
                    )}
                    <div className="flex items-center gap-2 ml-auto">
                      <label className="flex items-center gap-2 cursor-pointer text-slate-200">
                        <input
                          type="checkbox"
                          checked={editingMethod.activo || false}
                          onChange={(e) => setEditingMethod({ ...editingMethod, activo: e.target.checked })}
                          className="w-4 h-4 text-emerald-500 bg-slate-800 border-slate-600 rounded focus:ring-emerald-500 focus:ring-2"
                        />
                        <span className="text-sm font-medium">Método Activo</span>
                      </label>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Input
                      placeholder="Ej: 🏦"
                      value={editingMethod.icono || ''}
                      onChange={(e) => setEditingMethod({ ...editingMethod, icono: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-800/60 border border-slate-600/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-200 placeholder-slate-400"
                    />
                    <p className="text-xs text-slate-400">Si subes imagen, el emoji es opcional. Puedes dejar ambos en blanco.</p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <label className="block text-sm font-semibold text-slate-300 uppercase tracking-wide mb-4">
                  📋 Información del Método
                </label>
                {renderFormularioDatos(
                  editingMethod.tipo || 'BANCO',
                  editingMethod.datos || '{}',
                  (datos) => setEditingMethod({...editingMethod, datos})
                )}
              </div>
            </div>

            <div className="flex space-x-3 p-6 bg-slate-800/40 rounded-b-2xl">
              <Button 
                onClick={guardarMetodo} 
                className="flex-1 btn-shine"
              >
                💾 Guardar
              </Button>
              <Button 
                onClick={() => setEditingMethod(null)}
                variant="outline"
                className="flex-1 border-slate-600/50 text-slate-200 hover:bg-slate-700/40"
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
