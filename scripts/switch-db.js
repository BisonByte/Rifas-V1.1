#!/usr/bin/env node

/**
 * Script para alternar automáticamente entre SQLite y PostgreSQL
 * Uso: node scripts/switch-db.js [sqlite|postgres]
 */

const fs = require('fs');
const path = require('path');

const SCHEMA_PATH = path.join(__dirname, '..', 'prisma', 'schema.prisma');
const ENV_LOCAL_PATH = path.join(__dirname, '..', '.env.local');
const ENV_EXAMPLE_PATH = path.join(__dirname, '..', '.env.example');

// Configuraciones predefinidas
const DB_CONFIGS = {
  sqlite: {
    provider: 'sqlite',
    url: 'file:./dev.db',
    description: 'SQLite (desarrollo local)'
  },
  postgres: {
    provider: 'postgresql',
    url: 'postgresql://rifas_user:rifas_password_2024@localhost:5432/sistema_rifas?schema=public',
    description: 'PostgreSQL (producción/desarrollo con PostgreSQL)'
  }
};

function updateSchema(dbType) {
  try {
    let schema = fs.readFileSync(SCHEMA_PATH, 'utf8');
    
    // Reemplazar la línea del provider en datasource db
    schema = schema.replace(
      /(datasource\s+db\s*{[^}]*provider\s*=\s*)"[^"]+"/s,
      `$1"${DB_CONFIGS[dbType].provider}"`
    );
    
    fs.writeFileSync(SCHEMA_PATH, schema);
    console.log(`✅ Schema actualizado a ${DB_CONFIGS[dbType].provider}`);
    return true;
  } catch (error) {
    console.error('❌ Error actualizando schema:', error.message);
    return false;
  }
}

function updateEnvFile(dbType) {
  try {
    const envPath = fs.existsSync(ENV_LOCAL_PATH) ? ENV_LOCAL_PATH : ENV_EXAMPLE_PATH;
    let envContent = fs.readFileSync(envPath, 'utf8');
    
    // Reemplazar la línea de DATABASE_URL
    envContent = envContent.replace(
      /DATABASE_URL\s*=\s*"[^"]+"/,
      `DATABASE_URL="${DB_CONFIGS[dbType].url}"`
    );
    
    // Si estamos trabajando con .env.example, crear .env.local
    if (envPath === ENV_EXAMPLE_PATH) {
      fs.writeFileSync(ENV_LOCAL_PATH, envContent);
      console.log(`✅ Archivo .env.local creado con configuración ${dbType}`);
    } else {
      fs.writeFileSync(ENV_LOCAL_PATH, envContent);
      console.log(`✅ Archivo .env.local actualizado para ${dbType}`);
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error actualizando archivo .env:', error.message);
    return false;
  }
}

function showCurrentConfig() {
  try {
    const schema = fs.readFileSync(SCHEMA_PATH, 'utf8');
    const envPath = fs.existsSync(ENV_LOCAL_PATH) ? ENV_LOCAL_PATH : ENV_EXAMPLE_PATH;
    const env = fs.readFileSync(envPath, 'utf8');
    
    // Buscar provider en la sección datasource db
    const datasourceMatch = schema.match(/datasource\s+db\s*{[^}]*provider\s*=\s*"([^"]+)"/s);
    const urlMatch = env.match(/DATABASE_URL\s*=\s*"([^"]+)"/);
    
    console.log('\n📋 Configuración actual:');
    console.log(`   Provider: ${datasourceMatch ? datasourceMatch[1] : 'No encontrado'}`);
    console.log(`   URL: ${urlMatch ? urlMatch[1] : 'No encontrada'}`);
    console.log(`   Archivo: ${path.basename(envPath)}`);
  } catch (error) {
    console.error('❌ Error leyendo configuración:', error.message);
  }
}

function showHelp() {
  console.log(`
🔄 Script de Alternancia de Base de Datos

Uso: node scripts/switch-db.js [comando]

Comandos:
  sqlite    - Cambiar a SQLite (desarrollo)
  postgres  - Cambiar a PostgreSQL (producción)
  status    - Mostrar configuración actual
  help      - Mostrar esta ayuda

Ejemplos:
  node scripts/switch-db.js sqlite
  node scripts/switch-db.js postgres
  node scripts/switch-db.js status

⚠️  Nota: Después de cambiar, ejecuta 'npx prisma generate' para actualizar el cliente.
`);
}

// Función principal
function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  console.log('🔄 Sistema de Alternancia de Base de Datos\n');

  if (!command || command === 'help') {
    showHelp();
    return;
  }

  if (command === 'status') {
    showCurrentConfig();
    return;
  }

  if (!DB_CONFIGS[command]) {
    console.error(`❌ Comando inválido: ${command}`);
    console.log('   Comandos válidos: sqlite, postgres, status, help');
    process.exit(1);
  }

  const dbType = command;
  console.log(`🎯 Cambiando a ${DB_CONFIGS[dbType].description}...`);
  
  const schemaUpdated = updateSchema(dbType);
  const envUpdated = updateEnvFile(dbType);
  
  if (schemaUpdated && envUpdated) {
    console.log(`\n✅ ¡Cambio completado exitosamente!`);
    console.log(`\n📋 Nueva configuración:`);
    console.log(`   Base de datos: ${DB_CONFIGS[dbType].description}`);
    console.log(`   Provider: ${DB_CONFIGS[dbType].provider}`);
    console.log(`   URL: ${DB_CONFIGS[dbType].url}`);
    
    console.log(`\n🔧 Próximos pasos:`);
    console.log(`   1. npx prisma generate`);
    if (dbType === 'postgres') {
      console.log(`   2. npx prisma db push  # (para crear estructura en PostgreSQL)`);
      console.log(`   3. npm run db:migrate-data  # (opcional: migrar datos desde SQLite)`);
    } else {
      console.log(`   2. npx prisma db push  # (para crear estructura en SQLite)`);
    }
    console.log(`   4. npm run dev`);
  } else {
    console.log(`\n❌ Error durante el cambio. Revisa los mensajes anteriores.`);
    process.exit(1);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  main();
}

module.exports = { updateSchema, updateEnvFile, showCurrentConfig };
