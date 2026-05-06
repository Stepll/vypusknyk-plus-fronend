import { api } from './client'
import type { BadgeImageResponse } from './types'

export function getBadgeImages(): Promise<BadgeImageResponse[]> {
  return api.get<BadgeImageResponse[]>('/api/v1/badge-images')
}
