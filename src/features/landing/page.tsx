'use client'

import { Suspense, useState, useEffect } from 'react'
import { CompraRifa } from '@/features/landing/CompraRifa'
import { NewFooter } from '@/features/landing/NewFooter'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { FloatingSupportButtons } from '@/features/landing/FloatingSupportButtons'
import { get } from '@/lib/api-client'

// Disable static generation due to dynamic content
export const dynamic = 'force-dynamic'

export default function HomePage() {
  const [stats, setStats] = useState<{ disponibles: number; vendidos: number; reservados: number; total: number }>({ disponibles: 0, vendidos: 0, reservados: 0, total: 0 })
  const [hasActiveRifa, setHasActiveRifa] = useState(false)
  const [premiosPreview, setPremiosPreview] = useState<Array<{ id: string; titulo: string; descripcion?: string; cantidad?: number; orden?: number }>>([])
  const [rifas, setRifas] = useState<any[]>([])
  const [currentRifaIndex, setCurrentRifaIndex] = useState(0)
  const [config, setConfig] = useState<{ logo_url?: string } | null>(null)

  // Cargar configuración general
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const cfgResp = await get('/api/configuracion') as any
        const data = cfgResp?.success ? cfgResp.data : cfgResp
        setConfig(data ?? {})
      } catch (error) {
  console.error('Error cargando configuración:', error)
        setConfig({})
      }
    }
    loadConfig()
  }, [])

  // Cargar todas las rifas activas
  useEffect(() => {
    const loadRifas = async () => {
      try {
        const rifasResp = await get('/api/rifas') as any
        const data = rifasResp?.success ? rifasResp.data : rifasResp
        if (Array.isArray(data) && data.length > 0) {
          setRifas(data)
          setHasActiveRifa(true)
        } else {
          setHasActiveRifa(false)
          setPremiosPreview([])
        }
      } catch (error) {
        console.error('Error cargando rifas:', error)
        setHasActiveRifa(false)
        setPremiosPreview([])
      }
    }
    loadRifas()
  }, [])

  // Cargar estadísticas de la rifa seleccionada
  useEffect(() => {
    const current = rifas[currentRifaIndex]
    if (!current) return
    const loadStats = async () => {
      try {
        const statsResp = await get(`/api/rifas/${current.id}/stats`) as any
        if (statsResp?.success && statsResp.data) setStats(statsResp.data)
        const premios = Array.isArray(current.premios) ? [...current.premios] : []
        premios.sort((a: any, b: any) => (a.orden ?? 0) - (b.orden ?? 0))
        setPremiosPreview(premios)
      } catch (error) {
  console.error('Error cargando estadísticas de tickets:', error)
      }
    }
    loadStats()
  }, [currentRifaIndex, rifas])

  const totalRifas = rifas.length
  const nextRifa = () => setCurrentRifaIndex(i => (totalRifas ? (i + 1) % totalRifas : 0))
  const prevRifa = () => setCurrentRifaIndex(i => (totalRifas ? (i - 1 + totalRifas) % totalRifas : 0))
  const selectRifa = (i: number) => setCurrentRifaIndex(i)

  const progress = stats.total > 0 ? ((stats.vendidos + stats.reservados) / stats.total) * 100 : 0
  const disponiblesPct = stats.total > 0 ? Math.round((stats.disponibles / stats.total) * 100) : 0
  const vendidosPct = stats.total > 0 ? Math.round((stats.vendidos / stats.total) * 100) : 0
  const reservadosPct = stats.total > 0 ? Math.round((stats.reservados / stats.total) * 100) : 0

  // Animaciones sutiles de conteo y barra
  const [animPct, setAnimPct] = useState({ disp: 0, vend: 0, res: 0, prog: 0 })
  useEffect(() => {
    const duration = 700
    const start = performance.now()
    const from = { ...animPct }
    const to = { disp: disponiblesPct, vend: vendidosPct, res: reservadosPct, prog: Math.round(progress) }
    let raf = 0
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration)
      const ease = 1 - Math.pow(1 - t, 3) // easeOutCubic
      setAnimPct({
        disp: Math.round(from.disp + (to.disp - from.disp) * ease),
        vend: Math.round(from.vend + (to.vend - from.vend) * ease),
        res: Math.round(from.res + (to.res - from.res) * ease),
        prog: Math.round(from.prog + (to.prog - from.prog) * ease),
      })
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [disponiblesPct, vendidosPct, reservadosPct, progress])

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Fondo con efectos modernos */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black spotlight" />
      {/* luces suaves */}
      <div className="pointer-events-none absolute -top-20 -left-20 h-[40rem] w-[40rem] rounded-full bg-amber-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-[40rem] w-[40rem] rounded-full bg-cyan-500/10 blur-3xl" />

      {/* Header mejorado */}
      <header className="fixed top-4 left-0 right-0 z-40 px-4">
        <div className="container mx-auto flex justify-between items-center glass-nav rounded-2xl px-4 py-3 gradient-border shadow-2xl">
          {/* Branding */}
          <a href="#inicio" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center shadow-lg ring-1 ring-white/10 overflow-hidden">
              {config?.logo_url ? (
                <img src={config.logo_url} alt="Logo" className="w-10 h-10 object-contain" />
              ) : (
                <span className="text-xl">🍀</span>
              )}
            </div>
            <span className="text-lg md:text-xl font-extrabold tracking-tight">
              JUEGA CON FE & DISFRÚTALO
            </span>
          </a>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <a href="#inicio" className="link-underline opacity-90 hover:opacity-100">Inicio</a>
            <a href="#participar" className="link-underline opacity-90 hover:opacity-100">Participar</a>
            <a href="#verificar" className="link-underline opacity-90 hover:opacity-100">Verificar</a>
            <a href="#soporte" className="link-underline opacity-90 hover:opacity-100">Soporte</a>
            <a href="#participar" className="ml-2 inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-black font-semibold px-4 py-2 shadow hover:shadow-lg transition btn-shine">
              Participar ahora
            </a>
          </nav>

          {/* Mobile menu button */}
          <MobileMenu />
        </div>
      </header>

      {/* Offset for fixed header */}
      <div id="inicio" className="pt-28" />

  <main className="relative z-10">
        {/* Hero eliminado: mantenemos una experiencia simple y profesional
            Deslizamiento en móvil y flechas en escritorio se gestionan dentro de CompraRifa */}

  {/* Sección principal de juego */}
  <section id="participar" className="py-10 md:py-14">
          <div className="container mx-auto px-4">
            {/* Layout responsivo: móvil estrecho, desktop ancho */}
            <div className="max-w-md mx-auto lg:max-w-4xl xl:max-w-7xl">
      <div className="rounded-3xl p-6 md:p-8 shadow-2xl gradient-border card-modern">
                {/* Layout grid para desktop */}
                <div className="lg:grid lg:grid-cols-2 lg:gap-8 lg:items-start">
                  {/* Columna principal - Info y compra */}
                  <div className="space-y-6">
                    {/* Componente integrado de compra */}
                    <Suspense fallback={<LoadingSpinner />}>
                      <CompraRifa />
                    </Suspense>                    {false && rifas.length > 1 && (
                      <div className="mt-2 flex items-center justify-center gap-2 text-white">
                        <span className="inline-flex items-center rounded-full bg-black/60 text-white/90 text-[11px] px-2 py-0.5 ring-1 ring-white/10">
                          {currentRifaIndex + 1} / {rifas.length}
                        </span>
                        <button
                          type="button"
                          onClick={nextRifa}
                          className="inline-flex items-center gap-1 rounded-full bg-black/60 text-white text-[11px] px-2.5 py-1 ring-1 ring-white/10 hover:bg-black/70 active:scale-95 transition"
                          aria-label="Ver siguiente sorteo"
                        >
                          Desliza
                          <svg viewBox="0 0 24 24" className="w-4 h-4" aria-hidden>
                            <path fill="currentColor" d="M8.59 16.59L10 18l6-6l-6-6l-1.41 1.41L13.17 12z" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                  
                  {/* Columna lateral para desktop - Info adicional */}
                  <div className="hidden lg:block space-y-6 mt-8 lg:mt-0">
                    {/* Panel de información */}
        <div className="rounded-xl p-6 card-modern">
                        <h3 className="text-xl font-bold text-yellow-300 mb-4 flex items-center">
                        <span className="mr-2">🎯</span>
                        ¿Cómo participar?
                      </h3>
                      <div className="space-y-3 text-sm">
                        <div className="flex items-start space-x-2">
                          <span className="text-yellow-400 font-bold">1.</span>
                          <span>Selecciona tus números de la suerte</span>
                        </div>
                        <div className="flex items-start space-x-2">
                          <span className="text-yellow-400 font-bold">2.</span>
                          <span>Completa tus datos personales</span>
                        </div>
                        <div className="flex items-start space-x-2">
                          <span className="text-yellow-400 font-bold">3.</span>
                          <span>Elige tu método de pago preferido</span>
                        </div>
                        <div className="flex items-start space-x-2">
                          <span className="text-yellow-400 font-bold">4.</span>
                          <span>Confirma tu compra y ¡listo!</span>
                        </div>
                      </div>
                    </div>


                    {/* Panel de premios (solo si hay rifa activa) */}
                    {hasActiveRifa && premiosPreview.length > 0 && (
                      <div className="rounded-xl p-6 card-modern">
                        <h3 className="text-xl font-bold text-yellow-300 mb-4 flex items-center">
                          <span className="mr-2">🏆</span>
                          Premios
                        </h3>
                        <div className="space-y-3 text-sm">
                          {premiosPreview.slice(0, 4).map((p, idx) => (
                            <div key={p.id ?? idx} className="flex items-center space-x-3 p-3 bg-yellow-500/20 rounded-lg border border-yellow-500/30">
                              <span className="text-2xl">{idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : '🎁'}</span>
                              <div>
                                <div className="font-bold text-yellow-300">{idx + 1}º Premio</div>
                                <div className="text-xs opacity-90">{p.titulo || 'Premio'}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

  {/* Links sociales flotantes removidos a petición */}
      </main>

  {/* Anchor para soporte */}
  <div id="soporte" />

  {/* Footer */}
      <Suspense fallback={<div />}>
        <NewFooter />
      </Suspense>

  {/* Floating support buttons */}
  <FloatingSupportButtons />
    </div>
  )
}

function MobileMenu() {
  const [open, setOpen] = useState(false)
  return (
    <div className="md:hidden">
      <button
        onClick={() => setOpen((v) => !v)}
  aria-label="Menú"
        className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 ring-1 ring-white/10"
      >
        <svg viewBox="0 0 24 24" className="w-6 h-6" aria-hidden>
          <path fill="currentColor" d="M3 6h18v2H3V6m0 5h18v2H3v-2m0 5h18v2H3v-2" />
        </svg>
      </button>
      {open && (
        <div className="fixed inset-0 z-40" onClick={() => setOpen(false)}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div id="mobile-menu-panel" className="absolute inset-x-3 top-20 rounded-2xl glass-nav gradient-border p-3 shadow-2xl z-50 max-h-[70vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
            <nav className="flex flex-col gap-2 text-sm">
              <a href="#inicio" onClick={() => setOpen(false)} className="px-3 py-2 rounded-lg hover:bg-white/5">Inicio</a>
              <a href="#participar" onClick={() => setOpen(false)} className="px-3 py-2 rounded-lg hover:bg-white/5">Participar</a>
              <a href="#verificar" onClick={() => setOpen(false)} className="px-3 py-2 rounded-lg hover:bg-white/5">Verificar</a>
              <a href="#soporte" onClick={() => setOpen(false)} className="px-3 py-2 rounded-lg hover:bg-white/5">Soporte</a>
              <a href="#participar" onClick={() => setOpen(false)} className="mt-1 inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-black font-semibold px-3 py-2 shadow btn-shine">
                Participar ahora
              </a>
            </nav>
          </div>
        </div>
      )}
    </div>
  )
}

