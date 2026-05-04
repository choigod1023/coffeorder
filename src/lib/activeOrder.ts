const KEY = 'scc_active_order';

export interface ActiveOrderInfo {
  orderId: string;
  total: number;
  name: string;
}

export function saveActiveOrder(info: ActiveOrderInfo): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEY, JSON.stringify(info));
}

export function getActiveOrder(): ActiveOrderInfo | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as ActiveOrderInfo) : null;
  } catch {
    return null;
  }
}

export function clearActiveOrder(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(KEY);
}
