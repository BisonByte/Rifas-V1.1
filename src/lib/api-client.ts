import { CONFIG } from './config'

export class HttpError<T = unknown> extends Error {
  status: number
  details?: T
  constructor(message: string, status: number, details?: T) {
    super(message)
    this.name = 'HttpError'
    this.status = status
    this.details = details
  }
}

const BASE_URL = CONFIG.ENDPOINTS.BASE_URL

function buildUrl(path: string) {
  // If already absolute, keep as-is
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path
  }
  // In the browser, prefer relative URLs to preserve same-origin cookies (avoid localhost vs 127.0.0.1 issues)
  if (typeof window !== 'undefined' && path.startsWith('/')) {
    return path
  }
  // In SSR or for non-leading-slash paths, fall back to configured BASE_URL
  return `${BASE_URL}${path}`
}

async function request<TResponse, TBody = unknown>(method: string, path: string, body?: TBody, options: RequestInit = {}): Promise<TResponse> {
  const url = buildUrl(path)
  const { credentials = 'include', headers: initHeaders, ...rest } = options
  const headers = new Headers(initHeaders as HeadersInit)
  let payload: BodyInit | undefined = undefined

  if (body instanceof FormData) {
    payload = body
  } else if (body !== undefined && body !== null) {
    headers.set('Content-Type', 'application/json')
    payload = JSON.stringify(body)
  }

  try {
    const res = await fetch(url, {
      ...rest,
      method,
      headers,
      body: payload,
      credentials,
    })

      if (!res.ok) {
        let message = res.statusText
        let details: unknown = undefined
        try {
          const errorData = await res.json()
          message = errorData.message || errorData.mensaje || errorData.error || message
          details = errorData.details ?? errorData.detalles
        } catch {}
        throw new HttpError(message, res.status, details)
      }

      if (res.status === 204) {
        return undefined as unknown as TResponse
      }

      const contentType = res.headers.get('content-type')
      if (contentType && contentType.includes('application/json')) {
        return (await res.json()) as TResponse
      }
      return (await res.text()) as unknown as TResponse
  } catch (err) {
    if (typeof window === 'undefined') {
      const { logError } = await import('./logger')
      logError?.(`API request error: ${url}`, err)
    }
    console.error('API request error:', err)
    throw err
  }
}

export const get = <TResponse>(path: string, options?: RequestInit) =>
  request<TResponse, undefined>('GET', path, undefined, options)
export const post = <TResponse, TBody = unknown>(path: string, body?: TBody, options?: RequestInit) =>
  request<TResponse, TBody>('POST', path, body, options)
export const put = <TResponse, TBody = unknown>(path: string, body?: TBody, options?: RequestInit) =>
  request<TResponse, TBody>('PUT', path, body, options)
export const patch = <TResponse, TBody = unknown>(path: string, body?: TBody, options?: RequestInit) =>
  request<TResponse, TBody>('PATCH', path, body, options)
export const del = <TResponse>(path: string, options?: RequestInit) =>
  request<TResponse, undefined>('DELETE', path, undefined, options)

export default { get, post, put, patch, del }
