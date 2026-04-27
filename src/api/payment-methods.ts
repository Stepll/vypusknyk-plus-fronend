import { api } from './client'
import type { PaymentMethodResponse } from './types'

export function getPaymentMethods(): Promise<PaymentMethodResponse[]> {
  return api.get<PaymentMethodResponse[]>('/api/v1/payment-methods')
}
