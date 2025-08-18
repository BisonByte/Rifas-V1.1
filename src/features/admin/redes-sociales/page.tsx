'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

interface RedSocial {
  id: string
  nombre: string
  url: string
  icono: string
  activo: boolean
}

export default function RedesSocialesPage() {
  const [redes, setRedes] = useState<RedSocial[]>([])
  const [loading, setLoading] = useState(true)
  const [editingRed, setEditingRed] = useState<Partial<RedSocial> | null>(null)
  const [isCreating, setIsCreating] = useState(false)

  useEffect(() => {
    cargarRedes()
  }, [])

  const cargarRedes = async () => {
    try {
      const response = await fetch('/api/admin/redes-sociales')
      const data = await response.json()
      setRedes(data)
    } catch (error) {
      console.error('Error cargando redes sociales:', error)
    } finally {
      setLoading(false)
    }
  }

  const crearRed = () => {
    setEditingRed({
      nombre: '',
      url: '',
      icono: '🌐',
      activo: true
    })
    setIsCreating(true)
  }

  const editarRed = (red: RedSocial) => {
    setEditingRed(red)
    setIsCreating(false)
  }

  const guardarRed = async () => {
    if (!editingRed) return

    try {
      const method = isCreating ? 'POST' : 'PUT'
      const url = '/api/admin/redes-sociales'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingRed)
      })

      if (response.ok) {
        alert(isCreating ? 'Red social creada exitosamente' : 'Red social actualizada exitosamente')
        setEditingRed(null)
        cargarRedes()
      }
    } catch (error) {
      console.error('Error guardando red social:', error)
      alert('Error guardando red social')
    }
  }

  const toggleActivo = async (id: string, activo: boolean) => {
    try {
      await fetch('/api/admin/redes-sociales', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, activo })
      })
      cargarRedes()
    } catch (error) {
      console.error('Error actualizando estado:', error)
    }
  }

  const eliminarRed = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta red social?')) return

    try {
      await fetch(`/api/admin/redes-sociales?id=${id}`, {
        method: 'DELETE'
      })
      alert('Red social eliminada exitosamente')
      cargarRedes()
    } catch (error) {
      console.error('Error eliminando red social:', error)
      alert('Error eliminando red social')
    }
  }

  const redesPredefinidas = [
    { nombre: 'WhatsApp', icono: '📱' },
    { nombre: 'Instagram', icono: '📷' },
    { nombre: 'Facebook', icono: '📘' },
    { nombre: 'Twitter', icono: '🐦' },
    { nombre: 'Telegram', icono: '✈️' },
    { nombre: 'TikTok', icono: '🎵' },
    { nombre: 'YouTube', icono: '📺' },
    { nombre: 'LinkedIn', icono: '💼' }
  ]

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner />
        <p className="text-gray-600 font-medium mt-4">Cargando redes sociales...</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">📱 Redes Sociales</h1>
              <p className="text-gray-600 font-medium">Configura los enlaces a tus redes sociales</p>
            </div>
            <Button 
              onClick={crearRed} 
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              <span className="flex items-center">
                ➕ Agregar Red Social
              </span>
            </Button>
          </div>
        </div>

        {/* Grid de redes sociales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {redes.map((red) => (
            <div key={red.id} className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className={`p-4 ${red.activo ? 'bg-gradient-to-r from-purple-500 to-pink-600' : 'bg-gradient-to-r from-gray-400 to-gray-500'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-3xl bg-white bg-opacity-20 p-2 rounded-lg">{red.icono}</span>
                    <div>
                      <h3 className="font-bold text-white text-lg">{red.nombre}</h3>
                      <p className="text-white text-sm opacity-90 truncate max-w-32">{red.url}</p>
                    </div>
                  </div>
                  <div className="flex flex-col space-y-1">
                    <Button
                      size="sm"
                      variant={red.activo ? "default" : "outline"}
                      onClick={() => toggleActivo(red.id, !red.activo)}
                      className={`text-xs px-2 py-1 ${red.activo ? 'bg-white text-purple-600 hover:bg-gray-100' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
                    >
                      {red.activo ? '✅ Activo' : '⭕ Inactivo'}
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="p-4">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-600 flex-1">
                    <p className="font-medium mb-1">URL: <span className="break-all text-xs">{red.url}</span></p>
                    <p className="font-medium">Estado: <span className={red.activo ? 'text-green-600' : 'text-red-600'}>{red.activo ? 'Activo' : 'Inactivo'}</span></p>
                  </div>
                  <div className="flex space-x-2 ml-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => editarRed(red)}
                      className="text-blue-600 border-blue-200 hover:bg-blue-50"
                    >
                      ✏️
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => eliminarRed(red.id)}
                      className="text-red-600 border-red-200 hover:bg-red-50"
                    >
                      🗑️
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {redes.length === 0 && (
            <div className="col-span-full text-center py-12">
              <div className="text-6xl mb-4">📱</div>
              <h3 className="text-xl font-bold text-gray-700 mb-2">No hay redes sociales configuradas</h3>
              <p className="text-gray-500 mb-4">Agrega tu primera red social para conectar con tus usuarios</p>
              <Button 
                onClick={crearRed}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
              >
                ➕ Crear Primera Red Social
              </Button>
            </div>
          )}
        </div>
      </div>

      {editingRed && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-screen overflow-y-auto">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4 rounded-t-2xl">
              <h2 className="text-2xl font-bold text-white flex items-center">
                {isCreating ? '➕ Crear Red Social' : '✏️ Editar Red Social'}
              </h2>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Redes predefinidas */}
              <div>
                <label className="block text-sm font-bold text-gray-800 uppercase tracking-wide mb-4">
                  🚀 Selecciona una red popular
                </label>
                <div className="grid grid-cols-4 gap-3">
                  {redesPredefinidas.map((predefinida) => (
                    <Button
                      key={predefinida.nombre}
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingRed({
                        ...editingRed,
                        nombre: predefinida.nombre,
                        icono: predefinida.icono
                      })}
                      className="flex flex-col items-center p-3 h-auto hover:bg-purple-50 hover:border-purple-300 transition-all duration-200"
                    >
                      <span className="text-2xl mb-1">{predefinida.icono}</span>
                      <span className="text-xs font-medium">{predefinida.nombre}</span>
                    </Button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-gray-800 uppercase tracking-wide">
                    Nombre de la Red Social
                  </label>
                  <Input
                    placeholder="Ej: WhatsApp, Instagram"
                    value={editingRed.nombre || ''}
                    onChange={(e) => setEditingRed({...editingRed, nombre: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 font-medium text-gray-700"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-bold text-gray-800 uppercase tracking-wide">
                    Icono (Emoji)
                  </label>
                  <Input
                    placeholder="📱"
                    value={editingRed.icono || ''}
                    onChange={(e) => setEditingRed({...editingRed, icono: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 font-medium text-gray-700 text-center text-2xl"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-800 uppercase tracking-wide">
                  URL Completa
                </label>
                <Input
                  placeholder="https://wa.me/584121234567?text=Hola"
                  value={editingRed.url || ''}
                  onChange={(e) => setEditingRed({...editingRed, url: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 font-medium text-gray-700"
                />
              </div>

              <div className="flex items-center space-x-3">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingRed.activo || false}
                    onChange={(e) => setEditingRed({...editingRed, activo: e.target.checked})}
                    className="w-5 h-5 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
                  />
                  <span className="font-bold text-gray-800">Red Social Activa</span>
                </label>
              </div>
            </div>

            <div className="flex space-x-3 p-6 bg-gray-50 rounded-b-2xl">
              <Button 
                onClick={guardarRed} 
                className="flex-1 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                💾 Guardar
              </Button>
              <Button 
                onClick={() => setEditingRed(null)}
                variant="outline"
                className="flex-1 border-2 border-gray-300 hover:bg-gray-100 font-bold py-3 px-6 rounded-lg transition-all duration-200"
              >
                ❌ Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Panel de consejos mejorado */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-indigo-500 px-6 py-4">
          <h3 className="text-lg font-bold text-white flex items-center">
            💡 Ejemplos de URLs para Redes Sociales
          </h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-lg border border-blue-200">
              <h4 className="font-bold text-gray-800 mb-2 flex items-center">📱 WhatsApp</h4>
              <p className="text-sm text-gray-600 font-mono break-all">https://wa.me/584121234567?text=Hola</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-blue-200">
              <h4 className="font-bold text-gray-800 mb-2 flex items-center">📷 Instagram</h4>
              <p className="text-sm text-gray-600 font-mono break-all">https://instagram.com/tu_usuario</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-blue-200">
              <h4 className="font-bold text-gray-800 mb-2 flex items-center">📘 Facebook</h4>
              <p className="text-sm text-gray-600 font-mono break-all">https://facebook.com/tu_pagina</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-blue-200">
              <h4 className="font-bold text-gray-800 mb-2 flex items-center">✈️ Telegram</h4>
              <p className="text-sm text-gray-600 font-mono break-all">https://t.me/tu_canal</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
