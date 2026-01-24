# 요구사항 정의서

# 要件定義書

---

## 1. 프로젝트 개요 / プロジェクト概要

### 1.1 목적 / 目的

- 면접에서 자기 어필을 위한 포트폴리오 사이트 MVP 개발
- 面接での自己アピールのためのポートフォリオサイトMVP開発

### 1.2 타겟 / ターゲット

- 타겟 기업: BizReach (https://www.bizreach.jp/)
- ターゲット企業: BizReach (https://www.bizreach.jp/)

### 1.3 개발 원칙 / 開発原則

- 작고 빠르게 시작하여 점진적으로 개선
- 小さく素早く始めて段階的に改善
- AWS FreeTier 범위 내에서 비용 최적화
- AWS FreeTier範囲内でコスト最適化
- 모든 기술 선택에 대해 근거를 주석으로 명시
- すべての技術選択について根拠をコメントで明記

---

## 2. 기술 스택 / 技術スタック

### 2.1 인프라 / インフラ

| 구분 / 区分 | 기술 / 技術 | 버전 / バージョン |
| --- | --- | --- |
| IaC | AWS CDK | 2.x |
| 언어 | TypeScript | 5.x |
| 클라우드 | AWS (FreeTier) | - |

### 2.2 프론트엔드 / フロントエンド

| 구분 / 区分 | 기술 / 技術 | 용도 / 用途 |
| --- | --- | --- |
| 메인 사이트 | Next.js 14+ | 랜딩 페이지 (Docker 컨테이너) |
| 에러 페이지 | Astro | 404 페이지 (정적 빌드) |
| 스타일링 | Tailwind CSS | 유틸리티 기반 CSS |
| 언어 | TypeScript | 타입 안전성 |

### 2.3 CI/CD

| 구분 / 区分 | 기술 / 技術 |
| --- | --- |
| 파이프라인 | GitHub Actions |
| 컨테이너 레지스트리 | Amazon ECR |

---

## 3. AWS 아키텍처 / AWSアーキテクチャ

### 3.1 네트워크 구성 / ネットワーク構成

#### VPC

| 항목 / 項目 | 값 / 値 | 비고 / 備考 |
| --- | --- | --- |
| VPC CIDR | 10.0.0.0/16 | 65,536 IPs |
| Public Subnet AZ-a | 10.0.1.0/24 | ALB + EC2 |
| Public Subnet AZ-c | 10.0.2.0/24 | ALB (고가용성) |

#### 설계 결정 사항 / 設計決定事項

| 항목 / 項目 | 결정 / 決定 | 이유 / 理由 |
| --- | --- | --- |
| Private Subnet | ❌ 제거 | NAT Gateway 비용 절감 (~$30-45/월) |
| NAT Gateway | ❌ 제거 | FreeTier 범위 유지 |

### 3.2 컴퓨팅 / コンピューティング

#### EC2

| 항목 / 項目 | 값 / 値 |
| --- | --- |
| 인스턴스 타입 | t2.micro 또는 t3.micro (FreeTier) |
| 배치 | Public Subnet AZ-a |
| 실행 환경 | Docker + Next.js 컨테이너 |

#### 로드밸런서 / ロードバランサー

| 항목 / 項目 | 값 / 値 | 이유 / 理由 |
| --- | --- | --- |
| 타입 | ALB (Application Load Balancer) | L7에서 HTTP 헤더 분석 필요 |
| 배치 | Public Subnet (2 AZ) | AWS 요구사항: 최소 2 AZ |

### 3.3 CDN 및 스토리지 / CDNとストレージ

#### CloudFront

| 항목 / 項目 | 값 / 値 |
| --- | --- |
| 도메인 | CloudFront 기본 도메인 (*.cloudfront.net) |
| SSL/TLS | ACM 인증서 (HTTPS) |
| Origin | ALB (메인), S3 (에러 페이지) |
| 에러 응답 | 404 → S3의 404.html로 리다이렉트 |

#### S3

| 항목 / 項目 | 값 / 値 |
| --- | --- |
| 용도 | 404 에러 페이지 호스팅, 영상 파일 호스팅 |
| 접근 제어 | OAC (Origin Access Control) |
| 퍼블릭 액세스 | 차단 (CloudFront를 통해서만 접근) |

### 3.4 보안 / セキュリティ

#### Security Group (Stateful)

| 대상 / 対象 | Inbound | Outbound |
| --- | --- | --- |
| ALB SG | CloudFront → 80 | 자동 허용 (Stateful) |
| EC2 SG | ALB SG → 3000 | 자동 허용 (Stateful) |

#### NACL (Stateless)

| 방향 / 方向 | 포트 / ポート | 용도 / 用途 |
| --- | --- | --- |
| Inbound | 80 | HTTP 트래픽 |
| Outbound | 1024-65535 | Ephemeral 포트 응답 |

#### WAF

| 항목 / 項目 | 값 / 値 |
| --- | --- |
| 적용 여부 | ❌ 문서화만 (비용 절감) |
| 권장 사항 | 프로덕션에서는 AWSManagedRulesCommonRuleSet 적용 권장 |

### 3.5 DNS (문서화만) / DNS（ドキュメントのみ）

#### Route53

| 항목 / 項目 | 값 / 値 |
| --- | --- |
| 적용 여부 | ❌ 문서화만 |
| 이유 | 면접 시연에 커스텀 도메인 불필요, 비용 절감 |
| 권장 사항 | 프로덕션에서는 Route53 + 커스텀 도메인 적용 권장 |

---

## 4. CI/CD 파이프라인 / CI/CDパイプライン

### 4.1 Next.js 배포 워크플로우

```text
Push to main → Test (lint, test) → Docker Build → Push to ECR → Deploy to EC2
```

| 단계 / ステップ | 설명 / 説明 |
| --- | --- |
| Test | ESLint, TypeScript 검사, 단위 테스트 |
| Docker Build | Next.js 앱 Docker 이미지 빌드 |
| Push to ECR | Amazon ECR에 이미지 푸시 |
| Deploy to EC2 | SSH로 EC2 접속 → docker pull → docker run |

### 4.2 Astro 배포 워크플로우

```text
Push to main → Build Astro → Upload to S3
```

| 단계 / ステップ | 설명 / 説明 |
| --- | --- |
| Build | Astro 정적 빌드 |
| Upload | S3 버킷에 404.html 업로드 |

---

## 5. 프론트엔드 요구사항 / フロントエンド要件

### 5.1 랜딩 페이지 구성 / ランディングページ構成

| 섹션 / セクション | 내용 / 内容 |
| --- | --- |
| Header | 로고 |
| Hero Section | 기업명 + 슬로건 + 영상 플레이어 |
| About Section | 기업 소개 텍스트 |
| Footer | 저작권 표시 |

### 5.2 영상 삽입 / 動画挿入

| 항목 / 項目 | 값 / 値 |
| --- | --- |
| 방식 | S3 직접 호스팅 + `<video>` 태그 |
| 길이 | 30초 ~ 1분 |
| 용도 | 기업 광고용 영상 |

### 5.3 디자인 가이드 / デザインガイド

| 항목 / 項目 | 값 / 値 |
| --- | --- |
| 참고 | BizReach (https://www.bizreach.jp/) |
| 톤 | Luxury/Refined - 고급스럽고 전문적 |
| 색상 | 파란 계열 액센트 + 중립 배경 |
| 폰트 | 일본어 지원 산세리프 (Noto Sans JP 등) |
| 모션 | 페이지 로드 시 staggered reveal 애니메이션 |

### 5.4 언어 / 言語

| 대상 / 対象 | 언어 / 言語 |
| --- | --- |
| 랜딩 페이지 콘텐츠 | 일본어 |
| 코드 주석 | 한국어 + 일본어 (이중 언어) |

---

## 6. 가드레일 (rules/) / ガードレール

### 6.1 파일 구조 / ファイル構造

```text
rules/
├── code-style.md           # TypeScript, 네이밍 컨벤션
├── aws-best-practices.md   # 태그, 리소스 네이밍, 비용
├── security.md             # 시크릿 금지, 최소 권한
├── network-security.md     # SG/NACL, Stateful/Stateless, OSI 7계층
└── bilingual-comments.md   # 한국어/일본어 주석 규칙
```

### 6.2 주요 규칙 / 主要ルール

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

## 7. 프로젝트 구조 / プロジェクト構造

```text
nextjs-portfolio-cdk/
├── README.md
├── requirements.md
├── docs/plans/
├── rules/
├── infrastructure/          # CDK
│   ├── bin/
│   └── lib/
│       ├── vpc-stack.ts
│       ├── ec2-stack.ts
│       ├── alb-stack.ts
│       ├── cloudfront-stack.ts
│       └── ecr-stack.ts
├── frontend/                # Next.js
│   ├── Dockerfile
│   └── src/
├── error-pages/             # Astro
│   └── src/pages/404.astro
└── .github/workflows/
    ├── deploy-frontend.yml
    └── deploy-error-pages.yml
```

---

## 8. 면접 후 정리 / 面接後の整理

- 면접 종료 후 `cdk destroy`로 모든 AWS 리소스 삭제
- 面接終了後、`cdk destroy`で全AWSリソースを削除
- 비용 발생 방지를 위해 CloudFormation 스택 완전 제거 확인
- コスト発生防止のためCloudFormationスタック完全削除を確認
