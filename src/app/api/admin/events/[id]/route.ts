// src/app/api/admin/events/[id]/route.ts
// PATCH  /api/admin/events/:id → draft 검수/수정/게시
// DELETE /api/admin/events/:id → draft 반려/삭제

import { NextRequest, NextResponse } from 'next/server'
import { getAdminUser } from '@/lib/admin'
import { createAdminClient } from '@/lib/supabase-admin'
import type { Database } from '@/lib/database.types'

const EDITABLE_FIELDS = [
  'title',
  'category',
  'description',
  'date',
  'start_time',
  'end_time',
  'location',
  'host',
  'apply_url',
  'poster_url',
  'tags',
  'target',
  'notes',
  'status',
] as const

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getAdminUser()
  if (!admin) {
    return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 401 })
  }

  const { id } = await params
  const body = await req.json()

  const updates: Record<string, unknown> = {}
  for (const field of EDITABLE_FIELDS) {
    if (field in body) updates[field] = body[field]
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: '수정할 필드가 없습니다.' }, { status: 400 })
  }

  const supabase = createAdminClient()

  const { data: current, error: fetchError } = await supabase
    .from('events')
    .select('date, start_time, location, status')
    .eq('id', id)
    .single()

  if (fetchError || !current) {
    return NextResponse.json({ error: '행사를 찾을 수 없습니다.' }, { status: 404 })
  }

  const nextStatus = (updates.status as string | undefined) ?? current.status
  if (nextStatus !== 'draft') {
    const date = 'date' in updates ? updates.date : current.date
    const startTime = 'start_time' in updates ? updates.start_time : current.start_time
    const location = 'location' in updates ? updates.location : current.location

    if (!date || !startTime || !location) {
      return NextResponse.json(
        { error: '게시하려면 날짜, 시작 시간, 장소를 모두 입력해야 합니다.' },
        { status: 400 }
      )
    }
  }

  const { data, error } = await supabase
    .from('events')
    .update(updates as Database['public']['Tables']['events']['Update'])
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data })
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getAdminUser()
  if (!admin) {
    return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 401 })
  }

  const { id } = await params
  const supabase = createAdminClient()

  const { error } = await supabase.from('events').delete().eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data: { id } })
}
