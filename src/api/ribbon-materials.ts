import { api } from './client'
import type { RibbonMaterialResponse } from './types'

export function getRibbonMaterials(): Promise<RibbonMaterialResponse[]> {
  return api.get<RibbonMaterialResponse[]>('/api/v1/ribbon-materials')
}
