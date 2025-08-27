import axios from 'axios'
import { CONFIG } from '@/lib/config'

const PAYPAL_API = CONFIG.PAYPAL.ENV === 'live'
  ? 'https://api-m.paypal.com'
  : 'https://api-m.sandbox.paypal.com'

async function getAccessToken() {
  const clientId = CONFIG.PAYPAL.CLIENT_ID
  const clientSecret = CONFIG.PAYPAL.CLIENT_SECRET
  if (!clientId || !clientSecret) {
    throw new Error('Faltan credenciales de PayPal')
  }
  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')
  const params = new URLSearchParams()
  params.append('grant_type', 'client_credentials')

  const response = await axios.post(
    `${PAYPAL_API}/v1/oauth2/token`,
    params.toString(),
    {
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }
  )
  return response.data.access_token as string
}

export async function createOrder(total: number) {
  const token = await getAccessToken()
  const response = await axios.post(
    `${PAYPAL_API}/v2/checkout/orders`,
    {
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: {
            currency_code: 'VES',
            value: total.toFixed(2)
          }
        }
      ]
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
  )

  const { id, links } = response.data
  const approvalLink = links?.find((l: any) => l.rel === 'approve')?.href
  return { id, approvalLink }
}

export async function getOrder(orderId: string) {
  const token = await getAccessToken()
  const response = await axios.get(
    `${PAYPAL_API}/v2/checkout/orders/${orderId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
  )
  return response.data
}
