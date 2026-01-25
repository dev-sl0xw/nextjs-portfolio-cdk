# 요구사항 정의서

[🇯🇵 日本語](./requirements.md)

---

## 1. 프로젝트 개요

### 1.1 목적

- 면접에서 자기 어필을 위한 포트폴리오 사이트 MVP 개발

### 1.2 타겟

- 타겟 기업: BizReach (https://www.bizreach.jp/)

### 1.3 개발 원칙

- 작고 빠르게 시작하여 점진적으로 개선
- AWS FreeTier 범위 내에서 비용 최적화
- 모든 기술 선택에 대해 근거를 주석으로 명시

---

## 2. 기술 스택

### 2.1 인프라

| 구분 | 기술 | 버전 |
| --- | --- | --- |
| IaC | AWS CDK | 2.x |
| 언어 | TypeScript | 5.x |
| 클라우드 | AWS (FreeTier) | - |

### 2.2 프론트엔드

| 구분 | 기술 | 용도 |
| --- | --- | --- |
| 메인 사이트 | Next.js 14+ | 랜딩 페이지 (Docker 컨테이너) |
| 에러 페이지 | Astro | 404 페이지 (정적 빌드) |
| 스타일링 | Tailwind CSS | 유틸리티 기반 CSS |
| 언어 | TypeScript | 타입 안전성 |

### 2.3 CI/CD

| 구분 | 기술 |
| --- | --- |
| 파이프라인 | GitHub Actions |
| 컨테이너 레지스트리 | Amazon ECR |

---

## 3. AWS 아키텍처

### 3.1 네트워크 구성

#### VPC

| 항목 | 값 | 비고 |
| --- | --- | --- |
| VPC CIDR | 10.0.0.0/16 | 65,536 IPs |
| Public Subnet AZ-a | 10.0.1.0/24 | ALB + EC2 |
| Public Subnet AZ-c | 10.0.2.0/24 | ALB (고가용성) |

#### 설계 결정 사항

| 항목 | 결정 | 이유 |
| --- | --- | --- |
| Private Subnet | ❌ 제거 | NAT Gateway 비용 절감 (~$30-45/월) |
| NAT Gateway | ❌ 제거 | FreeTier 범위 유지 |

### 3.2 컴퓨팅

#### EC2

| 항목 | 값 |
| --- | --- |
| 인스턴스 타입 | t2.micro 또는 t3.micro (FreeTier) |
| 배치 | Public Subnet AZ-a |
| 실행 환경 | Docker + Next.js 컨테이너 |

#### 로드밸런서

| 항목 | 값 | 이유 |
| --- | --- | --- |
| 타입 | ALB (Application Load Balancer) | L7에서 HTTP 헤더 분석 필요 |
| 배치 | Public Subnet (2 AZ) | AWS 요구사항: 최소 2 AZ |

### 3.3 CDN 및 스토리지

#### CloudFront

| 항목 | 값 |
| --- | --- |
| 도메인 | CloudFront 기본 도메인 (*.cloudfront.net) |
| SSL/TLS | ACM 인증서 (HTTPS) |
| Origin | ALB (메인), S3 (에러 페이지) |
| 에러 응답 | 404 → S3의 404.html로 리다이렉트 |

#### S3

| 항목 | 값 |
| --- | --- |
| 용도 | 404 에러 페이지 호스팅, 영상 파일 호스팅 |
| 접근 제어 | OAC (Origin Access Control) |
| 퍼블릭 액세스 | 차단 (CloudFront를 통해서만 접근) |

### 3.4 보안

#### Security Group (Stateful)

| 대상 | Inbound | Outbound |
| --- | --- | --- |
| ALB SG | CloudFront → 80 | 자동 허용 (Stateful) |
| EC2 SG | ALB SG → 3000 | 자동 허용 (Stateful) |

#### NACL (Stateless)

| 방향 | 포트 | 용도 |
| --- | --- | --- |
| Inbound | 80 | HTTP 트래픽 |
| Outbound | 1024-65535 | Ephemeral 포트 응답 |

#### WAF

| 항목 | 값 |
| --- | --- |
| 적용 여부 | ❌ 문서화만 (비용 절감) |
| 권장 사항 | 프로덕션에서는 AWSManagedRulesCommonRuleSet 적용 권장 |

### 3.5 DNS (문서화만)

#### Route53

| 항목 | 값 |
| --- | --- |
| 적용 여부 | ❌ 문서화만 |
| 이유 | 면접 시연에 커스텀 도메인 불필요, 비용 절감 |
| 권장 사항 | 프로덕션에서는 Route53 + 커스텀 도메인 적용 권장 |

---

## 4. CI/CD 파이프라인

### 4.1 Next.js 배포 워크플로우

```text
Push to main → Test (lint, test) → Docker Build → Push to ECR → Deploy to EC2
```

| 단계 | 설명 |
| --- | --- |
| Test | ESLint, TypeScript 검사, 단위 테스트 |
| Docker Build | Next.js 앱 Docker 이미지 빌드 |
| Push to ECR | Amazon ECR에 이미지 푸시 |
| Deploy to EC2 | SSH로 EC2 접속 → docker pull → docker run |

### 4.2 Astro 배포 워크플로우

```text
Push to main → Build Astro → Upload to S3
```

| 단계 | 설명 |
| --- | --- |
| Build | Astro 정적 빌드 |
| Upload | S3 버킷에 404.html 업로드 |

---

## 5. 프론트엔드 요구사항

### 5.1 컴포넌트 구성

| 컴포넌트 | 내용 |
| --- | --- |
| `Header` | 네비게이션, 스크롤 시 블러 효과, 로고 |
| `HeroSection` | 메인 비주얼, 모바일/데스크톱 완전 분리 레이아웃, CTA 버튼 |
| `VideoSection` | YouTube 임베드, 반응형 16:9 비율, 스크롤 애니메이션 |
| `CompanyLogosSection` | 기업 로고 캐러셀, 자동 슬라이드 |
| `ValuePropositionSection` | 3가지 핵심 가치 카드, 수치 강조 |
| `ProcessFlowSection` | 4단계 서비스 이용 플로우, 연결선 |
| `FAQSection` | 아코디언 형태 FAQ, 펼침/접힘 애니메이션 |
| `AboutSection` | 소개 섹션 |
| `Footer` | 저작권 표시, 소셜 링크 |

### 5.2 반응형 디자인 전략

#### 모바일/데스크톱 완전 분리 패턴

```tsx
{/* 모바일 전용 */}
<section className="md:hidden">
  {/* 모바일 레이아웃 */}
</section>

{/* 데스크톱 전용 */}
<section className="hidden md:flex">
  {/* 데스크톱 레이아웃 */}
</section>
```

#### 디바이스별 테마 분기

| 디바이스 | 배경 | 포인트 색상 |
| --- | --- | --- |
| 모바일 | 밝은 배경 (white, slate-100) | 빨간색 (red-600) |
| 데스크톱 | 다크 배경 (slate-900, slate-950) | amber 계열 (amber-400~600) |

#### 크로스 플랫폼 대응

| 항목 | Tailwind 수정자 | 용도 |
| --- | --- | --- |
| 브레이크포인트 | `md:`, `lg:` | 태블릿/데스크톱 분기 |
| 세로 화면 대응 | `portrait:` | 세로 모드 이미지 초점 조정 |
| 반응형 스케일 | `text-sm md:text-base` | 타이포그래피 크기 조정 |
| 간격 조정 | `p-4 md:p-8` | 스페이싱 크기 조정 |

### 5.3 애니메이션

| 효과 | 구현 |
| --- | --- |
| 스크롤 페이드인 | `IntersectionObserver` + CSS transition |
| Staggered reveal | `transitionDelay` 활용 순차 등장 |
| 호버 효과 | `group-hover:`, `hover:` 유틸리티 |
| 버튼 인터랙션 | `hover:-translate-y-1`, `shadow` 변화 |

### 5.4 영상 삽입

| 항목 | 값 |
| --- | --- |
| 방식 | YouTube iframe 임베드 |
| 비율 | 16:9 (`aspect-video`) |
| 반응형 | `w-full` + `aspect-video` 조합 |

### 5.5 디자인 가이드

| 항목 | 값 |
| --- | --- |
| 참고 | BizReach (https://www.bizreach.jp/) |
| 톤 | 하이클래스 채용 서비스 스타일 - 고급스럽고 전문적 |
| 색상 | 모바일: red 계열 / 데스크톱: amber + 다크 배경 |
| 폰트 | 시스템 폰트 + 일본어 지원 |
| 모션 | 스크롤 기반 staggered reveal 애니메이션 |

### 5.6 언어

| 대상 | 언어 |
| --- | --- |
| 랜딩 페이지 콘텐츠 | 일본어 |
| 코드 주석 | 한국어 + 일본어 (이중 언어) |

---

## 6. 문서 규칙

### 6.1 README 작성 규칙

| 파일 | 언어 | 비고 |
| --- | --- | --- |
| `README.md` | 일본어 (메인) | 프로젝트 메인 README |
| `README.ko.md` | 한국어 | 한국어 버전 |

#### 상호 링크

각 README 상단에 다른 언어 버전 링크 추가:

```markdown
# README.md (일본어)
[🇰🇷 한국어](./README.ko.md)

# README.ko.md (한국어)
[🇯🇵 日本語](./README.md)
```

#### 내용 동기화

- 두 파일의 내용은 항상 동기화 유지
- 한 파일 수정 시 다른 파일도 함께 수정
- 언어 혼용 금지 (각 파일은 단일 언어로 작성)

### 6.2 코드 주석 규칙

- 한국어 주석 바로 아래에 일본어 번역
- 비즈니스 레벨 (N1~) 일본어 사용
- 직역 금지, 자연스러운 의역 권장

```typescript
// 사용자 인증을 처리하는 함수
// ユーザー認証を処理する関数
function handleAuth() {
  // ...
}
```

---

## 7. 가드레일 (rules/)

### 7.1 파일 구조

```text
rules/
├── code-style.md           # TypeScript, 네이밍 컨벤션
├── aws-best-practices.md   # 태그, 리소스 네이밍, 비용
├── security.md             # 시크릿 금지, 최소 권한
├── network-security.md     # SG/NACL, Stateful/Stateless, OSI 7계층
└── bilingual-comments.md   # 한국어/일본어 주석 규칙
```

### 7.2 주요 규칙

#### code-style.md

- TypeScript strict mode 필수
- 컴포넌트: PascalCase, 함수/변수: camelCase, 상수: UPPER_SNAKE_CASE

#### aws-best-practices.md

- 모든 리소스에 태그 필수 (Project, Environment, ManagedBy)
- 기술 선택 근거를 주석으로 명시
- FreeTier 초과 리소스 사용 시 비용 명시

#### security.md

- 하드코딩된 시크릿/API 키 절대 금지
- .env 파일 git 커밋 금지
- Security Group: 최소 권한 원칙

#### network-security.md

- OSI 7계층과 AWS 서비스 매핑 이해
- Security Group (Stateful) vs NACL (Stateless) 구분
- CDK 코드에 트래픽 흐름 주석 필수

#### bilingual-comments.md

- 한국어 주석 바로 아래에 일본어 번역
- 비즈니스 레벨 (N1~) 일본어 사용
- 직역 금지, 자연스러운 의역 권장

---

## 8. 프로젝트 구조

```text
nextjs-portfolio-cdk/
├── README.md                 # 일본어 (메인)
├── README.ko.md              # 한국어 버전
├── requirements.md           # 일본어 (메인)
├── requirements.ko.md        # 이 파일
├── docs/plans/
├── rules/
├── infrastructure/           # CDK
│   ├── bin/
│   └── lib/
│       ├── vpc-stack.ts
│       ├── ec2-stack.ts
│       ├── alb-stack.ts
│       ├── cloudfront-stack.ts
│       └── ecr-stack.ts
├── frontend/                 # Next.js
│   ├── Dockerfile
│   └── src/
│       ├── app/
│       │   ├── layout.tsx
│       │   ├── page.tsx
│       │   └── globals.css
│       └── components/
│           ├── Header.tsx
│           ├── HeroSection.tsx
│           ├── VideoSection.tsx
│           ├── CompanyLogosSection.tsx
│           ├── ValuePropositionSection.tsx
│           ├── ProcessFlowSection.tsx
│           ├── FAQSection.tsx
│           ├── AboutSection.tsx
│           └── Footer.tsx
├── error-pages/              # Astro
│   └── src/pages/404.astro
└── .github/workflows/
    ├── deploy-frontend.yml
    └── deploy-error-pages.yml
```

---

## 9. 면접 후 정리

- 면접 종료 후 `cdk destroy`로 모든 AWS 리소스 삭제
- 비용 발생 방지를 위해 CloudFormation 스택 완전 제거 확인
