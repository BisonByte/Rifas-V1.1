import { appendFile, mkdir, writeFile } from 'fs/promises';
import path from 'path';

const routes = ['/api/rifas', '/api/admin/dashboard'];
const baseUrl = process.env.CHECK_BASE_URL || 'http://localhost:3000';

const logDir = path.join(process.cwd(), 'logs');
const logFile = path.join(logDir, 'conexion.log');

async function log(message: string) {
  await appendFile(logFile, message + '\n');
}

async function checkRoute(route: string) {
  const url = `${baseUrl}${route}`;
  try {
    const res = await fetch(url);
    await log(`${new Date().toISOString()} ${route} ${res.status}`);
  } catch (err) {
    await log(`${new Date().toISOString()} ${route} ERROR ${(err as Error).message}`);
  }
}

async function main() {
  await mkdir(logDir, { recursive: true });
  await writeFile(logFile, `\n=== Comprobación ${new Date().toISOString()} ===\n`, { flag: 'a' });
  for (const route of routes) {
    await checkRoute(route);
  }
  console.log(`Resultados guardados en ${logFile}`);
}

main();
