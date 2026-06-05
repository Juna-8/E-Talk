// src/app/community/page.tsx  (커뮤니티 - 인기/최신/종료 행사 후기)
import { createServerSupabase } from '@/lib/supabase'

export default async function CommunityPage() {
  const supabase = await createServerSupabase()

  // 인기 후기 (좋아요 많은 순)
  const { data: popularReviews } = await supabase
    .from('reviews')
    .select(`
      *,
      profile:profiles(nickname, major),
      event:events(id, title, category)
    `)
    .order('like_count', { ascending: false })
    .limit(10)

  // 종료된 행사 후기
  const { data: endedReviews } = await supabase
    .from('reviews')
    .select(`
      *,
      profile:profiles(nickname, major),
      event:events!inner(id, title, category, status)
    `)
    .eq('events.status', 'ended')
    .order('created_at', { ascending: false })
    .limit(10)

  return (
    <div className="section">
      <h2 className="section-label" style={{ marginBottom: '1rem' }}>커뮤니티</h2>

      <h3 className="section-label" style={{ marginBottom: '0.5rem' }}>🔥 인기 후기</h3>
      {(popularReviews ?? []).map((r: any) => (
        <div key={r.id} className="review-card">
          <a href={`/events/${r.event?.id}`} className="review-event-tag">
            ↗ {r.event?.title}
          </a>
          <p className="review-text">{r.content}</p>
          <div className="review-footer">
            <span className="reviewer">
              <span className="avatar">{r.profile?.nickname?.[0]}</span>
              {r.profile?.nickname}
            </span>
            <span className="like-count">👍 {r.like_count}</span>
          </div>
        </div>
      ))}

      <h3 className="section-label" style={{ margin: '1.5rem 0 0.5rem' }}>💬 종료 행사 토론</h3>
      {(endedReviews ?? []).map((r: any) => (
        <div key={r.id} className="review-card">
          <a href={`/events/${r.event?.id}`} className="review-event-tag">
            ↗ {r.event?.title}
          </a>
          <p className="review-text">{r.content}</p>
          <div className="review-footer">
            <span className="reviewer">
              <span className="avatar">{r.profile?.nickname?.[0]}</span>
              {r.profile?.nickname}
            </span>
            <span className="like-count">👍 {r.like_count}</span>
          </div>
        </div>
      ))}
    </div>
  )
}
