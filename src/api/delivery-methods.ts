import { api } from './client'
import type { DeliveryMethodResponse } from './types'

export function getDeliveryMethods(): Promise<DeliveryMethodResponse[]> {
  return api.get<DeliveryMethodResponse[]>('/api/v1/delivery-methods')
}
