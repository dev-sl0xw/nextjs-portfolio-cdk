# 네트워크 보안 가드레일 / ネットワークセキュリティガードレール

이 문서는 AWS 네트워크 보안 규칙과 OSI 7계층에 대한 이해를 정의합니다.
このドキュメントはAWSネットワークセキュリティルールとOSI 7層についての理解を定義します。

---

## OSI 7계층과 AWS 서비스 / OSI 7層とAWSサービス

각 계층에서 어떤 AWS 서비스가 작동하는지 이해하는 것은 네트워크 보안의 기초입니다.
各層でどのAWSサービスが動作するかを理解することはネットワークセキュリティの基礎です。

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Layer 7 - Application (응용 계층 / アプリケーション層)                      │
│  ├─ CloudFront: CDN, HTTP/HTTPS 요청 처리                                   │
│  ├─ ALB (Application Load Balancer): HTTP 헤더 분석, 경로 기반 라우팅        │
│  └─ WAF: HTTP 요청 필터링, SQL 인젝션/XSS 방어                               │
├─────────────────────────────────────────────────────────────────────────────┤
│  Layer 6 - Presentation (표현 계층 / プレゼンテーション層)                   │
│  └─ ACM (Certificate Manager): SSL/TLS 인증서 관리, 암호화/복호화            │
├─────────────────────────────────────────────────────────────────────────────┤
│  Layer 5 - Session (세션 계층 / セッション層)                                │
│  └─ ALB: TCP 연결 세션 관리, Keep-Alive                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│  Layer 4 - Transport (전송 계층 / トランスポート層)                          │
│  ├─ NLB (Network Load Balancer): TCP/UDP 포트 기반 로드밸런싱                │
│  ├─ Security Group: TCP/UDP 포트 기반 필터링 (Stateful)                      │
│  └─ NACL: TCP/UDP 포트 기반 필터링 (Stateless)                               │
├─────────────────────────────────────────────────────────────────────────────┤
│  Layer 3 - Network (네트워크 계층 / ネットワーク層)                          │
│  ├─ Internet Gateway: 인터넷 연결, 퍼블릭 IP 매핑                            │
│  ├─ NAT Gateway: 프라이빗 서브넷 아웃바운드 인터넷 접근                       │
│  ├─ Route Table: IP 패킷 라우팅 결정                                         │
│  └─ VPC Peering: VPC 간 IP 라우팅                                            │
├─────────────────────────────────────────────────────────────────────────────┤
│  Layer 2 - Data Link (데이터링크 계층 / データリンク層)                      │
│  └─ VPC: 가상 네트워크, 서브넷 분리                                          │
├─────────────────────────────────────────────────────────────────────────────┤
│  Layer 1 - Physical (물리 계층 / 物理層)                                     │
│  └─ AWS 데이터센터: 물리적 인프라 (사용자 관리 범위 외)                       │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Security Group vs NACL 비교 / セキュリティグループ vs NACL比較

두 서비스의 차이를 정확히 이해하는 것이 중요합니다.
両サービスの違いを正確に理解することが重要です。

| 특성 / 特性 | Security Group | NACL |
|------------|----------------|------|
| **적용 레벨** | 인스턴스(ENI) 레벨 | 서브넷 레벨 |
| **상태 관리** | **Stateful** (상태 유지) | **Stateless** (상태 없음) |
| **규칙 타입** | 허용(Allow)만 가능 | 허용/거부 모두 가능 |
| **규칙 평가** | 모든 규칙 동시 평가 | 규칙 번호 순서대로 평가 |
| **기본 동작** | 모든 인바운드 거부, 모든 아웃바운드 허용 | 모든 트래픽 허용 |

---

## Stateful vs Stateless 개념 / ステートフル vs ステートレス概念

### Stateful (Security Group) / ステートフル

연결 상태를 **기억**합니다.
接続状態を**記憶**します。

```
[요청 / リクエスト]
Client (1.2.3.4:54321) → EC2:3000
  ↓
Security Group: 인바운드 규칙 확인 → 허용
  ↓
[응답 / レスポンス]
EC2:3000 → Client (1.2.3.4:54321)
  ↓
Security Group: "이 응답은 이전 요청의 일부" → 자동 허용
              "このレスポンスは以前のリクエストの一部" → 自動許可
```

**장점**: 아웃바운드 규칙 설정 간소화
**利点**: アウトバウンドルール設定の簡素化

### Stateless (NACL) / ステートレス

연결 상태를 **기억하지 않습니다**.
接続状態を**記憶しません**。

```
[요청 / リクエスト]
Client (1.2.3.4:54321) → EC2:3000
  ↓
NACL Inbound: 인바운드 규칙 확인 → 허용

[응답 / レスポンス]
EC2:3000 → Client (1.2.3.4:54321)
  ↓
NACL Outbound: 아웃바운드 규칙 확인 → ???
              Ephemeral Port (1024-65535) 허용 필요!
```

**주의**: Ephemeral Port(임시 포트) 범위를 명시적으로 허용해야 합니다.
**注意**: Ephemeral Port範囲を明示的に許可する必要があります。

---

## 트래픽 흐름 분석 / トラフィックフロー分析

이 프로젝트의 요청/응답 흐름:
このプロジェクトのリクエスト/レスポンスフロー:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 1. 사용자 → CloudFront (HTTPS:443)                                          │
│    L7: CloudFront에서 HTTPS 처리                                            │
│    L6: ACM 인증서로 SSL/TLS 복호화                                           │
├─────────────────────────────────────────────────────────────────────────────┤
│ 2. CloudFront → ALB (HTTP:80)                                               │
│    L7: ALB가 HTTP 요청 수신                                                  │
│    L4: NACL Inbound 확인 (Stateless)                                        │
│    L4: ALB Security Group Inbound 확인 (Stateful)                           │
├─────────────────────────────────────────────────────────────────────────────┤
│ 3. ALB → EC2 (HTTP:3000)                                                    │
│    L7: ALB가 Target Group으로 요청 전달                                      │
│    L4: EC2 Security Group Inbound 확인 (Stateful)                           │
├─────────────────────────────────────────────────────────────────────────────┤
│ 4. EC2 → ALB (응답 / レスポンス)                                             │
│    L4: EC2 Security Group - Stateful이므로 자동 허용                         │
├─────────────────────────────────────────────────────────────────────────────┤
│ 5. ALB → CloudFront (응답 / レスポンス)                                      │
│    L4: ALB Security Group - Stateful이므로 자동 허용                         │
│    L4: NACL Outbound 확인 (Stateless, Ephemeral Port 필요)                  │
├─────────────────────────────────────────────────────────────────────────────┤
│ 6. CloudFront → 사용자 (HTTPS 응답)                                         │
│    L7: CloudFront가 응답 전송                                                │
│    L6: ACM 인증서로 SSL/TLS 암호화                                           │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## CDK 코드 작성 규칙 / CDKコード記述ルール

### 1. OSI 계층 주석 필수 / OSI層コメント必須

모든 네트워크 관련 리소스에 OSI 계층 주석을 추가합니다.
すべてのネットワーク関連リソースにOSI層コメントを追加します。

```typescript
// [L4 - Transport] EC2 Security Group
// TCP 포트 기반 트래픽 필터링 (Stateful)
// TCPポートベースのトラフィックフィルタリング（ステートフル）
const ec2SecurityGroup = new ec2.SecurityGroup(this, 'Ec2Sg', {
  vpc,
  description: 'Security group for EC2 instance',
});

// ALB에서만 3000 포트 접근 허용
// ALBからのみ3000ポートアクセス許可
ec2SecurityGroup.addIngressRule(
  ec2.Peer.securityGroupId(albSecurityGroup.securityGroupId),
  ec2.Port.tcp(3000),
  'Allow traffic from ALB only'
);
```

### 2. Stateful/Stateless 명시 / ステートフル/ステートレス明示

```typescript
// [L4] Security Group (Stateful)
// 인바운드 허용 시 응답 아웃바운드 자동 허용
// インバウンド許可時にレスポンスアウトバウンド自動許可
const sg = new ec2.SecurityGroup(this, 'SG', { ... });

// [L4] NACL (Stateless)
// 인바운드/아웃바운드 각각 규칙 필요
// インバウンド/アウトバウンドそれぞれルールが必要
const nacl = new ec2.NetworkAcl(this, 'NACL', { ... });
```

### 3. 트래픽 흐름 주석 / トラフィックフローコメント

```typescript
// 트래픽 흐름:
// CloudFront → ALB:80 → EC2:3000
// トラフィックフロー:
// CloudFront → ALB:80 → EC2:3000
```

---

## 권장 Security Group 설정 / 推奨セキュリティグループ設定

### ALB Security Group

```typescript
// CloudFront에서만 HTTP 트래픽 허용
// CloudFrontからのみHTTPトラフィック許可
albSg.addIngressRule(
  ec2.Peer.anyIpv4(),  // CloudFront IP 범위가 동적이므로 anyIpv4 사용
  ec2.Port.tcp(80),
  'Allow HTTP from CloudFront'
);
```

### EC2 Security Group

```typescript
// ALB에서만 애플리케이션 포트 허용
// ALBからのみアプリケーションポート許可
ec2Sg.addIngressRule(
  ec2.Peer.securityGroupId(albSg.securityGroupId),
  ec2.Port.tcp(3000),
  'Allow from ALB only'
);
```

---

## NACL 기본 설정 / NACL基本設定

VPC의 기본 NACL은 모든 트래픽을 허용합니다. 커스텀 NACL 사용 시:
VPCのデフォルトNACLはすべてのトラフィックを許可します。カスタムNACL使用時:

```typescript
// Inbound: HTTP 허용
nacl.addEntry('AllowHttpInbound', {
  cidr: ec2.AclCidr.anyIpv4(),
  ruleNumber: 100,
  traffic: ec2.AclTraffic.tcpPort(80),
  direction: ec2.TrafficDirection.INGRESS,
  ruleAction: ec2.Action.ALLOW,
});

// Outbound: Ephemeral Port 허용 (Stateless이므로 필수!)
// Ephemeral Portを許可（ステートレスなので必須！）
nacl.addEntry('AllowEphemeralOutbound', {
  cidr: ec2.AclCidr.anyIpv4(),
  ruleNumber: 100,
  traffic: ec2.AclTraffic.tcpPortRange(1024, 65535),
  direction: ec2.TrafficDirection.EGRESS,
  ruleAction: ec2.Action.ALLOW,
});
```
