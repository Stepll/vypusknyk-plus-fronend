export interface BadgeSizeOption {
  id: number
  label: string
  diameter: number   // mm
  priceModifier: number
}

export const BADGE_SIZES: BadgeSizeOption[] = [
  { id: 1, label: '25 мм', diameter: 25, priceModifier: 0 },
  { id: 2, label: '37 мм', diameter: 37, priceModifier: 15 },
  { id: 3, label: '44 мм', diameter: 44, priceModifier: 25 },
  { id: 4, label: '56 мм', diameter: 56, priceModifier: 40 },
]

export interface BadgeTextColorOption {
  id: number
  name: string
  hex: string
  priceModifier: number
}

export const BADGE_TEXT_COLORS: BadgeTextColorOption[] = [
  { id: 1, name: 'Темний',   hex: '#1a1a2e', priceModifier: 0 },
  { id: 2, name: 'Білий',    hex: '#ffffff',  priceModifier: 0 },
  { id: 3, name: 'Чорний',   hex: '#000000',  priceModifier: 0 },
  { id: 4, name: 'Золотий',  hex: '#c9a84c', priceModifier: 5 },
  { id: 5, name: 'Рожевий',  hex: '#e91e8c', priceModifier: 0 },
  { id: 6, name: 'Червоний', hex: '#dc2626', priceModifier: 0 },
]

export interface BadgeFontOption {
  id: number
  name: string
  slug: string
  fontFamily: string
  priceModifier: number
}

export const BADGE_FONTS: BadgeFontOption[] = [
  { id: 1, name: 'Класичний',  slug: 'classic',  fontFamily: 'Arial, sans-serif',              priceModifier: 0 },
  { id: 2, name: 'Елегантний', slug: 'elegant',  fontFamily: 'Georgia, Times New Roman, serif', priceModifier: 0 },
  { id: 3, name: 'Сучасний',   slug: 'modern',   fontFamily: 'system-ui, Helvetica, sans-serif', priceModifier: 0 },
]

export interface BadgeFontSizeOption {
  label: string
  value: number   // px in 320px canvas
}

export const BADGE_FONT_SIZES: BadgeFontSizeOption[] = [
  { label: 'S', value: 10 },
  { label: 'M', value: 13 },
  { label: 'L', value: 16 },
  { label: 'XL', value: 20 },
]

export interface BadgePhotoTransform {
  scale: number
  x: number
  y: number
  rotation: number   // degrees
}

export interface BadgeState {
  sizeId: number
  topText: string
  bottomText: string
  photoUrl: string | null   // data URL
  photoTransform: BadgePhotoTransform
  textColorId: number
  fontSize: number
  fontSlug: string
  comment: string
}

export const DEFAULT_BADGE_STATE: BadgeState = {
  sizeId: 2,
  topText: '',
  bottomText: '',
  photoUrl: null,
  photoTransform: { scale: 1, x: 0, y: 0, rotation: 0 },
  textColorId: 1,
  fontSize: 13,
  fontSlug: 'classic',
  comment: '',
}

export const BADGE_BASE_PRICE = 35
export const BADGE_NAMED_EXTRA = 10
