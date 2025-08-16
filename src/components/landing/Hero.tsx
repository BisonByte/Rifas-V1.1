'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/Button'
import { formatDate, formatCurrency } from '@/lib/utils'

interface HeroProps {
  rifa?: {
    nombre: string
    descripcion: string
    fechaSorteo: Date
    precioPorBoleto: number
    moneda: string
    imagenPrincipal?: string
  }
}

export function Hero({ rifa }: HeroProps) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number
    hours: number
    minutes: number
    seconds: number
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0 })

  // Datos por defecto si no hay rifa activa
  const defaultRifa = {
    nombre: 'Gran Rifa 2025',
    descripcion: 'Participa y gana increíbles premios. ¡No te pierdas esta oportunidad única!',
    fechaSorteo: new Date('2025-12-31T20:00:00'),
    precioPorBoleto: 10,
    moneda: 'USD',
    imagenPrincipal: '/images/hero-banner.jpg'
  }

  const rifaData = rifa || defaultRifa

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime()
      const sorteoDate = new Date(rifaData.fechaSorteo).getTime()
      const difference = sorteoDate - now

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24))
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((difference % (1000 * 60)) / 1000)

        setTimeLeft({ days, hours, minutes, seconds })
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [rifaData.fechaSorteo])

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600">
      {/* Background Image */}
      <div className="absolute inset-0 bg-black/50" />
      
      {/* Hero Content */}
      <div className="relative z-10 container mx-auto px-4 py-20 text-center text-white">
        <div className="max-w-4xl mx-auto">
          {/* Title */}
          <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in">
            🎉 {rifaData.nombre}
          </h1>
          
          {/* Description */}
          <p className="text-xl md:text-2xl mb-8 text-gray-100 max-w-2xl mx-auto">
            {rifaData.descripcion}
          </p>

          {/* Price and Date Info */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 mb-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg px-6 py-4">
              <p className="text-sm text-gray-200">Precio por boleto</p>
              <p className="text-2xl font-bold">
                {formatCurrency(rifaData.precioPorBoleto, rifaData.moneda)}
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg px-6 py-4">
              <p className="text-sm text-gray-200">Sorteo</p>
              <p className="text-lg font-semibold">
                {formatDate(rifaData.fechaSorteo)}
              </p>
            </div>
          </div>

          {/* Countdown Timer */}
          <div className="flex justify-center gap-4 mb-8">
            {Object.entries(timeLeft).map(([unit, value]) => (
              <div key={unit} className="bg-white/20 backdrop-blur-sm rounded-lg p-4 min-w-[80px]">
                <div className="text-2xl md:text-3xl font-bold">{value.toString().padStart(2, '0')}</div>
                <div className="text-xs uppercase tracking-wide text-gray-200">
                  {unit === 'days' ? 'Días' : 
                   unit === 'hours' ? 'Horas' : 
                   unit === 'minutes' ? 'Min' : 'Seg'}
                </div>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="text-lg px-8 py-3 bg-yellow-500 hover:bg-yellow-600 text-black font-bold"
              onClick={() => scrollToSection('participar')}
            >
              🎟️ Elegir mis números
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="text-lg px-8 py-3 border-white text-white hover:bg-white hover:text-black"
              onClick={() => scrollToSection('verificar')}
            >
              🔍 Verificar ticket
            </Button>
          </div>

          {/* Info Text */}
          <p className="mt-8 text-sm text-gray-300 max-w-xl mx-auto">
            💡 Elige tus números, paga por transferencia y sube tu voucher. 
            Te confirmaremos por WhatsApp. ¡Participa ya!
          </p>
        </div>
      </div>

      {/* Scroll Down Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div 
          className="w-6 h-10 border-2 border-white rounded-full flex justify-center cursor-pointer"
          onClick={() => scrollToSection('descripcion')}
        >
          <div className="w-1 h-3 bg-white rounded-full mt-2 animate-pulse" />
        </div>
      </div>
    </section>
  )
}
