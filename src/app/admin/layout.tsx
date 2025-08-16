'use client'

import type { Metadata } from 'next'
import { useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { 
  Home, 
  Calendar, 
  CreditCard, 
  Ticket, 
  Users, 
  Wallet, 
  User,
  ChevronDown,
  Menu
} from 'lucide-react'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()

  const menuItems = [
    { icon: Home, label: 'Inicio', href: '/admin' },
    { icon: Calendar, label: 'Eventos', href: '/admin/eventos' },
    { icon: CreditCard, label: 'Pagos', href: '/admin/pagos' },
    { icon: Ticket, label: 'Tickets', href: '/admin/tickets' },
    { icon: Users, label: 'Participantes', href: '/admin/participantes' },
    { icon: Wallet, label: 'Métodos de Pago', href: '/admin/metodos-pago' },
    { icon: User, label: 'Usuarios', href: '/admin/usuarios' },
  ]

  const isActive = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin'
    }
    return pathname.startsWith(href)
  }

  return (
    <div className="min-h-screen bg-gray-900 flex">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-800 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-center h-16 bg-gray-900">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center mr-2">
              <span className="text-white text-lg font-bold">🎯</span>
            </div>
          </div>
        </div>
        
        <nav className="mt-8">
          {menuItems.map((item, index) => {
            const Icon = item.icon
            const active = isActive(item.href)
            return (
              <Link
                key={index}
                href={item.href}
                className={`flex items-center px-6 py-3 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors duration-200 ${
                  active ? 'bg-teal-600 text-white border-r-2 border-teal-400' : ''
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon className="h-5 w-5 mr-3" />
                {item.label}
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        {/* Top Header */}
        <header className="bg-gray-800 shadow-lg">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="text-gray-400 hover:text-gray-200 lg:hidden"
              >
                <Menu className="h-6 w-6" />
              </button>
              <h1 className="text-2xl font-semibold text-white ml-4 lg:ml-0">Dashboard</h1>
            </div>
            
            {/* User Profile */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-white">
                <div className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">D</span>
                </div>
                <span className="text-sm">Desarrollo Pruebas</span>
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-900">
          {children}
        </main>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </div>
  )
}
