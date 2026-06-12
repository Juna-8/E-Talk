// src/app/admin/events/page.tsx  (관리자 검수 페이지 - Server Component)
import { redirect } from 'next/navigation'
import { getAdminUser } from '@/lib/admin'
import { getDraftEvents } from '@/lib/queries/events'
import DraftEventCard from '@/components/ui/DraftEventCard'
import CrawlButton from '@/components/ui/CrawlButton'

export default async function AdminEventsPage() {
  const admin = await getAdminUser()
  if (!admin) redirect('/')

  const drafts = await getDraftEvents()

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1 className="admin-title">검수 대기 행사</h1>
        <span className="count-label">총 {drafts.length}개</span>
      </div>

      <CrawlButton />

      {drafts.length === 0 ? (
        <div className="empty-state">
          <span>📭</span>
          <p>검수 대기 중인 행사가 없어요</p>
        </div>
      ) : (
        <div className="draft-list">
          {drafts.map((event) => (
            <DraftEventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  )
}
