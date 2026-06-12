// src/app/events/[id]/page.tsx  (행사 상세 페이지)
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { getEvent } from '@/lib/queries/events'
import { getReviews } from '@/lib/queries/reviews'
import { createServerSupabase } from '@/lib/supabase'
import ReviewSection from '@/components/ui/ReviewSection'
import BookmarkButton from '@/components/ui/BookmarkButton'

const CATEGORY_COLOR: Record<string, string> = {
  강연: 'cat-lecture', 세미나: 'cat-seminar', 취업행사: 'cat-career',
  토크콘서트: 'cat-talk', 콜로퀴움: 'cat-colloq', 기타: 'cat-other',
}

const STATUS_LABEL: Record<string, string> = {
  draft: '검수 중', upcoming: '예정', ongoing: '진행 중', ended: '종료',
}

interface Props { params: Promise<{ id: string }> }

export default async function EventDetailPage({ params }: Props) {
  const { id } = await params

  // 현재 로그인 사용자
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()

  const [event, reviews] = await Promise.all([
    getEvent(id),
    getReviews(id, user?.id),
  ])

  if (!event) notFound()

  // 북마크 여부 확인
  let isBookmarked = false
  if (user) {
    const { data } = await supabase
      .from('bookmarks')
      .select('event_id')
      .eq('event_id', id)
      .eq('user_id', user.id)
      .maybeSingle()
    isBookmarked = !!data
  }

  return (
    <div>
      {/* 상세 헤더 */}
      <div className="detail-hero">
        <span className={`cat-badge ${CATEGORY_COLOR[event.category]}`}>
          {event.category}
        </span>
        <h1 className="detail-title">{event.title}</h1>

        {/* 포스터 이미지 */}
        {event.poster_url ? (
          <div className="poster-wrap">
            <Image
              src={event.poster_url}
              alt={`${event.title} 포스터`}
              width={400} height={280}
              className="poster-img"
              priority
            />
          </div>
        ) : (
          <div className="poster-placeholder">
            <span>🖼️</span>
          </div>
        )}

        {/* 기본 정보 */}
        <ul className="detail-metas">
          <li>
            📅 {event.date ?? '날짜 미정'}
            {event.start_time ? ` ${event.start_time}` : ''}
            {event.end_time ? ` ~ ${event.end_time}` : ''}
          </li>
          <li>📍 {event.location ?? '장소 미정'}</li>
          <li>🏢 {event.host}</li>
          {event.target && <li>👥 {event.target}</li>}
        </ul>

        <p className="detail-desc">{event.description}</p>

        {/* 태그 */}
        {event.tags.length > 0 && (
          <div className="tag-row">
            {event.tags.map((tag) => (
              <span key={tag} className="tag">#{tag}</span>
            ))}
          </div>
        )}

        {/* 유의사항 */}
        {event.notes && (
          <div className="notes-box">
            <p className="notes-label">유의사항</p>
            <p className="notes-text">{event.notes}</p>
          </div>
        )}

        {/* 액션 버튼 */}
        <div className="action-row">
          {event.apply_url && (
            <a
              href={event.apply_url}
              target="_blank"
              rel="noopener noreferrer"
              className="apply-btn"
            >
              신청하기 →
            </a>
          )}
          <BookmarkButton
            eventId={event.id}
            initialBookmarked={isBookmarked}
            isLoggedIn={!!user}
          />
        </div>

        <span className={`status-badge status-${event.status}`}>
          {STATUS_LABEL[event.status]}
        </span>
      </div>

      {/* 후기 섹션 */}
      <ReviewSection
        eventId={event.id}
        reviews={reviews}
        userId={user?.id}
        isEnded={event.status === 'ended'}
      />
    </div>
  )
}
