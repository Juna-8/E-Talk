// src/app/page.tsx  (홈 화면 - Server Component)
import { getEvents, getTodayEvents } from '@/lib/queries/events'
import EventCard from '@/components/ui/EventCard'
import FilterBar from '@/components/ui/FilterBar'
import type { EventFilters } from '@/types'

interface HomePageProps {
  searchParams: Promise<Record<string, string>>
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams

  // URL 쿼리스트링으로 필터 처리 (서버사이드)
  const filters: EventFilters = {
    category: (params.category as any) || '전체',
    status:   (params.status   as any) || '전체',
    query:    params.q || '',
    tag:      params.tag || '',
  }

  const [events, todayEvents] = await Promise.all([
    getEvents(filters),
    getTodayEvents(),
  ])

  return (
    <div>
      {/* 히어로 섹션 */}
      <section className="hero">
        <h1 className="hero-title">오늘도 기회가 기다리고 있어요 ✦</h1>
        <p className="hero-sub">이화 캠퍼스의 모든 행사를 한눈에</p>
        <FilterBar currentFilters={filters} />
      </section>

      {/* 오늘 행사 배너 */}
      {todayEvents.length > 0 && (
        <div className="today-strip">
          <span className="today-icon">⚡</span>
          <div>
            <p className="today-title">오늘 열리는 행사</p>
            <p className="today-sub">지금 참여 가능한 행사가 있어요</p>
          </div>
          <span className="today-badge">{todayEvents.length}개</span>
        </div>
      )}

      {/* 행사 목록 */}
      <section className="section">
        <div className="section-head">
          <span className="section-label">전체 행사</span>
          <span className="count-label">총 {events.length}개</span>
        </div>

        {events.length === 0 ? (
          <div className="empty-state">
            <span>📭</span>
            <p>검색 결과가 없어요</p>
          </div>
        ) : (
          <div className="event-grid">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
