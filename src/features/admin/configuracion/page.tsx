'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { formatCurrencyFlexible } from '@/lib/utils'
import { get, put, post } from '@/lib/api-client'

interface ConfiguracionSitio {
  id: string
  clave: string
  valor: string
}

export default function ConfiguracionPage() {
  const [config, setConfig] = useState<ConfiguracionSitio[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editedConfig, setEditedConfig] = useState<Record<string, string>>({})

  useEffect(() => {
    cargarConfiguracion()
  }, [])

  const cargarConfiguracion = async () => {
    try {
      const json = await get('/api/admin/configuracion')
      const payload = (json as any)?.success ? (json as any).data : json

      if (Array.isArray(payload)) {
        setConfig(payload as any)
        const obj: Record<string, string> = {}
        ;(payload as any[]).forEach((item: any) => {
          obj[item.clave] = item.valor
        })
        setEditedConfig(obj)
      } else if (payload && typeof payload === 'object') {
        // API devuelve objeto plano { clave: valor }
        setConfig(
          Object.entries(payload).map(([clave, valor]) => ({
            id: clave,
            clave,
            valor: String(valor)
          }))
        )
        setEditedConfig(payload)
      }
    } catch (error) {
      console.error('Error cargando configuración:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (clave: string, valor: string) => {
    setEditedConfig(prev => ({ ...prev, [clave]: valor }))
  }

  const guardarConfiguracion = async () => {
    setSaving(true)
    try {
      await put('/api/admin/configuracion', { configuraciones: editedConfig })

      alert('Configuración guardada exitosamente')
      cargarConfiguracion()
    } catch (error) {
      console.error('Error guardando configuración:', error)
      alert('Error guardando configuración')
    } finally {
      setSaving(false)
    }
  }

  const subirLogo = async (file: File) => {
    try {
      const fd = new FormData()
      fd.append('file', file)
      const json = await post('/api/upload', fd)
      const res = json as any
      if (res?.success && res?.url) {
        handleChange('logo_url', res.url)
        alert('Logo subido correctamente')
      } else {
        alert((res && res.error) || 'No se pudo subir el logo')
      }
    } catch (e) {
      console.error(e)
      alert('Error subiendo el logo')
    }
  }

  if (loading) return <LoadingSpinner />

  const configuracionesGenerales = [
    { clave: 'titulo', nombre: 'Título del sitio', tipo: 'text' },
    { clave: 'subtitulo', nombre: 'Subtítulo', tipo: 'text' },
    { clave: 'descripcion_sitio', nombre: 'Descripción del sitio', tipo: 'textarea' },
    { clave: 'logo_url', nombre: 'URL del logo', tipo: 'text' },
    { clave: 'fondo_video_url', nombre: 'URL del video de fondo', tipo: 'text' },
    { clave: 'color_principal', nombre: 'Color principal (hex)', tipo: 'color' },
    { clave: 'color_secundario', nombre: 'Color secundario (hex)', tipo: 'color' },
  ]

  const configuracionesContacto = [
    { clave: 'telefono_soporte', nombre: 'Teléfono de soporte', tipo: 'text' },
    { clave: 'email_soporte', nombre: 'Email de soporte', tipo: 'email' },
    { clave: 'direccion', nombre: 'Dirección', tipo: 'text' },
    { clave: 'whatsapp_numero', nombre: 'WhatsApp (solo números, con código de país)', tipo: 'text' },
    { clave: 'whatsapp_texto', nombre: 'Texto predefinido para WhatsApp', tipo: 'text' },
  ]

  const configuracionesAyuda = [
    { clave: 'ayuda_video_url', nombre: 'URL Video de ayuda (YouTube o MP4)', tipo: 'text' },
    { clave: 'ayuda_texto_html', nombre: 'Contenido HTML alternativo de ayuda', tipo: 'textarea' },
  ]

  const configuracionesTerminos = [
    { clave: 'terminos_condiciones', nombre: 'Términos y condiciones', tipo: 'textarea' },
    { clave: 'politica_privacidad', nombre: 'Política de privacidad', tipo: 'textarea' },
    { clave: 'edad_minima', nombre: 'Edad mínima para participar', tipo: 'number' },
  ]

  const configuracionesMoneda: Array<{ clave: string; nombre: string; tipo: string; options?: { value: string; label: string }[] }> = [
    { clave: 'currency_code', nombre: 'Código ISO (ej: VES, USD)', tipo: 'text' },
    { clave: 'currency_symbol', nombre: 'Símbolo (ej: BsS, $)', tipo: 'text' },
    { clave: 'currency_locale', nombre: 'Locale (ej: es-VE, es-ES)', tipo: 'text' },
    { clave: 'currency_position', nombre: 'Posición del símbolo', tipo: 'select', options: [
      { value: 'prefix', label: 'Prefijo (símbolo antes)' },
      { value: 'suffix', label: 'Sufijo (símbolo después)' },
    ] },
  ]

  const configuracionesIntegraciones = [
    { clave: 'PAYPAL_CLIENT_ID', nombre: 'PayPal Client ID', tipo: 'text' },
    { clave: 'PAYPAL_CLIENT_SECRET', nombre: 'PayPal Client Secret', tipo: 'password' },
    { clave: 'SMTP_HOST', nombre: 'SMTP Host', tipo: 'text' },
    { clave: 'SMTP_PORT', nombre: 'SMTP Port', tipo: 'number' },
    { clave: 'SMTP_USER', nombre: 'SMTP User', tipo: 'text' },
    { clave: 'SMTP_PASSWORD', nombre: 'SMTP Password', tipo: 'password' },
  ]

  const renderConfigSection = (titulo: string, configs: any[]) => (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
        <h2 className="text-xl font-bold text-white flex items-center">
          <span className="w-2 h-2 bg-white rounded-full mr-3"></span>
          {titulo}
        </h2>
      </div>
      <div className="p-6">
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {configs.map(({ clave, nombre, tipo, options }) => (
            <div key={clave} className="space-y-2">
              <label className="block text-sm font-semibold text-gray-800 uppercase tracking-wide">
                {nombre}
              </label>
              {tipo === 'textarea' ? (
                <textarea
                  value={editedConfig[clave] || ''}
                  onChange={(e) => handleChange(clave, e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 font-medium text-gray-700 placeholder-gray-400"
                  rows={4}
                  placeholder={`Ingresa ${nombre.toLowerCase()}`}
                />
              ) : tipo === 'select' ? (
                <select
                  value={editedConfig[clave] || ''}
                  onChange={(e) => handleChange(clave, e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 font-medium text-gray-700"
                >
                  {(options || []).map((opt: { value: string; label: string }) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              ) : (
                <Input
                  type={tipo}
                  value={editedConfig[clave] || ''}
                  onChange={(e) => handleChange(clave, e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 font-medium text-gray-700 placeholder-gray-400"
                  placeholder={`Ingresa ${nombre.toLowerCase()}`}
                />
              )}
            </div>
          ))}
          {/* Uploader de logo con auto-vectorización */}
          {titulo.includes('Configuración General') && (
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-800 uppercase tracking-wide">Subir logo (PNG/JPG/SVG)</label>
              <input
                type="file"
                accept="image/*,image/svg+xml"
                onChange={(e) => {
                  const f = e.target.files?.[0]
                  if (!f) return
                  if (f.size > 5 * 1024 * 1024) { alert('Máximo 5MB'); return }
                  if (!f.type.startsWith('image/')) { alert('Archivo no válido'); return }
                  subirLogo(f)
                }}
                className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              {editedConfig['logo_url'] && (
                <div className="mt-2 flex items-center gap-4">
                  <div className="w-20 h-20 bg-white border rounded-lg flex items-center justify-center overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={editedConfig['logo_url']} alt="Logo" className="max-w-full max-h-full" />
                  </div>
                  <div className="text-xs text-gray-600 break-all">{editedConfig['logo_url']}</div>
                </div>
              )}
            </div>
          )}
        </div>
        {titulo.includes('Moneda') && (
          <div className="mt-6 p-4 rounded-lg bg-gray-50 border border-gray-200">
            <div className="text-sm text-gray-700">Vista previa</div>
            <div className="text-2xl font-bold text-gray-900 mt-1">
              {formatCurrencyFlexible(12345.67, {
                code: editedConfig['currency_code'] || 'VES',
                symbol: editedConfig['currency_symbol'] || 'BsS',
                locale: editedConfig['currency_locale'] || 'es-VE',
                position: (editedConfig['currency_position'] as any) || 'suffix',
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">⚙️ Configuración del Sitio</h1>
              <p className="text-gray-600 font-medium">Personaliza la apariencia y contenido de tu sitio web</p>
            </div>
            <Button 
              onClick={guardarConfiguracion}
              disabled={saving}
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              {saving ? (
                <div className="flex items-center">
                  <LoadingSpinner />
                  <span className="ml-2">Guardando...</span>
                </div>
              ) : (
                <div className="flex items-center">
                  <span>💾 Guardar Cambios</span>
                </div>
              )}
            </Button>
          </div>
        </div>

  {/* Secciones de configuración */}
        {renderConfigSection('🎨 Configuración General', configuracionesGenerales)}
        {renderConfigSection('💵 Moneda y precios', configuracionesMoneda)}
        {renderConfigSection('🔑 Integraciones y credenciales', configuracionesIntegraciones)}
        {renderConfigSection('📞 Información de Contacto', configuracionesContacto)}
        {renderConfigSection('❓ Botón de Ayuda (contenido)', configuracionesAyuda)}
        {renderConfigSection('📋 Términos y Políticas', configuracionesTerminos)}

        {/* Panel de consejos */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-500 px-6 py-4">
            <h3 className="text-lg font-bold text-white flex items-center">
              💡 Consejos y Recomendaciones
            </h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-lg border border-blue-200">
                <h4 className="font-bold text-gray-800 mb-2">🎯 Cambios en Tiempo Real</h4>
                <p className="text-sm text-gray-600">Los cambios se reflejarán inmediatamente en la página principal</p>
              </div>
              <div className="bg-white p-4 rounded-lg border border-blue-200">
                <h4 className="font-bold text-gray-800 mb-2">🎬 Videos de Fondo</h4>
                <p className="text-sm text-gray-600">Usa URLs de videos optimizados en formato MP4</p>
              </div>
              <div className="bg-white p-4 rounded-lg border border-blue-200">
                <h4 className="font-bold text-gray-800 mb-2">🎨 Colores Personalizados</h4>
                <p className="text-sm text-gray-600">Los colores deben estar en formato hexadecimal (ej: #FF0000)</p>
              </div>
              <div className="bg-white p-4 rounded-lg border border-blue-200">
                <h4 className="font-bold text-gray-800 mb-2">🖼️ Logo Profesional</h4>
                <p className="text-sm text-gray-600">Asegúrate de que el logo tenga fondo transparente (PNG)</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
