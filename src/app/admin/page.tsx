'use client';

import { useEffect, useState } from 'react';
import { Coffee, CheckCircle2, Bell, Package, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { subscribeToAllOrders, updateOrderStatus, FirebaseOrder } from '@/lib/orders';
import { OrderStatus } from '@/types';
import { cn } from '@/lib/utils';

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
}

function OrderCard({ order }: { order: FirebaseOrder }) {
  const [loading, setLoading] = useState(false);
  const shortId = order.id.replace('order-', '').slice(-6);

  const advance = async (next: OrderStatus) => {
    setLoading(true);
    try { await updateOrderStatus(order.id, next); }
    finally { setLoading(false); }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="font-mono text-base font-bold text-gray-800">#{shortId}</span>
        <span className="text-xs text-gray-400 flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {formatTime(order.createdAt)}
        </span>
      </div>

      {/* Items */}
      <div className="bg-gray-50 rounded-xl px-3 py-2.5 space-y-1.5">
        {order.items.map((item, i) => (
          <div key={i} className="flex justify-between text-sm">
            <span className="text-gray-700 font-medium">{item.name} × {item.quantity}</span>
            <span className="text-gray-500">{(item.price * item.quantity).toLocaleString('ko-KR')}원</span>
          </div>
        ))}
        <div className="pt-1.5 border-t border-gray-200 flex justify-between text-sm font-bold">
          <span className="text-gray-700">합계</span>
          <span className="text-amber-700">{order.totalPrice.toLocaleString('ko-KR')}원</span>
        </div>
      </div>

      {/* Action button */}
      {order.status === 'pending' && (
        <button
          onClick={() => advance('paid')}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 text-white rounded-xl py-3.5 text-sm font-bold transition-colors"
        >
          <CheckCircle2 className="w-5 h-5" />
          송금 확인 완료
        </button>
      )}
      {order.status === 'paid' && (
        <button
          onClick={() => advance('preparing')}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 disabled:opacity-50 text-white rounded-xl py-3.5 text-sm font-bold transition-colors"
        >
          <Coffee className="w-5 h-5" />
          준비 시작
        </button>
      )}
      {order.status === 'preparing' && (
        <button
          onClick={() => advance('ready')}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 active:bg-green-800 disabled:opacity-50 text-white rounded-xl py-3.5 text-sm font-bold transition-colors"
        >
          <Bell className="w-5 h-5" />
          픽업 오세요! 호출
        </button>
      )}
      {order.status === 'ready' && (
        <button
          onClick={() => advance('picked_up')}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-50 text-white rounded-xl py-3.5 text-sm font-bold transition-colors"
        >
          <Package className="w-5 h-5" />
          수령 완료
        </button>
      )}
    </div>
  );
}

function KanbanColumn({
  title,
  icon,
  count,
  headerColor,
  orders,
  emptyText,
}: {
  title: string;
  icon: React.ReactNode;
  count: number;
  headerColor: string;
  orders: FirebaseOrder[];
  emptyText: string;
}) {
  return (
    <div className="flex flex-col min-h-0 border-b lg:border-b-0 lg:border-r border-gray-100 last:border-0">
      {/* Column header */}
      <div className={cn('flex items-center justify-between px-4 py-3 shrink-0', headerColor)}>
        <div className="flex items-center gap-2 font-bold text-sm">
          {icon}
          {title}
        </div>
        {count > 0 && (
          <span className="bg-white/70 rounded-full min-w-[1.5rem] h-6 flex items-center justify-center text-xs font-bold px-2">
            {count}
          </span>
        )}
      </div>

      {/* Cards */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-[120px] lg:min-h-0">
        {orders.length === 0 ? (
          <div className="flex items-center justify-center h-full min-h-[100px] text-gray-400 text-sm">
            {emptyText}
          </div>
        ) : (
          orders.map(order => <OrderCard key={order.id} order={order} />)
        )}
      </div>
    </div>
  );
}

export default function AdminPage() {
  const [orders, setOrders] = useState<FirebaseOrder[]>([]);
  const [connected, setConnected] = useState(false);
  const [showDone, setShowDone] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToAllOrders((all) => {
      setOrders(all);
      setConnected(true);
    });
    return unsubscribe;
  }, []);

  const pending = orders.filter(o => o.status === 'pending');
  const active = orders.filter(o => o.status === 'paid' || o.status === 'preparing');
  const ready = orders.filter(o => o.status === 'ready');
  const done = orders.filter(o => o.status === 'picked_up');
  const totalActive = pending.length + active.length + ready.length;

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
      {/* Header */}
      <header className="shrink-0 bg-white border-b border-gray-200 shadow-sm">
        <div className="px-4 lg:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-amber-100 rounded-xl flex items-center justify-center">
              <Coffee className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <h1 className="text-base font-bold text-gray-900 leading-tight">관리자 대시보드</h1>
              <p className="text-xs text-gray-500">진행 중 주문 {totalActive}건</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Stats pills - iPad landscape only */}
            <div className="hidden lg:flex items-center gap-2">
              <span className="bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-full">
                송금대기 {pending.length}
              </span>
              <span className="bg-amber-50 text-amber-700 text-xs font-semibold px-3 py-1.5 rounded-full">
                준비중 {active.length}
              </span>
              <span className="bg-green-50 text-green-700 text-xs font-semibold px-3 py-1.5 rounded-full">
                픽업대기 {ready.length}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className={cn('w-2 h-2 rounded-full', connected ? 'bg-green-500 animate-pulse' : 'bg-gray-300')} />
              <span className="text-xs text-gray-500 hidden sm:inline">{connected ? '실시간 연결' : '연결 중...'}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Kanban board */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        <KanbanColumn
          title="송금 대기"
          icon={<span className="text-base">💳</span>}
          count={pending.length}
          headerColor="bg-blue-50 text-blue-800"
          orders={pending}
          emptyText="송금 대기 없음"
        />
        <KanbanColumn
          title="준비 중"
          icon={<span className="text-base">☕</span>}
          count={active.length}
          headerColor="bg-amber-50 text-amber-800"
          orders={active}
          emptyText="준비 중인 주문 없음"
        />
        <KanbanColumn
          title="픽업 대기"
          icon={<span className="text-base">🔔</span>}
          count={ready.length}
          headerColor="bg-green-50 text-green-800"
          orders={ready}
          emptyText="픽업 대기 없음"
        />
      </div>

      {/* Completed orders - collapsible footer */}
      {done.length > 0 && (
        <div className="shrink-0 bg-white border-t border-gray-100">
          <button
            onClick={() => setShowDone(v => !v)}
            className="w-full flex items-center justify-between px-4 lg:px-6 py-3 text-sm text-gray-500 hover:bg-gray-50 transition-colors"
          >
            <span className="font-medium">완료된 주문 {done.length}건</span>
            {showDone ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
          {showDone && (
            <div className="px-3 pb-3 grid grid-cols-1 lg:grid-cols-3 gap-3 max-h-60 overflow-y-auto opacity-60">
              {done.map(order => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
