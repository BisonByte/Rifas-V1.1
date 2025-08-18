'use client'

import { useState, useEffect } from 'react'

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

  useEffect(() => {
    // Cargar redes sociales
    fetch('/api/admin/redes-sociales')
      .then(res => res.json())
      .then(data => setRedes(data.filter((r: RedSocial) => r.activo)))
      .catch(console.error)

    // Cargar configuración
    fetch('/api/admin/configuracion')
      .then(res => res.json())
      .then(data => {
        const configObj: Record<string, string> = {}
        data.forEach((item: any) => {
          configObj[item.clave] = item.valor
        })
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
            <div className="flex justify-center md:justify-end space-x-4">
              {redes.map(red => (
                <a
                  key={red.id}
                  href={red.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-red-600 hover:bg-red-500 rounded-full flex items-center justify-center text-white transition-colors"
                  title={red.nombre}
                >
                  <span>{red.icono}</span>
                </a>
              ))}
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
