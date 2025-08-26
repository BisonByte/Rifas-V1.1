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

  useEffect(() => {
    if (!id) return
    ;(async () => {
      try {
        const res = await get<any>(`/api/rifas/${id}`)
        setData(res?.data ?? res)
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
          </CardContent>
        </Card>
      </AdminSection>
    </div>
  )
}
