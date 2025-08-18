const { execFileSync } = require('child_process');
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Path to the SQLite database; default to dev.db in repo root
const sqlitePath = process.env.SQLITE_DB_PATH || path.join(__dirname, '..', 'dev.db');

if (!fs.existsSync(sqlitePath)) {
  console.log(`No SQLite database found at ${sqlitePath}. Nothing to migrate.`);
  process.exit(0);
}

const prisma = new PrismaClient();

function runSqlite(sql) {
  const output = execFileSync('sqlite3', ['-json', sqlitePath, sql], { encoding: 'utf8' }).trim();
  return output ? JSON.parse(output) : [];
}

async function migrate() {
  const tables = runSqlite(
    "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_prisma_migrations';"
  ).map(t => t.name);

  if (tables.length === 0) {
    console.log('No tables found in SQLite database. Exiting.');
    return;
  }

  try {
    await prisma.$transaction(async (tx) => {
      // Disable triggers and constraints for faster import
      await tx.$executeRawUnsafe("SET session_replication_role = 'replica'");

      for (const table of tables) {
        const rows = runSqlite(`SELECT * FROM "${table}";`);
        for (const row of rows) {
          const columns = Object.keys(row).map(c => `"${c}"`).join(', ');
          const placeholders = Object.keys(row).map((_, i) => `$${i + 1}`).join(', ');
          const values = Object.values(row);
          await tx.$executeRawUnsafe(`INSERT INTO "${table}" (${columns}) VALUES (${placeholders})`, ...values);
        }

        // Verify integrity by comparing row counts
        const sqliteCount = runSqlite(`SELECT COUNT(*) AS count FROM "${table}";`)[0].count;
        const pgCountRes = await tx.$queryRawUnsafe(`SELECT COUNT(*)::int AS count FROM "${table}";`);
        const pgCount = pgCountRes[0].count;
        if (sqliteCount !== pgCount) {
          throw new Error(`Integrity check failed for ${table}: SQLite=${sqliteCount}, PostgreSQL=${pgCount}`);
        }
        console.log(`Migrated ${table}: ${pgCount} rows`);
      }

      await tx.$executeRawUnsafe("SET session_replication_role = 'origin'");
    });

    console.log('Migration completed successfully.');
  } catch (err) {
    console.error('Migration failed. PostgreSQL transaction rolled back.');
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

migrate();

