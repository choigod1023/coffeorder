'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Coffee, Bell, X, CheckCircle2, Clock } from 'lucide-react';
import Link from 'next/link';
import { OrderStatus } from '@/types';
import OrderStatusTracker from '@/components/OrderStatus';
import { subscribeToOrder, cancelOrder, subscribeToWaitQueueCount, FirebaseOrder } from '@/lib/orders';
import { clearActiveOrder } from '@/lib/activeOrder';
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
  cancelled: '주문이 취소되었습니다',
};

const STATUS_BG: Record<OrderStatus, string> = {
  pending: 'bg-gray-100',
  paid: 'bg-blue-50',
  preparing: 'bg-sage-50',
  ready: 'bg-green-50',
  picked_up: 'bg-emerald-50',
  cancelled: 'bg-red-50',
};

function getWaitTimeText(count: number): string {
  if (count === 0) return '약 3~5분';
  if (count <= 2) return '약 6~10분';
  if (count <= 4) return '약 11~15분';
  return '약 15~20분';
}

function StatusIcon({ status }: { status: OrderStatus }) {
  if (status === 'cancelled') return <X className="w-6 h-6 text-red-500" />;
  if (status === 'preparing') return <Coffee className="w-6 h-6 text-sage-600 animate-pulse" />;
  if (status === 'ready') return <Bell className="w-6 h-6 text-green-600" />;
  if (status === 'picked_up') return <CheckCircle2 className="w-6 h-6 text-emerald-600" />;
  return <Coffee className="w-6 h-6 text-sage-600" />;
}

export default function TrackPage({ params }: Props) {
  const { id } = use(params);
  const router = useRouter();
  const [order, setOrder] = useState<FirebaseOrder | null>(null);
  const [showReadyBanner, setShowReadyBanner] = useState(false);
  const [waitQueueCount, setWaitQueueCount] = useState(0);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToOrder(id, (o) => {
      setOrder(o);
      if (o.status === 'ready') setShowReadyBanner(true);
      if (o.status === 'picked_up' || o.status === 'cancelled') {
        clearActiveOrder();
      }
      if (o.status === 'picked_up') {
        setTimeout(() => router.push(`/complete/${id}`), 1500);
      }
    });
    return unsubscribe;
  }, [id, router]);

  useEffect(() => {
    const unsubscribe = subscribeToWaitQueueCount(setWaitQueueCount);
    return unsubscribe;
  }, []);

  const handleCancel = async () => {
    setIsCancelling(true);
    try {
      await cancelOrder(id);
      setShowCancelModal(false);
    } catch {
      alert('취소 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsCancelling(false);
    }
  };

  const status = order?.status ?? 'pending';
  const canCancel = status === 'pending' || status === 'paid';

  return (
    <div className="min-h-screen bg-sage-50 flex flex-col">
      <header className="bg-white border-b border-sage-100 shadow-sm">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <Coffee className="w-5 h-5 text-sage-700" />
            <h1 className="text-base font-bold text-sage-900">주문 현황</h1>
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-md mx-auto w-full px-4 py-6 flex flex-col gap-4">
        {showReadyBanner && (
          <div className="bg-green-500 text-white rounded-2xl p-4 flex items-center gap-3 shadow-lg animate-in slide-in-from-top-4 duration-500">
            <Bell className="w-6 h-6 flex-shrink-0 animate-bounce" />
            <div>
              <p className="font-bold text-base">음료가 준비되었습니다!</p>
              <p className="text-green-100 text-sm">카운터에서 수령해주세요</p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-sage-100 shadow-sm px-5 py-4">
          {order?.customerName && (
            <p className="font-bold text-sage-800 text-lg mb-1">{order.customerName}님의 주문</p>
          )}
          <p className="text-xs text-gray-500">주문번호</p>
          <p className="font-mono text-sm font-semibold text-gray-800">{id}</p>
        </div>

        {(status === 'pending' || status === 'paid') && (
          <div className="bg-sage-100/60 border border-sage-200 rounded-xl px-4 py-3 flex items-center gap-3">
            <Clock className="w-5 h-5 text-sage-600 flex-shrink-0" />
            <div>
              <p className="text-xs text-sage-700 font-medium">예상 대기 시간</p>
              <p className="text-base font-bold text-sage-900">{getWaitTimeText(waitQueueCount)}</p>
            </div>
          </div>
        )}

        <div className={cn('rounded-2xl border border-transparent shadow-sm p-5 transition-colors duration-500', STATUS_BG[status])}>
          <div className="flex items-start gap-4 mb-5">
            <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center flex-shrink-0">
              <StatusIcon status={status} />
            </div>
            <div>
              <h2 className="font-bold text-gray-900 text-base">{STATUS_MESSAGES[status]}</h2>
            </div>
          </div>
          <OrderStatusTracker status={status} />
        </div>

        {canCancel && (
          <button
            onClick={() => setShowCancelModal(true)}
            className="w-full py-4 rounded-xl border-2 border-red-200 text-red-500 text-sm font-medium hover:bg-red-50 transition-colors"
          >
            주문 취소 요청
          </button>
        )}

        {status !== 'picked_up' && status !== 'cancelled' && (
          <div className="flex items-center justify-center gap-2 text-gray-400 text-xs">
            <div className="w-3 h-3 border border-gray-300 border-t-transparent rounded-full animate-spin" />
            <span>실시간으로 상태를 확인하고 있습니다</span>
          </div>
        )}

        {order?.items && (
          <div className="bg-white rounded-2xl border border-sage-100 shadow-sm px-5 py-4">
            <p className="text-xs text-gray-500 font-medium mb-2">주문 내역</p>
            {order.items.map((item, i) => (
              <div key={i} className="flex justify-between text-sm py-1">
                <span className="text-gray-700">{item.name} × {item.quantity}</span>
                <span className="text-gray-500">{(item.price * item.quantity).toLocaleString('ko-KR')}원</span>
              </div>
            ))}
            <div className="flex justify-between text-sm font-bold pt-2 border-t border-gray-100 mt-1">
              <span className="text-gray-700">합계</span>
              <span className="text-sage-700">{order.totalPrice.toLocaleString('ko-KR')}원</span>
            </div>
          </div>
        )}

        <div className="bg-sage-100/50 rounded-xl p-4">
          <p className="text-xs text-sage-800 font-medium mb-1">안내</p>
          <ul className="text-xs text-sage-700 space-y-1">
            <li>• 음료 준비 시 알림이 표시됩니다</li>
            <li>• 이 화면을 닫지 마세요</li>
            <li>• 수령 후 자동으로 다음 페이지로 이동합니다</li>
          </ul>
        </div>
      </main>

      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => { if (!isCancelling) setShowCancelModal(false); }}
          />
          <div className="relative bg-white rounded-3xl shadow-2xl p-6 w-full max-w-sm">
            <div className="text-center mb-5">
              <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <X className="w-7 h-7 text-red-500" />
              </div>
              <h2 className="text-lg font-bold text-gray-900">주문을 취소하시겠어요?</h2>
              <p className="text-sm text-gray-500 mt-1">환불은 관리자가 토스로 직접 송금해드립니다</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowCancelModal(false)}
                disabled={isCancelling}
                className="flex-1 py-4 rounded-xl border-2 border-gray-200 text-gray-500 font-bold text-sm hover:bg-gray-50 disabled:opacity-50"
              >
                돌아가기
              </button>
              <button
                onClick={handleCancel}
                disabled={isCancelling}
                className="flex-1 py-4 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-sm disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isCancelling ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : '취소하기'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
