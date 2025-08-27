'use client'

import { Suspense, useState, useEffect } from 'react'
import { NewHero } from '@/features/landing/NewHero'
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
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center shadow-lg ring-1 ring-white/10">
              <span className="text-xl">🍀</span>
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
        {/* Hero Section */}
        <Suspense fallback={<LoadingSpinner />}>
          <NewHero
            rifas={rifas}
            currentIndex={currentRifaIndex}
            onNext={nextRifa}
            onPrev={prevRifa}
            onSelect={selectRifa}
          />
        </Suspense>

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
                    </Suspense>
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

                    {/* Panel de estadísticas */}
                    <div className="rounded-xl p-4 sm:p-5 card-modern">
                      <h3 className="text-lg sm:text-xl font-bold text-yellow-300 mb-3 sm:mb-4 flex items-center">
                        <span className="mr-2">📊</span>
                        Estadísticas en vivo
                      </h3>
                      <div className="space-y-2.5 sm:space-y-3 text-[13px] sm:text-sm">
                        <div className="flex justify-between">
                          <span>🎫 Tickets disponibles:</span>
                          <span className="text-green-400 font-bold">{animPct.disp}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>🔥 Tickets vendidos:</span>
                          <span className="text-red-400 font-bold">{animPct.vend}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>⏳ Tickets reservados:</span>
                          <span className="text-yellow-400 font-bold">{animPct.res}%</span>
                        </div>
                        <div className="w-full bg-gray-700/80 rounded-full h-2 mt-3 sm:mt-4 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-green-500 via-yellow-500 to-amber-500 h-2 rounded-full transition-[width] duration-700 ease-out"
                            style={{ width: `${animPct.prog}%` }}
                          ></div>
                        </div>
                        <p className="text-center text-[11px] sm:text-xs opacity-75">{animPct.prog}% completado</p>
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
        <div className="absolute right-4 mt-3 w-56 rounded-2xl glass-nav gradient-border p-3 shadow-2xl">
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
      )}
    </div>
  )
}
