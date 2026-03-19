import { notFound } from 'next/navigation'
import { createAdminClient } from '@/utils/supabase/admin'
import DeleteCertificateButton from './DeleteCertificateButton'

export default async function CoachCertificatesPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = createAdminClient()

  const [{ data: coachProfile }, { data: certificates }] = await Promise.all([
    supabase
      .from('coach_profiles')
      .select(`
        user_id,
        status,
        city,
        profiles!inner(full_name, avatar_url)
      `)
      .eq('user_id', id)
      .single(),
    supabase
      .from('coach_certificates')
      .select('id, file_url, file_name, certificate_type, created_at')
      .eq('coach_id', id)
      .order('created_at', { ascending: true }),
  ])

  if (!coachProfile) notFound()

  const profile = Array.isArray(coachProfile.profiles)
    ? coachProfile.profiles[0]
    : (coachProfile.profiles as { full_name: string; avatar_url: string | null })

  const certList = certificates ?? []

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <a
        href="/dashboard/all-coaches"
        className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-6 transition"
      >
        ← Antrenör Listesi
      </a>

      {/* Header */}
      <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gray-700 flex items-center justify-center text-3xl overflow-hidden flex-shrink-0">
            {profile?.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
            ) : '👤'}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">{profile?.full_name}</h1>
            <p className="text-gray-400 text-sm mt-1">
              {coachProfile.city && `📍 ${coachProfile.city} · `}
              Belge Yönetimi
            </p>
          </div>
        </div>
      </div>

      {/* Certificates */}
      <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">
          Sertifikalar ({certList.length})
        </h2>

        {certList.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-4xl mb-3">📄</p>
            <p className="text-gray-400">Bu antrenörün yüklediği sertifika bulunmuyor.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {certList.map((cert) => (
              <div
                key={cert.id}
                className="flex items-center gap-4 bg-gray-800 rounded-xl p-4"
              >
                {/* Preview */}
                <div className="w-16 h-16 rounded-lg bg-gray-700 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {cert.file_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={cert.file_url}
                      alt=""
                      className="w-full h-full object-cover"
                      onError={() => {}}
                    />
                  ) : (
                    <span className="text-2xl">📄</span>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium text-sm truncate">
                    {cert.file_name ?? 'Belge'}
                  </p>
                  <p className="text-gray-400 text-xs mt-0.5">
                    {cert.certificate_type ?? '—'} ·{' '}
                    {new Date(cert.created_at).toLocaleDateString('tr-TR')}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {cert.file_url && (
                    <a
                      href={cert.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-900/40 text-blue-300 border border-blue-700 hover:bg-blue-900/60 transition"
                    >
                      Görüntüle
                    </a>
                  )}
                  <DeleteCertificateButton
                    certificateId={cert.id}
                    coachId={id}
                    fileUrl={cert.file_url}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
