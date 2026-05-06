import { api } from './client'
import type { BadgeSizeResponse } from './types'

export function getBadgeSizes(): Promise<BadgeSizeResponse[]> {
  return api.get<BadgeSizeResponse[]>('/api/v1/badge-sizes')
}
