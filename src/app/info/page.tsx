'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, MapPin, ExternalLink } from 'lucide-react';
import { FaInstagram } from 'react-icons/fa';
import Image from 'next/image';

export default function InfoPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-sage-50">
      <header className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-md mx-auto px-4 h-14 grid grid-cols-[48px_1fr_48px] items-center">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex items-center justify-center gap-2">
            <Image src="/logo-nav.png" alt="상록수커피클럽" width={32} height={32} className="object-contain" />
            <span className="text-base font-bold text-sage-900">상록수커피클럽</span>
          </div>
          <div />
        </div>
      </header>

      {/* 히어로 */}
      <div className="bg-gradient-to-br from-sage-700 via-sage-600 to-sage-500 text-white px-6 pt-8 pb-10 text-center">
        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/10 border-2 border-white/20 flex items-center justify-center overflow-hidden">
          <Image src="/logo.png" alt="상록수커피클럽" width={60} height={60} className="rounded-full" />
        </div>
        <h1 className="text-xl font-bold tracking-tight mb-1">상록수커피클럽</h1>
        <p className="text-sage-100 text-sm font-medium">동국대학교 봄 축제 · 2026</p>
        <p className="text-sage-200 text-xs mt-2 leading-relaxed">
          좋은 원두, 정성스러운 한 잔<br />당신의 축제를 더 특별하게
        </p>
      </div>

      <main className="max-w-md mx-auto px-4 -mt-4 pb-10 flex flex-col gap-3">

        {/* 원두 파트너 */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-5 pt-5 pb-4">
            <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider mb-3">원두 파트너</p>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shrink-0 overflow-hidden">
                <Image src="/bean-brothers-logo.svg" alt="Bean Brothers" width={40} height={29} className="object-contain" />
              </div>
              <div>
                <p className="font-bold text-gray-900">빈브라더스</p>
                <p className="text-xs text-gray-400 mt-0.5">Bean Brothers Coffee</p>
              </div>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed mb-4">
              서울을 대표하는 스페셜티 커피 로스터. 산지의 이야기를 담아 정성껏 로스팅한 원두를 제공합니다.
            </p>
            <div className="flex gap-2">
              <a
                href="https://www.instagram.com/bean_brothers?igsh=b2w0YnRpbWhxZzVq"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-1.5 bg-gray-50 border border-gray-200 rounded-xl py-2.5 text-xs font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <FaInstagram className="w-3.5 h-3.5" />
                인스타그램
              </a>
              <a
                href="https://www.beanbrothers.co.kr/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-1.5 bg-gray-50 border border-gray-200 rounded-xl py-2.5 text-xs font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                홈페이지
              </a>
            </div>
          </div>
        </div>

        {/* 부스 위치 */}
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider mb-3">부스 위치</p>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
              <MapPin className="w-5 h-5 text-gray-500" />
            </div>
            <div>
              <p className="font-bold text-gray-900 text-sm">팔정도 00번 부스</p>
              <p className="text-xs text-gray-500 mt-1">코끼리 동상 맞은편</p>
              <p className="text-xs text-gray-400 mt-0.5">동국대학교 서울캠퍼스</p>
            </div>
          </div>
        </div>

        {/* SNS / 링크 */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider px-5 pt-5 pb-3">링크</p>

          <a
            href="https://www.instagram.com/scc_dgu/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 transition-colors active:scale-[0.98] border-t border-gray-100"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shrink-0">
              <FaInstagram className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-800 text-sm">인스타그램</p>
              <p className="text-xs text-gray-400 mt-0.5">@scc_dgu</p>
            </div>
            <ExternalLink className="w-4 h-4 text-gray-300 shrink-0" />
          </a>

          <a
            href="https://band-fright-fec.notion.site/66f9a52e180d4784a9ecd48fcd98942e"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 transition-colors active:scale-[0.98] border-t border-gray-100"
          >
            <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center shrink-0">
              <span className="text-white font-bold text-sm">N</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-800 text-sm">노션 페이지</p>
              <p className="text-xs text-gray-400 mt-0.5">상록수커피클럽 소개</p>
            </div>
            <ExternalLink className="w-4 h-4 text-gray-300 shrink-0" />
          </a>
        </div>

        <p className="text-center text-xs text-gray-300 py-2">
          상록수커피클럽 · 2026 동국대 봄 축제
        </p>
      </main>
    </div>
  );
}
