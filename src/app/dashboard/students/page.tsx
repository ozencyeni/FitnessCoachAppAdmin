import { createAdminClient } from '@/utils/supabase/admin'
import UserActions from './UserActions'
import VerifyButton from './VerifyButton'

export default async function StudentsPage() {
  const supabase = createAdminClient()

  const { data: students } = await supabase
    .from('profiles')
    .select('id, full_name, avatar_url, phone, created_at, is_verified, deletion_requested_at')
    .eq('role', 'student')
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

  const list = students ?? []
  const verifiedCount = list.filter((s) => s.is_verified).length

  return (
    <div className="p-8">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Sporcular</h1>
          <p className="text-gray-400 mt-1">
            {list.length} sporcu kayıtlı · {verifiedCount} onaylı
          </p>
        </div>
      </div>

      {list.length === 0 ? (
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-16 text-center">
          <p className="text-5xl mb-4">🏃</p>
          <p className="text-xl font-semibold text-white mb-2">Henüz Sporcu Yok</p>
          <p className="text-gray-400">Uygulama üzerinden kayıt olan sporcular burada görünecek.</p>
        </div>
      ) : (
        <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Sporcu</th>
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">İletişim</th>
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Kayıt Tarihi</th>
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Durum</th>
                <th className="text-right px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {list.map((student) => {
                const isBanned = bannedIds.has(student.id)
                const pendingDeletion = !!student.deletion_requested_at
                return (
                  <tr key={student.id} className={`hover:bg-gray-800/50 transition ${pendingDeletion ? 'opacity-60' : ''}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-lg overflow-hidden flex-shrink-0">
                          {student.avatar_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={student.avatar_url} alt="" className="w-full h-full object-cover" />
                          ) : '👤'}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <p className="text-white font-medium text-sm">{student.full_name ?? '—'}</p>
                            {student.is_verified && (
                              <span title="Onaylı Sporcu" className="text-purple-400 text-xs">✦</span>
                            )}
                          </div>
                          <p className="text-gray-500 text-xs font-mono">{student.id.slice(0, 8)}…</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-300 text-sm">{emailMap.get(student.id) ?? '—'}</p>
                      {student.phone && (
                        <p className="text-gray-500 text-xs">{student.phone}</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-300 text-sm">
                        {new Date(student.created_at).toLocaleDateString('tr-TR')}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        {isBanned ? (
                          <span className="text-xs px-2 py-1 rounded-full bg-red-900/40 text-red-300 border border-red-700 w-fit">
                            🚫 Banlı
                          </span>
                        ) : (
                          <span className="text-xs px-2 py-1 rounded-full bg-green-900/40 text-green-300 border border-green-700 w-fit">
                            ✓ Aktif
                          </span>
                        )}
                        {student.is_verified && (
                          <span className="text-xs px-2 py-1 rounded-full bg-purple-900/40 text-purple-300 border border-purple-700 w-fit">
                            ✦ Onaylı
                          </span>
                        )}
                        {pendingDeletion && (
                          <span
                            title={`Silinecek: ${new Date(new Date(student.deletion_requested_at!).getTime() + 24 * 60 * 60 * 1000).toLocaleString('tr-TR')}`}
                            className="text-xs px-2 py-1 rounded-full bg-orange-900/40 text-orange-300 border border-orange-700 w-fit cursor-help"
                          >
                            ⏳ Silinecek
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2 flex-wrap">
                        <VerifyButton userId={student.id} isVerified={student.is_verified} />
                        <UserActions userId={student.id} isBanned={isBanned} />
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
