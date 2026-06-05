// src/lib/supabase.ts
// =============================================
// Supabase 클라이언트 (Browser / Server 분리)
// =============================================

import { createBrowserClient } from '@supabase/ssr'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from './database.types'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// ── 브라우저 클라이언트 (Client Components) ──
export function createClient() {
  return createBrowserClient<Database>(SUPABASE_URL, SUPABASE_ANON)
}

// ── 서버 클라이언트 (Server Components / Route Handlers) ──
export async function createServerSupabase() {
  const cookieStore = await cookies()
  return createServerClient<Database>(SUPABASE_URL, SUPABASE_ANON, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (cookiesToSet) => {
        cookiesToSet.forEach(({ name, value, options }) =>
          cookieStore.set(name, value, options)
        )
      },
    },
  })
}
