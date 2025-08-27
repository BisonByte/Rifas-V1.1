import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function seedConfiguration() {
  try {
    console.log('🌱 Poblando configuraciones iniciales...')

    // Migrar clave antigua "sitio_logo" a "logo_url" si existe
    const oldLogo = await prisma.configuracionSitio.findUnique({
      where: { clave: 'sitio_logo' }
    })

    if (oldLogo) {
      await prisma.configuracionSitio.upsert({
        where: { clave: 'logo_url' },
        update: { valor: oldLogo.valor, tipo: oldLogo.tipo },
        create: { clave: 'logo_url', valor: oldLogo.valor, tipo: oldLogo.tipo }
      })

      await prisma.configuracionSitio.delete({
        where: { clave: 'sitio_logo' }
      })
    }

    // Configuraciones del sitio
    const configuraciones = [
      {
        clave: 'sitio_titulo',
        valor: 'SUPER GANA',
        tipo: 'text'
      },
      {
        clave: 'sitio_subtitulo',
        valor: 'Sistema de Rifas',
        tipo: 'text'
      },
      {
        clave: 'logo_url',
        valor: '/logo.png',
        tipo: 'image'
      },
      {
        clave: 'hero_titulo',
        valor: '1000 Bs.',
        tipo: 'text'
      },
      {
        clave: 'hero_subtitulo',
        valor: 'X 40 Bs.',
        tipo: 'text'
      },
      {
        clave: 'hero_descripcion',
        valor: 'TOP 1 150 Bs. GANA CON JESÚS',
        tipo: 'text'
      },
      {
        clave: 'hero_imagen',
        valor: '/hero-bg.jpg',
        tipo: 'image'
      },
      {
        clave: 'colores_primario',
        valor: '#DC2626',
        tipo: 'text'
      },
      {
        clave: 'colores_secundario',
        valor: '#FEF3C7',
        tipo: 'text'
      },
      {
        clave: 'contacto_whatsapp',
        valor: '+584244561308',
        tipo: 'text'
      },
      {
        clave: 'footer_texto_legal',
        valor: 'Sistema Web Especializado en Rifas',
        tipo: 'text'
      },
      {
        clave: 'footer_derechos',
        valor: '© 2025 BY JUEGA CON FE & DICRÉTALO 💎 s. Todos los derechos reservados.',
        tipo: 'text'
      }
    ]

    for (const config of configuraciones) {
      await prisma.configuracionSitio.upsert({
        where: { clave: config.clave },
        update: { valor: config.valor, tipo: config.tipo },
        create: config
      })
    }

    // Métodos de pago iniciales
    const metodosPago = [
      {
        nombre: 'BANCO NACIONAL DE CRÉDITO',
        tipo: 'banco',
        descripcion: 'Transferencia bancaria',
        numeroCuenta: '0191-0000-00-0000000000',
        tipoCuenta: 'Corriente',
        cedula: 'V-12345678',
        activo: true,
        orden: 1
      },
      {
        nombre: 'Pago Móvil',
        tipo: 'pago_movil',
        descripcion: 'Pago móvil interbancario',
        telefono: '04244561308',
        cedula: 'V-12345678',
        activo: true,
        orden: 2
      }
    ]

    for (const metodo of metodosPago) {
      await prisma.metodoPago.upsert({
        where: { nombre: metodo.nombre },
        update: metodo,
        create: metodo
      })
    }

    // Redes sociales iniciales
    const redesSociales = [
      {
        nombre: 'Instagram',
        url: 'https://instagram.com/@ganaconjesus',
        icono: 'instagram',
        activo: true,
        orden: 1
      },
      {
        nombre: 'WhatsApp',
        url: 'https://wa.me/584244561308',
        icono: 'whatsapp',
        activo: true,
        orden: 2
      },
      {
        nombre: 'TikTok',
        url: 'https://tiktok.com/@ganaconjesus',
        icono: 'tiktok',
        activo: true,
        orden: 3
      }
    ]

    for (const red of redesSociales) {
      await prisma.redSocial.upsert({
        where: { nombre: red.nombre },
        update: red,
        create: red
      })
    }

    console.log('✅ Configuraciones iniciales pobladas exitosamente')

  } catch (error) {
    console.error('❌ Error poblando configuraciones:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

if (require.main === module) {
  seedConfiguration()
    .then(() => {
      console.log('🎉 ¡Seed completado!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('💥 Error en el seed:', error)
      process.exit(1)
    })
}

export default seedConfiguration
