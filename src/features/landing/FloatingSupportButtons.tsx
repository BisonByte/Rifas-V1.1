'use client'

import { useEffect, useMemo, useState } from 'react'
import { TicketVerifier } from '@/features/landing/TicketVerifier'
import { get } from '@/lib/api-client'

type SiteConfig = Record<string, any>

function classNames(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

function toWhatsAppUrl(rawNumber?: string, text?: string) {
  if (!rawNumber) return '#'
  const number = (rawNumber || '').replace(/[^0-9]/g, '')
  const msg = encodeURIComponent(text || 'Hola, necesito ayuda con la rifa.')
  return `https://wa.me/${number}?text=${msg}`
}

function YouTubeEmbed({ url }: { url: string }) {
  const embed = useMemo(() => {
    try {
      if (url.includes('youtube.com/watch') || url.includes('youtu.be/')) {
        const idMatch = url.match(/(?:v=|youtu\.be\/)([\w-]{11})/)
        const id = idMatch?.[1]
        if (id) return `https://www.youtube.com/embed/${id}`
      }
    } catch {}
    return null
  }, [url])

  if (!embed) return null
  return (
    <div className="aspect-video w-full rounded-xl overflow-hidden shadow">
      <iframe
        src={embed}
        className="w-full h-full"
        title="Cómo participar"
        frameBorder={0}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      />
    </div>
  )
}

function Modal({ open, onClose, children, title }: { open: boolean; onClose: () => void; children: React.ReactNode; title: string }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative z-10 w-full max-w-3xl rounded-2xl gradient-border card-modern bg-black text-white">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <h3 className="text-lg font-bold">{title}</h3>
          <button onClick={onClose} className="rounded-full bg-white/10 hover:bg-white/20 transition p-2">✕</button>
        </div>
        <div className="p-5">
          {children}
        </div>
      </div>
    </div>
  )
}

export function FloatingSupportButtons() {
  const [openVerifier, setOpenVerifier] = useState(false)
  const [openHelp, setOpenHelp] = useState(false)
  const [config, setConfig] = useState<SiteConfig>({})

  useEffect(() => {
    get('/api/configuracion')
      .then((json: any) => {
        // Tolerar ambas formas: {success, data} o lista/objeto directo
        const maybe = (json?.success ? json.data : json) as any
        if (Array.isArray(maybe)) {
          const obj: Record<string, any> = {}
          for (const it of maybe) obj[it.clave] = it.valor
          setConfig(obj)
        } else {
          setConfig(maybe || {})
        }
      })
      .catch(() => {})
  }, [])

  const waUrl = toWhatsAppUrl(config.whatsapp_numero, config.whatsapp_texto || 'Hola, necesito ayuda con la rifa.')

  return (
    <>
  {/* Right side floating row */}
  <div className="fixed right-4 bottom-6 z-50 flex flex-row items-center gap-3">
        {/* WhatsApp */}
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={classNames(
    'relative group w-14 h-14 rounded-full shadow-xl transition-all duration-200',
    'bg-gradient-to-b from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 ring-4 ring-green-600/25 shadow-green-700/30',
    'flex items-center justify-center text-white text-2xl'
          )}
          title="Soporte"
      aria-label="WhatsApp"
        >
          {/* WhatsApp SVG */}
      <svg viewBox="0 0 24 24" aria-hidden className="w-7 h-7">
            <path fill="currentColor" d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          <span className="pointer-events-none absolute right-full mr-2 px-2 py-1 rounded bg-black/80 text-white text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">Soporte</span>
        </a>

        {/* Verificador */}
        <button
          onClick={() => setOpenVerifier(true)}
          className={classNames(
            'relative w-14 h-14 rounded-full shadow-xl transition-all duration-200',
            'bg-white hover:bg-red-50 ring-4 ring-white/40',
            'flex items-center justify-center text-red-600 text-2xl'
          )}
          title="Verificador"
        >
          {/* Magnifier icon */}
          <svg viewBox="0 0 24 24" className="w-7 h-7" aria-hidden>
            <path fill="currentColor" d="M16.32 14.9h-.79l-.28-.27a6.471 6.471 0 0 0 1.57-4.23A6.5 6.5 0 1 0 10.32 17c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L21.31 20zm-6 0A4.9 4.9 0 1 1 15.22 10a4.9 4.9 0 0 1-4.9 4.9z"/>
          </svg>
          <span className="pointer-events-none absolute right-full mr-2 px-2 py-1 rounded bg-black/80 text-white text-xs whitespace-nowrap opacity-0 hover:opacity-100 transition-opacity">Verificador</span>
        </button>
      </div>

      {/* Left side help button */}
      <div className="fixed left-4 bottom-6 z-50">
        <button
          onClick={() => setOpenHelp(true)}
          className="group relative rounded-full px-5 py-3 bg-white text-red-600 font-semibold shadow-xl transition-all hover:shadow-2xl hover:-translate-y-0.5 ring-8 ring-white/40"
        >
          <span className="absolute inset-0 rounded-full border border-red-400/60"></span>
          <span className="mr-2">❓</span> ¿Cómo participar?
        </button>
      </div>

      {/* Verifier modal */}
      <Modal open={openVerifier} onClose={() => setOpenVerifier(false)} title="Verificador de Tickets">
        <div id="verificador">
          <TicketVerifier />
        </div>
      </Modal>

      {/* Help modal */}
      <Modal open={openHelp} onClose={() => setOpenHelp(false)} title="¿Cómo participar?">
        <div className="space-y-4">
          {config.ayuda_video_url ? (
            <>
              <YouTubeEmbed url={config.ayuda_video_url} />
              {!config.ayuda_video_url.includes('youtube') && (
                <video
                  className="w-full rounded-xl"
                  src={config.ayuda_video_url}
                  controls
                />
              )}
            </>
          ) : null}
          {config.ayuda_texto_html ? (
            <div
              className="prose prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: String(config.ayuda_texto_html) }}
            />
          ) : !config.ayuda_video_url ? (
            <div className="text-sm text-white/90 space-y-2">
              <p>1) Selecciona tus números disponibles</p>
              <p>2) Completa tus datos</p>
              <p>3) Elige el método de pago y confirma</p>
            </div>
          ) : null}
        </div>
      </Modal>
    </>
  )
}
