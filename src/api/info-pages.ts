import { api } from './client'

export interface InfoPageData {
  id: number
  slug: string
  title: string
  content: string
  order: number
  updatedAt: string
}

export const getInfoPage = (slug: string) =>
  api.get<InfoPageData>(`/api/v1/info/${slug}`)
