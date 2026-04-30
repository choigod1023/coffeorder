'use client';

import { useEffect, useState } from 'react';
import { Coffee, CheckCircle2, Bell, Package, Clock } from 'lucide-react';
import { subscribeToAllOrders, updateOrderStatus, FirebaseOrder } from '@/lib/orders';
import { OrderStatus } from '@/types';
import { cn } from '@/lib/utils';

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: '송금 대기',
  paid: '결제 완료',
  preparing: '준비 중',
  ready: '픽업 대기',
  picked_up: '수령 완료',
};

const STATUS_COLORS: Record<OrderStatus, string> = {
  pending: 'bg-gray-100 text-gray-600',
  paid: 'bg-blue-100 text-blue-700',
  preparing: 'bg-amber-100 text-amber-700',
  ready: 'bg-green-100 text-green-700',
  picked_up: 'bg-gray-50 text-gray-400',
};

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
}

function OrderCard({ order }: { order: FirebaseOrder }) {
  const [loading, setLoading] = useState(false);

  const advance = async (next: OrderStatus) => {
    setLoading(true);
    try {
      await updateOrderStatus(order.id, next);
    } finally {
      setLoading(false);
    }
  };

  const shortId = order.id.replace('order-', '').slice(-6);

  return (
    <div className={cn(
      'bg-white rounded-2xl border shadow-sm p-4 flex flex-col gap-3 transition-opacity',
      order.status === 'picked_up' && 'opacity-50',
    )}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-400">주문</p>
          <p className="font-mono text-sm font-bold text-gray-800">#{shortId}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={cn('text-xs font-semibold px-2.5 py-1 rounded-full', STATUS_COLORS[order.status])}>
            {STATUS_LABELS[order.status]}
          </span>
          <span className="text-xs text-gray-400 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatTime(order.createdAt)}
          </span>
        </div>
      </div>

      {/* Items */}
      <div className="bg-gray-50 rounded-xl px-3 py-2 space-y-1">
        {order.items.map((item, i) => (
          <div key={i} className="flex justify-between text-sm">
            <span className="text-gray-700">{item.name} × {item.quantity}</span>
            <span className="text-gray-500">{(item.price * item.quantity).toLocaleString('ko-KR')}원</span>
          </div>
        ))}
        <div className="pt-1 border-t border-gray-200 flex justify-between text-sm font-bold">
          <span className="text-gray-800">합계</span>
          <span className="text-amber-700">{order.totalPrice.toLocaleString('ko-KR')}원</span>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2">
        {order.status === 'pending' && (
          <button
            onClick={() => advance('paid')}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-xl py-2.5 text-sm font-semibold transition-colors"
          >
            <CheckCircle2 className="w-4 h-4" />
            송금 확인 완료
          </button>
        )}
        {order.status === 'paid' && (
          <button
            onClick={() => advance('preparing')}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white rounded-xl py-2.5 text-sm font-semibold transition-colors"
          >
            <Coffee className="w-4 h-4" />
            준비 시작
          </button>
        )}
        {order.status === 'preparing' && (
          <button
            onClick={() => advance('ready')}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white rounded-xl py-2.5 text-sm font-semibold transition-colors"
          >
            <Bell className="w-4 h-4" />
            픽업 오세요! 호출
          </button>
        )}
        {order.status === 'ready' && (
          <button
            onClick={() => advance('picked_up')}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white rounded-xl py-2.5 text-sm font-semibold transition-colors"
          >
            <Package className="w-4 h-4" />
            수령 완료
          </button>
        )}
        {order.status === 'picked_up' && (
          <div className="flex-1 text-center text-sm text-gray-400 py-2.5">완료됨</div>
        )}
      </div>
    </div>
  );
}

export default function AdminPage() {
  const [orders, setOrders] = useState<FirebaseOrder[]>([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToAllOrders((all) => {
      setOrders(all);
      setConnected(true);
    });
    return unsubscribe;
  }, []);

  const active = orders.filter(o => o.status !== 'picked_up');
  const done = orders.filter(o => o.status === 'picked_up');

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Coffee className="w-5 h-5 text-amber-700" />
            <h1 className="text-base font-bold text-gray-900">관리자 — 주문 현황</h1>
          </div>
          <div className="flex items-center gap-1.5">
            <div className={cn('w-2 h-2 rounded-full', connected ? 'bg-green-500 animate-pulse' : 'bg-gray-300')} />
            <span className="text-xs text-gray-500">{connected ? '실시간 연결' : '연결 중...'}</span>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Active orders */}
        <section>
          <h2 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <span className="w-2 h-2 bg-amber-500 rounded-full" />
            진행 중인 주문 ({active.length})
          </h2>
          {active.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-8 text-center text-gray-400 text-sm">
              진행 중인 주문이 없습니다
            </div>
          ) : (
            <div className="space-y-3">
              {active.map(order => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          )}
        </section>

        {/* Completed orders */}
        {done.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold text-gray-400 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 bg-gray-300 rounded-full" />
              완료된 주문 ({done.length})
            </h2>
            <div className="space-y-3">
              {done.map(order => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
