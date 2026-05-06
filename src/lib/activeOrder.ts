const KEY = 'scc_active_orders';

export interface ActiveOrderInfo {
  orderId: string;
  total: number;
  name: string;
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

export function addActiveOrder(info: ActiveOrderInfo): void {
  const orders = load().filter((o) => o.orderId !== info.orderId);
  save([...orders, info]);
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
