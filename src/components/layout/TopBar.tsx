// src/components/layout/TopBar.tsx
import Link from 'next/link'

export default function TopBar() {
  return (
    <header className="top-bar">
      <Link href="/" className="top-bar-logo">
        🌸 이화 행사
      </Link>
    </header>
  )
}
