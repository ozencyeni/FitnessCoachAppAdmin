import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { createServerClient } from '@supabase/ssr'

export async function POST(request: NextRequest) {
  try {
    // Request body'den access token al
    const { accessToken } = await request.json()

    if (!accessToken) {
      return NextResponse.json({ isAdmin: false, error: 'No token' }, { status: 401 })
    }

    // Service role client ile kullanıcıyı doğrula
    const adminClient = createAdminClient()

    // Token'dan user bilgisini al
    const { data: { user }, error: userError } = await adminClient.auth.getUser(accessToken)

    if (userError || !user) {
      return NextResponse.json({ isAdmin: false, error: 'Invalid token' }, { status: 401 })
    }

    // Service role ile profiles sorgula (RLS bypass)
    const { data: profile, error: profileError } = await adminClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError) {
      return NextResponse.json({ isAdmin: false, error: profileError.message, userId: user.id }, { status: 200 })
    }

    return NextResponse.json({
      isAdmin: profile?.role === 'admin',
      role: profile?.role,
      userId: user.id,
    })
  } catch (err) {
    return NextResponse.json({ isAdmin: false, error: String(err) }, { status: 500 })
  }
}
