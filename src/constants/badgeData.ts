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
  comment: string
}

export const DEFAULT_BADGE_STATE: BadgeState = {
  sizeId: 2,
  topText: '',
  bottomText: '',
  photoUrl: null,
  photoTransform: { scale: 1, x: 0, y: 0, rotation: 0 },
  comment: '',
}

export const BADGE_BASE_PRICE = 35
export const BADGE_NAMED_EXTRA = 10
