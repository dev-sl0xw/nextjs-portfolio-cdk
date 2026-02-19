---
name: code-review
description: 최종 코드 리뷰 기준 - 프로젝트 규칙 대비 크로스 레퍼런스, 에이전트 보고서 교차 검증, Red Flags 기반 APPROVED/CHANGES REQUESTED 판정
---

# Code Review Standards

이 스킬은 최종 리뷰어가 사용하는 코드 리뷰 기준과 판정 방법을 정의합니다.

## 리뷰 원칙

1. **읽기 전용**: 코드를 직접 수정하지 않음. 검증과 판정만 수행
2. **근거 기반**: 모든 판정에 구체적 코드 레퍼런스 (파일:라인) 포함
3. **규칙 기반**: 개인 선호가 아닌 프로젝트 규칙에 따라 판단
4. **교차 검증**: 다른 에이전트의 보고서도 검증 대상

## 프로젝트 규칙 준수 매트릭스

### 규칙 소스 파일
| 소스 | 위치 | 핵심 규칙 |
|------|------|-----------|
| CLAUDE.md | 루트 | 프로젝트 전체 지침, Git 규칙, 이력 저장 |
| tsconfig.json | frontend/ | TypeScript strict, 경로 별칭 |
| .eslintrc | frontend/ | 린트 규칙 |
| tailwind.config | frontend/ | 커스텀 색상, 플러그인 |
| cdk.json | infrastructure/ | CDK 앱 설정 |

### 크로스 레퍼런스 확인 사항

#### TypeScript (tsconfig.json 대비)
- [ ] `strict: true` 호환 (noImplicitAny, strictNullChecks 등)
- [ ] 경로 별칭 올바른 사용 (`@/` 등)
- [ ] 타겟/모듈 설정 호환 import 사용

#### ESLint (.eslintrc 대비)
- [ ] 명시된 규칙 위반 없음
- [ ] `// eslint-disable` 사용 시 타당한 사유
- [ ] 새 규칙 추가 시 팀 합의

#### Tailwind (tailwind.config 대비)
- [ ] 커스텀 색상/간격 사용 시 config에 정의됨
- [ ] 플러그인 추가 시 config에 등록
- [ ] content 경로에 새 디렉토리 포함

#### CDK (cdk.json 대비)
- [ ] 앱 엔트리 포인트 올바름
- [ ] context 값 적절히 설정
- [ ] 새 스택 추가 시 bin 파일 업데이트

#### Git (CLAUDE.md 대비)
- [ ] 커밋 메시지 일본어 + 한국어 병기
- [ ] Co-Authored-By 포함
- [ ] 히스토리 기록 규칙 준수

## 에이전트 보고서 교차 검증

### Quality Reviewer (Ralph-Loop) 보고서 검증

| 확인 항목 | 방법 |
|-----------|------|
| 5회 Pass 모두 수행됨 | 보고서에 Pass 1~5 전부 존재하는지 확인 |
| 구체적 코드 레퍼런스 | 이슈에 파일:라인 참조가 있는지 확인 |
| 실제 코드와 일치 | 보고된 이슈를 실제 코드에서 확인 |
| 심각도 분류 적절 | CRITICAL/WARNING/INFO 기준표 대비 검증 |
| 판정 로직 일관 | CRITICAL 0건인데 FAIL 등 모순 없는지 확인 |
| 누락 이슈 | 보고서에 없지만 실제 존재하는 이슈 탐지 |

### Infra Verifier 보고서 검증

| 확인 항목 | 방법 |
|-----------|------|
| 5단계 모두 수행됨 | Stage 1~5 전부 존재하는지 확인 |
| cdk synth 실행됨 | 합성 결과가 실제로 포함되어 있는지 확인 |
| 보안 이슈 정확 | 보안 그룹/IAM 이슈를 실제 코드에서 재확인 |
| 비용 추정 합리적 | AWS 공식 요금 대비 추정치 검증 |
| 누락 검증 | 보고서에 없지만 필요한 검증 항목 탐지 |

## Red Flags (자동 CHANGES REQUESTED)

다음 7가지 중 하나라도 해당하면 **즉시 CHANGES REQUESTED**:

### 1. 하드코딩된 비밀
```
❌ const apiKey = "sk-abc123..."
❌ password: "mySecret"
✅ const apiKey = process.env.API_KEY
```

### 2. 보안 그룹 0.0.0.0/0 관리 포트
```
❌ SSH (22) → 0.0.0.0/0
❌ RDP (3389) → 0.0.0.0/0
✅ SSH (22) → 특정 IP/VPN CIDR
```

### 3. IAM Admin 정책
```
❌ actions: ["*"], resources: ["*"]
❌ ManagedPolicy.fromAwsManagedPolicyName("AdministratorAccess")
✅ actions: ["s3:GetObject"], resources: ["arn:aws:s3:::bucket/*"]
```

### 4. any 타입 남용
```
❌ 타당한 사유 없이 any 3회 이상 사용
✅ 불가피한 경우 1-2회 + 주석으로 사유 설명
```

### 5. 테스트 없는 중요 로직
```
❌ 인증/인가 로직 변경 → 테스트 미작성
❌ 결제/과금 로직 변경 → 테스트 미작성
✅ UI 텍스트 변경 → 테스트 불필요
```

### 6. SQL 인젝션 가능성
```
❌ prisma.$queryRaw`SELECT * FROM users WHERE id = ${userId}`  (미검증 입력)
❌ db.query(`SELECT * FROM users WHERE name = '${name}'`)
✅ prisma.user.findUnique({ where: { id: userId } })
```

### 7. 환경 변수 미분리
```
❌ const apiUrl = "https://api.example.com"
❌ const port = 3000
✅ const apiUrl = process.env.NEXT_PUBLIC_API_URL
✅ const port = parseInt(process.env.PORT || "3000")
```

## 판정 기준

### APPROVED 조건 (모두 충족)
- Quality Reviewer 판정: PASS 또는 PASS WITH WARNINGS
- Infra Verifier 판정: PASS 또는 PASS WITH WARNINGS (해당시)
- Red Flags: 0건
- 프로젝트 규칙: 중대 위반 없음
- 보고서 품질: 충분하고 정확

### CHANGES REQUESTED 조건 (하나라도 해당)
- Quality Reviewer 판정: FAIL
- Infra Verifier 판정: FAIL (해당시)
- Red Flags: 1건 이상
- 프로젝트 규칙: 중대 위반
- 보고서 품질: 불충분하거나 부정확 (재검증 지시)

## 리뷰 출력 형식

```markdown
## 최종 판정: **APPROVED** / **CHANGES REQUESTED**

### 판정 근거
[1-3문장으로 핵심 근거]

### 규칙 준수 상태
| 영역 | 상태 | 비고 |
|------|------|------|

### 에이전트 보고서 검증
| 보고서 | 검증 결과 | 비고 |
|--------|-----------|------|

### Red Flags
- [해당 사항 또는 "해당 없음"]

### 필요 조치 (CHANGES REQUESTED 시)
1. [파일:라인] 구체적 조치 내용
```
