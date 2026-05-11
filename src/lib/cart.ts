import { CartItem } from '@/types';

const CART_KEY = 'scc_cart';

export function getCart(): CartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = JSON.parse(localStorage.getItem(CART_KEY) ?? '[]') as CartItem[];
    return raw.map((item) => ({
      ...item,
      quantity: Math.min(Math.max(Math.trunc(Number(item.quantity) || 1), 1), 10),
    }));
  } catch {
    return [];
  }
}

export function saveCart(cart: CartItem[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}
