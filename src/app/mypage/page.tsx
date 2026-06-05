// src/app/mypage/page.tsx  (마이페이지 - Server Component)
import { redirect } from 'next/navigation'
import { createServerSupabase } from '@/lib/supabase'
import { getBookmarks } from '@/lib/queries/reviews'

export default async function MyPage() {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const [{ data: profile }, bookmarks, { data: myReviews }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    getBookmarks(user.id),
    supabase
      .from('reviews')
      .select('*, event:events(id, title, category)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
  ])

  return (
    <div className="mypage-section">
      {/* 프로필 카드 */}
      <div className="profile-card">
        <div className="profile-avatar">
          {profile?.nickname?.[0] ?? '이'}
        </div>
        <div>
          <p className="profile-name">{profile?.nickname ?? '이화인'}</p>
          <p className="profile-sub">
            {profile?.major ?? '학과 미설정'}{profile?.grade ? ` · ${profile.grade}학년` : ''}
          </p>
        </div>
      </div>

      {/* 통계 */}
      <div className="stat-row">
        <div className="stat-card">
          <p className="stat-num">{bookmarks.length}</p>
          <p className="stat-label">북마크</p>
        </div>
        <div className="stat-card">
          <p className="stat-num">{myReviews?.length ?? 0}</p>
          <p className="stat-label">작성 후기</p>
        </div>
      </div>

      {/* 북마크 행사 */}
      <h3 className="section-label" style={{ marginBottom: '0.75rem' }}>📎 북마크한 행사</h3>
      {bookmarks.length === 0 ? (
        <p className="empty-text">아직 북마크한 행사가 없어요</p>
      ) : (
        bookmarks.map((b) => (
          <a key={b.event_id} href={`/events/${b.event_id}`} className="review-card">
            <p className="review-event-tag">{b.event?.category}</p>
            <p style={{ fontSize: '13px', fontWeight: 500 }}>{b.event?.title}</p>
            <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
              {b.event?.date} · {b.event?.location}
            </p>
          </a>
        ))
      )}

      {/* 내가 쓴 후기 */}
      <h3 className="section-label" style={{ margin: '1.5rem 0 0.75rem' }}>✏️ 내가 쓴 후기</h3>
      {(myReviews ?? []).length === 0 ? (
        <p className="empty-text">아직 작성한 후기가 없어요</p>
      ) : (
        (myReviews ?? []).map((r: any) => (
          <div key={r.id} className="review-card">
            <a href={`/events/${r.event?.id}`} className="review-event-tag">↗ {r.event?.title}</a>
            <p className="review-text">{r.content}</p>
            <p style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', marginTop: '6px' }}>
              👍 {r.like_count}
            </p>
          </div>
        ))
      )}
    </div>
  )
}
