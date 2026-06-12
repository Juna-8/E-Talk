-- =============================================
-- 이화 행사 플랫폼 - 크롤러 출처 추적 + 관리자 검수 큐
-- =============================================

-- =============================================
-- PROFILES: 관리자 플래그
-- =============================================
alter table profiles add column is_admin boolean not null default false;

-- =============================================
-- EVENTS: draft 작성을 위해 NOT NULL 완화
-- =============================================
alter table events alter column date drop not null;
alter table events alter column start_time drop not null;
alter table events alter column location drop not null;

-- =============================================
-- EVENTS: 크롤링 출처 추적 컬럼
-- =============================================
alter table events add column source text;             -- 예: 'ewha_notice'
alter table events add column source_url text;         -- 원문 게시글 URL
alter table events add column source_article_no integer; -- 게시글 번호 (중복 방지용)

-- (source, source_article_no) 유니크 — NULL은 서로 다른 값으로 취급되므로
-- 기존 수동 등록 행(둘 다 NULL)에는 영향 없음
alter table events add constraint events_source_article_unique
  unique (source, source_article_no);

-- =============================================
-- EVENTS: status에 'draft' 추가
-- =============================================
alter table events drop constraint events_status_check;
alter table events add constraint events_status_check
  check (status in ('draft','upcoming','ongoing','ended'));

-- draft가 아닌 상태로 전환되려면 date/start_time/location이 채워져 있어야 함
alter table events add constraint events_published_requires_fields
  check (status = 'draft' or (date is not null and start_time is not null and location is not null));

-- =============================================
-- RLS: events SELECT — 일반 사용자에게는 draft 숨김, 관리자에게는 노출
-- =============================================
drop policy "누구나 행사 조회" on events;

create policy "누구나 행사 조회 (draft 제외)" on events
  for select using (
    status <> 'draft'
    or exists (select 1 from profiles p where p.id = auth.uid() and p.is_admin = true)
  );

-- =============================================
-- RLS: events UPDATE/DELETE — 관리자만 (draft 검수/게시/반려)
-- =============================================
create policy "관리자 행사 수정" on events
  for update using (
    exists (select 1 from profiles p where p.id = auth.uid() and p.is_admin = true)
  );

create policy "관리자 행사 삭제" on events
  for delete using (
    exists (select 1 from profiles p where p.id = auth.uid() and p.is_admin = true)
  );

-- =============================================
-- 관리자 권한 부여 (배포 후 본인 계정으로 직접 실행)
-- =============================================
-- update profiles set is_admin = true where email = 'YOUR_EMAIL';
