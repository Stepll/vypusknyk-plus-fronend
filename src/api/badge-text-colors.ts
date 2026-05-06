import { api } from './client'
import type { BadgeTextColorResponse } from './types'

export function getBadgeTextColors(): Promise<BadgeTextColorResponse[]> {
  return api.get<BadgeTextColorResponse[]>('/api/v1/badge-text-colors')
}
