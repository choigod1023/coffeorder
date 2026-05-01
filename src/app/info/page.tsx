'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, MapPin, BookOpen, Coffee, ExternalLink } from 'lucide-react';

export default function InfoPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-amber-50">
      <header className="bg-white border-b border-amber-100 shadow-sm">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex items-center gap-2">
            <Coffee className="w-5 h-5 text-amber-700" />
            <h1 className="text-base font-bold text-amber-900">상록수커피클럽 안내</h1>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-6 flex flex-col gap-4">
        {/* Logo / intro */}
        <div className="bg-gradient-to-r from-amber-800 to-amber-500 rounded-2xl p-6 text-white text-center">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <span className="text-3xl">☕</span>
          </div>
          <h2 className="text-xl font-bold">상록수커피클럽</h2>
          <p className="text-amber-200 text-sm mt-1">SCC · 동국대학교</p>
        </div>

        {/* Booth location */}
        <div className="bg-white rounded-2xl border border-amber-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-9 h-9 bg-amber-100 rounded-xl flex items-center justify-center">
              <MapPin className="w-5 h-5 text-amber-700" />
            </div>
            <h3 className="font-bold text-gray-800">부스 위치</h3>
          </div>
          <div className="bg-amber-50 rounded-xl p-4">
            <p className="text-sm text-amber-900 font-semibold">축제 현장 내 SCC 부스</p>
            <p className="text-xs text-amber-700 mt-1">(상세 위치 업데이트 예정)</p>
          </div>
          <p className="text-xs text-gray-500 mt-3">
            궁금한 점은 부스 스태프에게 문의해주세요
          </p>
        </div>

        {/* Instagram */}
        <a
          href="https://www.instagram.com/scc_dgu/"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-white rounded-2xl border border-amber-100 shadow-sm p-5 flex items-center gap-4 hover:bg-amber-50 transition-colors active:scale-[0.98]"
        >
          <div className="w-11 h-11 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shrink-0">
            <span className="text-white font-bold text-sm">IG</span>
          </div>
          <div>
            <p className="font-bold text-gray-800 text-sm">인스타그램</p>
            <p className="text-xs text-gray-500 mt-0.5">@scc_dgu</p>
          </div>
          <ExternalLink className="w-4 h-4 text-gray-300 ml-auto" />
        </a>

        {/* Notion */}
        <a
          href="https://band-fright-fec.notion.site/66f9a52e180d4784a9ecd48fcd98942e"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-white rounded-2xl border border-amber-100 shadow-sm p-5 flex items-center gap-4 hover:bg-amber-50 transition-colors active:scale-[0.98]"
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
