---
name: web-development
description: Next.js App Router, React, Prisma, Cognito 인증 등 웹 개발 패턴과 프로젝트 아키텍처 가이드
---

# Web Development Patterns

이 스킬은 Next.js + React + Prisma 기반 웹 개발의 프로젝트 고유 패턴을 정의합니다.

## Next.js App Router 패턴

### 라우트 구조
```
frontend/src/app/
  ├── (auth)/              # 인증 관련 라우트 그룹
  │   ├── login/page.tsx
  │   ├── signup/page.tsx
  │   └── verify/page.tsx
  ├── (main)/              # 로그인 후 메인 라우트 그룹
  │   ├── layout.tsx
  │   ├── mypage/page.tsx
  │   ├── jobs/page.tsx
  │   ├── messages/page.tsx
  │   ├── resume/page.tsx
  │   └── features/page.tsx
  ├── api/                 # API 라우트
  │   ├── profile/me/route.ts
  │   └── upload/presigned-url/route.ts
  ├── layout.tsx           # 루트 레이아웃
  └── page.tsx             # 메인 페이지
```

### 서버 컴포넌트 (기본)
```typescript
// 서버 컴포넌트 - async 가능, 직접 DB 접근 가능
export default async function Page() {
  const data = await prisma.user.findMany();
  return <UserList users={data} />;
}
```

### 클라이언트 컴포넌트
```typescript
'use client';
// 클라이언트 컴포넌트 - useState, useEffect, 이벤트 핸들러 사용 시
import { useState } from 'react';

export default function InteractiveComponent() {
  const [state, setState] = useState(false);
  return <button onClick={() => setState(!state)}>Toggle</button>;
}
```

### 규칙
- 기본은 서버 컴포넌트, 인터랙션이 필요할 때만 `'use client'`
- 서버 컴포넌트에서 데이터 페칭 → 클라이언트 컴포넌트에 props로 전달
- `useEffect`로 데이터 페칭하지 않기 (서버 사이드 우선)
- 인증 보호 라우트는 `frontend/src/app/(main)/layout.tsx`에서 처리
- 클라이언트 인증 상태는 `frontend/src/contexts/AuthContext.tsx`의 `useAuth()` 기준으로 사용

## API 라우트 패턴

### 기본 구조
```typescript
// frontend/src/app/api/profile/me/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthenticatedUser, isAuthError } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const authResult = await getAuthenticatedUser(request);
  if (isAuthError(authResult)) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status }
    );
  }

  try {
    const user = await prisma.user.findUnique({
      where: { cognitoSub: authResult.sub },
    });

    return NextResponse.json({ user });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
```

### 인증 미들웨어 패턴
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser, isAuthError } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const authResult = await getAuthenticatedUser(request);
  if (isAuthError(authResult)) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status }
    );
  }

  return NextResponse.json({ sub: authResult.sub });
}
```

## Prisma 패턴

### 클라이언트 싱글톤
```typescript
// frontend/src/lib/prisma.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

### 스키마 규칙
- 모델명: PascalCase 단수형 (User, Job, Company)
- 필드명: camelCase
- 관계: `@relation` 명시, cascade 설정
- 인덱스: 쿼리 패턴에 맞게 설정
- `createdAt`, `updatedAt` 필수 포함

## Cognito 인증 플로우

### 클라이언트 사이드
```typescript
'use client';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { signIn } = useAuth();

  const handleLogin = async () => {
    await signIn({ email: 'user@example.com', password: 'password' });
    router.push('/mypage');
  };

  return <button onClick={handleLogin}>로그인</button>;
}
```

### API Route 사이드
```typescript
import { getAuthenticatedUser, isAuthError } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

export async function PUT(request: NextRequest) {
  const authResult = await getAuthenticatedUser(request);
  if (isAuthError(authResult)) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status }
    );
  }

  return NextResponse.json({ sub: authResult.sub });
}
```

## Tailwind CSS 패턴

### 프로젝트 컬러 시스템
- 기존 `tailwind.config.ts`의 커스텀 색상 사용
- 새 색상 추가 시 반드시 config에 정의

### 반응형 디자인
```tsx
// 모바일 퍼스트 접근
<div className="
  px-4 py-6          // 모바일 기본
  md:px-8 md:py-12   // 태블릿
  lg:px-16 lg:py-24  // 데스크톱
">
```

### 다크 모드
```tsx
<div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
```

## 컴포넌트 아키텍처

### 디렉토리 구조
```
frontend/src/components/
  ├── ui/           # 재사용 가능한 UI 프리미티브 (Button, Input, Card)
  ├── forms/        # 폼 관련 컴포넌트
  ├── layout/       # 레이아웃 컴포넌트 (Header, Footer, Sidebar)
  └── features/     # 기능별 컴포넌트 (JobList, CompanyCard)
```

### 컴포넌트 작성 규칙
1. Props 인터페이스 명시적 정의
2. 단일 책임 원칙
3. 서버/클라이언트 분리 최적화
4. 접근성 (ARIA 속성, 시맨틱 HTML)

## 자체 검증 명령 (변경 영역별 필수 실행)

"완료" 보고 전 반드시 아래 명령을 실행하고, 보고서에 **exit code와 첫 오류 라인**을 기재한다. 명령을 실행하지 않고 "TypeScript: ✅"와 같이 선언적 보고를 하지 말 것.

### Frontend 변경 (`frontend/` 이하)

```bash
cd frontend && npm run lint
cd frontend && npm run type-check 2>&1 | head -50
cd frontend && npm run build 2>&1 | tail -30
```

### Infrastructure 변경 (`infrastructure/` 이하)

```bash
cd infrastructure && npx cdk synth 2>&1 | tee /tmp/cdk-synth.log
cd infrastructure && npx cdk diff 2>&1 | head -100   # 배포 전 변경 확인
```

### Prisma 스키마 변경 (`frontend/prisma/schema.prisma`)

```bash
cd frontend && npx prisma validate
cd frontend && npx prisma format
# 마이그레이션 필요 시:
cd frontend && npx prisma migrate dev --name <name>
```

### 보고서 포맷

```markdown
### 자체 검증 결과

| 명령 | exit | 비고 |
|------|------|------|
| `npm run lint` | 0 | 경고 없음 |
| `npm run type-check` | 0 | |
| `npm run build` | 0 | Compiled successfully |
| `npx cdk synth` | 0 | CloudFormation template generated |
```

실패 시 첫 오류 라인도 인용.

## CI/CD 실패 대응 루틴

GitHub Actions 실행이 실패했을 때:

1. **로그 수집**
   ```bash
   gh run list --limit 5
   gh run view <run-id> --log-failed 2>&1 | tail -100
   ```
2. **에러 분류**
   | 분류 | 징후 | 대응 |
   |------|------|------|
   | 빌드 실패 | `ERR!`, `build failed` | 로컬에서 `npm run build` 재현 |
   | 타입 오류 | `TS2xxx`, `Type error` | `npm run type-check` 로 재현 |
   | 테스트 실패 | `FAIL`, `Tests: N failed` | 실패 테스트 단독 실행 |
   | 배포 실패 | `cdk deploy`, `CloudFormation` | IAM/권한/리소스 한도 확인 |
3. **디버깅**: `superpowers:systematic-debugging` 스킬을 호출하여 근본 원인 파악
4. **재실행 금지**: 수정 없이 `gh run rerun`을 자동 실행하지 말 것. 수정 후에도 **사용자 확인**을 받은 뒤에만 `gh run rerun` (파괴적 액션 방지 원칙).
5. **작업 이력**: 원인과 수정 내용을 `history/YYYY-MM-DD-TASK-HISTORY.md`에 기록하도록 orchestrator에 전달.
