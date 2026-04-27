import { api } from './client'
import type { RibbonPrintTypeResponse } from './types'

export function getRibbonPrintTypes(): Promise<RibbonPrintTypeResponse[]> {
  return api.get<RibbonPrintTypeResponse[]>('/api/v1/ribbon-print-types')
}
