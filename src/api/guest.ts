import { api } from './client'
import { OrderResponse } from './types'

const GUEST_TOKEN_KEY = 'guestToken'

export function getGuestToken(): string {
  let token = localStorage.getItem(GUEST_TOKEN_KEY)
  if (!token) {
    token = crypto.randomUUID()
    localStorage.setItem(GUEST_TOKEN_KEY, token)
  }
  return token
}

export function clearGuestToken(): void {
  localStorage.removeItem(GUEST_TOKEN_KEY)
}

export function getGuestOrders(): Promise<{ items: OrderResponse[] }> {
  const token = localStorage.getItem(GUEST_TOKEN_KEY)
  if (!token) return Promise.resolve({ items: [] })
  return api.get<{ items: OrderResponse[] }>(`/api/v1/orders/guest/${token}`)
}

export function claimGuestOrders(guestToken: string): Promise<void> {
  return api.post<void>('/api/v1/orders/claim', { guestToken })
}
