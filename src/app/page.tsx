'use client'

import { Suspense } from 'react'
import { Hero } from '@/components/landing/Hero'
import { Description } from '@/components/landing/Description'
import { RaffleForm } from '@/components/landing/RaffleForm'
import { TicketVerifier } from '@/components/landing/TicketVerifier'
import { PrizeGallery } from '@/components/landing/PrizeGallery'
import { FAQ } from '@/components/landing/FAQ'
import { Footer } from '@/components/landing/Footer'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

// Disable static generation due to dynamic content
export const dynamic = 'force-dynamic'

export default function HomePage() {
  return (
    <main className="flex-1">
      {/* Hero Section */}
      <Suspense fallback={<LoadingSpinner />}>
        <Hero />
      </Suspense>

      {/* Descripción y dinámica */}
      <section id="descripcion" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <Description />
        </div>
      </section>

      {/* Formulario de compra */}
      <section id="participar" className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">
            🎟️ Elige tus números y participa
          </h2>
          <Suspense fallback={<LoadingSpinner />}>
            <RaffleForm />
          </Suspense>
        </div>
      </section>

      {/* Verificador de tickets */}
      <section id="verificar" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">
            🔍 Verificar ticket
          </h2>
          <Suspense fallback={<LoadingSpinner />}>
            <TicketVerifier />
          </Suspense>
        </div>
      </section>

      {/* Galería de premios */}
      <section id="premios" className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">
            🏆 Premios
          </h2>
          <Suspense fallback={<LoadingSpinner />}>
            <PrizeGallery />
          </Suspense>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">
            ❓ Preguntas Frecuentes
          </h2>
          <Suspense fallback={<LoadingSpinner />}>
            <FAQ />
          </Suspense>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </main>
  )
}
