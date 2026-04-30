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
        <div className="max-w-md mx-auto px-4 py-3 flex items-center gap-2">
          <Coffee className="w-5 h-5 text-amber-700" />
          <h1 className="text-base font-bold text-amber-900">결제</h1>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 max-w-md mx-auto w-full">
        {isPaid ? (
          <div className="text-center animate-in fade-in-0 zoom-in-95 duration-300">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-green-700 mb-2">결제 완료!</h2>
            <p className="text-gray-500 text-sm">주문 상태 페이지로 이동합니다...</p>
            <div className="mt-4 flex justify-center">
              <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
            </div>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-2xl shadow-sm border border-amber-100 p-5 w-full mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                  <Coffee className="w-5 h-5 text-amber-700" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">주문번호</p>
                  <p className="font-mono text-sm font-medium text-gray-800">{id}</p>
                </div>
              </div>
              {totalParam && (
                <div className="flex justify-between items-center pt-3 border-t border-amber-50">
                  <span className="text-gray-600 text-sm">결제 금액</span>
                  <span className="font-bold text-amber-800 text-lg">
                    {parseInt(totalParam).toLocaleString('ko-KR')}원
                  </span>
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-amber-100 p-6 w-full flex flex-col items-center">
              <h2 className="text-base font-bold text-amber-900 mb-1">토스로 송금하기</h2>
              <p className="text-xs text-gray-500 mb-5">QR 코드를 스캔하여 금액을 송금해 주세요</p>

              <div className="p-4 bg-white rounded-xl border-2 border-amber-200 shadow-inner">
                <QRCodeSVG
                  value={TOSS_QR_URL}
                  size={200}
                  fgColor="#92400e"
                  bgColor="#ffffff"
                  level="M"
                />
              </div>

              <div className="mt-6 flex items-center gap-2 text-amber-600">
                <div className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm font-medium">관리자 확인 대기 중...</p>
              </div>
              <p className="text-xs text-gray-400 mt-1">송금 후 관리자가 확인하면 자동으로 진행됩니다</p>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
