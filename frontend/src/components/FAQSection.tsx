// FAQ Section - Frequently Asked Questions
// FAQセクション - よくある質問
"use client";

import { useEffect, useRef, useState } from "react";

/**
 * FAQSection Component
 * FAQSectionコンポーネント
 *
 * BizReach style FAQ section with accordion format
 * BizReachスタイルのFAQセクション
 * アコーディオン形式で質問/回答を表示
 */

const faqs = [
  {
    question: "サービスの利用に費用はかかりますか？",
    answer:
      "いいえ、完全無料でご利用いただけます。会員登録から求人への応募、内定まで一切費用はかかりません。企業側が採用費用を負担するビジネスモデルのため、求職者様は無料でサービスをご利用いただけます。",
  },
  {
    question: "現在の会社にバレることはありますか？",
    answer:
      "ご安心ください。特定の企業をブロックする機能がございます。現在お勤めの企業や関連会社、取引先などを設定していただくことで、それらの企業にはあなたのプロフィールが表示されません。",
  },
  {
    question: "どのような企業からスカウトが届きますか？",
    answer:
      "大手企業からスタートアップ、外資系企業まで幅広い企業からスカウトが届きます。年収1,000万円以上の求人が4割以上を占め、ハイクラス求人が豊富です。業種・職種も多岐にわたります。",
  },
  {
    question: "登録後すぐにスカウトは届きますか？",
    answer:
      "職務経歴を詳しく登録いただくと、早ければ登録当日からスカウトが届き始めます。より多くのスカウトを受け取るためには、職務経歴の詳細な記載と、定期的なログインをおすすめします。",
  },
  {
    question: "転職を迷っている段階でも登録できますか？",
    answer:
      "もちろんです。「良い機会があれば転職したい」という方も多くご登録いただいています。まずは市場価値を知るため、どのような企業からスカウトが届くか確認するためにご登録いただくことをおすすめします。",
  },
];

export default function FAQSection() {
  const [isVisible, setIsVisible] = useState(false);
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section
      ref={sectionRef}
      className="relative py-12 md:py-24 bg-white md:bg-slate-950 overflow-hidden"
    >
      {/* Background Decoration / 背景装飾 */}
      <div className="hidden md:block absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent" />
      <div className="hidden md:block absolute top-1/4 -right-40 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl" />

      <div className="max-w-3xl mx-auto px-6">
        {/* Section Header / セクションヘッダー */}
        <div
          className={`text-center mb-8 md:mb-12 transform transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <span className="text-red-600 md:text-amber-500 text-sm font-semibold tracking-widest uppercase">
            FAQ
          </span>
          <h2 className="mt-3 md:mt-4 text-2xl md:text-4xl font-bold text-slate-900 md:text-white">
            よくある
            <span className="text-red-600 md:bg-gradient-to-r md:from-amber-400 md:to-amber-600 md:bg-clip-text md:text-transparent">
              ご質問
            </span>
          </h2>
        </div>

        {/* FAQ Accordion / FAQアコーディオン */}
        <div className="space-y-3 md:space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className={`transform transition-all duration-700 ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <div
                className={`rounded-xl border transition-all duration-300 ${
                  openIndex === index
                    ? "border-red-300 md:border-amber-500/30 bg-red-50 md:bg-slate-900/50"
                    : "border-slate-200 md:border-slate-800 bg-slate-50 md:bg-slate-900/30 hover:border-slate-300 md:hover:border-slate-700"
                }`}
              >
                {/* Question Button / 質問ボタン */}
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full px-4 md:px-6 py-4 md:py-5 flex items-center justify-between text-left"
                >
                  <span
                    className={`text-sm md:text-base font-medium transition-colors duration-300 ${
                      openIndex === index ? "text-red-600 md:text-amber-400" : "text-slate-900 md:text-white"
                    }`}
                  >
                    {faq.question}
                  </span>
                  <span
                    className={`ml-3 md:ml-4 flex-shrink-0 transition-transform duration-300 ${
                      openIndex === index ? "rotate-180" : ""
                    }`}
                  >
                    <svg
                      className={`w-4 h-4 md:w-5 md:h-5 ${
                        openIndex === index ? "text-red-500 md:text-amber-500" : "text-slate-400 md:text-slate-500"
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </span>
                </button>

                {/* Answer / 回答 */}
                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    openIndex === index ? "max-h-96" : "max-h-0"
                  }`}
                >
                  <div className="px-4 md:px-6 pb-4 md:pb-5">
                    <div className="pt-2 border-t border-slate-200 md:border-slate-800">
                      <p className="mt-3 md:mt-4 text-slate-600 md:text-slate-400 text-sm md:text-base leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Contact Information / 追加お問い合わせ案内 */}
        <div
          className={`text-center mt-8 md:mt-12 transform transition-all duration-1000 delay-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <p className="text-slate-500 text-sm md:text-base">
            その他ご不明な点がございましたら、お気軽にお問い合わせください。
          </p>
          <a
            href="#contact"
            className="inline-flex items-center gap-2 mt-3 md:mt-4 text-red-600 md:text-amber-500 hover:text-red-500 md:hover:text-amber-400 transition-colors duration-300 text-sm md:text-base"
          >
            お問い合わせはこちら
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
