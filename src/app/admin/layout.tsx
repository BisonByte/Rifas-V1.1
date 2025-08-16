import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Admin - Sistema de Rifas',
  description: 'Panel de administración del sistema de rifas',
  robots: 'noindex, nofollow', // No indexar páginas de admin
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* TODO: Añadir autenticación y navegación de admin */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold text-gray-900">
              Sistema de Rifas - Admin
            </h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">Admin User</span>
              {/* TODO: Botón de logout */}
            </div>
          </div>
        </div>
      </div>
      <main>{children}</main>
    </div>
  )
}
