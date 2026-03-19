import { createAdminClient } from '@/utils/supabase/admin'
import CoachActions from './CoachActions'

const statusLabels: Record<string, { label: string; cls: string }> = {
  pending: { label: '⏳ Onay Bekliyor', cls: 'bg-amber-900/40 text-amber-300 border-amber-700' },
  active: { label: '✓ Aktif', cls: 'bg-green-900/40 text-green-300 border-green-700' },
  rejected: { label: '✗ Reddedildi', cls: 'bg-red-900/40 text-red-300 border-red-700' },
}

export default async function AllCoachesPage() {
  const supabase = createAdminClient()

  const { data: coaches } = await supabase
    .from('coach_profiles')
    .select(`
      user_id,
      status,
      city,
      experience_years,
      specializations,
      created_at,
      profiles!inner(full_name, avatar_url, phone)
    `)
    .order('created_at', { ascending: false })

  // Auth kullanıcılarını al (email ve ban durumu için)
  const { data: authData } = await supabase.auth.admin.listUsers({ perPage: 1000 })
  const authUsers = authData?.users ?? []
  const bannedIds = new Set(
    authUsers
      .filter((u) => u.banned_until && new Date(u.banned_until) > new Date())
      .map((u) => u.id)
  )
  const emailMap = new Map(authUsers.map((u) => [u.id, u.email]))

  const list = coaches ?? []

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Antrenörler</h1>
        <p className="text-gray-400 mt-1">{list.length} antrenör kayıtlı</p>
      </div>

      {list.length === 0 ? (
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-16 text-center">
          <p className="text-5xl mb-4">🧑‍🏫</p>
          <p className="text-xl font-semibold text-white mb-2">Henüz Antrenör Yok</p>
          <p className="text-gray-400">Uygulamadan başvuran antrenörler burada görünecek.</p>
        </div>
      ) : (
        <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Antrenör</th>
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">İletişim</th>
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Konum / Deneyim</th>
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Durum</th>
                <th className="text-right px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {list.map((coach) => {
                const profile = Array.isArray(coach.profiles)
                  ? coach.profiles[0]
                  : coach.profiles as { full_name: string; avatar_url: string | null; phone: string | null }
                const isBanned = bannedIds.has(coach.user_id)
                const statusInfo = statusLabels[coach.status] ?? { label: coach.status, cls: 'bg-gray-800 text-gray-300 border-gray-700' }

                return (
                  <tr key={coach.user_id} className="hover:bg-gray-800/50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-lg overflow-hidden flex-shrink-0">
                          {profile?.avatar_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                          ) : '👤'}
                        </div>
                        <div>
                          <p className="text-white font-medium text-sm">{profile?.full_name ?? '—'}</p>
                          <p className="text-gray-500 text-xs font-mono">{coach.user_id.slice(0, 8)}…</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-300 text-sm">{emailMap.get(coach.user_id) ?? '—'}</p>
                      {profile?.phone && (
                        <p className="text-gray-500 text-xs">{profile.phone}</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-300 text-sm">{coach.city ?? '—'}</p>
                      {coach.experience_years && (
                        <p className="text-gray-500 text-xs">{coach.experience_years} yıl deneyim</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className={`text-xs px-2 py-1 rounded-full border w-fit ${statusInfo.cls}`}>
                          {statusInfo.label}
                        </span>
                        {isBanned && (
                          <span className="text-xs px-2 py-1 rounded-full bg-red-900/40 text-red-300 border border-red-700 w-fit">
                            🚫 Banlı
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end">
                        <CoachActions userId={coach.user_id} isBanned={isBanned} />
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
