'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError || !data.user) {
      setError('E-posta veya şifre hatalı.')
      setLoading(false)
      return
    }

    // Admin kontrolü
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single()

    if (profile?.role !== 'admin') {
      await supabase.auth.signOut()
      setError('Bu hesabın admin yetkisi yok.')
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-secondary mb-4">
            <span className="text-3xl">🏋️</span>
          </div>
          <h1 className="text-2xl font-bold text-white">FitnessCoach Admin</h1>
          <p className="text-gray-400 mt-1 text-sm">Yönetici paneline giriş yap</p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleLogin}
          className="bg-gray-900 rounded-2xl p-8 shadow-xl border border-gray-800 space-y-5"
        >
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              E-posta
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              required
              className="w-full px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Şifre
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition"
            />
          </div>

          {error && (
            <div className="bg-red-900/30 border border-red-700 text-red-300 text-sm px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-secondary hover:bg-accent text-white font-semibold transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
          </button>
        </form>
      </div>
    </div>
  )
}
