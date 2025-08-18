import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🚀 Agregando datos de prueba...')

  try {
    // 1. Crear participantes de prueba
    const participantes = []
    for (let i = 1; i <= 5; i++) {
      const participante = await prisma.participante.create({
        data: {
          nombre: `Cliente ${i}`,
          celular: `+58414123456${i}`,
          email: `cliente${i}@email.com`
        }
      })
      participantes.push(participante)
    }
    console.log(`✅ ${participantes.length} participantes creados`)

    // 2. Agregar cuenta bancaria
    const cuentaBancaria = await prisma.cuentaBancaria.create({
      data: {
        banco: 'Banesco',
        titular: 'RIFAVEN C.A.',
        numero: '01340121121234567890',
        tipoCuenta: 'Corriente',
        activa: true,
        orden: 1
      }
    })
    console.log('✅ Cuenta bancaria creada:', cuentaBancaria.banco)

    // 3. Agregar rifa de prueba
    const rifa = await prisma.rifa.create({
      data: {
        nombre: '🎁 iPhone 15 Pro Max + AirPods Pro',
        descripcion: 'Sorteo especial de iPhone 15 Pro Max de 256GB en color Titanio Natural + AirPods Pro 2da generación. Incluye cargador oficial Apple y funda protectora premium.',
        fechaSorteo: new Date('2025-12-25T20:00:00Z'),
        precioPorBoleto: 25.00,
        totalBoletos: 100,
        limitePorPersona: 10,
        estado: 'ACTIVA',
        tiempoReserva: 30
      }
    })
    console.log('✅ Rifa creada:', rifa.nombre)

    // 4. Agregar premio
    const premio = await prisma.premio.create({
      data: {
        rifaId: rifa.id,
        titulo: 'iPhone 15 Pro Max 256GB',
        descripcion: 'iPhone 15 Pro Max de 256GB en color Titanio Natural',
        cantidad: 1,
        orden: 1
      }
    })
    console.log('✅ Premio creado:', premio.titulo)

    // 5. Agregar algunos tickets de prueba
    const tickets = []
    for (let i = 1; i <= 20; i++) {
      const participante = i <= 5 ? participantes[i - 1] : null
      const ticket = await prisma.ticket.create({
        data: {
          numero: i,
          rifaId: rifa.id,
          participanteId: participante?.id,
          estado: i <= 5 ? 'VENDIDO' : (i <= 10 ? 'RESERVADO' : 'DISPONIBLE'),
          monto: i <= 5 ? rifa.precioPorBoleto : null
        }
      })
      tickets.push(ticket)
    }
    console.log(`✅ ${tickets.length} tickets creados`)

    // 6. Agregar compras de prueba
    const compras = []
    for (let i = 1; i <= 5; i++) {
      const participante = participantes[i - 1]
      const compra = await prisma.compra.create({
        data: {
          rifaId: rifa.id,
          participanteId: participante.id,
          cantidadTickets: 1,
          monto: rifa.precioPorBoleto,
          montoTotal: rifa.precioPorBoleto,
          metodoPago: 'TRANSFERENCIA',
          estadoPago: 'CONFIRMADO',
          bancoId: cuentaBancaria.id,
          referencia: `REF${Date.now() + i}`
        }
      })
      compras.push(compra)
    }
    console.log(`✅ ${compras.length} compras creadas`)

    console.log('\n🎉 ¡Datos de prueba agregados exitosamente!')
    console.log('\n📊 Resumen:')
    console.log(`- 1 Rifa: "${rifa.nombre}"`)
    console.log(`- ${tickets.length} Tickets (5 vendidos, 5 reservados, 10 disponibles)`)
    console.log(`- 1 Cuenta bancaria: "${cuentaBancaria.banco}"`)
    console.log(`- ${compras.length} Compras confirmadas`)
    console.log(`- ${participantes.length} Participantes`)
    console.log('\n🔗 Accede al admin en: http://localhost:3000/admin')

  } catch (error) {
    console.error('❌ Error creando datos:', error)
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
