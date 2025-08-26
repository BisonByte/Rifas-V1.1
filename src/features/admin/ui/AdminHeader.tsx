'use client'

import React from 'react'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'

type Props = {
  title: string
  description?: string
  right?: React.ReactNode
  className?: string
}

export function AdminHeader({ title, description, right, className }: Props) {
  return (
    <Card className={`animate-slide-in ${className || ''}`}>
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-5">
        <div>
          <CardTitle className="text-2xl">{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </div>
        {right && <div className="mt-4 sm:mt-0">{right}</div>}
      </CardHeader>
    </Card>
  )
}

export default AdminHeader
