'use client'

import { Suspense } from 'react'
import { NewHero } from '@/components/landing/NewHero'
import { TicketSelector } from '@/components/landing/TicketSelector'
import { PersonalInfo } from '@/components/landing/PersonalInfo'
import { PaymentMethods } from '@/components/landing/PaymentMethods'
import { SocialLinks } from '@/components/landing/SocialLinks'
import { NewFooter } from '@/components/landing/NewFooter'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

// Disable static generation due to dynamic content
export const dynamic = 'force-dynamic'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Fondo con efectos */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }} />
      </div>

      {/* Header */}
      <header className="relative z-10 p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-xl">🍀</span>
            </div>
            <span className="text-xl font-bold">JUEGA CON FE & DISFRÚTALO</span>
          </div>
          <nav className="hidden md:flex space-x-6">
            <a href="#inicio" className="hover:text-red-400 transition-colors">Inicio</a>
            <a href="#participar" className="hover:text-red-400 transition-colors">Participar</a>
            <a href="#verificar" className="hover:text-red-400 transition-colors">Verificar</a>
            <a href="#soporte" className="hover:text-red-400 transition-colors">Soporte</a>
          </nav>
        </div>
      </header>

      <main className="relative z-10">
        {/* Hero Section */}
        <Suspense fallback={<LoadingSpinner />}>
          <NewHero />
        </Suspense>

        {/* Sección principal de juego */}
        <section className="py-8">
          <div className="container mx-auto px-4 max-w-md">
            <div className="bg-red-600 rounded-3xl p-6 shadow-2xl border border-red-500">
              {/* Header de la rifa */}
              <div className="text-center mb-6">
                <div className="bg-red-700 rounded-xl p-4 mb-4">
                  <h2 className="text-2xl font-bold text-yellow-300">GANA 1000$ 2.0</h2>
                  <p className="text-sm opacity-90">74.5% vendido</p>
                </div>
                <p className="text-sm mb-2">Juega y gana 1000$ por tan solo 40bs</p>
                <div className="space-y-1 text-xs">
                  <p>🗓️ Dom 29/04</p>
                  <p>⏰ 12:00 AM</p>
                  <p>📍 Hola Jesús supiste llamarle familia</p>
                </div>
              </div>

              {/* Selector de tickets */}
              <Suspense fallback={<LoadingSpinner />}>
                <TicketSelector />
              </Suspense>

              {/* Información personal */}
              <Suspense fallback={<LoadingSpinner />}>
                <PersonalInfo />
              </Suspense>

              {/* Métodos de pago */}
              <Suspense fallback={<LoadingSpinner />}>
                <PaymentMethods />
              </Suspense>

              {/* Términos y condiciones */}
              <div className="mt-6">
                <label className="flex items-center space-x-2 text-xs">
                  <input type="checkbox" className="rounded" />
                  <span>Al presionar "Finalizar Compra" aceptas haber leído y estar de acuerdo con nuestros Términos y Condiciones</span>
                </label>
              </div>

              {/* Botón de compra */}
              <button className="w-full bg-yellow-500 text-black font-bold py-4 rounded-xl mt-4 text-lg hover:bg-yellow-400 transition-colors">
                Finalizar Compra
              </button>
            </div>
          </div>
        </section>

        {/* Links sociales flotantes */}
        <Suspense fallback={<div />}>
          <SocialLinks />
        </Suspense>
      </main>

      {/* Footer */}
      <Suspense fallback={<div />}>
        <NewFooter />
      </Suspense>
    </div>
  )
}
