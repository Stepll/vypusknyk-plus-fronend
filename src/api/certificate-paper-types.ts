import { api } from './client'
import type { CertificatePaperTypeResponse } from './types'

export function getCertificatePaperTypes(): Promise<CertificatePaperTypeResponse[]> {
  return api.get<CertificatePaperTypeResponse[]>('/api/v1/certificate-paper-types')
}
