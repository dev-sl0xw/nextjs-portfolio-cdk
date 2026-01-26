# 프론트엔드 (Next.js)

[🇯🇵 日本語](./README.md)

BizReach 스타일의 반응형 포트폴리오 사이트입니다.

---

## 🌐 라이브 데모

**CloudFront URL**: [https://d2opqv3ja0x6v5.cloudfront.net](https://d2opqv3ja0x6v5.cloudfront.net)

---

## 기술 스택

| 구분 | 기술 |
| --- | --- |
| 프레임워크 | Next.js 14+ (App Router) |
| 언어 | TypeScript |
| 스타일링 | Tailwind CSS |
| 폰트 | Inter (Google Fonts) |
| 배포 | Docker + EC2 + CloudFront |

---

## 컴포넌트 구조

```text
src/
├── app/
│   ├── layout.tsx      # 루트 레이아웃 (메타데이터, 폰트)
│   ├── page.tsx        # 메인 페이지
│   ├── globals.css     # 글로벌 스타일 (CSS 변수, 유틸리티)
│   └── favicon.ico
│
└── components/
    ├── Header.tsx              # 네비게이션 헤더
    ├── HeroSection.tsx         # 메인 비주얼 섹션
    ├── VideoSection.tsx        # YouTube 비디오 섹션
    ├── VideoPlayer.tsx         # 비디오 플레이어 컴포넌트
    ├── CompanyLogosSection.tsx # 기업 로고 섹션
    ├── ValuePropositionSection.tsx # 가치 제안 섹션
    ├── ProcessFlowSection.tsx  # 프로세스 플로우 섹션
    ├── FAQSection.tsx          # FAQ 아코디언 섹션
    ├── AboutSection.tsx        # 소개 섹션
    └── Footer.tsx              # 푸터
```

---

## 반응형 디자인 패턴

### 1. 모바일/데스크톱 완전 분리 레이아웃

```tsx
{/* 모바일 전용 */}
<section className="md:hidden ...">
  {/* Mobile Layout */}
</section>

{/* 데스크톱 전용 */}
<section className="hidden md:flex ...">
  {/* Desktop Layout */}
</section>
```

### 2. 디바이스별 테마 분기

```tsx
// 모바일: 밝은 배경 + 빨간색 액센트
// 데스크톱: 다크 배경 + amber 액센트
className="bg-white md:bg-slate-950"
className="text-red-600 md:text-amber-500"
```

### 3. 세로 화면 (Portrait) 대응

```tsx
// 세로 모니터에서 이미지 초점 조정
className="object-center portrait:object-[70%_center]"
```

### 4. 반응형 스케일 시스템

```tsx
// 타이포그래피
className="text-xl md:text-5xl lg:text-6xl"

// 스페이싱
className="py-12 md:py-24"
className="gap-3 md:gap-6"

// 아이콘/버튼 크기
className="w-10 h-10 md:w-12 md:h-12"
```

---

## 주요 기능

### Header
- 스크롤 시 배경 블러 효과
- 고정 위치 (sticky navigation)

### HeroSection
- 모바일: 이미지 배경 + 텍스트 오버레이
- 데스크톱: 풀스크린 히어로 이미지
- 스태거 애니메이션으로 순차 등장

### VideoSection
- YouTube iframe 임베드
- 16:9 비율 유지 (`aspect-video`)
- 스크롤 트리거 애니메이션

### ProcessFlowSection
- 4단계 프로세스 카드
- 반응형 그리드 (2열 → 4열)
- 연결선 애니메이션

### FAQSection
- 아코디언 UI
- 상태 관리로 열림/닫힘 제어

---

## 개발 서버

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 빌드
npm run build

# 프로덕션 서버
npm run start

# 린트
npm run lint
```

개발 서버: [http://localhost:3000](http://localhost:3000)

---

## Docker 빌드

```bash
# 이미지 빌드
docker build -t portfolio-frontend .

# 컨테이너 실행
docker run -p 3000:3000 portfolio-frontend
```

---

## 디렉토리 구조

```text
frontend/
├── README.md           # 일본어 버전
├── README.ko.md        # 이 파일
├── package.json
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── Dockerfile
├── public/
│   ├── favicon.ico
│   ├── logo_bizreach.png
│   └── bizreach-banner-model-grok.png
└── src/
    ├── app/
    │   ├── layout.tsx
    │   ├── page.tsx
    │   ├── globals.css
    │   └── favicon.ico
    └── components/
        ├── Header.tsx
        ├── HeroSection.tsx
        ├── VideoSection.tsx
        ├── VideoPlayer.tsx
        ├── CompanyLogosSection.tsx
        ├── ValuePropositionSection.tsx
        ├── ProcessFlowSection.tsx
        ├── FAQSection.tsx
        ├── AboutSection.tsx
        └── Footer.tsx
```

---

## CSS 변수

`globals.css`에서 정의된 디자인 토큰:

```css
:root {
  --color-primary: #f59e0b;        /* Amber 500 */
  --color-primary-light: #fbbf24;  /* Amber 400 */
  --color-primary-dark: #d97706;   /* Amber 600 */

  --color-bg-primary: #020617;     /* Slate 950 */
  --color-bg-secondary: #0f172a;   /* Slate 900 */
  --color-bg-tertiary: #1e293b;    /* Slate 800 */

  --color-text-primary: #f8fafc;   /* Slate 50 */
  --color-text-secondary: #94a3b8; /* Slate 400 */
  --color-text-muted: #64748b;     /* Slate 500 */

  --color-border: #334155;         /* Slate 700 */
  --color-border-light: #475569;   /* Slate 600 */
}
```

---

## 참고 문서

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [React Documentation](https://react.dev/)
