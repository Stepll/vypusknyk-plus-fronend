export type RibbonColor =
  | 'blue-yellow'
  | 'blue'
  | 'red'
  | 'white'
  | 'burgundy'
  | 'ivory'
  | 'gold'
  | 'silver'

export type PrintType = 'foil' | 'film' | '3d'
export type Material  = 'atlas' | 'silk' | 'satin'
export type TextColor = 'white' | 'black' | 'gold'
export type ExtraTextColor = 'white' | 'yellow'
export type Font = 'classic' | 'italic' | 'print'

export interface RibbonClassGroup {
  className: string
  names: string
}

export interface RibbonState {
  mainText: string
  school: string
  comment: string
  printType: PrintType
  color: RibbonColor
  material: Material
  textColor: TextColor
  extraTextColor: ExtraTextColor
  font: Font
  emblemKey: number
  classes: RibbonClassGroup[]
}

// ─── Ribbon colors ────────────────────────────────────────────────────────────

export const RIBBON_COLORS: { value: string; label: string; hex: string; flagStyle?: boolean }[] = [
  { value: 'blue-yellow', label: 'Синьо-жовтий', hex: '#1a56a0', flagStyle: true },
  { value: 'blue',        label: 'Синій',         hex: '#1d4ed8' },
  { value: 'red',         label: 'Червоний',      hex: '#dc2626' },
  { value: 'white',       label: 'Білий',         hex: '#e8e8e8' },
  { value: 'burgundy',    label: 'Бордовий',      hex: '#7f1d1d' },
  { value: 'ivory',       label: 'Айворі',        hex: '#f5f0e8' },
  { value: 'gold',        label: 'Золотий',       hex: '#c9a84c' },
  { value: 'silver',      label: 'Срібний',       hex: '#9ca3af' },
]

// ─── Static fallbacks (used before API responds) ──────────────────────────────

export const PRINT_TYPES: { value: string; label: string }[] = [
  { value: 'foil',  label: 'Фольга' },
  { value: 'film',  label: 'Плівка' },
  { value: '3d',    label: '3Д' },
]

export const MATERIALS: { value: string; label: string }[] = [
  { value: 'atlas', label: 'Атлас' },
  { value: 'silk',  label: 'Шовк' },
  { value: 'satin', label: 'Сатин' },
]

export const EXTRA_TEXT_COLORS: { value: string; label: string; hex: string }[] = [
  { value: 'white',  label: 'Білий',  hex: '#e8e8e8' },
  { value: 'yellow', label: 'Жовтий', hex: '#FFD700' },
]

export const FONTS: { value: string; label: string; fontFamily: string }[] = [
  { value: 'classic', label: 'Класичний',   fontFamily: 'Georgia, serif' },
  { value: 'italic',  label: 'Курсив',      fontFamily: '"Times New Roman", serif' },
  { value: 'print',   label: 'Друкований',  fontFamily: '"Arial", sans-serif' },
]

// ─── Default state ────────────────────────────────────────────────────────────

export const DEFAULT_RIBBON_STATE: RibbonState = {
  mainText: 'Випускник 2026',
  school: '',
  comment: '',
  printType: 'foil',
  color: 'blue-yellow',
  material: 'atlas',
  textColor: 'white',
  extraTextColor: 'white',
  font: 'classic',
  emblemKey: 0,
  classes: [],
}
