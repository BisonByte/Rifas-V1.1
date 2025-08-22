'use client'

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { formatCurrencyFlexible } from '@/lib/utils'
import { get, put, post } from '@/lib/api-client'
import { AdminHeader } from '@/features/admin/ui/AdminHeader'
import { AdminSection } from '@/features/admin/ui/AdminSection'

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
    <AdminSection title={titulo}>
      <div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {configs.map(({ clave, nombre, tipo, options }) => (
            <div key={clave} className="space-y-2">
              <label className="block text-sm font-semibold text-slate-300 uppercase tracking-wide">
                {nombre}
              </label>
              {tipo === 'textarea' ? (
                <textarea
                  value={editedConfig[clave] || ''}
                  onChange={(e) => handleChange(clave, e.target.value)}
                  className="w-full px-4 py-3 bg-slate-800/60 border border-slate-600/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-200 placeholder-slate-400"
                  rows={4}
                  placeholder={`Ingresa ${nombre.toLowerCase()}`}
                />
              ) : tipo === 'select' ? (
                <select
                  value={editedConfig[clave] || ''}
                  onChange={(e) => handleChange(clave, e.target.value)}
                  className="w-full px-4 py-3 bg-slate-800/60 border border-slate-600/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-200"
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
                  className="w-full px-4 py-3 bg-slate-800/60 border border-slate-600/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-200 placeholder-slate-400"
                  placeholder={`Ingresa ${nombre.toLowerCase()}`}
                />
              )}
              {clave === 'logo_url' && (
                <p className="text-xs text-slate-400">Sugerencia: PNG con fondo transparente</p>
              )}
            </div>
          ))}
          {/* Uploader de logo con auto-vectorización */}
          {titulo.includes('Configuración General') && (
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-300 uppercase tracking-wide">Subir logo (PNG/JPG/SVG)</label>
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
                className="block w-full text-sm text-slate-200 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border file:border-slate-600/50 file:text-sm file:font-semibold file:bg-slate-800/60 file:text-slate-200 hover:file:bg-slate-700/50"
              />
              {editedConfig['logo_url'] && (
                <div className="mt-2 flex items-center gap-4">
                  <div className="w-20 h-20 bg-slate-800 border border-slate-700/50 rounded-lg flex items-center justify-center overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={editedConfig['logo_url']} alt="Logo" className="max-w-full max-h-full" />
                  </div>
                  <div className="text-xs text-slate-400 break-all">{editedConfig['logo_url']}</div>
                </div>
              )}
            </div>
          )}
        </div>
        {titulo.includes('Moneda') && (
          <div className="mt-6 p-4 rounded-lg bg-slate-800/60 border border-slate-700/50">
            <div className="text-sm text-slate-300">Vista previa</div>
            <div className="text-2xl font-bold text-slate-100 mt-1">
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
    </AdminSection>
  )

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <AdminHeader
          title="⚙️ Configuración del Sitio"
          description="Personaliza la apariencia y contenido de tu sitio web"
          right={<Button onClick={guardarConfiguracion} disabled={saving}>{saving ? 'Guardando…' : '💾 Guardar Cambios'}</Button>}
        />

  {/* Secciones de configuración */}
        {renderConfigSection('🎨 Configuración General', configuracionesGenerales)}
        {renderConfigSection('💵 Moneda y precios', configuracionesMoneda)}
        {renderConfigSection('🔑 Integraciones y credenciales', configuracionesIntegraciones)}
        {renderConfigSection('📞 Información de Contacto', configuracionesContacto)}
        {renderConfigSection('❓ Botón de Ayuda (contenido)', configuracionesAyuda)}
        {renderConfigSection('📋 Términos y Políticas', configuracionesTerminos)}

        
      </div>
    </div>
  )
}
