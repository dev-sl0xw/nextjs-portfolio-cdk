# Claude Code 프로젝트 지침

## 프로젝트 개요

Next.js 포트폴리오 사이트와 AWS CDK 인프라 프로젝트

## 권한 설정

**모든 작업이 끝날 때까지 모든 권한을 자동으로 허용합니다.**

- 설정 파일: `.claude/settings.local.json`
- 모드: `bypassPermissions` (모든 도구 사용 허용)
- 허용 범위: Bash, Read, Edit, Write, WebFetch, Skill, Task, MCP 도구 전체

> ⚠️ 이 설정은 개인 개발 환경용입니다. 프로덕션이나 민감한 환경에서는 사용하지 마세요.

## 기술 스택
- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Infrastructure**: AWS CDK (TypeScript)
- **CI/CD**: GitHub Actions
- **배포**: ECR → EC2 (Docker)

## 작업 이력 저장 규칙

**중요**: 모든 작업이 완료되면 반드시 `history/` 폴더에 작업 이력을 기록해야 합니다.

### 파일 형식
- 경로: `history/YYYY-MM-DD-TASK-HISTORY.md`
- 예시: `history/2026-01-27-TASK-HISTORY.md`

### 기록 내용
각 작업마다 다음 정보를 기록:
```markdown
## 작업 N: [작업 제목]
**시간**: [대략적인 시간]
**요청**: [사용자 요청 요약]

**변경 사항**:
- [변경된 파일 목록]
- [수행한 작업 설명]

**롤백 방법** (필요시):
- [이전 상태로 되돌리는 방법]
```

### 작업 이력 저장 시점
- 사용자가 "작업 이력 저장해줘"라고 요청할 때
- 중요한 설정 변경 후
- 여러 파일을 수정하는 작업 완료 후

## 코드 스타일

### TypeScript/JavaScript
- ESLint, Prettier 규칙 준수
- 함수형 컴포넌트 사용
- 타입 명시적 선언

### CDK
- 스택별 분리 (ecr-stack, ec2-stack, cloudfront-stack 등)
- 환경별 설정 분리 (dev/prod)

## 주요 파일 위치
- Frontend: `frontend/`
- Infrastructure: `infrastructure/`
- GitHub Actions: `.github/workflows/`
- 개인 노트: `pipeline-workflow.md`, `history/`

## Git 규칙
- 커밋 메시지: 한국어 + 일본어 병기
- Co-Authored-By 포함

## 학습 내용 저장 규칙 (Remind)

**트리거**: 사용자가 "이 내용을 저장해줘", "저장해줘", "기억해줘" 등의 요청을 할 때

### 파일 형식
- 경로: `remind/YYYY-MM-DD-{학습주제}.md`
- 예시: `remind/2026-01-27-prisma-migration.md`

### 파일 내용 템플릿
```markdown
# {학습 주제}

> 작성일: YYYY-MM-DD

## 개요
[1-2문장으로 핵심 요약]

## 상세 내용
[학습한 내용 상세 설명]

## 핵심 포인트
- [포인트 1]
- [포인트 2]
- [포인트 3]

## 관련 명령어/코드 (해당시)
\`\`\`
[관련 명령어나 코드 예시]
\`\`\`

## 참고 자료 (해당시)
- [관련 문서 링크나 참고 자료]
```

### 저장 규칙
1. 주제명은 영문 소문자, 하이픈(-) 구분자 사용
2. 대화 중 설명한 기술 개념이나 인사이트를 자동으로 정리
3. 기존 파일이 있으면 내용 추가, 새로운 주제면 새 파일 생성
