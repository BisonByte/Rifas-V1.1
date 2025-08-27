'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { post } from '@/lib/api-client'
import { HttpError } from '@/lib/api-client'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { AdminHeader } from '@/features/admin/ui/AdminHeader'
import { AdminSection } from '@/features/admin/ui/AdminSection'

export default function NuevoEventoPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    nombre: '',
    descripcion: '',
    fechaSorteo: '',
    precioPorBoleto: 1,
    totalBoletos: 100,
    limitePorPersona: 10,
    tiempoReserva: 30,
    moneda: 'VES',
    zonaHoraria: 'UTC',
    portadaUrl: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: name === 'precioPorBoleto' || name === 'totalBoletos' || name === 'limitePorPersona' || name === 'tiempoReserva' ? Number(value) : value }))
  }

  const crear = async () => {
    try {
      setLoading(true)
      setError(null)
      // Validaciones rápidas en cliente
      if (!form.nombre || form.nombre.trim().length < 3) {
        throw new Error('El nombre es obligatorio (mínimo 3 caracteres)')
      }
      if (!form.descripcion || form.descripcion.trim().length < 10) {
        throw new Error('La descripción es obligatoria (mínimo 10 caracteres)')
      }
      if (!form.fechaSorteo) {
        throw new Error('La fecha del sorteo es obligatoria')
      }
      const payload = {
        ...form,
        fechaSorteo: new Date(form.fechaSorteo)
      }
      const res = await post<any>('/api/rifas', payload)
      if (!res?.success) throw new Error(res?.error || 'No se pudo crear el evento')
      router.push('/admin/eventos')
    } catch (err) {
      if (err instanceof HttpError) {
        const details = Array.isArray(err.details) ? ` Detalles: ${err.details.join('; ')}` : ''
        setError(`${err.message}.${details}`)
      } else {
        setError(err instanceof Error ? err.message : 'Error al crear el evento')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 space-y-8">
      <AdminHeader title="Crear Evento" description="Completa los datos para crear una nueva rifa" />

      <AdminSection title="Datos del evento">
        <Card className="bg-slate-800/60 border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-white">Formulario</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && <div className="text-red-400 text-sm">{error}</div>}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-slate-300 mb-1">Imagen de portada</label>
                <div className="flex items-start gap-4">
                  <div className="w-40 h-28 bg-slate-700/50 border border-slate-600/50 rounded-lg flex items-center justify-center overflow-hidden">
                    {form.portadaUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={form.portadaUrl} alt="Portada" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-slate-400 text-xs px-2 text-center">Sin imagen</span>
                    )}
                  </div>
                  <div className="space-y-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0]
                        if (!file) return
                        try {
                          setUploading(true)
                          const fd = new FormData()
                          fd.append('file', file)
                          const res = await fetch('/api/upload', { method: 'POST', body: fd, credentials: 'include' })
                          const data = await res.json()
                          if (!res.ok || !data?.url) throw new Error(data?.error || 'Error subiendo imagen')
                          setForm((p) => ({ ...p, portadaUrl: data.url }))
                        } catch (e: any) {
                          setError(e?.message || 'No se pudo subir la imagen')
                        } finally {
                          setUploading(false)
                        }
                      }}
                      className="block text-sm text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-slate-600 file:text-white hover:file:bg-slate-500"
                    />
                    {uploading && <div className="text-xs text-slate-400">Subiendo imagen...</div>}
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-slate-300 mb-1">Nombre</label>
                <input name="nombre" value={form.nombre} onChange={onChange} className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white" />
              </div>
              <div>
                <label className="block text-slate-300 mb-1">Fecha del sorteo</label>
                <input type="datetime-local" name="fechaSorteo" value={form.fechaSorteo} onChange={onChange} className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-slate-300 mb-1">Descripción</label>
                <textarea name="descripcion" value={form.descripcion} onChange={onChange} className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white" />
              </div>
              <div>
                <label className="block text-slate-300 mb-1">Precio por boleto</label>
                <input type="number" step="0.01" name="precioPorBoleto" value={form.precioPorBoleto} onChange={onChange} className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white" />
              </div>
              <div>
                <label className="block text-slate-300 mb-1">Total de boletos</label>
                <input type="number" name="totalBoletos" value={form.totalBoletos} onChange={onChange} className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white" />
              </div>
              <div>
                <label className="block text-slate-300 mb-1">Límite por persona</label>
                <input type="number" name="limitePorPersona" value={form.limitePorPersona} onChange={onChange} className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white" />
              </div>
              <div>
                <label className="block text-slate-300 mb-1">Tiempo de reserva (min)</label>
                <input type="number" name="tiempoReserva" value={form.tiempoReserva} onChange={onChange} className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white" />
              </div>
            </div>
            <div className="flex gap-3">
              <Button onClick={crear} disabled={loading}>
                {loading ? 'Creando...' : 'Crear evento'}
              </Button>
              <Button variant="secondary" onClick={() => router.push('/admin/eventos')} disabled={loading}>
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      </AdminSection>
    </div>
  )
}
