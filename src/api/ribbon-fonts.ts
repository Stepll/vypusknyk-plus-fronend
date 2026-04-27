import { api } from './client'
import type { RibbonFontResponse } from './types'

export function getRibbonFonts(): Promise<RibbonFontResponse[]> {
  return api.get<RibbonFontResponse[]>('/api/v1/ribbon-fonts')
}
