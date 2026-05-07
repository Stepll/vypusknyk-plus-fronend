import { api } from './client'
import type { CertificateTemplateResponse } from './types'

export function getCertificateTemplates(): Promise<CertificateTemplateResponse[]> {
  return api.get<CertificateTemplateResponse[]>('/api/v1/certificate-templates')
}
