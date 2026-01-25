# 포트폴리오 사이트 설계 문서
# ポートフォリオサイト設計ドキュメント

**작성일 / 作成日**: 2026-01-25
**최종 수정 / 最終更新**: 2026-01-26
**목적 / 目的**: 면접 시연용 포트폴리오 사이트 MVP 개발 / 面接デモ用ポートフォリオサイトMVP開発
**상태 / 状態**: ✅ 구현 완료 / 実装完了

---

## 🌐 라이브 데모 / Live Demo

**CloudFront URL**: [https://d2opqv3ja0x6v5.cloudfront.net](https://d2opqv3ja0x6v5.cloudfront.net)

---

## 1. 아키텍처 개요 / アーキテクチャ概要

### 1.1 전체 아키텍처 / 全体アーキテクチャ

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              Internet                                        │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    ▼                               ▼
        ┌───────────────────┐           ┌───────────────────┐
        │    CloudFront     │           │  GitHub Actions   │
        │  (*.cloudfront.net)│           │     (CI/CD)       │
        │  + ACM (HTTPS)    │           └───────────────────┘
        └───────────────────┘                   │
           │            │                       │
     (메인 트래픽)   (에러 시)                    ▼
           │            │               ┌───────────────────┐
           │            └──────────────▶│   ECR Repository  │
           ▼                            └───────────────────┘
┌─────────────────────────────────────────────────────────────────────────────┐
│                            VPC (10.0.0.0/16)                                 │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                      Internet Gateway                                  │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                    │                                         │
│  ┌─────────────────────────────────┴─────────────────────────────────────┐  │
│  │                            NACL                                        │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│       │                                              │                       │
│       ▼                                              ▼                       │
│  ┌─────────────────────────┐          ┌─────────────────────────┐           │
│  │ Public Subnet AZ-a      │          │ Public Subnet AZ-c      │           │
│  │ (10.0.1.0/24)           │          │ (10.0.2.0/24)           │           │
│  │                         │          │                         │           │
│  │  ┌─────────────────┐    │          │  ┌─────────────────┐    │           │
│  │  │      ALB        │◄───┼──────────┼──│      ALB        │    │           │
│  │  └─────────────────┘    │          │  └─────────────────┘    │           │
│  │          │              │          │                         │           │
│  │          ▼              │          │                         │           │
│  │  ┌─────────────────┐    │          │                         │           │
│  │  │ EC2 (t2.micro)  │────┼──────────┼──────────────────────────────────┐  │
│  │  │ Docker+Next.js  │    │          │   (ALB 고가용성용)       │       │  │
│  │  └─────────────────┘    │          │                         │       │  │
│  └─────────────────────────┘          └─────────────────────────┘       │  │
└─────────────────────────────────────────────────────────────────────────│──┘
                                                        │                 │
                            ┌───────────────────────────┘                 │
                            ▼                                             ▼
                ┌───────────────────────┐               ┌───────────────────────┐
                │     S3 Bucket         │               │  SSM Parameter Store  │
                │  (404.html - Astro)   │               │  (API키, 설정값 등)    │
                │     + OAC             │               │  SecureString + KMS   │
                └───────────────────────┘               └───────────────────────┘
```

### 1.2 CIDR 구성 / CIDR構成

| 리소스 / リソース | CIDR Block | IP 범위 / IP範囲 | 용도 / 用途 |
|------------------|-----------|-----------------|------------|
| VPC | 10.0.0.0/16 | 10.0.0.0 ~ 10.0.255.255 | 전체 네트워크 / 全体ネットワーク |
| Public Subnet (AZ-a) | 10.0.1.0/24 | 10.0.1.0 ~ 10.0.1.255 | ALB + EC2 |
| Public Subnet (AZ-c) | 10.0.2.0/24 | 10.0.2.0 ~ 10.0.2.255 | ALB (고가용성 / 高可用性) |

### 1.3 핵심 설계 결정 / 重要な設計決定

| 항목 / 項目 | 결정 / 決定 | 이유 / 理由 |
|------------|-----------|------------|
| Private Subnet | ❌ 제거 | NAT Gateway 비용 절감 (~$30-45/월) |
| NAT Gateway | ❌ 제거 | FreeTier 범위 유지 |
| EC2 인스턴스 | t2.micro/t3.micro | FreeTier 750시간/월 |
| 로드밸런서 | ALB (L7) | HTTP 헤더 분석, 경로 기반 라우팅 가능 |
| WAF | ❌ 문서화만 | 비용 절감 ($6-7/월), 면접 후 stack 삭제 예정 |
| Route53 | ❌ 문서화만 | CloudFront 기본 도메인 사용 |

---

## 2. CI/CD 파이프라인 / CI/CDパイプライン

### 2.1 워크플로우 구성 / ワークフロー構成

```
┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐
│  Push   │───▶│  Test   │───▶│  Build  │───▶│  Push   │───▶│ Deploy  │
│  Code   │    │  (lint, │    │ Docker  │    │  to     │    │  to     │
│         │    │  test)  │    │  Image  │    │  ECR    │    │  EC2    │
└─────────┘    └─────────┘    └─────────┘    └─────────┘    └─────────┘
```

### 2.2 워크플로우 파일 / ワークフローファイル

| 트리거 / トリガー | 대상 / 対象 | 동작 / 動作 |
|-----------------|-----------|------------|
| `main` 브랜치 push | Next.js | 테스트 → Docker 빌드 → ECR 푸시 → EC2 배포 |
| `main` 브랜치 push | Astro | 빌드 → S3 업로드 |

### 2.3 EC2 배포 방식 / EC2デプロイ方式

- GitHub Actions에서 SSH로 EC2 접속
- `docker pull` → `docker stop` → `docker run` 순서로 배포

---

## 3. 프론트엔드 구성 / フロントエンド構成

### 3.1 기술 스택 / 技術スタック

| 구분 / 区分 | 기술 / 技術 | 용도 / 用途 |
|------------|-----------|------------|
| 메인 사이트 | Next.js 14+ (App Router) | 랜딩 페이지 (SSR/SSG) |
| 에러 페이지 | Astro | 404 페이지 (정적) |
| 스타일링 | Tailwind CSS | 유틸리티 기반 CSS |
| 언어 | TypeScript | 타입 안전성 |

### 3.2 랜딩 페이지 구조 / ランディングページ構造

```
┌─────────────────────────────────────────────────────────────┐
│  Header (로고 + 로그인 버튼)                                   │
│  - 스크롤 시 배경 블러 효과                                     │
│  - 고정 위치 (sticky)                                         │
├─────────────────────────────────────────────────────────────┤
│  HeroSection                                                 │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  [모바일] 이미지 배경 + 텍스트 오버레이 + CTA 폼        │    │
│  │  [데스크톱] 풀스크린 히어로 이미지 + 좌측 텍스트         │    │
│  │  - 스태거 애니메이션 (순차 등장)                        │    │
│  └─────────────────────────────────────────────────────┘    │
├─────────────────────────────────────────────────────────────┤
│  VideoSection (YouTube 임베드)                               │
│  - 16:9 aspect-ratio 유지                                   │
│  - 스크롤 트리거 애니메이션                                   │
├─────────────────────────────────────────────────────────────┤
│  CompanyLogosSection (기업 로고)                             │
│  - 로고 가로 스크롤 / 그리드                                  │
├─────────────────────────────────────────────────────────────┤
│  ValuePropositionSection (가치 제안)                          │
│  - 카드 그리드 레이아웃                                       │
│  - 아이콘 + 제목 + 설명                                      │
├─────────────────────────────────────────────────────────────┤
│  ProcessFlowSection (4단계 프로세스)                          │
│  - 회원등록 → 스카우트 → 면담 → 내정                          │
│  - 반응형 그리드 (2열 → 4열)                                  │
│  - 연결선 애니메이션                                         │
├─────────────────────────────────────────────────────────────┤
│  FAQSection (자주 묻는 질문)                                  │
│  - 아코디언 UI                                               │
│  - 클릭 시 열림/닫힘                                         │
├─────────────────────────────────────────────────────────────┤
│  AboutSection (소개)                                         │
├─────────────────────────────────────────────────────────────┤
│  Footer (푸터)                                               │
│  - 소셜 링크 (GitHub, LinkedIn, X, Email)                    │
│  - 저작권 표시                                               │
└─────────────────────────────────────────────────────────────┘
```

### 3.3 컴포넌트 목록 / コンポーネント一覧

| 컴포넌트 | 파일 | 설명 |
| --- | --- | --- |
| Header | `Header.tsx` | 네비게이션, 스크롤 시 블러 효과 |
| HeroSection | `HeroSection.tsx` | 메인 비주얼, 모바일/데스크톱 완전 분리 레이아웃 |
| VideoSection | `VideoSection.tsx` | YouTube iframe 임베드, 반응형 16:9 비율 |
| VideoPlayer | `VideoPlayer.tsx` | 재사용 가능한 비디오 플레이어 |
| CompanyLogosSection | `CompanyLogosSection.tsx` | 기업 로고 캐러셀/그리드 |
| ValuePropositionSection | `ValuePropositionSection.tsx` | 가치 제안 카드 그리드 |
| ProcessFlowSection | `ProcessFlowSection.tsx` | 4단계 프로세스 플로우 |
| FAQSection | `FAQSection.tsx` | 아코디언 형태 FAQ |
| AboutSection | `AboutSection.tsx` | 소개 섹션 |
| Footer | `Footer.tsx` | 푸터, 소셜 링크 |

### 3.4 디자인 방향 / デザイン方向

| 요소 / 要素 | 방향 / 方向 |
|------------|-----------|
| 톤 | BizReach 스타일 - 고급스럽고 전문적 |
| 색상 (모바일) | 밝은 배경 (white/slate-100) + 빨간색 액센트 (red-600) |
| 색상 (데스크톱) | 다크 배경 (slate-950) + amber 액센트 (amber-500) |
| 폰트 | Inter (Google Fonts) |
| 모션 | 페이지 로드 시 staggered reveal 애니메이션 |
| 참고 | BizReach (https://www.bizreach.jp/) |

### 3.5 반응형 디자인 패턴 / レスポンシブデザインパターン

#### 모바일/데스크톱 완전 분리 레이아웃

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

#### 디바이스별 테마 분기

```tsx
// 배경색 분기
className="bg-white md:bg-slate-950"

// 텍스트 색상 분기
className="text-red-600 md:text-amber-500"

// 버튼 스타일 분기
className="bg-red-600 md:bg-gradient-to-r md:from-amber-500 md:to-amber-600"
```

#### 세로 화면 (Portrait) 대응

```tsx
// 세로 모니터에서 이미지 초점 조정
className="object-center portrait:object-[70%_center]"
```

#### 반응형 스케일 시스템

```tsx
// 타이포그래피
className="text-xl md:text-5xl lg:text-6xl"

// 스페이싱
className="py-12 md:py-24"
className="gap-3 md:gap-6"

// 아이콘/버튼 크기
className="w-10 h-10 md:w-12 md:h-12"
```

### 3.6 영상 삽입 / 動画挿入

- **방식**: YouTube iframe 임베드
- **구현**: `VideoSection.tsx`에서 직접 iframe 사용
- **비율**: `aspect-video` (16:9) 유지
- **보안**: `referrerPolicy="strict-origin-when-cross-origin"`

```tsx
<iframe
  className="absolute inset-0 w-full h-full"
  src="https://www.youtube.com/embed/VIDEO_ID"
  title="Video Title"
  frameBorder="0"
  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
  allowFullScreen
/>
```

---

## 4. 네트워크 보안 / ネットワークセキュリティ

### 4.1 OSI 7계층과 AWS 서비스 / OSI 7層とAWSサービス

```
┌─────────────────────────────────────────────────────────────────┐
│  Layer 7 - Application    │ CloudFront, ALB, WAF               │
│  (응용 계층)               │ HTTP/HTTPS 분석, 라우팅             │
├─────────────────────────────────────────────────────────────────┤
│  Layer 6 - Presentation   │ ACM (SSL/TLS)                       │
│  (표현 계층)               │ 암호화/복호화                        │
├─────────────────────────────────────────────────────────────────┤
│  Layer 5 - Session        │ ALB (연결 관리)                     │
│  (세션 계층)               │ TCP 세션 유지                        │
├─────────────────────────────────────────────────────────────────┤
│  Layer 4 - Transport      │ NLB, Security Group, NACL           │
│  (전송 계층)               │ TCP/UDP 포트 기반 필터링             │
├─────────────────────────────────────────────────────────────────┤
│  Layer 3 - Network        │ Internet Gateway, Route Table       │
│  (네트워크 계층)           │ IP 라우팅, NAT                       │
├─────────────────────────────────────────────────────────────────┤
│  Layer 2 - Data Link      │ VPC (가상 네트워크)                  │
│  (데이터링크 계층)         │ MAC 주소 처리                        │
├─────────────────────────────────────────────────────────────────┤
│  Layer 1 - Physical       │ AWS 데이터센터                       │
│  (물리 계층)               │ 물리적 인프라                        │
└─────────────────────────────────────────────────────────────────┘
```

### 4.2 Security Group vs NACL / セキュリティグループ vs NACL

| 특성 / 特性 | Security Group | NACL |
|------------|----------------|------|
| 적용 레벨 | 인스턴스(ENI) 레벨 | 서브넷 레벨 |
| 상태 관리 | **Stateful** | **Stateless** |
| 규칙 타입 | 허용(Allow)만 가능 | 허용/거부 모두 가능 |
| 규칙 평가 | 모든 규칙 동시 평가 | 규칙 번호 순서대로 평가 |

### 4.3 Stateful vs Stateless 개념 / ステートフル vs ステートレス概念

**Stateful (Security Group):**
- 연결 상태를 기억함 / 接続状態を記憶する
- 인바운드 허용 → 응답 아웃바운드 자동 허용
- 아웃바운드 허용 → 응답 인바운드 자동 허용

**Stateless (NACL):**
- 연결 상태를 기억하지 않음 / 接続状態を記憶しない
- 인바운드/아웃바운드 규칙을 각각 명시 필요
- Ephemeral Port(임시 포트) 범위도 명시적 허용 필요

### 4.4 트래픽 흐름 / トラフィックフロー

| 순서 | 출발지 | 목적지 | 포트 | 통과 검사 |
|------|--------|--------|------|-----------|
| 1 | Internet | CloudFront | 443 | - |
| 2 | CloudFront | ALB | 80 | NACL Inbound → ALB SG Inbound |
| 3 | ALB | EC2 | 3000 | EC2 SG Inbound |
| 4 | EC2 | ALB | 응답 | EC2 SG (Stateful, 자동 허용) |
| 5 | ALB | CloudFront | 응답 | ALB SG (Stateful) → NACL Outbound |

---

## 5. 시크릿 관리 / シークレット管理

### 5.1 서비스 선택 / サービス選択

| 서비스 / サービス | Free Tier | 용도 / 用途 | 선택 / 選択 |
|------------------|-----------|------------|------------|
| Parameter Store (Standard) | ✅ 무료 | 환경변수, API 키 | ✅ 채택 |
| Secrets Manager | ❌ 유료 ($0.40/시크릿/월) | 자동 로테이션 | ❌ 비용 절감 |

**선택 근거 / 選択理由:**
- FreeTier 범위 유지 필수
- SecureString 타입으로 KMS 암호화 가능
- 자동 로테이션은 현재 불필요

### 5.2 현재 상태 / 現在の状態

현재 MVP는 정적 포트폴리오 사이트로 외부 API 연동이 없어 Parameter Store가 필수는 아님.

現在のMVPは静的ポートフォリオサイトで外部API連携がないため、Parameter Storeは必須ではない。

### 5.3 서비스 확장 시 활용 시나리오 / サービス拡張時の活用シナリオ

| 확장 기능 / 拡張機能 | 파라미터 예시 / パラメータ例 | 타입 / タイプ |
|---------------------|---------------------------|--------------|
| 컨택트 폼 | `/portfolio/prod/email/sendgrid-key` | SecureString |
| 방문자 분석 | `/portfolio/prod/analytics/ga-key` | SecureString |
| CMS 연동 | `/portfolio/prod/cms/api-key` | SecureString |
| DB 연결 | `/portfolio/prod/db/connection-string` | SecureString |
| OAuth 인증 | `/portfolio/prod/oauth/client-secret` | SecureString |
| 환경별 설정 | `/portfolio/prod/api/endpoint` | String |

### 5.4 파라미터 네이밍 규칙 / パラメータ命名規則

```
/portfolio/{environment}/{service}/{key}

예시 / 例:
├── /portfolio/prod/analytics/api-key
├── /portfolio/prod/email/sendgrid-key
├── /portfolio/prod/database/connection-string
├── /portfolio/dev/analytics/api-key
└── /portfolio/dev/database/connection-string
```

### 5.5 CDK 구현 / CDK実装

확장 시 `infrastructure/lib/ssm-stack.ts` 생성:

```typescript
import * as cdk from 'aws-cdk-lib';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import { Construct } from 'constructs';

export class SsmStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // 일반 설정값 (평문)
    // 一般設定値（平文）
    new ssm.StringParameter(this, 'ApiEndpoint', {
      parameterName: '/portfolio/prod/api/endpoint',
      stringValue: 'https://api.example.com',
      description: 'API 엔드포인트 / APIエンドポイント',
    });

    // 민감한 정보 (KMS 암호화)
    // 機密情報（KMS暗号化）
    new ssm.StringParameter(this, 'AnalyticsKey', {
      parameterName: '/portfolio/prod/analytics/api-key',
      stringValue: 'placeholder-replace-after-deploy',
      type: ssm.ParameterType.SECURE_STRING,
      description: 'Analytics API 키 / Analytics APIキー',
    });
  }
}
```

### 5.6 EC2에서 파라미터 조회 / EC2からパラメータ取得

EC2 인스턴스에 SSM 파라미터 읽기 권한이 필요함 (IAM Role).

EC2インスタンスにSSMパラメータ読み取り権限が必要（IAM Role）。

```typescript
// Next.js 서버 컴포넌트 또는 API Route
// Next.js サーバーコンポーネントまたはAPI Route
import { SSMClient, GetParameterCommand } from '@aws-sdk/client-ssm';

const client = new SSMClient({ region: 'ap-northeast-1' });

export async function getParameter(name: string): Promise<string> {
  const response = await client.send(new GetParameterCommand({
    Name: name,
    WithDecryption: true,
  }));
  return response.Parameter?.Value ?? '';
}

// 사용 예시 / 使用例
const analyticsKey = await getParameter('/portfolio/prod/analytics/api-key');
```

---

## 6. 가드레일 (rules/) / ガードレール

### 6.1 파일 구조 / ファイル構造

```
rules/
├── code-style.md           # TypeScript, 네이밍 컨벤션
├── aws-best-practices.md   # 태그, 리소스 네이밍, 비용
├── security.md             # 시크릿 금지, 최소 권한
├── network-security.md     # SG/NACL, Stateful/Stateless, OSI 7계층
└── bilingual-comments.md   # 한국어/일본어 주석 규칙
```

### 6.2 주요 규칙 요약 / 主要ルール要約

**code-style.md:**
- TypeScript strict mode 필수
- 컴포넌트: PascalCase, 함수/변수: camelCase

**aws-best-practices.md:**
- 모든 리소스에 태그 필수 (Project, Environment, ManagedBy)
- 기술 선택 근거를 주석으로 명시

**security.md:**
- 하드코딩된 시크릿 금지
- Security Group: 최소 권한 원칙

**network-security.md:**
- OSI 7계층과 AWS 서비스 매핑
- CDK 코드에 트래픽 흐름 주석 필수

**bilingual-comments.md:**
- 한국어 주석 바로 아래 일본어 번역
- 비즈니스 레벨 (N1~) 일본어 사용

---

## 7. 프로젝트 구조 / プロジェクト構造

```
nextjs-portfolio-cdk/
│
├── README.md                          # 프로젝트 설명 (한국어 + 일본어)
├── requirements.md                    # 요구사항 원본
│
├── .claude/
│   └── skills/
│       └── frontend-design.md         # 프론트엔드 디자인 스킬 (반응형 체크리스트 포함)
│
├── docs/
│   └── plans/
│       └── 2026-01-25-portfolio-design.md  # 이 파일
│
├── rules/                             # 가드레일 설정
│   ├── code-style.md
│   ├── aws-best-practices.md
│   ├── security.md
│   ├── network-security.md
│   └── bilingual-comments.md
│
├── infrastructure/                    # CDK 인프라 코드
│   ├── README.md
│   ├── package.json
│   ├── tsconfig.json
│   ├── cdk.json
│   ├── bin/
│   │   └── app.ts
│   └── lib/
│       ├── vpc-stack.ts
│       ├── ec2-stack.ts
│       ├── alb-stack.ts
│       ├── cloudfront-stack.ts
│       └── ecr-stack.ts
│
├── frontend/                          # Next.js 메인 사이트
│   ├── README.md
│   ├── package.json
│   ├── Dockerfile
│   ├── public/
│   │   ├── favicon.ico
│   │   ├── logo_bizreach.png
│   │   └── bizreach-banner-model-grok.png
│   └── src/
│       ├── app/
│       │   ├── layout.tsx
│       │   ├── page.tsx
│       │   ├── globals.css
│       │   └── favicon.ico
│       └── components/
│           ├── Header.tsx
│           ├── HeroSection.tsx
│           ├── VideoSection.tsx
│           ├── VideoPlayer.tsx
│           ├── CompanyLogosSection.tsx
│           ├── ValuePropositionSection.tsx
│           ├── ProcessFlowSection.tsx
│           ├── FAQSection.tsx
│           ├── AboutSection.tsx
│           └── Footer.tsx
│
├── error-pages/                       # Astro 404 페이지
│   ├── README.md
│   └── src/
│       └── pages/
│           └── 404.astro
│
└── .github/
    └── workflows/
        ├── deploy-frontend.yml
        └── deploy-error-pages.yml
```

---

## 8. 확정 사항 체크리스트 / 確定事項チェックリスト

| 항목 / 項目 | 결정 / 決定 | 상태 / 状態 |
|------------|-----------|------------|
| VPC CIDR | 10.0.0.0/16 | ✅ 완료 |
| Public Subnet AZ-a | 10.0.1.0/24 | ✅ 완료 |
| Public Subnet AZ-c | 10.0.2.0/24 | ✅ 완료 |
| Private Subnet | ❌ 제거 | ✅ 완료 |
| NAT Gateway | ❌ 제거 | ✅ 완료 |
| EC2 | t2.micro/t3.micro (FreeTier) | ✅ 완료 |
| 컨테이너 | Docker + Next.js | ✅ 완료 |
| 로드밸런서 | ALB (L7) | ✅ 완료 |
| CDN | CloudFront (기본 도메인) | ✅ 완료 |
| 도메인 | ❌ Route53 문서화만 | ✅ 완료 |
| WAF | ❌ 문서화만 | ✅ 완료 |
| 404 페이지 | Astro → S3 | ✅ 완료 |
| CI/CD | GitHub Actions (풀 파이프라인) | ✅ 완료 |
| 랜딩 페이지 언어 | 일본어 | ✅ 완료 |
| 코드 주석 | 한국어 + 일본어 이중 언어 | ✅ 완료 |
| 기술 선택 근거 | 모든 리소스에 주석 필수 | ✅ 완료 |
| 네트워크 학습 | OSI 7계층 + 트래픽 흐름 주석 | ✅ 완료 |
| 시크릿 관리 | SSM Parameter Store (SecureString) | ✅ 문서화 완료 |
| 영상 삽입 | YouTube iframe 임베드 | ✅ 완료 |
| 반응형 디자인 | 모바일/데스크톱 분리 레이아웃 | ✅ 완료 |
| 디바이스별 테마 | 모바일(밝은+빨강) / 데스크톱(다크+amber) | ✅ 완료 |
| 세로 화면 대응 | portrait: 수정자 활용 | ✅ 완료 |

---

## 9. 완료 / 完了

모든 항목이 구현 완료되었습니다.

すべての項目が実装完了しました。

**배포 URL / デプロイURL**: [https://d2opqv3ja0x6v5.cloudfront.net](https://d2opqv3ja0x6v5.cloudfront.net)
