import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST() {
  const cookie = cookies().get('setup-state')
  const _data = cookie ? JSON.parse(cookie.value) : {}
  // Aquí se aplicaría la configuración usando _data
  cookies().delete('setup-state')
  return NextResponse.json({ ok: true })
}
