import { createAdminClient } from '@/utils/supabase/admin'

export default async function CoachesPage() {
  const supabase = createAdminClient()

  const { data: coaches } = await supabase
    .from('coach_profiles')
    .select(`
      user_id,
      status,
      specializations,
      session_type,
      city,
      experience_years,
      rejection_reason,
      created_at,
      profiles!inner(full_name, avatar_url, phone)
    `)
    .eq('status', 'pending')
    .order('created_at', { ascending: true })

  const pending = coaches ?? []

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Antrenör Başvuruları</h1>
        <p className="text-gray-400 mt-1">
          {pending.length} başvuru onay bekliyor
        </p>
      </div>

      {pending.length === 0 ? (
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-16 text-center">
          <p className="text-5xl mb-4">🎉</p>
          <p className="text-xl font-semibold text-white mb-2">
            Onay Bekleyen Başvuru Yok
          </p>
          <p className="text-gray-400">
            Tüm başvurular incelendi.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {pending.map((coach) => {
            const profile = Array.isArray(coach.profiles)
              ? coach.profiles[0]
              : coach.profiles as { full_name: string; avatar_url: string | null; phone: string | null }

            return (
              <a
                key={coach.user_id}
                href={`/dashboard/coaches/${coach.user_id}`}
                className="block bg-gray-900 rounded-2xl border border-gray-800 hover:border-secondary transition overflow-hidden"
              >
                <div className="p-6 flex items-center gap-5">
                  {/* Avatar */}
                  <div className="w-14 h-14 rounded-full bg-gray-700 flex items-center justify-center text-2xl overflow-hidden flex-shrink-0">
                    {profile?.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : '👤'}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-lg font-semibold text-white">
                        {profile?.full_name}
                      </h3>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-amber-900/40 text-amber-300 border border-amber-700">
                        ⏳ Onay Bekliyor
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-400">
                      {coach.city && <span>📍 {coach.city}</span>}
                      {coach.experience_years && (
                        <span>⭐ {coach.experience_years} yıl deneyim</span>
                      )}
                      {profile?.phone && <span>📞 {profile.phone}</span>}
                      <span>
                        📅 {new Date(coach.created_at).toLocaleDateString('tr-TR')}
                      </span>
                    </div>
                    {coach.specializations?.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {coach.specializations.slice(0, 4).map((s: string) => (
                          <span
                            key={s}
                            className="text-xs px-2 py-0.5 rounded-md bg-gray-800 text-gray-300 border border-gray-700"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Arrow */}
                  <span className="text-gray-500 text-xl flex-shrink-0">→</span>
                </div>
              </a>
            )
          })}
        </div>
      )}
    </div>
  )
}
