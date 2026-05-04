import { api } from './client'

export interface PublicTaskResponse {
  id: number
  name: string
  description?: string
  taskType: string
  targetValue: number
  targetCategoryId?: number
  targetCategoryName?: string
  isVisibleToGuests: boolean
  endsAt?: string
  rewardDisplayName: string
  rewardCardColor: string
  rewardDiscountType: 'Percentage' | 'FixedAmount'
  rewardDiscountValue: number
  userProgress?: number
  isCompleted: boolean
}

export function getTasks(): Promise<PublicTaskResponse[]> {
  return api.get('/api/v1/tasks')
}
