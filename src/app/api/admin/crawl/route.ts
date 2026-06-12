// src/app/api/admin/crawl/route.ts
// POST → 관리자 세션으로 수동 크롤링 실행
// GET  → Vercel Cron (Authorization: Bearer CRON_SECRET) 자동 크롤링 실행

import { NextRequest, NextResponse } from 'next/server'
import { getAdminUser } from '@/lib/admin'
import { runCrawl } from '@/lib/crawler/runner'

export async function POST() {
  const admin = await getAdminUser()
  if (!admin) {
    return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 401 })
  }

  try {
    const result = await runCrawl()
    return NextResponse.json({ data: result })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET
  const authHeader = req.headers.get('authorization')

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 })
  }

  try {
    const result = await runCrawl({ maxPages: 2 })
    return NextResponse.json({ data: result })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
