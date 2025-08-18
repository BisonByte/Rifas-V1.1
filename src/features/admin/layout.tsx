import { ReactNode } from 'react'
import AdminLayoutClient from './AdminLayoutClient'

export default async function AdminLayout({ children }: { children: ReactNode }) {
  // La autenticación y autorización se maneja en el middleware
  // No necesitamos verificar aquí para evitar duplicación
  return <AdminLayoutClient>{children}</AdminLayoutClient>
}
