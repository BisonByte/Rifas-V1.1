'use client'

import { useState, useEffect } from 'react'

interface MetodoPago {
  id: string
  nombre: string
  tipo: string
  activo: boolean
  icono?: string
  datos: string
}

export function PaymentMethods() {
  const [metodos, setMetodos] = useState<MetodoPago[]>([])
  const [selectedMethod, setSelectedMethod] = useState<string>('')

  useEffect(() => {
    fetch('/api/metodos-pago')
      .then(res => res.json())
      .then(json => {
        const data = json?.success ? json.data : json
        setMetodos(data.filter((m: MetodoPago) => m.activo))
      })
      .catch(console.error)
  }, [])

  const renderPaymentDetails = (metodo: MetodoPago) => {
    try {
      const datos = JSON.parse(metodo.datos)
      
      switch (metodo.tipo) {
        case 'BANCO':
          return (
            <div className="mt-2 p-3 bg-red-800 rounded-lg text-sm">
              <p><strong>Banco:</strong> {datos.banco}</p>
              <p><strong>Cuenta:</strong> {datos.numeroCuenta}</p>
              <p><strong>Titular:</strong> {datos.titular}</p>
              <p><strong>Tipo:</strong> {datos.tipoCuenta}</p>
              <p><strong>Cédula:</strong> {datos.cedulaTitular}</p>
            </div>
          )
        
        case 'PAGO_MOVIL':
          return (
            <div className="mt-2 p-3 bg-red-800 rounded-lg text-sm">
              <p><strong>Banco:</strong> {datos.banco}</p>
              <p><strong>Teléfono:</strong> {datos.telefono}</p>
              <p><strong>Cédula:</strong> {datos.cedula}</p>
            </div>
          )
        
        case 'BILLETERA':
          return (
            <div className="mt-2 p-3 bg-red-800 rounded-lg text-sm">
              <p><strong>Usuario:</strong> {datos.usuario}</p>
              <p><strong>Teléfono:</strong> {datos.telefono}</p>
            </div>
          )
        
        case 'CRIPTOMONEDA':
          return (
            <div className="mt-2 p-3 bg-red-800 rounded-lg text-sm">
              <p><strong>Moneda:</strong> {datos.moneda}</p>
              <p><strong>Dirección:</strong> {datos.direccion}</p>
              <p><strong>Red:</strong> {datos.red}</p>
            </div>
          )
        
        default:
          return (
            <div className="mt-2 p-3 bg-red-800 rounded-lg text-sm">
              <p>{datos.descripcion || 'Información del método de pago'}</p>
            </div>
          )
      }
    } catch {
      return (
        <div className="mt-2 p-3 bg-red-800 rounded-lg text-sm">
          <p>Información del método de pago disponible</p>
        </div>
      )
    }
  }

  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-4 text-center text-yellow-300">Métodos de Pago</h3>
      
      <div className="space-y-3">
        {metodos.map(metodo => (
          <div key={metodo.id}>
            <button
              onClick={() => setSelectedMethod(selectedMethod === metodo.id ? '' : metodo.id)}
              className={`
                w-full p-3 rounded-lg border text-left transition-colors
                ${selectedMethod === metodo.id
                  ? 'bg-yellow-500 text-black border-yellow-400'
                  : 'bg-red-700 text-white border-red-500 hover:bg-red-600'
                }
              `}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {metodo.icono && (
                    <span className="text-2xl">{metodo.icono}</span>
                  )}
                  <div>
                    <p className="font-semibold">{metodo.nombre}</p>
                    <p className="text-sm opacity-75">{metodo.tipo.replace('_', ' ')}</p>
                  </div>
                </div>
                <span className="text-xl">
                  {selectedMethod === metodo.id ? '▲' : '▼'}
                </span>
              </div>
            </button>
            
            {selectedMethod === metodo.id && renderPaymentDetails(metodo)}
          </div>
        ))}
        
        {metodos.length === 0 && (
          <div className="text-center py-4 text-gray-400">
            <p>No hay métodos de pago configurados</p>
          </div>
        )}
      </div>

      {selectedMethod && (
        <div className="mt-4 p-3 bg-green-700 rounded-lg">
          <p className="text-sm font-semibold">📱 Instrucciones:</p>
          <p className="text-xs mt-1">
            1. Realiza el pago por el monto exacto<br/>
            2. Toma captura del comprobante<br/>
            3. Envía el comprobante por WhatsApp<br/>
            4. Recibirás tus números por mensaje
          </p>
        </div>
      )}
    </div>
  )
}
