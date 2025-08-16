'use client'

// Disable static generation due to dynamic content
export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  TrendingUp, 
  Users, 
  CreditCard, 
  Clock, 
  AlertCircle,
  CheckCircle,
  XCircle,
  Eye,
  LogOut,
  User,
  RefreshCw
} from 'lucide-react'

// Interfaces
interface AuthUser {
  id: string
  nombre: string
  email: string
  rol: string
}

interface DashboardStats {
  totalRifas: number
  rifasActivas: number
  totalParticipantes: number
  totalTicketsVendidos: number
  ingresosTotales: number
  pagosPendientes: number
  ticketsPendientesVerificacion: number
  ventasUltimas24h: { cantidad: number; monto: number }
  ventasUltimos7d: { cantidad: number; monto: number }
}

interface TopRifa {
  id: string
  nombre: string
  ticketsVendidos: number
  porcentajeVendido: number
  ingresos: number
  fechaSorteo: string
}

interface ProximoSorteo {
  id: string
  nombre: string
  fechaSorteo: string
  ticketsVendidos: number
  porcentajeVendido: number
  diasRestantes: number
}

interface PagoPendiente {
  id: string
  participante: { nombre: string; celular: string }
  rifa: { nombre: string }
  monto: number
  fechaCreacion: string
  numerosTickets: number[]
}

export default function AdminDashboard() {
  const router = useRouter()
  
  // Estados
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [topRifas, setTopRifas] = useState<TopRifa[]>([])
  const [proximosSorteos, setProximosSorteos] = useState<ProximoSorteo[]>([])
  const [pagosPendientes, setPagosPendientes] = useState<PagoPendiente[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Función para verificar autenticación
  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me')
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setCurrentUser(data.user)
          return true
        }
      }
      return false
    } catch (error) {
      console.error('Error verificando autenticación:', error)
      return false
    }
  }

  // Función para logout
  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/admin/login')
    } catch (error) {
      console.error('Error en logout:', error)
    }
  }

  const cargarDashboard = async () => {
    try {
      setRefreshing(true)
      const [dashboardRes, pagosRes] = await Promise.all([
        fetch('/api/admin/dashboard'),
        fetch('/api/admin/verificar-pagos?estado=EN_VERIFICACION&limit=5')
      ])

      if (!dashboardRes.ok || !pagosRes.ok) {
        throw new Error('Error al cargar datos del dashboard')
      }

      const dashboardData = await dashboardRes.json()
      const pagosData = await pagosRes.json()

      if (dashboardData.success) {
        setStats(dashboardData.data.estadisticas)
        setTopRifas(dashboardData.data.topRifas || [])
        setProximosSorteos(dashboardData.data.proximosSorteos || [])
      }

      if (pagosData.success) {
        setPagosPendientes(pagosData.data || [])
      }

      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
      console.error('Error cargando dashboard:', err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const aprobarPago = async (compraId: string) => {
    if (!currentUser) return
    
    try {
      const response = await fetch('/api/admin/verificar-pagos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          compraId,
          accion: 'APROBAR',
          adminId: currentUser.id,
          comentarios: 'Aprobado desde dashboard'
        })
      })

      if (!response.ok) throw new Error('Error al aprobar pago')
      
      await cargarDashboard() // Recargar datos
    } catch (err) {
      console.error('Error aprobando pago:', err)
      alert('Error al aprobar el pago')
    }
  }

  const rechazarPago = async (compraId: string) => {
    if (!currentUser) return
    
    const razon = prompt('Motivo del rechazo:')
    if (!razon) return

    try {
      const response = await fetch('/api/admin/verificar-pagos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          compraId,
          accion: 'RECHAZAR',
          adminId: currentUser.id,
          comentarios: razon
        })
      })

      if (!response.ok) throw new Error('Error al rechazar pago')
      
      await cargarDashboard() // Recargar datos
    } catch (err) {
      console.error('Error rechazando pago:', err)
      alert('Error al rechazar el pago')
    }
  }

  useEffect(() => {
    const initDashboard = async () => {
      const isAuthenticated = await checkAuth()
      if (isAuthenticated) {
        await cargarDashboard()
      } else {
        router.push('/admin/login')
      }
    }
    
    initDashboard()
  }, [router])

  if (loading && !stats) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin" />
          <span className="ml-2">Cargando dashboard...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={cargarDashboard} className="mt-4">
          Reintentar
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Panel de Administración</h1>
          <p className="text-muted-foreground">Sistema de Rifas</p>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Info del usuario actual */}
          {currentUser && (
            <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
              <User className="h-4 w-4" />
              <span>{currentUser.nombre}</span>
              <Badge variant="outline">{currentUser.rol}</Badge>
            </div>
          )}
          
          {/* Botones */}
          <div className="flex items-center gap-2">
            <Button onClick={cargarDashboard} disabled={refreshing} variant="outline" size="sm">
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Actualizar
            </Button>
            
            <Button onClick={handleLogout} variant="ghost" size="sm">
              <LogOut className="h-4 w-4 mr-2" />
              Salir
            </Button>
          </div>
        </div>
      </div>

      {/* Estadísticas principales */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rifas Activas</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.rifasActivas}</div>
              <p className="text-xs text-muted-foreground">
                {stats.totalRifas} total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Participantes</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalParticipantes}</div>
              <p className="text-xs text-muted-foreground">
                {stats.totalTicketsVendidos} tickets vendidos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${stats.ingresosTotales.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                +${stats.ventasUltimas24h.monto.toLocaleString()} hoy
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pagos Pendientes</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {stats.pagosPendientes}
              </div>
              <p className="text-xs text-muted-foreground">
                Requieren atención
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="payments">
            Pagos 
            {pagosPendientes.length > 0 && (
              <Badge variant="destructive" className="ml-2 text-xs">
                {pagosPendientes.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="raffles">Rifas</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Rifas */}
            <Card>
              <CardHeader>
                <CardTitle>Top Rifas por Ventas</CardTitle>
                <CardDescription>Rifas con más tickets vendidos</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topRifas.map((rifa) => (
                    <div key={rifa.id} className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-medium">{rifa.nombre}</p>
                        <p className="text-sm text-muted-foreground">
                          {rifa.ticketsVendidos} tickets • {rifa.porcentajeVendido}%
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${rifa.ingresos.toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                  {topRifas.length === 0 && (
                    <p className="text-center text-muted-foreground">No hay rifas activas</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Próximos Sorteos */}
            <Card>
              <CardHeader>
                <CardTitle>Próximos Sorteos</CardTitle>
                <CardDescription>Sorteos programados próximamente</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {proximosSorteos.map((sorteo) => (
                    <div key={sorteo.id} className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-medium">{sorteo.nombre}</p>
                        <p className="text-sm text-muted-foreground">
                          {sorteo.ticketsVendidos} tickets • {sorteo.porcentajeVendido}%
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge variant={sorteo.diasRestantes <= 3 ? 'destructive' : 'secondary'}>
                          {sorteo.diasRestantes} días
                        </Badge>
                      </div>
                    </div>
                  ))}
                  {proximosSorteos.length === 0 && (
                    <p className="text-center text-muted-foreground">No hay sorteos programados</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pagos Pendientes de Verificación</CardTitle>
              <CardDescription>Pagos que requieren aprobación manual</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pagosPendientes.map((pago) => (
                  <div key={pago.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-medium">{pago.rifa.nombre}</h4>
                        <p className="text-sm text-muted-foreground">
                          {pago.participante.nombre} • {pago.participante.celular}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">${pago.monto.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(pago.fechaCreacion).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm">
                          Tickets: {pago.numerosTickets.join(', ')}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => alert('Ver detalles - TODO')}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Ver
                        </Button>
                        <Button 
                          size="sm" 
                          variant="default" 
                          onClick={() => aprobarPago(pago.id)}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Aprobar
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => rechazarPago(pago.id)}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Rechazar
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                {pagosPendientes.length === 0 && (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <p className="text-muted-foreground">No hay pagos pendientes de verificación</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="raffles" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Gestión de Rifas</CardTitle>
              <CardDescription>Crear, editar y gestionar rifas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">Funcionalidad en desarrollo</p>
                <Button variant="outline" disabled>
                  Crear Nueva Rifa
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
