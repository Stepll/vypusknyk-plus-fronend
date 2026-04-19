import { api } from './client'
import { OrderResponse } from './types'

interface NamesDataPayload {
  school: string
  groups: { className: string; names: string }[]
}

interface RibbonCustomizationPayload {
  mainText: string; school: string; comment: string; printType: string
  color: string; material: string; textColor: string; extraTextColor: string
  font: string; emblemKey: number; designName: string
}

export interface CreateOrderPayload {
  items: {
    productId: number | null
    name: string
    qty: number
    price: number
    namesData?: NamesDataPayload | null
    ribbonCustomization?: RibbonCustomizationPayload
  }[]
  delivery: { method: string; city?: string; warehouse?: string; postalCode?: string }
  recipient: { fullName: string; phone: string }
  payment: string
  email?: string
  comment?: string
  guestToken?: string
}

export function createOrder(payload: CreateOrderPayload): Promise<OrderResponse> {
  return api.post<OrderResponse>('/api/v1/orders', payload)
}

export function getUserOrders(): Promise<{ items: OrderResponse[] }> {
  return api.get<{ items: OrderResponse[] }>('/api/v1/orders')
}

export function getOrder(id: number): Promise<OrderResponse> {
  return api.get<OrderResponse>(`/api/v1/orders/${id}`)
}
