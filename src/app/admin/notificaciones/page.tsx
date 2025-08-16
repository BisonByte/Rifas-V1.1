import { AdminNotificationCenter } from '@/components/notifications/AdminNotificationCenter'

export const dynamic = 'force-dynamic'

export default function AdminNotificationsPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Centro de Notificaciones</h1>
      <AdminNotificationCenter />
    </div>
  )
}
