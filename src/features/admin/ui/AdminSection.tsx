'use client'

import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'

type Props = {
  title: string
  subtitle?: string
  actions?: React.ReactNode
  children: React.ReactNode
  className?: string
}

export function AdminSection({ title, subtitle, actions, children, className }: Props) {
  return (
    <Card className={`overflow-hidden ${className || ''}`}>
      <CardHeader className="bg-gradient-to-r from-zinc-800/70 via-zinc-800/40 to-zinc-800/70 border-b border-white/10">
        <div className="flex items-center justify-between gap-4">
          <div>
            <CardTitle className="text-lg">{title}</CardTitle>
            {subtitle && (
              <p className="text-sm text-zinc-400 mt-1">{subtitle}</p>
            )}
          </div>
          {actions && <div className="shrink-0">{actions}</div>}
        </div>
      </CardHeader>
      <CardContent className="bg-black/30 backdrop-blur-sm">
        {children}
      </CardContent>
    </Card>
  )
}

export default AdminSection
