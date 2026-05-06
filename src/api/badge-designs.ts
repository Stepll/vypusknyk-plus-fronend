import { api } from './client'
import type { BadgeDesignResponse } from './types'

export function fetchBadgeDesigns(): Promise<BadgeDesignResponse[]> {
  return api.get<BadgeDesignResponse[]>('/api/v1/badge-designs')
}

export function createBadgeDesign(designName: string, state: unknown): Promise<BadgeDesignResponse> {
  return api.post<BadgeDesignResponse>('/api/v1/badge-designs', { designName, state })
}

export function updateBadgeDesign(id: number, designName: string, state: unknown): Promise<BadgeDesignResponse> {
  return api.put<BadgeDesignResponse>(`/api/v1/badge-designs/${id}`, { designName, state })
}

export async function deleteBadgeDesign(id: number): Promise<void> {
  await api.delete(`/api/v1/badge-designs/${id}`)
}
