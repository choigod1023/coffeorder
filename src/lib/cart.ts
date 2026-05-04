import { CartItem } from '@/types';

const CART_KEY = 'scc_cart';

export function getCart(): CartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) ?? '[]') as CartItem[];
  } catch {
    return [];
  }
}

export function saveCart(cart: CartItem[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}
