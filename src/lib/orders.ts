import { db } from './firebase';
import {
  doc,
  setDoc,
  updateDoc,
  onSnapshot,
  collection,
  query,
  orderBy,
} from 'firebase/firestore';
import { OrderItem, OrderStatus } from '@/types';

export interface FirebaseOrder {
  id: string;
  items: OrderItem[];
  totalPrice: number;
  status: OrderStatus;
  createdAt: string;
}

export async function createOrder(
  id: string,
  items: OrderItem[],
  totalPrice: number,
): Promise<void> {
  await setDoc(doc(db, 'orders', id), {
    id,
    items,
    totalPrice,
    status: 'pending',
    createdAt: new Date().toISOString(),
  });
}

export async function updateOrderStatus(id: string, status: OrderStatus): Promise<void> {
  await updateDoc(doc(db, 'orders', id), { status });
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
