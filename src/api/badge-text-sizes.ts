import { api } from './client'
import type { BadgeTextSizeResponse } from './types'

export function getBadgeTextSizes(): Promise<BadgeTextSizeResponse[]> {
  return api.get<BadgeTextSizeResponse[]>('/api/v1/badge-text-sizes')
}
