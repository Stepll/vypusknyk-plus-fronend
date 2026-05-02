import { api } from './client'

export interface PublicPromotionResponse {
  id: number
  name: string
  description?: string
  discountType: 'Percentage' | 'FixedAmount'
  discountValue: number
  scope: string
  minOrderAmount?: number
  startsAt?: string
  endsAt?: string
  status: 'active' | 'upcoming' | 'expired' | 'inactive'
}

export interface PromoCodeCardResponse {
  id: number
  displayName: string
  cardColor: string
  description?: string
  discountType: 'Percentage' | 'FixedAmount'
  discountValue: number
  minOrderAmount?: number
  endsAt?: string
}

export interface CalculateDiscountResponse {
  originalTotal: number
  promotionDiscount: number
  promoCodeDiscount: number
  totalDiscount: number
  finalTotal: number
  appliedPromotion?: PublicPromotionResponse
  appliedPromoCode?: PromoCodeCardResponse
}

export function getPromotions(): Promise<PublicPromotionResponse[]> {
  return api.get('/api/v1/promotions')
}

export function getMyPromoCards(): Promise<PromoCodeCardResponse[]> {
  return api.get('/api/v1/promotions/my-cards')
}

export function activatePromoCode(code: string): Promise<PromoCodeCardResponse> {
  return api.post('/api/v1/promotions/activate', { code })
}

export function calculateDiscount(
  orderTotal: number,
  userPromoCardId?: number,
): Promise<CalculateDiscountResponse> {
  return api.post('/api/v1/promotions/calculate', { orderTotal, userPromoCardId })
}
