import { PrismaClient } from '@prisma/client';
import bcryptjs from 'bcryptjs';

const prisma = new PrismaClient();

/**
 * Script para inicializar la base de datos en producción
 * - Crea usuarios administradores
 * - Configura cuentas bancarias
 * - Optimiza la base de datos
 */
async function initProductionDatabase() {
  console.log('🚀 Inicializando base de datos de producción...');

  try {
    // 1. Crear usuarios administradores
    console.log('👥 Creando usuarios administradores...');
    
    const adminPassword = await bcryptjs.hash('Admin2024!', 12);
    const vendedorPassword = await bcryptjs.hash('Vendedor2024!', 12);

    const adminUser = await prisma.usuario.upsert({
      where: { email: 'admin@sistemrifas.com' },
      update: {},
      create: {
        nombre: 'Administrador Principal',
        email: 'admin@sistemrifas.com',
        celular: '+34600000000',
        password: adminPassword,
        rol: 'ADMINISTRADOR',
        activo: true
      }
    });

    const vendedorUser = await prisma.usuario.upsert({
      where: { email: 'vendedor@sistemrifas.com' },
      update: {},
      create: {
        nombre: 'Vendedor Demo',
        email: 'vendedor@sistemrifas.com',
        celular: '+34600000001',
        password: vendedorPassword,
        rol: 'VENDEDOR',
        activo: true
      }
    });

    console.log(`✅ Usuario admin creado: ${adminUser.email}`);
    console.log(`✅ Usuario vendedor creado: ${vendedorUser.email}`);

    // 2. Crear cuentas bancarias de ejemplo
    console.log('🏦 Configurando cuentas bancarias...');

    const cuentasSample = [
      {
        banco: 'BBVA',
        titular: 'Sistema de Rifas S.L.',
        numero: 'ES21 0182 0000 0000 0000 0000',
        tipoCuenta: 'Corriente',
        logo: '/images/bancos/bbva.png',
        instrucciones: 'Transferir a esta cuenta y enviar comprobante',
        activa: true,
        orden: 1
      },
      {
        banco: 'Santander',
        titular: 'Sistema de Rifas S.L.',
        numero: 'ES91 0049 0000 0000 0000 0000',
        tipoCuenta: 'Corriente',
        logo: '/images/bancos/santander.png',
        instrucciones: 'Incluir número de rifa y nombre en el concepto',
        activa: true,
        orden: 2
      }
    ];

    for (const cuenta of cuentasSample) {
      await prisma.cuentaBancaria.upsert({
        where: { numero: cuenta.numero },
        update: cuenta,
        create: cuenta
      });
    }

    console.log('✅ Cuentas bancarias configuradas');

    // 3. Configurar settings del sistema
    console.log('⚙️  Configurando settings del sistema...');

    const settings = [
      {
        clave: 'SISTEMA_NOMBRE',
        valor: 'Sistema de Rifas',
        descripcion: 'Nombre del sistema'
      },
      {
        clave: 'TIEMPO_RESERVA_DEFAULT',
        valor: '30',
        descripcion: 'Tiempo de reserva por defecto en minutos'
      },
      {
        clave: 'MAX_NUMEROS_POR_PERSONA',
        valor: '10',
        descripcion: 'Máximo número de tickets por persona'
      },
      {
        clave: 'MONEDA_DEFAULT',
        valor: 'EUR',
        descripcion: 'Moneda por defecto'
      },
      {
        clave: 'ZONA_HORARIA_DEFAULT',
        valor: 'Europe/Madrid',
        descripcion: 'Zona horaria por defecto'
      }
    ];

    for (const setting of settings) {
      await prisma.configuracion.upsert({
        where: { clave: setting.clave },
        update: { valor: setting.valor, descripcion: setting.descripcion },
        create: setting
      });
    }

    console.log('✅ Settings configurados');

    // 4. Crear rifa de ejemplo (opcional)
    if (process.env.CREATE_SAMPLE_RIFA === 'true') {
      console.log('🎲 Creando rifa de ejemplo...');
      
      const sampleRifa = await prisma.rifa.create({
        data: {
          nombre: 'Rifa de Prueba',
          descripcion: 'Esta es una rifa de ejemplo para probar el sistema',
          fechaSorteo: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 días
          precioPorBoleto: 10.00,
          totalBoletos: 100,
          limitePorPersona: 5,
          estado: 'ACTIVA',
          premios: {
            create: [
              {
                titulo: 'Premio Principal',
                descripcion: 'El gran premio de esta rifa',
                cantidad: 1,
                orden: 1
              }
            ]
          }
        }
      });

      // Crear tickets para la rifa
      const tickets = Array.from({ length: 100 }, (_, i) => ({
        numero: i + 1,
        rifaId: sampleRifa.id,
        estado: 'DISPONIBLE' as const
      }));

      await prisma.ticket.createMany({
        data: tickets
      });

      console.log(`✅ Rifa de ejemplo creada: ${sampleRifa.id}`);
    }

    console.log('\n🎉 Base de datos inicializada correctamente para producción!');
    console.log('\n📋 Credenciales de acceso:');
    console.log('  Admin: admin@sistemrifas.com / Admin2024!');
    console.log('  Vendedor: vendedor@sistemrifas.com / Vendedor2024!');
    console.log('\n⚠️  IMPORTANTE: Cambiar estas credenciales después del primer login');

  } catch (error) {
    console.error('❌ Error inicializando base de datos:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar script
if (require.main === module) {
  initProductionDatabase()
    .then(() => {
      console.log('✅ Script completado exitosamente');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error en el script:', error);
      process.exit(1);
    });
}

export default initProductionDatabase;
