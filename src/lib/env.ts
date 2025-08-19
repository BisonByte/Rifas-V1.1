import { promises as fs } from 'fs'
import { randomBytes } from 'crypto'

export function generateSecret(length: number = 32): string {
  return randomBytes(length).toString('hex')
}

export async function writeEnvAtomic(env: Record<string, string>): Promise<void> {
  let content = ''
  for (const [key, value] of Object.entries(env)) {
    content += `${key}=${String(value)}\n`
  }
  if (!('FIRST_RUN' in env)) {
    content += 'FIRST_RUN=false\n'
  }

  const tmpPath = '.env.tmp'
  const finalPath = '.env'

  const file = await fs.open(tmpPath, 'w', 0o600)
  try {
    await file.writeFile(content, 'utf8')
    await file.sync()
  } finally {
    await file.close()
  }

  await fs.rename(tmpPath, finalPath)
  await fs.chmod(finalPath, 0o600)
}

