import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🚀 Agregando métodos de pago y configuración...')

  try {
    // 1. Agregar métodos de pago
    const metodosPago = [
      {
        nombre: 'Pago Móvil Banesco',
        tipo: 'PAGO_MOVIL',
        descripcion: 'Transferencia desde cualquier banco',
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
      },
      {
        nombre: 'Zelle',
        tipo: 'BILLETERA',
        descripcion: 'Pagos vía Zelle',
        activo: true,
        orden: 3,
        telefono: '+1 305-123-4567'
      }
    ]

    for (const metodo of metodosPago) {
      await prisma.metodoPago.upsert({
        where: { nombre: metodo.nombre },
        update: metodo,
        create: metodo
      })
    }
    console.log(`✅ ${metodosPago.length} métodos de pago creados/actualizados`)

    // 2. Agregar redes sociales
    const redesSociales = [
      { nombre: 'WhatsApp', url: 'https://wa.me/584141234567?text=Hola', icono: '📱', activo: true, orden: 1 },
      { nombre: 'Instagram', url: 'https://instagram.com/rifaven', icono: '📷', activo: true, orden: 2 },
      { nombre: 'Telegram', url: 'https://t.me/rifaven', icono: '✈️', activo: true, orden: 3 },
      { nombre: 'Facebook', url: 'https://facebook.com/rifaven', icono: '📘', activo: true, orden: 4 }
    ]

    for (const red of redesSociales) {
      await prisma.redSocial.upsert({
        where: { nombre: red.nombre },
        update: red,
        create: red
      })
    }
    console.log(`✅ ${redesSociales.length} redes sociales agregadas/actualizadas`)

    // 3. Agregar configuración del sitio
    const configuraciones = [
      { clave: 'nombre_sitio', valor: 'RifaVen - Sorteos Premium', tipo: 'text' },
      { clave: 'descripcion_sitio', valor: 'La plataforma de sorteos más confiable de Venezuela', tipo: 'text' },
      { clave: 'telefono_contacto', valor: '+58 414-SORTEOS', tipo: 'text' },
      { clave: 'email_contacto', valor: 'info@rifaven.com', tipo: 'text' },
      { clave: 'direccion', valor: 'Caracas, Venezuela', tipo: 'text' },
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
    console.log(`✅ ${configuraciones.length} configuraciones del sitio agregadas`)

    // 4. Agregar algunas notificaciones de prueba
    const notificaciones = [
      {
        tipo: 'SUCCESS',
        titulo: 'Nueva venta realizada',
        mensaje: 'Se ha vendido el ticket #0001 de la rifa iPhone 15 Pro Max',
        paraAdministradores: true
      },
      {
        tipo: 'INFO',
        titulo: 'Nuevo participante registrado',
        mensaje: 'Cliente 1 se ha registrado en el sistema',
        paraAdministradores: true
      },
      {
        tipo: 'WARNING',
        titulo: 'Tickets reservados por vencer',
        mensaje: 'Hay 5 tickets reservados que vencen en 30 minutos',
        paraAdministradores: true
      }
    ]

    for (const notif of notificaciones) {
      await prisma.notificacion.create({
        data: notif
      })
    }
    console.log(`✅ ${notificaciones.length} notificaciones de prueba creadas`)

    console.log('\n🎉 ¡Configuración y métodos de pago agregados!')
    console.log('\n📊 Resumen adicional:')
    console.log(`- ${metodosPago.length} Métodos de pago`)
    console.log(`- ${redesSociales.length} Redes sociales`)
    console.log(`- ${configuraciones.length} Configuraciones`)
    console.log(`- ${notificaciones.length} Notificaciones`)

  } catch (error) {
    console.error('❌ Error:', error)
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
