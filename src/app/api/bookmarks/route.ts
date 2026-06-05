// src/app/api/bookmarks/route.ts
// POST /api/bookmarks  { eventId }  → 북마크 토글
// GET  /api/bookmarks               → 내 북마크 목록

import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase'
import { toggleBookmark, getBookmarks } from '@/lib/queries/reviews'

export async function GET() {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
  }

  try {
    const bookmarks = await getBookmarks(user.id)
    return NextResponse.json({ data: bookmarks })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
  }

  const { eventId } = await req.json()
  if (!eventId) {
    return NextResponse.json({ error: 'eventId가 필요합니다.' }, { status: 400 })
  }

  try {
    const result = await toggleBookmark(eventId, user.id)
    return NextResponse.json({ data: result })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
