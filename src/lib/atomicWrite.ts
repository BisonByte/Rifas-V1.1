import { promises as fs } from 'fs'

export async function atomicWrite(path: string, content: string) {
  const tempPath = `${path}.${Date.now()}.tmp`
  await fs.writeFile(tempPath, content, 'utf8')
  await fs.rename(tempPath, path)
}
