import { NextRequest, NextResponse } from 'next/server'
import { GET as getRifas } from '../../rifas/route'
import { requireAuth, isAdmin } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const user = await requireAuth(request)
  if (!user || !isAdmin(user)) {
    return NextResponse.json(
      { success: false, error: 'Acceso denegado' },
      { status: 403 }
    )
  }

  return getRifas(request)
}
