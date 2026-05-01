'use client';

import { useEffect, useState } from 'react';
import {
  Coffee, CheckCircle2, Bell, Package, Clock,
  ChevronDown, ChevronUp, Download, X as XIcon,
} from 'lucide-react';
import { subscribeToAllOrders, updateOrderStatus, cancelOrder, FirebaseOrder } from '@/lib/orders';
import { OrderStatus } from '@/types';
import { cn } from '@/lib/utils';

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
}

const STATUS_LABEL: Record<OrderStatus, string> = {
  pending: '송금대기',
  paid: '결제완료',
  preparing: '준비중',
  ready: '수령대기',
  picked_up: '수령완료',
  cancelled: '취소됨',
};

function exportToCSV(orders: FirebaseOrder[]) {
  const headers = ['주문번호', '고객이름', '주문시간', '메뉴', '합계금액', '상태'];
  const rows = orders.map((o) => {
    const menuStr = o.items.map((i) => `${i.name}×${i.quantity}`).join(' / ');
    return [
      o.id,
      o.customerName || '-',
      new Date(o.createdAt).toLocaleString('ko-KR'),
      menuStr,
      o.totalPrice,
      STATUS_LABEL[o.status],
    ].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',');
  });

  const csv = '﻿' + [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const dateStr = new Date().toLocaleDateString('ko-KR').replace(/\.\s?/g, '').replace(/\s/g, '');
  a.download = `scc_orders_${dateStr}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function OrderCard({ order, onCancel }: { order: FirebaseOrder; onCancel: (id: string) => void }) {
  const [loading, setLoading] = useState(false);
  const shortId = order.id.replace('order-', '').slice(-6);

  const advance = async (next: OrderStatus) => {
    setLoading(true);
    try { await updateOrderStatus(order.id, next); }
    finally { setLoading(false); }
  };

  const isCancelled = order.status === 'cancelled';
  const canCancel = order.status === 'pending' || order.status === 'paid';

  return (
    <div className={cn(
      'bg-white rounded-2xl border shadow-sm p-4 flex flex-col gap-3',
      isCancelled ? 'border-red-100 opacity-60' : 'border-gray-100',
    )}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-mono text-base font-bold text-gray-800">#{shortId}</span>
          {order.customerName && (
            <span className="text-base font-bold text-amber-700">{order.customerName}</span>
          )}
        </div>
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

      {/* Cancelled label */}
      {isCancelled && (
        <div className="text-center text-sm font-bold text-red-500 py-1">취소된 주문</div>
      )}

      {/* Action buttons */}
      {!isCancelled && (
        <div className="flex flex-col gap-2">
          {order.status === 'pending' && (
            <button
              onClick={() => advance('paid')}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl py-3.5 text-sm font-bold transition-colors"
            >
              <CheckCircle2 className="w-5 h-5" />
              송금 확인 완료
            </button>
          )}
          {order.status === 'paid' && (
            <button
              onClick={() => advance('preparing')}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white rounded-xl py-3.5 text-sm font-bold transition-colors"
            >
              <Coffee className="w-5 h-5" />
              준비 시작
            </button>
          )}
          {order.status === 'preparing' && (
            <button
              onClick={() => advance('ready')}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-xl py-3.5 text-sm font-bold transition-colors"
            >
              <Bell className="w-5 h-5" />
              픽업 오세요! 호출
            </button>
          )}
          {order.status === 'ready' && (
            <button
              onClick={() => advance('picked_up')}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl py-3.5 text-sm font-bold transition-colors"
            >
              <Package className="w-5 h-5" />
              수령 완료
            </button>
          )}
          {canCancel && (
            <button
              onClick={() => onCancel(order.id)}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 border border-red-200 text-red-500 hover:bg-red-50 disabled:opacity-50 rounded-xl py-2.5 text-xs font-medium transition-colors"
            >
              <XIcon className="w-4 h-4" />
              주문 취소
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function KanbanColumn({
  title, icon, count, headerColor, orders, emptyText, onCancel,
}: {
  title: string;
  icon: React.ReactNode;
  count: number;
  headerColor: string;
  orders: FirebaseOrder[];
  emptyText: string;
  onCancel: (id: string) => void;
}) {
  return (
    <div className="flex flex-col min-h-0 border-b lg:border-b-0 lg:border-r border-gray-100 last:border-0">
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
      <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-[120px] lg:min-h-0">
        {orders.length === 0 ? (
          <div className="flex items-center justify-center h-full min-h-[100px] text-gray-400 text-sm">
            {emptyText}
          </div>
        ) : (
          orders.map((order) => <OrderCard key={order.id} order={order} onCancel={onCancel} />)
        )}
      </div>
    </div>
  );
}

export default function AdminPage() {
  const [orders, setOrders] = useState<FirebaseOrder[]>([]);
  const [connected, setConnected] = useState(false);
  const [showDone, setShowDone] = useState(false);
  const [cancelTargetId, setCancelTargetId] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToAllOrders((all) => {
      setOrders(all);
      setConnected(true);
    });
    return unsubscribe;
  }, []);

  const handleCancelConfirm = async () => {
    if (!cancelTargetId) return;
    setIsCancelling(true);
    try {
      await cancelOrder(cancelTargetId);
      setCancelTargetId(null);
    } finally {
      setIsCancelling(false);
    }
  };

  const pending = orders.filter((o) => o.status === 'pending');
  const active = orders.filter((o) => o.status === 'paid' || o.status === 'preparing');
  const ready = orders.filter((o) => o.status === 'ready');
  const done = orders.filter((o) => o.status === 'picked_up' || o.status === 'cancelled');
  const totalActive = pending.length + active.length + ready.length;

  const completedOrders = orders.filter((o) => o.status === 'picked_up');
  const totalRevenue = completedOrders.reduce((sum, o) => sum + o.totalPrice, 0);
  const totalCups = completedOrders.reduce((sum, o) => o.items.reduce((s, i) => s + i.quantity, 0) + sum, 0);

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
              <p className="text-xs text-gray-500">진행 중 {totalActive}건 · 완료 {completedOrders.length}건 · {totalRevenue.toLocaleString('ko-KR')}원</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => exportToCSV(orders)}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-2 rounded-xl transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              장부 저장
            </button>
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

        {/* Stats bar */}
        <div className="px-4 lg:px-6 pb-3 flex gap-4 text-xs text-gray-500">
          <span>총 {completedOrders.length}건 수령 완료</span>
          <span>·</span>
          <span>{totalCups}잔 제조</span>
          <span>·</span>
          <span className="font-semibold text-amber-700">{totalRevenue.toLocaleString('ko-KR')}원</span>
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
          onCancel={setCancelTargetId}
        />
        <KanbanColumn
          title="준비 중"
          icon={<span className="text-base">☕</span>}
          count={active.length}
          headerColor="bg-amber-50 text-amber-800"
          orders={active}
          emptyText="준비 중인 주문 없음"
          onCancel={setCancelTargetId}
        />
        <KanbanColumn
          title="픽업 대기"
          icon={<span className="text-base">🔔</span>}
          count={ready.length}
          headerColor="bg-green-50 text-green-800"
          orders={ready}
          emptyText="픽업 대기 없음"
          onCancel={setCancelTargetId}
        />
      </div>

      {/* Completed + cancelled footer */}
      {done.length > 0 && (
        <div className="shrink-0 bg-white border-t border-gray-100">
          <button
            onClick={() => setShowDone((v) => !v)}
            className="w-full flex items-center justify-between px-4 lg:px-6 py-3 text-sm text-gray-500 hover:bg-gray-50 transition-colors"
          >
            <span className="font-medium">완료·취소 {done.length}건</span>
            {showDone ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
          {showDone && (
            <div className="px-3 pb-3 grid grid-cols-1 lg:grid-cols-3 gap-3 max-h-60 overflow-y-auto opacity-70">
              {done.map((order) => (
                <OrderCard key={order.id} order={order} onCancel={setCancelTargetId} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Cancel confirm modal */}
      {cancelTargetId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => { if (!isCancelling) setCancelTargetId(null); }}
          />
          <div className="relative bg-white rounded-3xl shadow-2xl p-6 w-full max-w-sm">
            <div className="text-center mb-5">
              <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <XIcon className="w-7 h-7 text-red-500" />
              </div>
              <h2 className="text-lg font-bold text-gray-900">주문을 취소하시겠어요?</h2>
              <p className="text-sm text-gray-500 mt-1">고객 화면에 취소 상태가 표시됩니다<br />환불은 토스 앱에서 직접 송금해주세요</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCancelTargetId(null)}
                disabled={isCancelling}
                className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-500 font-bold text-sm hover:bg-gray-50 disabled:opacity-50"
              >
                돌아가기
              </button>
              <button
                onClick={handleCancelConfirm}
                disabled={isCancelling}
                className="flex-1 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-sm disabled:opacity-50 flex items-center justify-center gap-2"
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
