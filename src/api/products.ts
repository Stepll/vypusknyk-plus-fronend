import { api } from './client'
import { PagedResponse, ProductResponse } from './types'

export function getProducts(): Promise<PagedResponse<ProductResponse>> {
  return api.get<PagedResponse<ProductResponse>>('/api/v1/products?pageSize=100')
}

export function getProduct(id: number): Promise<ProductResponse> {
  return api.get<ProductResponse>(`/api/v1/products/${id}`)
}
