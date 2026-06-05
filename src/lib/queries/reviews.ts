// src/lib/queries/reviews.ts
// =============================================
// 후기 / 북마크 Supabase 쿼리 함수
// =============================================

import { createServerSupabase } from '@/lib/supabase'
import type { Review, Bookmark } from '@/types'

// ── 행사별 후기 조회 (프로필 join) ──────────
export async function getReviews(eventId: string, userId?: string): Promise<Review[]> {
  const supabase = await createServerSupabase()

  const { data, error } = await supabase
    .from('reviews')
    .select(`
      *,
      profile:profiles(nickname, major),
      review_likes(user_id)
    `)
    .eq('event_id', eventId)
    .order('like_count', { ascending: false })

  if (error) throw new Error(error.message)

  return (data ?? []).map((r: any) => ({
    ...r,
    profile: r.profile,
    is_liked: userId
      ? r.review_likes?.some((l: any) => l.user_id === userId)
      : false,
    review_likes: undefined,   // 클라이언트에 raw 데이터 노출 제거
  }))
}

// ── 후기 작성 ────────────────────────────────
export async function createReview(params: {
  eventId: string
  userId: string
  content: string
}): Promise<Review> {
  const supabase = await createServerSupabase()
  const { data, error } = await supabase
    .from('reviews')
    .insert({
      event_id: params.eventId,
      user_id: params.userId,
      content: params.content,
    })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

// ── 좋아요 토글 ──────────────────────────────
export async function toggleLike(reviewId: string, userId: string): Promise<{ liked: boolean }> {
  const supabase = await createServerSupabase()

  // 기존 좋아요 확인
  const { data: existing } = await supabase
    .from('review_likes')
    .select('review_id')
    .eq('review_id', reviewId)
    .eq('user_id', userId)
    .maybeSingle()

  if (existing) {
    await supabase
      .from('review_likes')
      .delete()
      .eq('review_id', reviewId)
      .eq('user_id', userId)
    return { liked: false }
  } else {
    await supabase
      .from('review_likes')
      .insert({ review_id: reviewId, user_id: userId })
    return { liked: true }
  }
}

// ── 북마크 목록 조회 ─────────────────────────
export async function getBookmarks(userId: string): Promise<Bookmark[]> {
  const supabase = await createServerSupabase()
  const { data, error } = await supabase
    .from('bookmarks')
    .select('*, event:events(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data ?? []
}

// ── 북마크 토글 ──────────────────────────────
export async function toggleBookmark(eventId: string, userId: string): Promise<{ bookmarked: boolean }> {
  const supabase = await createServerSupabase()

  const { data: existing } = await supabase
    .from('bookmarks')
    .select('event_id')
    .eq('event_id', eventId)
    .eq('user_id', userId)
    .maybeSingle()

  if (existing) {
    await supabase
      .from('bookmarks')
      .delete()
      .eq('event_id', eventId)
      .eq('user_id', userId)
    return { bookmarked: false }
  } else {
    await supabase
      .from('bookmarks')
      .insert({ event_id: eventId, user_id: userId })
    return { bookmarked: true }
  }
}
