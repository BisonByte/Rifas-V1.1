import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔧 Actualizando logo_url en la base de datos...')

  const result = await prisma.configuracionSitio.updateMany({
    where: { clave: 'logo_url' },
    data: { valor: '/icon-512x512.png' }
  })

  console.log('✅ Filas actualizadas:', result.count)
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
