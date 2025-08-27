'use client'

import { sanitizeHtml } from '@/lib/sanitize'

interface DescriptionProps {
  descripcionHtml?: string
}

export function Description({ descripcionHtml }: DescriptionProps) {
  const defaultDescription = `
    <div class="prose prose-lg max-w-4xl mx-auto">
      <div class="grid md:grid-cols-2 gap-8 items-center">
        <div>
          <h3 class="text-2xl font-bold mb-4">💡 ¿Cómo participar?</h3>
          <ul class="space-y-3">
            <li class="flex items-start gap-3">
              <span class="text-green-500 font-bold">1.</span>
              <span>Elige tus números favoritos de la grilla disponible</span>
            </li>
            <li class="flex items-start gap-3">
              <span class="text-green-500 font-bold">2.</span>
              <span>Completa tus datos y selecciona el método de pago</span>
            </li>
            <li class="flex items-start gap-3">
              <span class="text-green-500 font-bold">3.</span>
              <span>Realiza el pago por transferencia bancaria</span>
            </li>
            <li class="flex items-start gap-3">
              <span class="text-green-500 font-bold">4.</span>
              <span>Sube tu voucher de pago para confirmar</span>
            </li>
            <li class="flex items-start gap-3">
              <span class="text-green-500 font-bold">5.</span>
              <span>¡Recibe confirmación por WhatsApp y espera el sorteo!</span>
            </li>
          </ul>
        </div>
        
        <div class="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg">
          <h4 class="text-xl font-bold mb-4">📋 Información importante</h4>
          <div class="space-y-3 text-sm">
            <div class="flex justify-between">
              <span class="font-medium">Precio por boleto:</span>
              <span class="font-bold text-green-600">Bs.10 VES</span>
            </div>
            <div class="flex justify-between">
              <span class="font-medium">Total de boletos:</span>
              <span class="font-bold">1000</span>
            </div>
            <div class="flex justify-between">
              <span class="font-medium">Límite por persona:</span>
              <span class="font-bold">10 boletos</span>
            </div>
            <div class="flex justify-between">
              <span class="font-medium">Tiempo de reserva:</span>
              <span class="font-bold text-orange-600">30 minutos</span>
            </div>
            <div class="flex justify-between">
              <span class="font-medium">Fecha del sorteo:</span>
              <span class="font-bold text-blue-600">31 Dic 2025, 8:00 PM</span>
            </div>
          </div>
          
          <div class="mt-4 p-3 bg-yellow-100 rounded border-l-4 border-yellow-500">
            <p class="text-xs text-yellow-800">
              <strong>⏰ Importante:</strong> Tus números quedan reservados por 30 minutos. 
              Sube tu voucher dentro de este tiempo para confirmar tu participación.
            </p>
          </div>
        </div>
      </div>

      <div class="mt-12 text-center">
        <h3 class="text-2xl font-bold mb-6">🏆 ¿Qué puedes ganar?</h3>
        <div class="grid md:grid-cols-3 gap-6">
          <div class="bg-gradient-to-r from-yellow-100 to-yellow-200 p-6 rounded-lg">
            <div class="text-4xl mb-2">🥇</div>
            <h4 class="font-bold">Primer Premio</h4>
            <p class="text-sm text-gray-600">iPhone 15 Pro Max + Bs.500 VES</p>
          </div>
          <div class="bg-gradient-to-r from-gray-100 to-gray-200 p-6 rounded-lg">
            <div class="text-4xl mb-2">🥈</div>
            <h4 class="font-bold">Segundo Premio</h4>
            <p class="text-sm text-gray-600">MacBook Air M2</p>
          </div>
          <div class="bg-gradient-to-r from-orange-100 to-orange-200 p-6 rounded-lg">
            <div class="text-4xl mb-2">🥉</div>
            <h4 class="font-bold">Tercer Premio</h4>
            <p class="text-sm text-gray-600">iPad Pro + Apple Pencil</p>
          </div>
        </div>
      </div>

      <div class="mt-12 bg-blue-50 p-6 rounded-lg">
        <h3 class="text-xl font-bold mb-4 text-blue-800">🔒 Sorteo Transparente y Seguro</h3>
        <div class="grid md:grid-cols-2 gap-6 text-sm">
          <div>
            <h4 class="font-semibold mb-2">Transparencia Total</h4>
            <ul class="space-y-1 text-gray-700">
              <li>• Sorteo público en vivo</li>
              <li>• Algoritmo aleatorio verificable</li>
              <li>• Registro de todos los participantes</li>
              <li>• Acta oficial del sorteo</li>
            </ul>
          </div>
          <div>
            <h4 class="font-semibold mb-2">Términos y Condiciones</h4>
            <ul class="space-y-1 text-gray-700">
              <li>• Sin reembolsos una vez confirmado el pago</li>
              <li>• El ganador será contactado por WhatsApp</li>
              <li>• Premios deben reclamarse en 30 días</li>
              <li>• Consulta términos completos abajo</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  `

  const html = descripcionHtml
    ? sanitizeHtml(descripcionHtml)
    : defaultDescription

  return (
    <div className="max-w-6xl mx-auto">
      <div
        className="prose prose-lg max-w-none"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  )
}
