import { api } from './client'
import type { ProductCategoryResponse } from './types'

export function getProductCategories(): Promise<ProductCategoryResponse[]> {
  return api.get<ProductCategoryResponse[]>('/api/v1/product-categories')
}
