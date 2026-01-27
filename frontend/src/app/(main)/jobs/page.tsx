// 求人検索ページ
// 구인검색 페이지
//
// フィルタリングと求人一覧表示
// 필터링과 구인 목록 표시

'use client';

import { useState } from 'react';

// フィルタカテゴリ / 필터 카테고리
const filterCategories = {
  occupation: {
    label: '職種',
    options: ['インフラエンジニア', 'SE（Web・オープン系）', 'プロジェクトマネージャー（Web・オープン系）'],
  },
  industry: {
    label: '業種',
    options: ['SIer', 'ソフトウェア'],
  },
  location: {
    label: '勤務地',
    options: ['東京都', '大阪府', '福岡県', '北海道', '愛知県'],
  },
  salary: {
    label: '年収',
    options: ['年収を選択してください'],
  },
  type: {
    label: '求人タイプ',
    options: ['すべて', '採用企業案件', 'ヘッドハンター案件'],
  },
};

// ダミー求人データ / 더미 구인 데이터
const mockJobs = [
  {
    id: 1,
    title: 'シニアSREエンジニア',
    salary: '800万円〜1,000万円',
    tags: ['SE（Web・オープン系）', 'インフラエンジニア', '情報システム・社内SE'],
    industries: ['インターネットサービス', 'ソフトウェア'],
    location: '東京都',
    company: '株式会社サンプルテック',
    isBookmarked: false,
  },
  {
    id: 2,
    title: 'クラウドインフラエンジニア',
    salary: '700万円〜1,000万円',
    tags: ['インフラエンジニア', 'サーバーエンジニア（構築・運用）'],
    industries: ['インターネットサービス', 'ソフトウェア'],
    location: '東京都',
    company: '株式会社クラウドワークス',
    isBookmarked: true,
  },
  {
    id: 3,
    title: 'DevOpsエンジニア',
    salary: '700万円〜1,000万円',
    tags: ['インフラエンジニア', 'サーバーエンジニア（構築・運用）', 'プロジェクトリーダー（Web・オープン系）'],
    industries: ['インターネットサービス', 'ソフトウェア'],
    location: '東京都',
    company: '株式会社テックイノベーション',
    isBookmarked: false,
  },
  {
    id: 4,
    title: 'AIプラットフォームエンジニア',
    salary: '800万円〜1,000万円',
    tags: ['機械学習エンジニア', 'バックエンドエンジニア'],
    industries: ['AI・人工知能', 'ソフトウェア'],
    location: '東京都',
    company: '株式会社AIスタートアップ',
    isBookmarked: false,
  },
];

export default function JobsPage() {
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({
    occupation: ['インフラエンジニア', 'SE（Web・オープン系）', 'プロジェクトマネージャー（Web・オープン系）'],
    industry: ['SIer', 'ソフトウェア'],
    location: ['東京都', '大阪府', '福岡県', '北海道', '愛知県'],
    salary: [],
    type: ['すべて'],
  });

  const removeFilter = (category: string, value: string) => {
    setSelectedFilters((prev) => ({
      ...prev,
      [category]: prev[category].filter((v) => v !== value),
    }));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* ヘッダー / 헤더 */}
      <div className="mb-6">
        <p className="text-sm text-gray-500 mb-2">
          現、あなたの<span className="text-red-600">希望条件</span>をもとに求人が絞られています
        </p>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">
            <span className="text-red-600">16,357</span> 件
            <span className="text-sm font-normal text-gray-500 ml-2">（ページを100ページ）</span>
          </h1>
          <div className="flex items-center space-x-4">
            <button className="text-sm text-blue-600 hover:underline">
              ↻ 更新順
            </button>
            <button className="px-4 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700">
              検索条件を保存する
            </button>
          </div>
        </div>
      </div>

      <div className="flex gap-8">
        {/* 左側フィルターサイドバー / 좌측 필터 사이드바 */}
        <aside className="w-64 flex-shrink-0">
          <div className="bg-white rounded-lg shadow-sm p-4 sticky top-24">
            <h2 className="text-lg font-bold text-gray-900 mb-4">求人を絞り込む</h2>

            {/* キーワード検索 / 키워드 검색 */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">キーワード</label>
              <input
                type="text"
                placeholder="キーワード"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            {/* フィルタカテゴリ / 필터 카테고리 */}
            {Object.entries(filterCategories).map(([key, { label, options }]) => (
              <div key={key} className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>

                {/* 選択されたフィルタ / 선택된 필터 */}
                {selectedFilters[key]?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {selectedFilters[key].map((value) => (
                      <span
                        key={value}
                        className="inline-flex items-center px-2 py-1 bg-gray-100 text-xs text-gray-700 rounded"
                      >
                        {value}
                        <button
                          onClick={() => removeFilter(key, value)}
                          className="ml-1 text-gray-400 hover:text-gray-600"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                <button className="text-sm text-red-600 hover:underline">
                  + {label}を選択する
                </button>
              </div>
            ))}
          </div>
        </aside>

        {/* 右側求人リスト / 우측 구인 목록 */}
        <div className="flex-1">
          <div className="space-y-4">
            {mockJobs.map((job) => (
              <div
                key={job.id}
                className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* タイトルと年収 / 제목과 연봉 */}
                    <h3 className="text-lg font-bold text-gray-900">{job.title}</h3>
                    <p className="text-red-600 font-medium mt-1">{job.salary}</p>

                    {/* タグ / 태그 */}
                    {job.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {job.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* 業種 / 업종 */}
                    {job.industries.length > 0 && (
                      <div className="flex items-center mt-2 text-sm text-gray-500">
                        <span className="mr-2">📁</span>
                        {job.industries.join(' / ')}
                      </div>
                    )}

                    {/* 勤務地 / 근무지 */}
                    <div className="flex items-center mt-1 text-sm text-gray-500">
                      <span className="mr-2">📍</span>
                      {job.location}
                    </div>

                    {/* 会社名 / 회사명 */}
                    {job.company && (
                      <div className="flex items-center mt-3">
                        <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center text-gray-400 mr-3">
                          🏢
                        </div>
                        <span className="text-sm text-gray-700">{job.company}</span>
                      </div>
                    )}
                  </div>

                  {/* 気になるボタン / 관심 버튼 */}
                  <button
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      job.isBookmarked
                        ? 'bg-red-100 text-red-600'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {job.isBookmarked ? '☆ 気になる' : '☆ 気になる'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* ページネーション / 페이지네이션 */}
          <div className="flex justify-center mt-8">
            <nav className="flex items-center space-x-2">
              <button className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700">
                ← 前へ
              </button>
              <button className="px-3 py-2 text-sm bg-red-600 text-white rounded">1</button>
              <button className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700">2</button>
              <button className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700">3</button>
              <span className="px-3 py-2 text-sm text-gray-500">...</span>
              <button className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700">100</button>
              <button className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700">
                次へ →
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
}
