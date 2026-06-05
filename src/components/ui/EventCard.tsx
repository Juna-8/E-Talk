// src/components/ui/EventCard.tsx  (Client Component)
'use client'

import Link from 'next/link'
import { useState } from 'react'
import type { Event } from '@/types'

const CAT_CLASS: Record<string, string> = {
  강연: 'cat-lecture', 세미나: 'cat-seminar', 취업행사: 'cat-career',
  토크콘서트: 'cat-talk', 콜로퀴움: 'cat-colloq', 기타: 'cat-other',
}
const STATUS_LABEL: Record<string, string> = {
  upcoming: '예정', ongoing: '오늘', ended: '종료',
}
const STATUS_CLASS: Record<string, string> = {
  upcoming: 'status-upcoming', ongoing: 'status-today', ended: 'status-ended',
}

interface Props {
  event: Event
  initialBookmarked?: boolean
}

export default function EventCard({ event, initialBookmarked = false }: Props) {
  const [bookmarked, setBookmarked] = useState(initialBookmarked)
  const [loading, setLoading] = useState(false)

  async function handleBookmark(e: React.MouseEvent) {
    e.preventDefault()       // Link 클릭 방지
    if (loading) return
    setLoading(true)
    try {
      const res = await fetch('/api/bookmarks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId: event.id }),
      })
      if (res.ok) {
        const { data } = await res.json()
        setBookmarked(data.bookmarked)
      } else if (res.status === 401) {
        alert('로그인 후 이용해 주세요.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Link href={`/events/${event.id}`} className={`event-card${bookmarked ? ' bookmarked' : ''}`}>
      <span className={`cat-badge ${CAT_CLASS[event.category]}`}>{event.category}</span>

      <h3 className="event-title">{event.title}</h3>

      <div className="event-meta">
        <span>📅 {event.date} {event.start_time}</span>
        <span>📍 {event.location}</span>
        <span>🏢 {event.host}</span>
      </div>

      <div className="event-footer">
        <div className="footer-left">
          <span className={`status-badge ${STATUS_CLASS[event.status]}`}>
            {STATUS_LABEL[event.status]}
          </span>
        </div>
        <button
          onClick={handleBookmark}
          className={`bookmark-btn${bookmarked ? ' on' : ''}`}
          aria-label={bookmarked ? '북마크 해제' : '북마크 추가'}
          disabled={loading}
        >
          {bookmarked ? '🔖' : '📎'}
        </button>
      </div>
    </Link>
  )
}
