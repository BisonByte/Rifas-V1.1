'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/badge'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { get } from '@/lib/api-client'
import { AdminHeader } from '@/features/admin/ui/AdminHeader'
import { AdminSection } from '@/features/admin/ui/AdminSection'
import { 
  Plus,
  Search,
  Filter,
  UserPlus,
  Edit,
  Trash2,
  Shield,
  User,
  Mail,
  Calendar,
  Eye
} from 'lucide-react'

// Modelo de UI para usuarios en esta página
interface UsuarioUI {
  id: string
  nombre: string
  email: string
  // Roles reales del backend
  rol: 'SUPER_ADMIN' | 'ADMIN' | 'VENDEDOR' | 'AUDITOR'
  estado: 'ACTIVO' | 'INACTIVO' | 'SUSPENDIDO'
  fechaCreacion: string
  ultimoAcceso: string
  permisos: string[]
}

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<UsuarioUI[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        const data = await get('/api/admin/usuarios', { cache: 'no-store' }) as any
        const list = (data?.success ? data.data : data) || []
        // Adaptar la respuesta del backend al modelo de UI y colocar valores por defecto seguros
        const adapted: UsuarioUI[] = list.map((u: any) => ({
          id: u.id,
          nombre: u.nombre,
          email: u.email,
          rol: (u.rol as UsuarioUI['rol']) ?? 'VENDEDOR',
          estado: u.activo === false ? 'INACTIVO' : 'ACTIVO',
          fechaCreacion: u.createdAt ?? new Date().toISOString(),
          ultimoAcceso: u.updatedAt ?? u.createdAt ?? new Date().toISOString(),
          permisos: Array.isArray(u.permisos) ? u.permisos : [],
        }))
        setUsuarios(adapted)
      } catch (err: any) {
        setError(err.message || 'Error desconocido')
      } finally {
        setLoading(false)
      }
    }

    fetchUsuarios()
  }, [])
  
  const [filtroRol, setFiltroRol] = useState<string>('TODOS')
  const [searchTerm, setSearchTerm] = useState('')

  const getRolBadge = (rol: UsuarioUI['rol']) => {
    switch (rol) {
      case 'SUPER_ADMIN':
        return <Badge className="bg-red-600 text-white flex items-center"><Shield className="h-3 w-3 mr-1" />Super Admin</Badge>
      case 'ADMIN':
        return <Badge className="bg-red-500 text-white flex items-center"><Shield className="h-3 w-3 mr-1" />Admin</Badge>
      case 'AUDITOR':
        return <Badge className="bg-blue-500 text-white flex items-center"><Shield className="h-3 w-3 mr-1" />Auditor</Badge>
      case 'VENDEDOR':
        return <Badge className="bg-green-600 text-white flex items-center"><User className="h-3 w-3 mr-1" />Vendedor</Badge>
      default:
        return <Badge className="bg-gray-500 text-white">{rol}</Badge>
    }
  }

  const getRolLabel = (rol: UsuarioUI['rol']) => {
    switch (rol) {
      case 'SUPER_ADMIN': return 'SUPER_ADMIN'
      case 'ADMIN': return 'ADMIN'
      case 'AUDITOR': return 'AUDITOR'
      case 'VENDEDOR': return 'VENDEDOR'
    }
  }

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'ACTIVO':
        return <Badge className="bg-green-500 text-white">Activo</Badge>
      case 'INACTIVO':
        return <Badge className="bg-gray-500 text-white">Inactivo</Badge>
      case 'SUSPENDIDO':
        return <Badge className="bg-red-500 text-white">Suspendido</Badge>
      default:
        return <Badge className="bg-gray-500 text-white">{estado}</Badge>
    }
  }

  const formatFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const usuariosFiltrados = usuarios.filter(usuario => {
    const matchRol = filtroRol === 'TODOS' || usuario.rol === (filtroRol as UsuarioUI['rol'])
    const matchBusqueda = searchTerm === '' || 
      usuario.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      usuario.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchRol && matchBusqueda
  })

  const contadorRoles: Record<string, number> = {
    TODOS: usuarios.length,
    SUPER_ADMIN: usuarios.filter(u => u.rol === 'SUPER_ADMIN').length,
    ADMIN: usuarios.filter(u => u.rol === 'ADMIN').length,
    AUDITOR: usuarios.filter(u => u.rol === 'AUDITOR').length,
    VENDEDOR: usuarios.filter(u => u.rol === 'VENDEDOR').length,
  }

  const contadorEstados = {
    ACTIVO: usuarios.filter(u => u.estado === 'ACTIVO').length,
    INACTIVO: usuarios.filter(u => u.estado === 'INACTIVO').length,
    SUSPENDIDO: usuarios.filter(u => u.estado === 'SUSPENDIDO').length
  }

  return (
    <div className="p-6 space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Header */}
      <AdminHeader
        title="👥 Gestión de Usuarios"
        description="Administra los usuarios del sistema"
        right={(
          <Button className="bg-teal-600 hover:bg-teal-700 text-white">
            <UserPlus className="h-4 w-4 mr-2" />
            Nuevo Usuario
          </Button>
        )}
      />

      {/* Estadísticas */}
      <AdminSection title="Resumen">
        {loading && usuarios.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 animate-pulse">
            {[1,2,3,4,5].map((i) => (
              <div key={i} className="bg-gray-800/60 border border-gray-700 rounded-lg p-4 h-20">
                <div className="h-5 w-24 bg-gray-700 rounded" />
                <div className="h-4 w-36 bg-gray-700 rounded mt-3" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-white">{usuarios.length}</p>
                    <p className="text-sm text-gray-400">Total Usuarios</p>
                  </div>
                  <User className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-red-500">{contadorRoles.ADMIN}</p>
                    <p className="text-sm text-gray-400">Admins</p>
                  </div>
                  <Shield className="h-8 w-8 text-red-500" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-green-500">{contadorEstados.ACTIVO}</p>
                    <p className="text-sm text-gray-400">Activos</p>
                  </div>
                  <User className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-gray-400">{contadorEstados.INACTIVO}</p>
                    <p className="text-sm text-gray-400">Inactivos</p>
                  </div>
                  <User className="h-8 w-8 text-gray-400" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-red-400">{contadorEstados.SUSPENDIDO}</p>
                    <p className="text-sm text-gray-400">Suspendidos</p>
                  </div>
                  <User className="h-8 w-8 text-red-400" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </AdminSection>

      {/* Filtros */}
      <AdminSection title="Búsqueda y filtros" subtitle="Filtra por rol o busca por nombre y correo">
        {loading && usuarios.length === 0 ? (
          <div className="flex flex-col sm:flex-row gap-4 items-center animate-pulse">
            <div className="h-10 bg-gray-700 rounded-lg w-full" />
            <div className="h-10 bg-gray-700 rounded-lg w-64" />
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nombre o email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div className="flex gap-2 w-full sm:w-auto flex-wrap">
              {Object.keys(contadorRoles).map((rol) => (
                <Button
                  key={rol}
                  variant={filtroRol === rol ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFiltroRol(rol)}
                  className={filtroRol === rol ? 'bg-teal-600 text-white' : 'border-gray-600 text-gray-300 hover:bg-gray-700'}
                >
                  {rol === 'TODOS' ? 'TODOS' : getRolLabel(rol as UsuarioUI['rol'])} ({contadorRoles[rol as keyof typeof contadorRoles]})
                </Button>
              ))}
            </div>
          </div>
        )}
      </AdminSection>

      {/* Lista de usuarios */}
      <AdminSection title="Lista de usuarios" subtitle={usuariosFiltrados.length > 0 ? `Mostrando ${usuariosFiltrados.length} resultados` : undefined}>
        {loading && usuarios.length === 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-pulse">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-800/60 border border-gray-700 rounded-lg h-44" />
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {usuariosFiltrados.map((usuario) => (
                <Card key={usuario.id} className="bg-gray-800 border-gray-700">
                  <CardHeader className="border-b border-gray-700">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-teal-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold">
                            {usuario.nombre.split(' ').map(n => n[0]).join('').substring(0, 2)}
                          </span>
                        </div>
                        <div>
                          <CardTitle className="text-white text-lg">{usuario.nombre}</CardTitle>
                          <p className="text-gray-400 text-sm flex items-center">
                            <Mail className="h-3 w-3 mr-1" />
                            {usuario.email}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col gap-1">
                        {getRolBadge(usuario.rol)}
                        {getEstadoBadge(usuario.estado)}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 space-y-4">
                    {/* Información adicional */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-400">Creado:</span>
                        <p className="text-white">{formatFecha(usuario.fechaCreacion)}</p>
                      </div>
                      <div>
                        <span className="text-gray-400">Último acceso:</span>
                        <p className="text-white">{formatFecha(usuario.ultimoAcceso)}</p>
                      </div>
                    </div>

                    {/* Permisos */}
                    <div>
                      <span className="text-gray-400 text-sm">Permisos:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {(usuario.permisos ?? []).slice(0, 3).map((permiso, index) => (
                          <Badge key={index} variant="outline" className="border-gray-600 text-gray-300 text-xs">
                            {permiso === 'all' ? 'Todos' : permiso.replace('_', ' ')}
                          </Badge>
                        ))}
                        {(usuario.permisos ?? []).length > 3 && (
                          <Badge variant="outline" className="border-gray-600 text-gray-300 text-xs">
                            +{(usuario.permisos ?? []).length - 3} más
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Acciones */}
                    <div className="flex gap-2 pt-2">
                      <Button size="sm" variant="outline" className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700">
                        <Eye className="h-4 w-4 mr-2" />
                        Ver
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700">
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                      </Button>
                      <Button size="sm" variant="outline" className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Estado vacío */}
            {!loading && usuariosFiltrados.length === 0 && (
              <Card className="bg-gray-800 border-gray-700 mt-4">
                <CardContent className="p-12 text-center">
                  <User className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-white mb-2">No hay usuarios</h3>
                  <p className="text-gray-400">No se encontraron usuarios que coincidan con los filtros seleccionados</p>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </AdminSection>
    </div>
  )
}
