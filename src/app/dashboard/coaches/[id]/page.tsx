import { notFound } from 'next/navigation'
import { createAdminClient } from '@/utils/supabase/admin'
import ApproveRejectButtons from './ApproveRejectButtons'

export default async function CoachDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = createAdminClient()

  const [{ data: coachProfile }, { data: certificates }] = await Promise.all([
    supabase
      .from('coach_profiles')
      .select(`
        *,
        profiles!inner(full_name, avatar_url, phone, gender, created_at)
      `)
      .eq('user_id', params.id)
      .single(),
    supabase
      .from('coach_certificates')
      .select('*')
      .eq('coach_id', params.id)
      .order('created_at', { ascending: true }),
  ])

  if (!coachProfile) notFound()

  const profile = Array.isArray(coachProfile.profiles)
    ? coachProfile.profiles[0]
    : coachProfile.profiles as {
        full_name: string
        avatar_url: string | null
        phone: string | null
        gender: string | null
        created_at: string
      }

  const sessionTypeLabel: Record<string, string> = {
    in_person: 'Yüz yüze',
    online: 'Online',
    both: 'Her ikisi',
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Geri */}
      <a
        href="/dashboard/coaches"
        className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-6 transition"
      >
        ← Başvuru Listesi
      </a>

      {/* Profil başlığı */}
      <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 mb-6">
        <div className="flex items-center gap-5 mb-6">
          <div className="w-20 h-20 rounded-full bg-gray-700 flex items-center justify-center text-4xl overflow-hidden flex-shrink-0">
            {profile?.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
            ) : '👤'}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">{profile?.full_name}</h1>
            <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-400">
              {profile?.phone && <span>📞 {profile.phone}</span>}
              {profile?.gender && <span>👤 {profile.gender}</span>}
              <span>
                📅 Başvuru: {new Date(profile?.created_at).toLocaleDateString('tr-TR')}
              </span>
            </div>
          </div>
          <div className="ml-auto">
            <StatusBadge status={coachProfile.status} />
          </div>
        </div>

        {/* Detaylar */}
        <div className="grid grid-cols-2 gap-4">
          {coachProfile.city && (
            <InfoRow label="Şehir" value={coachProfile.city} />
          )}
          {coachProfile.district && (
            <InfoRow label="İlçe" value={coachProfile.district} />
          )}
          {coachProfile.experience_years && (
            <InfoRow label="Deneyim" value={`${coachProfile.experience_years} yıl`} />
          )}
          <InfoRow
            label="Seans Türü"
            value={sessionTypeLabel[coachProfile.session_type] ?? coachProfile.session_type}
          />
          {coachProfile.min_price && (
            <InfoRow
              label="Fiyat Aralığı"
              value={`₺${coachProfile.min_price} – ₺${coachProfile.max_price}`}
            />
          )}
        </div>

        {coachProfile.specializations?.length > 0 && (
          <div className="mt-4">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Uzmanlıklar</p>
            <div className="flex flex-wrap gap-2">
              {coachProfile.specializations.map((s: string) => (
                <span
                  key={s}
                  className="text-sm px-3 py-1 rounded-lg bg-secondary/20 text-secondary border border-secondary/30"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {coachProfile.bio && (
          <div className="mt-4">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Biyografi</p>
            <p className="text-gray-300 text-sm leading-relaxed">{coachProfile.bio}</p>
          </div>
        )}

        {coachProfile.rejection_reason && (
          <div className="mt-4 bg-red-900/20 border border-red-700 rounded-xl p-4">
            <p className="text-xs text-red-400 uppercase tracking-wide mb-1">Önceki Red Sebebi</p>
            <p className="text-red-300 text-sm">{coachProfile.rejection_reason}</p>
          </div>
        )}
      </div>

      {/* Sertifikalar */}
      <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 mb-6">
        <h2 className="text-lg font-semibold text-white mb-4">
          Yüklenen Sertifikalar ({certificates?.length ?? 0})
        </h2>

        {!certificates || certificates.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-4xl mb-3">📂</p>
            <p className="text-gray-400">Sertifika yüklenmemiş</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {certificates.map((cert) => (
              <a
                key={cert.id}
                href={cert.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="group block rounded-xl overflow-hidden border border-gray-700 hover:border-secondary transition"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={cert.file_url}
                  alt={cert.file_name}
                  className="w-full h-48 object-cover bg-gray-800 group-hover:opacity-90 transition"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.style.display = 'none'
                    target.parentElement!.innerHTML += `
                      <div class="w-full h-48 bg-gray-800 flex flex-col items-center justify-center gap-2">
                        <span class="text-3xl">📄</span>
                        <span class="text-xs text-gray-400">${cert.file_name}</span>
                      </div>`
                  }}
                />
                <div className="p-3">
                  <p className="text-sm text-white truncate">{cert.file_name}</p>
                  {cert.certificate_type && (
                    <p className="text-xs text-gray-400 mt-0.5">{cert.certificate_type}</p>
                  )}
                  <p className="text-xs text-secondary mt-1">Büyütmek için tıkla ↗</p>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>

      {/* Onayla / Reddet */}
      {coachProfile.status === 'pending' && (
        <ApproveRejectButtons coachId={params.id} />
      )}

      {coachProfile.status === 'active' && (
        <div className="bg-green-900/20 border border-green-700 rounded-2xl p-6 text-center">
          <p className="text-green-400 font-semibold">✅ Bu antrenör onaylandı ve aktif.</p>
        </div>
      )}

      {coachProfile.status === 'rejected' && (
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
          <p className="text-gray-400 text-center mb-4">Bu başvuru reddedildi. Yeniden onaylayabilirsin.</p>
          <ApproveRejectButtons coachId={params.id} />
        </div>
      )}
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-800/50 rounded-xl p-3">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="text-white font-medium text-sm">{value}</p>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; class: string }> = {
    pending:  { label: '⏳ Onay Bekliyor', class: 'bg-amber-900/40 text-amber-300 border-amber-700' },
    active:   { label: '✅ Aktif',          class: 'bg-green-900/40 text-green-300 border-green-700' },
    rejected: { label: '❌ Reddedildi',     class: 'bg-red-900/40 text-red-300 border-red-700' },
  }
  const s = map[status] ?? { label: status, class: 'bg-gray-800 text-gray-300 border-gray-700' }
  return (
    <span className={`text-sm px-4 py-1.5 rounded-full border font-medium ${s.class}`}>
      {s.label}
    </span>
  )
}
