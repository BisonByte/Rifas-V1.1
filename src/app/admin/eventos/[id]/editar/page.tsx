'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { get, put } from '@/lib/api-client'
import { AdminHeader } from '@/features/admin/ui/AdminHeader'
import { AdminSection } from '@/features/admin/ui/AdminSection'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

export default function EditarEventoPage() {
  const params = useParams<{ id: string }>()
  const id = params?.id as string
  const router = useRouter()
  const [form, setForm] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    ;(async () => {
      try {
        const res = await get<any>(`/api/rifas/${id}`)
        const r = res?.data ?? res
        setForm({
          nombre: r.nombre,
          descripcion: r.descripcion,
          fechaSorteo: r.fechaSorteo ? new Date(r.fechaSorteo).toISOString().slice(0,16) : '',
          precioPorBoleto: r.precioPorBoleto,
          precioUSD: r.precioUSD ?? 0,
          totalBoletos: r.totalBoletos,
          limitePorPersona: r.limitePorPersona ?? 10,
          tiempoReserva: r.tiempoReserva ?? 30,
          portadaUrl: r.portadaUrl ?? '',
          mostrarTopCompradores: !!r.mostrarTopCompradores
        })
      } catch (e: any) {
        setError(e?.message || 'Error cargando rifa')
      }
    })()
  }, [id])

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setForm((p: any) => ({ ...p, [name]: name.includes('precio') || name.includes('total') || name.includes('limite') || name.includes('reserva') ? Number(value) : value }))
  }

  const onToggleTop = (value: boolean) => {
    setForm((p: any) => ({ ...p, mostrarTopCompradores: value }))
  }

  const guardar = async () => {
    try {
      setLoading(true)
      setError(null)
      const payload = {
        ...form,
        fechaSorteo: form.fechaSorteo ? new Date(form.fechaSorteo) : null
      }
      const res = await put<any>(`/api/rifas/${id}`, payload)
      if (!res?.success) throw new Error(res?.error || 'No se pudo guardar')
      router.push('/admin/eventos')
    } catch (e: any) {
      setError(e?.message || 'Error al guardar')
    } finally {
      setLoading(false)
    }
  }

  if (!form) return <div className="p-6">Cargando...</div>

  return (
    <div className="p-6 space-y-8">
      <AdminHeader title="Editar evento" description="Actualiza los datos de la rifa" />
      <AdminSection title="Formulario">
        <Card className="bg-slate-800/60 border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-white">{form.nombre || 'Evento'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && <div className="text-red-400 text-sm">{error}</div>}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <div className="md:col-span-2">
                <label className="block text-slate-300 mb-2">Precio por boleto</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 text-xs mb-1">Bolívares (VES)</label>
                    <input type="number" step="0.01" name="precioPorBoleto" value={form.precioPorBoleto} onChange={onChange} className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white" />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-xs mb-1">Dólares (USD) <span className="text-slate-500">(opcional)</span></label>
                    <input type="number" step="0.01" name="precioUSD" value={form.precioUSD} onChange={onChange} className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white" />
                    <p className="text-xs text-slate-400 mt-1">Se mostrará para pagos por Zelle o Criptomonedas.</p>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-slate-300 mb-1">Total de boletos</label>
                <input type="number" name="totalBoletos" value={form.totalBoletos} onChange={onChange} className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-slate-300 mb-2">Top compradores</label>
                <div className="flex items-center justify-between p-3 rounded-xl border border-slate-600/50 bg-slate-700/30">
                  <div>
                    <div className="text-slate-200 font-medium">Mostrar Top compradores</div>
                    <div className="text-slate-400 text-sm">Permite mostrar el ranking de compradores en la página pública</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onToggleTop(!form.mostrarTopCompradores)}
                    className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${form.mostrarTopCompradores ? 'bg-green-500/70' : 'bg-slate-600/70'}`}
                    aria-pressed={!!form.mostrarTopCompradores}
                  >
                    <span className={`inline-block h-6 w-6 transform rounded-full bg-white shadow transition-transform ${form.mostrarTopCompradores ? 'translate-x-6' : 'translate-x-1'}`}></span>
                  </button>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <Button onClick={guardar} disabled={loading}>{loading ? 'Guardando...' : 'Guardar'}</Button>
              <Button variant="secondary" onClick={() => router.push('/admin/eventos')} disabled={loading}>Cancelar</Button>
            </div>
          </CardContent>
        </Card>
      </AdminSection>
    </div>
  )
}
