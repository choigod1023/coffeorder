const KEY = 'scc_active_orders';
const EXPIRY_MS = 6 * 60 * 60 * 1000; // 6시간

export interface ActiveOrderInfo {
  orderId: string;
  total: number;
  name: string;
  createdAt: string; // ISO string
}

function isExpired(order: ActiveOrderInfo): boolean {
  if (!order.createdAt) return true; // createdAt 없는 구버전 항목은 만료 처리
  return Date.now() - new Date(order.createdAt).getTime() > EXPIRY_MS;
}

function load(): ActiveOrderInfo[] {
  if (typeof window === 'undefined') return [];
  try {
    const all = JSON.parse(localStorage.getItem(KEY) ?? '[]') as ActiveOrderInfo[];
    const fresh = all.filter((o) => !isExpired(o));
    // 만료된 항목이 있으면 즉시 정리
    if (fresh.length !== all.length) localStorage.setItem(KEY, JSON.stringify(fresh));
    return fresh;
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

export function getActiveOrders(): ActiveOrderInfo[] {
  return load();
}

export function removeActiveOrder(orderId: string): void {
  save(load().filter((o) => o.orderId !== orderId));
}

export function clearAllActiveOrders(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(KEY);
}
