'use client'

import { useState, useEffect } from 'react'
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
  Menu,
  Bell,
  Settings,
  Zap,
  Plus
} from 'lucide-react'

export default function AdminLayoutClient({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const pathname = usePathname()

  // Efecto de fade-in al cargar
  useEffect(() => {
    document.body.style.opacity = '0'
    document.body.style.transform = 'translateY(20px)'
    setTimeout(() => {
      document.body.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
      document.body.style.opacity = '1'
      document.body.style.transform = 'translateY(0)'
    }, 100)
    
    return () => {
      document.body.style.transition = ''
      document.body.style.transform = ''
      document.body.style.opacity = ''
    }
  }, [])

  const menuItems = [
    { icon: Home, label: 'Dashboard', href: '/admin', gradient: 'from-blue-500 to-purple-600' },
    { icon: Calendar, label: 'Eventos', href: '/admin/eventos', gradient: 'from-green-500 to-teal-600' },
    { icon: CreditCard, label: 'Pagos', href: '/admin/pagos', gradient: 'from-yellow-500 to-orange-600' },
    { icon: Ticket, label: 'Tickets', href: '/admin/tickets', gradient: 'from-pink-500 to-rose-600' },
    { icon: Users, label: 'Participantes', href: '/admin/participantes', gradient: 'from-indigo-500 to-blue-600' },
    { icon: Wallet, label: 'Métodos de Pago', href: '/admin/metodos-pago', gradient: 'from-purple-500 to-pink-600' },
    { icon: User, label: 'Usuarios', href: '/admin/usuarios', gradient: 'from-teal-500 to-cyan-600' },
    { icon: Settings, label: 'Configuración', href: '/admin/configuracion', gradient: 'from-slate-500 to-gray-600' },
    { icon: Bell, label: 'Redes Sociales', href: '/admin/redes-sociales', gradient: 'from-cyan-500 to-blue-600' },
  ]

  const isActive = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin'
    }
    return pathname.startsWith(href)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex relative overflow-hidden">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -inset-10 opacity-50">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
          <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
        </div>
      </div>

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-72 bg-gradient-to-b from-slate-800/95 via-slate-900/95 to-black/95 backdrop-blur-xl transform transition-all duration-500 ease-in-out lg:translate-x-0 lg:static lg:inset-0 border-r border-slate-700/50 ${sidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}`}>
        {/* Logo Header */}
        <div className="flex items-center justify-center h-20 bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 relative overflow-hidden">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="flex items-center relative z-10">
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 rounded-xl flex items-center justify-center mr-3 shadow-xl transform hover:scale-110 transition-transform duration-300">
              <Zap className="text-white text-lg font-bold w-6 h-6" />
            </div>
            <div>
              <h1 className="text-white text-xl font-bold tracking-tight">RifaSystem</h1>
              <p className="text-blue-100 text-xs">Panel Admin</p>
            </div>
          </div>
        </div>
        
        {/* Navigation Menu */}
        <nav className="mt-8 px-4">
          <div className="space-y-2">
            {menuItems.map((item, index) => {
              const Icon = item.icon
              const active = isActive(item.href)
              return (
                <Link
                  key={index}
                  href={item.href}
                  className={`group flex items-center px-4 py-3.5 rounded-xl text-slate-300 hover:text-white transition-all duration-300 transform hover:scale-105 hover:translate-x-2 relative overflow-hidden ${
                    active ? 'text-white shadow-lg' : 'hover:bg-slate-800/50'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  {active && (
                    <div className={`absolute inset-0 bg-gradient-to-r ${item.gradient} rounded-xl opacity-90`}></div>
                  )}
                  <div className="relative z-10 flex items-center w-full">
                    <div className={`p-2 rounded-lg mr-3 transition-all duration-300 ${active ? 'bg-white/20 shadow-lg' : 'group-hover:bg-slate-700/50'}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="font-medium">{item.label}</span>
                    {active && (
                      <div className="ml-auto w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    )}
                  </div>
                </Link>
              )
            })}
          </div>
        </nav>

        {/* Bottom section */}
        <div className="absolute bottom-8 left-4 right-4">
          <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-xl p-4 border border-slate-600/30 backdrop-blur-sm">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-white text-sm font-medium">Admin</p>
                <p className="text-slate-400 text-xs">Sistema Rifas</p>
              </div>
              <button className="text-slate-400 hover:text-white transition-colors duration-200">
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0 relative">
        {/* Top Header */}
        <header className="bg-slate-800/80 backdrop-blur-xl shadow-xl border-b border-slate-700/50 relative z-10">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-teal-600/10"></div>
          {/* Align header content with page container */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between relative z-10">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="text-slate-400 hover:text-white lg:hidden p-2 rounded-lg hover:bg-slate-700/50 transition-all duration-200 transform hover:scale-110"
              >
                <Menu className="h-6 w-6" />
              </button>
              <div className="hidden lg:flex items-center space-x-3">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-teal-400 bg-clip-text text-transparent">
                  Dashboard Administrativo
                </h1>
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></div>
              </div>
            </div>
            
            {/* Action Bar */}
            <div className="flex items-center space-x-3">
              {/* Notifications */}
              <div className="relative">
                <button 
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className="relative p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700/50 transition-all duration-200 transform hover:scale-110"
                >
                  <Bell className="w-5 h-5" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                </button>
              </div>
              
              {/* User Profile */}
              <div className="flex items-center space-x-3 bg-slate-700/30 rounded-xl px-3 py-2 hover:bg-slate-700/50 transition-all duration-200 cursor-pointer group">
                <div className="relative">
                  <div className="w-9 h-9 bg-gradient-to-br from-teal-400 via-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-white text-sm font-bold">A</span>
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-slate-800"></div>
                </div>
                <div className="hidden sm:block">
                  <p className="text-white text-sm font-medium">Admin Principal</p>
                  <p className="text-slate-400 text-xs">Sistema activo</p>
                </div>
                <ChevronDown className="h-4 w-4 text-slate-400 group-hover:text-white transition-colors duration-200 group-hover:rotate-180 transform transition-transform duration-200" />
              </div>

              {/* Quick Action Button */}
              <button className="bg-gradient-to-r from-blue-500 via-purple-500 to-teal-500 text-white px-4 py-2 rounded-lg hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-200 transform hover:scale-105 font-medium text-sm">
                <Plus className="w-4 h-4 inline mr-1" />
                Nuevo
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-transparent relative">
          <div className="min-h-full bg-gradient-to-br from-slate-900/50 via-transparent to-slate-900/30 backdrop-blur-sm">
            {/* Global responsive container for all admin pages */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
              {children}
            </div>
          </div>
        </main>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </div>
  )
}
