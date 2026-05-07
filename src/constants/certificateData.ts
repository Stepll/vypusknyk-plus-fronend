export type CertificateOrientation = 'landscape' | 'portrait'

export const CERTIFICATE_TITLES = ['ГРАМОТА', 'ДИПЛОМ', 'СЕРТИФІКАТ', 'ПОДЯКА'] as const
export type CertificateTitle = typeof CERTIFICATE_TITLES[number]

export interface CertificateState {
  templateId: number
  paperTypeId: number
  orientation: CertificateOrientation
  title: CertificateTitle
  bodyText: string
  organization: string
  year: string
  signerName: string
  signerTitle: string
  fontId: number
  comment: string
}

export const DEFAULT_CERTIFICATE_STATE: CertificateState = {
  templateId: 1,
  paperTypeId: 1,
  orientation: 'landscape',
  title: 'ГРАМОТА',
  bodyText: 'за активну участь у шкільному житті та досягнення у навчанні',
  organization: '',
  year: new Date().getFullYear().toString(),
  signerName: '',
  signerTitle: '',
  fontId: 1,
  comment: '',
}

// Canvas dimensions (A4 ratio 1:√2 ≈ 1:1.414)
export const CANVAS_LANDSCAPE = { w: 640, h: 453 }
export const CANVAS_PORTRAIT  = { w: 453, h: 640 }

export const CERTIFICATE_BASE_PRICE = 45
export const CERTIFICATE_NAMED_EXTRA = 0   // price per unit is same regardless of names count
