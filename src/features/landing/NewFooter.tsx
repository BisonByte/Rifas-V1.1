'use client'

import { useState, useEffect } from 'react'
import { get } from '@/lib/api-client'

interface RedSocial {
  id: string
  nombre: string
  url: string
  icono: string
  activo: boolean
}

export function NewFooter() {
  const [redes, setRedes] = useState<RedSocial[]>([])
  const [config, setConfig] = useState<Record<string, string>>({
    telefono_soporte: '',
    email_soporte: '',
    direccion: ''
  })

  type SocialPlatform =
    | 'instagram'
    | 'whatsapp'
    | 'tiktok'
    | 'facebook'
    | 'youtube'
    | 'telegram'
    | 'twitter'
    | 'x'
    | 'unknown'

  // Try to infer the social network from nombre or icono string
  const getPlatform = (r: RedSocial): SocialPlatform => {
    const s = `${r.nombre || ''} ${r.icono || ''}`.toLowerCase()
    if (s.includes('instagram')) return 'instagram'
    if (s.includes('whatsapp')) return 'whatsapp'
    if (s.includes('tiktok')) return 'tiktok'
    if (s.includes('facebook')) return 'facebook'
    if (s.includes('youtube')) return 'youtube'
    if (s.includes('telegram')) return 'telegram'
    if (s.includes('twitter')) return 'twitter'
    if (s === 'x' || s.includes(' x ')) return 'x'
    return 'unknown'
  }

  // Returns Tailwind classes for a rounded button with brand feel
  const platformClasses = (p: SocialPlatform) => {
    switch (p) {
      case 'instagram':
        return 'bg-white/5 hover:bg-white/10 text-white'
      case 'whatsapp':
        return 'bg-white/5 hover:bg-white/10 text-white'
      case 'tiktok':
        return 'bg-white/5 hover:bg-white/10 text-white'
      case 'facebook':
        return 'bg-white/5 hover:bg-white/10 text-white'
      case 'youtube':
        return 'bg-white/5 hover:bg-white/10 text-white'
      case 'telegram':
        return 'bg-white/5 hover:bg-white/10 text-white'
      case 'twitter':
      case 'x':
        return 'bg-white/5 hover:bg-white/10 text-white'
      default:
        return 'bg-white/5 hover:bg-white/10 text-white'
    }
  }

  // If API provides an icon URL or a known local path, use it (original logo).
  const resolveIconSrc = (r: RedSocial): string | null => {
    const icon = r.icono?.trim() || ''
    if (/^https?:\/\//i.test(icon)) return icon
    if (icon.endsWith('.svg') || icon.endsWith('.png') || icon.endsWith('.webp')) {
      // If it's a relative path like "instagram.svg" assume it is under /icons
      return icon.startsWith('/') ? icon : `/icons/${icon}`
    }
    const p = getPlatform(r)
    // Try conventional local path /icons/<platform>.svg
    if (p && p !== 'unknown') return `/icons/${p}.svg`
    return null
  }

  // SVG icons using currentColor so they adapt to text color
  const SocialIcon = ({ p, className }: { p: SocialPlatform; className?: string }) => {
    switch (p) {
      case 'instagram':
        return (
          <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
            <path fill="currentColor" d="M12 2.2c3.2 0 3.6 0 4.9.1 1.2.1 1.9.3 2.3.5.6.3 1 .6 1.5 1.1.5.5.8.9 1.1 1.5.2.4.4 1.1.5 2.3.1 1.3.1 1.7.1 4.9s0 3.6-.1 4.9c-.1 1.2-.3 1.9-.5 2.3-.3.6-.6 1-1.1 1.5-.5.5-.9.8-1.5 1.1-.4.2-1.1.4-2.3.5-1.3.1-1.7.1-4.9.1s-3.6 0-4.9-.1c-1.2-.1-1.9-.3-2.3-.5-.6-.3-1-.6-1.5-1.1-.5-.5-.8-.9-1.1-1.5-.2-.4-.4-1.1-.5-2.3C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.9c.1-1.2.3-1.9.5-2.3.3-.6.6-1 1.1-1.5.5-.5.9-.8 1.5-1.1.4-.2 1.1-.4 2.3-.5C8.4 2.2 8.8 2.2 12 2.2Zm0 1.8c-3.1 0-3.5 0-4.8.1-1 .1-1.6.3-2 .4-.5.2-.8.4-1.1.7-.3.3-.5.6-.7 1.1-.2.4-.4 1-.4 2-.1 1.3-.1 1.7-.1 4.8s0 3.5.1 4.8c.1 1 .3 1.6.4 2 .2.5.4.8.7 1.1.3.3.6.5 1.1.7.4.2 1 .4 2 .4 1.3.1 1.7.1 4.8.1s3.5 0 4.8-.1c1-.1 1.6-.3 2-.4.5-.2.8-.4 1.1-.7.3-.3.5-.6.7-1.1.2-.4.4-1 .4-2 .1-1.3.1-1.7.1-4.8s0-3.5-.1-4.8c-.1-1-.3-1.6-.4-2-.2-.5-.4-.8-.7-1.1a2.73 2.73 0 0 0-1.1-.7c-.4-.2-1-.4-2-.4-1.3-.1-1.7-.1-4.8-.1Zm0 3.5a6.5 6.5 0 1 1 0 13 6.5 6.5 0 0 1 0-13Zm0 2a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9Zm6-2.2a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z"/>
          </svg>
        )
      case 'whatsapp':
        return (
          <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
            <path fill="currentColor" d="M20.5 3.5A11 11 0 0 0 4.7 18.3L3 21l2.9-.8A11 11 0 1 0 20.5 3.5ZM12 20.2c-1.7 0-3.2-.5-4.6-1.4l-.3-.2-2.7.8.9-2.6-.2-.3a8.2 8.2 0 1 1 7 3.7Zm4.6-6.2c-.2-.1-1.3-.6-1.5-.7-.2-.1-.4-.1-.6.1l-.4.5c-.2.2-.4.2-.6.1-.3-.1-1-.4-1.9-1.2-.7-.6-1.2-1.4-1.4-1.6-.2-.3 0-.4.1-.6l.3-.4c.1-.2.1-.4 0-.6 0-.1-.4-1-.6-1.4-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.6.1-.9.4-.4.4-1.1 1.1-1.1 2.6s1.1 3 1.2 3.2c.2.2 2.2 3.4 5.3 4.6.7.3 1.3.5 1.7.6.7.2 1.3.2 1.8.1.6-.1 1.3-.6 1.5-1.2.2-.6.2-1.1.2-1.2 0-.1-.1-.2-.3-.3Z"/>
          </svg>
        )
      case 'tiktok':
        return (
          <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
            <path fill="currentColor" d="M13.5 3h2.4c.2 1 .7 2 1.4 2.8.8.8 1.8 1.3 2.9 1.5v2.4c-1.7-.1-3.3-.7-4.7-1.8v6.7c0 1.4-.5 2.6-1.4 3.6a5 5 0 0 1-3.7 1.6 5 5 0 1 1 0-10c.3 0 .6 0 .9.1v2.6c-.3-.1-.6-.1-.9-.1a2.4 2.4 0 0 0 0 4.8c.6 0 1.2-.2 1.7-.7.4-.4.7-1 .7-1.7V3Z"/>
          </svg>
        )
      case 'facebook':
        return (
          <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
            <path fill="currentColor" d="M22 12a10 10 0 1 0-11.6 9.9v-7h-2.4V12h2.4V9.8c0-2.4 1.4-3.7 3.6-3.7 1 0 2 .2 2 .2v2.2h-1.1c-1.1 0-1.5.7-1.5 1.4V12h2.5l-.4 2.9h-2v7A10 10 0 0 0 22 12Z"/>
          </svg>
        )
      case 'youtube':
        return (
          <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
            <path fill="currentColor" d="M23 12s0-3-.4-4.5c-.2-.8-.9-1.5-1.7-1.7C18.4 5 12 5 12 5s-6.4 0-8.9.8c-.8.2-1.5.9-1.7 1.7C1 9 1 12 1 12s0 3 .4 4.5c.2.8.9 1.5 1.7 1.7C5.6 19 12 19 12 19s6.4 0 8.9-.8c.8-.2 1.5-.9 1.7-1.7.4-1.5.4-4.5.4-4.5ZM9.8 15.2V8.8L15.5 12l-5.7 3.2Z"/>
          </svg>
        )
      case 'telegram':
        return (
          <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
            <path fill="currentColor" d="M21.9 4.1c.3.3.4.8.3 1.2l-3 14a1 1 0 0 1-1.6.6l-4.4-3.2-2.4 2.3c-.3.3-.8.3-1.2.1l.4-4.7 8.6-7.7-10.6 6-4.7-1.5c-.9-.3-.9-1.5 0-1.9l20-8a1 1 0 0 1 1.1.3Z"/>
          </svg>
        )
      case 'twitter':
      case 'x':
        return (
          <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
            <path fill="currentColor" d="M18 2h3l-7.5 8.6L22 22h-6.6l-5.2-6.8L3.9 22H1l8.1-9.3L2 2h6.7l4.7 6.2L18 2Zm-1.2 18h1.7L7.3 4H5.5L16.8 20Z"/>
          </svg>
        )
      default:
        return (
          <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
            <circle cx="12" cy="12" r="10" fill="currentColor" />
          </svg>
        )
    }
  }

  useEffect(() => {
    // Cargar redes sociales
    get('/api/redes-sociales')
      .then((json: any) => {
        const data = json?.success ? json.data : json
        setRedes(Array.isArray(data) ? data.filter((r: RedSocial) => r.activo) : [])
      })
      .catch(console.error)

    // Cargar configuración
    get('/api/configuracion')
      .then((json: any) => {
        const payload = json?.success ? json.data : json
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

  return (
    <footer className="relative z-10 bg-black bg-opacity-50 border-t border-red-600 mt-12">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Logo y descripción */}
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start space-x-2 mb-4">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-xl">🍀</span>
              </div>
              <span className="text-xl font-bold">JUEGA CON FE</span>
            </div>
            <p className="text-sm opacity-80">
              Tu plataforma de confianza para rifas y sorteos. 
              Juega responsablemente y disfruta de la emoción.
            </p>
          </div>

          {/* Información de contacto */}
          <div className="text-center">
            <h4 className="text-lg font-semibold text-yellow-300 mb-4">Contacto</h4>
            <div className="space-y-2 text-sm">
              {config.telefono_soporte && (
                <p>📱 {config.telefono_soporte}</p>
              )}
              {config.email_soporte && (
                <p>📧 {config.email_soporte}</p>
              )}
              {config.direccion && (
                <p>📍 {config.direccion}</p>
              )}
            </div>
          </div>

          {/* Redes sociales */}
          <div className="text-center md:text-right">
            <h4 className="text-lg font-semibold text-yellow-300 mb-4">Síguenos</h4>
            <div className="flex justify-center md:justify-end gap-3">
              {redes.map((red) => {
                const p = getPlatform(red)
                const base = 'w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105 focus:scale-105 focus:outline-none ring-1 ring-white/10'
                const src = resolveIconSrc(red)
                return (
                  <a
                    key={red.id}
                    href={red.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${base} ${platformClasses(p)}`}
                    aria-label={red.nombre}
                    title={red.nombre}
                  >
                    {src ? (
                      // Use the original provided/logo file when available
                      <img
                        src={src}
                        alt={red.nombre}
                        className="w-5 h-5 object-contain"
                        loading="lazy"
                        width={20}
                        height={20}
                      />
                    ) : (
                      <SocialIcon p={p} className="w-5 h-5" />
                    )}
                  </a>
                )
              })}
            </div>
          </div>
        </div>

        {/* Separador */}
        <div className="border-t border-red-600 mt-8 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm opacity-80">
            <p>&copy; 2024 Juega con Fe. Todos los derechos reservados.</p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <a href="#terminos" className="hover:text-red-400 transition-colors">
                Términos y Condiciones
              </a>
              <a href="#privacidad" className="hover:text-red-400 transition-colors">
                Política de Privacidad
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
