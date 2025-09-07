"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AdminHeader } from '@/features/admin/ui/AdminHeader'
import { AdminSection } from '@/features/admin/ui/AdminSection'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { post } from '@/lib/api-client'

export default function NuevoUsuarioPage() {
  const router = useRouter()
  const [form, setForm] = useState({ nombre: '', email: '', password: '', rol: 'ADMIN', celular: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onChange = (k: string, v: string) => setForm(prev => ({ ...prev, [k]: v }))

  const onSubmit = async () => {
    setSaving(true)
    setError(null)
    try {
      const payload: any = { ...form }
      if (!payload.celular) delete payload.celular
      await post('/api/admin/usuarios', payload)
      router.push('/admin/usuarios')
    } catch (e: any) {
      setError(e?.message || 'Error creando usuario')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <AdminHeader title="Nuevo Usuario" description="Crea un usuario administrador o vendedor" />
      <AdminSection title="Datos">
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
            <label className="text-sm text-slate-300">Contraseña</label>
            <Input type="password" value={form.password} onChange={e => onChange('password', e.target.value)} />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-slate-300">Celular (opcional)</label>
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
        </div>
        {error && <p className="text-sm text-red-400 mt-3">{error}</p>}
        <div className="mt-4">
          <Button onClick={onSubmit} disabled={saving} className="bg-emerald-600 hover:bg-emerald-700 text-white">
            {saving ? 'Guardando…' : 'Crear usuario'}
          </Button>
        </div>
      </AdminSection>
    </div>
  )
}

