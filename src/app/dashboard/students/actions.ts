'use server'

import { createAdminClient } from '@/utils/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function verifyStudent(userId: string) {
  const supabase = createAdminClient()

  const { error } = await supabase
    .from('profiles')
    .update({
      is_verified: true,
      verified_at: new Date().toISOString(),
    })
    .eq('id', userId)

  if (error) throw new Error(error.message)

  revalidatePath('/dashboard/students')
}

export async function unverifyStudent(userId: string) {
  const supabase = createAdminClient()

  const { error } = await supabase
    .from('profiles')
    .update({ is_verified: false, verified_at: null })
    .eq('id', userId)

  if (error) throw new Error(error.message)

  revalidatePath('/dashboard/students')
}

export async function banUser(userId: string) {
  const supabase = createAdminClient()

  const { error } = await supabase.auth.admin.updateUserById(userId, {
    ban_duration: '87600h', // ~10 yıl = kalıcı ban
  })

  if (error) throw new Error(error.message)

  revalidatePath('/dashboard/students')
}

export async function unbanUser(userId: string) {
  const supabase = createAdminClient()

  const { error } = await supabase.auth.admin.updateUserById(userId, {
    ban_duration: 'none',
  })

  if (error) throw new Error(error.message)

  revalidatePath('/dashboard/students')
}

export async function deleteUser(userId: string) {
  const { createClient } = await import('@/utils/supabase/server')
  const serverClient = await createClient()
  const { data: { user: me } } = await serverClient.auth.getUser()

  if (me?.id === userId) {
    throw new Error('Kendi hesabınızı silemezsiniz.')
  }

  const supabase = createAdminClient()

  // FK kısıtlamaları CASCADE olmayabilir — manuel sırayla temizle
  // 1. Konuşma mesajları
  const { data: convs } = await supabase
    .from('conversations')
    .select('id')
    .or(`coach_id.eq.${userId},student_id.eq.${userId}`)
  if (convs?.length) {
    await supabase.from('messages').delete()
      .in('conversation_id', convs.map((c) => c.id))
  }

  // 2. Konuşmalar
  await supabase.from('conversations').delete()
    .or(`coach_id.eq.${userId},student_id.eq.${userId}`)

  // 3. Rezervasyon değişiklik talepleri
  await supabase.from('reservation_change_requests').delete()
    .eq('student_id', userId)

  // 4. Rezervasyonlar
  await supabase.from('reservations').delete()
    .or(`student_id.eq.${userId},coach_id.eq.${userId}`)

  // 5. Değerlendirmeler
  await supabase.from('ratings').delete()
    .or(`student_id.eq.${userId},coach_id.eq.${userId}`)

  // 6. İşlemler
  await supabase.from('transactions').delete()
    .or(`student_id.eq.${userId},coach_id.eq.${userId}`)

  // 7. Sporcu paketleri
  await supabase.from('student_packages').delete()
    .or(`student_id.eq.${userId},coach_id.eq.${userId}`)

  // 8. Auth kullanıcısını sil (profiles ve cascade olanlar otomatik silinir)
  const { error } = await supabase.auth.admin.deleteUser(userId)
  if (error) throw new Error(error.message)

  revalidatePath('/dashboard/students')
}
