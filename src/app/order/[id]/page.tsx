'use client';

import { use, useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';
import { Coffee, CheckCircle2 } from 'lucide-react';
import { OrderStatus } from '@/types';

interface Props {
  params: Promise<{ id: string }>;
}

// A placeholder QR URL for when the mock/API doesn't provide one
const MOCK_QR_URL = 'https://toss.im/payment/mock-demo';

export default function OrderPage({ params }: Props) {
  const { id } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const isMock = searchParams.get('mock') === 'true';
  const totalParam = searchParams.get('total');

  const [qrUrl, setQrUrl] = useState<string>(MOCK_QR_URL);
  const [status, setStatus] = useState<OrderStatus>('pending');
  const [isPaid, setIsPaid] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!isMock) {
      // Try to fetch initial order data if not mock
      fetch(`/api/orders/${id}`)
        .then(r => r.json())
        .then(data => {
          if (data.tossQrUrl) setQrUrl(data.tossQrUrl);
          if (data.status) setStatus(data.status);
        })
        .catch(() => {});
    }
  }, [id, isMock]);

  useEffect(() => {
    const pollStatus = async () => {
      try {
        const res = await fetch(`/api/orders/${id}/status`);
        if (res.ok) {
          const data = await res.json();
          setStatus(data.status);
          if (data.status === 'paid' || data.status === 'preparing' || data.status === 'ready' || data.status === 'picked_up') {
            setIsPaid(true);
            if (intervalRef.current) clearInterval(intervalRef.current);
            setTimeout(() => router.push(`/track/${id}`), 1500);
          }
        }
      } catch {
        // ignore poll errors
      }
    };

    intervalRef.current = setInterval(pollStatus, 3000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [id, router]);

  const handleMockPay = () => {
    setIsPaid(true);
    if (intervalRef.current) clearInterval(intervalRef.current);
    setTimeout(() => router.push(`/track/${id}`), 1500);
  };

  return (
    <div className="min-h-screen bg-amber-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-amber-100 shadow-sm">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center gap-2">
          <Coffee className="w-5 h-5 text-amber-700" />
          <h1 className="text-base font-bold text-amber-900">결제</h1>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 max-w-md mx-auto w-full">
        {isPaid ? (
          /* Paid confirmation */
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
            {/* Order info */}
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

            {/* QR Code */}
            <div className="bg-white rounded-2xl shadow-sm border border-amber-100 p-6 w-full flex flex-col items-center">
              <h2 className="text-base font-bold text-amber-900 mb-1">토스로 결제하기</h2>
              <p className="text-xs text-gray-500 mb-5">QR 코드를 스캔하여 결제를 완료해 주세요</p>

              <div className="p-4 bg-white rounded-xl border-2 border-amber-200 shadow-inner">
                <QRCodeSVG
                  value={qrUrl}
                  size={200}
                  fgColor="#92400e"
                  bgColor="#ffffff"
                  level="M"
                />
              </div>

              {/* Polling indicator */}
              <div className="mt-6 flex items-center gap-2 text-amber-600">
                <div className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm font-medium">결제 대기 중...</p>
              </div>
              <p className="text-xs text-gray-400 mt-1">결제가 완료되면 자동으로 진행됩니다</p>
            </div>

            {/* Mock pay button for demo */}
            {isMock && (
              <button
                onClick={handleMockPay}
                className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-3.5 font-semibold transition-colors text-sm"
              >
                [데모] 결제 완료 시뮬레이션
              </button>
            )}
          </>
        )}
      </main>
    </div>
  );
}
