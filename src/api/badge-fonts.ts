import { api } from './client'
import type { BadgeFontResponse } from './types'

export function getBadgeFonts(): Promise<BadgeFontResponse[]> {
  return api.get<BadgeFontResponse[]>('/api/v1/badge-fonts')
}
