'use client';

import { use, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';
import { Coffee, CheckCircle2 } from 'lucide-react';
import { subscribeToOrder } from '@/lib/orders';
import { OrderStatus } from '@/types';

interface Props {
  params: Promise<{ id: string }>;
}

const TOSS_QR_URL = process.env.NEXT_PUBLIC_TOSS_QR_URL ?? 'https://toss.im/payment/mock-demo';

export default function OrderPage({ params }: Props) {
  const { id } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const totalParam = searchParams.get('total');

  const [status, setStatus] = useState<OrderStatus>('pending');
  const [isPaid, setIsPaid] = useState(false);
  const [useStaticQr, setUseStaticQr] = useState(true);

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
          <div className="text-center animate-in fade-in-0 zoom-in-95 duration-300">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <CheckCircle2 className="w-12 h-12 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-green-700 mb-2">결제 완료!</h2>
            <p className="text-gray-500 text-sm">주문 상태 페이지로 이동합니다...</p>
            <div className="mt-4 flex justify-center">
              <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
            </div>
          </div>
        ) : (
          <>
            {/* Order info card */}
            <div className="bg-white rounded-2xl shadow-sm border border-amber-100 p-5 w-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 bg-amber-100 rounded-full flex items-center justify-center">
                  <Coffee className="w-5 h-5 text-amber-700" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">주문번호</p>
                  <p className="font-mono text-sm font-semibold text-gray-800">{id.replace('order-', '').slice(-8)}</p>
                </div>
              </div>
              {totalParam && (
                <div className="flex justify-between items-center pt-4 border-t border-amber-50">
                  <span className="text-gray-600 text-sm font-medium">송금 금액</span>
                  <span className="font-bold text-amber-800 text-2xl">
                    {parseInt(totalParam).toLocaleString('ko-KR')}원
                  </span>
                </div>
              )}
            </div>

            {/* QR Code card */}
            <div className="bg-white rounded-2xl shadow-sm border border-amber-100 p-6 w-full flex flex-col items-center gap-4">
              <div>
                <h2 className="text-center text-base font-bold text-amber-900">토스로 송금하기</h2>
                <p className="text-center text-xs text-gray-400 mt-1">QR을 스캔하거나 금액을 직접 입력해주세요</p>
              </div>

              <div className="p-4 bg-white rounded-2xl border-2 border-amber-200 shadow-inner">
                {useStaticQr ? (
                  <img
                    src="/toss-qr.png"
                    alt="토스 송금 QR"
                    width={220}
                    height={220}
                    className="w-[220px] h-[220px] object-contain"
                    onError={() => setUseStaticQr(false)}
                  />
                ) : (
                  <QRCodeSVG
                    value={TOSS_QR_URL}
                    size={220}
                    fgColor="#92400e"
                    bgColor="#ffffff"
                    level="M"
                  />
                )}
              </div>

              <div className="flex items-center gap-2 text-amber-600">
                <div className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm font-semibold">관리자 확인 대기 중...</p>
              </div>
              <p className="text-xs text-gray-400 -mt-2 text-center">
                송금 후 관리자가 확인하면 자동으로 진행됩니다
              </p>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
