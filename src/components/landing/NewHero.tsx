'use client'

import { useState, useEffect } from 'react'

interface ConfiguracionSitio {
  id: string
  clave: string
  valor: string
}

export function NewHero() {
  const [config, setConfig] = useState<Record<string, string>>({
    titulo: 'JUEGA CON FE & DISFRÚTALO',
    subtitulo: 'Tu suerte está esperando',
    fondo_video_url: ''
  })

  useEffect(() => {
    // Cargar configuración del sitio (tolera {success,data} u arreglo legacy)
    fetch('/api/admin/configuracion')
      .then(res => res.json())
      .then((json) => {
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

  return (
    <section className="relative h-40 flex items-center justify-center text-center">
      {config.fondo_video_url && (
        <video
          className="absolute inset-0 w-full h-full object-cover opacity-30"
          src={config.fondo_video_url}
          autoPlay
          loop
          muted
          playsInline
        />
      )}
      
      <div className="relative z-10 px-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-2 text-yellow-300">
          {config.titulo}
        </h1>
        <p className="text-lg opacity-90">
          {config.subtitulo}
        </p>
      </div>
    </section>
  )
}
