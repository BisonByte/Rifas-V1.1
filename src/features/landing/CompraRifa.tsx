'use client'

import { useState, useEffect, useRef } from 'react'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { formatCurrencyFlexible } from '@/lib/utils'
import { get, post } from '@/lib/api-client'

interface Rifa {
  id: string
  nombre: string
  descripcion: string
  precioPorBoleto: number
  totalBoletos: number
  limitePorPersona?: number
  fechaSorteo: string
}

interface Ticket {
  numero: number
  estado: 'DISPONIBLE' | 'RESERVADO' | 'VENDIDO'
  participante?: { nombre: string } | null
}

interface MetodoPago {
  id: string
  nombre: string
  tipo: string
  descripcion?: string
  numeroCuenta?: string
  tipoCuenta?: string
  cedula?: string
  telefono?: string
}

interface CompraData {
  rifaId: string
  participante: {
    nombre: string
    celular: string
    email?: string
  }
  ticketsSeleccionados: number[]
  metodoPago: {
    id: string
    referencia?: string
    montoTotal: number
    imagenComprobante?: string | null
  }
}

export function CompraRifa() {
  const [rifas, setRifas] = useState<Rifa[]>([])
  const [rifaSeleccionada, setRifaSeleccionada] = useState<Rifa | null>(null)
  const [currentIndex, setCurrentIndex] = useState<number>(0)
  const [animClass, setAnimClass] = useState<string>('')
  const [switching, setSwitching] = useState<boolean>(false)
  const containerRef = useRef<HTMLDivElement | null>(null)
    const cardRef = useRef<HTMLDivElement | null>(null)
  const touchStartRef = useRef<{ x: number; y: number; t: number } | null>(null)
  const [navTop, setNavTop] = useState<number>(typeof window !== 'undefined' ? window.innerHeight / 2 : 300)
  const [showNavArrows, setShowNavArrows] = useState<boolean>(true)
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [metodosPago, setMetodosPago] = useState<MetodoPago[]>([])
  const [loading, setLoading] = useState(true)
  const [procesando, setProcesando] = useState(false)
  const [moneda, setMoneda] = useState<{ code: string; symbol: string; locale: string; position: 'prefix'|'suffix' } | null>(null)
  const [theme, setTheme] = useState<{ primary: string; secondary: string }>({ primary: '#2563eb', secondary: '#7c3aed' })
  const [topOpen, setTopOpen] = useState<boolean>(false)
  const [topCompradores, setTopCompradores] = useState<Array<{ participanteId: string; nombre: string; celular: string | null; totalTickets: number; totalMonto: number }>>([])

  // Estados del formulario
  // Nueva lógica: compra por cantidad (sin seleccionar números específicos)
  const [cantidadSeleccionada, setCantidadSeleccionada] = useState<number>(1)
  const [nombre, setNombre] = useState('')
  const [celular, setCelular] = useState('')
  const [email, setEmail] = useState('')
  const [metodoPagoId, setMetodoPagoId] = useState('')
  const [referencia, setReferencia] = useState('')
  const [aceptaTerminos, setAceptaTerminos] = useState(false)
  const [imagenComprobante, setImagenComprobante] = useState<File | null>(null)
  const [previewImagen, setPreviewImagen] = useState<string | null>(null)
  const [bump, setBump] = useState(false)
  // Eliminado: selección de números y grilla

  // Cargar rifas disponibles
  useEffect(() => {
    const cargarRifas = async () => {
      try {
        const data = await get('/api/rifas')
        if (data.success) {
          setRifas(data.data)
          if (data.data.length > 0) {
            setCurrentIndex(0)
            setRifaSeleccionada(data.data[0])
          }
        }
      } catch (error) {
        console.error('Error cargando rifas:', error)
      }
    }

    const cargarMetodosPago = async () => {
      try {
        const json = await get('/api/metodos-pago')
        const data = json?.success ? json.data : json
        setMetodosPago(data)
      } catch (error) {
        console.error('Error cargando métodos de pago:', error)
      }
    }

    Promise.all([cargarRifas(), cargarMetodosPago()]).finally(() => {
      setLoading(false)
    })
  }, [])

    // Cargar configuración de moneda y colores desde configuracion pública
  useEffect(() => {
    const loadSiteConfig = async () => {
      try {
        const json = await get('/api/configuracion')
        const payload = json?.success ? json.data : json
        const map: Record<string, string> = {}
        if (Array.isArray(payload)) {
          for (const item of payload) map[item.clave] = item.valor
        } else if (payload && typeof payload === 'object') {
          for (const [k, v] of Object.entries(payload)) map[k] = String(v)
        }
        // Defaults: Venezuela
        const code = map['currency_code'] || 'VES'
        const symbol = map['currency_symbol'] || 'BsS'
        const locale = map['currency_locale'] || 'es-VE'
        const position = (map['currency_position'] as 'prefix'|'suffix') || 'suffix'
        setMoneda({ code, symbol, locale, position })
        // Colores del tema
        const colorPrincipal = map['color_principal'] || '#2563eb'
        const colorSecundario = map['color_secundario'] || '#7c3aed'
        setTheme({ primary: colorPrincipal, secondary: colorSecundario })
      } catch {}
    }
    loadSiteConfig()
  }, [])

  // Cargar Top compradores por rifa actual (confirmados)
  useEffect(() => {
    const loadTop = async () => {
      if (!rifaSeleccionada) return
      try {
        const data = await get(`/api/rifas/${rifaSeleccionada.id}/top-compradores`)
        if (data?.success) setTopCompradores(data.data)
      } catch {}
    }
    loadTop()
  }, [rifaSeleccionada])

  // Calcular la posición vertical de las flechas (centradas respecto al card)
  useEffect(() => {
    const update = () => {
      const rect = cardRef.current?.getBoundingClientRect() || containerRef.current?.getBoundingClientRect()
      let top = typeof window !== 'undefined' ? window.innerHeight / 2 : 300
      if (rect) {
        top = rect.top + rect.height / 2
      }
  const vw = typeof window !== 'undefined' ? window.innerWidth : 1024
      const margin = vw < 640 ? 40 : 56
      const vh = typeof window !== 'undefined' ? window.innerHeight : 800
      // Shift slightly upwards on desktop for a nicer placement
      const desktopOffset = vw >= 1024 ? 24 : 0
      top = Math.max(margin, Math.min(top - desktopOffset, vh - margin))
      setNavTop(top)

      // Compute visibility ratio of the card to decide whether to show arrows
      if (rect && rect.height > 0) {
        const visibleH = Math.min(rect.bottom, vh) - Math.max(rect.top, 0)
        const ratio = Math.max(0, visibleH) / rect.height
        const shouldShow = ratio >= 0.3
        if (shouldShow !== showNavArrows) setShowNavArrows(shouldShow)
      }
    }
    update()
    const onScroll = () => requestAnimationFrame(update)
    window.addEventListener('scroll', onScroll, { passive: true } as any)
    window.addEventListener('resize', onScroll)
    const ro = (typeof ResizeObserver !== 'undefined') ? new ResizeObserver(onScroll) : null
    if (containerRef.current && ro) ro.observe(containerRef.current)
    if (cardRef.current && ro) {
      ro.observe(cardRef.current)
    } else if (containerRef.current && ro) {
      ro.observe(containerRef.current)
    }
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (ro) ro.disconnect()
    }
  }, [rifaSeleccionada])

  // Cargar tickets cuando se selecciona una rifa
  useEffect(() => {
    if (rifaSeleccionada) {
      const cargarTickets = async () => {
        try {
          const data = await get(`/api/rifas/${rifaSeleccionada.id}/tickets`)
          if (data.success) {
            setTickets(data.tickets)
          }
        } catch (error) {
          console.error('Error cargando tickets:', error)
        }
      }
      cargarTickets()
    }
  }, [rifaSeleccionada])

  // Utilidades de cantidad
  const disponiblesCount = tickets.filter(t => t.estado === 'DISPONIBLE').length
  const limitePorPersona = rifaSeleccionada?.limitePorPersona ?? Infinity
  const maxPermitido = Math.min(disponiblesCount, limitePorPersona)

  const clampCantidad = (valor: number) => {
    const max = maxPermitido
    if (max === 0) return 0
    if (valor < 1) return 1
    if (Number.isFinite(max)) return Math.min(valor, max)
    return valor
  }

  const triggerBump = () => {
    setBump(true)
    setTimeout(() => setBump(false), 160)
  }

  const setCantidad = (valor: number) => {
    setCantidadSeleccionada((prev) => {
      const next = clampCantidad(valor)
      if (next !== prev) triggerBump()
      return next
    })
  }

  const quickAdd = (inc: number) => {
    setCantidadSeleccionada(prev => {
      const next = clampCantidad(prev + inc)
      if (next !== prev) triggerBump()

      // Mobile swipe gesture: slide between raffles with horizontal swipe
      useEffect(() => {
        const el = containerRef.current
        if (!el) return
        const onTouchStart = (e: TouchEvent) => {
          if (!hasMultipleRifas) return
          const t = e.touches[0]
          touchStartRef.current = { x: t.clientX, y: t.clientY, t: Date.now() }
        }
        const onTouchEnd = (e: TouchEvent) => {
          if (!hasMultipleRifas || switching || !touchStartRef.current) return
          const start = touchStartRef.current
          const t = e.changedTouches[0]
          const dx = t.clientX - start.x
          const dy = t.clientY - start.y
          const adx = Math.abs(dx)
          const ady = Math.abs(dy)
          const dt = Date.now() - start.t
          // Consider as swipe if mostly horizontal, above distance threshold, and under a time cap
          const horizontal = adx > 48 && adx > ady * 1.3 && dt < 600
          if (horizontal) {
            if (dx < 0) {
              nextRifa()
            } else {
              prevRifa()
            }
          }
          touchStartRef.current = null
        }
        el.addEventListener('touchstart', onTouchStart, { passive: true })
        el.addEventListener('touchend', onTouchEnd)
        return () => {
          el.removeEventListener('touchstart', onTouchStart)
          el.removeEventListener('touchend', onTouchEnd)
        }
      }, [hasMultipleRifas, switching, nextRifa, prevRifa])
      return next
    })
  }

  const calcularTotal = () => {
    if (!rifaSeleccionada) return 0
    return cantidadSeleccionada * rifaSeleccionada.precioPorBoleto
  }

  const copiarAlPortapapeles = (texto: string) => {
    navigator.clipboard.writeText(texto).then(() => {
      alert('Copiado al portapapeles')
    }).catch(() => {
      // Fallback para navegadores que no soportan clipboard API
      const textArea = document.createElement('textarea')
      textArea.value = texto
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      alert('Copiado al portapapeles')
    })
  }

  const manejarImagenComprobante = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB máximo
        alert('La imagen debe ser menor a 5MB')
        return
      }
      if (!file.type.startsWith('image/')) {
        alert('Solo se permiten archivos de imagen')
        return
      }
      setImagenComprobante(file)
      
      // Crear preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreviewImagen(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const subirImagen = async (file: File): Promise<string | null> => {
    try {
      const formData = new FormData()
      formData.append('file', file)

      const result = await post('/api/upload', formData)
      
      if (result.success) {
        return result.url
      } else {
        throw new Error(result.error || 'Error subiendo imagen')
      }
    } catch (error) {
      console.error('Error subiendo imagen:', error)
      alert('Error subiendo la imagen. Inténtalo nuevamente.')
      return null
    }
  }

  const procesarCompra = async () => {
    if (!rifaSeleccionada || !nombre || !celular || !metodoPagoId || !aceptaTerminos) {
      alert('Por favor complete todos los campos obligatorios')
      return
    }

    if (cantidadSeleccionada < 1) {
      alert('Debe seleccionar al menos 1 ticket')
      return
    }

    if (cantidadSeleccionada > disponiblesCount) {
      alert('No hay suficientes tickets disponibles para esa cantidad')
      return
    }

    setProcesando(true)

    try {
      // Subir imagen si existe
      let imagenUrl = null
      if (imagenComprobante) {
        imagenUrl = await subirImagen(imagenComprobante)
        if (!imagenUrl) {
          setProcesando(false)
          return
        }
      }

      // Nueva carga útil: compra por cantidad (sin listar números)
      const compraData: any = {
        rifaId: rifaSeleccionada.id,
        participante: {
          nombre,
          celular,
          email: email || undefined
        },
        cantidadTickets: cantidadSeleccionada,
        metodoPago: {
          id: metodoPagoId,
          referencia,
          montoTotal: calcularTotal(),
          imagenComprobante: imagenUrl
        }
      }

      const result = await post('/api/compras', compraData)

      if (result.success) {
        alert(`¡Compra reservada! Referencia: ${result.detalles.referencia}`)
        // Limpiar formulario
        setCantidadSeleccionada(1)
        setNombre('')
        setCelular('')
        setEmail('')
        setReferencia('')
        setAceptaTerminos(false)
        setImagenComprobante(null)
        setPreviewImagen(null)
        // Recargar tickets
        const ticketsData = await get(`/api/rifas/${rifaSeleccionada.id}/tickets`)
        if (ticketsData.success) {
          setTickets(ticketsData.tickets)
        }
      } else {
        alert(`Error: ${result.error}`)
      }
    } catch (error) {
      console.error('Error procesando compra:', error)
      alert('Error procesando la compra. Intente nuevamente.')
    } finally {
      setProcesando(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner />
      </div>
    )
  }

  if (!rifaSeleccionada) {
    return (
      <div className="text-center py-8">
        <p className="text-yellow-300">No hay rifas disponibles en este momento</p>
      </div>
    )
  }

  const metodoPagoSeleccionado = metodosPago.find(m => m.id === metodoPagoId)

  const hasMultipleRifas = rifas.length > 1

  const nextRifa = () => {
    if (!hasMultipleRifas || switching) return
    setSwitching(true)
    setAnimClass('raffle-exit-left')
    setTimeout(() => {
      setCurrentIndex((idx) => {
        const next = (idx + 1) % rifas.length
        const r = rifas[next]
        if (r) setRifaSeleccionada(r)
        return next
      })
      setAnimClass('raffle-enter-right page-nudge')
      setTimeout(() => {
        setAnimClass('')
        setSwitching(false)
      }, 300)
    }, 180)
  }

  const prevRifa = () => {
    if (!hasMultipleRifas || switching) return
    setSwitching(true)
    setAnimClass('raffle-exit-right')
    setTimeout(() => {
      setCurrentIndex((idx) => {
        const prev = (idx - 1 + rifas.length) % rifas.length
        const r = rifas[prev]
        if (r) setRifaSeleccionada(r)
        return prev
      })
      setAnimClass('raffle-enter-left')
      setTimeout(() => {
        setAnimClass('')
        setSwitching(false)
      }, 300)
    }, 180)
  }

  return (
    <div className="relative" ref={containerRef}>
      {/* Navegación entre rifas: solo mostrar si hay más de una rifa activa */}
      {hasMultipleRifas && (
        <>
          <button
            type="button"
            aria-label="Anterior sorteo"
            onClick={prevRifa}
            disabled={switching}
            className={`btn-float hidden lg:flex fixed left-5 xl:left-7 z-30 w-[52px] h-[52px] xl:w-14 xl:h-14 rounded-full glass-nav nav-arrow items-center justify-center ring-1 ring-white/10 shadow-2xl hover:shadow-[0_16px_42px_rgba(0,0,0,0.52)] ${showNavArrows ? '' : 'opacity-0 pointer-events-none'}`}
              style={{ color: theme.primary, top: navTop }}
            title="Sorteo anterior"
          >
            <svg viewBox="0 0 24 24" className="w-6 h-6 xl:w-7 xl:h-7" aria-hidden>
              <path fill="currentColor" d="M15.41 7.41L14 6l-6 6l6 6l1.41-1.41L10.83 12z" />
            </svg>
          </button>
          <button
            type="button"
            aria-label="Siguiente sorteo"
            onClick={nextRifa}
            disabled={switching}
            className={`btn-float hidden lg:flex fixed right-5 xl:right-7 z-30 w-[52px] h-[52px] xl:w-14 xl:h-14 rounded-full glass-nav nav-arrow items-center justify-center ring-1 ring-white/10 shadow-2xl hover:shadow-[0_16px_42px_rgba(0,0,0,0.52)] ${showNavArrows ? '' : 'opacity-0 pointer-events-none'}`}
              style={{ color: theme.primary, top: navTop }}
            title="Siguiente sorteo"
          >
            <svg viewBox="0 0 24 24" className="w-6 h-6 xl:w-7 xl:h-7" aria-hidden>
              <path fill="currentColor" d="M8.59 16.59L10 18l6-6l-6-6l-1.41 1.41L13.17 12z" />
            </svg>
          </button>
        </>
      )}

      <div className={`space-y-6 ${animClass}`}>
      {/* Información de la rifa */}
        <div className="relative bg-red-700/80 rounded-xl p-4 border border-red-600/50 backdrop-blur-sm">
          {/* Price chip top-right */}
          <div className="absolute -top-3 right-3 price-chip-appear chip-delay-140">
            <div
              className="px-3 py-1 rounded-full text-white text-xs md:text-sm shadow-lg ring-1 ring-white/20 flex items-center gap-1"
              style={{
                background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`
              }}
            >
              <span className="opacity-90">Precio</span>
              <strong className="font-semibold">
                {moneda
                  ? formatCurrencyFlexible(rifaSeleccionada.precioPorBoleto, {
                      code: moneda.code,
                      symbol: moneda.symbol,
                      locale: moneda.locale,
                      position: moneda.position,
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })
                  : `$ ${rifaSeleccionada.precioPorBoleto.toFixed(2)}`}
              </strong>
            </div>
          </div>
        <h2 className="text-2xl font-bold text-yellow-300 mb-2">{rifaSeleccionada.nombre}</h2>
        <p className="text-sm opacity-90 mb-3">{rifaSeleccionada.descripcion}</p>
        
        {/* Barra de progreso de ventas */}
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span>Progreso de ventas</span>
            <span className="font-bold text-yellow-300">
              {Math.round((tickets.filter(t => t.estado === 'VENDIDO').length / tickets.length) * 100) || 0}% vendido
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 h-3 rounded-full transition-all duration-500" 
              style={{
                width: `${Math.round((tickets.filter(t => t.estado === 'VENDIDO').length / tickets.length) * 100) || 0}%`
              }}
            ></div>
          </div>
          <div className="flex justify-between text-xs mt-2 text-gray-300">
            <span>🎫 Disponibles: {tickets.filter(t => t.estado === 'DISPONIBLE').length}</span>
            <span>⏳ Reservados: {tickets.filter(t => t.estado === 'RESERVADO').length}</span>
            <span>✅ Vendidos: {tickets.filter(t => t.estado === 'VENDIDO').length}</span>
          </div>
  </div>

        <div className="text-sm space-y-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <span>💰</span>
              <span>
                Precio: <strong className="text-yellow-300">
                  {moneda
                    ? formatCurrencyFlexible(rifaSeleccionada.precioPorBoleto, {
                        code: moneda.code,
                        symbol: moneda.symbol,
                        locale: moneda.locale,
                        position: moneda.position,
                      })
                    : `$ ${rifaSeleccionada.precioPorBoleto}`}
                </strong>
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span>🎫</span>
              <span>Total: <strong className="text-yellow-300">{rifaSeleccionada.totalBoletos}</strong></span>
            </div>
          </div>
          {rifaSeleccionada.limitePorPersona && (
            <div className="flex items-center space-x-2">
              <span>👤</span>
              <span>Límite por persona: <strong className="text-yellow-300">{rifaSeleccionada.limitePorPersona}</strong></span>
            </div>
            )}
        </div>
      </div>

      {/* Selección de cantidad */}
      <div>
        <h3 className="text-lg font-semibold mb-3 text-yellow-300">1. Selección de Tickets</h3>
        <div className="grid grid-cols-4 gap-3">
          {[2,5,10,20].map((inc) => (
            <button
              key={inc}
              onClick={() => quickAdd(inc)}
              disabled={disponiblesCount === 0 || cantidadSeleccionada >= maxPermitido}
              className="bg-red-600 text-white font-bold py-3 px-4 rounded-xl hover:bg-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              +{inc}
              {inc === 10 && (
                <div className="text-[10px] opacity-80 mt-1">Más popular</div>
              )}
            </button>
          ))}
        </div>

        <div className="mt-4 flex items-stretch gap-3">
          <button
            type="button"
            onClick={() => setCantidad(cantidadSeleccionada - 1)}
            disabled={cantidadSeleccionada <= 0 || disponiblesCount === 0}
            className="w-12 h-12 rounded-lg bg-gray-700 text-white text-xl hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label="Disminuir"
          >
            −
          </button>
          <div className={`flex-1 h-12 rounded-lg bg-black/40 border border-gray-700 flex items-center justify-center text-xl font-bold text-white transition-transform duration-150 ${bump ? 'scale-110' : 'scale-100'}`}>
            {cantidadSeleccionada}
          </div>
          <button
            type="button"
            onClick={() => setCantidad(cantidadSeleccionada + 1)}
            disabled={cantidadSeleccionada >= maxPermitido || disponiblesCount === 0}
            className="w-12 h-12 rounded-lg bg-gray-700 text-white text-xl hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label="Aumentar"
          >
            +
          </button>
        </div>

        <div className="mt-2 text-sm text-gray-300 flex flex-wrap items-center gap-x-4 gap-y-1">
          <span>Disponibles: <span className="text-green-300 font-semibold">{disponiblesCount}</span></span>
          {Number.isFinite(limitePorPersona) && (
            <span>Límite por persona: <span className="text-yellow-300 font-semibold">{limitePorPersona}</span></span>
          )}
          {cantidadSeleccionada >= maxPermitido && disponiblesCount > 0 && (
            <span className="text-amber-300">Alcanzaste el máximo permitido</span>
          )}
        </div>

        {/* Panel resumen cantidad + total */}
        <div className="mt-4 rounded-lg border border-gray-700 bg-slate-800/60 px-4 py-3">
          <div className="flex justify-between text-sm">
            <span>Tickets seleccionados: <span className="font-semibold text-white">{cantidadSeleccionada}</span></span>
            <span>
              Total: <span className="font-semibold text-white">
                {moneda
                  ? formatCurrencyFlexible(calcularTotal(), {
                      code: moneda.code,
                      symbol: moneda.symbol,
                      locale: moneda.locale,
                      position: moneda.position,
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })
                  : `$ ${calcularTotal().toFixed(2)}`}
              </span>
            </span>
          </div>
        </div>

        {/* Top compradores (por rifa) */}
        <div className="mt-4 rounded-xl border border-red-700/40 bg-red-900/20">
          <button
            type="button"
            onClick={() => setTopOpen((v) => !v)}
            className="w-full flex items-center justify-between px-4 py-3 text-left"
          >
            <span className="font-semibold">Top compradores</span>
            <span className="text-sm opacity-80">{topOpen ? 'Ocultar' : 'Ver lista'}</span>
          </button>
          {topOpen && (
            <div className="px-4 pb-3">
              {topCompradores.length === 0 ? (
                <div className="text-sm text-gray-400">Aún no hay compradores destacados</div>
              ) : (
                <ul className="space-y-2">
                  {topCompradores.map((c, idx) => (
                    <li key={c.participanteId} className="flex items-center justify-between rounded-lg bg-black/20 border border-white/5 px-3 py-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-red-600 text-white">#{idx + 1}</span>
                        <span className="font-medium">{c.nombre}</span>
                      </div>
                      <div className="text-sm text-gray-300">
                        <span className="mr-3">🎫 {c.totalTickets}</span>
                        <span>
                          {moneda
                            ? formatCurrencyFlexible(c.totalMonto, {
                                code: moneda.code,
                                symbol: moneda.symbol,
                                locale: moneda.locale,
                                position: moneda.position,
                              })
                            : `$ ${c.totalMonto.toFixed(2)}`}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>

  {/* Eliminado: grilla de números */}
  <div className="hidden" />

      {/* Información personal */}
      <div>
        <h3 className="text-lg font-semibold mb-3 text-yellow-300">Información personal</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input
            type="text"
            placeholder="Nombre completo *"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="w-full px-4 py-3 bg-gray-800/80 text-white rounded-lg border border-gray-600 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 focus:outline-none transition-all duration-200 placeholder-gray-400"
          />
          <input
            type="tel"
            placeholder="Celular *"
            value={celular}
            onChange={(e) => setCelular(e.target.value)}
            className="w-full px-4 py-3 bg-gray-800/80 text-white rounded-lg border border-gray-600 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 focus:outline-none transition-all duration-200 placeholder-gray-400"
          />
          <input
            type="email"
            placeholder="Email (opcional)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full md:col-span-2 px-4 py-3 bg-gray-800/80 text-white rounded-lg border border-gray-600 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 focus:outline-none transition-all duration-200 placeholder-gray-400"
          />
        </div>
      </div>

      {/* Método de pago */}
      <div>
        <h3 className="text-lg font-semibold mb-3 text-yellow-300">Método de pago</h3>
        <select
          value={metodoPagoId}
          onChange={(e) => setMetodoPagoId(e.target.value)}
          className="w-full px-4 py-3 bg-gray-800/80 text-white rounded-lg border border-gray-600 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 focus:outline-none mb-4 transition-all duration-200"
        >
          <option value="">Seleccionar método de pago</option>
          {metodosPago.map(metodo => (
            <option key={metodo.id} value={metodo.id}>{metodo.nombre}</option>
          ))}
        </select>

        {metodoPagoSeleccionado && (
          <div className="bg-gray-800/60 p-4 rounded-lg text-sm space-y-2 border border-gray-600/50 backdrop-blur-sm">
            <div className="flex items-center space-x-2 mb-3">
              <span className="text-2xl">💳</span>
              <span className="font-bold text-yellow-300">{metodoPagoSeleccionado.nombre}</span>
            </div>
            {metodoPagoSeleccionado.numeroCuenta && (
              <div className="flex justify-between items-center p-2 bg-gray-700/50 rounded">
                <div>
                  <span><strong>Cuenta:</strong></span>
                  <div className="font-mono text-yellow-200">{metodoPagoSeleccionado.numeroCuenta}</div>
                </div>
                <button
                  type="button"
                  onClick={() => copiarAlPortapapeles(metodoPagoSeleccionado.numeroCuenta!)}
                  className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors"
                >
                  Copiar
                </button>
              </div>
            )}
            {metodoPagoSeleccionado.telefono && (
              <div className="flex justify-between items-center p-2 bg-gray-700/50 rounded">
                <div>
                  <span><strong>Teléfono:</strong></span>
                  <div className="font-mono text-yellow-200">{metodoPagoSeleccionado.telefono}</div>
                </div>
                <button
                  type="button"
                  onClick={() => copiarAlPortapapeles(metodoPagoSeleccionado.telefono!)}
                  className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors"
                >
                  Copiar
                </button>
              </div>
            )}
            {metodoPagoSeleccionado.cedula && (
              <div className="flex justify-between items-center p-2 bg-gray-700/50 rounded">
                <div>
                  <span><strong>Cédula:</strong></span>
                  <div className="font-mono text-yellow-200">{metodoPagoSeleccionado.cedula}</div>
                </div>
                <button
                  type="button"
                  onClick={() => copiarAlPortapapeles(metodoPagoSeleccionado.cedula!)}
                  className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors"
                >
                  Copiar
                </button>
              </div>
            )}
            {metodoPagoSeleccionado.descripcion && (
              <p className="text-gray-300 text-xs mt-2 italic">{metodoPagoSeleccionado.descripcion}</p>
            )}
          </div>
        )}

        <input
          type="text"
          placeholder="Referencia del pago (opcional)"
          value={referencia}
          onChange={(e) => setReferencia(e.target.value)}
          className="w-full px-4 py-3 bg-gray-800/80 text-white rounded-lg border border-gray-600 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 focus:outline-none mt-4 transition-all duration-200 placeholder-gray-400"
        />

        {/* Subir comprobante de pago */}
        <div className="mt-4 p-4 bg-gray-800/60 rounded-lg border border-gray-600/50">
          <label className="block text-sm font-medium text-yellow-300 mb-2">
            📄 Subir comprobante de pago (opcional)
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={manejarImagenComprobante}
            className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-yellow-600 file:text-white hover:file:bg-yellow-700"
          />
          {previewImagen && (
            <div className="mt-3">
              <img 
                src={previewImagen} 
                alt="Preview comprobante" 
                className="max-w-full h-32 object-cover rounded border border-gray-600"
              />
              <button
                type="button"
                onClick={() => {
                  setImagenComprobante(null)
                  setPreviewImagen(null)
                }}
                className="mt-2 text-red-400 hover:text-red-300 text-xs underline"
              >
                Eliminar imagen
              </button>
            </div>
          )}
          <p className="text-xs text-gray-400 mt-1">
            Formatos: JPG, PNG, GIF. Máximo 5MB
          </p>
        </div>
      </div>

      {/* Total */}
      <div className="bg-gradient-to-r from-gray-800/80 to-gray-700/80 p-6 rounded-xl border border-gray-600/50 backdrop-blur-sm">
        <div className="flex justify-between items-center">
          <span className="text-lg font-semibold flex items-center">
            <span className="mr-2">💰</span>
            Total a pagar:
          </span>
          <div className="text-right">
            <div className="text-3xl font-bold text-yellow-300">
              {moneda
                ? formatCurrencyFlexible(calcularTotal(), {
                    code: moneda.code,
                    symbol: moneda.symbol,
                    locale: moneda.locale,
                    position: moneda.position,
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })
                : `$ ${calcularTotal().toFixed(2)}`}
            </div>
            <div className="text-sm text-gray-300">
                {cantidadSeleccionada} ticket{cantidadSeleccionada > 1 ? 's' : ''} × {moneda
                  ? formatCurrencyFlexible(rifaSeleccionada?.precioPorBoleto || 0, {
                      code: moneda?.code || 'VES',
                      symbol: moneda?.symbol || 'BsS',
                      locale: moneda?.locale || 'es-VE',
                      position: moneda?.position || 'suffix',
                    })
                  : `$ ${rifaSeleccionada?.precioPorBoleto}`}
            </div>
          </div>
        </div>
      </div>

      {/* Términos y condiciones */}
      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
        <label className="flex items-start space-x-3 text-sm cursor-pointer">
          <input 
            type="checkbox"
            checked={aceptaTerminos}
            onChange={(e) => setAceptaTerminos(e.target.checked)}
            className="mt-1 w-4 h-4 text-yellow-500 bg-gray-800 border-gray-600 rounded focus:ring-yellow-500 focus:ring-2"
          />
          <span className="text-gray-200">
            Al presionar <strong className="text-yellow-300">"Finalizar Compra"</strong> aceptas haber leído y estar de acuerdo con nuestros 
            <a href="#" className="text-yellow-300 hover:text-yellow-200 underline ml-1">Términos y Condiciones</a>
          </span>
        </label>
      </div>

      {/* Botón de compra */}
      <button 
        onClick={procesarCompra}
        disabled={procesando || !aceptaTerminos || cantidadSeleccionada < 1}
        className={`
          w-full font-bold py-4 px-6 rounded-xl text-lg transition-all duration-300 transform
          ${procesando || !aceptaTerminos || cantidadSeleccionada < 1
            ? 'bg-gray-600 text-gray-400 cursor-not-allowed opacity-50'
            : 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-black hover:from-yellow-400 hover:to-yellow-500 hover:scale-105 shadow-lg hover:shadow-yellow-500/25'
          }
        `}
      >
        {procesando ? (
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></div>
            <span>Procesando...</span>
          </div>
        ) : (
          <div className="flex items-center justify-center space-x-2">
            <span>🚀</span>
            <span>Finalizar Compra</span>
            <span>🎯</span>
          </div>
        )}
      </button>
    </div>
  </div>
  )
}
 
