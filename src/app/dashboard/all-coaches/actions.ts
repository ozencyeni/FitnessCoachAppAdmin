'use server'

import { createAdminClient } from '@/utils/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function banCoach(userId: string) {
  const supabase = createAdminClient()

  const { error } = await supabase.auth.admin.updateUserById(userId, {
    ban_duration: '87600h',
  })

  if (error) throw new Error(error.message)

  revalidatePath('/dashboard/all-coaches')
}

export async function unbanCoach(userId: string) {
  const supabase = createAdminClient()

  const { error } = await supabase.auth.admin.updateUserById(userId, {
    ban_duration: 'none',
  })

  if (error) throw new Error(error.message)

  revalidatePath('/dashboard/all-coaches')
}

export async function deleteCoach(userId: string) {
  const { createClient } = await import('@/utils/supabase/server')
  const serverClient = await createClient()
  const { data: { user: me } } = await serverClient.auth.getUser()

  if (me?.id === userId) {
    throw new Error('Kendi hesabınızı silemezsiniz.')
  }

  const supabase = createAdminClient()
  const { error } = await supabase.auth.admin.deleteUser(userId)

  if (error) throw new Error(error.message)

  revalidatePath('/dashboard/all-coaches')
}

export async function deleteCertificate(certificateId: string, coachId: string, fileUrl: string | null) {
  const supabase = createAdminClient()

  // Storage'dan sil (URL varsa)
  if (fileUrl) {
    try {
      // URL'den storage path'i çıkar
      const url = new URL(fileUrl)
      const pathParts = url.pathname.split('/storage/v1/object/public/')
      if (pathParts.length === 2) {
        const [bucket, ...filePath] = pathParts[1].split('/')
        await supabase.storage.from(bucket).remove([filePath.join('/')])
      }
    } catch {
      // Storage silme başarısız olsa da DB kaydını sil
    }
  }

  // DB'den sil
  const { error } = await supabase
    .from('coach_certificates')
    .delete()
    .eq('id', certificateId)

  if (error) throw new Error(error.message)

  revalidatePath(`/dashboard/all-coaches/${coachId}`)
}
