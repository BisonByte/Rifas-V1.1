'use client'

import { useState } from 'react'

export function PersonalInfo() {
  const [formData, setFormData] = useState({
    nombre: '',
    telefono: '',
    email: '',
    cedula: ''
  })

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-4 text-center text-yellow-300">Información Personal</h3>
      
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium mb-1">Nombre Completo *</label>
          <input
            type="text"
            value={formData.nombre}
            onChange={(e) => handleChange('nombre', e.target.value)}
            placeholder="Tu nombre completo"
            className="w-full px-3 py-2 bg-red-700 border border-red-500 rounded-lg text-white placeholder-red-300 focus:border-yellow-500 focus:outline-none"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Teléfono *</label>
          <input
            type="tel"
            value={formData.telefono}
            onChange={(e) => handleChange('telefono', e.target.value)}
            placeholder="+58 412 123 4567"
            className="w-full px-3 py-2 bg-red-700 border border-red-500 rounded-lg text-white placeholder-red-300 focus:border-yellow-500 focus:outline-none"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            placeholder="tu@email.com"
            className="w-full px-3 py-2 bg-red-700 border border-red-500 rounded-lg text-white placeholder-red-300 focus:border-yellow-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Cédula</label>
          <input
            type="text"
            value={formData.cedula}
            onChange={(e) => handleChange('cedula', e.target.value)}
            placeholder="V-12345678"
            className="w-full px-3 py-2 bg-red-700 border border-red-500 rounded-lg text-white placeholder-red-300 focus:border-yellow-500 focus:outline-none"
          />
        </div>
      </div>
    </div>
  )
}
