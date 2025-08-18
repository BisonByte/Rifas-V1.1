'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { get, put, post } from '@/lib/api-client'
import { CONFIG } from '@/lib/config'

interface EmailTemplate { subject?: string; body?: string }
interface SmsTemplate { body?: string }

export default function NotificacionesAjustesPage() {
  const tipos = CONFIG.NOTIFICACIONES.TIPOS_VALIDOS
  const [smtpEnabled, setSmtpEnabled] = useState(false)
  const [smsEnabled, setSmsEnabled] = useState(false)
  const [emailTemplates, setEmailTemplates] = useState<Record<string, EmailTemplate>>({})
  const [smsTemplates, setSmsTemplates] = useState<Record<string, SmsTemplate>>({})
  const [saving, setSaving] = useState(false)
  const [testEmail, setTestEmail] = useState('')

  useEffect(() => {
    const cargar = async () => {
      try {
        const configResp = await get<any>('/api/admin/configuracion')
        const data = configResp.data || configResp
        setSmtpEnabled(data.SMTP_ENABLED === true || data.SMTP_ENABLED === 'true')
        setSmsEnabled(data.SMS_ENABLED === true || data.SMS_ENABLED === 'true')
        setEmailTemplates(data.EMAIL_TEMPLATES || {})
        setSmsTemplates(data.SMS_TEMPLATES || {})
      } catch (err) {
        console.error('Error cargando configuración', err)
      }
      try {
        const me = await get<any>('/api/auth/me')
        if (me.success && me.user?.email) setTestEmail(me.user.email)
      } catch {}
    }
    cargar()
  }, [])

  const handleEmailTemplate = (tipo: string, field: keyof EmailTemplate, value: string) => {
    setEmailTemplates(prev => ({
      ...prev,
      [tipo]: { ...prev[tipo], [field]: value },
    }))
  }

  const handleSmsTemplate = (tipo: string, value: string) => {
    setSmsTemplates(prev => ({
      ...prev,
      [tipo]: { body: value },
    }))
  }

  const guardar = async () => {
    setSaving(true)
    try {
      await put('/api/admin/configuracion', {
        configuraciones: {
          SMTP_ENABLED: smtpEnabled,
          SMS_ENABLED: smsEnabled,
          EMAIL_TEMPLATES: emailTemplates,
          SMS_TEMPLATES: smsTemplates,
        },
      })
      alert('Configuración guardada')
    } catch (e) {
      console.error(e)
      alert('Error guardando configuración')
    }
    setSaving(false)
  }

  const enviarPrueba = async () => {
    try {
      await post('/api/admin/notificaciones/test-email', { to: testEmail })
      alert('Correo de prueba enviado')
    } catch (e) {
      console.error(e)
      alert('Error enviando correo de prueba')
    }
  }

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-2xl font-bold">Ajustes de Notificaciones</h1>

      <div className="space-y-4">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={smtpEnabled}
            onChange={(e) => setSmtpEnabled(e.target.checked)}
          />
          <span>SMTP habilitado</span>
        </label>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={smsEnabled}
            onChange={(e) => setSmsEnabled(e.target.checked)}
          />
          <span>SMS habilitado</span>
        </label>
      </div>

      <div className="space-y-6">
        {tipos.map((tipo) => (
          <div key={tipo} className="border p-4 rounded-md space-y-2">
            <h2 className="font-semibold">{tipo}</h2>
            <Input
              placeholder="Asunto email"
              value={emailTemplates[tipo]?.subject || ''}
              onChange={(e) => handleEmailTemplate(tipo, 'subject', e.target.value)}
            />
            <textarea
              className="w-full border rounded-md p-2"
              placeholder="Cuerpo email"
              value={emailTemplates[tipo]?.body || ''}
              onChange={(e) => handleEmailTemplate(tipo, 'body', e.target.value)}
            />
            <textarea
              className="w-full border rounded-md p-2"
              placeholder="Cuerpo SMS"
              value={smsTemplates[tipo]?.body || ''}
              onChange={(e) => handleSmsTemplate(tipo, e.target.value)}
            />
          </div>
        ))}
      </div>

      <Button onClick={guardar} disabled={saving}>
        {saving ? 'Guardando...' : 'Guardar'}
      </Button>

      <div className="space-y-2">
        <Input
          placeholder="Correo de prueba"
          value={testEmail}
          onChange={(e) => setTestEmail(e.target.value)}
        />
        <Button onClick={enviarPrueba}>Enviar correo de prueba</Button>
      </div>
    </div>
  )
}
