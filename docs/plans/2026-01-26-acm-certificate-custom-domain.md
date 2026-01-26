# ACM Certificate + Custom Domain Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** CloudFront에 `vibe.er.ht` 커스텀 도메인을 연결하기 위한 ACM 인증서 발급 및 설정

**Architecture:** 별도의 CertificateStack을 us-east-1 리전에 생성하고, CloudFrontStack에서 cross-region 참조하여 커스텀 도메인 설정. DNS 검증은 외부 DNS 관리자(지인)에게 CNAME 추가 요청.

**Tech Stack:** AWS CDK, ACM (AWS Certificate Manager), CloudFront

---

## Task 1: CertificateStack 생성

**Files:**
- Create: `infrastructure/lib/certificate-stack.ts`

**Step 1: certificate-stack.ts 파일 생성**

```typescript
import * as cdk from 'aws-cdk-lib';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import { Construct } from 'constructs';

/**
 * Certificate 스택 Props
 * Certificateスタック Props
 */
export interface CertificateStackProps extends cdk.StackProps {
  readonly projectName: string;
  readonly environment: string;
  readonly domainName: string;
}

/**
 * ACM Certificate 스택
 * ACM Certificateスタック
 *
 * [Security Layer] SSL/TLS 인증서 관리
 * SSL/TLS証明書管理
 *
 * 주의사항:
 * - CloudFront용 인증서는 반드시 us-east-1 리전에 생성해야 함
 * - DNS 검증 방식 사용 (외부 DNS 관리자에게 CNAME 추가 요청 필요)
 *
 * 注意事項:
 * - CloudFront用証明書は必ずus-east-1リージョンに作成する必要あり
 * - DNS検証方式使用（外部DNS管理者にCNAME追加依頼が必要）
 */
export class CertificateStack extends cdk.Stack {
  public readonly certificate: acm.Certificate;

  constructor(scope: Construct, id: string, props: CertificateStackProps) {
    super(scope, id, props);

    const { projectName, environment, domainName } = props;

    // ============================================================
    // ACM 인증서 생성 (DNS 검증)
    // ACM証明書作成（DNS検証）
    //
    // DNS 검증 선택 이유:
    // - 자동 갱신 지원
    // - 이메일 접근 불필요
    // - 외부 DNS 관리자에게 CNAME 추가만 요청하면 됨
    //
    // DNS検証選択理由:
    // - 自動更新対応
    // - メールアクセス不要
    // - 外部DNS管理者にCNAME追加を依頼するだけ
    // ============================================================
    this.certificate = new acm.Certificate(this, 'Certificate', {
      domainName: domainName,
      validation: acm.CertificateValidation.fromDns(),
      certificateName: `${projectName}-${environment}-certificate`,
    });

    // ============================================================
    // 출력값 정의
    // 出力値定義
    // ============================================================
    new cdk.CfnOutput(this, 'CertificateArn', {
      value: this.certificate.certificateArn,
      description: 'ACM Certificate ARN (use this in CloudFront)',
      exportName: `${projectName}-${environment}-certificate-arn`,
    });

    new cdk.CfnOutput(this, 'DomainName', {
      value: domainName,
      description: 'Domain name for the certificate',
      exportName: `${projectName}-${environment}-domain-name`,
    });
  }
}
```

**Step 2: 파일 생성 확인**

Run: `ls -la infrastructure/lib/certificate-stack.ts`
Expected: 파일이 존재함

**Step 3: TypeScript 컴파일 확인**

Run: `cd infrastructure && npx tsc --noEmit`
Expected: 에러 없음

**Step 4: Commit**

```bash
git add infrastructure/lib/certificate-stack.ts
git commit -m "feat(infra): add CertificateStack for ACM certificate

- Create certificate-stack.ts for us-east-1 region
- DNS validation for external DNS provider
- Export certificate ARN for CloudFront cross-region reference

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 2: CloudFrontStackProps 확장

**Files:**
- Modify: `infrastructure/lib/cloudfront-stack.ts:11-16`

**Step 1: import 문에 acm 추가**

기존:
```typescript
import * as cdk from 'aws-cdk-lib';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import { Construct } from 'constructs';
```

변경:
```typescript
import * as cdk from 'aws-cdk-lib';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import { Construct } from 'constructs';
```

**Step 2: CloudFrontStackProps 인터페이스 확장**

기존:
```typescript
export interface CloudFrontStackProps extends cdk.StackProps {
  readonly projectName: string;
  readonly environment: string;
  readonly alb: elbv2.IApplicationLoadBalancer;
}
```

변경:
```typescript
export interface CloudFrontStackProps extends cdk.StackProps {
  readonly projectName: string;
  readonly environment: string;
  readonly alb: elbv2.IApplicationLoadBalancer;
  /** 커스텀 도메인 (선택사항) / カスタムドメイン（オプション） */
  readonly domainName?: string;
  /** ACM 인증서 (domainName 설정 시 필수) / ACM証明書（domainName設定時に必須） */
  readonly certificate?: acm.ICertificate;
}
```

**Step 3: TypeScript 컴파일 확인**

Run: `cd infrastructure && npx tsc --noEmit`
Expected: 에러 없음

**Step 4: Commit**

```bash
git add infrastructure/lib/cloudfront-stack.ts
git commit -m "feat(infra): extend CloudFrontStackProps for custom domain

- Add optional domainName and certificate props
- Import ACM module

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 3: CloudFront Distribution에 커스텀 도메인 설정 추가

**Files:**
- Modify: `infrastructure/lib/cloudfront-stack.ts` (Distribution 설정 부분)

**Step 1: Distribution 설정에 domainNames와 certificate 추가**

Distribution 생성 부분의 마지막에 다음 속성 추가 (httpVersion 다음):

기존 (httpVersion까지):
```typescript
      // HTTP 버전
      // HTTPバージョン
      httpVersion: cloudfront.HttpVersion.HTTP2_AND_3,

      // 기본 루트 객체 설정 안 함 (Next.js에서 처리)
      // デフォルトルートオブジェクト設定なし（Next.jsで処理）
      defaultRootObject: '',
```

변경:
```typescript
      // HTTP 버전
      // HTTPバージョン
      httpVersion: cloudfront.HttpVersion.HTTP2_AND_3,

      // 기본 루트 객체 설정 안 함 (Next.js에서 처리)
      // デフォルトルートオブジェクト設定なし（Next.jsで処理）
      defaultRootObject: '',

      // ============================================================
      // 커스텀 도메인 설정 (선택사항)
      // カスタムドメイン設定（オプション）
      //
      // domainName과 certificate가 모두 제공된 경우에만 설정
      // domainNameとcertificateが両方提供された場合のみ設定
      // ============================================================
      ...(props.domainName && props.certificate && {
        domainNames: [props.domainName],
        certificate: props.certificate,
      }),
```

**Step 2: 커스텀 도메인 관련 Output 추가**

기존 Output들 다음에 추가 (SiteUrl 출력 아래, ErrorPagesBucketName 위):

```typescript
    // 커스텀 도메인 URL (설정된 경우)
    // カスタムドメインURL（設定された場合）
    if (props.domainName) {
      new cdk.CfnOutput(this, 'CustomDomainUrl', {
        value: `https://${props.domainName}`,
        description: 'Custom Domain URL',
        exportName: `${projectName}-${environment}-custom-domain-url`,
      });
    }
```

**Step 3: 기존 ACM 관련 주석 업데이트**

기존 주석 (참고: ACM 인증서 부분):
```typescript
    // ============================================================
    // 참고: ACM 인증서 (커스텀 도메인 사용 시)
    // 参考: ACM証明書（カスタムドメイン使用時）
    //
    // 커스텀 도메인 사용 시:
    // 1. us-east-1 리전에 ACM 인증서 생성 필요
    // 2. Route53 호스팅 존 설정
    // 3. CloudFront에 대체 도메인 추가
    //
    // カスタムドメイン使用時:
    // 1. us-east-1リージョンにACM証明書作成が必要
    // 2. Route53ホスティングゾーン設定
    // 3. CloudFrontに代替ドメイン追加
    //
    // 현재 MVP에서는 CloudFront 기본 도메인 사용
    // 現在のMVPではCloudFrontデフォルトドメイン使用
    // ============================================================
```

변경:
```typescript
    // ============================================================
    // ACM 인증서 및 커스텀 도메인
    // ACM証明書およびカスタムドメイン
    //
    // 커스텀 도메인 설정 완료:
    // - CertificateStack에서 us-east-1 리전에 인증서 생성
    // - props.domainName과 props.certificate로 설정
    // - DNS 검증은 외부 DNS 관리자에게 CNAME 추가 요청
    //
    // カスタムドメイン設定完了:
    // - CertificateStackでus-east-1リージョンに証明書作成
    // - props.domainNameとprops.certificateで設定
    // - DNS検証は外部DNS管理者にCNAME追加を依頼
    // ============================================================
```

**Step 4: TypeScript 컴파일 확인**

Run: `cd infrastructure && npx tsc --noEmit`
Expected: 에러 없음

**Step 5: Commit**

```bash
git add infrastructure/lib/cloudfront-stack.ts
git commit -m "feat(infra): add custom domain support to CloudFront Distribution

- Add domainNames and certificate to Distribution config
- Add conditional CustomDomainUrl output
- Update ACM documentation comments

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 4: app.ts에 CertificateStack 추가

**Files:**
- Modify: `infrastructure/bin/app.ts`

**Step 1: CertificateStack import 추가**

기존:
```typescript
import { CloudFrontStack } from '../lib/cloudfront-stack';
```

변경:
```typescript
import { CertificateStack } from '../lib/certificate-stack';
import { CloudFrontStack } from '../lib/cloudfront-stack';
```

**Step 2: 도메인 설정 추가**

projectName, environment 변수 다음에 추가:

```typescript
// 커스텀 도메인 설정
// カスタムドメイン設定
const domainName = 'vibe.er.ht';
```

**Step 3: CertificateStack 생성 (CloudFrontStack 전에)**

CloudFrontStack 생성 코드 바로 위에 추가:

```typescript
// Certificate Stack (us-east-1 리전 필수)
// SSL/TLS 인증서 - CloudFront용은 반드시 us-east-1에 생성
// SSL/TLS証明書 - CloudFront用は必ずus-east-1に作成
const certificateStack = new CertificateStack(app, 'CertificateStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: 'us-east-1',  // CloudFront 인증서는 us-east-1 필수
  },
  projectName,
  environment,
  domainName,
  description: 'ACM Certificate for CloudFront custom domain',
  crossRegionReferences: true,  // cross-region 참조 활성화
});
```

**Step 4: CloudFrontStack에 인증서 연결**

기존 CloudFrontStack 생성:
```typescript
const cloudFrontStack = new CloudFrontStack(app, 'CloudFrontStack', {
  env,
  projectName,
  environment,
  alb: albStack.alb,
  description: 'CloudFront CDN with S3 error pages',
});
```

변경:
```typescript
const cloudFrontStack = new CloudFrontStack(app, 'CloudFrontStack', {
  env,
  projectName,
  environment,
  alb: albStack.alb,
  domainName,
  certificate: certificateStack.certificate,
  description: 'CloudFront CDN with S3 error pages and custom domain',
  crossRegionReferences: true,  // cross-region 참조 활성화
});
cloudFrontStack.addDependency(certificateStack);
```

**Step 5: TypeScript 컴파일 확인**

Run: `cd infrastructure && npx tsc --noEmit`
Expected: 에러 없음

**Step 6: CDK synth 확인**

Run: `cd infrastructure && npx cdk synth --quiet`
Expected: 에러 없이 CloudFormation 템플릿 생성

**Step 7: Commit**

```bash
git add infrastructure/bin/app.ts
git commit -m "feat(infra): integrate CertificateStack with CloudFront

- Add CertificateStack in us-east-1 region
- Connect certificate to CloudFrontStack
- Enable cross-region references
- Set custom domain: vibe.er.ht

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 5: CDK diff 확인 및 배포 가이드 문서화

**Files:**
- Create: `docs/deployment/custom-domain-setup.md`

**Step 1: CDK diff로 변경사항 확인**

Run: `cd infrastructure && npx cdk diff`
Expected: CertificateStack과 CloudFrontStack 변경사항 표시

**Step 2: 배포 가이드 문서 작성**

```markdown
# Custom Domain Setup Guide

## 개요

`vibe.er.ht` 커스텀 도메인을 CloudFront에 연결하기 위한 배포 가이드.

## 사전 조건

- AWS CLI 설정 완료
- CDK bootstrap 완료 (us-east-1 리전 포함)
- 지인(DNS 관리자)에게 CNAME 추가 요청 가능

## 배포 단계

### 1. us-east-1 리전 Bootstrap (최초 1회)

```bash
cd infrastructure
npx cdk bootstrap aws://<ACCOUNT_ID>/us-east-1
```

### 2. CertificateStack 배포

```bash
npx cdk deploy CertificateStack
```

배포 완료 후 AWS Console에서 인증서 상태 확인:
1. AWS Console → Certificate Manager → us-east-1 리전
2. 인증서 선택 → "Domains" 섹션에서 CNAME 레코드 확인

### 3. DNS 검증 CNAME 추가 요청

지인(DNS 관리자)에게 다음 정보 전달:

```
레코드 유형: CNAME
이름: _<hash>.vibe.er.ht
값: _<hash>.acm-validations.aws
```

(실제 값은 AWS Console에서 확인)

### 4. 인증서 발급 대기

- 상태가 "Pending validation" → "Issued"로 변경될 때까지 대기
- 일반적으로 DNS 레코드 추가 후 수 분 ~ 수 시간 소요

### 5. CloudFrontStack 배포

인증서 발급 완료 후:

```bash
npx cdk deploy CloudFrontStack
```

### 6. CloudFront 도메인 CNAME 추가 요청

지인(DNS 관리자)에게 다음 정보 전달:

```
레코드 유형: CNAME
이름: vibe
값: <distribution-id>.cloudfront.net
```

(실제 CloudFront 도메인은 배포 출력에서 확인)

### 7. 접속 테스트

```bash
curl -I https://vibe.er.ht
```

## 문제 해결

### 인증서 검증 실패
- DNS CNAME 레코드가 올바르게 추가되었는지 확인
- `dig _<hash>.vibe.er.ht CNAME` 명령으로 DNS 전파 확인

### CloudFront 배포 실패
- 인증서 상태가 "Issued"인지 확인
- 인증서가 us-east-1 리전에 있는지 확인

### HTTPS 접속 오류
- DNS CNAME이 CloudFront 도메인을 올바르게 가리키는지 확인
- `dig vibe.er.ht CNAME` 명령으로 확인
```

**Step 3: Commit**

```bash
git add docs/deployment/custom-domain-setup.md
git commit -m "docs: add custom domain setup guide

- Step-by-step deployment instructions
- DNS validation workflow
- Troubleshooting section

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## 완료 후 체크리스트

- [ ] `infrastructure/lib/certificate-stack.ts` 생성됨
- [ ] `infrastructure/lib/cloudfront-stack.ts` 수정됨
- [ ] `infrastructure/bin/app.ts` 수정됨
- [ ] `docs/deployment/custom-domain-setup.md` 생성됨
- [ ] `npx cdk synth` 성공
- [ ] 모든 커밋 완료