import { NextRequest, NextResponse } from 'next/server'
import { createReadStream } from 'fs'
import { promises as fs } from 'fs'
import path from 'path'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const MIME: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
}

function safeJoin(base: string, target: string) {
  const targetPath = path.join(base, target)
  const normalized = path.normalize(targetPath)
  if (!normalized.startsWith(base)) throw new Error('Invalid path')
  return normalized
}

async function serveFile(filePath: string) {
  const stat = await fs.stat(filePath)
  const ext = path.extname(filePath).toLowerCase()
  const type = MIME[ext] || 'application/octet-stream'

  const stream = createReadStream(filePath)
  const res = new NextResponse(stream as any, {
    status: 200,
    headers: {
      'Content-Type': type,
      'Content-Length': String(stat.size),
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  })
  return res
}

export async function GET(req: NextRequest, ctx: { params: { path: string[] } }) {
  try {
    const requested = (ctx.params.path || []).join('/')
    const base = path.join(process.cwd(), 'public', 'uploads')
    const filePath = safeJoin(base, requested)
    return await serveFile(filePath)
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Archivo no encontrado' }, { status: 404 })
  }
}

export async function HEAD(req: NextRequest, ctx: { params: { path: string[] } }) {
  try {
    const requested = (ctx.params.path || []).join('/')
    const base = path.join(process.cwd(), 'public', 'uploads')
    const filePath = safeJoin(base, requested)
    const stat = await fs.stat(filePath)
    const ext = path.extname(filePath).toLowerCase()
    const type = MIME[ext] || 'application/octet-stream'
    return new NextResponse(null, {
      status: 200,
      headers: {
        'Content-Type': type,
        'Content-Length': String(stat.size),
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch (err) {
    return new NextResponse(null, { status: 404 })
  }
}

