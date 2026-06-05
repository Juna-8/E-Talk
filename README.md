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
│   │   └── api/
│   │       ├── reviews/route.ts       # 후기 GET/POST
│   │       ├── reviews/[id]/like/     # 좋아요 토글
│   │       └── bookmarks/route.ts     # 북마크 GET/POST
│   ├── components/
│   │   ├── ui/
│   │   │   ├── EventCard.tsx          # 행사 카드
│   │   │   ├── FilterBar.tsx          # 필터 바
│   │   │   ├── ReviewSection.tsx      # 후기 섹션
│   │   │   └── BookmarkButton.tsx     # 북마크 버튼
│   │   └── layout/
│   │       ├── TopBar.tsx             # 상단 네비
│   │       └── BottomNav.tsx          # 하단 탭 바
│   ├── lib/
│   │   ├── supabase.ts                # Supabase 클라이언트
│   │   └── queries/
│   │       ├── events.ts              # 행사 쿼리
│   │       └── reviews.ts             # 후기/북마크 쿼리
│   └── types/index.ts                 # TypeScript 타입
├── supabase/migrations/
│   └── 001_initial_schema.sql         # DB 스키마
├── .env.example
├── package.json
└── README.md
```

---

## 시작하기

### 1. Supabase 프로젝트 생성

1. [supabase.com](https://supabase.com) → 새 프로젝트 생성
2. SQL Editor에서 `supabase/migrations/001_initial_schema.sql` 실행
3. Authentication > Providers > Email 활성화
4. Project Settings > API에서 URL과 anon key 복사

### 2. 환경 변수 설정

```bash
cp .env.example .env.local
# .env.local에 Supabase URL과 anon key 입력
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
