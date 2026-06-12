// src/lib/crawler/types.ts
// =============================================
// 이화 공지사항 크롤러 - 공용 타입
// =============================================

import type { EventCategory } from '@/types'

// 공지사항 목록 페이지에서 추출한 항목
export interface CrawledListItem {
  articleNo: number
  title: string
  writerDept: string   // 작성 부서 (b-writer)
  date: string          // 'YYYY.MM.DD' (b-date)
  detailUrl: string
}

// 공지사항 상세 페이지에서 추출한 정보
export interface CrawledDetail {
  articleNo: number
  detailUrl: string
  title: string
  writer: string                // 작성처
  registeredDate: string         // 'YYYY.MM.DD'
  bodyText: string               // .fr-view 텍스트 (줄바꿈 보존, 공백 정규화)
  posterUrl: string | null       // 본문 내 첫 이미지 (절대 URL)
  applyLinks: string[]           // 본문 내 '신청/접수/등록/지원' 관련 링크
}

// 본문 텍스트에서 추출한 일시/장소/신청 정보
export interface ExtractedFields {
  date: string | null        // 'YYYY-MM-DD'
  startTime: string | null   // 'HH:MM'
  endTime: string | null     // 'HH:MM'
  location: string | null
  applyUrl: string | null
}

// Supabase events 테이블에 upsert할 형태
export interface CrawledEvent {
  title: string
  category: EventCategory
  description: string
  date: string | null
  start_time: string | null
  end_time: string | null
  location: string | null
  host: string
  apply_url: string | null
  poster_url: string | null
  tags: string[]
  status: 'draft'
  source: 'ewha_notice'
  source_url: string
  source_article_no: number
}

export interface CrawlOptions {
  maxPages?: number   // 목록 페이지 수 (1페이지 = 10개 글)
  delayMs?: number    // 상세 페이지 요청 간 딜레이(ms)
}

export interface CrawlResult {
  scanned: number
  matched: number
  inserted: number
  skipped: number
  errors: { articleNo: number; message: string }[]
}
