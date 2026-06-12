// src/components/ui/CrawlButton.tsx  (Client Component)
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { CrawlResult } from '@/lib/crawler/types'

export default function CrawlButton() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<CrawlResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleClick() {
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const res = await fetch('/api/admin/crawl', { method: 'POST' })
      const body = await res.json()
      if (!res.ok) {
        setError(body.error ?? '크롤링 중 오류가 발생했습니다.')
        return
      }
      setResult(body.data)
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="crawl-button-wrap">
      <button className="btn-crawl" onClick={handleClick} disabled={loading}>
        {loading ? '크롤링 중...' : '지금 크롤링 실행'}
      </button>
      {error && <p className="draft-error">{error}</p>}
      {result && (
        <p className="crawl-result">
          스캔 {result.scanned} · 매칭 {result.matched} · 신규 {result.inserted} · 중복 {result.skipped}
          {result.errors.length > 0 && ` · 오류 ${result.errors.length}`}
        </p>
      )}
    </div>
  )
}
