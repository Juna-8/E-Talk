// src/lib/crawler/filters.ts
// =============================================
// 제목 키워드 필터
// =============================================

// 사이트 표기는 '콜로키움'이지만 기존 EventCategory enum은 '콜로퀴움' — 둘 다 매칭
export const TARGET_KEYWORDS = ['콜로키움', '콜로퀴움', '강연', '세미나', '인재개발원'] as const

export function matchesKeywords(title: string): boolean {
  return TARGET_KEYWORDS.some((keyword) => title.includes(keyword))
}
