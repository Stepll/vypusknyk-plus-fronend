import { api } from './client'
import { DesignResponse } from './types'
import { RibbonState } from '../constants/ribbonRules'

export function fetchDesigns(): Promise<DesignResponse[]> {
  return api.get<DesignResponse[]>('/api/v1/designs')
}

export function createDesign(designName: string, state: RibbonState): Promise<DesignResponse> {
  return api.post<DesignResponse>('/api/v1/designs', { designName, state })
}

export function updateDesign(id: number, designName: string, state: RibbonState): Promise<DesignResponse> {
  return api.put<DesignResponse>(`/api/v1/designs/${id}`, { designName, state })
}

export async function deleteDesign(id: number): Promise<void> {
  await api.delete(`/api/v1/designs/${id}`)
}
