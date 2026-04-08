import { apiClient } from './client';

export interface Order {
  id: number;
  createdAt: string;
  total: number;
  status: string;
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

