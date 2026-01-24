# 보안 가드레일 / セキュリティガードレール

이 문서는 프로젝트의 보안 규칙을 정의합니다.
このドキュメントはプロジェクトのセキュリティルールを定義します。

---

## 금지 사항 / 禁止事項

### 1. 하드코딩된 시크릿 / ハードコードされたシークレット

**절대 금지**: 코드에 시크릿, API 키, 비밀번호를 하드코딩하지 않습니다.
**絶対禁止**: コードにシークレット、APIキー、パスワードをハードコードしません。

```typescript
// ❌ 절대 금지 / 絶対禁止
const apiKey = 'sk-1234567890abcdef';
const password = 'MySecretPassword123';

// ✅ 환경 변수 사용 / 環境変数使用
const apiKey = process.env.API_KEY;
```

### 2. .env 파일 커밋 금지 / .envファイルコミット禁止

`.env` 파일은 반드시 `.gitignore`에 추가합니다.
`.env`ファイルは必ず`.gitignore`に追加します。

```gitignore
# .gitignore
.env
.env.local
.env.*.local
*.pem
*.key
```

### 3. 민감한 정보가 포함될 수 있는 파일 / 機密情報を含む可能性のあるファイル

| 파일 유형 / ファイル種類 | 설명 / 説明 |
|----------------------|-----------|
| `.env*` | 환경 변수 파일 |
| `*.pem`, `*.key` | SSH 키, 인증서 |
| `credentials.json` | 서비스 계정 키 |
| `*.tfvars` | Terraform 변수 (시크릿 포함 가능) |

---

## 권장 사항 / 推奨事項

### 1. EC2 Security Group / EC2セキュリティグループ

**최소 권한 원칙**을 따릅니다.
**最小権限原則**に従います。

```typescript
// ✅ 좋은 예: 필요한 포트만 개방 / 良い例: 必要なポートのみ開放
securityGroup.addIngressRule(
  ec2.Peer.securityGroupId(albSecurityGroup.securityGroupId),
  ec2.Port.tcp(3000),
  // ALB에서만 3000 포트 접근 허용
  // ALBからのみ3000ポートアクセス許可
);

// ❌ 나쁜 예: 모든 IP에서 접근 허용 / 悪い例: すべてのIPからアクセス許可
securityGroup.addIngressRule(
  ec2.Peer.anyIpv4(),
  ec2.Port.allTraffic(),
  'Allow all traffic'
);
```

### 2. S3 버킷 보안 / S3バケットセキュリティ

**퍼블릭 액세스 차단** + **OAC(Origin Access Control)** 사용
**パブリックアクセスブロック** + **OAC使用**

```typescript
// S3 버킷 생성 시 퍼블릭 액세스 차단
// S3バケット作成時にパブリックアクセスブロック
const bucket = new s3.Bucket(this, 'ErrorPagesBucket', {
  blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
  // OAC를 통해서만 CloudFront에서 접근 가능
  // OACを通じてのみCloudFrontからアクセス可能
});
```

### 3. IAM 권한 / IAM権限

**필요한 권한만 부여**합니다.
**必要な権限のみ付与**します。

```typescript
// ✅ 좋은 예: 필요한 권한만 부여 / 良い例: 必要な権限のみ付与
ec2Role.addToPolicy(new iam.PolicyStatement({
  effect: iam.Effect.ALLOW,
  actions: [
    'ecr:GetDownloadUrlForLayer',
    'ecr:BatchGetImage',
    'ecr:GetAuthorizationToken',
  ],
  resources: ['*'], // ECR 인증 토큰은 리소스 제한 불가
}));

// ❌ 나쁜 예: 과도한 권한 / 悪い例: 過度な権限
ec2Role.addManagedPolicy(
  iam.ManagedPolicy.fromAwsManagedPolicyName('AdministratorAccess')
);
```

---

## 경고 표시 / 警告表示

### 개발 편의상 완화된 보안 설정 / 開発便宜上緩和されたセキュリティ設定

개발 또는 데모 목적으로 보안 설정을 완화한 경우, **반드시 TODO 주석**을 남깁니다.
開発またはデモ目的でセキュリティ設定を緩和した場合、**必ずTODOコメント**を残します。

```typescript
// TODO: 프로덕션에서는 IP 제한 필요
// TODO: 本番環境ではIP制限が必要
securityGroup.addIngressRule(
  ec2.Peer.anyIpv4(),
  ec2.Port.tcp(22),
  'SSH access - DEVELOPMENT ONLY'
);

// TODO: 프로덕션에서는 HTTPS 필수
// TODO: 本番環境ではHTTPS必須
listener = alb.addListener('HttpListener', {
  port: 80,  // HTTP only for demo
});
```

### 경고 주석 형식 / 警告コメント形式

```
// TODO: [보안] {설명}
// TODO: [セキュリティ] {説明}
```

또는

```
// ⚠️ SECURITY WARNING: {설명}
// ⚠️ セキュリティ警告: {説明}
```

---

## AWS 시크릿 관리 / AWSシークレット管理

### 권장 방법 / 推奨方法

| 용도 / 用途 | 권장 서비스 / 推奨サービス |
|------------|------------------------|
| API 키, 비밀번호 | AWS Secrets Manager |
| 설정 값 | AWS Systems Manager Parameter Store |
| 환경 변수 | GitHub Secrets (CI/CD용) |

### GitHub Actions에서 시크릿 사용 / GitHub Actionsでシークレット使用

```yaml
# .github/workflows/deploy.yml
jobs:
  deploy:
    steps:
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ap-northeast-1
```

---

## 보안 체크리스트 / セキュリティチェックリスト

PR 제출 전 확인:
PR提出前に確認:

- [ ] 코드에 하드코딩된 시크릿이 없는가?
- [ ] `.env` 파일이 `.gitignore`에 포함되어 있는가?
- [ ] Security Group이 최소 권한 원칙을 따르는가?
- [ ] S3 버킷이 퍼블릭 액세스 차단 상태인가?
- [ ] IAM 정책이 필요한 권한만 포함하는가?
- [ ] 완화된 보안 설정에 TODO 주석이 있는가?
