import { PrismaClient } from '@prisma/client'
import { randomBytes } from 'crypto'
import { atomicWrite } from './atomicWrite'

export async function testDatabaseConnection(url: string) {
  const client = new PrismaClient({ datasourceUrl: url })
  try {
    await client.$connect()
    await client.$queryRaw`SELECT 1`
  } finally {
    await client.$disconnect()
  }
}

export function generateSecret() {
  return randomBytes(32).toString('hex')
}

export async function writeEnv(vars: Record<string, string>) {
  let content = ''
  for (const [key, value] of Object.entries(vars)) {
    content += `${key}=${String(value)}\n`
  }
  if (!('FIRST_RUN' in vars)) {
    content += 'FIRST_RUN=false\n'
  }
  await atomicWrite('.env', content)
}
