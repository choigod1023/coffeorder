import { db } from './firebase';
import {
  doc,
  setDoc,
  updateDoc,
  onSnapshot,
  getDoc,
  runTransaction,
  collection,
  query,
  orderBy,
} from 'firebase/firestore';
import { OrderItem, OrderStatus } from '@/types';

export interface FirebaseOrder {
  id: string;
  customerName: string;
  items: OrderItem[];
  totalPrice: number;
  status: OrderStatus;
  paymentMethod?: 'toss' | 'cash';
  createdAt: string;
}

async function generateOrderId(): Promise<string> {
  const counterRef = doc(db, 'meta', 'orderCounter');
  const num = await runTransaction(db, async (tx) => {
    const snap = await tx.get(counterRef);
    const next = (snap.exists() ? (snap.data().count as number) : 0) + 1;
    tx.set(counterRef, { count: next });
    return next;
  });
  return `F${String(num).padStart(3, '0')}`;
}

export async function createOrder(
  customerName: string,
  items: OrderItem[],
  totalPrice: number,
): Promise<string> {
  const id = await generateOrderId();
  await setDoc(doc(db, 'orders', id), {
    id,
    customerName,
    items,
    totalPrice,
    status: 'pending',
    createdAt: new Date().toISOString(),
  });
  return id;
}

export async function updateOrderStatus(id: string, status: OrderStatus): Promise<void> {
  await updateDoc(doc(db, 'orders', id), { status });
}

export async function confirmCashPayment(id: string): Promise<void> {
  await updateDoc(doc(db, 'orders', id), { status: 'paid', paymentMethod: 'cash' });
}

export async function cancelOrder(id: string): Promise<void> {
  await updateDoc(doc(db, 'orders', id), { status: 'cancelled' });
}


export async function getOrderStatus(id: string): Promise<OrderStatus | null> {
  const snap = await getDoc(doc(db, 'orders', id));
  if (!snap.exists()) return null;
  return (snap.data() as FirebaseOrder).status;
}

export function subscribeToOrder(
  id: string,
  callback: (order: FirebaseOrder) => void,
): () => void {
  let unsub: (() => void) | undefined;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let alive = true;

  function connect() {
    unsub = onSnapshot(
      doc(db, 'orders', id),
      (snap) => { if (snap.exists()) callback(snap.data() as FirebaseOrder); },
      (err) => {
        console.error('subscribeToOrder error, retrying:', err);
        if (alive) timer = setTimeout(connect, 3000);
      },
    );
  }
  connect();

  return () => {
    alive = false;
    clearTimeout(timer);
    unsub?.();
  };
}

export function subscribeToAllOrders(
  callback: (orders: FirebaseOrder[]) => void,
): () => void {
  let unsub: (() => void) | undefined;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let alive = true;
  const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));

  function connect() {
    unsub = onSnapshot(
      q,
      (snap) => { callback(snap.docs.map((d) => d.data() as FirebaseOrder)); },
      (err) => {
        console.error('subscribeToAllOrders error, retrying:', err);
        if (alive) timer = setTimeout(connect, 3000);
      },
    );
  }
  connect();

  return () => {
    alive = false;
    clearTimeout(timer);
    unsub?.();
  };
}

export interface QueueCounts {
  hangsang: number;
  pureun: number;
  namu: number;
}

export function subscribeToWaitQueueCount(
  callback: (counts: QueueCounts) => void,
): () => void {
  const q = query(collection(db, 'orders'), orderBy('createdAt', 'asc'));
  return onSnapshot(q, (snap) => {
    const counts: QueueCounts = { hangsang: 0, pureun: 0, namu: 0 };
    snap.docs
      .filter((d) => {
        const s = d.data().status as OrderStatus;
        return s === 'pending' || s === 'paid' || s === 'preparing';
      })
      .forEach((d) => {
        const items = d.data().items as OrderItem[];
        items.forEach((item) => {
          const qty = item.quantity ?? 0;
          if (item.menuItemId === 'hangsang') counts.hangsang += qty;
          else if (item.menuItemId === 'pureun') counts.pureun += qty;
          else if (item.menuItemId === 'namu') counts.namu += qty;
        });
      });
    callback(counts);
  });
}

// 대기시간 = max(항상잔수, 푸른잔수, ceil(나무잔수/2)) × 3분
// 항상·푸른: 바리스타 1인이 1잔당 3분 / 나무: 에이드 2잔당 3분
export function calcWaitTimeText(queue: QueueCounts, cart: QueueCounts = { hangsang: 0, pureun: 0, namu: 0 }): string {
  const A = queue.hangsang + cart.hangsang;
  const B = queue.pureun + cart.pureun;
  const C = queue.namu + cart.namu;
  const bottleneck = Math.max(A, B, Math.ceil(C / 2));
  const minutes = bottleneck * 3;
  if (minutes === 0) return '즉시 준비';
  return `약 ${minutes}분`;
}
