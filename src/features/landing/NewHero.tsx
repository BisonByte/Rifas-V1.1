'use client'

import { useState, useEffect, TouchEvent } from 'react'
import { get } from '@/lib/api-client'

interface NewHeroProps {
  rifas: Array<{ id: string; nombre?: string; portadaUrl?: string | null }>
  currentIndex: number
  onPrev: () => void
  onNext: () => void
  onSelect: (index: number) => void
}

export function NewHero({ rifas, currentIndex, onPrev, onNext, onSelect }: NewHeroProps) {
  const [config, setConfig] = useState<Record<string, string>>({
    titulo: 'JUEGA CON FE & DISFRÚTALO',
    subtitulo: 'Tu suerte está esperando',
    fondo_video_url: ''
  })

  useEffect(() => {
    // Cargar configuración del sitio (tolera {success,data} u arreglo legacy)
    get('/api/configuracion')
      .then((json: any) => {
        const payload: any = json?.success ? json.data : json
        const configObj: Record<string, string> = {}

        if (Array.isArray(payload)) {
          payload.forEach((item: any) => {
            configObj[item.clave] = item.valor
          })
        } else if (payload && typeof payload === 'object') {
          Object.entries(payload).forEach(([k, v]) => {
            configObj[k] = String(v)
          })
        }

        setConfig(prev => ({ ...prev, ...configObj }))
      })
      .catch(console.error)
  }, [])

  const currentRifa = rifas[currentIndex]
  const [touchStart, setTouchStart] = useState<number | null>(null)

  const handleTouchStart = (e: TouchEvent) => {
    setTouchStart(e.touches[0].clientX)
  }

  const handleTouchEnd = (e: TouchEvent) => {
    if (touchStart === null) return
    const diff = touchStart - e.changedTouches[0].clientX
    if (diff > 50) onNext()
    else if (diff < -50) onPrev()
    setTouchStart(null)
  }

  return (
    <section
      className="relative h-40 flex items-center justify-center text-center overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {currentRifa?.portadaUrl ? (
        <img
          src={currentRifa.portadaUrl}
          alt={currentRifa.nombre || 'Portada'}
          className="absolute inset-0 w-full h-full object-cover opacity-50"
        />
      ) : (
        config.fondo_video_url && (
          <video
            className="absolute inset-0 w-full h-full object-cover opacity-30"
            src={config.fondo_video_url}
            autoPlay
            loop
            muted
            playsInline
          />
        )
      )}

      <div className="relative z-10 px-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-2 text-yellow-300">
          {config.titulo}
        </h1>
        <p className="text-lg opacity-90">
          {config.subtitulo}
        </p>
      </div>

      {rifas.length > 1 && (
        <>
          <button
            onClick={onPrev}
            aria-label="Anterior"
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 p-2 rounded-full"
          >
            ‹
          </button>
          <button
            onClick={onNext}
            aria-label="Siguiente"
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 p-2 rounded-full"
          >
            ›
          </button>
          <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-2">
            {rifas.map((_, i) => (
              <button
                key={i}
                aria-label={`Ir al sorteo ${i + 1}`}
                onClick={() => onSelect(i)}
                className={`w-2 h-2 rounded-full ${i === currentIndex ? 'bg-yellow-300' : 'bg-white/50'}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  )
}
