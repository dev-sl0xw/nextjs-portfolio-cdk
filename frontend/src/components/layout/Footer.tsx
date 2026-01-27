// 共通フッター
// 공통 푸터
//
// アプリダウンロードリンクとサービスリンク
// 앱 다운로드 링크와 서비스 링크

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      {/* バナー / 배너 */}
      <div className="bg-gray-800 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <p className="text-sm">
              転職で内定が決定した方へ アンケートにご回答ください
            </p>
            <Link href="#" className="text-sm bg-white text-gray-900 px-4 py-2 rounded hover:bg-gray-100">
              詳細はこちら
            </Link>
          </div>
        </div>
      </div>

      {/* メインフッター / 메인 푸터 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* アプリダウンロード / 앱 다운로드 */}
          <div>
            <h3 className="text-lg font-bold mb-4">ポートフォリオアプリ</h3>
            <div className="flex space-x-2">
              <Link href="#" className="bg-white text-gray-900 px-3 py-2 rounded text-xs flex items-center">
                <span className="mr-1">🍎</span> App Store
              </Link>
              <Link href="#" className="bg-white text-gray-900 px-3 py-2 rounded text-xs flex items-center">
                <span className="mr-1">▶️</span> Google Play
              </Link>
            </div>

            <h3 className="text-lg font-bold mt-8 mb-4">グループサービス</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="#" className="hover:text-white">社内版ポートフォリオ by HRMOS</Link></li>
              <li><Link href="#" className="hover:text-white">HRMOSタレントマネジメント</Link></li>
              <li><Link href="#" className="hover:text-white">HRMOS採用</Link></li>
            </ul>
          </div>

          {/* サービスリンク1 / 서비스 링크 1 */}
          <div>
            <h3 className="text-lg font-bold mb-4">サービスについて</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="#" className="hover:text-white">ポートフォリオについて</Link></li>
              <li><Link href="#" className="hover:text-white">よくある質問</Link></li>
              <li><Link href="#" className="hover:text-white">カスタマーサービスへのお問い合わせ</Link></li>
              <li><Link href="#" className="hover:text-white">設定</Link></li>
            </ul>
          </div>

          {/* サービスリンク2 / 서비스 링크 2 */}
          <div>
            <h3 className="text-lg font-bold mb-4">求職者向け</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="#" className="hover:text-white">職務経歴書代行入力</Link></li>
              <li><Link href="#" className="hover:text-white">プレミアムステージにアップグレード</Link></li>
              <li><Link href="#" className="hover:text-white">プレミアムチケットを利用する</Link></li>
            </ul>
          </div>

          {/* サービスリンク3 / 서비스 링크 3 */}
          <div>
            <h3 className="text-lg font-bold mb-4">その他</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="#" className="hover:text-white">転職コラム</Link></li>
              <li><Link href="#" className="hover:text-white">利用規約</Link></li>
              <li><Link href="#" className="hover:text-white">プライバシーポリシー</Link></li>
              <li><Link href="#" className="hover:text-white">法令に基づく表記</Link></li>
            </ul>
          </div>
        </div>
      </div>

      {/* コピーライト / 저작권 */}
      <div className="border-t border-gray-800 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-500">
          © 2026 Portfolio Inc. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
