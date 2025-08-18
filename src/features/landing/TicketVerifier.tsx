'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { VerificacionSchema, type VerificacionData } from '@/lib/validations'
import { formatDate, formatPhone } from '@/lib/utils'
import { EstadoTicket } from '@/types'

export function TicketVerifier() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<VerificacionData>({
    resolver: zodResolver(VerificacionSchema),
    defaultValues: {
      tipo: 'ticket'
    }
  })

  const tipoSeleccionado = watch('tipo')

  const onSubmit = async (data: VerificacionData) => {
    setLoading(true)
    setResult(null)

    try {
      // Simular búsqueda en API
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Datos de ejemplo
      const exampleResult = {
        ticket: {
          numero: data.busqueda.includes('123') ? 123 : Math.floor(Math.random() * 1000),
          estado: EstadoTicket.PAGADO,
          participante: {
            nombre: 'Juan P***',
            celular: formatPhone('+1234567890'),
            email: 'j***@email.com'
          },
          fechaCompra: new Date(),
          monto: 10,
          moneda: 'USD'
        },
        tickets: data.tipo === 'celular' ? [
          {
            numero: 123,
            estado: EstadoTicket.PAGADO,
            fechaCompra: new Date(),
            monto: 10
          },
          {
            numero: 456,
            estado: EstadoTicket.RESERVADO,
            fechaCompra: new Date(),
            monto: 10
          }
        ] : null
      }

      setResult(exampleResult)
    } catch (error) {
      console.error('Error:', error)
      setResult({ error: 'No se encontraron resultados' })
    } finally {
      setLoading(false)
    }
  }

  const getEstadoBadge = (estado: EstadoTicket) => {
    const badges = {
      [EstadoTicket.DISPONIBLE]: 'bg-green-100 text-green-800',
      [EstadoTicket.RESERVADO]: 'bg-yellow-100 text-yellow-800',
      [EstadoTicket.PENDIENTE_PAGO]: 'bg-orange-100 text-orange-800',
      [EstadoTicket.PAGADO]: 'bg-blue-100 text-blue-800',
      [EstadoTicket.RECHAZADO]: 'bg-red-100 text-red-800',
      [EstadoTicket.CADUCADO]: 'bg-gray-100 text-gray-800',
      [EstadoTicket.GANADOR]: 'bg-purple-100 text-purple-800 animate-pulse'
    }

    const labels = {
      [EstadoTicket.DISPONIBLE]: 'Disponible',
      [EstadoTicket.RESERVADO]: 'Reservado',
      [EstadoTicket.PENDIENTE_PAGO]: 'Pendiente de pago',
      [EstadoTicket.PAGADO]: 'Pagado ✅',
      [EstadoTicket.RECHAZADO]: 'Rechazado',
      [EstadoTicket.CADUCADO]: 'Caducado',
      [EstadoTicket.GANADOR]: '🏆 GANADOR'
    }

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badges[estado]}`}>
        {labels[estado]}
      </span>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-center">🔍 Verificar Ticket</CardTitle>
          <p className="text-center text-gray-600">
            Consulta el estado de tu ticket o todos tus números por celular
          </p>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Tipo de búsqueda */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Tipo de búsqueda
              </label>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    {...register('tipo')}
                    value="ticket"
                    className="mr-2"
                  />
                  Por número de ticket
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    {...register('tipo')}
                    value="celular"
                    className="mr-2"
                  />
                  Por celular
                </label>
              </div>
            </div>

            {/* Campo de búsqueda */}
            <div>
              <label className="block text-sm font-medium mb-1">
                {tipoSeleccionado === 'ticket' ? 'Número de ticket' : 'Número de celular'}
              </label>
              <Input
                {...register('busqueda')}
                placeholder={
                  tipoSeleccionado === 'ticket' 
                    ? 'Ej: 123' 
                    : 'Ej: +1234567890'
                }
                type={tipoSeleccionado === 'celular' ? 'tel' : 'text'}
              />
              {errors.busqueda && (
                <p className="text-red-500 text-xs mt-1">{errors.busqueda.message}</p>
              )}
            </div>

            {/* Submit */}
            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={isSubmitting || loading}
            >
              {loading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Buscando...
                </>
              ) : (
                '🔍 Verificar'
              )}
            </Button>
          </form>

          {/* Resultados */}
          {result && (
            <div className="mt-6 p-4 border rounded-lg bg-gray-50">
              {result.error ? (
                <div className="text-center text-red-600">
                  <p className="font-medium">❌ {result.error}</p>
                  <p className="text-sm mt-1">
                    Verifica que el número sea correcto e inténtalo de nuevo
                  </p>
                </div>
              ) : (
                <div>
                  {result.ticket && (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <h3 className="font-bold text-lg">
                          Ticket #{result.ticket.numero.toString().padStart(3, '0')}
                        </h3>
                        {getEstadoBadge(result.ticket.estado)}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Participante:</span>
                          <p>{result.ticket.participante.nombre}</p>
                        </div>
                        <div>
                          <span className="font-medium">WhatsApp:</span>
                          <p>{result.ticket.participante.celular}</p>
                        </div>
                        <div>
                          <span className="font-medium">Fecha de compra:</span>
                          <p>{formatDate(result.ticket.fechaCompra)}</p>
                        </div>
                        <div>
                          <span className="font-medium">Monto:</span>
                          <p>${result.ticket.monto} {result.ticket.moneda}</p>
                        </div>
                      </div>

                      {result.ticket.estado === EstadoTicket.GANADOR && (
                        <div className="bg-yellow-100 border border-yellow-400 rounded-lg p-4 text-center">
                          <p className="text-2xl mb-2">🎉 ¡FELICITACIONES! 🎉</p>
                          <p className="font-bold text-yellow-800">
                            ¡Eres el GANADOR de la rifa!
                          </p>
                          <p className="text-sm text-yellow-700 mt-2">
                            Nos comunicaremos contigo por WhatsApp para coordinar la entrega del premio.
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {result.tickets && (
                    <div className="space-y-3">
                      <h3 className="font-bold text-lg">
                        Tus tickets ({result.tickets.length})
                      </h3>
                      
                      <div className="space-y-2">
                        {result.tickets.map((ticket: any, index: number) => (
                          <div key={index} className="flex justify-between items-center p-3 bg-white rounded border">
                            <div>
                              <span className="font-medium">
                                Ticket #{ticket.numero.toString().padStart(3, '0')}
                              </span>
                              <p className="text-xs text-gray-500">
                                {formatDate(ticket.fechaCompra)} - ${ticket.monto} USD
                              </p>
                            </div>
                            {getEstadoBadge(ticket.estado)}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Ayuda */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">💡 ¿Necesitas ayuda?</h4>
            <div className="text-sm text-blue-700 space-y-1">
              <p>• Si tu ticket aparece como &quot;Reservado&quot;, tienes 30 minutos para subir tu voucher</p>
              <p>• Si aparece &quot;Pendiente de pago&quot;, estamos verificando tu voucher</p>
              <p>• Si aparece &quot;Pagado ✅&quot;, tu participación está confirmada</p>
              <p>• Para cualquier consulta, contáctanos por WhatsApp</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
