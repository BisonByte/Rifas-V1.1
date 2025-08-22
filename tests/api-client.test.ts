import test from 'node:test'
import assert from 'node:assert/strict'
import { get } from '../src/lib/api-client'

test('request includes credentials by default', async () => {
  const originalFetch = global.fetch
  let received: RequestInit | undefined
  ;(global as any).fetch = async (_: RequestInfo, init?: RequestInit) => {
    received = init
    return new Response('{}', {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  }
  try {
    await get('/test')
    assert.equal(received?.credentials, 'include')
  } finally {
    ;(global as any).fetch = originalFetch
  }
})

test('request allows overriding credentials', async () => {
  const originalFetch = global.fetch
  let received: RequestInit | undefined
  ;(global as any).fetch = async (_: RequestInfo, init?: RequestInit) => {
    received = init
    return new Response('{}', {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  }
  try {
    await get('/test', { credentials: 'omit' })
    assert.equal(received?.credentials, 'omit')
  } finally {
    ;(global as any).fetch = originalFetch
  }
})
