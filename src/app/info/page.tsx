'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, MapPin, BookOpen, Coffee, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export default function InfoPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-sage-50">
      <header className="bg-white border-b border-sage-100 shadow-sm">
        <div className="max-w-md mx-auto px-4 h-14 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2.5 rounded-full hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <Link href="/" className="flex items-center gap-2">
            <Coffee className="w-5 h-5 text-sage-700" />
            <h1 className="text-base font-bold text-sage-900">상록수커피클럽 안내</h1>
          </Link>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-6 flex flex-col gap-4">

        {/* 빈브라더스 — 상단 */}
        <div className="bg-white rounded-2xl border border-sage-100 shadow-sm p-5">
          <p className="text-xs text-gray-400 font-medium mb-3">원두 파트너</p>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-11 h-11 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-center shrink-0">
              <span className="text-2xl">🫘</span>
            </div>
            <div>
              <p className="font-bold text-gray-800 text-sm">빈브라더스</p>
              <p className="text-xs text-gray-500 mt-0.5">Bean Brothers Coffee</p>
            </div>
          </div>
          <div className="flex gap-2">
            <a
              href="https://www.instagram.com/bean_brothers?igsh=b2w0YnRpbWhxZzVq"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => window.gtag?.('event', 'click', { event_category: 'outbound', event_label: 'beanbrothers_instagram' })}
              className="flex-1 flex items-center justify-center gap-1.5 border border-gray-200 rounded-xl py-2.5 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              인스타그램
            </a>
            <a
              href="https://www.beanbrothers.co.kr/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-1.5 border border-gray-200 rounded-xl py-2.5 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              홈페이지
            </a>
          </div>
        </div>

        {/* 부스 위치 */}
        <div className="bg-white rounded-2xl border border-sage-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-9 h-9 bg-sage-100 rounded-xl flex items-center justify-center">
              <MapPin className="w-5 h-5 text-sage-700" />
            </div>
            <h3 className="font-bold text-gray-800">부스 위치</h3>
          </div>
          <div className="w-full aspect-square bg-sage-100 rounded-xl flex items-center justify-center mb-3 max-w-[300px] mx-auto">
            <div className="text-center text-sage-400">
              <MapPin className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p className="text-xs font-medium">지도 이미지 준비 중</p>
            </div>
          </div>
          <div className="bg-sage-50 rounded-xl px-4 py-3 text-center">
            <p className="text-sm font-bold text-sage-900">팔정도 00번 부스</p>
            <p className="text-xs text-sage-700 mt-0.5">코끼리 동상 맞은편</p>
          </div>
        </div>

        {/* 인스타그램 */}
        <a
          href="https://www.instagram.com/scc_dgu/"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-white rounded-2xl border border-sage-100 shadow-sm p-5 flex items-center gap-4 hover:bg-sage-50 transition-colors active:scale-[0.98]"
        >
          <div className="w-11 h-11 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shrink-0">
            <span className="text-2xl">📸</span>
          </div>
          <div>
            <p className="font-bold text-gray-800 text-sm">인스타그램</p>
            <p className="text-xs text-gray-500 mt-0.5">@scc_dgu</p>
          </div>
          <ExternalLink className="w-4 h-4 text-gray-300 ml-auto" />
        </a>

        {/* 노션 */}
        <a
          href="https://band-fright-fec.notion.site/66f9a52e180d4784a9ecd48fcd98942e"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-white rounded-2xl border border-sage-100 shadow-sm p-5 flex items-center gap-4 hover:bg-sage-50 transition-colors active:scale-[0.98]"
        >
          <div className="w-11 h-11 bg-gray-900 rounded-xl flex items-center justify-center shrink-0">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="font-bold text-gray-800 text-sm">노션 페이지</p>
            <p className="text-xs text-gray-500 mt-0.5">상록수커피클럽 소개</p>
          </div>
          <ExternalLink className="w-4 h-4 text-gray-300 ml-auto" />
        </a>

        <div className="text-center py-2">
          <p className="text-xs text-gray-400">SCC와 함께하는 특별한 커피 경험</p>
        </div>
      </main>
    </div>
  );
}
