import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
  const cookie = cookies().get('setup-state')
  const data = cookie ? JSON.parse(cookie.value) : {}
  return NextResponse.json(data)
}
