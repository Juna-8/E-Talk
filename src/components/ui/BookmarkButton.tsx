// src/components/ui/BookmarkButton.tsx  (Client Component)
'use client'

import { useState } from 'react'

interface Props {
  eventId: string
  initialBookmarked: boolean
  isLoggedIn: boolean
}

export default function BookmarkButton({ eventId, initialBookmarked, isLoggedIn }: Props) {
  const [bookmarked, setBookmarked] = useState(initialBookmarked)
  const [loading, setLoading] = useState(false)

  async function handleClick() {
    if (!isLoggedIn) { alert('로그인 후 이용해 주세요.'); return }
    if (loading) return
    setLoading(true)
    try {
      const res = await fetch('/api/bookmarks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId }),
      })
      if (res.ok) {
        const { data } = await res.json()
        setBookmarked(data.bookmarked)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`bookmark-btn-lg${bookmarked ? ' on' : ''}`}
      aria-label={bookmarked ? '북마크 해제' : '북마크 추가'}
    >
      {bookmarked ? '🔖 저장됨' : '📎 저장'}
    </button>
  )
}
