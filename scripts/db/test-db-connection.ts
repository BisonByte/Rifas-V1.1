import { config } from 'dotenv'
import { resolve } from 'path'

// Cargar variables de entorno
config({ path: resolve(__dirname, '../.env.local') })

import { prisma } from '../src/lib/prisma'

async function testConnection() {
  try {
    console.log('🔌 Probando conexión a PostgreSQL...')
    console.log('DATABASE_URL:', process.env.DATABASE_URL?.replace(/:[^:]*@/, ':****@'))

    // Intentar conectar
    await prisma.$connect()
    console.log('✅ Conexión exitosa a PostgreSQL!')

    // Probar query simple
    const result = await prisma.$queryRaw`SELECT 1 as test`
    console.log('✅ Query de prueba exitosa:', result)

    // Verificar si hay tablas
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `
    console.log('📋 Tablas existentes:', tables)

    if (Array.isArray(tables) && tables.length === 0) {
      console.log('⚠️  No hay tablas. Ejecutar: npx prisma db push')
    }

  } catch (error) {
    console.error('❌ Error de conexión:', error)
    console.log('\n🛠️  Posibles soluciones:')
    console.log('1. Verificar que PostgreSQL esté corriendo')
    console.log('2. Verificar credenciales en .env.local')
    console.log('3. Crear la base de datos manualmente')
    console.log('4. Usar Supabase (opción más fácil)')
  } finally {
    await prisma.$disconnect()
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  testConnection()
}

export { testConnection }
