// src/components/ui/FilterBar.tsx  (Client Component)
'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useCallback } from 'react'
import type { EventFilters, EventCategory } from '@/types'

const CATEGORIES: (EventCategory | '전체')[] = ['전체', '강연', '세미나', '취업행사', '토크콘서트', '콜로퀴움']
const STATUSES = [
  { value: '전체', label: '전체 상태' },
  { value: 'upcoming', label: '예정' },
  { value: 'ongoing',  label: '진행 중' },
  { value: 'ended',    label: '종료' },
]

interface Props { currentFilters: EventFilters }

export default function FilterBar({ currentFilters }: Props) {
  const router = useRouter()
  const pathname = usePathname()

  const updateFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams()
      if (currentFilters.category && currentFilters.category !== '전체') params.set('category', currentFilters.category)
      if (currentFilters.status   && currentFilters.status   !== '전체') params.set('status', currentFilters.status)
      if (currentFilters.query) params.set('q', currentFilters.query)

      if (value === '전체' || value === '') {
        params.delete(key)
      } else {
        params.set(key, value)
      }
      router.push(`${pathname}?${params.toString()}`)
    },
    [currentFilters, pathname, router]
  )

  function handleSearch(e: React.ChangeEvent<HTMLInputElement>) {
    const q = e.target.value
    const params = new URLSearchParams()
    if (currentFilters.category && currentFilters.category !== '전체') params.set('category', currentFilters.category)
    if (currentFilters.status   && currentFilters.status   !== '전체') params.set('status',   currentFilters.status)
    if (q) params.set('q', q)
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="filter-bar">
      {/* 검색창 */}
      <div className="search-wrap">
        <span className="search-icon">🔍</span>
        <input
          type="text"
          className="search-box"
          placeholder="행사 이름, 주최, 키워드로 검색..."
          defaultValue={currentFilters.query}
          onChange={handleSearch}
        />
      </div>

      {/* 카테고리 필터 */}
      <div className="filter-row">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            className={`filter-pill${currentFilters.category === cat || (!currentFilters.category && cat === '전체') ? ' active' : ''}`}
            onClick={() => updateFilter('category', cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 상태 필터 */}
      <div className="filter-row">
        {STATUSES.map((s) => (
          <button
            key={s.value}
            className={`filter-pill filter-pill-sm${currentFilters.status === s.value || (!currentFilters.status && s.value === '전체') ? ' active' : ''}`}
            onClick={() => updateFilter('status', s.value)}
          >
            {s.label}
          </button>
        ))}
      </div>
    </div>
  )
}
