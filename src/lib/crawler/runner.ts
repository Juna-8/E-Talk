// src/lib/crawler/runner.ts
// =============================================
// 크롤러 오케스트레이션 - CLI 스크립트와 API 라우트에서 공통으로 호출
// =============================================

import { createAdminClient } from '@/lib/supabase-admin'
import { buildCrawledEvent } from './buildEvent'
import { fetchDetailPage, parseDetailPage } from './detailPage'
import { matchesKeywords } from './filters'
import { fetchListPage, parseListPage } from './listPage'
import type { CrawledEvent, CrawlOptions, CrawlResult } from './types'

const PAGE_SIZE = 10

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function runCrawl(options: CrawlOptions = {}): Promise<CrawlResult> {
  const maxPages = options.maxPages ?? 3
  const delayMs = options.delayMs ?? 300

  const result: CrawlResult = {
    scanned: 0,
    matched: 0,
    inserted: 0,
    skipped: 0,
    errors: [],
  }

  const events: CrawledEvent[] = []

  for (let page = 0; page < maxPages; page += 1) {
    const offset = page * PAGE_SIZE
    const listHtml = await fetchListPage(offset)
    const items = parseListPage(listHtml)
    if (items.length === 0) break

    result.scanned += items.length

    for (const item of items) {
      if (!matchesKeywords(item.title)) continue
      result.matched += 1

      try {
        await sleep(delayMs)
        const detailHtml = await fetchDetailPage(item.detailUrl)
        const detail = parseDetailPage(detailHtml, item.detailUrl, item.articleNo)
        events.push(buildCrawledEvent(item, detail))
      } catch (err) {
        result.errors.push({
          articleNo: item.articleNo,
          message: err instanceof Error ? err.message : String(err),
        })
      }
    }
  }

  if (events.length > 0) {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('events')
      .upsert(events, { onConflict: 'source,source_article_no', ignoreDuplicates: true })
      .select('id')

    if (error) {
      result.errors.push({ articleNo: 0, message: `upsert 실패: ${error.message}` })
    } else {
      result.inserted = data?.length ?? 0
    }
  }

  result.skipped = Math.max(result.matched - result.inserted - result.errors.length, 0)

  return result
}
