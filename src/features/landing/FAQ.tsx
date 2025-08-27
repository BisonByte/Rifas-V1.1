'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/Card'

interface FAQItem {
  id: string
  pregunta: string
  respuesta: string
  categoria?: string
}

export function FAQ() {
  const [openItems, setOpenItems] = useState<string[]>([])
  const [faqs, setFaqs] = useState<FAQItem[]>([])

  useEffect(() => {
    // FAQs de ejemplo
    const exampleFAQs: FAQItem[] = [
      {
        id: '1',
        pregunta: '¿Cómo compro y elijo mis números?',
        respuesta: 'Es muy fácil: (1) Selecciona tus números favoritos en la grilla, (2) Completa tus datos personales, (3) Elige el método de pago, (4) Realiza la transferencia, (5) Sube tu voucher de pago. ¡Listo! Recibirás confirmación por WhatsApp.',
        categoria: 'compra'
      },
      {
        id: '2',
        pregunta: '¿Qué medios de pago aceptan?',
        respuesta: 'Aceptamos transferencias bancarias a nuestras cuentas verificadas. Puedes pagar a través de Banco Nacional, Banco Internacional o Banco Popular. Los datos bancarios aparecen al seleccionar el método de pago.',
        categoria: 'pago'
      },
      {
        id: '3',
        pregunta: '¿Cómo subo mi voucher de pago?',
        respuesta: 'Después de realizar la transferencia, toma una foto clara del voucher o captura de pantalla. Súbela en el formulario (formatos JPG, PNG o PDF, máximo 10MB). Asegúrate de que se vean todos los datos: monto, fecha, banco destino.',
        categoria: 'pago'
      },
      {
        id: '4',
        pregunta: '¿Cuánto tiempo tengo para subir el voucher?',
        respuesta: 'Tienes 30 minutos desde que seleccionas tus números para subir el voucher. Pasado este tiempo, los números se liberan automáticamente. Si ya pagaste pero no subiste el voucher a tiempo, contáctanos por WhatsApp.',
        categoria: 'tiempo'
      },
      {
        id: '5',
        pregunta: '¿Cómo y cuándo se realiza el sorteo?',
        respuesta: 'El sorteo se realizará el 31 de Diciembre de 2025 a las 8:00 PM en vivo por Facebook e Instagram. Utilizamos un algoritmo aleatorio transparente y verificable. Todos los tickets pagados participan automáticamente.',
        categoria: 'sorteo'
      },
      {
        id: '6',
        pregunta: '¿Cómo sabré si gané?',
        respuesta: 'Te contactaremos inmediatamente por WhatsApp si resultas ganador. También puedes verificar en tiempo real en nuestra página web. Los resultados se publican en vivo durante la transmisión y quedan registrados permanentemente.',
        categoria: 'ganadores'
      },
      {
        id: '7',
        pregunta: '¿Puedo comprar más de un ticket?',
        respuesta: 'Sí, puedes comprar hasta 10 tickets por persona. Simplemente selecciona múltiples números en la grilla antes de proceder al pago. El monto total se calculará automáticamente (Bs.10 VES por ticket).',
        categoria: 'compra'
      },
      {
        id: '8',
        pregunta: '¿Hay reembolsos o cambios?',
        respuesta: 'No realizamos reembolsos una vez confirmado el pago y los números. Puedes cancelar solo si aún no has subido el voucher (dentro de los 30 minutos de reserva). Lee nuestros términos y condiciones completos.',
        categoria: 'politicas'
      },
      {
        id: '9',
        pregunta: '¿Cómo reclamo mi premio si gano?',
        respuesta: 'Si ganas, te contactaremos por WhatsApp dentro de las primeras 24 horas. Los premios deben reclamarse en un máximo de 30 días. Coordinaremos la entrega según tu ubicación. Los premios en efectivo se transfieren a tu cuenta bancaria.',
        categoria: 'ganadores'
      },
      {
        id: '10',
        pregunta: '¿Es seguro y legal este sorteo?',
        respuesta: 'Sí, operamos bajo todas las regulaciones locales aplicables. Utilizamos sistemas seguros para manejar tu información personal. El sorteo es 100% transparente con algoritmos verificables y transmisión en vivo.',
        categoria: 'seguridad'
      }
    ]

    setFaqs(exampleFAQs)
  }, [])

  const toggleItem = (id: string) => {
    setOpenItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    )
  }

  const categories = [
    { key: 'compra', label: '🛒 Compra', color: 'text-blue-600' },
    { key: 'pago', label: '💳 Pagos', color: 'text-green-600' },
    { key: 'sorteo', label: '🎯 Sorteo', color: 'text-purple-600' },
    { key: 'ganadores', label: '🏆 Ganadores', color: 'text-yellow-600' },
    { key: 'politicas', label: '📋 Políticas', color: 'text-red-600' },
    { key: 'seguridad', label: '🔒 Seguridad', color: 'text-gray-600' }
  ]

  return (
    <div className="max-w-4xl mx-auto">
      {/* Introducción */}
      <div className="text-center mb-8">
        <p className="text-lg text-gray-600 mb-6">
          Encuentra respuestas a las preguntas más frecuentes sobre nuestra rifa
        </p>
        
        {/* Categorías */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {categories.map((cat) => (
            <span key={cat.key} className={`px-3 py-1 rounded-full text-sm font-medium ${cat.color} bg-gray-100`}>
              {cat.label}
            </span>
          ))}
        </div>
      </div>

      {/* FAQ Items */}
      <div className="space-y-4">
        {faqs.map((faq) => {
          const isOpen = openItems.includes(faq.id)
          const category = categories.find(c => c.key === faq.categoria)
          
          return (
            <Card key={faq.id} className="overflow-hidden">
              <button
                onClick={() => toggleItem(faq.id)}
                className="w-full text-left p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    {category && (
                      <span className={`text-xs font-medium ${category.color} mb-1 block`}>
                        {category.label}
                      </span>
                    )}
                    <h3 className="text-lg font-semibold pr-4">
                      {faq.pregunta}
                    </h3>
                  </div>
                  <div className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </button>
              
              {isOpen && (
                <CardContent className="px-6 pb-6 pt-0">
                  <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed">
                    {faq.respuesta.split('. ').map((sentence, index, array) => (
                      <p key={index} className="mb-2 last:mb-0">
                        {sentence}{index < array.length - 1 ? '.' : ''}
                      </p>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>
          )
        })}
      </div>

      {/* Contacto adicional */}
      <Card className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50">
        <CardContent className="p-6 text-center">
          <h3 className="text-xl font-bold mb-3">¿No encontraste tu respuesta?</h3>
          <p className="text-gray-600 mb-4">
            Nuestro equipo está disponible para ayudarte con cualquier duda adicional
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://wa.me/1234567890"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              📱 WhatsApp
            </a>
            <a
              href="mailto:soporte@sistemarifas.com"
              className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              ✉️ Email
            </a>
            <a
              href="/contacto"
              className="inline-flex items-center justify-center px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              📞 Contacto
            </a>
          </div>
          
          <div className="mt-4 text-sm text-gray-500">
            <p>📞 Horario de atención: Lunes a Viernes 9:00 AM - 6:00 PM</p>
            <p>📧 Respuesta por email en menos de 24 horas</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
