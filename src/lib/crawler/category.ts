// src/lib/crawler/category.ts
// =============================================
// 제목 기반 카테고리 추정
// =============================================

import type { EventCategory } from '@/types'

export function guessCategory(title: string): EventCategory {
  if (/콜로키움|콜로퀴움/.test(title)) return '콜로퀴움'
  if (/채용|취업|인턴|진로|커리어|상담회/.test(title)) return '취업행사'
  if (/세미나/.test(title)) return '세미나'
  if (/강연|lecture/i.test(title)) return '강연'
  if (/토크/.test(title)) return '토크콘서트'
  if (/인재개발원/.test(title)) return '세미나'
  return '기타'
}
