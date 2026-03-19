import { createAdminClient } from '@/utils/supabase/admin'

export default async function DashboardPage() {
  const supabase = createAdminClient()

  const [
    { count: pendingCount },
    { count: activeCount },
    { count: totalStudents },
  ] = await Promise.all([
    supabase
      .from('coach_profiles')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending'),
    supabase
      .from('coach_profiles')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active'),
    supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'student'),
  ])

  const stats = [
    {
      label: 'Onay Bekleyen',
      value: pendingCount ?? 0,
      icon: '⏳',
      color: 'bg-amber-900/30 border-amber-700',
      textColor: 'text-amber-400',
    },
    {
      label: 'Aktif Antrenör',
      value: activeCount ?? 0,
      icon: '✅',
      color: 'bg-green-900/30 border-green-700',
      textColor: 'text-green-400',
    },
    {
      label: 'Toplam Sporcu',
      value: totalStudents ?? 0,
      icon: '🏃',
      color: 'bg-blue-900/30 border-blue-700',
      textColor: 'text-blue-400',
    },
  ]

  // Son başvurular
  const { data: recentCoaches } = await supabase
    .from('coach_profiles')
    .select('user_id, created_at, status, profiles!inner(full_name, avatar_url)')
    .order('created_at', { ascending: false })
    .limit(5)

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Genel Bakış</h1>
        <p className="text-gray-400 mt-1">FitnessCoach yönetim paneline hoş geldiniz.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className={`rounded-2xl border p-6 ${stat.color}`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-3xl">{stat.icon}</span>
              <span className={`text-4xl font-bold ${stat.textColor}`}>
                {stat.value}
              </span>
            </div>
            <p className="text-gray-300 font-medium">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Son başvurular */}
      <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
          <h2 className="font-semibold text-white">Son Başvurular</h2>
          <a
            href="/dashboard/coaches"
            className="text-secondary text-sm hover:text-accent transition"
          >
            Tümünü Gör →
          </a>
        </div>

        <div className="divide-y divide-gray-800">
          {recentCoaches?.map((coach) => {
            const profile = Array.isArray(coach.profiles)
              ? coach.profiles[0]
              : coach.profiles as { full_name: string; avatar_url: string | null }

            return (
              <a
                key={coach.user_id}
                href={`/dashboard/coaches/${coach.user_id}`}
                className="flex items-center gap-4 px-6 py-4 hover:bg-gray-800 transition"
              >
                <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-lg overflow-hidden flex-shrink-0">
                  {profile?.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    '👤'
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium truncate">{profile?.full_name}</p>
                  <p className="text-gray-400 text-sm">
                    {new Date(coach.created_at).toLocaleDateString('tr-TR')}
                  </p>
                </div>
                <StatusBadge status={coach.status} />
              </a>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; class: string }> = {
    pending:  { label: 'Bekliyor',  class: 'bg-amber-900/40 text-amber-300 border-amber-700' },
    active:   { label: 'Aktif',     class: 'bg-green-900/40 text-green-300 border-green-700' },
    rejected: { label: 'Reddedildi', class: 'bg-red-900/40 text-red-300 border-red-700' },
  }
  const s = map[status] ?? { label: status, class: 'bg-gray-800 text-gray-300 border-gray-700' }
  return (
    <span className={`text-xs px-3 py-1 rounded-full border font-medium ${s.class}`}>
      {s.label}
    </span>
  )
}
