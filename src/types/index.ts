export type MenuOption = 'hot' | 'ice';

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  description?: string;
  category?: string;
  availableOptions: MenuOption[];
  beanName?: string;
  cupNotes?: string;
  intro?: string;
}

export interface CartItem {
  id: string;      // composite key: `${menuId}-${option}`
  menuId: string;
  name: string;    // e.g. "항상 (핫)"
  price: number;
  quantity: number;
  option: MenuOption;
}

export interface OrderItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  option: MenuOption;
}

export interface CreateOrderRequest {
  items: OrderItem[];
  totalPrice: number;
}

export interface CreateOrderResponse {
  id: string;
  tossQrUrl: string;
  status: OrderStatus;
}

export type OrderStatus =
  | 'pending'
  | 'paid'
  | 'preparing'
  | 'ready'
  | 'picked_up'
  | 'cancelled';

export interface OrderStatusResponse {
  status: OrderStatus;
  orderId?: string;
  items?: OrderItem[];
  totalPrice?: number;
  createdAt?: string;
}
