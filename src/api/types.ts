export interface ProductResponse {
  id: number
  name: string
  categoryId: number
  categoryName: string
  subcategoryId: number | null
  subcategoryName: string | null
  color?: string
  price: number
  minOrder: number
  popular: boolean
  isNew: boolean
  description: string
  tags: string[]
  imageUrl?: string
}

export interface ProductCategoryResponse {
  id: number
  name: string
  order: number
  subcategories: ProductSubcategoryResponse[]
}

export interface ProductSubcategoryResponse {
  id: number
  categoryId: number
  name: string
  order: number
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
  id: number
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

export interface DeliveryCheckoutField {
  key: string
  label: string
  type: 'input' | 'select'
  required: boolean
  isEnabled: boolean
  optionsJson: string
}

export interface DeliveryMethodResponse {
  id: number
  name: string
  slug: string
  isEnabled: boolean
  settings: string
  checkoutFields: DeliveryCheckoutField[]
}

export interface RibbonPrintColorResponse {
  id: number
  name: string
  slug: string
  hex: string
  priceModifier: number
  isActive: boolean
  sortOrder: number
}

export interface RibbonMaterialResponse {
  id: number
  name: string
  slug: string
  priceModifier: number
  isActive: boolean
  sortOrder: number
}

export interface RibbonColorResponse {
  id: number
  name: string
  slug: string
  hex: string
  secondaryHex: string | null
  priceModifier: number
  isActive: boolean
  sortOrder: number
}

export interface OrderStatusResponse {
  id: number
  name: string
  color: string
  sortOrder: number
  isFinal: boolean
  isActive: boolean
}

export interface PaymentMethodResponse {
  id: number
  name: string
  slug: string
  isEnabled: boolean
}

export interface DesignResponse {
  id: number
  designName: string
  savedAt: string
  state: unknown
}
