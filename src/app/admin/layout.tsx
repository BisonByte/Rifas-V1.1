import { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import { getAuthUser } from '@/lib/auth'
import AdminLayoutClient from './AdminLayoutClient'

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const user = await getAuthUser()
  if (!user) {
    redirect('/admin/login')
  }
  if (user.rol !== 'ADMIN' && user.rol !== 'SUPER_ADMIN') {
    redirect('/admin/access-denied')
  }
  return <AdminLayoutClient>{children}</AdminLayoutClient>
}
