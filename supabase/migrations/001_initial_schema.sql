-- =============================================
-- 이화 행사 플랫폼 - Supabase Schema
-- =============================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- =============================================
-- PROFILES (학생 프로필)
-- =============================================
create table profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text unique not null,
  nickname    text not null default '이화인',
  major       text,
  grade       int check (grade between 1 and 6),
  interests   text[] default '{}',   -- ['취업', '공학', '인문', ...]
  created_at  timestamptz default now()
);

-- =============================================
-- EVENTS (행사)
-- =============================================
create table events (
  id            uuid primary key default uuid_generate_v4(),
  title         text not null,
  category      text not null check (category in ('강연','세미나','토크콘서트','취업행사','콜로퀴움','기타')),
  description   text not null,
  date          date not null,
  start_time    time not null,
  end_time      time,
  location      text not null,
  host          text not null,
  apply_url     text,
  poster_url    text,
  tags          text[] default '{}',
  target        text,               -- 참석 대상
  notes         text,               -- 유의사항
  status        text not null default 'upcoming'
                check (status in ('upcoming','ongoing','ended')),
  created_by    uuid references profiles(id),
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- 날짜/카테고리/상태 인덱스
create index idx_events_date     on events(date);
create index idx_events_category on events(category);
create index idx_events_status   on events(status);

-- =============================================
-- REVIEWS (후기)
-- =============================================
create table reviews (
  id          uuid primary key default uuid_generate_v4(),
  event_id    uuid not null references events(id) on delete cascade,
  user_id     uuid not null references profiles(id) on delete cascade,
  content     text not null check (char_length(content) between 5 and 1000),
  like_count  int not null default 0,
  created_at  timestamptz default now()
);

create index idx_reviews_event on reviews(event_id);

-- =============================================
-- REVIEW_LIKES (공감)
-- =============================================
create table review_likes (
  review_id   uuid not null references reviews(id) on delete cascade,
  user_id     uuid not null references profiles(id) on delete cascade,
  primary key (review_id, user_id)
);

-- like_count 자동 갱신 트리거
create or replace function update_like_count()
returns trigger language plpgsql as $$
begin
  if TG_OP = 'INSERT' then
    update reviews set like_count = like_count + 1 where id = NEW.review_id;
  elsif TG_OP = 'DELETE' then
    update reviews set like_count = like_count - 1 where id = OLD.review_id;
  end if;
  return null;
end;
$$;

create trigger trg_like_count
after insert or delete on review_likes
for each row execute function update_like_count();

-- =============================================
-- BOOKMARKS (북마크)
-- =============================================
create table bookmarks (
  event_id    uuid not null references events(id) on delete cascade,
  user_id     uuid not null references profiles(id) on delete cascade,
  created_at  timestamptz default now(),
  primary key (event_id, user_id)
);

create index idx_bookmarks_user on bookmarks(user_id);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- profiles
alter table profiles enable row level security;
create policy "누구나 프로필 조회" on profiles for select using (true);
create policy "본인 프로필 수정" on profiles for update using (auth.uid() = id);

-- events
alter table events enable row level security;
create policy "누구나 행사 조회" on events for select using (true);
create policy "인증 사용자 행사 등록" on events for insert with check (auth.role() = 'authenticated');

-- reviews
alter table reviews enable row level security;
create policy "누구나 후기 조회" on reviews for select using (true);
create policy "인증 사용자 후기 작성" on reviews for insert with check (auth.uid() = user_id);
create policy "본인 후기 삭제" on reviews for delete using (auth.uid() = user_id);

-- review_likes
alter table review_likes enable row level security;
create policy "누구나 좋아요 조회" on review_likes for select using (true);
create policy "인증 사용자 좋아요" on review_likes for insert with check (auth.uid() = user_id);
create policy "본인 좋아요 취소" on review_likes for delete using (auth.uid() = user_id);

-- bookmarks
alter table bookmarks enable row level security;
create policy "본인 북마크 조회" on bookmarks for select using (auth.uid() = user_id);
create policy "본인 북마크 추가" on bookmarks for insert with check (auth.uid() = user_id);
create policy "본인 북마크 삭제" on bookmarks for delete using (auth.uid() = user_id);

-- =============================================
-- SAMPLE DATA
-- =============================================
insert into events (title, category, description, date, start_time, end_time, location, host, tags, target, status) values
('AI 시대의 여성 리더십', '강연', 'AI 산업에서 여성 리더의 역할과 미래 가능성에 대한 특별 강연입니다.', '2025-06-10', '16:00', '18:00', 'ECC B112', '학생처', '{"인공지능","리더십","취업"}', '전교생', 'upcoming'),
('2025 상반기 취업 박람회', '취업행사', '국내외 주요 기업 50여 개사가 참여하는 대규모 취업 박람회입니다.', '2025-06-08', '10:00', '17:00', '학생문화관 대강당', '취업지원센터', '{"취업","채용","면접"}', '졸업예정자, 재학생', 'ongoing'),
('환경공학 콜로퀴움', '콜로퀴움', '도시 환경에서의 탄소중립 달성 방안을 논의하는 학술 콜로퀴움입니다.', '2025-06-12', '15:00', '17:00', '공학관 403호', '환경공학과', '{"환경","탄소중립","공학"}', '공학 계열 학생', 'upcoming'),
('나의 진로를 찾아서', '토크콘서트', '다양한 분야에서 활동하는 이화 선배들의 진로 이야기를 들을 수 있습니다.', '2025-06-05', '18:00', '20:00', 'ECC 씨네큐브', '커리어개발팀', '{"진로","선배","토크"}', '전교생', 'ended'),
('디지털 마케팅 실무 세미나', '세미나', '현직 디지털 마케팅 전문가와 함께하는 실무 중심 세미나입니다.', '2025-06-15', '14:00', '16:00', '경영관 207호', '경영학과·마케팅학회', '{"마케팅","디지털","실무"}', '경영 계열 학생', 'upcoming');
