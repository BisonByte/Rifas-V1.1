'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { AlertCircle, Shield, Eye, EyeOff } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface LoginForm {
  email: string
  password: string
  rememberMe: boolean
}

interface LoginResponse {
  success: boolean
  user?: {
    id: string
    nombre: string
    email: string
    rol: string
  }
  message?: string
  error?: string
  details?: any
}

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect') || '/admin'

  const [formData, setFormData] = useState<LoginForm>({
    email: '',
    password: '',
    rememberMe: false
  })

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  // Verificar si ya está autenticado
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await fetch('/api/auth/me')
        if (response.ok) {
          const data = await response.json()
          if (data.success && ['ADMIN', 'SUPER_ADMIN'].includes(data.user.rol)) {
            router.push(redirectTo)
          }
        }
      } catch (error) {
        // Usuario no autenticado - continuar en login
      }
    }
    
    checkAuthStatus()
  }, [router, redirectTo])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    if (error) setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data: LoginResponse = await response.json()

      if (data.success) {
        // Verificar que el usuario sea administrador
        if (!['ADMIN', 'SUPER_ADMIN'].includes(data.user?.rol || '')) {
          setError('Acceso denegado. Solo administradores pueden acceder.')
          return
        }

        // Login exitoso - redirigir
        router.push(redirectTo)
        router.refresh() // Refresh para actualizar el estado de autenticación
      } else {
        setError(data.error || 'Error en el login')
      }
    } catch (error) {
      console.error('Error en login:', error)
      setError('Error de conexión. Inténtalo nuevamente.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 px-4 relative overflow-hidden">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -inset-10 opacity-30">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
          <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
        </div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in-up">
          <div className="relative">
            <div className="flex items-center justify-center w-20 h-20 mx-auto bg-gradient-to-br from-blue-500 via-purple-500 to-teal-500 rounded-2xl mb-6 shadow-2xl animate-float">
              <Shield className="w-10 h-10 text-white" />
            </div>
            <div className="absolute inset-0 w-20 h-20 mx-auto bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl animate-ping opacity-20"></div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent mb-3">
            Sistema de Rifas
          </h1>
          <p className="text-slate-400 text-lg">
            Panel de Administración Avanzado
          </p>
        </div>

        {/* Formulario de Login */}
        <Card className="bg-slate-800/80 border-slate-700/50 backdrop-blur-xl shadow-2xl animate-slide-in">
          <CardHeader className="text-center pb-8">
            <CardTitle className="text-2xl text-white">Acceso Administrativo</CardTitle>
            <CardDescription className="text-slate-400 text-base">
              Ingresa tus credenciales para continuar
            </CardDescription>
          </CardHeader>
          <CardContent className="px-8 pb-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Error Alert */}
              {error && (
                <Alert className="bg-red-500/20 border-red-500/30 text-red-300">
                  <AlertCircle className="h-4 w-4 text-red-400" />
                  <AlertDescription className="text-red-300">{error}</AlertDescription>
                </Alert>
              )}

              {/* Email */}
              <div className="space-y-3">
                <label htmlFor="email" className="text-sm font-medium text-slate-300">
                  Correo Electrónico
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all duration-200 backdrop-blur-sm"
                  placeholder="admin@rifas.com"
                  disabled={isLoading}
                />
              </div>

              {/* Contraseña */}
              <div className="space-y-3">
                <label htmlFor="password" className="text-sm font-medium text-slate-300">
                  Contraseña
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 pr-12 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all duration-200 backdrop-blur-sm"
                    placeholder="••••••••"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-300 transition-colors duration-200"
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="rememberMe"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  className="h-4 w-4 border-slate-600 rounded bg-slate-700/50 text-purple-500 focus:ring-purple-500/50"
                />
                <label htmlFor="rememberMe" className="text-sm text-slate-300">
                  Mantener sesión activa
                </label>
              </div>

              {/* Botón Submit */}
              <Button
                type="submit"
                className="w-full py-3 text-base font-medium bg-gradient-to-r from-blue-500 via-purple-500 to-teal-500 hover:from-blue-600 hover:via-purple-600 hover:to-teal-600 transform hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-purple-500/25"
                disabled={isLoading || !formData.email || !formData.password}
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    Verificando credenciales...
                  </>
                ) : (
                  <>
                    <Shield className="w-5 h-5 mr-2" />
                    Acceder al Sistema
                  </>
                )}
              </Button>
            </form>

            {/* Footer Info */}
            <div className="mt-8 text-center">
              <div className="flex items-center justify-center space-x-2 text-slate-400">
                <Shield className="w-4 h-4" />
                <p className="text-sm">
                  Sistema protegido con autenticación avanzada
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Demo Credentials (solo para desarrollo) */}
        {process.env.NODE_ENV === 'development' && (
          <Card className="mt-8 bg-yellow-500/10 border-yellow-500/20 backdrop-blur-xl">
            <CardContent className="pt-6">
              <div className="text-center text-sm text-yellow-300">
                <p className="font-medium mb-3 flex items-center justify-center">
                  <span className="mr-2">�</span> Credenciales de Prueba
                </p>
                <div className="space-y-2 text-xs bg-yellow-500/10 p-4 rounded-lg">
                  <div className="flex justify-between">
                    <strong>Email:</strong> 
                    <code className="bg-yellow-500/20 px-2 py-1 rounded">admin@rifas.com</code>
                  </div>
                  <div className="flex justify-between">
                    <strong>Password:</strong> 
                    <code className="bg-yellow-500/20 px-2 py-1 rounded">admin123</code>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default function AdminLogin() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  )
}
