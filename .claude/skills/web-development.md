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
  │   └── layout.tsx
  ├── (dashboard)/         # 대시보드 라우트 그룹
  │   ├── profile/page.tsx
  │   └── layout.tsx
  ├── api/                 # API 라우트
  │   └── auth/
  │       └── [...nextauth]/route.ts
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

## API 라우트 패턴

### 기본 구조
```typescript
// frontend/src/app/api/[resource]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const data = await prisma.resource.findMany();
    return NextResponse.json(data);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // 입력 검증
    const result = await prisma.resource.create({ data: body });
    return NextResponse.json(result, { status: 201 });
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
import { getServerSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  // 인증된 요청 처리
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
import { signIn, signOut, useSession } from 'next-auth/react';

// 로그인
await signIn('cognito', { callbackUrl: '/dashboard' });

// 로그아웃
await signOut({ callbackUrl: '/' });

// 세션 확인
const { data: session, status } = useSession();
```

### 서버 사이드
```typescript
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const session = await getServerSession(authOptions);
if (!session) redirect('/login');
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
