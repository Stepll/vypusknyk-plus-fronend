import { api } from './client'
import type { CertificateFontResponse } from './types'

export function getCertificateFonts(): Promise<CertificateFontResponse[]> {
  return api.get<CertificateFontResponse[]>('/api/v1/certificate-fonts')
}
