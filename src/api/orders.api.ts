import { apiClient } from './client';

export interface OrderLine {
  productId: number;
  productName: string;
  image: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string | number;
  userId?: string;
  createdAt: string;
  total: number;
  status: string;
  lines?: OrderLine[];
}

export interface CreateOrderRequest {
  // Keep flexible until backend contract is confirmed.
  [key: string]: unknown;
}

export async function createOrder(req: CreateOrderRequest): Promise<Order> {
  const res = await apiClient.post<Order>('/orders', req);
  return res.data;
}

export async function listOrders(): Promise<Order[]> {
  const res = await apiClient.get<Order[]>('/orders');
  return res.data;
}

/**
 * Fetch all orders for the current user
 * GET /api/my-orders
 */
export async function fetchMyOrders(): Promise<Order[]> {
  try {
    const response = await apiClient.get<{ orders: Order[] }>('/api/my-orders');
    return response.data.orders || [];
  } catch (error) {
    console.error('Failed to fetch orders:', error);
    throw error;
  }
}

/**
 * Fetch order details by order ID
 * GET /api/order-details/:orderId
 */
export async function fetchOrderDetails(orderId: string | number): Promise<Order> {
  try {
    const response = await apiClient.get<Order>(`/api/order-details/${orderId}`);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch order details for ${orderId}:`, error);
    throw error;
  }
}

