// メッセージページ
// 메시지 페이지
//
// 企業・ヘッドハンターからのメッセージ一覧と詳細
// 기업/헤드헌터로부터의 메시지 목록과 상세

'use client';

import { useState } from 'react';

// メッセージタブ / 메시지 탭
const tabs = [
  { id: 'all', label: 'すべて' },
  { id: 'company', label: '企業' },
  { id: 'headhunter', label: 'ヘッドハンター' },
];

// ダミーメッセージデータ / 더미 메시지 데이터
const mockMessages = [
  {
    id: 1,
    type: 'company',
    sender: '株式会社サンプルテック / 採用担当',
    title: '【スカウト】Webエンジニア募集！最新技術スタックでの開発◆リモート勤務可能...',
    preview: '求人あり',
    time: '17:13',
    isNew: true,
    hasFlag: false,
  },
  {
    id: 2,
    type: 'company',
    sender: '株式会社テックイノベーション / 人事部',
    title: '【インフラエンジニア】AWS環境構築・運用／月平均残業時間15時間...',
    preview: '求人公開求人・非公開求人あり フラグ付き',
    time: '16:22',
    isNew: true,
    hasFlag: true,
  },
  {
    id: 3,
    type: 'company',
    sender: '株式会社デジタルソリューションズ / 採用担当',
    title: '大規模分散システムの開発エンジニア募集！マイクロサービスアーキテクチャ...',
    preview: '求人あり フラグ付き',
    time: '13:54',
    isNew: false,
    hasFlag: true,
  },
  {
    id: 4,
    type: 'company',
    sender: '株式会社クラウドワークス / 採用事務局',
    title: '【再送/ご面談のご依頼】あなたのご経験を活かせるポジションをご用意しています...',
    preview: '求人あり',
    time: '10:52',
    isNew: false,
    hasFlag: false,
  },
  {
    id: 5,
    type: 'headhunter',
    sender: 'キャリアエージェント / 田中コンサルタント',
    title: '【CTO候補】クラウド事業の成長を牽引する、リーダー候補としてご活躍いただけ...',
    preview: '求人あり',
    time: '01:26',
    isNew: false,
    hasFlag: false,
  },
  {
    id: 6,
    type: 'company',
    sender: '株式会社テックラボ / キャリア採用担当',
    title: '上流工程から参画可能▶︎インフラエンジニア・クラウドスペシャリスト募集...',
    preview: '求人あり',
    time: '01/23',
    isNew: false,
    hasFlag: false,
  },
  {
    id: 7,
    type: 'company',
    sender: '株式会社AIスタートアップ / 代表取締役',
    title: '【2024年設立｜開発エンジニア】AI×SaaS領域でのプロダクト開発メンバー募集...',
    preview: '求人あり',
    time: '01/23',
    isNew: false,
    hasFlag: false,
  },
  {
    id: 8,
    type: 'headhunter',
    sender: 'プレミアムエージェント / 佐藤',
    title: 'システム開発の経験を活かせる大手企業案件のご紹介です...',
    preview: '求人あり',
    time: '01/23',
    isNew: false,
    hasFlag: false,
  },
];

export default function MessagesPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [selectedMessage, setSelectedMessage] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // フィルタリングされたメッセージ / 필터링된 메시지
  const filteredMessages = mockMessages.filter((msg) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'company') return msg.type === 'company';
    if (activeTab === 'headhunter') return msg.type === 'headhunter';
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex h-[calc(100vh-200px)] bg-white rounded-lg shadow-sm overflow-hidden">
        {/* 左側メッセージリスト / 좌측 메시지 목록 */}
        <div className="w-96 border-r border-gray-200 flex flex-col">
          {/* 検索バー / 검색 바 */}
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <input
                type="text"
                placeholder="キーワードを入力"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                🔍
              </span>
            </div>
          </div>

          {/* 絞り込みリンク / 필터 링크 */}
          <div className="px-4 py-2 border-b border-gray-200">
            <button className="text-sm text-gray-500 hover:text-gray-700">
              絞り込み ▼
            </button>
          </div>

          {/* タブ / 탭 */}
          <div className="flex border-b border-gray-200">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-3 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-red-600 border-b-2 border-red-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* メッセージリスト / 메시지 목록 */}
          <div className="flex-1 overflow-y-auto">
            {filteredMessages.map((message) => (
              <button
                key={message.id}
                onClick={() => setSelectedMessage(message.id)}
                className={`w-full text-left p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                  selectedMessage === message.id ? 'bg-red-50' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    {/* 送信者 / 발신자 */}
                    <div className="flex items-center">
                      {message.isNew && (
                        <span className="w-2 h-2 bg-red-600 rounded-full mr-2 flex-shrink-0"></span>
                      )}
                      <span className="text-sm font-medium text-gray-900 truncate">
                        {message.sender}
                      </span>
                    </div>

                    {/* タイトル / 제목 */}
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {message.title}
                    </p>

                    {/* プレビュー / 미리보기 */}
                    <div className="flex items-center mt-2 space-x-2">
                      <span className="text-xs text-gray-500">{message.preview}</span>
                      {message.hasFlag && (
                        <span className="text-xs bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded">
                          フラグ付き
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 時間 / 시간 */}
                  <span className="text-xs text-gray-400 ml-4 flex-shrink-0">
                    {message.time}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 右側メッセージ詳細 / 우측 메시지 상세 */}
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          {selectedMessage ? (
            <div className="p-8 text-center">
              <div className="text-6xl mb-4">📧</div>
              <h3 className="text-lg font-medium text-gray-900">
                メッセージID: {selectedMessage}
              </h3>
              <p className="text-sm text-gray-500 mt-2">
                メッセージ詳細表示機能は今後実装予定です
              </p>
            </div>
          ) : (
            <div className="text-center">
              <div className="text-6xl mb-4 opacity-50">💬</div>
              <p className="text-gray-500">メッセージを選択してください</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
