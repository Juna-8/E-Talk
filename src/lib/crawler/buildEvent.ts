// src/lib/crawler/buildEvent.ts
// =============================================
// 목록/상세 정보를 events 테이블 upsert 형태로 변환
// =============================================

import { guessCategory } from './category'
import { extractFields } from './fieldExtractor'
import { TARGET_KEYWORDS } from './filters'
import type { CrawledDetail, CrawledEvent, CrawledListItem } from './types'

const DESCRIPTION_MAX_LENGTH = 500
const NO_BODY_TEXT = '(상세 내용은 원문 링크를 참고해 주세요.)'

function buildTags(title: string): string[] {
  const tags = new Set<string>()
  for (const keyword of TARGET_KEYWORDS) {
    if (title.includes(keyword)) {
      tags.add(keyword === '콜로키움' ? '콜로퀴움' : keyword)
    }
  }
  return [...tags]
}

function buildDescription(bodyText: string): string {
  if (!bodyText) return NO_BODY_TEXT
  if (bodyText.length <= DESCRIPTION_MAX_LENGTH) return bodyText
  return `${bodyText.slice(0, DESCRIPTION_MAX_LENGTH)}…`
}

export function buildCrawledEvent(item: CrawledListItem, detail: CrawledDetail): CrawledEvent {
  const title = detail.title || item.title
  const fields = extractFields(detail.bodyText)

  return {
    title,
    category: guessCategory(title),
    description: buildDescription(detail.bodyText),
    date: fields.date,
    start_time: fields.startTime,
    end_time: fields.endTime,
    location: fields.location,
    host: detail.writer || item.writerDept,
    apply_url: fields.applyUrl ?? detail.applyLinks[0] ?? null,
    poster_url: detail.posterUrl,
    tags: buildTags(title),
    status: 'draft',
    source: 'ewha_notice',
    source_url: detail.detailUrl,
    source_article_no: item.articleNo,
  }
}
