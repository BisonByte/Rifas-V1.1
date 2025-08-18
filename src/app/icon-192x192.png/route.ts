export const runtime = 'edge'
export const dynamic = 'force-static'

// Tiny 1x1 transparent PNG (base64) to avoid 404/500s when PWA requests this icon.
const PNG_BASE64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4////GQAJ+wP9dQ6V8QAAAABJRU5ErkJggg=='

function b64ToBytes(b64: string): Uint8Array {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const g: any = globalThis as any
  if (typeof g.atob === 'function') {
    const bin = g.atob(b64)
    const bytes = new Uint8Array(bin.length)
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
    return bytes
  }
  // eslint-disable-next-line no-undef
  const buf = Buffer.from(b64, 'base64')
  return new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength)
}

export async function GET() {
  try {
    const bytes = b64ToBytes(PNG_BASE64)
    return new Response(bytes, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch (err) {
    return new Response('icon error', { status: 500 })
  }
}
export const runtime = 'edge'
export const dynamic = 'force-static'

// Tiny 1x1 transparent PNG (base64). Serves as a placeholder to avoid 404s.
const PNG_BASE64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4////GQAJ+wP9dQ6V8QAAAABJRU5ErkJggg=='

function b64ToBytes(b64: string): Uint8Array {
  // Use atob when available (Edge runtime); otherwise fall back to Buffer if present
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const g: any = globalThis as any
  if (typeof g.atob === 'function') {
    const bin = g.atob(b64)
    const bytes = new Uint8Array(bin.length)
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
    return bytes
  }
  // Fallback for Node.js runtime
  // eslint-disable-next-line no-undef
  const buf = Buffer.from(b64, 'base64')
  return new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength)
}

export async function GET() {
  try {
    const bytes = b64ToBytes(PNG_BASE64)
    return new Response(bytes, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch (err) {
    return new Response('icon error', { status: 500 })
  }
}
