import { CONFIG } from './config'
import { logError } from './logger'

const BASE_URL = CONFIG.ENDPOINTS.BASE_URL

function buildUrl(path: string) {
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path
  }
  return `${BASE_URL}${path}`
}

async function request<T>(method: string, path: string, body?: any, options: RequestInit = {}): Promise<T> {
  const url = buildUrl(path)
  const headers = new Headers(options.headers as HeadersInit)
  let payload: BodyInit | undefined = undefined

  if (body instanceof FormData) {
    payload = body
  } else if (body !== undefined && body !== null) {
    headers.set('Content-Type', 'application/json')
    payload = JSON.stringify(body)
  }

  try {
  const res = await fetch(url, { ...options, method, headers, body: payload })

    if (!res.ok) {
      let message = res.statusText
      try {
        const errorData = await res.json()
        message = errorData.message || errorData.error || message
      } catch {}
      throw new Error(message)
    }

    if (res.status === 204) {
      return undefined as unknown as T
    }

    const contentType = res.headers.get('content-type')
    if (contentType && contentType.includes('application/json')) {
      return (await res.json()) as T
    }
    return (await res.text()) as unknown as T
  } catch (err) {
    logError(`API request error: ${url}`, err)
    console.error('API request error:', err)
    throw err
  }
}

export const get = <T>(path: string, options?: RequestInit) => request<T>('GET', path, undefined, options)
export const post = <T>(path: string, body?: any, options?: RequestInit) => request<T>('POST', path, body, options)
export const put = <T>(path: string, body?: any, options?: RequestInit) => request<T>('PUT', path, body, options)
export const patch = <T>(path: string, body?: any, options?: RequestInit) => request<T>('PATCH', path, body, options)
export const del = <T>(path: string, options?: RequestInit) => request<T>('DELETE', path, undefined, options)

export default { get, post, put, patch, del }
