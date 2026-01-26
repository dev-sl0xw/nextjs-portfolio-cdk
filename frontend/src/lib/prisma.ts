// Prisma 클라이언트 인스턴스
// Prismaクライアントインスタンス
//
// Next.js에서 Prisma Client를 사용할 때 Hot Reload 시
// 여러 인스턴스가 생성되는 것을 방지
//
// Next.jsでPrisma Clientを使用する際、Hot Reload時に
// 複数インスタンスが生成されるのを防止

import { PrismaClient } from '@prisma/client';

// globalThis에 prisma 인스턴스 타입 정의
// globalThisにprismaインスタンスタイプ定義
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// 개발 환경에서는 global에 캐시, 프로덕션에서는 새 인스턴스 생성
// 開発環境ではglobalにキャッシュ、本番では新インスタンス生成
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
  });

// 개발 환경에서만 global에 캐시
// 開発環境でのみglobalにキャッシュ
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
