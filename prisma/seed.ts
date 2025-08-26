import { PrismaClient } from '@prisma/client'
import bcryptjs from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed de datos...')

  // 1. Crear usuario administrador
  const adminPassword = await bcryptjs.hash('admin123', 10)
  const admin = await prisma.usuario.upsert({
    where: { email: 'admin@rifas.com' },
    update: {},
    create: {
      nombre: 'Administrador',
      email: 'admin@rifas.com',
      celular: '+1234567890',
      password: adminPassword,
        rol: 'SUPER_ADMIN',
      activo: true
    }
  })
  console.log('✅ Admin creado:', admin.email)

  // 2. Crear cuentas bancarias
  const banco1 = await prisma.cuentaBancaria.upsert({
    where: { numero: '1234567890' },
    update: {},
    create: {
      banco: 'Banco Nacional',
      titular: 'Sistema de Rifas',
      numero: '1234567890',
      tipoCuenta: 'Corriente',
      activa: true,
      orden: 1
    }
  })

  const banco2 = await prisma.cuentaBancaria.upsert({
    where: { numero: '0987654321' },
    update: {},
    create: {
      banco: 'Banco Popular',
      titular: 'Sistema de Rifas',
      numero: '0987654321',
      tipoCuenta: 'Ahorros',
      activa: true,
      orden: 2
    }
  })
  console.log('✅ Cuentas bancarias creadas')

  // 3. Crear rifa de prueba
  const rifa = await prisma.rifa.create({
    data: {
      nombre: 'Rifa de Prueba - iPhone 15 Pro',
      descripcion: 'Gana el último iPhone 15 Pro en esta increíble rifa',
      fechaSorteo: new Date('2024-12-31T20:00:00Z'),
      precioPorBoleto: 10.0,
      totalBoletos: 1000,
      limitePorPersona: 10,
      estado: 'ACTIVA',
      tiempoReserva: 30
    }
  })
  console.log('✅ Rifa creada:', rifa.nombre)

  // 4. Crear premios
  await prisma.premio.create({
    data: {
      rifaId: rifa.id,
      titulo: 'iPhone 15 Pro 128GB',
      descripcion: 'iPhone 15 Pro de última generación con 128GB de almacenamiento',
      cantidad: 1,
      orden: 1
    }
  })

  await prisma.premio.create({
    data: {
      rifaId: rifa.id,
      titulo: 'AirPods Pro',
      descripcion: 'AirPods Pro de segunda generación',
      cantidad: 2,
      orden: 2
    }
  })
  console.log('✅ Premios creados')

  // 5. Crear todos los tickets
  const tickets = []
  for (let i = 1; i <= rifa.totalBoletos; i++) {
    tickets.push({
      numero: i,
      rifaId: rifa.id,
      estado: 'DISPONIBLE'
    })
  }

  // Crear tickets en lotes de 100 para mejor rendimiento
  for (let i = 0; i < tickets.length; i += 100) {
    const batch = tickets.slice(i, i + 100)
    await prisma.ticket.createMany({
      data: batch
    })
  }
  console.log(`✅ ${tickets.length} tickets creados`)

  // 6. Crear algunos participantes de prueba
  const participante1 = await prisma.participante.create({
    data: {
      nombre: 'Juan Pérez',
      celular: '+1234567890',
      email: 'juan@example.com'
    }
  })

  const participante2 = await prisma.participante.create({
    data: {
      nombre: 'María García',
      celular: '+1234567891',
      email: 'maria@example.com'
    }
  })
  console.log('✅ Participantes de prueba creados')

  // 7. Crear algunas compras de ejemplo
  const compra1 = await prisma.compra.create({
    data: {
      rifaId: rifa.id,
      participanteId: participante1.id,
      cantidadTickets: 5,
      monto: 10.0, // Precio por ticket
      montoTotal: 50.0, // 5 tickets * 10
      metodoPago: 'TRANSFERENCIA',
      estadoPago: 'APROBADO',
      referencia: 'REF-001',
      bancoId: banco1.id
    }
  })

  // Asignar tickets a la compra 1
  await prisma.ticket.updateMany({
    where: {
      rifaId: rifa.id,
      numero: { in: [1, 2, 3, 4, 5] }
    },
    data: {
      participanteId: participante1.id,
      compraId: compra1.id,
      estado: 'PAGADO',
      monto: 10.0
    }
  })

  const compra2 = await prisma.compra.create({
    data: {
      rifaId: rifa.id,
      participanteId: participante2.id,
      cantidadTickets: 3,
      monto: 10.0, // Precio por ticket
      montoTotal: 30.0, // 3 tickets * 10
      metodoPago: 'TRANSFERENCIA',
      estadoPago: 'PENDIENTE',
      referencia: 'REF-002',
      fechaVencimiento: new Date(Date.now() + 30 * 60 * 1000), // 30 minutos
      bancoId: banco2.id
    }
  })

  // Reservar tickets para la compra 2
  await prisma.ticket.updateMany({
    where: {
      rifaId: rifa.id,
      numero: { in: [10, 11, 12] }
    },
    data: {
      participanteId: participante2.id,
      compraId: compra2.id,
      estado: 'RESERVADO',
      monto: 10.0,
      fechaReserva: new Date(),
      fechaVencimiento: new Date(Date.now() + 30 * 60 * 1000)
    }
  })

  console.log('✅ Compras de ejemplo creadas')

  // Estadísticas finales
  const stats = {
    usuarios: await prisma.usuario.count(),
    rifas: await prisma.rifa.count(),
    tickets: await prisma.ticket.count(),
    ticketsDisponibles: await prisma.ticket.count({ where: { estado: 'DISPONIBLE' } }),
    ticketsReservados: await prisma.ticket.count({ where: { estado: 'RESERVADO' } }),
    ticketsPagados: await prisma.ticket.count({ where: { estado: 'PAGADO' } }),
    participantes: await prisma.participante.count(),
    compras: await prisma.compra.count(),
    bancos: await prisma.cuentaBancaria.count()
  }

  console.log('\n📊 Estadísticas de la base de datos:')
  Object.entries(stats).forEach(([key, value]) => {
    console.log(`  ${key}: ${value}`)
  })

  console.log('\n🎉 Seed completado exitosamente!')
  console.log('\n🔐 Credenciales de administrador:')
  console.log('  Email: admin@rifas.com')
  console.log('  Password: admin123')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
