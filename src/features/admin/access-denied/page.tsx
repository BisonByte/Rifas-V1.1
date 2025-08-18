'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ShieldX, Home, ArrowLeft } from 'lucide-react'

export default function AccessDenied() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-100 px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center w-16 h-16 mx-auto bg-red-600 rounded-full mb-4">
            <ShieldX className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Acceso Denegado
          </h1>
          <p className="text-gray-600">
            No tienes permisos para acceder a esta sección
          </p>
        </div>

        {/* Card de información */}
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Permisos Insuficientes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700">
              Esta área está restringida solo para administradores autorizados. 
              Si crees que esto es un error, contacta con el administrador del sistema.
            </p>

            <div className="flex flex-col space-y-2">
              <Link href="/admin/login">
                <Button variant="default" className="w-full flex items-center justify-center">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Volver al Login
                </Button>
              </Link>
              
              <Link href="/">
                <Button variant="outline" className="w-full flex items-center justify-center">
                  <Home className="w-4 h-4 mr-2" />
                  Ir al Inicio
                </Button>
              </Link>
            </div>

            <div className="text-center mt-6">
              <p className="text-xs text-gray-500">
                Sistema de Rifas - Panel Administrativo
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
