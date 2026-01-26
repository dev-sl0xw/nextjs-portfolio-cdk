# ACM Certificate + Custom Domain 설계

## 개요

CloudFront에 커스텀 도메인 `vibe.er.ht`를 연결하기 위한 ACM 인증서 발급 및 설정.

## 배경

- 지인으로부터 `vibe.er.ht` 서브도메인 사용 허가를 받음
- 지인이 `er.ht` DNS를 관리하며, 필요한 레코드를 추가해줄 예정
- DNS 검증 방식으로 ACM 인증서 발급

## 아키텍처

```
┌─────────────────────────────────────────────────────────────┐
│  vibe.er.ht (지인 DNS)                                       │
│       │                                                      │
│       ▼ CNAME                                                │
│  ┌─────────────────────┐     ┌─────────────────────┐        │
│  │   CloudFront        │◄────│  ACM Certificate    │        │
│  │   (ap-northeast-1)  │     │  (us-east-1)        │        │
│  └─────────────────────┘     └─────────────────────┘        │
│                                       │                      │
│                              DNS 검증용 CNAME                │
│                              (지인에게 요청)                  │
└─────────────────────────────────────────────────────────────┘
```

### 핵심 포인트

1. **ACM 인증서**: `us-east-1` 리전에 생성 (CloudFront 필수 요구사항)
2. **DNS 레코드 2개 필요** (지인에게 요청):
   - 인증서 검증용 CNAME
   - `vibe.er.ht` → CloudFront 도메인 CNAME
3. **Cross-region 참조**: 인증서(us-east-1) → CloudFront(현재 리전)

## CDK 스택 구조

### 파일 변경 사항

**새로 생성:**
- `infrastructure/lib/certificate-stack.ts`

**수정:**
- `infrastructure/lib/cloudfront-stack.ts`
- `infrastructure/bin/infrastructure.ts`

### 스택 의존성

```typescript
// infrastructure/bin/infrastructure.ts
const certificateStack = new CertificateStack(app, 'CertificateStack', {
  env: { region: 'us-east-1', account: process.env.CDK_DEFAULT_ACCOUNT },
  domainName: 'vibe.er.ht',
  projectName,
  environment,
});

const cloudFrontStack = new CloudFrontStack(app, 'CloudFrontStack', {
  certificate: certificateStack.certificate,
  domainName: 'vibe.er.ht',
  // ... 기존 props
});

cloudFrontStack.addDependency(certificateStack);
```

## 구현 상세

### 1. CertificateStack

```typescript
// infrastructure/lib/certificate-stack.ts
export interface CertificateStackProps extends cdk.StackProps {
  domainName: string;
  projectName: string;
  environment: string;
}

export class CertificateStack extends cdk.Stack {
  public readonly certificate: acm.Certificate;

  constructor(scope: Construct, id: string, props: CertificateStackProps) {
    super(scope, id, props);

    // DNS 검증 방식 ACM 인증서
    this.certificate = new acm.Certificate(this, 'Certificate', {
      domainName: props.domainName,
      validation: acm.CertificateValidation.fromDns(),
    });

    // 출력: 인증서 ARN
    new cdk.CfnOutput(this, 'CertificateArn', {
      value: this.certificate.certificateArn,
      description: 'ACM Certificate ARN',
    });
  }
}
```

### 2. CloudFrontStack 수정

```typescript
// CloudFrontStackProps에 추가
certificate?: acm.ICertificate;
domainName?: string;

// Distribution 설정에 추가
this.distribution = new cloudfront.Distribution(this, 'Distribution', {
  // ... 기존 설정 유지

  // 커스텀 도메인 설정 (옵션)
  ...(props.domainName && props.certificate && {
    domainNames: [props.domainName],
    certificate: props.certificate,
  }),
});
```

## 배포 순서

1. `CertificateStack` 배포
   ```bash
   cd infrastructure
   npx cdk deploy CertificateStack
   ```

2. DNS 검증 CNAME 확인 (AWS Console 또는 CLI)
   ```bash
   aws acm describe-certificate --certificate-arn <ARN> --region us-east-1
   ```

3. 지인에게 검증용 CNAME 추가 요청

4. 인증서 발급 완료 대기 (Status: ISSUED)

5. `CloudFrontStack` 배포
   ```bash
   npx cdk deploy CloudFrontStack
   ```

6. 지인에게 `vibe.er.ht` → CloudFront 도메인 CNAME 추가 요청

## 주의사항

- ACM 인증서는 반드시 `us-east-1` 리전에 생성해야 CloudFront에서 사용 가능
- DNS 검증은 지인의 협조가 필요하므로 시간이 걸릴 수 있음
- 인증서 발급 전에 CloudFront에 도메인을 연결하면 배포 실패