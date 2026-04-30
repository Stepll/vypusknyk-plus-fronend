import { api } from './client'

export async function getPageContent<T>(slug: string): Promise<T> {
  return api.get<T>(`/api/v1/page-content/${slug}`)
}
