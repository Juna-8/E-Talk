// src/components/ui/DraftEventCard.tsx  (Client Component)
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Event, EventCategory } from '@/types'

const CATEGORIES: EventCategory[] = ['강연', '세미나', '토크콘서트', '취업행사', '콜로퀴움', '기타']

interface FormState {
  title: string
  category: EventCategory
  description: string
  date: string
  start_time: string
  end_time: string
  location: string
  host: string
  apply_url: string
  poster_url: string
  tags: string
  target: string
  notes: string
}

function toFormState(event: Event): FormState {
  return {
    title: event.title,
    category: event.category,
    description: event.description,
    date: event.date ?? '',
    start_time: event.start_time ?? '',
    end_time: event.end_time ?? '',
    location: event.location ?? '',
    host: event.host,
    apply_url: event.apply_url ?? '',
    poster_url: event.poster_url ?? '',
    tags: event.tags.join(', '),
    target: event.target ?? '',
    notes: event.notes ?? '',
  }
}

export default function DraftEventCard({ event }: { event: Event }) {
  const router = useRouter()
  const [form, setForm] = useState<FormState>(() => toFormState(event))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handlePublish() {
    if (!form.date || !form.start_time || !form.location.trim()) {
      setError('날짜, 시작 시간, 장소를 모두 입력해야 게시할 수 있습니다.')
      return
    }

    const today = new Date().toISOString().split('T')[0]
    const status = form.date >= today ? 'upcoming' : 'ended'

    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/events/${event.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          category: form.category,
          description: form.description,
          date: form.date,
          start_time: form.start_time,
          end_time: form.end_time || null,
          location: form.location,
          host: form.host,
          apply_url: form.apply_url || null,
          poster_url: form.poster_url || null,
          tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
          target: form.target || null,
          notes: form.notes || null,
          status,
        }),
      })

      if (!res.ok) {
        const { error: message } = await res.json()
        setError(message ?? '게시 중 오류가 발생했습니다.')
        return
      }

      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  async function handleReject() {
    if (!confirm('이 draft를 삭제(반려)하시겠습니까? 다시 크롤링해도 복구되지 않습니다.')) return

    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/events/${event.id}`, { method: 'DELETE' })
      if (!res.ok) {
        const { error: message } = await res.json()
        setError(message ?? '삭제 중 오류가 발생했습니다.')
        return
      }
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="draft-card">
      <div className="draft-card-header">
        <span className="cat-badge">{form.category}</span>
        {event.source_url && (
          <a href={event.source_url} target="_blank" rel="noopener noreferrer" className="draft-source-link">
            원문 보기 ↗
          </a>
        )}
      </div>

      <div className="draft-card-body">
        {form.poster_url && (
          <img src={form.poster_url} alt="포스터 미리보기" className="draft-poster" />
        )}

        <div className="draft-form">
          <label className="form-field">
            <span className="form-label">제목</span>
            <input
              className="form-input"
              value={form.title}
              onChange={(e) => update('title', e.target.value)}
            />
          </label>

          <label className="form-field">
            <span className="form-label">카테고리</span>
            <select
              className="form-input"
              value={form.category}
              onChange={(e) => update('category', e.target.value as EventCategory)}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </label>

          <div className="form-row">
            <label className="form-field">
              <span className="form-label">날짜</span>
              <input
                type="date"
                className="form-input"
                value={form.date}
                onChange={(e) => update('date', e.target.value)}
              />
            </label>
            <label className="form-field">
              <span className="form-label">시작 시간</span>
              <input
                type="time"
                className="form-input"
                value={form.start_time}
                onChange={(e) => update('start_time', e.target.value)}
              />
            </label>
            <label className="form-field">
              <span className="form-label">종료 시간</span>
              <input
                type="time"
                className="form-input"
                value={form.end_time}
                onChange={(e) => update('end_time', e.target.value)}
              />
            </label>
          </div>

          <label className="form-field">
            <span className="form-label">장소</span>
            <input
              className="form-input"
              value={form.location}
              onChange={(e) => update('location', e.target.value)}
            />
          </label>

          <label className="form-field">
            <span className="form-label">주최</span>
            <input
              className="form-input"
              value={form.host}
              onChange={(e) => update('host', e.target.value)}
            />
          </label>

          <label className="form-field">
            <span className="form-label">설명</span>
            <textarea
              className="form-input form-textarea"
              value={form.description}
              onChange={(e) => update('description', e.target.value)}
            />
          </label>

          <label className="form-field">
            <span className="form-label">신청 링크</span>
            <input
              className="form-input"
              value={form.apply_url}
              onChange={(e) => update('apply_url', e.target.value)}
            />
          </label>

          <label className="form-field">
            <span className="form-label">포스터 이미지 URL</span>
            <input
              className="form-input"
              value={form.poster_url}
              onChange={(e) => update('poster_url', e.target.value)}
            />
          </label>

          <label className="form-field">
            <span className="form-label">태그 (쉼표로 구분)</span>
            <input
              className="form-input"
              value={form.tags}
              onChange={(e) => update('tags', e.target.value)}
            />
          </label>

          <label className="form-field">
            <span className="form-label">대상</span>
            <input
              className="form-input"
              value={form.target}
              onChange={(e) => update('target', e.target.value)}
            />
          </label>

          <label className="form-field">
            <span className="form-label">유의사항</span>
            <textarea
              className="form-input form-textarea"
              value={form.notes}
              onChange={(e) => update('notes', e.target.value)}
            />
          </label>
        </div>
      </div>

      {error && <p className="draft-error">{error}</p>}

      <div className="draft-actions">
        <button className="btn-reject" onClick={handleReject} disabled={loading}>
          삭제
        </button>
        <button className="btn-publish" onClick={handlePublish} disabled={loading}>
          게시
        </button>
      </div>
    </div>
  )
}
