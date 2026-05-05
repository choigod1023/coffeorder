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
  return onSnapshot(doc(db, 'orders', id), (snap) => {
    if (snap.exists()) callback(snap.data() as FirebaseOrder);
  });
}

export function subscribeToAllOrders(
  callback: (orders: FirebaseOrder[]) => void,
): () => void {
  const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => d.data() as FirebaseOrder));
  });
}

export function subscribeToWaitQueueCount(
  callback: (count: number) => void,
): () => void {
  const q = query(collection(db, 'orders'), orderBy('createdAt', 'asc'));
  return onSnapshot(q, (snap) => {
    const count = snap.docs.filter((d) => {
      const s = d.data().status as OrderStatus;
      return s === 'paid' || s === 'preparing';
    }).length;
    callback(count);
  });
}
