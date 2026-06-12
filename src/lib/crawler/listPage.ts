// src/lib/crawler/listPage.ts
// =============================================
// 이화 공지사항 목록 페이지 fetch/parse
// =============================================

import * as cheerio from 'cheerio'
import type { CrawledListItem } from './types'

export const NOTICE_BASE_URL = 'https://www.ewha.ac.kr/ewha/news/notice.do'

const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36'

export async function fetchListPage(offset: number): Promise<string> {
  const url = `${NOTICE_BASE_URL}?article.offset=${offset}&articleLimit=10`
  const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } })
  if (!res.ok) {
    throw new Error(`목록 페이지 요청 실패 (offset=${offset}): ${res.status}`)
  }
  return res.text()
}

// articleNo=12345 형태의 쿼리스트링에서 번호 추출
function extractArticleNo(href: string): number | null {
  const match = href.match(/articleNo=(\d+)/)
  return match ? Number(match[1]) : null
}

export function parseListPage(html: string): CrawledListItem[] {
  const $ = cheerio.load(html)
  const items: CrawledListItem[] = []

  $('table[summary="뉴스센터 | 공지사항"] tbody tr, table[summary="뉴스센터 | 공지사항"] tr').each((_, el) => {
    const row = $(el)
    const link = row.find('a[href*="mode=view"]').first()
    if (link.length === 0) return

    const href = link.attr('href') ?? ''
    const articleNo = extractArticleNo(href)
    if (articleNo === null) return

    const title = link
      .text()
      .replace(/\s*자세히\s*보기\s*$/, '')
      .replace(/\s+/g, ' ')
      .trim()

    const writerDept = row.find('.b-writer').first().text().replace(/\s+/g, ' ').trim()
    const date = row.find('.b-date').first().text().replace(/\s+/g, ' ').trim()

    const detailUrl = `${NOTICE_BASE_URL}?${href.replace(/^\?/, '').replace(/&amp;/g, '&')}`

    items.push({ articleNo, title, writerDept, date, detailUrl })
  })

  // 같은 글이 여러 셀 구조로 중복 추출되는 경우 articleNo 기준 dedup
  const seen = new Set<number>()
  return items.filter((item) => {
    if (seen.has(item.articleNo)) return false
    seen.add(item.articleNo)
    return true
  })
}
