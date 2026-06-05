// src/app/layout.tsx
import type { Metadata } from 'next'
import './globals.css'
import BottomNav from '@/components/layout/BottomNav'
import TopBar from '@/components/layout/TopBar'

export const metadata: Metadata = {
  title: '이화 행사 | Ewha Events',
  description: '교내의 모든 지식·진로·교류의 기회를 놓치지 않도록 연결하는 학생 중심 행사 플랫폼',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <TopBar />
        <main className="main-content">{children}</main>
        <BottomNav />
      </body>
    </html>
  )
}
