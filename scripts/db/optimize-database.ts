import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Script de mantenimiento y optimización para PostgreSQL
 * - Analiza el rendimiento de la base de datos
 * - Ejecuta tareas de mantenimiento
 * - Genera estadísticas de uso
 */
async function optimizeDatabase() {
  console.log('🔧 Iniciando optimización de la base de datos...');

  try {
    // 1. Ejecutar ANALYZE para actualizar estadísticas
    console.log('📊 Actualizando estadísticas de la base de datos...');
    await prisma.$executeRaw`ANALYZE;`;
    console.log('✅ Estadísticas actualizadas');

    // 2. Verificar índices más utilizados
    console.log('🔍 Analizando uso de índices...');
    const indexStats = await prisma.$queryRaw`
      SELECT 
        schemaname,
        tablename,
        indexname,
        idx_tup_read,
        idx_tup_fetch
      FROM pg_stat_user_indexes 
      WHERE idx_tup_read > 0
      ORDER BY idx_tup_read DESC;
    ` as any[];

    console.log('📈 Top 10 índices más utilizados:');
    indexStats.slice(0, 10).forEach((stat, i) => {
      console.log(`  ${i + 1}. ${stat.tablename}.${stat.indexname} - Lecturas: ${stat.idx_tup_read}`);
    });

    // 3. Verificar tamaños de tablas
    console.log('\n💾 Analizando tamaño de tablas...');
    const tableSizes = await prisma.$queryRaw`
      SELECT 
        schemaname,
        tablename,
        pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
      FROM pg_tables 
      WHERE schemaname NOT IN ('information_schema', 'pg_catalog')
      ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
    ` as any[];

    console.log('📊 Tamaño de tablas:');
    tableSizes.forEach((table, i) => {
      console.log(`  ${i + 1}. ${table.tablename}: ${table.size}`);
    });

    // 4. Limpiar registros antiguos (si aplica)
    console.log('\n🧹 Limpiando registros antiguos...');
    
    // Limpiar notificaciones leídas más antiguas de 30 días
    const deletedNotifications = await prisma.notificacion.deleteMany({
      where: {
        leida: true,
        createdAt: {
          lte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        }
      }
    });
    console.log(`  📧 Notificaciones eliminadas: ${deletedNotifications.count}`);

    // Limpiar logs de auditoría más antiguos de 90 días
    const deletedLogs = await prisma.auditLog.deleteMany({
      where: {
        timestamp: {
          lte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
        }
      }
    });
    console.log(`  📝 Logs de auditoría eliminados: ${deletedLogs.count}`);

    // 5. Estadísticas generales
    console.log('\n📈 Estadísticas generales del sistema:');
    
    const stats = await Promise.all([
      prisma.rifa.count(),
      prisma.ticket.count(),
      prisma.participante.count(),
      prisma.compra.count(),
      prisma.usuario.count(),
    ]);

    console.log(`  🎲 Total rifas: ${stats[0]}`);
    console.log(`  🎫 Total tickets: ${stats[1]}`);
    console.log(`  👥 Total participantes: ${stats[2]}`);
    console.log(`  💳 Total compras: ${stats[3]}`);
    console.log(`  👨‍💼 Total usuarios: ${stats[4]}`);

    // 6. Verificar tickets vencidos
    const expiredTickets = await prisma.ticket.count({
      where: {
        estado: 'RESERVADO',
        fechaVencimiento: {
          lte: new Date()
        }
      }
    });

    if (expiredTickets > 0) {
      console.log(`⚠️  Tickets reservados vencidos encontrados: ${expiredTickets}`);
      console.log('   Ejecutar script de limpieza de reservas vencidas');
    }

    // 7. Verificar conexiones activas
    console.log('\n🔌 Verificando conexiones de base de datos...');
    const connections = await prisma.$queryRaw`
      SELECT count(*) as active_connections
      FROM pg_stat_activity 
      WHERE state = 'active';
    ` as any[];

    console.log(`  📡 Conexiones activas: ${connections[0]?.active_connections || 0}`);

    console.log('\n🎉 Optimización completada exitosamente!');

  } catch (error) {
    console.error('❌ Error durante la optimización:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Script para limpiar reservas vencidas
async function cleanExpiredReservations() {
  console.log('🧹 Limpiando reservas vencidas...');
  
  const result = await prisma.ticket.updateMany({
    where: {
      estado: 'RESERVADO',
      fechaVencimiento: {
        lte: new Date()
      }
    },
    data: {
      estado: 'DISPONIBLE',
      participanteId: null,
      compraId: null,
      fechaReserva: null,
      fechaVencimiento: null
    }
  });

  console.log(`✅ ${result.count} tickets liberados de reservas vencidas`);
  return result.count;
}

// Ejecutar script
if (require.main === module) {
  const command = process.argv[2];
  
  if (command === 'clean-expired') {
    cleanExpiredReservations()
      .then((count) => {
        console.log(`✅ Limpieza completada: ${count} tickets liberados`);
        process.exit(0);
      })
      .catch((error) => {
        console.error('❌ Error en la limpieza:', error);
        process.exit(1);
      });
  } else {
    optimizeDatabase()
      .then(() => {
        console.log('✅ Optimización completada exitosamente');
        process.exit(0);
      })
      .catch((error) => {
        console.error('❌ Error en la optimización:', error);
        process.exit(1);
      });
  }
}

export { optimizeDatabase, cleanExpiredReservations };
