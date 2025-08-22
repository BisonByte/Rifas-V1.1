import { sanitizeHtml } from '../src/lib/sanitize'
import test from 'node:test'
import assert from 'node:assert'

test('removes script tags', () => {
  const dirty = '<p>hola</p><script>alert(1)</script>'
  const clean = sanitizeHtml(dirty)
  assert(!clean.includes('<script'))
})

test('removes dangerous attributes', () => {
  const dirty = '<img src="x" onerror="alert(1)" />'
  const clean = sanitizeHtml(dirty)
  assert(!/onerror/i.test(clean))
})
