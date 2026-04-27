import { api } from './client'
import type { RibbonEmblemResponse } from './types'

export function getRibbonEmblems(): Promise<RibbonEmblemResponse[]> {
  return api.get<RibbonEmblemResponse[]>('/api/v1/ribbon-emblems')
}
