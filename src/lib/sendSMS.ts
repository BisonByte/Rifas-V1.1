import { CONFIG } from '@/lib/config'

export async function sendSMS(to: string, body: string) {
  if (!CONFIG.SMS.ENABLED) {
    console.warn('SMS no está configurado')
    return
  }

  if (CONFIG.SMS.PROVIDER !== 'twilio') {
    console.warn('Proveedor SMS no soportado')
    return
  }

  const accountSid = CONFIG.SMS.ACCOUNT_SID
  const authToken = CONFIG.SMS.AUTH_TOKEN
  const from = CONFIG.SMS.FROM

  if (!accountSid || !authToken || !from) {
    console.warn('Configuración de Twilio incompleta')
    return
  }

  const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`
  const params = new URLSearchParams({ To: to, From: from, Body: body })

  try {
    await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params,
    })
  } catch (error) {
    console.error('Error enviando SMS', error)
  }
}
