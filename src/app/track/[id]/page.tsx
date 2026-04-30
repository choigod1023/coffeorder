'use client';

import { use, useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Coffee, Bell } from 'lucide-react';
import { OrderStatus } from '@/types';
import OrderStatusTracker from '@/components/OrderStatus';
import { cn } from '@/lib/utils';

interface Props {
  params: Promise<{ id: string }>;
}

const STATUS_MESSAGES: Record<OrderStatus, string> = {
  pending: '주문이 접수되었습니다',
  paid: '결제가 완료되었습니다. 음료를 준비합니다!',
  preparing: '바리스타가 음료를 열심히 만들고 있어요',
  ready: '음료가 준비되었습니다! 수령해주세요',
  picked_up: '주문이 완료되었습니다. 감사합니다!',
};

const STATUS_TIPS: Record<OrderStatus, string> = {
  pending: '잠시만 기다려 주세요...',
  paid: '보통 5~10분 정도 소요됩니다',
  preparing: '곧 준비될 예정입니다',
  ready: '카운터에서 음료를 받아가세요',
  picked_up: '맛있게 드세요!',
};

export default function TrackPage({ params }: Props) {
  const { id } = use(params);
  const router = useRouter();
  const [status, setStatus] = useState<OrderStatus>('paid');
  const [prevStatus, setPrevStatus] = useState<OrderStatus>('paid');
  const [showReadyBanner, setShowReadyBanner] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Demo progression for mock orders
  const demoIndexRef = useRef(0);
  const demoStatuses: OrderStatus[] = ['paid', 'preparing', 'ready', 'picked_up'];

  useEffect(() => {
    const pollStatus = async () => {
      try {
        const res = await fetch(`/api/orders/${id}/status`);
        if (res.ok) {
          const data = await res.json();
          const newStatus: OrderStatus = data.status;
          setPrevStatus(s => s);
          setStatus(prev => {
            if (prev !== newStatus) setPrevStatus(prev);
            return newStatus;
          });

          if (newStatus === 'ready') {
            setShowReadyBanner(true);
          }

          if (newStatus === 'picked_up') {
            if (intervalRef.current) clearInterval(intervalRef.current);
            setTimeout(() => router.push(`/complete/${id}`), 1500);
          }
        } else {
          // Mock progression for demo
          demoIndexRef.current = Math.min(demoIndexRef.current + 1, demoStatuses.length - 1);
          const next = demoStatuses[demoIndexRef.current];
          setStatus(prev => {
            setPrevStatus(prev);
            return next;
          });
          if (next === 'ready') setShowReadyBanner(true);
          if (next === 'picked_up') {
            if (intervalRef.current) clearInterval(intervalRef.current);
            setTimeout(() => router.push(`/complete/${id}`), 1500);
          }
        }
      } catch {
        // Mock progression fallback
        demoIndexRef.current = Math.min(demoIndexRef.current + 1, demoStatuses.length - 1);
        const next = demoStatuses[demoIndexRef.current];
        setStatus(prev => {
          setPrevStatus(prev);
          return next;
        });
        if (next === 'ready') setShowReadyBanner(true);
        if (next === 'picked_up') {
          if (intervalRef.current) clearInterval(intervalRef.current);
          setTimeout(() => router.push(`/complete/${id}`), 1500);
        }
      }
    };

    intervalRef.current = setInterval(pollStatus, 3000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [id, router]);

  const statusBgColors: Record<OrderStatus, string> = {
    pending: 'bg-gray-100',
    paid: 'bg-blue-50',
    preparing: 'bg-amber-50',
    ready: 'bg-green-50',
    picked_up: 'bg-emerald-50',
  };

  const statusIconColors: Record<OrderStatus, string> = {
    pending: 'text-gray-500',
    paid: 'text-blue-600',
    preparing: 'text-amber-600',
    ready: 'text-green-600',
    picked_up: 'text-emerald-600',
  };

  return (
    <div className="min-h-screen bg-amber-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-amber-100 shadow-sm">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center gap-2">
          <Coffee className="w-5 h-5 text-amber-700" />
          <h1 className="text-base font-bold text-amber-900">주문 현황</h1>
        </div>
      </header>

      <main className="flex-1 max-w-md mx-auto w-full px-4 py-6 flex flex-col gap-4">
        {/* Ready banner */}
        {showReadyBanner && (
          <div className="bg-green-500 text-white rounded-2xl p-4 flex items-center gap-3 shadow-lg animate-in slide-in-from-top-4 duration-500">
            <Bell className="w-6 h-6 flex-shrink-0 animate-bounce" />
            <div>
              <p className="font-bold text-base">음료가 준비되었습니다!</p>
              <p className="text-green-100 text-sm">카운터에서 수령해주세요</p>
            </div>
          </div>
        )}

        {/* Order number */}
        <div className="bg-white rounded-2xl border border-amber-100 shadow-sm px-5 py-4">
          <p className="text-xs text-gray-500 mb-1">주문번호</p>
          <p className="font-mono text-sm font-semibold text-gray-800">{id}</p>
        </div>

        {/* Status card */}
        <div className={cn('rounded-2xl border border-transparent shadow-sm p-5 transition-colors duration-500', statusBgColors[status])}>
          <div className="flex items-start gap-4 mb-5">
            <div className={cn('w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center flex-shrink-0', statusIconColors[status])}>
              {status === 'preparing' ? (
                <span className="text-2xl animate-pulse">☕</span>
              ) : status === 'ready' ? (
                <span className="text-2xl">🎉</span>
              ) : status === 'picked_up' ? (
                <span className="text-2xl">✅</span>
              ) : (
                <Coffee className="w-6 h-6" />
              )}
            </div>
            <div>
              <h2 className="font-bold text-gray-900 text-base">{STATUS_MESSAGES[status]}</h2>
              <p className="text-gray-500 text-sm mt-0.5">{STATUS_TIPS[status]}</p>
            </div>
          </div>

          {/* Progress tracker */}
          <OrderStatusTracker status={status} />
        </div>

        {/* Polling indicator */}
        {status !== 'picked_up' && (
          <div className="flex items-center justify-center gap-2 text-gray-400 text-xs">
            <div className="w-3 h-3 border border-gray-300 border-t-transparent rounded-full animate-spin" />
            <span>실시간으로 상태를 확인하고 있습니다</span>
          </div>
        )}

        {/* Info card */}
        <div className="bg-amber-100/50 rounded-xl p-4">
          <p className="text-xs text-amber-800 font-medium mb-1">안내</p>
          <ul className="text-xs text-amber-700 space-y-1">
            <li>• 음료 준비 시 알림이 표시됩니다</li>
            <li>• 이 화면을 닫지 마세요</li>
            <li>• 수령 후 자동으로 다음 페이지로 이동합니다</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
