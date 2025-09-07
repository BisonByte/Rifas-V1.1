import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🚀 Agregando métodos de pago básicos...')

  try {
    // Solo agregar los métodos de pago que faltan
    const metodosPago = [
      {
        nombre: 'Pago Móvil Banesco',
        tipo: 'PAGO_MOVIL',
        descripcion: 'Transferencia desde cualquier banco venezolano',
        activo: true,
        orden: 1,
        numeroCuenta: '01340121121234567890',
        tipoCuenta: 'Corriente',
        cedula: 'V-12345678',
        telefono: '+58 414-1234567'
      },
      {
        nombre: 'Transferencia Mercantil',
        tipo: 'BANCO',
        descripcion: 'Transferencia bancaria Mercantil',
        activo: true,
        orden: 2,
        numeroCuenta: '01050100011234567890',
        tipoCuenta: 'Ahorro',
        cedula: 'V-12345678'
      }
    ]

    for (const metodo of metodosPago) {
      try {
        await prisma.metodoPago.upsert({
          where: { nombre: metodo.nombre },
          update: metodo,
          create: metodo
        })
        console.log(`✅ Método de pago: ${metodo.nombre}`)
      } catch (error: any) {
        console.log(`ℹ️ ${metodo.nombre} ya existe o error:`, error.message)
      }
    }

    console.log('\n🎉 ¡Métodos de pago listos para pruebas!')
    console.log('\n📱 Ahora puedes ir al panel admin y ver:')
    console.log('- Rifas disponibles')
    console.log('- Métodos de pago configurados') 
    console.log('- Participantes y tickets')
    console.log('- Compras realizadas')

  } catch (error: any) {
    console.error('❌ Error:', error.message)
  }
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
