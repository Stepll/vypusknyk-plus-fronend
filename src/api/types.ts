export interface ProductResponse {
  id: number
  name: string
  category: string
  color?: string
  price: number
  minOrder: number
  popular: boolean
  isNew: boolean
  description: string
  tags: string[]
  imageUrl?: string
}

export interface PagedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
}

export interface OrderItemResponse {
  name: string
  qty: number
  price: number
}

export interface OrderDeliveryResponse {
  method: string
  city?: string
  warehouse?: string
  postalCode?: string
}

export interface OrderRecipientResponse {
  fullName: string
  phone: string
}

export interface OrderResponse {
  id: string
  orderNumber: string
  date: string
  status: string
  items: OrderItemResponse[]
  total: number
  delivery: OrderDeliveryResponse
  recipient: OrderRecipientResponse
  payment: string
  comment?: string
}

export interface DesignResponse {
  id: string
  designName: string
  savedAt: string
  state: unknown
}
