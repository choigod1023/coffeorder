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

export function subscribeToWaitQueueCount(
  callback: (cups: number) => void,
): () => void {
  const q = query(collection(db, 'orders'), orderBy('createdAt', 'asc'));
  return onSnapshot(q, (snap) => {
    const cups = snap.docs
      .filter((d) => {
        const s = d.data().status as OrderStatus;
        return s === 'pending' || s === 'paid' || s === 'preparing';
      })
      .reduce((total, d) => {
        const items = d.data().items as OrderItem[];
        return total + items.reduce((s, i) => s + (i.quantity ?? 0), 0);
      }, 0);
    callback(cups);
  });
}

export function calcWaitTimeText(queueCups: number, myCartCups = 0): string {
  const total = queueCups + myCartCups;
  if (total <= 4)  return '약 3~5분';
  if (total <= 8)  return '약 6~10분';
  if (total <= 12) return '약 11~15분';
  return '약 15~20분';
}
