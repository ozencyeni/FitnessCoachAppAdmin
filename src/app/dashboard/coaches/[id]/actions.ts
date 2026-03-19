'use server'

import { createAdminClient } from '@/utils/supabase/admin'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function approveCoach(coachId: string) {
  const supabase = createAdminClient()

  const { error } = await supabase
    .from('coach_profiles')
    .update({
      status: 'active',
      is_listed: true,
      approved_at: new Date().toISOString(),
      rejection_reason: null,
    })
    .eq('user_id', coachId)

  if (error) throw new Error(error.message)

  await supabase.from('notifications').insert({
    user_id: coachId,
    type: 'system',
    title: '🎉 Başvurunuz Onaylandı!',
    body: 'Hesabınız aktif edildi. Şimdi paketlerinizi oluşturup öğrenci kabul etmeye başlayabilirsiniz.',
    data: { action: 'approved' },
  })

  revalidatePath('/dashboard/coaches')
  redirect('/dashboard/coaches')
}

export async function rejectCoach(coachId: string, reason: string) {
  const supabase = createAdminClient()

  const { error } = await supabase
    .from('coach_profiles')
    .update({
      status: 'rejected',
      is_listed: false,
      rejection_reason: reason,
    })
    .eq('user_id', coachId)

  if (error) throw new Error(error.message)

  await supabase.from('notifications').insert({
    user_id: coachId,
    type: 'system',
    title: 'Başvurunuz İncelendi',
    body: `Başvurunuz şu an için kabul edilemedi: ${reason}`,
    data: { action: 'rejected', reason },
  })

  revalidatePath('/dashboard/coaches')
  redirect('/dashboard/coaches')
}
