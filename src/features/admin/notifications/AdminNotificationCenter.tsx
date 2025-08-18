'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { get, patch } from '@/lib/api-client'

interface Notification {
  id: string
  titulo: string
  mensaje: string
  leida: boolean
  createdAt?: string
}

export function AdminNotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [filter, setFilter] = useState<'all' | 'unread'>('all')
  const [search, setSearch] = useState('')
  const [adminId, setAdminId] = useState<string | null>(null)

  useEffect(() => {
    get('/api/admin/notificaciones?limit=50')
      .then(data => {
        if (data.success) {
          setNotifications(data.data || [])
        }
      })

    const es = new EventSource('/api/notifications/stream')
    es.onmessage = (e) => {
      try {
        const notif = JSON.parse(e.data)
        setNotifications(prev => [
          { ...notif, leida: false },
          ...prev,
        ])
      } catch (err) {
        console.error('Error parsing notification', err)
      }
    }
    return () => es.close()
  }, [])

  useEffect(() => {
    get('/api/auth/me')
      .then(data => {
        if (data.success) {
          setAdminId(data.user.id)
        }
      })
      .catch(err => {
        console.error('Error fetching current user', err)
      })
  }, [])

  const filtered = notifications.filter(n => {
    if (filter === 'unread' && n.leida) return false
    if (search && !n.titulo.toLowerCase().includes(search.toLowerCase()) &&
        !n.mensaje.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const markAllRead = async () => {
    if (!adminId) return
    await patch('/api/admin/notificaciones', { adminId })
    setNotifications(prev => prev.map(n => ({ ...n, leida: true })))
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          placeholder="Buscar..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Button onClick={markAllRead} variant="outline">Marcar todas como leídas</Button>
      </div>
      <div className="flex gap-2">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          onClick={() => setFilter('all')}
        >
          Todas
        </Button>
        <Button
          variant={filter === 'unread' ? 'default' : 'outline'}
          onClick={() => setFilter('unread')}
        >
          No leídas
        </Button>
      </div>
      <ul className="space-y-2 max-h-80 overflow-y-auto">
        {filtered.map(n => (
          <li
            key={n.id}
            className={`border p-3 rounded ${n.leida ? 'bg-gray-100' : 'bg-white'}`}
          >
            <p className="font-medium">{n.titulo}</p>
            <p className="text-sm text-muted-foreground">{n.mensaje}</p>
          </li>
        ))}
        {filtered.length === 0 && (
          <p className="text-center text-muted-foreground">No hay notificaciones</p>
        )}
      </ul>
    </div>
  )
}
