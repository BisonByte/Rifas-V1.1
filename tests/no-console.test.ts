import test from 'node:test'
import assert from 'node:assert'
import { promises as fs } from 'node:fs'
import path from 'node:path'

async function getFiles(dir: string): Promise<string[]> {
  const dirents = await fs.readdir(dir, { withFileTypes: true })
  const files: string[] = []
  for (const dirent of dirents) {
    const res = path.join(dir, dirent.name)
    if (dirent.isDirectory()) {
      files.push(...(await getFiles(res)))
    } else if (dirent.isFile() && /\.(ts|tsx|js)$/.test(dirent.name)) {
      files.push(res)
    }
  }
  return files
}

test('no console.log in production code', async () => {
  const srcDir = path.join(process.cwd(), 'src')
  const files = await getFiles(srcDir)
  const offenders: string[] = []
  for (const file of files) {
    const content = await fs.readFile(file, 'utf8')
    if (/console\.log\(/.test(content)) {
      offenders.push(path.relative(srcDir, file))
    }
  }
  assert.strictEqual(offenders.length, 0, `console.log found in: ${offenders.join(', ')}`)
})
