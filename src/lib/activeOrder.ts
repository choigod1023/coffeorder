const KEY = 'scc_active_orders';
export const EXPIRY_MS = 10 * 60 * 1000; // 10분

export interface ActiveOrderInfo {
  orderId: string;
  total: number;
  name: string;
  createdAt: string;
}

export function isOrderExpired(order: ActiveOrderInfo): boolean {
  if (!order.createdAt) return true;
  return Date.now() - new Date(order.createdAt).getTime() > EXPIRY_MS;
}

function load(): ActiveOrderInfo[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '[]') as ActiveOrderInfo[];
  } catch {
    return [];
  }
}

function save(orders: ActiveOrderInfo[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEY, JSON.stringify(orders));
}

export function addActiveOrder(info: Omit<ActiveOrderInfo, 'createdAt'>): void {
  const orders = load().filter((o) => o.orderId !== info.orderId);
  save([...orders, { ...info, createdAt: new Date().toISOString() }]);
}

// fresh / expired 분리해서 반환
export function getActiveOrders(): { fresh: ActiveOrderInfo[]; expired: ActiveOrderInfo[] } {
  const all = load();
  return {
    fresh: all.filter((o) => !isOrderExpired(o)),
    expired: all.filter((o) => isOrderExpired(o)),
  };
}

export function removeActiveOrder(orderId: string): void {
  save(load().filter((o) => o.orderId !== orderId));
}

export function clearAllActiveOrders(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(KEY);
}
