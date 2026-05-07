import { api } from './client'
import type { CertificateDesignResponse } from './types'

export function fetchCertificateDesigns(): Promise<CertificateDesignResponse[]> {
  return api.get<CertificateDesignResponse[]>('/api/v1/certificate-designs')
}

export function createCertificateDesign(designName: string, state: unknown): Promise<CertificateDesignResponse> {
  return api.post<CertificateDesignResponse>('/api/v1/certificate-designs', { designName, state })
}

export function updateCertificateDesign(id: number, designName: string, state: unknown): Promise<CertificateDesignResponse> {
  return api.put<CertificateDesignResponse>(`/api/v1/certificate-designs/${id}`, { designName, state })
}

export async function deleteCertificateDesign(id: number): Promise<void> {
  await api.delete(`/api/v1/certificate-designs/${id}`)
}
