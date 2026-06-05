// src/lib/queries/events.ts
// =============================================
// 행사 관련 Supabase 쿼리 함수
// =============================================

import { createServerSupabase } from '@/lib/supabase'
import type { Event, EventFilters } from '@/types'

// ── 행사 목록 조회 (필터 지원) ──────────────
export async function getEvents(filters: EventFilters = {}): Promise<Event[]> {
  const supabase = await createServerSupabase()
  let query = supabase
    .from('events')
    .select('*')
    .order('date', { ascending: true })

  if (filters.category && filters.category !== '전체') {
    query = query.eq('category', filters.category)
  }
  if (filters.status && filters.status !== '전체') {
    query = query.eq('status', filters.status)
  }
  if (filters.date) {
    query = query.eq('date', filters.date)
  }
  if (filters.tag) {
    query = query.contains('tags', [filters.tag])
  }
  if (filters.query) {
    query = query.or(
      `title.ilike.%${filters.query}%,host.ilike.%${filters.query}%,description.ilike.%${filters.query}%`
    )
  }

  const { data, error } = await query
  if (error) throw new Error(error.message)
  return data ?? []
}

// ── 행사 단건 조회 ──────────────────────────
export async function getEvent(id: string): Promise<Event | null> {
  const supabase = await createServerSupabase()
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('id', id)
    .single()

  if (error) return null
  return data
}

// ── 오늘 행사 조회 ──────────────────────────
export async function getTodayEvents(): Promise<Event[]> {
  const today = new Date().toISOString().split('T')[0]
  return getEvents({ date: today })
}
