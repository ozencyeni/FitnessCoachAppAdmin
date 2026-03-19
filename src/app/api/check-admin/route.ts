import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/utils/supabase/admin'

// JWT payload'ını library olmadan decode et
function decodeJWT(token: string): { sub?: string } {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const json = Buffer.from(base64, 'base64').toString('utf8')
    return JSON.parse(json)
  } catch {
    return {}
  }
}

export async function POST(request: NextRequest) {
  try {
    const { accessToken } = await request.json()

    if (!accessToken) {
      return NextResponse.json({ isAdmin: false, error: 'No token' })
    }

    // Token'dan user ID al
    const payload = decodeJWT(accessToken)
    const userId = payload.sub

    if (!userId) {
      return NextResponse.json({ isAdmin: false, error: 'Invalid token payload' })
    }

    // Service role ile profil sorgula (RLS bypass)
    const supabase = createAdminClient()
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single()

    if (error) {
      return NextResponse.json({ isAdmin: false, error: error.message, userId })
    }

    return NextResponse.json({
      isAdmin: profile?.role === 'admin',
      role: profile?.role,
      userId,
    })
  } catch (err) {
    return NextResponse.json({ isAdmin: false, error: String(err) })
  }
}
