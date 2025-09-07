'use client'

import { useState, useEffect } from 'react'
import { formatCurrencyFlexible } from '@/lib/utils'
import { get } from '@/lib/api-client'

interface MetodoPago {
  id: string
  nombre: string
  tipo: string
  activo: boolean
  icono?: string
  imagen?: string
  datos: string
}

type PaymentMethodsProps = {
  total?: number
  usdTotal?: number
  ticketsCount?: number
  selectedId?: string
  onSelect?: (id: string) => void
}

export function PaymentMethods({ total, usdTotal, ticketsCount, selectedId, onSelect }: PaymentMethodsProps = {}) {
  const [metodos, setMetodos] = useState<MetodoPago[]>([])
  const [selectedMethod, setSelectedMethod] = useState<string>('')
  const [copyStates, setCopyStates] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    get('/api/metodos-pago')
      .then((json: any) => {
        const data = json?.success ? json.data : json
        setMetodos(Array.isArray(data) ? data.filter((m: MetodoPago) => m.activo) : [])
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const norm = (s: string) =>
    (s || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toUpperCase()
      .replace(/\s+/g, '_')

  const copy = async (text?: string, key?: string) => {
    if (!text || !key) return
    
    try {
      await navigator.clipboard.writeText(String(text))
      setCopyStates(prev => ({ ...prev, [key]: true }))
      
      // Reset copy state after 2 seconds
      setTimeout(() => {
        setCopyStates(prev => ({ ...prev, [key]: false }))
      }, 2000)
    } catch (error) {
      console.error('Error copying to clipboard:', error)
    }
  }

  const currentSelected = typeof selectedId === 'string' ? selectedId : selectedMethod

  const handleToggle = (id: string) => {
    const next = currentSelected === id ? '' : id
    if (onSelect) {
      onSelect(next)
    } else {
      setSelectedMethod(next)
    }
  }

  const renderPaymentDetails = (metodo: MetodoPago) => {
    try {
      const datos = JSON.parse(metodo.datos)
      const tipo = norm(metodo.tipo)
      const preferred = (datos?.monedaVisual || '').toString().toUpperCase()
      const typeSuggestsDollar = tipo === 'BILLETERA' || tipo === 'CRIPTOMONEDA'
      const isDollar = preferred === 'USD' ? true : preferred === 'VES' ? false : typeSuggestsDollar
      const amount = isDollar ? (usdTotal ?? total) : total
      
  const CopyButton = ({ value, copyKey }: { value: string; copyKey: string }) => {
        const isCopied = copyStates[copyKey]
        return (
          <button 
            onClick={() => copy(value, copyKey)} 
            className={`
      whitespace-nowrap px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-medium transition-all duration-300 transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-amber-400/30
              ${isCopied 
                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
                : 'bg-amber-400 text-amber-900 hover:bg-amber-300 shadow-md hover:shadow-lg'
              }
            `}
            disabled={isCopied}
          >
            {isCopied ? (
              <span className="flex items-center space-x-1">
                <span>✔️</span>
                <span>Copiado</span>
              </span>
            ) : (
              <span className="flex items-center space-x-1">
                <span>📋</span>
                <span>Copiar</span>
              </span>
            )}
          </button>
        )
      }
      
      const Brand = (
        <div className="flex flex-col items-center mb-3">
          <div className="relative group">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-white to-gray-50 flex items-center justify-center shadow-lg border border-gray-100 group-hover:shadow-xl transition-all duration-300">
              {metodo.imagen ? (
                <img 
                  src={metodo.imagen} 
                  alt={metodo.nombre} 
                  className="max-w-14 max-h-14 object-contain transition-transform duration-300 group-hover:scale-110" 
                />
              ) : metodo.icono ? (
                <span className="text-4xl transition-transform duration-300 group-hover:scale-110">{metodo.icono}</span>
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500"></div>
              )}
            </div>
            <div className="absolute -top-1 -right-1 bg-emerald-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center shadow-md animate-pulse">
              <span className="text-xs">✔️</span>
            </div>
          </div>
          <div className="mt-3 text-center">
            <p className="text-sm font-semibold tracking-wide text-gray-800">{metodo.nombre}</p>
          </div>
        </div>
      )

      const TotalPill = amount && amount > 0 ? (
        <div className="mt-3 sm:mt-4 flex justify-center">
          <div className="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-gradient-to-r from-gray-800 to-gray-900 text-white text-xs sm:text-sm font-medium shadow-lg border border-gray-700">
            <span className="mr-1 sm:mr-2">💰</span>
            <span className="font-bold">Total: {formatCurrencyFlexible(amount, isDollar ? { code: 'USD', locale: 'en-US', symbol: '$', position: 'prefix' } : { code: 'VES', locale: 'es-VE', symbol: 'Bs.S', position: 'prefix' })}</span>
            {typeof ticketsCount === 'number' && ticketsCount > 0 && (
              <span className="ml-2 px-2 py-0.5 rounded-full bg-yellow-500 text-black text-[10px] sm:text-xs font-semibold">
                {ticketsCount} ticket{ticketsCount === 1 ? '' : 's'}
              </span>
            )}
          </div>
        </div>
      ) : null
      
      switch (tipo) {
        case 'BANCO':
          return (
            <div className="mt-3 p-5 sm:p-6 bg-gradient-to-br from-white via-gray-50 to-white text-gray-800 rounded-2xl shadow-xl border border-gray-100 transform transition-all duration-500 hover:shadow-2xl">
              {Brand}
              <div className="space-y-3 sm:space-y-4">
                <div className="text-center">
                  <p className="text-xs font-bold tracking-wide sm:tracking-widest text-gray-500 uppercase mb-1">Banco</p>
                  <p className="text-lg font-bold text-gray-800">{datos.banco}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 sm:p-4 border border-gray-100">
                  <p className="text-xs font-bold tracking-wide sm:tracking-widest text-gray-500 uppercase mb-1 sm:mb-2">Número de Cuenta</p>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-3">
                    <p className="text-lg md:text-xl leading-tight font-mono font-bold tracking-wide text-gray-900 break-all flex-1 min-w-0">{datos.numeroCuenta}</p>
                    <CopyButton value={datos.numeroCuenta} copyKey={`cuenta-${metodo.id}`} />
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:gap-4">
                  <div className="bg-gray-50 rounded-xl p-3 sm:p-4 border border-gray-100">
                    <div className="flex items-center justify-between gap-2 sm:gap-3">
                      <div className="flex-1">
                        <p className="text-xs font-bold tracking-wide sm:tracking-widest text-gray-500 uppercase mb-1">Cédula</p>
                        <p className="text-lg font-mono font-bold text-gray-900">{datos.cedulaTitular}</p>
                      </div>
                      <CopyButton value={datos.cedulaTitular} copyKey={`cedula-${metodo.id}`} />
                    </div>
                  </div>
                  {datos.titular && (
                    <div className="text-center">
                      <p className="text-xs font-bold tracking-wide sm:tracking-widest text-gray-500 uppercase mb-1">Titular</p>
                      <p className="text-base font-semibold text-gray-700">{datos.titular}</p>
                    </div>
                  )}
                </div>
                {TotalPill}
              </div>
            </div>
          )
        
        case 'PAGO_MOVIL':
          return (
            <div className="mt-3 p-5 sm:p-6 bg-gradient-to-br from-white via-gray-50 to-white text-gray-800 rounded-2xl shadow-xl border border-gray-100 transform transition-all duration-500 hover:shadow-2xl">
              {Brand}
              <div className="space-y-3 sm:space-y-4">
                <div className="text-center">
                  <p className="text-xs font-bold tracking-wide sm:tracking-widest text-gray-500 uppercase mb-1">Pago Móvil {datos.banco ? `- ${datos.banco}` : ''}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 sm:p-4 border border-gray-100">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold tracking-wide sm:tracking-widest text-gray-500 uppercase mb-1 sm:mb-2">Teléfono</p>
                      <p className="text-xl md:text-2xl leading-tight font-mono font-bold tracking-wide text-gray-900 break-all">{datos.telefono}</p>
                    </div>
                    <CopyButton value={datos.telefono} copyKey={`telefono-${metodo.id}`} />
                  </div>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 sm:p-4 border border-gray-100">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold tracking-wide sm:tracking-widest text-gray-500 uppercase mb-1 sm:mb-2">Cédula</p>
                      <p className="text-xl md:text-2xl leading-tight font-mono font-bold tracking-wide text-gray-900 break-all">{datos.cedula}</p>
                    </div>
                    <CopyButton value={datos.cedula} copyKey={`cedula-pagomovil-${metodo.id}`} />
                  </div>
                </div>
                {datos.titular && (
                  <div className="text-center">
                    <p className="text-xs font-bold tracking-wide sm:tracking-widest text-gray-500 uppercase mb-1">Titular</p>
                    <p className="text-base font-semibold text-gray-700">{datos.titular}</p>
                  </div>
                )}
                {TotalPill}
              </div>
            </div>
          )
        
        default:
          return (
            <div className="mt-3 p-5 sm:p-6 bg-gradient-to-br from-white via-gray-50 to-white text-gray-800 rounded-2xl shadow-xl border border-gray-100 transform transition-all duration-500 hover:shadow-2xl">
              {Brand}
              <div className="space-y-3 sm:space-y-4">
                {Object.keys(datos).length > 0 ? (
                  <div className="space-y-3">
                    {Object.entries(datos).map(([k, v]) => (
                      <div key={k} className="bg-gray-50 rounded-xl p-3 sm:p-4 border border-gray-100">
                        <p className="text-xs font-bold tracking-widest text-gray-500 uppercase mb-1">{k}</p>
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-base font-semibold text-gray-900 break-words">{String(v)}</p>
                          <div className="shrink-0">
                            <CopyButton value={String(v)} copyKey={`dato-${metodo.id}-${k}`} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-500">
                    <p>Información del método de pago</p>
                  </div>
                )}
                {TotalPill}
              </div>
            </div>
          )
      }
    } catch {
      return (
        <div className="mt-3 p-6 bg-gradient-to-br from-red-50 to-red-100 text-red-800 rounded-2xl shadow-xl border border-red-200">
          <div className="text-center">
            <p className="text-sm font-semibold">⚠️ Error en la configuración</p>
            <p className="text-xs mt-1 opacity-75">Información del método de pago no disponible</p>
          </div>
        </div>
      )
    }
  }

  if (loading) {
    return (
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4 text-center text-yellow-300">Métodos de Pago</h3>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse">
              <div className="w-full h-16 bg-gray-700/50 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-4 text-center text-yellow-300">Métodos de Pago</h3>
      
      <div className="space-y-3">
        {metodos.map(metodo => (
          <div key={metodo.id} className="transform transition-all duration-300">
            <button
              onClick={() => handleToggle(metodo.id)}
              className={`
                w-full p-4 rounded-xl border text-left transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-yellow-400/30
                ${currentSelected === metodo.id
                  ? 'bg-gradient-to-r from-yellow-500 to-amber-500 text-black border-yellow-400 shadow-lg shadow-yellow-500/20'
                  : 'bg-gradient-to-r from-gray-800 to-gray-700 text-white border-gray-600 hover:from-gray-700 hover:to-gray-600 shadow-md'
                }
              `}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <div className="w-9 h-9 rounded-lg bg-white/90 ring-1 ring-gray-200 shadow flex items-center justify-center">
                      {metodo.imagen ? (
                        <img src={metodo.imagen} alt={metodo.nombre} className="max-w-7 max-h-7 object-contain" />
                      ) : metodo.icono ? (
                        <span className="text-xl">{metodo.icono}</span>
                      ) : (
                        <div className="w-6 h-6 rounded-md bg-gradient-to-br from-yellow-400 to-amber-500" />
                      )}
                    </div>
                    {currentSelected === metodo.id && (
                      <div className="absolute -top-1 -right-1 bg-emerald-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                        <span className="text-xs">✔️</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-base">{metodo.nombre}</p>
                    <p className={`text-sm ${currentSelected === metodo.id ? 'text-black/70' : 'text-gray-300'}`}>
                      {metodo.tipo.replace('_', ' ').toLowerCase().replace(/^\w/, c => c.toUpperCase())}
                    </p>
                  </div>
                </div>
                <div className={`transition-transform duration-300 ${currentSelected === metodo.id ? 'rotate-180' : ''}`} aria-hidden>
                  <svg viewBox="0 0 24 24" className="w-5 h-5">
                    <path fill="currentColor" d="M7 10l5 5 5-5z" />
                  </svg>
                </div>
              </div>
            </button>
            
            <div className={`overflow-hidden transition-all duration-500 ${
              currentSelected === metodo.id 
                ? 'max-h-[1000px] opacity-100' 
                : 'max-h-0 opacity-0'
            }`}>
              {currentSelected === metodo.id && renderPaymentDetails(metodo)}
            </div>
          </div>
        ))}
        
        {metodos.length === 0 && !loading && (
          <div className="text-center py-8 text-gray-400 bg-gray-800/50 rounded-xl border border-gray-600">
            <span className="text-4xl mb-2 block">💳</span>
            <p className="font-semibold">No hay Métodos de Pago configurados</p>
            <p className="text-sm mt-1 opacity-75">Contacta al administrador para configurar Métodos de Pago</p>
          </div>
        )}
      </div>

      {currentSelected && (
        <div className="mt-6 p-4 bg-gradient-to-r from-emerald-700 to-green-700 rounded-xl border border-emerald-600 shadow-lg">
          <div className="flex items-start space-x-3">
            <span className="text-2xl">🔎</span>
            <div>
              <p className="font-semibold text-emerald-100 mb-2">Instrucciones de pago</p>
              <div className="text-sm text-emerald-200 space-y-1">
                <p>• Realiza el pago por el monto exacto mostrado</p>
                <p>• Toma una captura del comprobante de pago</p>
                {/* Envío de comprobante por WhatsApp removido por solicitud */}
                <p>• Recibirás confirmación con tus números asignados</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}




