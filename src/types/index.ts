// =============================================
// 이화 행사 플랫폼 - TypeScript Types
// =============================================

export type EventCategory =
  | '강연'
  | '세미나'
  | '토크콘서트'
  | '취업행사'
  | '콜로퀴움'
  | '기타'

export type EventStatus = 'draft' | 'upcoming' | 'ongoing' | 'ended'

export interface Profile {
  id: string
  email: string
  nickname: string
  major?: string
  grade?: number
  interests: string[]
  is_admin: boolean
  created_at: string
}

export interface Event {
  id: string
  title: string
  category: EventCategory
  description: string
  date: string | null          // 'YYYY-MM-DD' (draft는 null 가능)
  start_time: string | null    // 'HH:MM' (draft는 null 가능)
  end_time: string | null
  location: string | null      // draft는 null 가능
  host: string
  apply_url: string | null
  poster_url: string | null
  tags: string[]
  target: string | null
  notes: string | null
  status: EventStatus
  created_by: string | null
  // 크롤링 출처 추적 (draft 검수용)
  source: string | null
  source_url: string | null
  source_article_no: number | null
  created_at: string
  updated_at: string
}

export interface Review {
  id: string
  event_id: string
  user_id: string
  content: string
  like_count: number
  created_at: string
  // joined
  profile?: Pick<Profile, 'nickname' | 'major'>
  is_liked?: boolean     // 현재 사용자 좋아요 여부
}

export interface Bookmark {
  event_id: string
  user_id: string
  created_at: string
  // joined
  event?: Event
}

// API 응답 래퍼
export interface ApiResponse<T> {
  data: T | null
  error: string | null
}

// 필터 옵션
export interface EventFilters {
  category?: EventCategory | '전체'
  status?: EventStatus | '전체'
  tag?: string
  date?: string           // 'YYYY-MM-DD'
  query?: string          // 검색어
}
