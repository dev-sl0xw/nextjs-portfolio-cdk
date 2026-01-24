# AWS/CDK 베스트 프랙티스 / AWSベストプラクティス

이 문서는 AWS 리소스 및 CDK 코드 작성 규칙을 정의합니다.
このドキュメントはAWSリソースおよびCDKコード作成ルールを定義します。

---

## 태그 필수화 / タグ必須化

모든 AWS 리소스에 다음 태그를 필수로 적용합니다.
すべてのAWSリソースに以下のタグを必須で適用します。

| 태그 키 / タグキー | 설명 / 説明 | 예시 / 例 |
|------------------|-----------|----------|
| `Project` | 프로젝트 식별자 | `nextjs-portfolio` |
| `Environment` | 배포 환경 | `dev`, `staging`, `prod` |
| `ManagedBy` | 관리 도구 | `CDK`, `Terraform`, `Manual` |

### CDK에서 태그 적용 / CDKでタグ適用

```typescript
import { Tags } from 'aws-cdk-lib';

// 스택 레벨에서 태그 적용
// スタックレベルでタグを適用
Tags.of(this).add('Project', 'nextjs-portfolio');
Tags.of(this).add('Environment', 'dev');
Tags.of(this).add('ManagedBy', 'CDK');
```

---

## 리소스 네이밍 / リソース命名

### 네이밍 패턴 / 命名パターン
```
{project}-{env}-{resource}-{suffix}
```

### 예시 / 例
| 리소스 / リソース | 네이밍 / 命名 |
|-----------------|-------------|
| VPC | `portfolio-dev-vpc` |
| EC2 인스턴스 | `portfolio-dev-ec2-web` |
| ALB | `portfolio-dev-alb` |
| S3 버킷 | `portfolio-dev-s3-errors` |
| Security Group | `portfolio-dev-sg-ec2` |

### CDK에서 네이밍 / CDKで命名

```typescript
// 환경 변수로 프로젝트/환경 관리
// 環境変数でプロジェクト/環境管理
const projectName = 'portfolio';
const environment = 'dev';

new ec2.Instance(this, 'WebServer', {
  instanceName: `${projectName}-${environment}-ec2-web`,
  // ...
});
```

---

## 비용 관련 / コスト関連

### FreeTier 범위 유지 / FreeTier範囲維持

이 프로젝트는 **AWS FreeTier 범위 내**에서 운영하는 것을 목표로 합니다.
このプロジェクトは**AWS FreeTier範囲内**での運用を目標とします。

| 서비스 / サービス | FreeTier 한도 / FreeTier上限 | 비고 / 備考 |
|-----------------|---------------------------|----------|
| EC2 | t2.micro/t3.micro 750시간/월 | Linux만 해당 |
| S3 | 5GB 저장소, 20,000 GET | - |
| CloudFront | 1TB 전송, 10M 요청 | - |
| ECR | 500MB 저장소 | - |

### 고비용 리소스 주의 / 高コストリソース注意

다음 리소스는 FreeTier에 포함되지 않으므로 사용 시 주의가 필요합니다.
以下のリソースはFreeTierに含まれないため、使用時に注意が必要です。

| 리소스 / リソース | 예상 비용 / 予想コスト | 이 프로젝트에서 / このプロジェクトで |
|-----------------|---------------------|--------------------------------|
| NAT Gateway | ~$30-45/월 | ❌ 사용 안 함 (Private Subnet 제거) |
| WAF | ~$6-7/월 | ❌ 문서화만 (비용 절감) |
| Route53 Hosted Zone | ~$0.50/월 | ❌ CloudFront 기본 도메인 사용 |
| ALB | ~$16-22/월 | ⚠️ FreeTier 없음, 주의 필요 |

### 비용 명시 규칙 / コスト明示ルール

FreeTier 범위를 초과하는 리소스 사용 시, 주석으로 비용을 명시합니다.
FreeTier範囲を超過するリソース使用時、コメントでコストを明示します。

```typescript
// ⚠️ 비용 주의: ALB는 FreeTier에 포함되지 않음 (~$16-22/월)
// ⚠️ コスト注意: ALBはFreeTierに含まれない（~$16-22/月）
new elbv2.ApplicationLoadBalancer(this, 'ALB', {
  // ...
});
```

---

## 기술 선택 근거 / 技術選択根拠

**모든 CDK 리소스에 선택 이유를 주석으로 명시합니다.**
**すべてのCDKリソースに選択理由をコメントで明示します。**

### 좋은 예 / 良い例

```typescript
// ALB 선택 이유:
// - L7 (Application Layer) 로드밸런싱으로 HTTP 헤더 분석 가능
// - 경로 기반 라우팅 지원 (향후 확장 대비)
// - Health Check으로 EC2 상태 자동 모니터링
//
// ALB選択理由:
// - L7（アプリケーション層）ロードバランシングでHTTPヘッダー分析可能
// - パスベースルーティング対応（将来拡張対応）
// - Health CheckでEC2状態を自動モニタリング
new elbv2.ApplicationLoadBalancer(this, 'ALB', {
  // ...
});
```

### 필수 명시 항목 / 必須明示項目

1. **왜 이 서비스를 선택했는가?** / なぜこのサービスを選択したか？
2. **대안은 무엇이었는가?** / 代替案は何だったか？
3. **비용 영향은?** / コストへの影響は？

---

## CDK 코드 구조 / CDKコード構造

### 스택 분리 원칙 / スタック分離原則

```
infrastructure/lib/
├── vpc-stack.ts        # 네트워크 인프라
├── ecr-stack.ts        # 컨테이너 레지스트리
├── ec2-stack.ts        # 컴퓨팅 리소스
├── alb-stack.ts        # 로드밸런서
└── cloudfront-stack.ts # CDN + S3
```

각 스택은 **단일 책임 원칙**을 따릅니다.
各スタックは**単一責任原則**に従います。

### 스택 간 의존성 / スタック間依存性

```typescript
// 명시적으로 의존성 전달
// 明示的に依存性を渡す
const vpcStack = new VpcStack(app, 'VpcStack');
const ec2Stack = new Ec2Stack(app, 'Ec2Stack', {
  vpc: vpcStack.vpc,  // VPC 참조 전달
});
```

---

## 보안 관련 / セキュリティ関連

자세한 보안 규칙은 `security.md` 및 `network-security.md`를 참조하세요.
詳細なセキュリティルールは`security.md`および`network-security.md`を参照してください。
