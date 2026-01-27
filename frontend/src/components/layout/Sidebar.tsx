// 職務経歴書サイドバー
// 직무경력서 사이드바
//
// 職務経歴書ページ用のナビゲーションサイドバー
// 직무경력서 페이지용 네비게이션 사이드바

'use client';

// サイドバーメニュー項目 / 사이드바 메뉴 항목
const menuItems = [
  { id: 'basic', label: '基本情報' },
  { id: 'preferences', label: '希望条件' },
  { id: 'summary', label: '職務要約・スキル' },
  { id: 'experience', label: '職務経歴' },
  { id: 'education', label: '学歴' },
  { id: 'awards', label: '表彰' },
  { id: 'languages', label: '語学力・海外経験' },
  { id: 'certifications', label: '資格' },
  { id: 'notes', label: '特記事項' },
  { id: 'freeform', label: 'フリーフォーマット' },
];

interface SidebarProps {
  activeSection?: string;
  onSectionChange?: (section: string) => void;
}

export default function Sidebar({ activeSection = 'basic', onSectionChange }: SidebarProps) {
  const handleClick = (sectionId: string) => {
    if (onSectionChange) {
      onSectionChange(sectionId);
    }
  };

  return (
    <aside className="w-48 flex-shrink-0">
      <nav className="sticky top-24">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <li key={item.id}>
                <button
                  onClick={() => handleClick(item.id)}
                  className={`
                    w-full text-left px-4 py-2 text-sm rounded-md transition-colors
                    ${isActive
                      ? 'bg-red-50 text-red-600 font-medium border-l-4 border-red-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }
                  `}
                >
                  {item.label}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}

// エクスポート用メニュー項目 / 내보내기용 메뉴 항목
export { menuItems };
