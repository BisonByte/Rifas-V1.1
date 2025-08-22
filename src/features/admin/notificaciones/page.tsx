import { AdminNotificationCenter } from '@/features/admin/notifications/AdminNotificationCenter'
import { AdminHeader } from '@/features/admin/ui/AdminHeader'
import { AdminSection } from '@/features/admin/ui/AdminSection'

export const dynamic = 'force-dynamic'

export default function AdminNotificationsPage() {
  return (
    <div className="p-6 space-y-6">
      <AdminHeader title="🔔 Centro de Notificaciones" description="Gestiona tus notificaciones" />
      <AdminSection title="Bandeja">
        <AdminNotificationCenter />
      </AdminSection>
    </div>
  )
}
