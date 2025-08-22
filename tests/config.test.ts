import test from 'node:test'
import assert from 'node:assert/strict'
import { initConfig, getConfigValue } from '../src/lib/config'

// Ensure getConfigValue fetches values from DB and picks up updates

void test('getConfigValue reads latest values from DB', async () => {
  const results = [{ clave: 'SMTP_HOST', valor: 'smtp.initial.com' }]
  const prismaMock = {
    configuracionSitio: {
      findMany: async () => results,
    },
  }

  await initConfig(prismaMock)
  const first = await getConfigValue('SMTP_HOST')
  assert.equal(first, 'smtp.initial.com')

  // simulate DB update and reload config
  results[0].valor = 'smtp.updated.com'
  await initConfig(prismaMock)
  const second = await getConfigValue('SMTP_HOST')
  assert.equal(second, 'smtp.updated.com')
})
