import { api } from './client'
import type { RibbonColorResponse } from './types'

export function getRibbonColors(): Promise<RibbonColorResponse[]> {
  return api.get<RibbonColorResponse[]>('/api/v1/ribbon-colors')
}
