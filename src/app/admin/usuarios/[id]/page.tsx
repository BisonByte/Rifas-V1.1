"use client"

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { AdminHeader } from '@/features/admin/ui/AdminHeader'
import { AdminSection } from '@/features/admin/ui/AdminSection'
import { Button } from '@/components/ui/Button'
import { get } from '@/lib/api-client'

export default function VerUsuarioPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await get<any>(`/api/admin/usuarios/${params.id}`)
        setUser(res?.success ? res.data : res)
      } catch (e: any) {
        setError(e?.message || 'Error cargando usuario')
      }
    }
    load()
  }, [params.id])

  return (
    <div className="space-y-6">
      <AdminHeader title="Detalle de Usuario" right={<Button onClick={() => router.push(`/admin/usuarios/${params.id}/editar`)}>Editar</Button>} />
      <AdminSection title="Información">
        {error && <p className="text-red-400 text-sm">{error}</p>}
        {!user ? (
          <p className="text-slate-300">Cargando…</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-200">
            <div><span className="text-slate-400">Nombre:</span> <div>{user.nombre}</div></div>
            <div><span className="text-slate-400">Email:</span> <div>{user.email}</div></div>
            <div><span className="text-slate-400">Rol:</span> <div>{user.rol}</div></div>
            <div><span className="text-slate-400">Estado:</span> <div>{user.activo ? 'ACTIVO' : 'INACTIVO'}</div></div>
            <div><span className="text-slate-400">Celular:</span> <div>{user.celular || '-'}</div></div>
            <div><span className="text-slate-400">Creado:</span> <div>{new Date(user.createdAt).toLocaleString('es-ES')}</div></div>
          </div>
        )}
      </AdminSection>
    </div>
  )
}

