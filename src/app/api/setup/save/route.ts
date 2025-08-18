import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const partial = await req.json()
  const cookie = cookies().get('setup-state')
  const current = cookie ? JSON.parse(cookie.value) : {}
  const updated = { ...current, ...partial }
  cookies().set('setup-state', JSON.stringify(updated), { httpOnly: true })
  return NextResponse.json({ ok: true })
}
