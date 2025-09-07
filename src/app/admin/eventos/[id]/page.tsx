'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { get } from '@/lib/api-client'
import { AdminHeader } from '@/features/admin/ui/AdminHeader'
import { AdminSection } from '@/features/admin/ui/AdminSection'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'

export default function VerEventoPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const id = params?.id as string
  const [data, setData] = useState<any>(null)
  const [err, setErr] = useState<string | null>(null)
  const [stats, setStats] = useState<{ disponibles: number; vendidos: number; reservados: number; total: number } | null>(null)
  const [topCompradores, setTopCompradores] = useState<Array<{ participanteId: string; nombre: string; totalTickets: number; totalMonto: number }>>([])

  useEffect(() => {
    if (!id) return
    ;(async () => {
      try {
        const res = await get<any>(`/api/rifas/${id}`)
        setData(res?.data ?? res)
        const [s, top] = await Promise.all([
          get<any>(`/api/rifas/${id}/stats`).catch(() => null),
          get<any>(`/api/rifas/${id}/top-compradores`).catch(() => null),
        ])
        if (s?.success && s.data) setStats(s.data)
        const topList = top?.success ? top.data : top
        if (Array.isArray(topList)) setTopCompradores(topList)
      } catch (e: any) {
        setErr(e?.message || 'Error cargando rifa')
      }
    })()
  }, [id])

  return (
    <div className="p-6 space-y-8">
      <AdminHeader title="Detalle del evento" description="Información de la rifa" />
      <AdminSection title="Resumen">
        <Card className="bg-slate-800/60 border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-white">{data?.nombre ?? 'Cargando...'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-slate-300">
            {err && <div className="text-red-400 text-sm">{err}</div>}
            {data?.portadaUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={data.portadaUrl} alt="Portada" className="w-full max-w-xl rounded-lg" />
            )}
            <div>Descripción: {data?.descripcion}</div>
            <div>Fecha sorteo: {data?.fechaSorteo ? new Date(data.fechaSorteo).toLocaleString() : '-'}</div>
            <div>Precio por boleto: {data?.precioPorBoleto}</div>
            <div>Total de boletos: {data?.totalBoletos}</div>
            {stats && (
              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <div className="rounded-lg bg-black/20 px-3 py-2 ring-1 ring-white/10">
                    <div className="stat-title">Disponibles</div>
                    <div className="stat-number">{stats.disponibles}</div>
                </div>
                <div className="rounded-lg bg-black/20 px-3 py-2 ring-1 ring-white/10">
                  <div className="stat-title">Reservados</div>
                  <div className="stat-number">{stats.reservados}</div>
                </div>
                <div className="rounded-lg bg-black/20 px-3 py-2 ring-1 ring-white/10">
                  <div className="stat-title">Vendidos</div>
                  <div className="stat-number">{stats.vendidos}</div>
                </div>
                <div className="rounded-lg bg-black/20 px-3 py-2 ring-1 ring-white/10">
                  <div className="stat-title">Ingreso estimado</div>
                  <div className="stat-number text-yellow-300">$ {(Number(data?.precioPorBoleto || 0) * stats.vendidos).toFixed(2)}</div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </AdminSection>

      <AdminSection title="Top compradores">
        <Card className="bg-slate-800/60 border-slate-700/50">
          <CardContent className="p-0">
            {topCompradores.length === 0 ? (
              <div className="p-4 text-sm text-slate-300">Aún no hay datos.</div>
            ) : (
              <ul className="divide-y divide-white/5">
                {topCompradores.map((c, idx) => (
                  <li key={c.participanteId} className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-purple-600 text-white">#{idx + 1}</span>
                      <span className="font-medium text-sm text-white truncate">{c.nombre}</span>
                    </div>
                    <div className="text-xs sm:text-sm text-slate-300 whitespace-nowrap">
                      <span className="mr-3">{c.totalTickets} tickets</span>
                      <span>$ {c.totalMonto.toFixed(2)}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </AdminSection>
    </div>
  )
}
