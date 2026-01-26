# Observability Stack 설계 문서

> 작성일: 2026-01-27

## 개요

AWS 무료 티어 범위 내에서 관찰성(Observability) 스택을 구축합니다.
학습 목적과 포트폴리오 어필을 위해 CloudTrail, CloudWatch Alarms, SNS를 조합하여 인프라 모니터링 및 감사 로깅 시스템을 구성합니다.

## 아키텍처

```
┌─────────────────────────────────────────────────────────┐
│                    AWS Account                          │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────┐     ┌──────────────────┐              │
│  │  CloudTrail │────▶│  S3 Bucket       │              │
│  │  (API 추적)  │     │  (로그 저장)      │              │
│  └─────────────┘     └──────────────────┘              │
│                                                         │
│  ┌─────────────┐     ┌──────────────────┐   ┌───────┐ │
│  │  RDS        │────▶│  CloudWatch      │──▶│  SNS  │ │
│  │  EC2        │     │  Alarms          │   │ Topic │ │
│  │  ALB        │     │  (임계값 모니터링) │   └───┬───┘ │
│  └─────────────┘     └──────────────────┘       │     │
│                                                  ▼     │
│                                            ┌─────────┐ │
│                                            │  Email  │ │
│                                            │  알림    │ │
│                                            └─────────┘ │
└─────────────────────────────────────────────────────────┘
```

## 무료 티어 범위 확인

| 서비스 | 무료 한도 | 예상 사용량 | 상태 |
|--------|----------|------------|------|
| CloudTrail | 관리 이벤트 1 trail | 1 trail | ✅ |
| S3 | 5GB 저장 | ~100MB/월 | ✅ |
| CloudWatch Alarms | 10개 | 5-6개 | ✅ |
| SNS | 100만 요청 | ~100건/월 | ✅ |

## 상세 설계

### 1. CloudTrail 설정

```typescript
// CloudTrail용 S3 버킷
const trailBucket = new s3.Bucket(this, 'CloudTrailBucket', {
  bucketName: `portfolio-cloudtrail-logs-${account}`,
  encryption: s3.BucketEncryption.S3_MANAGED,
  blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
  lifecycleRules: [{
    expiration: cdk.Duration.days(90),  // 90일 후 자동 삭제
  }],
});

// CloudTrail 생성
const trail = new cloudtrail.Trail(this, 'AuditTrail', {
  bucket: trailBucket,
  trailName: 'portfolio-audit-trail',
  sendToCloudWatchLogs: false,  // 무료 유지 (S3만 사용)
  includeGlobalServiceEvents: true,
});
```

**설계 결정:**
- `sendToCloudWatchLogs: false` - CloudWatch Logs 비용 절감
- S3 Lifecycle 90일 - 비용 최적화와 적정 보관 기간 균형

### 2. SNS Topic 설정

```typescript
const alertTopic = new sns.Topic(this, 'AlertTopic', {
  topicName: 'portfolio-alerts',
  displayName: 'Portfolio Infrastructure Alerts',
});

alertTopic.addSubscription(
  new subscriptions.EmailSubscription('slow0x.dev+alert@gmail.com')
);
```

### 3. CloudWatch Alarms (5개)

| 알람명 | 대상 | 메트릭 | 임계값 | 평가 기간 |
|--------|------|--------|--------|----------|
| EC2-High-CPU | EC2 | CPUUtilization | > 80% | 2회 연속 (10분) |
| EC2-Status-Check | EC2 | StatusCheckFailed | > 0 | 1회 |
| RDS-High-CPU | RDS | CPUUtilization | > 80% | 2회 연속 (10분) |
| RDS-Low-Storage | RDS | FreeStorageSpace | < 2GB | 1회 |
| ALB-5XX-Errors | ALB | HTTPCode_Target_5XX | > 10/분 | 2회 연속 |

```typescript
// EC2 CPU 알람 예시
new cloudwatch.Alarm(this, 'Ec2CpuAlarm', {
  alarmName: 'EC2-High-CPU',
  metric: ec2Instance.metricCPUUtilization(),
  threshold: 80,
  evaluationPeriods: 2,
  datapointsToAlarm: 2,
  comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
});
```

## 스택 구조

### 파일 구조

```
infrastructure/
├── lib/
│   ├── vpc-stack.ts
│   ├── ec2-stack.ts
│   ├── rds-stack.ts
│   ├── alb-stack.ts
│   └── observability-stack.ts   ← 신규
└── bin/
    └── app.ts                   ← 수정
```

### 스택 의존성

```
VpcStack
    │
    ├── Ec2Stack ──────┐
    │                  │
    ├── RdsStack ──────┼──▶ ObservabilityStack
    │                  │
    └── AlbStack ──────┘
```

### ObservabilityStack Props

```typescript
interface ObservabilityStackProps extends cdk.StackProps {
  ec2Instance: ec2.Instance;
  rdsInstance: rds.DatabaseInstance;
  alb: elbv2.ApplicationLoadBalancer;
}
```

## 검증 방법

1. **배포 전 검증**
   ```bash
   cd infrastructure
   cdk synth ObservabilityStack
   cdk diff ObservabilityStack
   ```

2. **배포**
   ```bash
   cdk deploy ObservabilityStack
   ```

3. **배포 후 검증**
   - SNS: 이메일 구독 확인 링크 클릭
   - CloudTrail: AWS 콘솔에서 이벤트 기록 확인
   - S3: 1시간 후 로그 파일 생성 확인

4. **알람 테스트**
   ```bash
   # EC2에 SSH 접속 후 CPU 부하 발생
   ssh -i key.pem ec2-user@<ec2-ip>
   stress --cpu 2 --timeout 300
   ```

## 포트폴리오 어필 포인트

### 기술적 결정 설명
> "관찰성(Observability) 스택을 구축해서 인프라 상태를 모니터링합니다. CloudTrail로 API 감사 로그를 S3에 90일간 보관하고, CloudWatch Alarms로 EC2/RDS/ALB의 핵심 메트릭을 모니터링합니다."

### 비용 최적화 설명
> "모든 구성을 AWS 무료 티어 범위 내로 설계했습니다. CloudTrail 로그를 CloudWatch Logs 대신 S3에 저장하고, Lifecycle Policy로 90일 후 자동 삭제해서 비용을 0으로 유지합니다."

### 운영 경험 어필
> "알람 발생 시 SNS를 통해 이메일 알림을 받고, 필요하면 Lambda를 연결해서 Slack 알림으로 확장할 수 있습니다."

## 참고 자료

- [AWS CloudTrail 요금](https://aws.amazon.com/cloudtrail/pricing/)
- [AWS CloudWatch 요금](https://aws.amazon.com/cloudwatch/pricing/)
- [AWS SNS 요금](https://aws.amazon.com/sns/pricing/)
- [AWS Free Tier](https://aws.amazon.com/free/)
