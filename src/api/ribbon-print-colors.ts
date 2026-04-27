import { api } from './client'
import type { RibbonPrintColorResponse } from './types'

export function getRibbonPrintColors(): Promise<RibbonPrintColorResponse[]> {
  return api.get<RibbonPrintColorResponse[]>('/api/v1/ribbon-print-colors')
}
