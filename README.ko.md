# Next.js 포트폴리오 사이트 (AWS CDK)

[🇯🇵 日本語](./README.md)

면접 시연용 포트폴리오 사이트 MVP입니다. AWS CDK를 사용하여 인프라를 구성하고, Next.js로 프론트엔드를 개발합니다.

---

## 🤖 Vibe Coding with Claude Code CLI

이 프로젝트는 **Claude Code CLI**를 사용한 **Vibe Coding**으로 개발되었습니다.

### 개발 기간

| 항목 | 내용 |
| --- | --- |
| 시작일 | 2026-01-25 |
| 완료일 | 2026-01-26 |
| **총 소요 시간** | **약 24시간 (2일에 걸쳐)** |

### Claude Code 설정

#### MCP Servers

| MCP Server | 용도 |
| --- | --- |
| `plugin:github` | GitHub 연동 (PR, Issues, Repository 관리) |
| `plugin:playwright` | 브라우저 자동화 테스트, 스크린샷 |
| `plugin:serena` | 코드베이스 시맨틱 검색 및 분석 |
| `plugin:context7` | 라이브러리 문서 검색 |
| `sequential-thinking` | 복잡한 문제 단계별 사고 |

#### Skills

| Skill | 용도 |
| --- | --- |
| `superpowers:brainstorming` | 아이디어 구체화 및 요구사항 정리 |
| `superpowers:writing-plans` | 구현 계획 수립 |
| `superpowers:executing-plans` | 계획 기반 단계별 구현 |
| `frontend-design:frontend-design` | 고품질 프론트엔드 UI 개발 |

#### Guardrails (rules/)

| 가드레일 | 설명 |
| --- | --- |
| `code-style.md` | 코드 스타일 규칙 |
| `aws-best-practices.md` | AWS 모범 사례 |
| `security.md` | 보안 가드레일 |
| `network-security.md` | 네트워크 보안 (OSI 7계층) |
| `bilingual-comments.md` | 한국어/일본어 이중 주석 규칙 |

### Vibe Coding 워크플로우

```text
1. 브레인스토밍 → requirements.md 작성
2. 설계 문서 작성 → docs/plans/
3. 가드레일 설정 → rules/
4. 인프라 구현 (CDK)
5. 프론트엔드 개발 (Next.js + Tailwind)
6. CI/CD 파이프라인 구성 (GitHub Actions)
7. 에러 페이지 구현 (Astro)
8. 리뷰 및 리팩토링
```

### 주요 성과

- ✅ **1일 만에** AWS 인프라 + 프론트엔드 + CI/CD 완성
- ✅ FreeTier 범위 내 비용 최적화 아키텍처
- ✅ 하이클래스 채용 서비스 스타일 반응형 디자인 (모바일/데스크톱 완전 분리)
- ✅ 자동 배포 파이프라인 (GitHub Actions → ECR → EC2)
- ✅ 커스텀 404 에러 페이지 (CloudFront → S3)
- ✅ 커스텀 도메인 설정 (ACM + CloudFront, vibe.er.ht)
- ✅ 사용자 인증 기반 (Cognito User Pool)
- ✅ 데이터베이스 기반 (RDS PostgreSQL)
- ✅ 프로필 이미지 업로드 기반 (S3 + Presigned URL)

---

## 🌐 라이브 데모

| 페이지 | URL |
| --- | --- |
| **메인 사이트 (커스텀 도메인)** | [https://vibe.er.ht](https://vibe.er.ht) |
| **메인 사이트 (CloudFront)** | [https://d2opqv3ja0x6v5.cloudfront.net](https://d2opqv3ja0x6v5.cloudfront.net) |
| **404 에러 페이지** | [https://vibe.er.ht/404.html](https://vibe.er.ht/404.html) |

---

## 아키텍처

```text
                                    Internet
                                        │
                                vibe.er.ht (CNAME)
                                        │
                                        ▼
                               ┌───────────────┐
                               │  CloudFront   │◄──── ACM Certificate
                               │  (HTTPS/ACM)  │      (us-east-1)
                               └───────────────┘
                                │           │
                            (메인)       (에러/이미지)
                                │           │
                                ▼           ▼
┌───────────────────────────────────────────────────────────────────────────┐
│                           VPC (10.0.0.0/16)                                │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │                         Internet Gateway                             │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
│                                    │                                       │
│          ┌─────────────────────────┼─────────────────────────┐            │
│          ▼                         │                         ▼            │
│    ┌──────────┐                    │                   ┌──────────┐       │
│    │ Public   │                    │                   │ Public   │       │
│    │ Subnet   │                    │                   │ Subnet   │       │
│    │ AZ-a     │                    │                   │ AZ-c     │       │
│    │10.0.1.0  │                    │                   │10.0.2.0  │       │
│    │ /24      │                    │                   │ /24      │       │
│    │          │                    │                   │          │       │
│    │ ┌──────┐ │◄───────────────────┼──────────────────▶│ ┌──────┐ │       │
│    │ │ ALB  │ │                    │                   │ │ ALB  │ │       │
│    │ └──────┘ │                    │                   │ └──────┘ │       │
│    │    │     │                    │                   │          │       │
│    │    ▼     │                    │                   │          │       │
│    │ ┌──────┐ │                    │                   │ ┌──────┐ │       │
│    │ │ EC2  │ │                    │                   │ │ RDS  │ │       │
│    │ │t2.mic│ │───────────────────────────────────────▶│ │Postgr│ │       │
│    │ │Docker│ │                    │                   │ │ SQL  │ │       │
│    │ │Next. │ │                    │                   │ │t3.mic│ │       │
│    │ │ js   │ │                    │                   │ └──────┘ │       │
│    │ └──────┘ │                    │                   │          │       │
│    └──────────┘                    │                   └──────────┘       │
└───────────────────────────────────────────────────────────────────────────┘
         │                                                      │
         │                                                      │
         ▼                                                      ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│   S3 (Error)    │  │   S3 (Profile)  │  │    Cognito      │  │ Secrets Manager │
│   404 page      │  │   Images        │  │   User Pool     │  │  RDS 인증정보   │
│   + OAC         │  │   + OAC         │  │   50K MAU 무료  │  │                 │
└─────────────────┘  └─────────────────┘  └─────────────────┘  └─────────────────┘
```

---

## 기술 스택

### 인프라

| 구분 | 기술 |
| --- | --- |
| IaC | AWS CDK (TypeScript) |
| CDN | CloudFront + ACM |
| 컴퓨팅 | EC2 (t2.micro, FreeTier) + Docker |
| 로드밸런서 | ALB (Application Load Balancer) |
| 데이터베이스 | RDS PostgreSQL 15 (db.t3.micro, FreeTier) |
| 인증 | Cognito User Pool (50K MAU 무료) |
| 스토리지 | S3 (에러 페이지, 프로필 이미지) |
| 시크릿 | Secrets Manager (RDS 인증정보) |
| 네트워크 | VPC, Public Subnet, Internet Gateway |

### 프론트엔드

| 구분 | 기술 |
| --- | --- |
| 프레임워크 | Next.js 14+ (App Router) |
| 에러 페이지 | Astro |
| 스타일링 | Tailwind CSS |
| 언어 | TypeScript |
| 디자인 | 하이클래스 채용 서비스 스타일 반응형 디자인 |

### 프론트엔드 컴포넌트

| 컴포넌트 | 설명 |
| --- | --- |
| `Header` | 네비게이션, 스크롤 시 블러 효과 |
| `HeroSection` | 메인 비주얼, 모바일/데스크톱 완전 분리 레이아웃 |
| `VideoSection` | YouTube 임베드, 반응형 16:9 비율 |
| `CompanyLogosSection` | 기업 로고 캐러셀 |
| `ValuePropositionSection` | 가치 제안 카드 그리드 |
| `ProcessFlowSection` | 4단계 프로세스 플로우 |
| `FAQSection` | 아코디언 형태 FAQ |
| `AboutSection` | 소개 섹션 |
| `Footer` | 푸터, 소셜 링크 |

### 반응형 디자인 특징

- **모바일/데스크톱 완전 분리**: `md:hidden` / `hidden md:flex` 패턴
- **디바이스별 테마 분기**: 모바일(밝은 배경 + 빨간색) / 데스크톱(다크 + amber)
- **세로 화면 대응**: `portrait:` 수정자로 이미지 초점 조정
- **반응형 스케일**: 타이포그래피, 스페이싱, 아이콘 크기 일관된 비율

### CI/CD

| 구분 | 기술 |
| --- | --- |
| 파이프라인 | GitHub Actions |
| 컨테이너 레지스트리 | Amazon ECR |

---

## 프로젝트 구조

```text
nextjs-portfolio-cdk/
│
├── README.md                 # 일본어 버전 (메인)
├── README.ko.md              # 이 파일
├── requirements.md           # 요구사항 정의서
│
├── .claude/
│   └── skills/               # Claude Code 스킬
│       └── frontend-design.md
│
├── docs/
│   └── plans/                # 설계 문서
│
├── rules/                    # 가드레일 설정
│   ├── code-style.md
│   ├── aws-best-practices.md
│   ├── security.md
│   ├── network-security.md
│   └── bilingual-comments.md
│
├── infrastructure/           # AWS CDK 코드
│   ├── README.md
│   ├── bin/
│   │   └── app.ts
│   └── lib/
│       ├── vpc-stack.ts
│       ├── ec2-stack.ts
│       ├── alb-stack.ts
│       ├── cloudfront-stack.ts
│       ├── certificate-stack.ts     # ACM 인증서 (us-east-1)
│       ├── ecr-stack.ts
│       ├── cognito-stack.ts         # Cognito 인증 (User Pool)
│       ├── rds-stack.ts             # RDS PostgreSQL
│       └── profile-bucket-stack.ts  # 프로필 이미지 S3
│
├── frontend/                 # Next.js 앱
│   ├── README.md
│   ├── package.json
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
│
├── error-pages/              # Astro 404 페이지
│   └── src/
│       └── pages/
│           └── 404.astro
│
└── .github/
    └── workflows/            # CI/CD 파이프라인
        ├── deploy-frontend.yml
        └── deploy-error-pages.yml
```

---

## 시작하기

### 사전 요구사항

- Node.js 18+
- AWS CLI (configured)
- AWS CDK CLI (`npm install -g aws-cdk`)
- Docker

### 인프라 배포

```bash
# CDK 프로젝트로 이동
cd infrastructure

# 의존성 설치
npm install

# CDK 부트스트랩 (최초 1회)
cdk bootstrap

# 인프라 배포
cdk deploy --all
```

### 프론트엔드 개발

```bash
# Next.js 프로젝트로 이동
cd frontend

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

### 에러 페이지 개발

```bash
# Astro 프로젝트로 이동
cd error-pages

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

---

## 비용 관리

이 프로젝트는 AWS FreeTier 범위 내에서 운영되도록 설계되었습니다.

### FreeTier 리소스

| 리소스 | FreeTier 한도 |
| --- | --- |
| EC2 (t2.micro) | 750시간/월 (12개월) |
| ALB | 750시간/월 (12개월) |
| RDS (db.t3.micro) | 750시간/월 + 20GB 스토리지 (12개월) |
| Cognito | 50,000 MAU 무료 (영구) |
| S3 | 5GB 스토리지, 20,000 GET |
| CloudFront | 1TB 전송, 10,000,000 요청 |
| ECR | 500MB 스토리지 |
| Secrets Manager | 30일 무료 체험 |

### MVP vs Production 구성 비교

| 항목 | MVP (현재) | Production 권장 |
| --- | --- | --- |
| **RDS 배치** | Public Subnet (단일 AZ) | Private Subnet (Multi-AZ) |
| **RDS Failover** | 없음 | 자동 Failover (1-2분) |
| **Read Replica** | 없음 | 읽기 분산용 권장 |
| **NAT Gateway** | 없음 (비용 절감) | 필수 (~$30-45/월) |
| **서브넷 구성** | 10.0.1.0/24, 10.0.2.0/24 | +10.0.11.0/24, 10.0.21.0/24 (DB용) |
| **WAF** | 없음 | AWSManagedRulesCommonRuleSet |
| **백업** | 7일 | 30일 + 크로스 리전 |

> ⚠️ **주의**: 프로덕션 환경에서는 Private Subnet + NAT Gateway 구성을 강력히 권장합니다.
> 현재 Public Subnet 배치는 비용 최적화를 위한 선택이며, Security Group으로 엄격하게 접근 제어하고 있습니다.

### 비용 절감 결정

| 항목 | 결정 | 절감액 |
| --- | --- | --- |
| NAT Gateway | ❌ 제거 | ~$30-45/월 |
| Private Subnet | ❌ 제거 | NAT Gateway 불필요 |
| WAF | ❌ 문서화만 | ~$6-7/월 |
| Route53 | ❌ 문서화만 | ~$0.50/월 |

### 리소스 정리

면접 종료 후 반드시 리소스를 정리하세요.

```bash
# 모든 스택 삭제
cd infrastructure
cdk destroy --all
```

---

## 시크릿 관리

이 프로젝트는 AWS Systems Manager Parameter Store를 활용하여 민감한 정보를 관리합니다.

### 왜 Parameter Store인가?

| 서비스 | Free Tier | 용도 |
| --- | --- | --- |
| **Parameter Store** | ✅ 무료 (Standard) | 환경변수, API 키 |
| Secrets Manager | ❌ 유료 ($0.40/시크릿/월) | 자동 로테이션 필요 시 |

Parameter Store의 **SecureString** 타입은 KMS로 암호화되어 Secrets Manager와 유사한 보안 수준을 제공합니다.

### 현재 상태

현재 MVP는 정적 포트폴리오 사이트로, Parameter Store가 필수는 아닙니다.

### 서비스 확장 시 활용 시나리오

```text
┌─────────────────────────────────────────────────────────────────┐
│  확장 기능                    │  Parameter Store 활용           │
├─────────────────────────────────────────────────────────────────┤
│  컨택트 폼 (문의 양식)        │  이메일 서비스 API 키            │
│  방문자 분석                  │  Google Analytics API 키        │
│  CMS 연동                     │  Contentful/Strapi API 키       │
│  데이터베이스 연결            │  RDS 접속 정보                  │
│  영상 스트리밍                │  S3 Presigned URL 설정          │
│  OAuth 인증                   │  Client ID/Secret               │
└─────────────────────────────────────────────────────────────────┘
```

### 파라미터 네이밍 규칙

```text
/portfolio/{environment}/{service}/{key}

예시:
/portfolio/prod/analytics/api-key
/portfolio/prod/email/sendgrid-key
/portfolio/dev/database/connection-string
```

### CDK 구현 예시

```typescript
import * as ssm from 'aws-cdk-lib/aws-ssm';

// 일반 설정값 (String)
new ssm.StringParameter(this, 'ApiEndpoint', {
  parameterName: '/portfolio/prod/api/endpoint',
  stringValue: 'https://api.example.com',
  description: 'API 엔드포인트',
});

// 민감한 정보 (SecureString - KMS 암호화)
new ssm.StringParameter(this, 'AnalyticsKey', {
  parameterName: '/portfolio/prod/analytics/api-key',
  stringValue: 'your-api-key',
  type: ssm.ParameterType.SECURE_STRING,
  description: 'Analytics API 키',
});
```

### EC2에서 파라미터 조회

```typescript
// Next.js API Route 또는 서버 컴포넌트에서
import { SSMClient, GetParameterCommand } from '@aws-sdk/client-ssm';

const client = new SSMClient({ region: 'ap-northeast-1' });

const response = await client.send(new GetParameterCommand({
  Name: '/portfolio/prod/analytics/api-key',
  WithDecryption: true,  // SecureString 복호화
}));

const apiKey = response.Parameter?.Value;
```

---

## 주석 규칙

이 프로젝트의 모든 코드 주석은 한국어와 일본어로 작성됩니다.

```typescript
// 사용자 인증을 처리하는 함수
function handleAuth() {
  // ...
}
```

---

## 문서

| 문서 | 설명 |
| --- | --- |
| [requirements.md](./requirements.md) | 상세 요구사항 정의서 |
| [docs/plans/](./docs/plans/) | 설계 문서 |
| [rules/](./rules/) | 코딩 가드레일 |

---

## 라이선스

이 프로젝트는 개인 포트폴리오 목적으로 작성되었습니다.
