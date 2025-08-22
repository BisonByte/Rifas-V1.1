'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { formatDate } from '@/lib/utils'

interface Premio {
  id: string
  titulo: string
  descripcion: string
  foto?: string
  cantidad: number
  ticketGanador?: {
    numero: number
    participante: string
  }
}

export function PrizeGallery() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [premios, setPremios] = useState<Premio[]>([])

  useEffect(() => {
    // Cargar premios de ejemplo
    const examplePremios: Premio[] = [
      {
        id: '1',
        titulo: '🥇 Primer Premio',
        descripcion: 'iPhone 15 Pro Max 256GB + $500 USD en efectivo',
        foto: '/images/premio1.jpg',
        cantidad: 1,
        // ticketGanador: { numero: 777, participante: 'María G***' } // Ejemplo post-sorteo
      },
      {
        id: '2',
        titulo: '🥈 Segundo Premio',
        descripcion: 'MacBook Air M2 13" 256GB SSD',
        foto: '/images/premio2.jpg',
        cantidad: 1,
      },
      {
        id: '3',
        titulo: '🥉 Tercer Premio',
        descripcion: 'iPad Pro 11" + Apple Pencil (2da Gen)',
        foto: '/images/premio3.jpg',
        cantidad: 1,
      },
      {
        id: '4',
        titulo: '🎁 Premios Adicionales',
        descripcion: 'AirPods Pro (2da Gen)',
        foto: '/images/premio4.jpg',
        cantidad: 3,
      },
      {
        id: '5',
        titulo: '🎮 Premio Especial',
        descripcion: 'PlayStation 5 + 2 Juegos',
        foto: '/images/premio5.jpg',
        cantidad: 1,
      }
    ]

    setPremios(examplePremios)
  }, [])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % premios.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + premios.length) % premios.length)
  }

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
  }

  if (premios.length === 0) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-48 bg-gray-200 rounded-t-lg"></div>
              <CardContent className="p-4">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Carrousel principal */}
      <div className="relative mb-8">
        <Card className="overflow-hidden">
          <div className="relative h-96 md:h-[500px]">
            {/* Imagen principal */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
              <div className="text-center text-white p-8">
                <div className="text-6xl md:text-8xl mb-4">
                  {premios[currentSlide]?.titulo.charAt(0)}
                </div>
                <h3 className="text-2xl md:text-4xl font-bold mb-4">
                  {premios[currentSlide]?.titulo}
                </h3>
                <p className="text-lg md:text-xl mb-6 max-w-2xl mx-auto">
                  {premios[currentSlide]?.descripcion}
                </p>
                
                {premios[currentSlide]?.cantidad > 1 && (
                  <div className="inline-block bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2 mb-4">
                    <span className="text-sm font-medium">
                      {premios[currentSlide]?.cantidad} premios disponibles
                    </span>
                  </div>
                )}

                {premios[currentSlide]?.ticketGanador && (
                  <div className="bg-yellow-400 text-yellow-900 rounded-lg p-4 inline-block">
                    <p className="font-bold">🎉 ¡GANADOR!</p>
                    <p className="text-sm">
                      Ticket #{premios[currentSlide]?.ticketGanador?.numero.toString().padStart(3, '0')} - {premios[currentSlide]?.ticketGanador?.participante}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Controles de navegación */}
            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </Card>

        {/* Indicadores */}
        <div className="flex justify-center mt-4 gap-2">
          {premios.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === currentSlide
                  ? 'bg-blue-600'
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Grilla de premios */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {premios.map((premio, index) => (
          <Card 
            key={premio.id} 
            className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
              index === currentSlide ? 'ring-2 ring-blue-500' : ''
            }`}
            onClick={() => goToSlide(index)}
          >
            <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center rounded-t-lg">
              <span className="text-4xl">{premio.titulo.charAt(0)}</span>
            </div>
            <CardContent className="p-4">
              <h3 className="font-bold text-lg mb-2">{premio.titulo}</h3>
              <p className="text-gray-600 text-sm mb-3">{premio.descripcion}</p>
              
              <div className="flex justify-between items-center">
                {premio.cantidad > 1 && (
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    {premio.cantidad} premios
                  </span>
                )}
                
                {premio.ticketGanador ? (
                  <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded font-medium">
                    🏆 Ganado
                  </span>
                ) : (
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                    Disponible
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Información del sorteo */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
        <CardContent className="p-6 text-center">
          <h3 className="text-2xl font-bold mb-4">📅 Información del Sorteo</h3>
          
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div>
              <div className="text-3xl mb-2">📍</div>
              <h4 className="font-semibold mb-1">Fecha y Hora</h4>
              <p className="text-gray-600">31 de Diciembre, 2025</p>
              <p className="text-gray-600">8:00 PM (GMT-5)</p>
            </div>
            
            <div>
              <div className="text-3xl mb-2">🎥</div>
              <h4 className="font-semibold mb-1">Transmisión en Vivo</h4>
              <p className="text-gray-600">Facebook Live</p>
              <p className="text-gray-600">Instagram Live</p>
            </div>
            
            <div>
              <div className="text-3xl mb-2">🔒</div>
              <h4 className="font-semibold mb-1">Método</h4>
              <p className="text-gray-600">Sorteo aleatorio</p>
              <p className="text-gray-600">100% transparente</p>
            </div>
          </div>

          <div className="mt-6 p-4 bg-white rounded-lg border-l-4 border-blue-500">
            <p className="text-sm text-gray-700">
              <strong>🔍 Transparencia Total:</strong> El sorteo se realizará en vivo con algoritmo aleatorio verificable. 
              Todos los tickets pagados participan automáticamente. Se generará un acta oficial con el resultado.
            </p>
          </div>

          <div className="mt-4">
            <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600">
              🔔 Recibir notificación del sorteo
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Post-sorteo: Ganadores */}
      {premios.some(p => p.ticketGanador) && (
        <Card className="mt-8 bg-gradient-to-r from-yellow-50 to-orange-50">
          <CardContent className="p-6">
            <h3 className="text-2xl font-bold text-center mb-6">🏆 Ganadores del Sorteo</h3>
            
            <div className="space-y-4">
              {premios
                .filter(p => p.ticketGanador)
                .map((premio) => (
                  <div key={premio.id} className="bg-white rounded-lg p-4 border border-yellow-200">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-bold text-lg">{premio.titulo}</h4>
                        <p className="text-gray-600">{premio.descripcion}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-xl">
                          Ticket #{premio.ticketGanador?.numero.toString().padStart(3, '0')}
                        </p>
                        <p className="text-gray-600">{premio.ticketGanador?.participante}</p>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
            
            <div className="text-center mt-6">
              <p className="text-sm text-gray-600 mb-2">
                Sorteo realizado el {formatDate(new Date())}
              </p>
              <Button variant="outline">
                📄 Ver acta oficial del sorteo
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
