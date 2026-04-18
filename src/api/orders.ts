import { api } from './client'
import { OrderResponse } from './types'

export interface CreateOrderPayload {
  items: { productId: number | null; name: string; qty: number; price: number }[]
  delivery: { method: string; city?: string; warehouse?: string; postalCode?: string }
  recipient: { fullName: string; phone: string }
  payment: string
  email?: string
  comment?: string
}

export function createOrder(payload: CreateOrderPayload): Promise<OrderResponse> {
  return api.post<OrderResponse>('/api/v1/orders', payload)
}

export function getUserOrders(): Promise<{ items: OrderResponse[] }> {
  return api.get<{ items: OrderResponse[] }>('/api/v1/orders')
}

export function getOrder(id: string): Promise<OrderResponse> {
  return api.get<OrderResponse>(`/api/v1/orders/${id}`)
}
