// src/lib/admin.ts
// =============================================
// 관리자 권한 확인 헬퍼
// =============================================

import { createServerSupabase } from '@/lib/supabase'

export interface AdminUser {
  id: string
  email: string
}

// 로그인된 사용자가 관리자(profiles.is_admin = true)인지 확인
export async function getAdminUser(): Promise<AdminUser | null> {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) return null

  return { id: user.id, email: user.email ?? '' }
}
