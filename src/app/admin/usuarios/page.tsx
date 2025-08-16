'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/badge'
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

interface Usuario {
  id: string
  nombre: string
  email: string
  rol: 'ADMIN' | 'MODERADOR' | 'OPERADOR'
  estado: 'ACTIVO' | 'INACTIVO' | 'SUSPENDIDO'
  fechaCreacion: string
  ultimoAcceso: string
  permisos: string[]
}

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([
    {
      id: '1',
      nombre: 'Desarrollo Pruebas',
      email: 'admin@sistema-rifas.com',
      rol: 'ADMIN',
      estado: 'ACTIVO',
      fechaCreacion: '2025-01-01T00:00:00Z',
      ultimoAcceso: '2025-08-16T09:30:00Z',
      permisos: ['all']
    },
    {
      id: '2',
      nombre: 'Juan Moderador',
      email: 'juan.mod@sistema-rifas.com',
      rol: 'MODERADOR',
      estado: 'ACTIVO',
      fechaCreacion: '2025-02-15T10:30:00Z',
      ultimoAcceso: '2025-08-15T16:45:00Z',
      permisos: ['verify_payments', 'manage_events', 'view_reports']
    },
    {
      id: '3',
      nombre: 'Maria Operador',
      email: 'maria.op@sistema-rifas.com',
      rol: 'OPERADOR',
      estado: 'INACTIVO',
      fechaCreacion: '2025-03-10T14:20:00Z',
      ultimoAcceso: '2025-08-10T12:15:00Z',
      permisos: ['verify_payments', 'view_participants']
    }
  ])
  
  const [filtroRol, setFiltroRol] = useState<string>('TODOS')
  const [searchTerm, setSearchTerm] = useState('')

  const getRolBadge = (rol: string) => {
    switch (rol) {
      case 'ADMIN':
        return <Badge className="bg-red-500 text-white flex items-center"><Shield className="h-3 w-3 mr-1" />Admin</Badge>
      case 'MODERADOR':
        return <Badge className="bg-blue-500 text-white flex items-center"><Shield className="h-3 w-3 mr-1" />Moderador</Badge>
      case 'OPERADOR':
        return <Badge className="bg-green-500 text-white flex items-center"><User className="h-3 w-3 mr-1" />Operador</Badge>
      default:
        return <Badge className="bg-gray-500 text-white">{rol}</Badge>
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
    const matchRol = filtroRol === 'TODOS' || usuario.rol === filtroRol
    const matchBusqueda = searchTerm === '' || 
      usuario.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      usuario.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchRol && matchBusqueda
  })

  const contadorRoles = {
    TODOS: usuarios.length,
    ADMIN: usuarios.filter(u => u.rol === 'ADMIN').length,
    MODERADOR: usuarios.filter(u => u.rol === 'MODERADOR').length,
    OPERADOR: usuarios.filter(u => u.rol === 'OPERADOR').length
  }

  const contadorEstados = {
    ACTIVO: usuarios.filter(u => u.estado === 'ACTIVO').length,
    INACTIVO: usuarios.filter(u => u.estado === 'INACTIVO').length,
    SUSPENDIDO: usuarios.filter(u => u.estado === 'SUSPENDIDO').length
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Gestión de Usuarios</h1>
          <p className="text-gray-400 mt-1">Administra los usuarios del sistema</p>
        </div>
        <Button className="bg-teal-600 hover:bg-teal-700 text-white">
          <UserPlus className="h-4 w-4 mr-2" />
          Nuevo Usuario
        </Button>
      </div>

      {/* Estadísticas */}
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

      {/* Filtros */}
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nombre o email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div className="flex gap-2">
              {Object.keys(contadorRoles).map((rol) => (
                <Button
                  key={rol}
                  variant={filtroRol === rol ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFiltroRol(rol)}
                  className={filtroRol === rol ? "bg-teal-600 text-white" : "border-gray-600 text-gray-300 hover:bg-gray-700"}
                >
                  {rol} ({contadorRoles[rol as keyof typeof contadorRoles]})
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de usuarios */}
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
                  {usuario.permisos.slice(0, 3).map((permiso, index) => (
                    <Badge key={index} variant="outline" className="border-gray-600 text-gray-300 text-xs">
                      {permiso === 'all' ? 'Todos' : permiso.replace('_', ' ')}
                    </Badge>
                  ))}
                  {usuario.permisos.length > 3 && (
                    <Badge variant="outline" className="border-gray-600 text-gray-300 text-xs">
                      +{usuario.permisos.length - 3} más
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
      {usuariosFiltrados.length === 0 && (
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-12 text-center">
            <User className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-white mb-2">No hay usuarios</h3>
            <p className="text-gray-400">No se encontraron usuarios que coincidan con los filtros seleccionados</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
