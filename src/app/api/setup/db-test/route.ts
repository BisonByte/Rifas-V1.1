import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const _config = await req.json()
    // Aquí se probaría la conexión real a la base de datos
    return NextResponse.json({ ok: true })
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 400 })
  }
}
