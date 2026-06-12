// src/lib/supabase-admin.ts
// =============================================
// Supabase 서비스 롤 클라이언트 (서버 전용)
// RLS를 우회하므로 클라이언트 컴포넌트에서 절대 import하지 말 것.
// 크롤러(CLI/Cron)와 관리자 API 라우트에서만 사용.
// =============================================

import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url) throw new Error('NEXT_PUBLIC_SUPABASE_URL이 설정되지 않았습니다.')
  if (!serviceRoleKey) throw new Error('SUPABASE_SERVICE_ROLE_KEY가 설정되지 않았습니다.')

  return createClient<Database>(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}
