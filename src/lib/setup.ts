import { PrismaClient } from '@prisma/client'

export async function testDatabaseConnection(url: string) {
  const client = new PrismaClient({ datasourceUrl: url })
  try {
    await client.$connect()
    await client.$queryRaw`SELECT 1`
  } finally {
    await client.$disconnect()
  }
}

