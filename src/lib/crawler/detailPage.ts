// src/lib/crawler/detailPage.ts
// =============================================
// 이화 공지사항 상세 페이지 fetch/parse
// =============================================

import * as cheerio from 'cheerio'
import type { CrawledDetail } from './types'

const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36'

const EWHA_ORIGIN = 'https://www.ewha.ac.kr'

export async function fetchDetailPage(detailUrl: string): Promise<string> {
  const res = await fetch(detailUrl, { headers: { 'User-Agent': USER_AGENT } })
  if (!res.ok) {
    throw new Error(`상세 페이지 요청 실패 (${detailUrl}): ${res.status}`)
  }
  return res.text()
}

export function absolutizeUrl(src: string): string {
  if (/^https?:\/\//i.test(src)) return src
  if (src.startsWith('/')) return `${EWHA_ORIGIN}${src}`
  return `${EWHA_ORIGIN}/${src}`
}

// 블록 요소를 줄바꿈으로 치환한 뒤 텍스트 추출 (일시/장소 등 줄 단위 정보 보존)
function blockHtmlToText(html: string): string {
  const normalized = html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|li|h[1-6]|tr)>/gi, '\n')

  const text = cheerio.load(`<div>${normalized}</div>`)('div').text()

  return text
    .replace(/ /g, ' ')
    .replace(/[ \t]+/g, ' ')
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .join('\n')
}

export function parseDetailPage(html: string, detailUrl: string, articleNo: number): CrawledDetail {
  const $ = cheerio.load(html)

  const title = $('.b-title').first().text().replace(/\s+/g, ' ').trim()

  const writer = $('.b-writer-box span').eq(1).text().replace(/\s+/g, ' ').trim()
  const registeredDate = $('.b-date-box span').eq(1).text().replace(/\s+/g, ' ').trim()

  const frView = $('.fr-view').first()
  const bodyHtml = frView.html() ?? ''
  const bodyText = blockHtmlToText(bodyHtml)

  const imgSrc = frView.find('img').first().attr('src')
  const posterUrl = imgSrc ? absolutizeUrl(imgSrc) : null

  const applyLinks: string[] = []
  frView.find('a').each((_, a) => {
    const text = $(a).text().replace(/\s+/g, ' ').trim()
    const href = $(a).attr('href')
    if (!href) return
    if (/신청|접수|등록|지원/.test(text)) {
      applyLinks.push(absolutizeUrl(href))
    }
  })

  return {
    articleNo,
    detailUrl,
    title,
    writer,
    registeredDate,
    bodyText,
    posterUrl,
    applyLinks,
  }
}
