import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🚀 Agregando datos de prueba...')

  // 1. Crear participantes de prueba
  const participantes = []
  for (let i = 1; i <= 20; i++) {
    const participante = await prisma.participante.create({
      data: {
        nombre: `Cliente ${i}`,
        celular: `+58414${1234567 + i}`,
        email: `cliente${i}@email.com`
      }
    })
    participantes.push(participante)
  }
  console.log(`✅ ${participantes.length} participantes creados`)

  // 2. Agregar método de pago de prueba
  const metodoPago = await prisma.metodoPago.create({
    data: {
      nombre: 'Pago Móvil Banesco',
      tipo: 'pago_movil',
      descripcion: 'Transferencia desde cualquier banco venezolano',
      activo: true,
      orden: 1,
      numeroCuenta: '01340121121234567890',
      tipoCuenta: 'Corriente',
      cedula: 'V-12345678',
      telefono: '+58 414-1234567'
    }
  })
  console.log('✅ Método de pago creado:', metodoPago.nombre)

  // 3. Agregar cuenta bancaria
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

  // 4. Agregar rifa de prueba
  const rifa = await prisma.rifa.create({
    data: {
      nombre: '🎁 iPhone 15 Pro Max + AirPods Pro',
      descripcion: 'Sorteo especial de iPhone 15 Pro Max de 256GB en color Titanio Natural + AirPods Pro 2da generación. Incluye cargador oficial Apple y funda protectora premium.',
      fechaSorteo: new Date('2025-12-25T20:00:00Z'), // Navidad 2025
      precioPorBoleto: 25.00,
      totalBoletos: 1000,
      limitePorPersona: 10,
      estado: 'ACTIVA',
      tiempoReserva: 30 // 30 minutos
    }
  })
  console.log('✅ Rifa creada:', rifa.nombre)

  // 5. Agregar premio
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

  // 6. Agregar algunos tickets de prueba
  const tickets = []
  for (let i = 1; i <= 50; i++) {
    const participante = i <= 20 ? participantes[i - 1] : null
    const ticket = await prisma.ticket.create({
      data: {
        numero: i,
        rifaId: rifa.id,
        participanteId: participante?.id,
        estado: i <= 20 ? 'VENDIDO' : (i <= 30 ? 'RESERVADO' : 'DISPONIBLE'),
        monto: i <= 20 ? rifa.precioPorBoleto : null,
        fechaReserva: i > 20 && i <= 30 ? new Date() : null
      }
    })
    tickets.push(ticket)
  }
  console.log(`✅ ${tickets.length} tickets creados`)

  // 7. Agregar compras de prueba
  const compras = []
  for (let i = 1; i <= 15; i++) {
    const participante = participantes[i - 1]
    if (participante) {
      const cantidadTickets = Math.floor(Math.random() * 3) + 1 // 1-3 tickets
      const compra = await prisma.compra.create({
        data: {
          rifaId: rifa.id,
          participanteId: participante.id,
          cantidadTickets,
          monto: rifa.precioPorBoleto,
          montoTotal: rifa.precioPorBoleto * cantidadTickets,
          metodoPago: 'TRANSFERENCIA',
          estadoPago: i <= 10 ? 'CONFIRMADO' : (i <= 13 ? 'PENDIENTE' : 'RECHAZADO'),
          bancoId: cuentaBancaria.id,
          referencia: `REF${Date.now() + i}`,
          fechaVencimiento: new Date(Date.now() + 86400000) // 24 horas
        }
      })
      compras.push(compra)
    }
  }
  console.log(`✅ ${compras.length} compras de prueba creadas`)

  // 8. Agregar configuración del sitio
  const configuraciones = [
    { clave: 'nombre_sitio', valor: 'RifaVen - Sorteos Premium', tipo: 'text' },
    { clave: 'descripcion_sitio', valor: 'La plataforma de sorteos más confiable de Venezuela', tipo: 'text' },
    { clave: 'telefono_contacto', valor: '+58 414-SORTEOS', tipo: 'text' },
    { clave: 'email_contacto', valor: 'info@rifaven.com', tipo: 'text' },
    { clave: 'direccion', valor: 'Caracas, Venezuela', tipo: 'text' },
    { clave: 'logo_url', valor: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=200&q=80', tipo: 'text' },
    { clave: 'color_primario', valor: '#dc2626', tipo: 'text' },
    { clave: 'color_secundario', valor: '#fbbf24', tipo: 'text' },
    { clave: 'mensaje_whatsapp', valor: '¡Hola! Me interesa participar en los sorteos', tipo: 'text' }
  ]

  for (const config of configuraciones) {
    await prisma.configuracionSitio.upsert({
      where: { clave: config.clave },
      update: { valor: config.valor },
      create: config
    })
  }
  console.log('✅ Configuración del sitio actualizada')

  // 9. Agregar redes sociales
  const redesSociales = [
    { nombre: 'WhatsApp', url: 'https://wa.me/584141234567?text=Hola', icono: '📱', activo: true, orden: 1 },
    { nombre: 'Instagram', url: 'https://instagram.com/rifaven', icono: '📷', activo: true, orden: 2 },
    { nombre: 'Telegram', url: 'https://t.me/rifaven', icono: '✈️', activo: true, orden: 3 },
    { nombre: 'Facebook', url: 'https://facebook.com/rifaven', icono: '📘', activo: true, orden: 4 }
  ]

  for (const red of redesSociales) {
    await prisma.redSocial.create({
      data: red
    })
  }
  console.log('✅ Redes sociales agregadas')

  console.log('\n🎉 ¡Datos de prueba agregados exitosamente!')
  console.log('\n📊 Resumen:')
  console.log(`- 1 Rifa: "${rifa.nombre}"`)
  console.log(`- ${tickets.length} Tickets (20 vendidos, 10 reservados, 20 disponibles)`)
  console.log(`- 1 Método de pago: "${metodoPago.nombre}"`)
  // Compras incluyen pagos simulados
  console.log(`- ${compras.length} Compras/Pagos de prueba`)
  console.log(`- ${configuraciones.length} Configuraciones del sitio`)
  console.log(`- ${redesSociales.length} Redes sociales`)
  console.log('\n🔗 Accede al admin en: http://localhost:3000/admin')
  console.log('📱 Ve la página principal en: http://localhost:3000')
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
