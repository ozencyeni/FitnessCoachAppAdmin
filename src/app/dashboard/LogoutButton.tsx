'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

export default function LogoutButton() {
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <button
      onClick={handleLogout}
      className="w-full px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-gray-800 rounded-xl transition text-left"
    >
      🚪 Çıkış Yap
    </button>
  )
}
