import { api } from './client'
import type { OrderStatusResponse } from './types'

export function getOrderStatuses(): Promise<OrderStatusResponse[]> {
  return api.get<OrderStatusResponse[]>('/api/v1/order-statuses')
}
