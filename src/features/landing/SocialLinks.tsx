'use client'

import { useState, useEffect } from 'react'

interface RedSocial {
  id: string
  nombre: string
  url: string
  icono: string
  activo: boolean
}

export function SocialLinks() {
  const [redes, setRedes] = useState<RedSocial[]>([])

  useEffect(() => {
    fetch('/api/redes-sociales')
      .then(res => res.json())
      .then(json => {
        const data = json?.success ? json.data : json
        setRedes(data.filter((r: RedSocial) => r.activo))
      })
      .catch(console.error)
  }, [])

  if (redes.length === 0) return null

  return (
    <div className="fixed right-4 top-1/2 transform -translate-y-1/2 z-40 hidden md:block">
      <div className="flex flex-col space-y-3">
        {redes.map(red => (
          <a
            key={red.id}
            href={red.url}
            target="_blank"
            rel="noopener noreferrer"
            className="w-12 h-12 bg-red-600 hover:bg-red-500 rounded-full flex items-center justify-center text-white text-xl shadow-lg transform hover:scale-110 transition-all duration-200"
            title={red.nombre}
          >
            <span>{red.icono}</span>
          </a>
        ))}
      </div>
    </div>
  )
}
