'use client';

import { use, useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';
import { Coffee, CheckCircle2, Smartphone } from 'lucide-react';
import { subscribeToOrder } from '@/lib/orders';
import { OrderStatus } from '@/types';

interface Props {
  params: Promise<{ id: string }>;
}

const BANK_NAMES: Record<string, string> = {
  '002': '산업은행', '003': '기업은행', '004': '국민은행', '007': '수협은행',
  '011': '농협은행', '020': '우리은행', '023': 'SC제일은행', '027': '씨티은행',
  '031': '대구은행', '032': '부산은행', '034': '광주은행', '035': '제주은행',
  '037': '전북은행', '039': '경남은행', '045': '새마을금고', '048': '신협',
  '071': '우체국', '081': '하나은행', '088': '신한은행', '089': '케이뱅크',
  '090': '카카오뱅크', '092': '토스뱅크',
};

function buildTossUrl(amount: number): string {
  const bankCode = process.env.NEXT_PUBLIC_TOSS_BANK_CODE ?? '';
  const account = process.env.NEXT_PUBLIC_TOSS_ACCOUNT_NO ?? '';

  if (!bankCode || !account) return 'supertoss://';

  const bankName = BANK_NAMES[bankCode] ?? bankCode;
  return `supertoss://send?bank=${encodeURIComponent(bankName)}&accountNo=${account}&amount=${amount}`;
}

function isMobileDevice() {
  if (typeof navigator === 'undefined') return false;
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

export default function OrderPage({ params }: Props) {
  const { id } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const totalParam = searchParams.get('total');
  const total = totalParam ? parseInt(totalParam) : 0;

  const [status, setStatus] = useState<OrderStatus>('pending');
  const [isPaid, setIsPaid] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(isMobileDevice());
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeToOrder(id, (order) => {
      setStatus(order.status);
      if (order.status !== 'pending') {
        setIsPaid(true);
        setTimeout(() => router.push(`/track/${id}`), 1500);
      }
    });
    return unsubscribe;
  }, [id, router]);

  const handleOpenToss = useCallback(() => {
    const tossUrl = buildTossUrl(total);
    window.location.href = tossUrl;
    // 앱이 없을 경우 다운로드 페이지로 이동
    setTimeout(() => {
      window.location.href = 'https://toss.im/download';
    }, 2500);
  }, [total]);

  const tossUrl = buildTossUrl(total);
  const shortId = id.replace('order-', '').slice(-8);

  return (
    <div className="min-h-screen bg-amber-50 flex flex-col">
      <header className="bg-white border-b border-amber-100 shadow-sm">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center gap-2">
          <Coffee className="w-5 h-5 text-amber-700" />
          <h1 className="text-base font-bold text-amber-900">결제</h1>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-5 py-8 max-w-md mx-auto w-full gap-4">
        {isPaid ? (
          /* 결제 확인 완료 화면 */
          <div className="text-center animate-in fade-in-0 zoom-in-95 duration-300">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <CheckCircle2 className="w-12 h-12 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-green-700 mb-2">송금 확인 완료!</h2>
            <p className="text-gray-500 text-sm">주문 상태 페이지로 이동합니다...</p>
            <div className="mt-4 flex justify-center">
              <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
            </div>
          </div>
        ) : (
          <>
            {/* 주문 정보 카드 */}
            <div className="bg-white rounded-2xl shadow-sm border border-amber-100 p-5 w-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 bg-amber-100 rounded-full flex items-center justify-center">
                  <Coffee className="w-5 h-5 text-amber-700" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">주문번호</p>
                  <p className="font-mono text-sm font-semibold text-gray-800">#{shortId}</p>
                </div>
              </div>
              {total > 0 && (
                <div className="flex justify-between items-center pt-4 border-t border-amber-50">
                  <span className="text-gray-600 text-sm font-medium">송금 금액</span>
                  <span className="font-bold text-amber-800 text-2xl">
                    {total.toLocaleString('ko-KR')}원
                  </span>
                </div>
              )}
            </div>

            {/* QR 코드 카드 */}
            <div className="bg-white rounded-2xl shadow-sm border border-amber-100 p-6 w-full flex flex-col items-center gap-4">
              <div className="text-center">
                <h2 className="text-base font-bold text-amber-900">토스로 송금하기</h2>
                <p className="text-xs text-gray-400 mt-1">
                  QR을 스캔하면 금액이 자동으로 입력됩니다
                </p>
              </div>

              {/* QR 코드 — supertoss:// 딥링크로 자동 생성 */}
              <div className="p-4 bg-white rounded-2xl border-2 border-amber-200 shadow-inner">
                <QRCodeSVG
                  value={tossUrl}
                  size={220}
                  fgColor="#3182F6"
                  bgColor="#ffffff"
                  level="M"
                />
              </div>

              {/* 모바일: 앱 바로 열기 버튼 */}
              {isMobile && (
                <button
                  onClick={handleOpenToss}
                  className="w-full flex items-center justify-center gap-2.5 bg-[#3182F6] hover:bg-[#1b64da] active:bg-[#1554c1] text-white rounded-2xl py-4 font-bold text-base transition-colors"
                >
                  <Smartphone className="w-5 h-5" />
                  토스 앱으로 바로 송금
                </button>
              )}

              {/* 대기 안내 */}
              <div className="flex flex-col items-center gap-1">
                <div className="flex items-center gap-2 text-amber-600">
                  <div className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm font-semibold">관리자 확인 대기 중...</p>
                </div>
                <p className="text-xs text-gray-400 text-center">
                  송금 후 관리자가 확인하면 자동으로 진행됩니다
                </p>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
