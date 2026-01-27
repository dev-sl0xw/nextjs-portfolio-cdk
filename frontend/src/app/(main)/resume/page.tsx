// 職務経歴書ページ
// 직무경력서 페이지
//
// 求職者のプロフィール・経歴情報を表示・編集
// 구직자의 프로필/경력 정보를 표시/편집

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Sidebar, menuItems } from '@/components/layout';

// ダミーデータ / 더미 데이터
const mockBasicInfo = {
  name: '山田 太郎（やまだ たろう）',
  nameEn: 'TARO YAMADA',
  gender: '男性',
  birthDate: '1990年4月1日',
  country: '日本',
  phone: '090-1234-5678',
  prefecture: '東京都',
  address: '東京都 渋谷区',
  currentSalary: '700万円（700〜800万円）',
  managementExp: '5〜10人',
};

const mockPreferences = {
  desiredRoles: ['インフラエンジニア', 'SE（Web・オープン系）', 'プロジェクトマネージャー（Web・オープン系）'],
  desiredIndustry: ['SIer', 'ソフトウェア'],
  desiredLocations: ['日本', '東京都', '神奈川県', '大阪府'],
  overseas: ['海外勤務も検討可能'],
  workStyle: ['上場企業で働きたい', 'ワーク・ライフ・バランスを大事にしたい', 'スペシャリストになりたい'],
  desiredSalary: '800万円以上',
  timing: '3カ月以内に',
};

const mockSummary = `大手IT企業にて約5年間、AWSインフラエンジニアとしてサービス基盤の設計から運用まで一貫して担当。
AWS CDK によるIaC標準化と運用改善を推進し、認証システムの自動化で月間運用工数80%削減。
大規模Webサイトリプレースではゼロ障害と運用コスト25%削減を実現。
チームリーダーとして要件定義・関係部門調整を行い、複数プロジェクトの並行推進と業務改善を主導。`;

const mockSkills = [
  'AWS CDK（TypeScript/Python）を用いた開発とIaC標準化',
  'AWSサーバーレスアーキテクチャおよびコンテナの設計・構築',
  'クラウド認定資格に基づくマルチクラウドの知見',
  'CI/CDパイプライン構築によるデプロイ自動化',
  'チームマネジメントとプロジェクト推進力',
];

const mockExperience = [
  {
    type: '経験職種',
    role: 'インフラエンジニア',
    years: '5年',
  },
  {
    type: '経験業種',
    role: 'ITサービス・ソフトウェア',
    years: '5年',
  },
];

const mockCareer = {
  company: '株式会社サンプルテック|クラウドエンジニアリング部・シニアエンジニア',
  period: '2020年4月〜在職中',
  description: `インフラチームリーダー・大規模Webサービスのインフラ設計・運用
【役割・規模】
・インフラチームリーダー / 全8名（アプリチーム5名、インフラチーム3名）

【プロジェクト内容】
・ECサイトの新規構築・リプレースプロジェクトにおいて、設計フェーズから参加

【業務内容】
・インフラリーダーとして構成管理を含めたインフラ全般を担当
・アーキテクチャ設計、AWS CDKによるIaC実装、CI/CDパイプライン構築
・コンテナ実行基盤の最適化、セキュリティ対応、監視基盤構築`,
};

const mockEducation = {
  level: '大学卒',
  graduationDate: '2013年3月',
  school: '東京工業大学',
  schoolEn: 'Tokyo Institute of Technology',
  major: '情報工学部/情報工学科',
  majorEn: 'Computer Science',
};

const mockAwards = [
  {
    name: '社内表彰（技術革新賞）',
    year: '2024年',
    description: 'クラウド移行プロジェクトで技術革新賞を受賞。インフラチームの一員として、運用効率化と品質向上に貢献',
  },
];

const mockLanguages = {
  japanese: 'ビジネス会話',
  scores: [
    { name: 'TOEIC', score: '800' },
    { name: 'TOEIC SWスピーキング', score: '' },
    { name: 'TOEIC SWライティング', score: '' },
    { name: 'TOEFL', score: '' },
  ],
  others: ['日本語 ネイティブ', '英語 ビジネス会話'],
  overseas: { type: '出張経験', location: 'アメリカ', duration: '1年未満' },
};

const mockCertifications = [
  '情報処理技術者（応用情報技術者） 2015年',
  'AWS認定ソリューションアーキテクト - アソシエイト 2020年',
  'AWS認定ソリューションアーキテクト - プロフェッショナル 2022年',
  'Google Cloud Professional Cloud Architect 2023年',
];

export default function ResumePage() {
  const [activeSection, setActiveSection] = useState('basic');

  // 編集ボタンハンドラー（UI only）
  const handleEdit = (section: string) => {
    console.log(`Edit section: ${section}`);
    // TODO: 編集モーダル表示
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* パンくずリスト / 브레드크럼 */}
      <nav className="text-sm text-gray-500 mb-6">
        <Link href="/mypage" className="hover:text-gray-700">転職サイト ポートフォリオ</Link>
        <span className="mx-2">{'>'}</span>
        <span className="text-gray-900">職務経歴書</span>
      </nav>

      {/* PDFダウンロードボタン / PDF 다운로드 버튼 */}
      <div className="flex justify-end space-x-2 mb-6">
        <button className="px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50">
          履歴書PDF
        </button>
        <button className="px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50">
          職務経歴書PDF
        </button>
        <button className="px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50">
          英文職務経歴書PDF
        </button>
      </div>

      <div className="flex gap-8">
        {/* サイドバー / 사이드바 */}
        <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} />

        {/* メインコンテンツ / 메인 콘텐츠 */}
        <div className="flex-1 space-y-8">
          {/* 基本情報 / 기본 정보 */}
          <section id="basic" className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">基本情報</h2>
              <button
                onClick={() => handleEdit('basic')}
                className="text-sm text-blue-600 hover:underline"
              >
                編集
              </button>
            </div>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex">
                <dt className="w-32 text-sm text-gray-500">氏名</dt>
                <dd className="text-sm text-gray-900">{mockBasicInfo.name}</dd>
              </div>
              <div className="flex">
                <dt className="w-32 text-sm text-gray-500">氏名（英語）</dt>
                <dd className="text-sm text-gray-900">{mockBasicInfo.nameEn}</dd>
              </div>
              <div className="flex">
                <dt className="w-32 text-sm text-gray-500">性別</dt>
                <dd className="text-sm text-gray-900">{mockBasicInfo.gender}</dd>
              </div>
              <div className="flex">
                <dt className="w-32 text-sm text-gray-500">生年月日</dt>
                <dd className="text-sm text-gray-900">{mockBasicInfo.birthDate}</dd>
              </div>
              <div className="flex">
                <dt className="w-32 text-sm text-gray-500">国</dt>
                <dd className="text-sm text-gray-900">{mockBasicInfo.country}</dd>
              </div>
              <div className="flex">
                <dt className="w-32 text-sm text-gray-500">電話番号</dt>
                <dd className="text-sm text-gray-900">{mockBasicInfo.phone}</dd>
              </div>
              <div className="flex">
                <dt className="w-32 text-sm text-gray-500">居住地</dt>
                <dd className="text-sm text-gray-900">{mockBasicInfo.prefecture}</dd>
              </div>
              <div className="flex">
                <dt className="w-32 text-sm text-gray-500">住所</dt>
                <dd className="text-sm text-gray-900">{mockBasicInfo.address}</dd>
              </div>
              <div className="flex">
                <dt className="w-32 text-sm text-gray-500">現在の年収</dt>
                <dd className="text-sm text-gray-900">{mockBasicInfo.currentSalary}</dd>
              </div>
              <div className="flex">
                <dt className="w-32 text-sm text-gray-500">マネジメント経験</dt>
                <dd className="text-sm text-gray-900">{mockBasicInfo.managementExp}</dd>
              </div>
            </dl>
          </section>

          {/* 希望条件 / 희망 조건 */}
          <section id="preferences" className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">希望条件</h2>
              <button onClick={() => handleEdit('preferences')} className="text-sm text-blue-600 hover:underline">
                編集
              </button>
            </div>
            <dl className="space-y-4">
              <div>
                <dt className="text-sm text-gray-500 mb-1">希望職種</dt>
                <dd className="text-sm text-gray-900">{mockPreferences.desiredRoles.join(' / ')}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500 mb-1">希望業種</dt>
                <dd className="text-sm text-gray-900">{mockPreferences.desiredIndustry.join(' / ')}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500 mb-1">希望勤務地</dt>
                <dd className="text-sm text-gray-900">{mockPreferences.desiredLocations.join(' / ')}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500 mb-1">興味がある働き方</dt>
                <dd className="text-sm text-gray-900">{mockPreferences.workStyle.join(' / ')}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500 mb-1">希望年収</dt>
                <dd className="text-sm text-gray-900">{mockPreferences.desiredSalary}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500 mb-1">転職希望時期</dt>
                <dd className="text-sm text-gray-900">{mockPreferences.timing}</dd>
              </div>
            </dl>
          </section>

          {/* 職務要約・スキル / 직무 요약/스킬 */}
          <section id="summary" className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">職務要約</h2>
              <button onClick={() => handleEdit('summary')} className="text-sm text-blue-600 hover:underline">
                編集
              </button>
            </div>
            <p className="text-sm text-gray-700 whitespace-pre-line mb-6">{mockSummary}</p>

            <h3 className="text-md font-bold text-gray-900 mb-3">スキル</h3>
            <ul className="list-disc list-inside space-y-1">
              {mockSkills.map((skill, index) => (
                <li key={index} className="text-sm text-gray-700">{skill}</li>
              ))}
            </ul>
          </section>

          {/* 職務経歴 / 직무 경력 */}
          <section id="experience" className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">これまでに経験した職種、業種</h2>
              <button onClick={() => handleEdit('experience')} className="text-sm text-blue-600 hover:underline">
                編集
              </button>
            </div>
            <div className="space-y-2 mb-6">
              {mockExperience.map((exp, index) => (
                <div key={index} className="flex text-sm">
                  <span className="w-24 text-gray-500">{exp.type}</span>
                  <span className="text-gray-900">{exp.role}</span>
                  <span className="ml-4 text-gray-500">{exp.years}</span>
                </div>
              ))}
            </div>

            <h3 className="text-md font-bold text-gray-900 mb-3">職務経歴</h3>
            <div className="border-l-2 border-red-600 pl-4">
              <p className="text-sm font-medium text-gray-900">{mockCareer.company}</p>
              <p className="text-sm text-gray-500 mb-2">{mockCareer.period}</p>
              <p className="text-sm text-gray-700 whitespace-pre-line">{mockCareer.description}</p>
            </div>
          </section>

          {/* 学歴 / 학력 */}
          <section id="education" className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">学歴</h2>
              <button onClick={() => handleEdit('education')} className="text-sm text-blue-600 hover:underline">
                編集
              </button>
            </div>
            <dl className="space-y-2">
              <div className="flex">
                <dt className="w-32 text-sm text-gray-500">学校種別</dt>
                <dd className="text-sm text-gray-900">{mockEducation.level}</dd>
              </div>
              <div className="flex">
                <dt className="w-32 text-sm text-gray-500">卒業年月</dt>
                <dd className="text-sm text-gray-900">{mockEducation.graduationDate}</dd>
              </div>
              <div className="flex">
                <dt className="w-32 text-sm text-gray-500">学校名</dt>
                <dd className="text-sm text-gray-900">{mockEducation.school}</dd>
              </div>
              <div className="flex">
                <dt className="w-32 text-sm text-gray-500">学部/学科/専攻</dt>
                <dd className="text-sm text-gray-900">{mockEducation.major}</dd>
              </div>
            </dl>
          </section>

          {/* 表彰 / 수상 */}
          <section id="awards" className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">表彰</h2>
              <button onClick={() => handleEdit('awards')} className="text-sm text-blue-600 hover:underline">
                編集
              </button>
            </div>
            {mockAwards.map((award, index) => (
              <div key={index} className="mb-4">
                <p className="text-sm font-medium text-gray-900">{award.name} {award.year}</p>
                <p className="text-sm text-gray-600 mt-1">{award.description}</p>
              </div>
            ))}
          </section>

          {/* 語学力・海外経験 / 어학력/해외경험 */}
          <section id="languages" className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">語学力</h2>
              <button onClick={() => handleEdit('languages')} className="text-sm text-blue-600 hover:underline">
                編集
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">英語力</h4>
                <p className="text-sm text-gray-700">英語力: {mockLanguages.japanese}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">その他言語</h4>
                <ul className="list-disc list-inside">
                  {mockLanguages.others.map((lang, index) => (
                    <li key={index} className="text-sm text-gray-700">{lang}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">海外経験</h4>
                <p className="text-sm text-gray-700">
                  {mockLanguages.overseas.type}: {mockLanguages.overseas.location} {mockLanguages.overseas.duration}
                </p>
              </div>
            </div>
          </section>

          {/* 資格 / 자격 */}
          <section id="certifications" className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">資格</h2>
              <button onClick={() => handleEdit('certifications')} className="text-sm text-blue-600 hover:underline">
                編集
              </button>
            </div>
            <ul className="list-disc list-inside space-y-1">
              {mockCertifications.map((cert, index) => (
                <li key={index} className="text-sm text-gray-700">{cert}</li>
              ))}
            </ul>
          </section>

          {/* 更新日 / 갱신일 */}
          <div className="text-right text-sm text-gray-500">
            更新日: 2026/01/27
          </div>
        </div>
      </div>
    </div>
  );
}
