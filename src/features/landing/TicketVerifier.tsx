'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { VerificacionSchema, type VerificacionData } from '@/lib/validations'
import { EstadoTicket } from '@/types'

type CompraResumen = {
  id: string
  estadoPago?: string
  rifa?: { nombre?: string }
  participante?: { nombre?: string; celular?: string; cedula?: string }
  referencia?: string
  tickets?: Array<{ numero: number; estado: string }>
}

export function TicketVerifier() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<VerificacionData>({
    resolver: zodResolver(VerificacionSchema),
    defaultValues: { tipo: 'cedula', busqueda: '' }
  })

  const tipoSeleccionado = watch('tipo')

  const onSubmit = async (data: VerificacionData) => {
    setLoading(true)
    setResult(null)
    try {
      const raw = String(data.busqueda || '').trim()
      const valor = data.tipo === 'cedula' ? raw.replace(/[^0-9]/g, '') : raw
      const tipoApi = data.tipo === 'cedula' ? 'cedula' : 'referencia'
      const params = new URLSearchParams({ tipo: tipoApi, valor })
      const res = await fetch(`/api/tickets/verificar?${params.toString()}`, { cache: 'no-store' })
      const json = await res.json()
      if (res.ok && json?.success) setResult(json)
      else setResult({ error: json?.error || 'Sin resultados' })
    } catch (e) {
      setResult({ error: 'Error conectando con el servicio. Intenta nuevamente.' })
    } finally {
      setLoading(false)
    }
  }

  const Estado = ({ estado }: { estado: string }) => {
    const cls: Record<string, string> = {
      [EstadoTicket.DISPONIBLE]: 'bg-green-100 text-green-800',
      [EstadoTicket.RESERVADO]: 'bg-yellow-100 text-yellow-800',
      [EstadoTicket.PENDIENTE_PAGO]: 'bg-orange-100 text-orange-800',
      [EstadoTicket.PAGADO]: 'bg-blue-100 text-blue-800',
      [EstadoTicket.RECHAZADO]: 'bg-red-100 text-red-800',
      [EstadoTicket.CADUCADO]: 'bg-gray-100 text-gray-800',
      [EstadoTicket.GANADOR]: 'bg-purple-100 text-purple-800',
      EN_VERIFICACION: 'bg-yellow-100 text-yellow-800',
      VENDIDO: 'bg-blue-100 text-blue-800'
    }
    const label: Record<string, string> = {
      [EstadoTicket.DISPONIBLE]: 'Disponible',
      [EstadoTicket.RESERVADO]: 'Reservado',
      [EstadoTicket.PENDIENTE_PAGO]: 'Pendiente de pago',
      [EstadoTicket.PAGADO]: 'Pagado',
      [EstadoTicket.RECHAZADO]: 'Rechazado',
      [EstadoTicket.CADUCADO]: 'Caducado',
      [EstadoTicket.GANADOR]: 'GANADOR',
      EN_VERIFICACION: 'En verificación',
      VENDIDO: 'Pagado'
    }
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${cls[estado] || 'bg-gray-100 text-gray-800'}`}>{label[estado] || estado}</span>
  }

  const PagoChip = ({ estado }: { estado?: string }) => {
    const m: Record<string, { label: string; cls: string }> = {
      PENDIENTE: { label: 'Pendiente', cls: 'bg-orange-100 text-orange-800' },
      EN_VERIFICACION: { label: 'En verificación', cls: 'bg-yellow-100 text-yellow-800' },
      APROBADO: { label: 'Pagado', cls: 'bg-blue-100 text-blue-800' },
      RECHAZADO: { label: 'Rechazado', cls: 'bg-red-100 text-red-800' },
      VENCIDO: { label: 'Vencido', cls: 'bg-gray-100 text-gray-800' },
    }
    const item = estado ? m[estado] : m.PENDIENTE
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${item.cls}`}>{item.label}</span>
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-center">Verificar Ticket</CardTitle>
          <p className="text-center text-gray-600">Consulta por cédula o por voucher</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <div className="text-sm text-gray-300 mb-2">Tipo de búsqueda</div>
              <div className="flex items-center gap-4">
                <label className="inline-flex items-center gap-2">
                  <input type="radio" value="cedula" {...register('tipo')} />
                  <span>Por cédula</span>
                </label>
                <label className="inline-flex items-center gap-2">
                  <input type="radio" value="voucher" {...register('tipo')} />
                  <span>Por voucher</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm mb-1">{tipoSeleccionado === 'voucher' ? 'Referencia / voucher' : 'Cédula'}</label>
              <Input
                placeholder={tipoSeleccionado === 'voucher' ? 'Ej: ABCD1234' : 'Ej: 12345678'}
                {...register('busqueda')}
                type="text"
              />
              {errors.busqueda && (
                <p className="text-red-500 text-xs mt-1">{errors.busqueda.message}</p>
              )}
            </div>

            <Button type="submit" size="lg" className="w-full" disabled={isSubmitting || loading}>
              {loading ? (<><LoadingSpinner size="sm" className="mr-2"/>Buscando...</>) : 'Verificar'}
            </Button>
          </form>

          {result && (
            <div className="mt-6 p-4 rounded-lg bg-white/5 border border-gray-700 max-w-full">
              {result.error ? (
                <div className="text-center text-red-500">
                  <p className="font-medium">{result.error}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {Array.isArray(result.tickets) && (
                    <div className="space-y-2">
                      <h3 className="font-bold text-lg">Tickets encontrados ({result.tickets.length})</h3>
                      {result.tickets.map((t: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-gray-900/20 rounded border border-gray-700">
                          <div>
                            <div className="font-medium text-white">Ticket #{String(t.numero).padStart(3,'0')}</div>
                            {t.rifa?.nombre && <div className="text-xs text-gray-400">{t.rifa.nombre}</div>}
                          </div>
                          <Estado estado={t.estado} />
                        </div>
                      ))}
                    </div>
                  )}

                  {result.compra && (
                    <div className="space-y-2">
                      <h3 className="font-bold text-lg">Compra</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-gray-900/20 p-3 rounded border border-gray-700 text-sm">
                        <div><span className="text-gray-400">Referencia: </span><span className="text-white">{(result.compra as CompraResumen).referencia}</span></div>
                        <div><span className="text-gray-400">Estado: </span><PagoChip estado={(result.compra as CompraResumen).estadoPago} /></div>
                        <div><span className="text-gray-400">Rifa: </span><span className="text-white">{(result.compra as CompraResumen).rifa?.nombre || '-'}</span></div>
                        <div><span className="text-gray-400">Participante: </span><span className="text-white">{(result.compra as CompraResumen).participante?.nombre || '-'}</span></div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">¿Necesitas ayuda?</h4>
            <div className="text-sm text-blue-700 space-y-1">
              <p>• Si tu ticket aparece como "Reservado", tienes 30 minutos para subir tu voucher</p>
              <p>• Si aparece "Pendiente de pago", estamos verificando tu voucher</p>
              <p>• Si aparece "Pagado", tu participación está confirmada</p>
              <p>• Para cualquier consulta, contáctanos por WhatsApp</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
