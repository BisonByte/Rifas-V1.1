'use client'

import { useState, useEffect, useRef } from 'react'
import * as QRCode from 'qrcode'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { formatCurrencyFlexible } from '@/lib/utils'
import { get, post, HttpError } from '@/lib/api-client'
import { PaymentMethods } from '@/features/landing/PaymentMethods'
import { EstadoTicket } from '@prisma/client'

interface Rifa {
  id: string
  nombre: string
  descripcion: string
  portadaUrl?: string | null
  precioPorBoleto: number
  totalBoletos: number
  limitePorPersona?: number
  fechaSorteo: string
  mostrarTopCompradores?: boolean
}

interface Ticket {
  numero: number
  estado: EstadoTicket
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
  const [errorCompra, setErrorCompra] = useState<string | null>(null)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
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
  const [posterZoomOpen, setPosterZoomOpen] = useState(false)
  const [posterError, setPosterError] = useState(false)
  // Eliminado: selección de números y grilla

  // Post-compra: tickets asignados y modal de visualización
  const [ticketsAsignados, setTicketsAsignados] = useState<number[] | null>(null)
  const [mostrarSoloNumeros, setMostrarSoloNumeros] = useState<boolean>(false)
  const [mostrarModalTickets, setMostrarModalTickets] = useState<boolean>(false)
  const [qrMap, setQrMap] = useState<Record<number, string>>({})
  const [ultimaCompra, setUltimaCompra] = useState<{ compraId: string; referencia?: string | null } | null>(null)

  // Generar QRs cuando llegan tickets asignados
  useEffect(() => {
    const gen = async () => {
      if (!ticketsAsignados || !rifaSeleccionada) return
      const entries: Array<[number, string]> = []
      for (const n of ticketsAsignados) {
        try {
          const payload = {
            rifaId: rifaSeleccionada.id,
            ticket: n,
            compraId: ultimaCompra?.compraId || null,
            ts: Date.now(),
          }
          const dataUrl = await QRCode.toDataURL(JSON.stringify(payload), { width: 256, margin: 1 })
          entries.push([n, dataUrl])
        } catch (e) {
          // ignore QR failure for individual ticket
        }
      }
      setQrMap(Object.fromEntries(entries))
    }
    gen()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticketsAsignados, rifaSeleccionada])

  // Cargar rifas disponibles
  useEffect(() => {
    const cargarRifas = async () => {
      try {
        const json = await get('/api/rifas') as any
        const arr: any[] = (json?.success ? json.data : json) || []
        setRifas(Array.isArray(arr) ? arr : [])
        if (Array.isArray(arr) && arr.length > 0) {
          setCurrentIndex(0)
          setRifaSeleccionada(arr[0])
        }
      } catch (error) {
        console.error('Error cargando rifas:', error)
      }
    }

    const cargarMetodosPago = async () => {
      try {
        const json = await get('/api/metodos-pago') as any
        const data = json?.success ? json.data : json
        setMetodosPago(Array.isArray(data) ? data : [])
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
    const json = await get('/api/configuracion') as any
    const payload = json?.success ? json.data : json
        const map: Record<string, string> = {}
        if (Array.isArray(payload)) {
          for (const item of payload) map[item.clave] = item.valor
        } else if (payload && typeof payload === 'object') {
          for (const [k, v] of Object.entries(payload)) map[k] = String(v)
        }
        // Defaults: Venezuela
        const code = map['currency_code'] || 'VES'
        const symbol = map['currency_symbol'] || 'Bs.'
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
    const data = await get(`/api/rifas/${rifaSeleccionada.id}/top-compradores`) as any
    if (data?.success && Array.isArray(data.data)) setTopCompradores(data.data)
      } catch {}
    }
    loadTop()
  }, [rifaSeleccionada])

  // Cerrar zoom con Escape
  useEffect(() => {
    if (!posterZoomOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPosterZoomOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [posterZoomOpen])

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
          const res = await get(`/api/rifas/${rifaSeleccionada.id}/tickets`) as any
          if (res?.success && Array.isArray(res.tickets)) {
            setTickets(res.tickets)
          } else if (Array.isArray(res)) {
            setTickets(res)
          } else {
            setTickets([])
          }
        } catch (error) {
          console.error('Error cargando tickets:', error)
        }
      }
      cargarTickets()
    }
  }, [rifaSeleccionada])

  // Utilidades de cantidad
  const disponiblesCount = tickets.filter(t => t.estado === EstadoTicket.DISPONIBLE).length
  const reservadosCount = tickets.filter(t => t.estado === EstadoTicket.RESERVADO).length
  const vendidosCount = tickets.filter(t => t.estado === EstadoTicket.VENDIDO).length
  // Sin límite por persona: máximo permitido es lo disponible
  const maxPermitido = disponiblesCount

  // Animación sutil para progreso y restante (similar al panel lateral)
  const vendidoPct = tickets.length > 0 ? Math.round((vendidosCount / tickets.length) * 100) : 0
  const restantePct = tickets.length > 0 ? Math.round((disponiblesCount / tickets.length) * 100) : 0
  const [animVenta, setAnimVenta] = useState({ vend: 0, rest: 0 })
  useEffect(() => {
    const duration = 700
    const start = performance.now()
    const from = { ...animVenta }
    const to = { vend: vendidoPct, rest: restantePct }
    let raf = 0
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration)
      const ease = 1 - Math.pow(1 - t, 3)
      setAnimVenta({
        vend: Math.round(from.vend + (to.vend - from.vend) * ease),
        rest: Math.round(from.rest + (to.rest - from.rest) * ease),
      })
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vendidoPct, restantePct])

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

  // Mobile swipe gesture: slide between raffles with horizontal swipe
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    if (!rifas || rifas.length <= 1) return
    const onTouchStart = (e: TouchEvent) => {
      const t = e.touches[0]
      touchStartRef.current = { x: t.clientX, y: t.clientY, t: Date.now() }
    }
    const onTouchEnd = (e: TouchEvent) => {
      if (!touchStartRef.current || switching) return
      const start = touchStartRef.current
      const t = e.changedTouches[0]
      const dx = t.clientX - start.x
      const dy = t.clientY - start.y
      const adx = Math.abs(dx)
      const ady = Math.abs(dy)
      const dt = Date.now() - start.t
      const horizontal = adx > 48 && adx > ady * 1.3 && dt < 600
      if (horizontal) {
        if (dx < 0) nextRifa(); else prevRifa()
      }
      touchStartRef.current = null
    }
    el.addEventListener('touchstart', onTouchStart, { passive: true } as any)
    el.addEventListener('touchend', onTouchEnd)
    return () => {
      el.removeEventListener('touchstart', onTouchStart)
      el.removeEventListener('touchend', onTouchEnd)
    }
  }, [rifas, switching])

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

      const result = await post('/api/upload', formData) as any
      
      if (result.success) {
        return result.url
      } else {
        throw new Error(result.error || 'Error subiendo imagen')
      }
    } catch (error) {
      console.error('Error subiendo imagen:', error)
      if (error instanceof HttpError) {
        alert(`Error subiendo la imagen: ${error.message}`)
      } else if (error instanceof Error) {
        alert(`Error subiendo la imagen: ${error.message}`)
      } else {
        alert('Error subiendo la imagen. Inténtalo nuevamente.')
      }
      return null
    }
  }

  const procesarCompra = async () => {
    // Validaciones cliente con marcado de campos
    const errs: Record<string, string> = {}
    if (!rifaSeleccionada) {
      errs.general = 'No hay rifa seleccionada'
    }
    if (!nombre || nombre.trim().length < 2) {
      errs.nombre = 'Nombre debe tener al menos 2 caracteres'
    }
    const celOnly = (celular || '').replace(/\D/g, '')
    if (!celOnly || celOnly.length < 10) {
      errs.celular = 'Celular debe tener al menos 10 dígitos'
    }
    if (!metodoPagoId) {
      errs.metodoPagoId = 'Seleccione un método de pago'
    }
    if (cantidadSeleccionada < 1) {
      errs.cantidad = 'Debe seleccionar al menos 1 ticket'
    }
    if (cantidadSeleccionada > disponiblesCount) {
      errs.cantidad = 'No hay suficientes tickets disponibles para esa cantidad'
    }
    if (!aceptaTerminos) {
      errs.aceptaTerminos = 'Debes aceptar los términos para continuar'
    }
    if (Object.keys(errs).length > 0) {
      setFormErrors(errs)
      setErrorCompra('Por favor corrige los campos marcados en rojo')
      return
    }

  setProcesando(true)
  setErrorCompra(null)

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
        rifaId: rifaSeleccionada!.id,
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

      const result = await post('/api/compras', compraData) as any

    if (result.success) {
        // Enviar comprobante para pasar a EN_VERIFICACION y que aparezca en el panel admin
        try {
          const confirmPayload: any = {
            compraId: result.compraId,
            referencia: referencia && referencia.trim().length > 0
              ? referencia
              : result.detalles?.referencia,
          }
          if (imagenUrl) {
            confirmPayload.voucher = imagenUrl
          }
          const confirm = await post('/api/tickets/pago', confirmPayload) as any
      const ref = confirm?.data?.compra?.referencia || result.detalles.referencia
      // Mostrar modal con tickets asignados
      const lista = Array.isArray(result.detalles?.tickets) ? result.detalles.tickets as number[] : []
      setUltimaCompra({ compraId: result.compraId, referencia: ref })
      setTicketsAsignados(lista)
      setMostrarModalTickets(true)
        } catch (e) {
      const lista = Array.isArray(result.detalles?.tickets) ? result.detalles.tickets as number[] : []
      setUltimaCompra({ compraId: result.compraId, referencia: result.detalles?.referencia })
      setTicketsAsignados(lista)
      setMostrarModalTickets(true)
        }
        // Limpiar formulario
        setCantidadSeleccionada(1)
        setNombre('')
        setCelular('')
        setEmail('')
        setReferencia('')
        setAceptaTerminos(false)
        setImagenComprobante(null)
        setPreviewImagen(null)
        setErrorCompra(null)
        // Recargar tickets
        const ticketsData = await get(`/api/rifas/${rifaSeleccionada!.id}/tickets`) as any
        if (ticketsData?.success && Array.isArray(ticketsData.tickets)) {
          setTickets(ticketsData.tickets)
        } else if (Array.isArray(ticketsData)) {
          setTickets(ticketsData)
        }
      } else {
        const msg = `Error: ${result.error || 'No se pudo procesar la compra'}`
        setErrorCompra(msg)
        alert(msg)
      }
    } catch (error) {
      console.error('Error procesando compra:', error)
      if (error instanceof HttpError) {
        // Si vienen detalles de validación (Zod), mostrar el primer detalle útil
        let detalle = ''
        const d: any = (error as any).details
        if (Array.isArray(d) && d.length > 0) {
          const first = d[0]
          const path = Array.isArray(first.path) ? first.path.join('.') : ''
          detalle = `${path ? path + ': ' : ''}${first.message || ''}`.trim()
        }
        const msg = `Error procesando la compra: ${error.message}${detalle ? ' — ' + detalle : ''}`
        setErrorCompra(msg)
        alert(msg)
      } else if (error instanceof Error) {
        const msg = `Error procesando la compra: ${error.message}`
        setErrorCompra(msg)
        alert(msg)
      } else {
        const msg = 'Error procesando la compra. Intente nuevamente.'
        setErrorCompra(msg)
        alert(msg)
      }
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

  // Previews for adjacent raffles
  const prevPreview = hasMultipleRifas
    ? rifas[(currentIndex - 1 + rifas.length) % rifas.length]
    : null
  const nextPreview = hasMultipleRifas
    ? rifas[(currentIndex + 1) % rifas.length]
    : null

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

  const RifaPeek = ({ rifa }: { rifa: Rifa }) => (
    <div className="relative bg-red-700/80 rounded-xl p-4 border border-red-600/50 backdrop-blur-sm">
      {rifa.portadaUrl && (
        <div className="mb-2">
          <div className="rounded-2xl overflow-hidden aspect-[3/4]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={rifa.portadaUrl}
              alt={`Portada de ${rifa.nombre}`}
              className="w-full h-full object-contain"
              loading="lazy"
            />
          </div>
        </div>
      )}
      <h3 className="text-sm font-bold text-yellow-300 text-center">{rifa.nombre}</h3>
    </div>
  )

  return (
    <div className="relative mx-auto lg:max-w-6xl xl:max-w-[88rem] 2xl:max-w-[96rem] px-3 sm:px-4 lg:px-6" ref={containerRef}>
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

  <div className={`relative overflow-hidden ${animClass}`}>
    {hasMultipleRifas && prevPreview && (
      <div className="absolute inset-0 -translate-x-[60%] opacity-50 pointer-events-none z-0">
        <RifaPeek rifa={prevPreview} />
      </div>
    )}
    {hasMultipleRifas && nextPreview && (
      <div className="absolute inset-0 translate-x-[60%] opacity-50 pointer-events-none z-0">
        <RifaPeek rifa={nextPreview} />
      </div>
    )}
    <div className="relative z-10 space-y-5 sm:space-y-6">
    {/* Información de la rifa */}
  <div className="relative bg-red-700/80 rounded-xl p-4 border border-red-600/50 backdrop-blur-sm lg:max-w-4xl lg:mx-auto">
          {/* Imagen de portada si existe */}
          {rifaSeleccionada?.portadaUrl && (
            <div className="mb-5 mx-auto w-full max-w-[320px] sm:max-w-[420px] md:max-w-[520px] lg:w-[400px]">
              {/* Marco elegante con gradiente */}
              <div className="rounded-2xl p-[2px] bg-gradient-to-br from-amber-400/60 via-fuchsia-400/40 to-cyan-400/60 shadow-xl">
                <div className="relative rounded-2xl bg-black/40 ring-1 ring-white/10 overflow-hidden aspect-[3/4] group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {!posterError ? (
                    <img
                      src={rifaSeleccionada.portadaUrl}
                      alt={`Portada de ${rifaSeleccionada.nombre}`}
                      className="absolute inset-0 w-full h-full object-contain transition-transform duration-300 group-hover:scale-[1.01] cursor-zoom-in"
                      loading="lazy"
                      onClick={() => setPosterZoomOpen(true)}
                      onError={() => setPosterError(true)}
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-sm text-gray-300">
                      <div className="text-center px-4">
                        <div className="text-3xl mb-2">🖼️</div>
                        No se pudo cargar la imagen
                      </div>
                    </div>
                  )}
                  {/* Chip de precio superpuesto */}
                  <div className="absolute top-2 right-2 drop-shadow">
                    <div
                      className="px-3 py-1 rounded-full text-white text-[11px] md:text-sm shadow-lg ring-1 ring-white/20 flex items-center gap-1 backdrop-blur-sm"
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
                  {/* Botón de zoom */}
                  {!posterError && (
                    <button
                      type="button"
                      aria-label="Ampliar portada"
                      title="Ampliar portada"
                      onClick={() => setPosterZoomOpen(true)}
                      className="absolute bottom-2 right-2 w-9 h-9 rounded-full bg-white/10 hover:bg-white/15 text-white flex items-center justify-center ring-1 ring-white/20 shadow-md"
                    >
                      🔍
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
          
  <h2
          className="text-xl sm:text-2xl font-bold text-yellow-300 mb-2"
          style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
        >
          {rifaSeleccionada.nombre}
        </h2>
        <p
          className="text-[13px] sm:text-sm opacity-90 mb-3"
          style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
        >
          {rifaSeleccionada.descripcion}
        </p>
        
        {/* Barra de progreso de ventas */}
        <div className="mb-4">
          <div className="flex justify-between text-xs sm:text-sm mb-2">
            <span>Progreso de ventas</span>
            <span className="font-bold text-yellow-300">
              {animVenta.vend}% vendido
            </span>
          </div>
      <div className="w-full bg-gray-700 rounded-full h-2 sm:h-3">
            <div 
        className="bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 h-2 sm:h-3 rounded-full transition-[width] duration-700 ease-out" 
              style={{ width: `${animVenta.vend}%` }}
            ></div>
          </div>
      <div className="mt-2 grid grid-cols-1 text-xs">
            <div className="rounded-md bg-black/20 ring-1 ring-white/10 px-2.5 py-1.5 flex items-center justify-between">
        <span className="flex items-center gap-1 text-gray-300"><span>🎫</span>Restante</span>
        <span className="font-semibold text-green-300">{animVenta.rest}%</span>
            </div>
          </div>
  </div>

        <div className="mt-3 rounded-lg bg-black/15 ring-1 ring-white/10 overflow-hidden">
          <div className="grid grid-cols-2">
            <div className="flex items-center gap-2 px-3 py-2">
              <span>💰</span>
              <span className="text-[13px] sm:text-sm">Precio</span>
            </div>
            <div className="px-3 py-2 text-right text-yellow-300 font-semibold whitespace-nowrap text-sm">
              {moneda
                ? formatCurrencyFlexible(rifaSeleccionada.precioPorBoleto, {
                    code: moneda.code,
                    symbol: moneda.symbol,
                    locale: moneda.locale,
                    position: moneda.position,
                  })
                : `$ ${rifaSeleccionada.precioPorBoleto}`}
            </div>
          </div>
          {/* Fila "Total" eliminada según solicitud */}
          {/* límite por persona eliminado */}
        </div>
      </div>

      {/* Selección de cantidad */}
  <div className="lg:max-w-4xl lg:mx-auto">
        <h3 className="text-base sm:text-lg font-semibold mb-3 text-yellow-300">1. Selección de Tickets</h3>
  <div className="grid grid-cols-4 gap-2 sm:gap-3">
          {[2,5,10,20].map((inc) => (
            <button
              key={inc}
              onClick={() => quickAdd(inc)}
              disabled={disponiblesCount === 0 || cantidadSeleccionada >= maxPermitido}
              className="bg-red-600 text-white font-bold py-2 px-3 text-sm rounded-lg sm:py-3 sm:px-4 sm:text-base sm:rounded-xl hover:bg-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              +{inc}
              {inc === 10 && (
                <div className="text-[10px] leading-none opacity-80 mt-1">Más popular</div>
              )}
            </button>
          ))}
        </div>

        <div className="mt-4 flex items-stretch gap-3">
          <button
            type="button"
            onClick={() => setCantidad(cantidadSeleccionada - 1)}
            disabled={cantidadSeleccionada <= 0 || disponiblesCount === 0}
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gray-700 text-white text-lg sm:text-xl hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label="Disminuir"
          >
            −
          </button>
          <div className={`flex-1 h-10 sm:h-12 rounded-lg bg-black/40 border border-gray-700 flex items-center justify-center text-lg sm:text-xl font-bold text-white transition-transform duration-150 ${bump ? 'scale-110' : 'scale-100'}`}>
            {cantidadSeleccionada}
          </div>
          <button
            type="button"
            onClick={() => setCantidad(cantidadSeleccionada + 1)}
            disabled={cantidadSeleccionada >= maxPermitido || disponiblesCount === 0}
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gray-700 text-white text-lg sm:text-xl hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label="Aumentar"
          >
            +
          </button>
        </div>

        {cantidadSeleccionada >= maxPermitido && disponiblesCount > 0 && (
          <div className="mt-2 text-xs sm:text-sm text-gray-300">
            <span className="text-amber-300">Alcanzaste el máximo disponible</span>
          </div>
        )}

        {/* Panel resumen cantidad + total */}
  <div className={`mt-4 rounded-lg border bg-slate-800/60 px-4 py-3 ${formErrors.cantidad ? 'border-red-500 animate-pulse' : 'border-gray-700'}`}>
          <div className="flex justify-between text-xs sm:text-sm">
            <span>Tickets seleccionados: <span className="font-semibold text-white">{cantidadSeleccionada}</span></span>
            <span>
              Total: <span className="font-semibold text-white whitespace-nowrap">
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
  {rifaSeleccionada?.mostrarTopCompradores && (
  <div className="mt-4 rounded-xl border border-red-700/40 bg-red-900/20">
          <button
            type="button"
            onClick={() => setTopOpen((v) => !v)}
            className="w-full flex items-center justify-between px-3 py-2 sm:px-4 sm:py-3 text-left"
          >
            <span className="font-semibold text-sm">Top compradores</span>
            <span className="text-xs sm:text-sm opacity-80">{topOpen ? 'Ocultar' : 'Ver lista'}</span>
          </button>
          {topOpen && (
            <div className="px-3 sm:px-4 pb-3 max-h-48 sm:max-h-64 overflow-y-auto pr-1 scrollbar-modern">
              {topCompradores.length === 0 ? (
                <div className="text-sm text-gray-400">Aún no hay compradores destacados</div>
              ) : (
                <ul className="space-y-2">
                  {topCompradores.map((c, idx) => (
                    <li key={c.participanteId} className="flex items-center justify-between rounded-lg bg-black/20 border border-white/5 px-3 py-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-red-600 text-white">#{idx + 1}</span>
                        <span className="font-medium text-xs sm:text-sm">{c.nombre}</span>
                      </div>
                      <div className="text-xs sm:text-sm text-gray-300">
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
  )}
      </div>

  {/* Eliminado: grilla de números */}
  <div className="hidden" />

      {/* Información personal */}
  <div className="lg:max-w-4xl lg:mx-auto rounded-xl card-modern p-4 sm:p-5 form-modern">
        <h3 className="text-base sm:text-lg font-semibold mb-3 text-yellow-300">Información personal</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input
            type="text"
            placeholder="Nombre completo *"
            value={nombre}
            onChange={(e) => { setNombre(e.target.value); setFormErrors((prev) => { const p = { ...prev }; delete p.nombre; return p; }); }}
            className={`w-full px-3 py-2 md:px-4 md:py-3 text-sm md:text-base bg-gray-800/80 text-white rounded-lg border focus:ring-2 focus:outline-none transition-all duration-200 placeholder-gray-400 ${formErrors.nombre ? 'border-red-500 focus:border-red-500 focus:ring-red-500/40 animate-pulse' : 'border-gray-600 focus:border-yellow-500 focus:ring-yellow-500/20'}`}
          />
          {formErrors.nombre && <p className="text-xs text-red-400 -mt-2 mb-1">{formErrors.nombre}</p>}
          <input
            type="tel"
            placeholder="Celular *"
            value={celular}
            onChange={(e) => { setCelular(e.target.value); setFormErrors((prev) => { const p = { ...prev }; delete p.celular; return p; }); }}
            className={`w-full px-3 py-2 md:px-4 md:py-3 text-sm md:text-base bg-gray-800/80 text-white rounded-lg border focus:ring-2 focus:outline-none transition-all duration-200 placeholder-gray-400 ${formErrors.celular ? 'border-red-500 focus:border-red-500 focus:ring-red-500/40 animate-pulse' : 'border-gray-600 focus:border-yellow-500 focus:ring-yellow-500/20'}`}
          />
          {formErrors.celular && <p className="text-xs text-red-400 -mt-2 mb-1">{formErrors.celular}</p>}
          <input
            type="email"
            placeholder="Email (opcional)"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setFormErrors((prev) => { const p = { ...prev }; delete p.email; return p; }); }}
            className={`w-full md:col-span-2 px-3 py-2 md:px-4 md:py-3 text-sm md:text-base bg-gray-800/80 text-white rounded-lg border focus:ring-2 focus:outline-none transition-all duration-200 placeholder-gray-400 ${formErrors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500/40 animate-pulse' : 'border-gray-600 focus:border-yellow-500 focus:ring-yellow-500/20'}`}
          />
          {formErrors.email && <p className="text-xs text-red-400 -mt-2 mb-1 md:col-span-2">{formErrors.email}</p>}
        </div>
      </div>

      {/* Método de pago */}
      <div>
        <PaymentMethods
          total={rifaSeleccionada ? cantidadSeleccionada * rifaSeleccionada.precioPorBoleto : undefined}
          ticketsCount={cantidadSeleccionada}
          selectedId={metodoPagoId}
          onSelect={(id) => {
            setMetodoPagoId(id)
            setFormErrors((prev) => { const p = { ...prev }; delete p.metodoPagoId; return p })
          }}
        />
        {formErrors.metodoPagoId && <p className="text-xs text-red-400 -mt-2 mb-3">{formErrors.metodoPagoId}</p>}

        <input
          type="text"
          placeholder="Referencia del pago (opcional)"
          value={referencia}
          onChange={(e) => setReferencia(e.target.value)}
          className="w-full px-3 py-2 md:px-4 md:py-3 text-sm md:text-base bg-gray-800/80 text-white rounded-lg border border-gray-600 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 focus:outline-none mt-4 transition-all duration-200 placeholder-gray-400"
        />

        {/* Subir comprobante de pago */}
        <div className="mt-4 p-3 md:p-4 bg-gray-800/60 rounded-lg border border-gray-600/50">
          <label className="block text-xs sm:text-sm font-medium text-yellow-300 mb-2">
            📄 Subir comprobante de pago (opcional)
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={manejarImagenComprobante}
            className="w-full px-2 py-1 md:px-3 md:py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 focus:outline-none file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs md:file:text-sm file:font-semibold file:bg-yellow-600 file:text-white hover:file:bg-yellow-700"
          />
          {previewImagen && (
            <div className="mt-3">
              <img 
                src={previewImagen} 
                alt="Preview comprobante" 
                className="max-w-full h-24 md:h-32 object-cover rounded border border-gray-600"
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
  <div className="bg-gradient-to-r from-gray-800/80 to-gray-700/80 p-4 sm:p-6 rounded-xl border border-gray-600/50 backdrop-blur-sm lg:max-w-3xl lg:mx-auto">
        <div className="flex justify-between items-center">
          <span className="text-base sm:text-lg font-semibold flex items-center">
            <span className="mr-2">💰</span>
            Total a pagar:
          </span>
          <div className="text-right">
            <div className="text-2xl sm:text-3xl font-bold text-yellow-300 whitespace-nowrap">
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
            <div className="text-xs sm:text-sm text-gray-300">
                {cantidadSeleccionada} ticket{cantidadSeleccionada > 1 ? 's' : ''} × {moneda
                  ? formatCurrencyFlexible(rifaSeleccionada?.precioPorBoleto || 0, {
                      code: moneda?.code || 'VES',
                      symbol: moneda?.symbol || 'Bs.',
                      locale: moneda?.locale || 'es-VE',
                      position: moneda?.position || 'suffix',
                    })
                  : `$ ${rifaSeleccionada?.precioPorBoleto}`}
            </div>
          </div>
        </div>
      </div>

      {/* Error de compra visible */}
      {errorCompra && (
        <div className="bg-red-500/10 border border-red-500/40 rounded-lg p-3 text-red-200">
          <div className="font-semibold mb-1 text-sm">No se pudo completar la compra</div>
          <div className="text-xs whitespace-pre-wrap">{errorCompra}</div>
        </div>
      )}

  {/* Términos y condiciones */}
  <div className={`bg-yellow-500/10 border rounded-lg p-3 sm:p-4 ${formErrors.aceptaTerminos ? 'border-red-500' : 'border-yellow-500/30'} lg:max-w-3xl lg:mx-auto`}>
        <label className="flex items-start space-x-3 text-xs sm:text-sm cursor-pointer leading-snug">
          <input 
            type="checkbox"
            checked={aceptaTerminos}
            onChange={(e) => { setAceptaTerminos(e.target.checked); setFormErrors((prev) => { const p = { ...prev }; delete p.aceptaTerminos; return p; }); }}
            className={`mt-1 w-4 h-4 text-yellow-500 bg-gray-800 rounded focus:ring-2 ${formErrors.aceptaTerminos ? 'border-red-500 focus:ring-red-500' : 'border-gray-600 focus:ring-yellow-500'}`}
          />
          <span className="text-gray-200">
            Al presionar <strong className="text-yellow-300">"Finalizar Compra"</strong> aceptas haber leído y estar de acuerdo con nuestros 
            <a href="#" className="text-yellow-300 hover:text-yellow-200 underline ml-1">Términos y Condiciones</a>
          </span>
        </label>
        {formErrors.aceptaTerminos && <p className="text-xs text-red-400 mt-2">{formErrors.aceptaTerminos}</p>}
      </div>

      {/* Ayuda: habilitar botón */}
      {!aceptaTerminos && (
        <div className="text-xs text-gray-400 mt-2 lg:max-w-3xl lg:mx-auto text-center">
          Marca “Términos y Condiciones” para habilitar el botón
        </div>
      )}

      {/* Botón de compra */}
    <button 
        onClick={procesarCompra}
        disabled={procesando || !aceptaTerminos || cantidadSeleccionada < 1}
        className={`
      mt-2 w-full font-bold py-3 px-5 sm:py-4 sm:px-6 rounded-xl text-base sm:text-lg transition-all duration-300 transform lg:max-w-3xl lg:mx-auto btn-shine
          ${procesando || !aceptaTerminos || cantidadSeleccionada < 1
            ? 'bg-gray-700/70 text-gray-400 cursor-not-allowed ring-1 ring-white/10'
            : 'bg-gradient-to-r from-yellow-500 to-amber-500 text-black hover:from-yellow-400 hover:to-amber-400 hover:scale-105 shadow-xl shadow-yellow-900/10 ring-1 ring-yellow-300/30'
          }
        `}
      >
        {procesando ? (
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-black"></div>
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

      {/* Modal de Tickets Post-Compra */}
      {mostrarModalTickets && ticketsAsignados && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="relative w-full max-w-5xl max-h-[90vh] overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-gray-900 to-gray-800 shadow-2xl">
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
              <div>
                <div className="text-lg font-bold text-yellow-300">¡Gracias por tu compra!</div>
                {ultimaCompra?.referencia && (
                  <div className="text-xs text-gray-300">Ref: {ultimaCompra.referencia}</div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <div className="flex bg-black/30 rounded-md p-1 text-xs">
                  <button
                    className={`px-2 py-1 rounded ${mostrarSoloNumeros ? '' : 'bg-yellow-500 text-black'}`}
                    onClick={() => setMostrarSoloNumeros(false)}
                  >Ver tickets</button>
                  <button
                    className={`px-2 py-1 rounded ${mostrarSoloNumeros ? 'bg-yellow-500 text-black' : ''}`}
                    onClick={() => setMostrarSoloNumeros(true)}
                  >Sólo números</button>
                </div>
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 rounded-md bg-white/10 hover:bg-white/20 text-white text-xs border border-white/10"
                  title="Imprimir"
                >🖨️ Imprimir</button>
                <button
                  onClick={() => { setMostrarModalTickets(false); setTicketsAsignados(null); setQrMap({}); }}
                  className="w-9 h-9 rounded-full bg-white text-black grid place-items-center"
                  aria-label="Cerrar"
                >✕</button>
              </div>
            </div>
            <div className="p-4 overflow-auto max-h-[calc(90vh-56px)] scrollbar-modern">
              {mostrarSoloNumeros ? (
                <div className="text-center">
                  <div className="text-sm text-gray-300 mb-2">Números asignados</div>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {ticketsAsignados.map(n => (
                      <span key={n} className="px-3 py-1 rounded bg-black/40 border border-white/10 font-mono text-yellow-200">
                        {String(n).padStart(4, '0')}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {ticketsAsignados.map(n => {
                    const padded = String(n).padStart(4, '0')
                    const bg = rifaSeleccionada?.portadaUrl || ''
                    return (
                      <div key={n} className="group relative rounded-[20px] border border-white/10 overflow-hidden shadow-2xl transition-all duration-300 hover:shadow-[0_16px_60px_rgba(0,0,0,0.5)] hover:-translate-y-0.5">
                        {/* Background image with gradient overlay */}
                        <div className="absolute inset-0">
                          <div
                            className="absolute inset-0 bg-center bg-cover"
                            style={{ backgroundImage: bg ? `url(${bg})` : undefined, filter: 'blur(0px)', opacity: 0.22 }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/40 to-black/70" />
                        </div>

                        {/* Ticket body with perforation */}
                        <div className="relative grid grid-cols-[1fr_auto]">
                          {/* Left content */}
                          <div className="p-4 pr-3 sm:p-5">
                            <div className="text-[11px] uppercase tracking-wider text-gray-300/90 flex items-center gap-2">
                              <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})` }} />
                              Ticket de Participación
                            </div>
                            <div className="mt-1 text-base font-semibold text-yellow-300 line-clamp-1">
                              {rifaSeleccionada?.nombre}
                            </div>
                            <div className="mt-2">
                              <div className="text-[10px] text-gray-300/90">Nº de ticket</div>
                              <div className="text-4xl font-black tracking-widest font-mono text-transparent bg-clip-text bg-gradient-to-br from-yellow-200 via-amber-300 to-orange-400 drop-shadow-[0_1px_0_rgba(0,0,0,0.6)]">
                                {padded}
                              </div>
                            </div>
                            <div className="mt-2 grid grid-cols-2 gap-3 text-[11px] text-gray-300/90">
                              <div className="space-y-0.5">
                                <div className="opacity-80">Fecha</div>
                                <div className="font-medium text-white">{new Date().toLocaleString()}</div>
                              </div>
                              <div className="space-y-0.5 text-right">
                                <div className="opacity-80">Ref</div>
                                <div className="font-mono">{ultimaCompra?.compraId?.slice(0,8)}…</div>
                              </div>
                            </div>
                            <div className="mt-2 text-[11px] text-gray-300/90">
                              A nombre de <span className="font-medium text-white">{nombre || '—'}</span>
                            </div>
                          </div>

                          {/* Perforated divider */}
                          <div className="relative w-[1px] bg-gradient-to-b from-transparent via-white/10 to-transparent mx-2">
                            <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-[2px] bg-[radial-gradient(circle,var(--tw-shadow-color)_1px,transparent_1.5px)] [--tw-shadow-color:rgba(255,255,255,0.35)] bg-[length:2px_8px] bg-repeat-y opacity-60" />
                          </div>

                          {/* Right stub with QR */}
                          <div className="p-3 pl-2 sm:p-4 flex items-center">
                            <div className="relative rounded-xl bg-white p-2 shadow-inner">
                              {qrMap[n] ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={qrMap[n]} alt={`QR ${padded}`} className="w-24 h-24 sm:w-28 sm:h-28 rounded" />
                              ) : (
                                <div className="w-24 h-24 sm:w-28 sm:h-28 grid place-items-center text-xs text-gray-500 border border-gray-200 rounded">
                                  QR
                                </div>
                              )}
                              <div className="absolute -top-2 -right-2 bg-black text-white text-[10px] px-2 py-0.5 rounded-full shadow">{padded}</div>
                            </div>
                          </div>
                        </div>

                        {/* Notches to simulate real ticket cutouts */}
                        <div className="pointer-events-none">
                          <div className="absolute -left-3 top-12 h-6 w-6 rounded-full bg-black/90 border border-white/10" />
                          <div className="absolute -right-3 top-12 h-6 w-6 rounded-full bg-black/90 border border-white/10" />
                        </div>

                        {/* Subtle hover shine */}
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                          <div className="absolute -inset-x-10 -top-20 h-40 rotate-12 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
            {/* Inject minimal keyframes for optional shimmer/print improvements */}
            <style>{`
              @media print {
                .group { break-inside: avoid; }
              }
            `}</style>
          </div>
        </div>
      )}

      {/* Lightbox para la portada */}
      {posterZoomOpen && !posterError && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setPosterZoomOpen(false)}
        >
          <div className="relative max-w-[90vw] max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={rifaSeleccionada?.portadaUrl || ''}
              alt={rifaSeleccionada ? `Portada de ${rifaSeleccionada.nombre}` : 'Portada'}
              className="w-auto h-auto max-w-[90vw] max-h-[90vh] object-contain rounded-xl shadow-2xl"
            />
            <button
              type="button"
              aria-label="Cerrar"
              onClick={() => setPosterZoomOpen(false)}
              className="absolute -top-3 -right-3 w-10 h-10 rounded-full bg-white text-black shadow-xl grid place-items-center"
              title="Cerrar"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
    </div>
  </div>
  )
}
 
