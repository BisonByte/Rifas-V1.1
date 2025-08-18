import readline from 'readline/promises'
import { stdin as input, stdout as output } from 'process'
import { spawn } from 'child_process'
import bcrypt from 'bcryptjs'
import { PrismaClient } from '@prisma/client'
import { testDatabaseConnection, generateSecret, writeEnv } from '../src/lib/setup'

const rl = readline.createInterface({ input, output })

async function ask(question: string) {
  const answer = await rl.question(question)
  return answer.trim()
}

async function main() {
  console.log('--- Sistema de Rifas Setup ---')

  const databaseUrl = await ask('Database URL: ')
  await testDatabaseConnection(databaseUrl)
  console.log('✅ Conexión a la base de datos exitosa.')

  const adminEmail = await ask('Admin email: ')
  const adminPassword = await ask('Admin password: ')

  let jwtSecret = await ask('JWT secret (leave blank to generate): ')
  if (!jwtSecret) {
    jwtSecret = generateSecret()
    console.log('Generado JWT secret.')
  }

  let nextAuthSecret = await ask('NextAuth secret (leave blank to generate): ')
  if (!nextAuthSecret) {
    nextAuthSecret = generateSecret()
    console.log('Generado NextAuth secret.')
  }

  const smtpHost = await ask('SMTP host (optional): ')
  const smtpPort = await ask('SMTP port (optional): ')
  const smtpUser = await ask('SMTP user (optional): ')
  const smtpPassword = await ask('SMTP password (optional): ')

  const envVars: Record<string, string> = {
    DATABASE_URL: databaseUrl,
    JWT_SECRET: jwtSecret,
    NEXTAUTH_SECRET: nextAuthSecret,
  }

  if (smtpHost) envVars.SMTP_HOST = smtpHost
  if (smtpPort) envVars.SMTP_PORT = smtpPort
  if (smtpUser) envVars.SMTP_USER = smtpUser
  if (smtpPassword) envVars.SMTP_PASSWORD = smtpPassword

  await writeEnv(envVars)
  console.log('Archivo .env creado.')

  await new Promise<void>((resolve, reject) => {
    const child = spawn('npx', ['prisma', 'migrate', 'deploy'], { stdio: 'inherit' })
    child.on('exit', code => {
      if (code === 0) resolve()
      else reject(new Error('Migration failed'))
    })
  })

  const prisma = new PrismaClient({ datasourceUrl: databaseUrl })
  const hashed = await bcrypt.hash(adminPassword, 12)
  await prisma.usuario.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      nombre: 'Administrador',
      email: adminEmail,
      password: hashed,
      rol: 'SUPER_ADMIN',
      activo: true,
    },
  })
  await prisma.$disconnect()

  console.log('\nSetup completo!')
  console.log(`Admin: ${adminEmail}`)

  rl.close()
  process.exit(0)
}

main().catch(err => {
  console.error('Error en setup:', err)
  rl.close()
  process.exit(1)
})
