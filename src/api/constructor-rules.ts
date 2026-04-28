import { api } from './client'
import type { ConstructorRulesResponse } from './types'

export function getConstructorRules(): Promise<ConstructorRulesResponse> {
  return api.get<ConstructorRulesResponse>('/api/v1/constructor/rules')
}
