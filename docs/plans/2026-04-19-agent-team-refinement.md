# 에이전트 팀 개선 계획 (에이전트 수 유지 + 세부 튜닝)

> **작성일**: 2026-04-19
> **대상**: `.claude/agents/*.md`, `.claude/skills/*.md`

---

## Context (왜 이 변경이 필요한가)

현재 팀은 5개 에이전트(orchestrator / app-web-developer / infra-verifier / quality-reviewer / reviewer)와 5개 스킬로 구성되어 있다. 역할 분담과 방법론(Ralph-Loop 5회, 인프라 5단계 검증)은 잘 자리 잡혀 있으나, 실제 운용 중 아래 9가지 마찰 지점이 있다.

1. 재검증 루프(CHANGES REQUESTED → 수정 → 재검증) 최대 반복 횟수가 명시되지 않아 무한 루프 가능
2. 독립 태스크(UI 수정 + CDK 스택 수정 등)도 순차 실행
3. 프로젝트에 이미 설치된 Superpowers 스킬(systematic-debugging, TDD, verification-before-completion)이 워크플로우에 연결되지 않음
4. 앱 코드 보안(OWASP)과 인프라 보안(SG/IAM)의 경계가 겹침 → 누락 또는 중복 검증 리스크
5. `orchestrator`의 `Task` 툴과 `TaskCreate/Update/List/Get` 툴이 혼재 — 역할이 섞여 있어 프롬프트 의도 모호
6. GitHub Actions 실패 시 누가 대응할지 미정의
7. `app-web-developer` 자체 검증이 선언적(`TypeScript: ✅`)이어서 실제 명령 실행 증거 부재
8. 히스토리/remind 저장이 "지시"만 되어 있고 실제 쓰는 주체 불명
9. `orchestrator`, `reviewer` 모두 Opus — 단순 태스크에서도 Opus가 돌아가 비용·속도 손해

본 계획은 **에이전트 수와 이름은 그대로 유지**하면서, 위 9개 지점을 에이전트 정의 파일과 스킬 파일 수정만으로 해결한다. 새 에이전트/스킬 추가 없음.

---

## 변경 대상 파일

| 파일 | 변경 유형 |
|------|-----------|
| `.claude/agents/orchestrator.md` | 대폭 개정 (병렬·루프 한도·기록 주체·툴 정리) |
| `.claude/agents/app-web-developer.md` | 자체 검증 명령 추가, Superpowers 호출 명시 |
| `.claude/agents/infra-verifier.md` | 보안 경계 명확화 (인프라 레이어만), 합성 명령 고정 |
| `.claude/agents/quality-reviewer.md` | 보안 경계 명확화 (앱 레이어만), Superpowers 연계 |
| `.claude/agents/reviewer.md` | 루프 한도·에스컬레이션 규정, fast-review 옵션 |
| `.claude/skills/quality-review.md` | Pass 2 범위 조정 (앱 OWASP만) |
| `.claude/skills/infra-verification.md` | Stage 2 범위 조정 (인프라 전담) |
| `.claude/skills/web-development.md` | 검증 명령·CI 대응 루틴 추가 |
| `.claude/skills/code-review.md` | 루프 한도·에스컬레이션 문구 추가 |

---

## 개선 항목별 설계

### A. 재검증 루프 최대 반복 횟수

**규정**: CHANGES REQUESTED → 수정 → 재검증은 **최대 3회**. 3회째 FAIL 시 자동 **HUMAN_ESCALATION** 판정.

`orchestrator.md`, `reviewer.md`, `code-review.md` 세 곳에 이터레이션 테이블과 판정 기준 문구 추가.

### B. 병렬 실행 가이드 (orchestrator.md)

독립 태스크는 단일 메시지 내 다중 Task 호출로 병렬 디스패치. 의존성 그래프는 `addBlockedBy`로 명시.

### C. Superpowers 스킬 연결

| 상황 | 호출 스킬 | 호출 주체 |
|------|-----------|-----------|
| 버그/테스트 실패/예기치 않은 동작 | `superpowers:systematic-debugging` | app-web-developer |
| 기능·버그픽스 구현 시작 전 | `superpowers:test-driven-development` | app-web-developer |
| "완료"라고 보고하기 직전 | `superpowers:verification-before-completion` | 전 에이전트 |
| 2개 이상 독립 태스크 | `superpowers:dispatching-parallel-agents` | orchestrator |
| 코드 리뷰 피드백 수용 시 | `superpowers:receiving-code-review` | app-web-developer |

### D. 보안 책임 경계 재정의

| 레이어 | 담당 | 범위 |
|--------|------|------|
| 앱 코드 | quality-reviewer Pass 2 | SQL/NoSQL 인젝션, XSS, 인증·세션, CORS/CSRF, 입력 sanitization, 의존성 취약점 |
| 인프라 | infra-verifier Stage 2 | SG, IAM, KMS/암호화, Secrets Manager/SSM, VPC/서브넷 격리 |
| 교차 | reviewer Red Flag | `.env` 커밋, 하드코딩 URL/포트, 양 레이어 불일치 |

### E. orchestrator 툴 역할 표 명시

`Task`, `TaskCreate/Update/List/Get`, `SendMessage`, `TeamCreate/Delete`, `Read/Glob/Grep/Bash` 용도별 사용 시점 표 추가.

### F. CI/CD 실패 대응 루틴

`gh run list` → `gh run view --log-failed` → 에러 분류 → `systematic-debugging` → 수정 → 사용자 확인 후 `gh run rerun` (파괴적 액션 방지).

### G. app-web-developer 자체 검증 강화

선언적 체크리스트 → **명령 실행 증거**(exit code, 첫 오류 라인) 기반으로 전환. `npm run lint/type-check/build`, `npx cdk synth`, `npx prisma validate` 명령 표준화.

### H. 히스토리·remind 저장 주체 명시

`history/YYYY-MM-DD-TASK-HISTORY.md`는 **orchestrator가 직접 Write**. app-web-developer는 구조화된 요약만 전달. `remind/`는 사용자 트리거 시에만.

### I. 모델 할당 재검토

- `orchestrator` Opus 유지
- `reviewer`: 기본 Opus, 변경 파일 5개 이하·문서/설정 수정 한정 "fast-review" 모드에서 Sonnet 강등 가능 옵션

---

## 재사용할 기존 요소

- Ralph-Loop 5회 구조 — 유지
- 인프라 5 Stage 구조 — 유지
- Red Flag 7종 — 유지
- `superpowers` 플러그인 — 이미 enabled

---

## 검증 (End-to-End)

1. **병렬 드라이런**: frontend 페이지 수정 + CDK 태그 추가 → 병렬 디스패치 확인
2. **루프 한도**: 의도적 CRITICAL → reviewer 3회 후 HUMAN_ESCALATION
3. **자체 검증 증거**: app-web-developer 보고서에 `npm run build` exit code 포함 확인
4. **보안 경계**: SG 변경 PR에서 quality-reviewer Pass 2에 SG 언급 없음, infra-verifier Stage 2에만 있음
5. **히스토리**: `history/YYYY-MM-DD-TASK-HISTORY.md` orchestrator가 생성
6. **Superpowers 호출**: app-web-developer 로그에 `Skill(superpowers:verification-before-completion)` 흔적

---

## 비적용 (YAGNI)

- 신규 에이전트 추가 (test-engineer, debugger 등) — 다음 사이클 보류
- 신규 스킬 생성 — 기존 Superpowers 재활용
- 모델 자동 강등 — 수동 옵션만 문서화
