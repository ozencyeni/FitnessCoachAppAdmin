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
  const { error } = await supabase.auth.admin.deleteUser(userId)

  if (error) throw new Error(error.message)

  revalidatePath('/dashboard/students')
}
