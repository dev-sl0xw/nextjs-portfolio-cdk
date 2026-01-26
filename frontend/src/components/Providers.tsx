// 앱 전역 Providers
// アプリグローバルProviders
//
// AuthProvider 등 전역 상태 관리 Provider를 감싸는 컴포넌트
// AuthProviderなどグローバル状態管理Providerをラップするコンポーネント

'use client';

import { ReactNode } from 'react';
import { AuthProvider } from '@/contexts/AuthContext';

interface ProvidersProps {
  children: ReactNode;
}

export const Providers: React.FC<ProvidersProps> = ({ children }) => {
  return <AuthProvider>{children}</AuthProvider>;
};

export default Providers;
