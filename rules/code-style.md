# 코드 스타일 가드레일 / コードスタイルガードレール

이 문서는 프로젝트의 코드 스타일 규칙을 정의합니다.
このドキュメントはプロジェクトのコードスタイルルールを定義します。

---

## TypeScript

### 필수 설정 / 必須設定
- strict mode 필수 (`tsconfig.json`에서 `"strict": true`)
- any 타입 사용 금지 (unknown 사용 권장)
- 함수 반환 타입 명시 필수

### 예시 / 例
```typescript
// ❌ 잘못된 예 / 悪い例
function getData(id: any) {
  return fetch(`/api/${id}`);
}

// ✅ 올바른 예 / 良い例
async function getData(id: string): Promise<Response> {
  return fetch(`/api/${id}`);
}
```

---

## 네이밍 컨벤션 / 命名規則

| 대상 / 対象 | 규칙 / ルール | 예시 / 例 |
|------------|-------------|----------|
| 컴포넌트 | PascalCase | `HeroSection.tsx`, `Header.tsx` |
| 함수/변수 | camelCase | `getUserData`, `isLoading` |
| 상수 | UPPER_SNAKE_CASE | `API_BASE_URL`, `MAX_RETRY_COUNT` |
| CDK Construct | PascalCase + Stack/Construct 접미사 | `VpcStack`, `Ec2Stack` |
| 인터페이스 | PascalCase + I 접두사 (선택) | `IUserData` 또는 `UserData` |
| 타입 | PascalCase | `UserRole`, `ApiResponse` |

---

## 파일 구조 / ファイル構造

### 컴포넌트 파일 / コンポーネントファイル
```
src/
├── components/
│   ├── Header.tsx          # 컴포넌트 파일
│   ├── Header.test.tsx     # 테스트 파일 (선택)
│   └── index.ts            # re-export용
├── hooks/
│   └── useAuth.ts          # 커스텀 훅
└── utils/
    └── formatDate.ts       # 유틸리티 함수
```

### CDK 스택 파일 / CDKスタックファイル
```
infrastructure/
├── bin/
│   └── app.ts              # 앱 진입점
└── lib/
    ├── vpc-stack.ts        # VPC 스택
    ├── ec2-stack.ts        # EC2 스택
    └── alb-stack.ts        # ALB 스택
```

---

## ESLint/Prettier

### 필수 규칙 / 必須ルール
- 프로젝트 루트의 `.eslintrc.js` 및 `.prettierrc` 설정 파일 준수
- 커밋 전 lint 통과 필수
- 자동 포맷팅: `npm run format` 또는 `npm run lint:fix`

### 권장 ESLint 규칙 / 推奨ESLintルール
```json
{
  "rules": {
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/explicit-function-return-type": "warn",
    "no-console": "warn",
    "no-unused-vars": "error"
  }
}
```

---

## 임포트 순서 / インポート順序

```typescript
// 1. 외부 라이브러리 / 外部ライブラリ
import React from 'react';
import { Stack } from 'aws-cdk-lib';

// 2. 내부 모듈 / 内部モジュール
import { VpcStack } from './vpc-stack';
import { Header } from '@/components/Header';

// 3. 타입 / タイプ
import type { StackProps } from 'aws-cdk-lib';

// 4. 스타일/에셋 / スタイル/アセット
import './styles.css';
```

---

## 주석 작성 / コメント記述

함수 및 복잡한 로직에는 이중 언어 주석 작성 (bilingual-comments.md 참조)
関数および複雑なロジックには二言語コメントを記述（bilingual-comments.md参照）

```typescript
// 사용자 인증을 처리하는 함수
// ユーザー認証を処理する関数
async function handleAuth(): Promise<void> {
  // ...
}
```
