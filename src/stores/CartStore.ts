import { makeAutoObservable } from 'mobx'
import { NamesData, countNames } from '../components/ui/NamesDrawer'

const NAMED_PRICE_EXTRA = 20

export interface RibbonCustomization {
  mainText: string
  school: string
  comment: string
  printType: string
  color: string
  material: string
  textColor: string
  extraTextColor: string
  font: string
  emblemKey: number
  designName: string
}

export interface CartItem {
  id: string            // unique per addition (uuid-like)
  productId: number
  productName: string
  productCategory: string
  productColor?: string
  basePrice: number
  qty: number
  namesData: NamesData | null   // null = no names customization
  ribbonCustomization?: RibbonCustomization  // full config for custom ribbons
}

export function cartItemTotal(item: CartItem): number {
  if (!item.namesData) return item.qty * item.basePrice
  const named = Math.min(countNames(item.namesData.groups), item.qty)
  const regular = item.qty - named
  return named * (item.basePrice + NAMED_PRICE_EXTRA) + regular * item.basePrice
}

function generateId(): string {
  return Math.random().toString(36).slice(2, 10)
}

class CartStore {
  items: CartItem[] = []

  constructor() {
    makeAutoObservable(this)
  }

  get totalQty(): number {
    return this.items.reduce((sum, item) => sum + item.qty, 0)
  }

  get totalPrice(): number {
    return this.items.reduce((sum, item) => sum + cartItemTotal(item), 0)
  }

  addItem(item: Omit<CartItem, 'id'>): void {
    this.items.push({ ...item, id: generateId() })
  }

  removeItem(id: string): void {
    this.items = this.items.filter(item => item.id !== id)
  }

  updateQty(id: string, qty: number): void {
    const item = this.items.find(i => i.id === id)
    if (item && qty > 0) item.qty = qty
  }

  clear(): void {
    this.items = []
  }
}

export default CartStore
