// 公募・特集ページ
// 공모/특집 페이지
//
// 特集記事や公募求人のカード一覧
// 특집 기사나 공모 구인 카드 목록

'use client';

// ダミー特集データ / 더미 특집 데이터
const mockFeatures = [
  {
    id: 1,
    category: '特集',
    title: 'エンジニア年収1000万円超えを目指すキャリアパス',
    description: '高年収エンジニアになるために必要なスキルと経験とは？現役CTOが語るキャリア戦略',
    image: '💻',
    isNew: true,
  },
  {
    id: 2,
    category: '特集',
    title: 'リモートワーク完全ガイド2026',
    description: 'フルリモートで働ける企業特集。場所に縛られない新しい働き方を実現',
    image: '🏠',
    isNew: true,
  },
  {
    id: 3,
    category: '公募',
    title: 'AI・機械学習エンジニア特集',
    description: '今最も注目されているAI分野の求人を厳選。未経験からの転職方法も解説',
    image: '🤖',
    isNew: false,
  },
  {
    id: 4,
    category: '公募',
    title: 'スタートアップ企業特集',
    description: '急成長中のスタートアップ企業の求人を集めました。ストックオプション有りの案件も',
    image: '🚀',
    isNew: false,
  },
  {
    id: 5,
    category: '特集',
    title: '外資系IT企業への転職ガイド',
    description: 'Google、Amazon、Microsoftなど外資系IT企業への転職ノウハウを完全解説',
    image: '🌐',
    isNew: false,
  },
  {
    id: 6,
    category: '公募',
    title: 'フリーランスエンジニア案件特集',
    description: '月単価100万円以上の高単価案件を厳選。フリーランスとして独立を目指す方へ',
    image: '💼',
    isNew: false,
  },
  {
    id: 7,
    category: '特集',
    title: '転職面接完全攻略ガイド',
    description: '面接で聞かれる質問と模範回答例。内定率を上げる秘訣を伝授',
    image: '🎯',
    isNew: false,
  },
  {
    id: 8,
    category: '公募',
    title: 'DX推進人材特集',
    description: '企業のDXを推進するエンジニア・コンサルタント求人。今最も需要の高い人材像とは',
    image: '📊',
    isNew: false,
  },
  {
    id: 9,
    category: '特集',
    title: '副業・パラレルワーク特集',
    description: '本業を続けながら副業でスキルアップ。副業OKの企業と案件を紹介',
    image: '⚡',
    isNew: false,
  },
];

// タブ / 탭
const tabs = [
  { id: 'all', label: 'すべて' },
  { id: 'feature', label: '特集' },
  { id: 'open', label: '公募' },
];

import { useState } from 'react';

export default function FeaturesPage() {
  const [activeTab, setActiveTab] = useState('all');

  // フィルタリングされた特集 / 필터링된 특집
  const filteredFeatures = mockFeatures.filter((feature) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'feature') return feature.category === '特集';
    if (activeTab === 'open') return feature.category === '公募';
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* ヘッダー / 헤더 */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">公募・特集</h1>
        <p className="text-sm text-gray-500 mt-2">
          注目の求人特集や公募情報をお届けします
        </p>
      </div>

      {/* タブ / 탭 */}
      <div className="flex border-b border-gray-200 mb-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'text-red-600 border-b-2 border-red-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* カードグリッド / 카드 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFeatures.map((feature) => (
          <article
            key={feature.id}
            className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer group"
          >
            {/* 画像エリア / 이미지 영역 */}
            <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
              <span className="text-6xl group-hover:scale-110 transition-transform">
                {feature.image}
              </span>
            </div>

            {/* コンテンツ / 콘텐츠 */}
            <div className="p-5">
              {/* カテゴリとNEWバッジ / 카테고리와 NEW 배지 */}
              <div className="flex items-center space-x-2 mb-2">
                <span
                  className={`text-xs px-2 py-1 rounded ${
                    feature.category === '特集'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-green-100 text-green-700'
                  }`}
                >
                  {feature.category}
                </span>
                {feature.isNew && (
                  <span className="bg-red-600 text-white text-xs px-2 py-0.5 rounded">
                    NEW
                  </span>
                )}
              </div>

              {/* タイトル / 제목 */}
              <h2 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-red-600 transition-colors">
                {feature.title}
              </h2>

              {/* 説明 / 설명 */}
              <p className="text-sm text-gray-600 line-clamp-2">
                {feature.description}
              </p>

              {/* 詳細リンク / 상세 링크 */}
              <div className="mt-4">
                <span className="text-sm text-red-600 font-medium group-hover:underline">
                  詳しく見る →
                </span>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* もっと見るボタン / 더보기 버튼 */}
      <div className="flex justify-center mt-10">
        <button className="px-8 py-3 border-2 border-red-600 text-red-600 rounded-md font-medium hover:bg-red-50 transition-colors">
          もっと見る
        </button>
      </div>
    </div>
  );
}
