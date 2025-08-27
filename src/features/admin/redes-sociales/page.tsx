'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { get, post, put, del } from '@/lib/api-client'
import { AdminHeader } from '@/features/admin/ui/AdminHeader'
import { AdminSection } from '@/features/admin/ui/AdminSection'

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
      const data = await get('/api/admin/redes-sociales')
      setRedes((data as any)?.success ? (data as any).data : (data as RedSocial[]))
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
      const url = '/api/admin/redes-sociales'
      if (isCreating) {
        await post(url, editingRed)
      } else {
        await put(url, editingRed)
      }
      alert(isCreating ? 'Red social creada exitosamente' : 'Red social actualizada exitosamente')
      setEditingRed(null)
      cargarRedes()
    } catch (error) {
      console.error('Error guardando red social:', error)
      alert('Error guardando red social')
    }
  }

  const toggleActivo = async (id: string, activo: boolean) => {
    try {
      await put('/api/admin/redes-sociales', { id, activo })
      cargarRedes()
    } catch (error) {
      console.error('Error actualizando estado:', error)
    }
  }

  const eliminarRed = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta red social?')) return

    try {
      await del(`/api/admin/redes-sociales?id=${id}`)
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
    <div className="p-12 flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner />
        <p className="text-slate-300 font-medium mt-4">Cargando redes sociales...</p>
      </div>
    </div>
  )

  return (
  <div>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <AdminHeader
          title="📱 Redes Sociales"
          description="Configura los enlaces a tus redes sociales"
          right={<Button onClick={crearRed} className="btn-shine">➕ Agregar Red Social</Button>}
        />

        {/* Grid de redes sociales */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {redes.map((red) => (
      <Card key={red.id} className="overflow-hidden transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-xl">
              <div className={`p-4 ${red.activo ? 'bg-gradient-to-r from-fuchsia-600 to-purple-700' : 'bg-slate-700/70'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl bg-white/10 p-2 rounded-lg">{red.icono}</span>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-white text-lg truncate">{red.nombre}</h3>
                      <p className="text-white/80 text-xs truncate max-w-[220px]">{red.url}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleActivo(red.id, !red.activo)}
                    className={`text-xs px-2 py-1 rounded-md border backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-fuchsia-400/30 ${red.activo ? 'bg-white/20 text-white border-white/20' : 'bg-slate-800/50 text-slate-300 border-slate-600/40'}`}
                  >
                    {red.activo ? 'Activo' : 'Inactivo'}
                  </button>
                </div>
              </div>
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="text-xs text-slate-300 break-all flex-1">
                    <div className="opacity-70">URL</div>
                    <div className="font-mono text-slate-200/90 mt-0.5">{red.url}</div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => editarRed(red)} className="border-slate-600/50 text-slate-200 hover:bg-slate-700/40">✏️</Button>
                    <Button size="sm" variant="outline" onClick={() => eliminarRed(red.id)} className="border-red-600/40 text-red-300 hover:bg-red-600/10">🗑️</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {redes.length === 0 && (
            <div className="col-span-full text-center py-12 text-slate-300">
              <div className="text-6xl mb-4">📱</div>
              <h3 className="text-xl font-semibold mb-2">No hay redes sociales configuradas</h3>
              <p className="opacity-80 mb-4">Agrega tu primera red social para conectar con tus usuarios</p>
              <Button 
                onClick={crearRed}
                className=""
              >
                ➕ Crear Primera Red Social
              </Button>
            </div>
          )}
        </div>
      </div>

      {editingRed && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-screen overflow-y-auto border border-slate-700/50 scrollbar-modern">
            <div className="bg-gradient-to-r from-emerald-600 to-green-700 px-6 py-4 rounded-t-2xl">
              <h2 className="text-2xl font-bold text-white">
                {isCreating ? '➕ Crear Red Social' : '✏️ Editar Red Social'}
              </h2>
            </div>
            
            <div className="p-6 space-y-6 text-slate-200">
              {/* Redes predefinidas */}
              <div>
                <label className="block text-sm font-semibold text-slate-300 uppercase tracking-wide mb-4">
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
                      className="flex flex-col items-center p-3 h-auto border-slate-600/50 text-slate-200 hover:bg-slate-700/40"
                    >
                      <span className="text-2xl mb-1">{predefinida.icono}</span>
                      <span className="text-xs font-medium">{predefinida.nombre}</span>
                    </Button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-300 uppercase tracking-wide">
                    Nombre de la Red Social
                  </label>
                  <Input
                    placeholder="Ej: WhatsApp, Instagram"
                    value={editingRed.nombre || ''}
                    onChange={(e) => setEditingRed({...editingRed, nombre: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-800/60 border border-slate-600/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-200 placeholder-slate-400"
                  />
                  <p className="text-xs text-slate-400">Obligatorio</p>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-300 uppercase tracking-wide">
                    Icono (Emoji)
                  </label>
                  <Input
                    placeholder="📱"
                    value={editingRed.icono || ''}
                    onChange={(e) => setEditingRed({...editingRed, icono: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-800/60 border border-slate-600/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-200 placeholder-slate-400 text-center text-2xl"
                  />
                  <p className="text-xs text-slate-400">Puedes usar un emoji o un ícono corto</p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-300 uppercase tracking-wide">
                  URL Completa
                </label>
                <Input
                  placeholder="https://wa.me/584121234567?text=Hola"
                  value={editingRed.url || ''}
                  onChange={(e) => setEditingRed({...editingRed, url: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-800/60 border border-slate-600/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-200 placeholder-slate-400"
                />
                <p className="text-xs text-slate-400">Debe comenzar con http:// o https://</p>
              </div>

              <div className="flex items-center space-x-3">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingRed.activo || false}
                    onChange={(e) => setEditingRed({...editingRed, activo: e.target.checked})}
                    className="w-5 h-5 text-emerald-500 bg-slate-800 border-slate-600 rounded focus:ring-emerald-500 focus:ring-2"
                  />
                  <span className="font-semibold text-slate-300">Red Social Activa</span>
                </label>
              </div>
            </div>

            <div className="flex space-x-3 p-6 bg-slate-800/40 rounded-b-2xl">
              <Button 
                onClick={guardarRed} 
                className="flex-1"
              >
                💾 Guardar
              </Button>
              <Button 
                onClick={() => setEditingRed(null)}
                variant="outline"
                className="flex-1 border-slate-600/50 text-slate-200 hover:bg-slate-700/40"
              >
                ❌ Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}

      
    </div>
  )
}
