# 이화 행사 플랫폼 (Ewha Events) — MVP

> 교내의 모든 지식·진로·교류의 기회를 놓치지 않도록 연결하는 학생 중심 행사 플랫폼

---

## 기술 스택

| 레이어 | 기술 |
|--------|------|
| 프레임워크 | Next.js 15 (App Router) |
| 언어 | TypeScript |
| 백엔드/DB | Supabase (PostgreSQL + Auth + Storage) |
| 스타일링 | CSS Modules 또는 Tailwind CSS |
| 배포 | Vercel |

---

## 프로젝트 구조

```
ewha-events/
├── src/
│   ├── app/
│   │   ├── page.tsx                   # 홈 (행사 목록)
│   │   ├── layout.tsx                 # 루트 레이아웃
│   │   ├── events/[id]/page.tsx       # 행사 상세
│   │   ├── community/page.tsx         # 커뮤니티
│   │   ├── mypage/page.tsx            # 마이페이지
│   │   ├── admin/events/page.tsx      # 관리자 검수 페이지 (draft 검토/게시)
│   │   └── api/
│   │       ├── reviews/route.ts       # 후기 GET/POST
│   │       ├── reviews/[id]/like/     # 좋아요 토글
│   │       ├── bookmarks/route.ts     # 북마크 GET/POST
│   │       └── admin/
│   │           ├── crawl/route.ts         # 크롤러 수동/Cron 실행
│   │           └── events/[id]/route.ts   # draft 수정(게시)/삭제
│   ├── components/
│   │   ├── ui/
│   │   │   ├── EventCard.tsx          # 행사 카드
│   │   │   ├── FilterBar.tsx          # 필터 바
│   │   │   ├── ReviewSection.tsx      # 후기 섹션
│   │   │   ├── BookmarkButton.tsx     # 북마크 버튼
│   │   │   ├── DraftEventCard.tsx     # 관리자 검수용 draft 카드
│   │   │   └── CrawlButton.tsx        # 관리자 - 수동 크롤링 실행 버튼
│   │   └── layout/
│   │       ├── TopBar.tsx             # 상단 네비
│   │       └── BottomNav.tsx          # 하단 탭 바
│   ├── lib/
│   │   ├── supabase.ts                # Supabase 클라이언트 (세션 기반)
│   │   ├── supabase-admin.ts          # Supabase 서비스 롤 클라이언트 (서버 전용, RLS 우회)
│   │   ├── admin.ts                   # 관리자 권한 확인 헬퍼
│   │   ├── crawler/                   # 이화 공지사항 크롤러
│   │   │   ├── listPage.ts            # 목록 페이지 fetch/parse
│   │   │   ├── detailPage.ts          # 상세 페이지 fetch/parse
│   │   │   ├── filters.ts             # 제목 키워드 필터
│   │   │   ├── category.ts            # 카테고리 추정
│   │   │   ├── fieldExtractor.ts      # 일시/장소/신청 정보 추출
│   │   │   ├── buildEvent.ts          # CrawledEvent 생성
│   │   │   └── runner.ts              # 크롤링 오케스트레이션 (runCrawl)
│   │   └── queries/
│   │       ├── events.ts              # 행사 쿼리 (getDraftEvents 포함)
│   │       └── reviews.ts             # 후기/북마크 쿼리
│   └── types/index.ts                 # TypeScript 타입
├── scripts/
│   └── crawl-ewha-notice.ts           # 크롤러 수동 실행 CLI (npm run crawl)
├── supabase/migrations/
│   ├── 001_initial_schema.sql         # DB 스키마
│   └── 002_crawler_and_admin.sql      # 크롤러/관리자 권한/draft 워크플로 마이그레이션
├── vercel.json                        # Vercel Cron (크롤러 자동 실행)
├── .env.example
├── package.json
└── README.md
```

---

## 시작하기

### 1. Supabase 프로젝트 생성

1. [supabase.com](https://supabase.com) → 새 프로젝트 생성
2. SQL Editor에서 `supabase/migrations/001_initial_schema.sql` 실행 후 `002_crawler_and_admin.sql` 실행
3. Authentication > Providers > Email 활성화
4. Project Settings > API에서 URL, anon key, **service_role key** 복사

### 2. 환경 변수 설정

```bash
cp .env.example .env.local
# .env.local에 Supabase URL, anon key, service role key 입력
# (CRON_SECRET은 로컬에서는 필요 없고, Vercel 배포 시 등록)
```

### 3. 의존성 설치 및 실행

```bash
npm install
npm run dev
# → http://localhost:3000
```

### 4. Vercel 배포

```bash
# Vercel CLI
npm i -g vercel
vercel --env NEXT_PUBLIC_SUPABASE_URL=... --env NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

---

## 크롤러 & 관리자 검수

이화여대 공지사항(https://www.ewha.ac.kr/ewha/news/notice.do)에서 제목에 `콜로키움`/`콜로퀴움`/`강연`/`세미나`/
`인재개발원`이 포함된 글을 자동으로 가져와 `events` 테이블에 `status='draft'`로 저장합니다. 본문이 포스터
이미지뿐인 글이 많아 날짜·시간·장소 추출이 완벽하지 않을 수 있으므로, draft는 `/admin/events` 검수 페이지에서
관리자가 확인/수정 후 게시해야 일반 사용자에게 노출됩니다.

### 관리자 권한 부여

```sql
update profiles set is_admin = true where email = 'YOUR_EMAIL';
```

### 수동 크롤링 실행

```bash
npm run crawl
```

`{ scanned, matched, inserted, skipped, errors }` 형태의 결과가 콘솔에 출력됩니다. 내부적으로
`runCrawl()`을 호출하며, `/admin/events`의 "지금 크롤링 실행" 버튼과 동일한 코드 경로입니다.

### 검수 페이지

1. `npm run dev` → 관리자 계정으로 로그인 후 `/admin/events` 접속
2. draft 카드에서 추출된 제목/날짜/시간/장소/포스터/원문 링크 확인, 누락된 필드 입력
3. "게시" → 날짜/시간/장소가 모두 입력되어야 하며, 게시 후 홈 목록에 노출됩니다
4. "삭제" → 해당 draft를 반려(삭제). 재크롤링 시 동일 글은 `(source, source_article_no)` 기준 중복
   제거되어 다시 생성되지 않습니다

### Vercel Cron 자동화

`vercel.json`에 매일 03:00 UTC(12:00 KST)마다 `GET /api/admin/crawl`을 호출하는 cron이 설정되어 있습니다.
Vercel 프로젝트 환경 변수에 `CRON_SECRET`(임의의 긴 랜덤 문자열)과 `SUPABASE_SERVICE_ROLE_KEY`를 등록하면,
Vercel이 cron 요청에 `Authorization: Bearer $CRON_SECRET`을 자동으로 첨부합니다.

---

## MVP 구현 기능

- [x] 행사 목록 조회 (카드 형태)
- [x] 카테고리 / 상태 / 검색어 필터
- [x] 행사 상세 페이지 (포스터, 신청 링크, 태그)
- [x] 후기 작성 및 열람
- [x] 좋아요(공감) 기능
- [x] 북마크 저장/해제
- [x] 마이페이지 (북마크 목록, 내 후기)
- [x] 커뮤니티 (인기 후기 / 종료 행사 토론)
- [x] Supabase Auth 연동 (이메일 로그인)
- [x] Row Level Security (사용자별 데이터 보호)
- [x] 이화 공지사항 크롤러 (콜로키움/강연/세미나/인재개발원) + 관리자 검수 큐

## 추후 기능 (v2)

- [ ] AI 행사 요약 (OpenAI API)
- [ ] 푸시 알림 (Supabase Realtime + FCM)
- [ ] 관심 분야 기반 추천
- [ ] 주최 측 관리자 대시보드
- [ ] 행사 일정 캘린더 고도화

---

## 데이터베이스 ERD

```
profiles ──< reviews >── events
    │               └──< review_likes
    └──────────────────── bookmarks >── events
```

---

## 기여

이화여자대학교 재학생 대상 플랫폼입니다.
버그 제보 및 기능 제안은 Issues로 남겨주세요.
