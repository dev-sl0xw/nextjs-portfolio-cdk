// 認証済みユーザー用ヘッダー
// 인증된 사용자용 헤더
//
// ログイン後のメインナビゲーションヘッダー
// 로그인 후 메인 네비게이션 헤더

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

// ナビゲーションタブ定義 / 네비게이션 탭 정의
const navTabs = [
  { href: '/mypage', label: 'マイページ', icon: 'home' },
  { href: '/resume', label: '職務経歴書', icon: 'document' },
  { href: '/messages', label: 'メッセージ', icon: 'message' },
  { href: '/jobs', label: '求人検索', icon: 'search' },
  { href: '/features', label: '公募・特集', icon: 'feature' },
];

// アイコンコンポーネント / 아이콘 컴포넌트
function NavIcon({ type, isActive }: { type: string; isActive: boolean }) {
  const color = isActive ? '#C41E3A' : '#666666';

  switch (type) {
    case 'home':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9,22 9,12 15,12 15,22" />
        </svg>
      );
    case 'document':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14,2 14,8 20,8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
        </svg>
      );
    case 'message':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      );
    case 'search':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      );
    case 'feature':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
        </svg>
      );
    default:
      return null;
  }
}

export default function AuthenticatedHeader() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  // ユーザー名表示 / 사용자명 표시
  const displayName = user?.email?.split('@')[0]?.toUpperCase() || 'ゲスト';

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      {/* 上部バー / 상단 바 */}
      <div className="border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14">
            {/* ロゴ / 로고 */}
            <Link href="/mypage" className="flex items-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo.png"
                alt="BizReach"
                width={200}
                height={26}
                className="align-middle"
              />
            </Link>

            {/* 右側メニュー / 우측 메뉴 */}
            <div className="flex items-center space-x-6">
              {/* お知らせ / 알림 */}
              <button className="flex items-center text-sm text-gray-600 hover:text-gray-900">
                <span className="relative mr-1.5">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                  </svg>
                  <span className="absolute -top-2 -right-2 bg-[#C41E3A] text-white text-[10px] font-medium px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                    86
                  </span>
                </span>
                お知らせ
              </button>

              {/* よくある質問 / 자주 묻는 질문 */}
              <button className="flex items-center text-sm text-gray-600 hover:text-gray-900">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mr-1.5">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
                よくある質問
              </button>

              {/* 気になる / 관심 */}
              <button className="flex items-center text-sm text-gray-600 hover:text-gray-900">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mr-1.5">
                  <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
                </svg>
                気になる
              </button>

              {/* ユーザー名 / 사용자명 */}
              <div className="flex items-center text-sm text-gray-900">
                <span className="font-medium">{displayName}</span>
                <span className="ml-1">様</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="ml-1">
                  <polyline points="6,9 12,15 18,9" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* メインナビゲーション / 메인 네비게이션 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex items-center justify-between h-12">
          <div className="flex items-center space-x-0">
            {navTabs.map((tab) => {
              const isActive = pathname === tab.href || pathname.startsWith(tab.href + '/');
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={`
                    relative flex items-center px-8 py-3 text-sm font-medium transition-colors
                    ${isActive
                      ? 'text-[#C41E3A]'
                      : 'text-gray-600 hover:text-gray-900'
                    }
                  `}
                >
                  <span className="mr-2">
                    <NavIcon type={tab.icon} isActive={isActive} />
                  </span>
                  {tab.label}
                  {/* アクティブインジケーター / 활성화 표시 */}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#C41E3A]" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* ログアウト / 로그아웃 */}
          <button
            onClick={signOut}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            ログアウト
          </button>
        </nav>
      </div>
    </header>
  );
}
