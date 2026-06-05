// src/components/ui/ReviewSection.tsx  (Client Component)
'use client'

import { useState } from 'react'
import type { Review } from '@/types'

interface Props {
  eventId: string
  reviews: Review[]
  userId?: string
  isEnded: boolean
}

export default function ReviewSection({ eventId, reviews: initial, userId, isEnded }: Props) {
  const [reviews, setReviews] = useState<Review[]>(initial)
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  // ── 후기 제출 ──────────────────────────────
  async function handleSubmit() {
    if (!userId) { alert('로그인 후 이용해 주세요.'); return }
    if (content.trim().length < 5) { setError('5자 이상 입력해 주세요.'); return }
    setError('')
    setSubmitting(true)
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId, content }),
      })
      const json = await res.json()
      if (!res.ok) { setError(json.error); return }
      // 낙관적 업데이트
      setReviews([
        { ...json.data, profile: { nickname: '나', major: '' }, is_liked: false },
        ...reviews,
      ])
      setContent('')
    } finally {
      setSubmitting(false)
    }
  }

  // ── 좋아요 토글 ──────────────────────────────
  async function handleLike(reviewId: string) {
    if (!userId) { alert('로그인 후 이용해 주세요.'); return }
    const res = await fetch(`/api/reviews/${reviewId}/like`, { method: 'POST' })
    if (!res.ok) return
    const { data } = await res.json()
    setReviews((prev) =>
      prev.map((r) =>
        r.id === reviewId
          ? { ...r, is_liked: data.liked, like_count: r.like_count + (data.liked ? 1 : -1) }
          : r
      )
    )
  }

  return (
    <section className="review-section">
      <div className="section-head">
        <span className="section-label">후기 및 의견 ({reviews.length})</span>
      </div>

      {reviews.length === 0 ? (
        <div className="empty-state">
          <p>아직 후기가 없어요. 첫 후기를 남겨보세요!</p>
        </div>
      ) : (
        <div className="review-list">
          {reviews.map((review) => (
            <div key={review.id} className="review-card">
              <p className="review-text">{review.content}</p>
              <div className="review-footer">
                <span className="reviewer">
                  <span className="avatar">
                    {review.profile?.nickname?.[0] ?? '?'}
                  </span>
                  {review.profile?.nickname}
                  {review.profile?.major && (
                    <span className="major"> · {review.profile.major}</span>
                  )}
                </span>
                <button
                  onClick={() => handleLike(review.id)}
                  className={`like-btn${review.is_liked ? ' liked' : ''}`}
                >
                  👍 {review.like_count}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 후기 작성 폼 - 종료된 행사에만 표시하거나 모두 허용 */}
      <div className="write-review">
        <p className="write-label">후기 남기기</p>
        {error && <p className="error-text">{error}</p>}
        <textarea
          className="write-box"
          placeholder="이 행사에 대한 후기나 의견을 남겨보세요... (5자 이상)"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          maxLength={1000}
          rows={3}
        />
        <div className="write-footer">
          <span className="char-count">{content.length}/1000</span>
          <button
            onClick={handleSubmit}
            disabled={submitting || content.trim().length < 5}
            className="submit-btn"
          >
            {submitting ? '등록 중...' : '후기 등록'}
          </button>
        </div>
      </div>
    </section>
  )
}
