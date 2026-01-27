// マイページ（ダッシュボード）
// 마이페이지 (대시보드)
//
// ログイン後のメインダッシュボード
// 로그인 후 메인 대시보드

'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

// ダミーデータ / 더미 데이터
const mockMessages = [
  { id: 1, company: '株式会社サンプルテック', title: '【スカウト】Webエンジニア募集！フルリモート勤務可能...', time: '17:13', isNew: true },
  { id: 2, company: '株式会社テックイノベーション', title: '【インフラエンジニア】クラウド環境の構築・運用...', time: '16:22', isNew: true },
  { id: 3, company: '株式会社デジタルソリューションズ', title: '大規模システム開発のプロジェクトマネージャー募集...', time: '13:54', isNew: false },
];

const mockJobs = [
  { id: 1, title: '【フルリモート】シニアバックエンドエンジニア', company: '株式会社サンプルテック', salary: '800万円〜', location: '東京都', isRemote: true },
  { id: 2, title: '【フルリモート・副業OK】フロントエンドエンジニア', company: '株式会社クラウドワークス', salary: '700万円〜', location: '東京都', isRemote: true },
  { id: 3, title: '【リモート&フレックス】クラウドエンジニア', company: '株式会社テックラボ', salary: '600万円〜', location: '大阪府', isRemote: true },
];

export default function MyPage() {
  const { user } = useAuth();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* ヘッダーバナー / 헤더 배너 */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-lg p-6 mb-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm opacity-80">2026年最新版</p>
            <h2 className="text-xl font-bold mt-1">転職活動に迷ったら、キャリア・転職コラム</h2>
            <p className="text-sm mt-2 opacity-90">
              転職活動の進め方、応募のポイントから面接のコツまで、転職ノウハウが満載です。
            </p>
          </div>
          <Link
            href="#"
            className="bg-white text-red-600 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-100"
          >
            キャリア・転職コラムをみる
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 左側メインコンテンツ / 좌측 메인 콘텐츠 */}
        <div className="lg:col-span-2 space-y-8">
          {/* 新着メッセージ / 새 메시지 */}
          <section className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">新着メッセージ</h3>
              <Link href="/messages" className="text-sm text-red-600 hover:underline">
                すべて見る →
              </Link>
            </div>
            <div className="space-y-4">
              {mockMessages.map((msg) => (
                <Link
                  key={msg.id}
                  href={`/messages/${msg.id}`}
                  className="block p-4 border border-gray-200 rounded-lg hover:border-red-300 hover:bg-red-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center">
                        {msg.isNew && (
                          <span className="bg-red-600 text-white text-xs px-2 py-0.5 rounded mr-2">NEW</span>
                        )}
                        <span className="text-sm font-medium text-gray-900">{msg.company}</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1 truncate">{msg.title}</p>
                    </div>
                    <span className="text-xs text-gray-500 ml-4">{msg.time}</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* あなたへのおすすめ求人 / 추천 구인 */}
          <section className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">あなたへのおすすめ求人</h3>
              <Link href="/jobs" className="text-sm text-red-600 hover:underline">
                すべて見る →
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {mockJobs.map((job) => (
                <Link
                  key={job.id}
                  href={`/jobs/${job.id}`}
                  className="block p-4 border border-gray-200 rounded-lg hover:border-red-300 hover:shadow-md transition-all"
                >
                  <h4 className="text-sm font-medium text-gray-900 line-clamp-2">{job.title}</h4>
                  <p className="text-xs text-gray-500 mt-2">{job.company}</p>
                  <div className="mt-3 space-y-1">
                    <p className="text-sm text-red-600 font-medium">{job.salary}</p>
                    <div className="flex items-center text-xs text-gray-500">
                      <span>{job.location}</span>
                      {job.isRemote && (
                        <span className="ml-2 bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">リモート</span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </div>

        {/* 右側サイドバー / 우측 사이드바 */}
        <div className="space-y-6">
          {/* 気になるリスト / 관심 리스트 */}
          <section className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">気になるリスト</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">求人</span>
                <span className="font-medium text-gray-900">0件</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">気になる人</span>
                <span className="font-medium text-gray-900">0人</span>
              </div>
            </div>
            <Link
              href="#"
              className="block mt-4 text-center text-sm text-red-600 hover:underline"
            >
              気になるを見る →
            </Link>
          </section>

          {/* スカウト受信状況 / 스카우트 수신 현황 */}
          <section className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">スカウト受信状況</h3>
            <p className="text-sm text-gray-600 mb-4">
              企業やヘッドハンターからスカウトを受ける設定をオンにすると、あなたの経歴に興味を持った企業やヘッドハンターからスカウトを受け取れます。
            </p>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-700">スカウト受信</span>
                <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">ON</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">今月のスカウト</span>
                <span className="font-bold text-red-600">3件</span>
              </div>
            </div>
          </section>

          {/* プレミアムチケット / 프리미엄 티켓 */}
          <section className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg shadow-sm p-6 border border-amber-200">
            <div className="flex items-center mb-3">
              <span className="text-amber-600 text-xl mr-2">👑</span>
              <h3 className="text-lg font-bold text-amber-800">プレミアムステージ</h3>
            </div>
            <p className="text-sm text-amber-700 mb-4">
              より多くの求人や機能にアクセスできます
            </p>
            <Link
              href="#"
              className="block w-full text-center bg-amber-500 text-white py-2 rounded-md text-sm font-medium hover:bg-amber-600"
            >
              アップグレード
            </Link>
          </section>
        </div>
      </div>
    </div>
  );
}
