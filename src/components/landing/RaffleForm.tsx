'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { CompraFormSchema, type CompraFormData } from '@/lib/validations'
import { EstadoTicket, type TicketSelection } from '@/types'
import { cn } from '@/lib/utils'

interface Rifa {
  id: string
  nombre: string
  precioPorBoleto: number
  limitePorPersona: number
  totalBoletos: number
}

interface CuentaBancaria {
  id: string
  banco: string
  numero: string
  titular: string
  tipoCuenta: string
}

export function RaffleForm() {
  const [rifaId, setRifaId] = useState<string | null>(null)
  const [rifa, setRifa] = useState<Rifa | null>(null)
  const [tickets, setTickets] = useState<TicketSelection[]>([])
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [banks, setBanks] = useState<CuentaBancaria[]>([])
  const [searchNumber, setSearchNumber] = useState('')

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<CompraFormData>({
    resolver: zodResolver(CompraFormSchema)
  })

  // Cargar datos iniciales
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        // Primero obtener las rifas disponibles
        const rifasRes = await fetch('/api/rifas')
        if (rifasRes.ok) {
          const { data: rifas } = await rifasRes.json()
          if (rifas.length > 0) {
            const primeraRifa = rifas[0]
            setRifaId(primeraRifa.id)
            
            // Cargar disponibilidad de tickets para la primera rifa
            const disponibilidadRes = await fetch(`/api/tickets/disponibilidad?rifaId=${primeraRifa.id}`)
            if (disponibilidadRes.ok) {
              const { success, data: disponibilidad } = await disponibilidadRes.json()
              if (success) {
                setRifa(disponibilidad.rifa)

                // Convertir tickets a formato del componente
                const ticketsFormatted = disponibilidad.tickets.map((ticket: any) => ({
                  numero: ticket.numero,
                  estado: ticket.estado as EstadoTicket,
                  selected: false
                }))
                setTickets(ticketsFormatted)
              }
            }
          }
        }

        // Cargar cuentas bancarias
        const bancosRes = await fetch('/api/cuentas-bancarias')
        if (bancosRes.ok) {
          const { data: cuentas } = await bancosRes.json()
          setBanks(cuentas)
        }
        
      } catch (error) {
        console.error('Error cargando datos:', error)
        alert('Error cargando los datos. Recarga la página.')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  // Actualizar números seleccionados en el formulario
  useEffect(() => {
    setValue('numerosSeleccionados', selectedNumbers)
  }, [selectedNumbers, setValue])

  const handleTicketClick = (numero: number, estado: EstadoTicket) => {
    if (estado !== EstadoTicket.DISPONIBLE) return

    const limite = rifa?.limitePorPersona || 10
    
    setSelectedNumbers(prev => {
      if (prev.includes(numero)) {
        // Deseleccionar
        return prev.filter(n => n !== numero)
      } else {
        // Seleccionar (con límite)
        if (prev.length >= limite) {
          alert(`Máximo ${limite} números por persona`)
          return prev
        }
        return [...prev, numero]
      }
    })

    setTickets(prev => prev.map(ticket => 
      ticket.numero === numero 
        ? { ...ticket, selected: !ticket.selected }
        : ticket
    ))
  }

  const onSubmit = async (data: CompraFormData) => {
    if (!rifa || !rifaId || selectedNumbers.length === 0) return

    setSubmitting(true)
    try {
      // 1. Reservar tickets
      const reservarRes = await fetch('/api/tickets/reservar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rifaId: rifaId,
          numeros: selectedNumbers,
          participante: {
            nombre: data.nombre,
            celular: data.celular,
            email: data.email || undefined
          }
        })
      })

      const reservaData = await reservarRes.json()
      
      if (!reservarRes.ok || !reservaData.success) {
        throw new Error(reservaData.error || 'Error en la reserva')
      }

      // 2. Procesar voucher y crear pago
      const formData = new FormData()
      if (data.voucher && data.voucher[0]) {
        formData.append('voucher', data.voucher[0])
      }
      formData.append('compraId', reservaData.data.compraId)
      formData.append('cuentaBancariaId', data.metodoPago)

      const pagoRes = await fetch('/api/tickets/pago', {
        method: 'POST',
        body: formData
      })

      const pagoData = await pagoRes.json()
      
      if (!pagoRes.ok || !pagoData.success) {
        throw new Error(pagoData.error || 'Error procesando el pago')
      }

      // 3. Mostrar confirmación
      alert(`🎉 ¡Reserva exitosa!\n\nNúmeros reservados: ${selectedNumbers.join(', ')}\nTotal: $${selectedNumbers.length * rifa.precioPorBoleto}\n\nTu pago está en verificación. Te contactaremos pronto.`)
      
      // Limpiar formulario
      setSelectedNumbers([])
      setTickets(prev => prev.map(t => ({ ...t, selected: false })))
      
      // Recargar disponibilidad
      window.location.reload()
      
    } catch (error: any) {
      console.error('Error en compra:', error)
      alert(`Error: ${error.message}`)
    } finally {
      setSubmitting(false)
    }
  }

  const filteredTickets = tickets.filter(ticket => 
    searchNumber === '' || ticket.numero.toString().includes(searchNumber)
  )

  const getTicketClass = (ticket: TicketSelection) => {
    if (ticket.selected) return 'numero-ticket numero-seleccionado'
    
    switch (ticket.estado) {
      case EstadoTicket.DISPONIBLE:
        return 'numero-ticket numero-disponible'
      case EstadoTicket.RESERVADO:
        return 'numero-ticket numero-reservado'
      case EstadoTicket.PAGADO:
        return 'numero-ticket numero-pagado'
      default:
        return 'numero-ticket numero-disponible'
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto flex items-center justify-center py-12">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <p>Cargando información de la rifa...</p>
        </div>
      </div>
    )
  }

  if (!rifa) {
    return (
      <div className="max-w-7xl mx-auto text-center py-12">
        <p className="text-red-600">Error: No se pudo cargar la información de la rifa.</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-8">
      {/* Grilla de números */}
      <div>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              🎯 Selecciona tus números - {rifa.nombre}
              <span className="text-sm font-normal text-gray-600">
                {selectedNumbers.length}/{rifa.limitePorPersona} seleccionados
              </span>
            </CardTitle>
            
            {/* Buscador */}
            <div className="flex gap-2">
              <Input
                placeholder="Buscar número..."
                value={searchNumber}
                onChange={(e) => setSearchNumber(e.target.value)}
                className="max-w-xs"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => setSearchNumber('')}
              >
                Limpiar
              </Button>
            </div>
            
            {/* Leyenda */}
            <div className="flex flex-wrap gap-4 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
                <span>Disponible</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-100 border border-blue-400 rounded"></div>
                <span>Seleccionado</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-yellow-100 border border-yellow-300 rounded"></div>
                <span>Reservado</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-100 border border-red-300 rounded"></div>
                <span>Vendido</span>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="rifa-grid max-h-96 overflow-y-auto">
              {filteredTickets.map((ticket) => (
                <button
                  key={ticket.numero}
                  type="button"
                  className={getTicketClass(ticket)}
                  onClick={() => handleTicketClick(ticket.numero, ticket.estado)}
                  disabled={ticket.estado !== EstadoTicket.DISPONIBLE}
                >
                  {ticket.numero.toString().padStart(3, '0')}
                </button>
              ))}
            </div>
            
            {selectedNumbers.length > 0 && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm font-medium text-blue-800">Números seleccionados:</p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {selectedNumbers.map(num => (
                    <span key={num} className="px-2 py-1 bg-blue-200 text-blue-800 rounded text-xs">
                      {num.toString().padStart(3, '0')}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-blue-600 mt-2">
                  Total: ${selectedNumbers.length * rifa.precioPorBoleto} USD
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Formulario de compra */}
      <div>
        <Card>
          <CardHeader>
            <CardTitle>📝 Datos de compra</CardTitle>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Datos personales */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Nombre completo *
                  </label>
                  <Input
                    {...register('nombre')}
                    placeholder="Tu nombre completo"
                  />
                  {errors.nombre && (
                    <p className="text-red-500 text-xs mt-1">{errors.nombre.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    WhatsApp *
                  </label>
                  <Input
                    {...register('celular')}
                    placeholder="+1234567890"
                    type="tel"
                  />
                  {errors.celular && (
                    <p className="text-red-500 text-xs mt-1">{errors.celular.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Email (opcional)
                  </label>
                  <Input
                    {...register('email')}
                    placeholder="tu@email.com"
                    type="email"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
                  )}
                </div>
              </div>

              {/* Método de pago */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Método de pago *
                </label>
                <div className="space-y-2">
                  {banks.map((bank) => (
                    <label key={bank.id} className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        {...register('metodoPago')}
                        value={bank.id}
                        className="mr-3"
                      />
                      <div>
                        <div className="font-medium">{bank.banco}</div>
                        <div className="text-sm text-gray-600">
                          {bank.numero} - {bank.titular}
                        </div>
                        <div className="text-xs text-gray-500">
                          {bank.tipoCuenta}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
                {errors.metodoPago && (
                  <p className="text-red-500 text-xs mt-1">{errors.metodoPago.message}</p>
                )}
              </div>

              {/* Voucher */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Voucher de pago *
                </label>
                <Input
                  type="file"
                  accept="image/*,.pdf"
                  {...register('voucher')}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Formatos: JPG, PNG, PDF. Máximo 10MB
                </p>
                {errors.voucher && (
                  <p className="text-red-500 text-xs mt-1">{errors.voucher.message?.toString()}</p>
                )}
              </div>

              {/* Términos */}
              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  {...register('aceptaTerminos')}
                  className="mt-1"
                />
                <label className="text-sm">
                  Acepto los{' '}
                  <a href="/terminos" className="text-blue-600 hover:underline">
                    términos y condiciones
                  </a>{' '}
                  y autorizo el tratamiento de mis datos personales
                </label>
              </div>
              {errors.aceptaTerminos && (
                <p className="text-red-500 text-xs">{errors.aceptaTerminos.message}</p>
              )}

              {/* Submit */}
              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={isSubmitting || selectedNumbers.length === 0 || submitting}
              >
                {submitting ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Procesando compra...
                  </>
                ) : (
                  `🎟️ Reservar ${selectedNumbers.length} número${selectedNumbers.length !== 1 ? 's' : ''} - $${selectedNumbers.length * rifa.precioPorBoleto} USD`
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
