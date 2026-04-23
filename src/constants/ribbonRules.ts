// ─────────────────────────────────────────────────────────────────────────────
// Ribbon constructor config
// To add a new rule: add a `disabled` or `hidden` function to the option below.
// All logic is co-located here — the component just reads it.
// ─────────────────────────────────────────────────────────────────────────────

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

export const MAIN_TEXT_3D = 'Випускник 2026'

// ─── Option rule ─────────────────────────────────────────────────────────────

interface OptionRule {
  value: string
  label: string
  hex?: string
  disabled?: (state: RibbonState) => boolean
  disabledReason?: string
}

// ─── Ribbon colors ───────────────────────────────────────────────────────────

export const RIBBON_COLORS: (OptionRule & { hex: string; flagStyle?: boolean })[] = [
  { value: 'blue-yellow', label: 'Синьо-жовтий', hex: '#1a56a0', flagStyle: true },
  { value: 'blue',        label: 'Синій',         hex: '#1d4ed8' },
  { value: 'red',         label: 'Червоний',      hex: '#dc2626' },
  { value: 'white',       label: 'Білий',         hex: '#e8e8e8' },
  { value: 'burgundy',    label: 'Бордовий',      hex: '#7f1d1d' },
  { value: 'ivory',       label: 'Айворі',        hex: '#f5f0e8' },
  { value: 'gold',        label: 'Золотий',       hex: '#c9a84c' },
  { value: 'silver',      label: 'Срібний',       hex: '#9ca3af' },
]

// ─── Print types ──────────────────────────────────────────────────────────────

export const PRINT_TYPES: OptionRule[] = [
  { value: 'foil',  label: 'Фольга' },
  { value: 'film',  label: 'Плівка' },
  { value: '3d',    label: '3Д' },
]

// ─── Materials ────────────────────────────────────────────────────────────────

export const MATERIALS: OptionRule[] = [
  { value: 'atlas', label: 'Атлас' },
  {
    value: 'silk',
    label: 'Шовк',
    disabled: (s) => s.printType === '3d',
    disabledReason: 'Для типу 3Д доступний тільки Атлас',
  },
  {
    value: 'satin',
    label: 'Сатин',
    disabled: (s) => s.printType === '3d',
    disabledReason: 'Для типу 3Д доступний тільки Атлас',
  },
]

// ─── Text colors (main inscription) ──────────────────────────────────────────

export const TEXT_COLORS: OptionRule[] = [
  { value: 'white', label: 'Білий', hex: '#e8e8e8' },
  {
    value: 'black',
    label: 'Чорний',
    hex: '#1a1a2e',
    disabled: (s) => s.printType === '3d',
    disabledReason: 'Доступно при типі Фольга або Плівка',
  },
  {
    value: 'gold',
    label: 'Золотий',
    hex: '#c9a84c',
    disabled: (s) => s.printType === '3d',
    disabledReason: 'Доступно при типі Фольга або Плівка',
  },
]

// ─── Extra text colors (additional inscription) ───────────────────────────────

export const EXTRA_TEXT_COLORS: OptionRule[] = [
  { value: 'white',  label: 'Білий',  hex: '#e8e8e8' },
  { value: 'yellow', label: 'Жовтий', hex: '#FFD700' },
]

// ─── Fonts ────────────────────────────────────────────────────────────────────

export const FONTS: (OptionRule & { fontFamily: string })[] = [
  {
    value: 'classic',
    label: 'Класичний',
    fontFamily: 'Georgia, serif',
    disabled: (s) => s.printType === '3d',
    disabledReason: 'Для типу 3Д доступний тільки Курсив',
  },
  { value: 'italic',  label: 'Курсив',    fontFamily: '"Times New Roman", serif' },
  {
    value: 'print',
    label: 'Друкований',
    fontFamily: '"Arial", sans-serif',
    disabled: (s) => s.printType === '3d',
    disabledReason: 'Для типу 3Д доступний тільки Курсив',
  },
]

// ─── Emblems ──────────────────────────────────────────────────────────────────

export interface EmblemOption {
  key: number
  label: string
  disabled?: (state: RibbonState) => boolean
  disabledReason?: string
  only3d?: boolean
}

export const EMBLEMS: EmblemOption[] = [
  { key: 0, label: 'Дзвіночок', disabled: (s) => s.printType === '3d', disabledReason: 'Доступно при типі Фольга або Плівка' },
  { key: 1, label: 'Зірка',     disabled: (s) => s.printType === '3d', disabledReason: 'Доступно при типі Фольга або Плівка' },
  { key: 2, label: 'Диплом',    disabled: (s) => s.printType === '3d', disabledReason: 'Доступно при типі Фольга або Плівка' },
  { key: 3, label: 'Серце',     disabled: (s) => s.printType === '3d', disabledReason: 'Доступно при типі Фольга або Плівка' },
  { key: 4, label: 'Факел',     disabled: (s) => s.printType === '3d', disabledReason: 'Доступно при типі Фольга або Плівка' },
  {
    key: 5,
    label: 'Зірка 3Д',
    only3d: true,
    disabled: (s) => s.printType !== '3d',
    disabledReason: 'Доступно при типі напису 3Д',
  },
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

// ─── Helper: resolve disabled for any option ──────────────────────────────────

export function isOptionDisabled(
  option: { disabled?: (s: RibbonState) => boolean },
  state: RibbonState
): boolean {
  return option.disabled ? option.disabled(state) : false
}

// ─── Auto-correct state when rules make current selection invalid ─────────────
// Call this after any state change to snap invalid values to valid defaults.

export function sanitizeRibbonState(s: RibbonState): RibbonState {
  let next = { ...s }

  // 3D forces atlas material, italic font, and fixed main text
  if (next.printType === '3d') {
    next = { ...next, material: 'atlas', font: 'italic', mainText: MAIN_TEXT_3D }
  }

  // If textColor is now disabled, fall back to white
  const tcDisabled = TEXT_COLORS.find(c => c.value === next.textColor)?.disabled?.(next) ?? false
  if (tcDisabled) next = { ...next, textColor: 'white' }

  // If selected emblem is now disabled, pick the right default for the print type
  const emblemDisabled = EMBLEMS.find(e => e.key === next.emblemKey)?.disabled?.(next) ?? false
  if (emblemDisabled) next = { ...next, emblemKey: next.printType === '3d' ? 5 : 0 }

  return next
}
