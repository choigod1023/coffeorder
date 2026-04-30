export interface MenuItem {
  id: string;
  name: string;
  price: number;
  description?: string;
  imageUrl?: string;
  category?: string;
}

export interface CartItem extends MenuItem {
  quantity: number;
}

export interface OrderItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
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
  | 'picked_up';

export interface OrderStatusResponse {
  status: OrderStatus;
  orderId?: string;
  items?: OrderItem[];
  totalPrice?: number;
  createdAt?: string;
}
