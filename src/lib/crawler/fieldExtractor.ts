// src/lib/crawler/fieldExtractor.ts
// =============================================
// 본문 텍스트에서 일시/장소/신청 정보 best-effort 추출
// 포스터 이미지뿐인 글은 매칭되는 정보가 없을 수 있으며,
// 이 경우 각 필드는 null을 반환한다 (draft 상태로 저장 후 관리자가 보완).
// =============================================

import type { ExtractedFields } from './types'

const DATE_RE = /(\d{4})\s*[.\-/년]\s*(\d{1,2})\s*[.\-/월]\s*(\d{1,2})\s*일?/
const TIME_RE =
  /(\d{1,2})\s*[:시]\s*(\d{0,2})\s*분?(?:\s*[~\-–]\s*(\d{1,2})\s*[:시]\s*(\d{0,2})\s*분?)?/

function normalizeDate(y: string, m: string, d: string): string {
  return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`
}

function normalizeTime(h: string, min: string): string {
  return `${h.padStart(2, '0')}:${(min || '0').padStart(2, '0')}`
}

// 줄 앞머리(글머리 기호 무시)에 라벨이 등장하는 줄을 찾는다
function findLabeledLine(bodyText: string, labelRe: RegExp): string | null {
  const lines = bodyText.split('\n')
  for (const line of lines) {
    const stripped = line.replace(/^[\s\-□▶○■▪*·•]+/, '')
    const match = stripped.match(labelRe)
    if (match && match.index !== undefined && match.index <= 2) {
      return stripped
    }
  }
  return null
}

export function extractFields(bodyText: string): ExtractedFields {
  const result: ExtractedFields = {
    date: null,
    startTime: null,
    endTime: null,
    location: null,
    applyUrl: null,
  }

  const dateTimeLine = findLabeledLine(bodyText, /일\s*시/)
  if (dateTimeLine) {
    const dateMatch = dateTimeLine.match(DATE_RE)
    if (dateMatch) {
      result.date = normalizeDate(dateMatch[1], dateMatch[2], dateMatch[3])
    }
    const timeMatch = dateTimeLine.match(TIME_RE)
    if (timeMatch) {
      result.startTime = normalizeTime(timeMatch[1], timeMatch[2])
      if (timeMatch[3]) {
        result.endTime = normalizeTime(timeMatch[3], timeMatch[4])
      }
    }
  }

  const locationLine = findLabeledLine(bodyText, /장\s*소/)
  if (locationLine) {
    const afterLabel = locationLine.replace(/^.*?장\s*소\s*[:：]?\s*/, '').trim()
    const cutMatch = afterLabel.match(/^(.*?)(?:\s{2,}|(?:문의|대상|신청|주최|주관)\s*[:：]?)/)
    const location = (cutMatch ? cutMatch[1] : afterLabel).trim()
    result.location = location.length > 0 ? location : null
  }

  const applyLine = findLabeledLine(bodyText, /신청|접수/)
  if (applyLine) {
    const urlMatch = applyLine.match(/https?:\/\/\S+/)
    if (urlMatch) {
      result.applyUrl = urlMatch[0].replace(/[)\]},.]+$/, '')
    }
  }

  return result
}
