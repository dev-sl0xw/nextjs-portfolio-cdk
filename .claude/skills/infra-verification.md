---
name: infra-verification
description: AWS CDK 인프라 검증 체크리스트 - 스택 구조, 보안, 비용, 규정 준수, 합성 테스트의 5단계 검증 가이드
---

# Infrastructure Verification Guide

이 스킬은 AWS CDK 인프라 코드의 체계적 5단계 검증을 위한 가이드입니다.

## 프로젝트 인프라 맵

### 스택 구성 (9개)
```
infrastructure/lib/
  ├── ecr-stack.ts          # ECR 리포지토리 (Docker 이미지)
  ├── vpc-stack.ts          # VPC, 서브넷, NAT Gateway
  ├── ec2-stack.ts          # EC2 인스턴스 (앱 서버)
  ├── alb-stack.ts          # Application Load Balancer
  ├── certificate-stack.ts  # CloudFront용 ACM 인증서 (us-east-1)
  ├── cloudfront-stack.ts   # CloudFront CDN
  ├── cognito-stack.ts      # Cognito 사용자 풀
  ├── rds-stack.ts          # RDS PostgreSQL
  └── profile-bucket-stack.ts # 프로필 이미지 S3 버킷
```

### 의존성 체인
```
ECR → EC2
VPC → EC2, RDS, ALB
EC2 → RDS, ALB
Certificate (us-east-1) → CloudFront
ALB → CloudFront
Cognito → (독립, 프론트엔드에서 참조)
ProfileBucket → (독립)
```

## Stage 1: 스택 구조 검증

### 체크리스트
```bash
# 1. 스택 파일 존재 확인
ls infrastructure/lib/*-stack.ts

# 2. 스택 간 의존성 확인
grep -r "addDependency\|Fn.importValue\|fromLookup" infrastructure/lib/

# 3. 환경별 설정 분리 확인
grep -r "dev\|prod\|staging" infrastructure/lib/ infrastructure/bin/
```

### 확인 사항
- [ ] 순환 의존성 없음
- [ ] 크로스 스택 참조가 올바름 (`Fn.importValue`, `fromLookup`)
- [ ] 스택 네이밍: `{ProjectName}-{StackName}-{Environment}`
- [ ] `bin/` 파일에서 스택 인스턴스화 순서 올바름

## Stage 2: 인프라 보안 검증

> **범위 경계**: Stage 2는 **AWS 인프라 레이어** 보안 전담 (Security Group, IAM, KMS, VPC, Secrets Manager, Parameter Store, S3/RDS/EBS 암호화). SQL 인젝션·XSS·CSRF 등 **앱 코드 레이어 보안**은 `quality-reviewer`의 Pass 2에서 검증한다. 양 레이어 걸친 이슈(`.env` 커밋, 하드코딩 URL 등)는 `reviewer` Red Flag에서 교차 확인한다.

### 보안 그룹 감사
```bash
# 보안 그룹에서 0.0.0.0/0 허용 찾기
grep -r "0.0.0.0/0\|::/0\|Peer.anyIpv4\|Peer.anyIpv6" infrastructure/lib/
```

| 포트 | 허용 소스 | 기대값 |
|------|-----------|--------|
| 80 (HTTP) | 0.0.0.0/0 | ALB만 허용 가능 |
| 443 (HTTPS) | 0.0.0.0/0 | ALB/CloudFront만 허용 가능 |
| 22 (SSH) | 특정 IP | 절대 0.0.0.0/0 불가 |
| 5432 (PostgreSQL) | EC2 SG | 절대 외부 노출 불가 |

### IAM 정책 감사
```bash
# 과도한 권한 찾기
grep -r "Effect.ALLOW.*\*\|PolicyStatement.*actions.*\*" infrastructure/lib/
```

- [ ] `*` 리소스 사용 최소화
- [ ] 관리형 정책 우선 사용
- [ ] 서비스 역할에 적절한 범위 지정

### 데이터 암호화
- [ ] S3: `encryption: BucketEncryption.S3_MANAGED` 이상
- [ ] RDS: `storageEncrypted: true`
- [ ] EBS: 암호화 활성화

## Stage 3: 비용 검증

### Free Tier 비교 매트릭스

| 서비스 | Free Tier 한도 | 현재 설정 | 예상 월비용 |
|--------|---------------|-----------|-------------|
| EC2 | t2.micro 750h | 확인 필요 | |
| RDS | db.t3.micro 750h, 20GB | 확인 필요 | |
| ALB | 750h, 15 LCU | 확인 필요 | |
| CloudFront | 1TB/월 | 확인 필요 | |
| NAT Gateway | 없음 (유료) | 확인 필요 | ~$32/월 |
| S3 | 5GB | 확인 필요 | |
| ECR | 500MB | 확인 필요 | |

### 비용 최적화 확인
```bash
# 인스턴스 타입 확인
grep -r "instanceType\|InstanceType\|instanceClass" infrastructure/lib/
```

- [ ] NAT Gateway → NAT Instance 대체 검토 (비용 절감)
- [ ] RDS Multi-AZ 불필요한 경우 비활성화
- [ ] CloudFront 프라이스 클래스 설정 (PriceClass_100 등)

## Stage 4: 규정 준수 검증

### 필수 태그
```bash
# 태그 설정 확인
grep -r "Tags.of\|cdk.Tags\|tags:" infrastructure/lib/
```

| 태그 키 | 필수 | 설명 |
|---------|------|------|
| `project` | ✅ | 프로젝트 식별자 |
| `environment` | ✅ | dev / staging / prod |
| `managed-by` | ✅ | cdk / manual |

### 로깅/모니터링
- [ ] ALB 접근 로그 활성화
- [ ] CloudFront 접근 로그 활성화
- [ ] CloudWatch 알람 설정 (CPU, 메모리, 에러율)

### 백업/복구
- [ ] RDS 자동 백업 활성화 (보존 기간 7일 이상)
- [ ] RDS 스냅샷 정책
- [ ] S3 버전 관리 활성화

## Stage 5: 합성 테스트

### 실행 명령어
```bash
# CDK 디렉토리로 이동하여 합성
cd infrastructure && npx cdk synth 2>&1

# 변경 사항 확인 (배포 후)
cd infrastructure && npx cdk diff 2>&1
```

### 확인 사항
- [ ] `cdk synth` 성공 (에러/경고 없음)
- [ ] 생성된 CloudFormation 템플릿 크기 적절
- [ ] 리소스 수 예상 범위 내
- [ ] 출력값(Outputs) 올바르게 정의

## 판정 기준

| 판정 | 조건 |
|------|------|
| **PASS** | 모든 Stage ✅, CRITICAL 0건 |
| **PASS WITH WARNINGS** | 모든 Stage ✅, WARNING만 존재 |
| **FAIL** | 1개 이상 Stage ❌ 또는 CRITICAL 1건 이상 |
