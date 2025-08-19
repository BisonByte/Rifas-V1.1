import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import fs from 'fs'
import { spawn } from 'child_process'
import { sendEmail } from '@/lib/sendEmail'
import { writeEnvAtomic, generateSecret } from '@/lib/env'

const rateLimit = new Map<string, { count: number; time: number }>()

function checkRateLimit(ip: string, limit = 10, windowMs = 60_000) {
  const now = Date.now()
  const entry = rateLimit.get(ip) || { count: 0, time: now }
  if (now - entry.time > windowMs) {
    entry.count = 0
    entry.time = now
  }
  entry.count++
  rateLimit.set(ip, entry)
  return entry.count <= limit
}

function isAuthorized(req: NextRequest) {
  const header = req.headers.get('x-setup-token') ||
    req.headers.get('authorization')?.replace('Bearer ', '')
  return header && process.env.SETUP_TOKEN && header === process.env.SETUP_TOKEN
}

export async function POST(
  req: NextRequest,
  { params }: { params: { action: string } }
) {
  if (process.env.FIRST_RUN === 'false' || fs.existsSync('setup.lock')) {
    return NextResponse.json(
      { ok: false, error: 'Setup already completed' },
      { status: 403 }
    )
  }

  const ip = req.headers.get('x-forwarded-for') ?? 'unknown'
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ ok: false, error: 'Too many requests' }, { status: 429 })
  }
  if (!isAuthorized(req)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
  }

  try {
    switch (params.action) {
      case 'generate-secret': {
        const secret = generateSecret()
        return NextResponse.json({ ok: true, secret })
      }
      case 'verify': {
        return NextResponse.json({ ok: true })
      }
      case 'test-db': {
        const { url } = await req.json()
        const client = new PrismaClient({ datasourceUrl: url })
        await client.$connect()
        await client.$queryRaw`SELECT 1`
        await client.$disconnect()
        return NextResponse.json({ ok: true })
      }
      case 'send-smtp-test': {
        const { to } = await req.json()
        await sendEmail(to, 'Prueba SMTP', 'El sistema de rifas puede enviar correos')
        return NextResponse.json({ ok: true })
      }
      case 'apply': {
        const body = await req.json()
        const envVars: Record<string, string> = body.env || {}
        await writeEnvAtomic(envVars)

        await new Promise<void>((resolve, reject) => {
          const child = spawn('npx', ['prisma', 'migrate', 'deploy'], { stdio: 'inherit' })
          child.on('exit', (code) => {
            if (code === 0) resolve()
            else reject(new Error('Migration failed'))
          })
        })

        if (body.admin) {
          const prisma = new PrismaClient({ datasourceUrl: envVars.DATABASE_URL })
          const hashed = await bcrypt.hash(body.admin.password, 12)
          await prisma.usuario.upsert({
            where: { email: body.admin.email },
            update: {},
            create: {
              nombre: body.admin.nombre || 'Administrador',
              email: body.admin.email,
              celular: body.admin.celular,
              password: hashed,
              rol: 'SUPER_ADMIN',
              activo: true,
            },
          })
          await prisma.$disconnect()
        }

        await fs.promises.writeFile('setup.lock', new Date().toISOString())
        return NextResponse.json({ ok: true })
      }
      default:
        return NextResponse.json(
          { ok: false, error: 'Unknown action' },
          { status: 400 }
        )
    }
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  }
}

export const GET = POST

