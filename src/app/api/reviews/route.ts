// src/app/api/reviews/route.ts
// =============================================
// 후기 API  GET /api/reviews?eventId=...
//          POST /api/reviews  { eventId, content }
// =============================================

import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase'
import { getReviews, createReview } from '@/lib/queries/reviews'

export async function GET(req: NextRequest) {
  const eventId = req.nextUrl.searchParams.get('eventId')
  if (!eventId) {
    return NextResponse.json({ error: 'eventId가 필요합니다.' }, { status: 400 })
  }

  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()

  try {
    const reviews = await getReviews(eventId, user?.id)
    return NextResponse.json({ data: reviews })
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

  const body = await req.json()
  const { eventId, content } = body

  if (!eventId || !content?.trim()) {
    return NextResponse.json({ error: '필수 항목이 누락되었습니다.' }, { status: 400 })
  }
  if (content.length < 5 || content.length > 1000) {
    return NextResponse.json({ error: '후기는 5자 이상 1000자 이하로 작성해 주세요.' }, { status: 400 })
  }

  try {
    const review = await createReview({ eventId, userId: user.id, content })
    return NextResponse.json({ data: review }, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
