import 'dotenv/config'
import { prisma } from '@/lib/prisma'

async function main() {
  const url = process.env.DATABASE_URL
  if (!url) {
    console.error('DATABASE_URL no está definida en el entorno')
    process.exit(1)
  }
  console.log('Probando conexión Prisma...')

  // Fuerza conexión y una consulta simple
  await prisma.$connect()
  const now = await prisma.$queryRawUnsafe<Array<{ now: string }>>('SELECT datetime("now") as now')
  console.log('Conectado. Fecha/hora DB:', now?.[0]?.now ?? 'desconocida')

  // Probar acceso a una tabla conocida si existe
  try {
    const countConfig = await prisma.configuracionSitio.count()
    console.log('configuracion_sitio registros:', countConfig)
  } catch (_) {
    console.log('Tabla configuracion_sitio aún no creada o sin registros')
  }
}

main()
  .then(async () => {
    await prisma.$disconnect()
    console.log('OK: conexión a base de datos verificada')
  })
  .catch(async (err) => {
    await prisma.$disconnect()
    console.error('Error de conexión:', err)
    process.exit(1)
  })

