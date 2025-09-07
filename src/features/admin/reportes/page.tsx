'use client'

import { useEffect, useState } from 'react'
import { AdminHeader } from '@/features/admin/ui/AdminHeader'
import { AdminSection } from '@/features/admin/ui/AdminSection'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'

interface Stats { totalEventos: number; totalParticipantes: number; totalTickets: number; totalIngresos: number }

export default function ReportesPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  useEffect(() => {
    ;(async () => {
      try {
        const res = await fetch('/api/admin/dashboard', { cache: 'no-store' })
        const json = await res.json()
        setStats(json?.stats || null)
      } catch {}
    })()
  }, [])

  return (
    <div className="p-6 space-y-8">
      <AdminHeader title="Reportes" description="Resumen general y navegación a exportes" />
      <AdminSection title="Resumen">
        <Card className="bg-slate-800/60 border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-white">Visión general</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm text-slate-300">
            <div className="rounded-lg bg-black/20 px-3 py-2 ring-1 ring-white/10">
              <div className="text-slate-400 text-xs">Eventos</div>
              <div className="font-semibold text-white">{stats?.totalEventos ?? '-'}</div>
            </div>
            <div className="rounded-lg bg-black/20 px-3 py-2 ring-1 ring-white/10">
              <div className="text-slate-400 text-xs">Participantes</div>
              <div className="font-semibold text-white">{stats?.totalParticipantes?.toLocaleString?.() ?? '-'}</div>
            </div>
            <div className="rounded-lg bg-black/20 px-3 py-2 ring-1 ring-white/10">
              <div className="text-slate-400 text-xs">Tickets</div>
              <div className="font-semibold text-white">{stats?.totalTickets?.toLocaleString?.() ?? '-'}</div>
            </div>
            <div className="rounded-lg bg-black/20 px-3 py-2 ring-1 ring-white/10">
              <div className="text-slate-400 text-xs">Ingresos</div>
              <div className="font-semibold text-yellow-300">$ {stats?.totalIngresos?.toLocaleString?.() ?? '-'}</div>
            </div>
          </CardContent>
        </Card>
      </AdminSection>

      <AdminSection title="Accesos rápidos">
        <Card className="bg-slate-800/60 border-slate-700/50">
          <CardContent className="p-4 text-slate-300 text-sm">
            Para reportes de pagos y exportación CSV dirígete a la sección de Pagos.
            <div className="mt-3">
              <a href="/admin/pagos" className="inline-flex items-center px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-500">Ir a Pagos</a>
            </div>
          </CardContent>
        </Card>
      </AdminSection>
    </div>
  )
}

