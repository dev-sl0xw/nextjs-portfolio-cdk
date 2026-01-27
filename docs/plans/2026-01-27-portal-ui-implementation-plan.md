# 구인구직 포털 UI 구현 계획

## 개요
BizReach 스타일의 구인구직 포털 UI를 구현합니다. 기능은 나중에 구현하고, UI/레이아웃만 먼저 만듭니다.

## Reference 스크린샷 분석

### 페이지 구조 (BizReach 참고)
1. **마이페이지 (Dashboard)** - 로그인 후 랜딩 페이지
   - 상단 배너/공지
   - 새 메시지 섹션
   - 추천 구인 목록
   - 관심 리스트
   - 스카우트 수신 현황

2. **직무경력서 (Resume)** - 좌측 사이드바 + 콘텐츠 구조
   - 기본정보
   - 희망조건
   - 직무요약/스킬
   - 직무경력
   - 학력
   - 표창
   - 어학력/해외경험
   - 자격

3. **메시지** - 좌측 메시지 목록 + 우측 대화창
4. **구인검색** - 필터 사이드바 + 구인 목록
5. **공모/특집** - 카드 그리드 레이아웃

### 공통 UI 요소
- **헤더**: 로고, 마이페이지, 직무경력서, 메시지, 구인검색, 공모/특집 탭
- **푸터**: 앱 다운로드, 서비스 링크
- **컬러**: 레드 계열 포인트 (#C41E3A 유사)

## 구현 Task 목록

### Task 1: 로그인 후 리다이렉트 변경
**파일**: `frontend/src/app/(auth)/login/page.tsx`
- 로그인 성공 후 `/` → `/mypage`로 변경

### Task 2: 공통 레이아웃 컴포넌트 생성
**파일**: `frontend/src/components/layout/`
- `AuthenticatedHeader.tsx` - 로그인 후 헤더 (탭 네비게이션)
- `Sidebar.tsx` - 직무경력서용 사이드바
- `Footer.tsx` - 공통 푸터

### Task 3: 마이페이지 (Dashboard) 생성
**파일**: `frontend/src/app/(main)/mypage/page.tsx`
- 새 메시지 섹션 (목업)
- 추천 구인 카드 목록 (목업)
- 관심 리스트 (목업)
- 스카우트 현황 (목업)

### Task 4: 직무경력서 페이지 리팩토링
**파일**: `frontend/src/app/(main)/resume/page.tsx`
- 좌측 사이드바 네비게이션
- 섹션별 구분 (기본정보, 희망조건, 직무요약, 직무경력, 학력, 표창, 어학력, 자격)
- 각 섹션 편집 버튼 (UI만)

### Task 5: 메시지 페이지 생성
**파일**: `frontend/src/app/(main)/messages/page.tsx`
- 좌측: 메시지 목록 (탭: 전체, 기업, 헤드헌터)
- 우측: 메시지 상세 (placeholder)

### Task 6: 구인검색 페이지 생성
**파일**: `frontend/src/app/(main)/jobs/page.tsx`
- 좌측: 필터 사이드바 (직종, 업종, 근무지, 연봉, 구인타입)
- 우측: 구인 목록 카드

### Task 7: 공모/특집 페이지 생성
**파일**: `frontend/src/app/(main)/features/page.tsx`
- 카드 그리드 레이아웃
- 이미지 + 제목 + 설명 카드

## 파일 구조

```
frontend/src/
├── app/
│   ├── (auth)/          # 기존 인증 페이지
│   │   ├── login/
│   │   ├── signup/
│   │   └── verify/
│   ├── (main)/          # 로그인 필요 페이지 (신규)
│   │   ├── layout.tsx   # AuthenticatedHeader + Footer
│   │   ├── mypage/
│   │   ├── resume/
│   │   ├── messages/
│   │   ├── jobs/
│   │   └── features/
│   └── page.tsx         # 랜딩 페이지 (비로그인)
├── components/
│   ├── layout/
│   │   ├── AuthenticatedHeader.tsx
│   │   ├── Sidebar.tsx
│   │   └── Footer.tsx
│   └── ui/
│       ├── JobCard.tsx
│       ├── MessageItem.tsx
│       └── FeatureCard.tsx
```

## 스타일 가이드

### 컬러 팔레트
- Primary: `#C41E3A` (BizReach 레드)
- Background: `#F5F5F5`
- Card: `#FFFFFF`
- Text Primary: `#333333`
- Text Secondary: `#666666`
- Border: `#E0E0E0`

### 타이포그래피
- 헤더 탭: 14px, medium
- 섹션 제목: 16px, bold
- 본문: 14px, regular

## 검증 방법

1. **빌드 확인**
```bash
cd frontend && npm run build
```

2. **개발 서버 실행**
```bash
npm run dev
```

3. **페이지 접근 확인**
- `/login` → 로그인 → `/mypage`로 리다이렉트 확인
- 각 탭 네비게이션 동작 확인
- 반응형 레이아웃 확인

## 구현 순서

1. Task 1 (로그인 리다이렉트) → 즉시 테스트 가능
2. Task 2 (공통 컴포넌트) → 다른 페이지의 기반
3. Task 3 (마이페이지) → 로그인 후 첫 화면
4. Task 4-7 (나머지 페이지) → 순차적 구현
