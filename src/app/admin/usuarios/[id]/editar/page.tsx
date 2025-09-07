"use client"

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { AdminHeader } from '@/features/admin/ui/AdminHeader'
import { AdminSection } from '@/features/admin/ui/AdminSection'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { get, put } from '@/lib/api-client'

export default function EditarUsuarioPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [form, setForm] = useState<any>({ nombre: '', email: '', celular: '', rol: 'ADMIN', activo: true, password: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await get<any>(`/api/admin/usuarios/${id}`)
        const u = res?.success ? res.data : res
        setForm({ nombre: u.nombre, email: u.email, celular: u.celular || '', rol: u.rol, activo: !!u.activo, password: '' })
      } catch (e: any) {
        setError(e?.message || 'Error cargando usuario')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  const onChange = (k: string, v: any) => setForm((p: any) => ({ ...p, [k]: v }))

  const onSubmit = async () => {
    setSaving(true)
    setError(null)
    try {
      const payload: any = { nombre: form.nombre, email: form.email, celular: form.celular, rol: form.rol, activo: form.activo }
      if (form.password) payload.password = form.password
      await put(`/api/admin/usuarios/${id}`, payload)
      router.push(`/admin/usuarios/${id}`)
    } catch (e: any) {
      setError(e?.message || 'Error guardando')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <AdminHeader title="Editar Usuario" />
      <AdminSection title="Formulario">
        {loading ? (
          <p className="text-slate-300">Cargando…</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm text-slate-300">Nombre</label>
              <Input value={form.nombre} onChange={e => onChange('nombre', e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-slate-300">Email</label>
              <Input type="email" value={form.email} onChange={e => onChange('email', e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-slate-300">Celular</label>
              <Input value={form.celular} onChange={e => onChange('celular', e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-slate-300">Rol</label>
              <select value={form.rol} onChange={e => onChange('rol', e.target.value)} className="w-full px-3 py-2 bg-slate-800/60 border border-slate-600/50 rounded-lg text-slate-200">
                <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                <option value="ADMIN">ADMIN</option>
                <option value="VENDEDOR">VENDEDOR</option>
                <option value="AUDITOR">AUDITOR</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-slate-300">Contraseña (dejar en blanco para no cambiar)</label>
              <Input type="password" value={form.password} onChange={e => onChange('password', e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-slate-300">Estado</label>
              <select value={form.activo ? 'true' : 'false'} onChange={e => onChange('activo', e.target.value === 'true')} className="w-full px-3 py-2 bg-slate-800/60 border border-slate-600/50 rounded-lg text-slate-200">
                <option value="true">ACTIVO</option>
                <option value="false">INACTIVO</option>
              </select>
            </div>
          </div>
        )}
        {error && <p className="text-sm text-red-400 mt-3">{error}</p>}
        <div className="mt-4">
          <Button onClick={onSubmit} disabled={saving} className="bg-emerald-600 hover:bg-emerald-700 text-white">
            {saving ? 'Guardando…' : 'Guardar cambios'}
          </Button>
        </div>
      </AdminSection>
    </div>
  )
}

