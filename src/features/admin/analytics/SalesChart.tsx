'use client'

import { useEffect, useState } from 'react'

interface Point {
  fecha: string
  monto: number
}

export function SalesChart() {
  const [data, setData] = useState<Point[]>([])

  useEffect(() => {
    fetch('/api/admin/analytics/ventas')
      .then(res => res.json())
      .then(res => {
        if (res.success) setData(res.data)
      })
  }, [])

  const max = Math.max(...data.map(d => d.monto), 0)

  return (
    <div className="w-full">
      <div className="flex items-end h-40 space-x-2">
        {data.map((p) => (
          <div key={p.fecha} className="flex-1 flex flex-col items-center">
            <div
              className="w-full bg-blue-500 rounded-sm"
              style={{ height: max ? `${(p.monto / max) * 100}%` : '0%' }}
            ></div>
            <span className="text-xs mt-1">{p.fecha.slice(5, 10)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
