import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Button, Input, Tooltip, Select } from 'antd'
import { observer } from 'mobx-react-lite'
import NamesDrawer, { NamesData, countNames } from '../../components/ui/NamesDrawer'
import { useRootStore } from '../../stores/RootStore'
import RibbonEditorPreview from '../../components/ui/RibbonEditorPreview'
import {
  RibbonState,
  DEFAULT_RIBBON_STATE,
  RIBBON_COLORS as FALLBACK_COLORS,
  PRINT_TYPES,
  MATERIALS,
  EXTRA_TEXT_COLORS,
  FONTS,
  sanitizeRibbonState,
} from '../../constants/ribbonRules'
import { getRibbonColors } from '../../api/ribbon-colors'
import { getRibbonMaterials } from '../../api/ribbon-materials'
import { getRibbonPrintColors } from '../../api/ribbon-print-colors'
import { getRibbonFonts } from '../../api/ribbon-fonts'
import { getRibbonPrintTypes } from '../../api/ribbon-print-types'
import { getRibbonEmblems } from '../../api/ribbon-emblems'
import { getConstructorRules } from '../../api/constructor-rules'
import type { RibbonColorResponse, RibbonMaterialResponse, RibbonPrintColorResponse, RibbonFontResponse, RibbonPrintTypeResponse, RibbonEmblemResponse, ConstructorRulesResponse } from '../../api/types'

const STATIC_COLORS: RibbonColorResponse[] = FALLBACK_COLORS.map((c, i) => ({
  id: i,
  name: c.label,
  slug: c.value,
  hex: c.hex,
  secondaryHex: (c as { flagStyle?: boolean }).flagStyle ? '#FFD700' : null,
  priceModifier: 0,
  isActive: true,
  sortOrder: i,
}))

const STATIC_MATERIALS: RibbonMaterialResponse[] = MATERIALS.map((m, i) => ({
  id: i,
  name: m.label,
  slug: m.value,
  priceModifier: 0,
  isActive: true,
  sortOrder: i,
}))

const STATIC_FONTS: RibbonFontResponse[] = FONTS.map((f, i) => ({
  id: i,
  name: f.label,
  slug: f.value,
  fontFamily: f.fontFamily,
  importUrl: null,
  isActive: true,
  sortOrder: i,
}))

const STATIC_PRINT_TYPES: RibbonPrintTypeResponse[] = PRINT_TYPES.map((p, i) => ({
  id: i,
  name: p.label,
  slug: p.value,
  priceModifier: 0,
  isActive: true,
  sortOrder: i,
}))

const STATIC_PRINT_COLORS: RibbonPrintColorResponse[] = [
  { id: 0, name: 'Білий',   slug: 'white',  hex: '#e8e8e8', priceModifier: 0, isForMainText: true,  isForExtraText: true,  isActive: true, sortOrder: 0 },
  { id: 1, name: 'Чорний',  slug: 'black',  hex: '#1a1a2e', priceModifier: 0, isForMainText: true,  isForExtraText: false, isActive: true, sortOrder: 1 },
  { id: 2, name: 'Золотий', slug: 'gold',   hex: '#c9a84c', priceModifier: 0, isForMainText: true,  isForExtraText: false, isActive: true, sortOrder: 2 },
  { id: 3, name: 'Жовтий',  slug: 'yellow', hex: '#FFD700', priceModifier: 0, isForMainText: false, isForExtraText: true,  isActive: true, sortOrder: 3 },
]
import './RibbonConstructor.css'

// ─── SVG icons for emblems (placeholder until real assets are loaded) ─────────

function EmblemSvg({ emblemKey }: { emblemKey: number }) {
  // All emblems use a star shape for now — real files will replace this
  return (
    <svg viewBox="0 0 24 24" fill="none">
      <path
        d="M12 2 L14.5 9H22L16 13.5L18.5 21L12 16.5L5.5 21L8 13.5L2 9H9.5Z"
        fill="currentColor"
        opacity={emblemKey === 5 ? 1 : 0.85}
      />
      {emblemKey === 5 && (
        <text x="12" y="16" textAnchor="middle" fontSize="6" fill="white" fontWeight="700">3D</text>
      )}
    </svg>
  )
}

// ─── Reusable chip button ─────────────────────────────────────────────────────

interface ChipProps {
  active: boolean
  disabled?: boolean
  disabledReason?: string
  onClick: () => void
  children: React.ReactNode
  className?: string
}

function Chip({ active, disabled, disabledReason, onClick, children, className = '' }: ChipProps) {
  const btn = (
    <button
      className={`rc-chip ${active ? 'rc-chip--active' : ''} ${disabled ? 'rc-chip--disabled' : ''} ${className}`}
      onClick={disabled ? undefined : onClick}
      aria-disabled={disabled}
    >
      {children}
    </button>
  )
  if (disabled && disabledReason) {
    return <Tooltip title={disabledReason}>{btn}</Tooltip>
  }
  return btn
}

// ─── Color swatch ─────────────────────────────────────────────────────────────

function FlagSwatch({ hex, secondaryHex }: { hex: string; secondaryHex: string }) {
  return (
    <svg viewBox="0 0 36 36" style={{ width: 36, height: 36, display: 'block' }}>
      <defs>
        <clipPath id="flag-circle-clip">
          <circle cx="18" cy="18" r="18" />
        </clipPath>
      </defs>
      <g clipPath="url(#flag-circle-clip)">
        <rect x="0" y="0" width="36" height="18" fill={hex} />
        <rect x="0" y="18" width="36" height="18" fill={secondaryHex} />
      </g>
    </svg>
  )
}

const EMPTY_NAMES: NamesData = { school: '', groups: [{ className: '', names: '' }] }

const RibbonConstructor = observer(function RibbonConstructor() {
  const { cart, toast, auth } = useRootStore()

  const [designName, setDesignName]   = useState('Мій дизайн стрічки')
  const [editingName, setEditingName] = useState(false)
  const [form, setForm]               = useState<RibbonState>(DEFAULT_RIBBON_STATE)
  const [namesOpen, setNamesOpen]     = useState(false)
  const [namesData, setNamesData]     = useState<NamesData>(EMPTY_NAMES)
  const [manualQty, setManualQty]     = useState(1)
  const [apiColors, setApiColors]           = useState<RibbonColorResponse[]>(STATIC_COLORS)
  const [apiMaterials, setApiMaterials]     = useState<RibbonMaterialResponse[]>(STATIC_MATERIALS)
  const [apiPrintTypes, setApiPrintTypes]   = useState<RibbonPrintTypeResponse[]>(STATIC_PRINT_TYPES)
  const [apiPrintColors, setApiPrintColors] = useState<RibbonPrintColorResponse[]>(STATIC_PRINT_COLORS)
  const [apiFonts, setApiFonts]             = useState<RibbonFontResponse[]>(STATIC_FONTS)
  const [apiEmblems, setApiEmblems]         = useState<RibbonEmblemResponse[]>([])
  const [rules, setRules]                   = useState<ConstructorRulesResponse>({ incompatibilities: [], forcedTexts: [] })

  useEffect(() => {
    getRibbonColors().then(colors => { if (colors.length) setApiColors(colors) }).catch(() => {})
    getRibbonMaterials().then(mats => { if (mats.length) setApiMaterials(mats) }).catch(() => {})
    getRibbonPrintTypes().then(pts => { if (pts.length) setApiPrintTypes(pts) }).catch(() => {})
    getRibbonEmblems().then(embs => { if (embs.length) setApiEmblems(embs) }).catch(() => {})
    getConstructorRules().then(r => setRules(r)).catch(() => {})
    getRibbonPrintColors().then(pcs => { if (pcs.length) setApiPrintColors(pcs) }).catch(() => {})
    getRibbonFonts().then(fts => {
      if (!fts.length) return
      fts.forEach(f => {
        if (f.importUrl && !document.querySelector(`link[href="${f.importUrl}"]`)) {
          const link = document.createElement('link')
          link.rel = 'stylesheet'
          link.href = f.importUrl
          document.head.appendChild(link)
        }
      })
      setApiFonts(fts)
    }).catch(() => {})
  }, [])

  useEffect(() => {
    const pending = auth.consumePendingDesign()
    if (pending) {
      setDesignName(pending.designName)
      setForm(pending.state)
      if (pending.state.classes?.length) {
        setNamesData({
          school: pending.state.school,
          groups: pending.state.classes.map(c => ({ className: c.className, names: c.names })),
        })
      }
    }
  }, [])

  const namedCount = countNames(namesData.groups)
  const allNames   = namesData.groups.flatMap(g => g.names.split('\n').map(s => s.trim()).filter(s => s.length > 0))
  const firstClass = namesData.groups[0]?.className?.trim() || undefined

  // ── Price calculation ──
  const hasSecondaryText = Boolean(form.school.trim()) || Boolean(firstClass) || namedCount > 0
  const priceBase = 50
  const priceSecondary = hasSecondaryText ? 20 : 0
  const priceSatin = apiMaterials.find(m => m.slug === form.material)?.priceModifier ?? 0
  const priceColor = apiColors.find(c => c.slug === form.color)?.priceModifier ?? 0
  const price3d = form.printType === '3d' ? 20 : 0
  const pricePerUnit = priceBase + priceSecondary + priceSatin + priceColor + price3d
  const minQty = Math.max(namedCount, 1)
  const qty = Math.max(manualQty, minQty)
  const total = pricePerUnit * qty

  function getFieldValue(state: RibbonState, fieldType: string): string | null {
    switch (fieldType) {
      case 'printType': return state.printType
      case 'material':  return state.material
      case 'font':      return state.font
      case 'textColor': return state.textColor
      case 'color':     return state.color
      case 'emblem':    return apiEmblems.find(e => e.sortOrder === state.emblemKey)?.slug ?? null
      default:          return null
    }
  }

  function getOptionStatus(type: string, slug: string): { disabled: boolean; warning: boolean; message: string | null } {
    for (const rule of rules.incompatibilities) {
      let matched = false
      if (rule.typeA === type && rule.slugA === slug) {
        const cur = getFieldValue(form, rule.typeB)
        if (cur !== null && rule.slugsB.includes(cur)) matched = true
      }
      if (rule.typeB === type && rule.slugsB.includes(slug)) {
        const cur = getFieldValue(form, rule.typeA)
        if (cur !== null && cur === rule.slugA) matched = true
      }
      if (matched) return { disabled: !rule.isWarning, warning: rule.isWarning, message: rule.message }
    }
    return { disabled: false, warning: false, message: null }
  }

  function update(patch: Partial<RibbonState>) {
    setForm(prev => {
      const next = sanitizeRibbonState({ ...prev, ...patch })
      // Sanitize forced text fields if a rule now applies
      const ftRule = rules.forcedTexts.find(r =>
        r.targetField === 'mainText' && getFieldValue(next, r.triggerType) === r.triggerSlug
      )
      if (ftRule && ftRule.values.length > 0 && !ftRule.values.includes(next.mainText)) {
        return { ...next, mainText: ftRule.values[0] }
      }
      return next
    })
  }

  function handleSave() {
    const stateWithClasses = {
      ...form,
      classes: namesData.groups
        .filter(g => g.className.trim() !== '' || g.names.trim() !== '')
        .map(g => ({ className: g.className, names: g.names })),
    }
    auth.saveDesign(designName, stateWithClasses)
    toast.show(`Дизайн "${designName}" збережено`)
  }

  function handleAddToCart() {
    cart.addItem({
      productId: null,
      productName: `Стрічка: ${designName}`,
      productCategory: 'ribbon',
      productColor: undefined,
      basePrice: pricePerUnit,
      qty,
      namesData: namedCount > 0 ? namesData : null,
      ribbonCustomization: {
        mainText: form.mainText,
        school: form.school,
        comment: form.comment,
        printType: form.printType,
        color: form.color,
        material: form.material,
        textColor: form.textColor,
        extraTextColor: form.extraTextColor,
        font: form.font,
        emblemKey: form.emblemKey,
        designName,
      },
    })
    toast.show(`${qty} ${qty === 1 ? 'стрічку додано' : qty < 5 ? 'стрічки додано' : 'стрічок додано'} до кошика`)
  }

  return (
    <div className="rc-page">

      {/* Top band */}
      <div className="rc-top-band">
        <div className="rc-container">
          <nav className="rc-breadcrumbs">
            <Link to="/" className="rc-breadcrumbs__link">Головна</Link>
            <span className="rc-breadcrumbs__sep">/</span>
            <Link to="/constructor" className="rc-breadcrumbs__link">Конструктори</Link>
            <span className="rc-breadcrumbs__sep">/</span>
            <span className="rc-breadcrumbs__current">Стрічка</span>
          </nav>
        </div>
      </div>

      <div className="rc-container">
        <div className="rc-layout">

          {/* ── Preview column ── */}
          <div className="rc-preview-col">
            <div className="rc-design-header">
              <div className="rc-design-name">
                {editingName ? (
                  <Input
                    autoFocus
                    value={designName}
                    onChange={e => setDesignName(e.target.value)}
                    onBlur={() => setEditingName(false)}
                    onPressEnter={() => setEditingName(false)}
                    className="rc-design-name__input"
                  />
                ) : (
                  <button className="rc-design-name__btn" onClick={() => setEditingName(true)}>
                    {designName}
                    <span className="rc-design-name__edit-icon">✎</span>
                  </button>
                )}
              </div>
              <div className="rc-design-header__actions">
                <Button type="primary" className="rc-actions__cart-btn" onClick={handleAddToCart}>
                  Додати до кошика
                </Button>
                <Tooltip title={auth.isLoggedIn ? undefined : 'Увійдіть, щоб зберегти'}>
                  <Button
                    className="rc-actions__save-btn"
                    disabled={!auth.isLoggedIn}
                    onClick={handleSave}
                  >
                    Зберегти
                  </Button>
                </Tooltip>
              </div>
            </div>
            <div className="rc-preview-ribbon">
              <RibbonEditorPreview
                mainText={form.mainText}
                school={form.school || undefined}
                className={firstClass}
                names={allNames}
                color={form.color}
                textColor={form.textColor}
                extraTextColor={form.extraTextColor}
                font={form.font}
                fontFamily={apiFonts.find(f => f.slug === form.font)?.fontFamily}
                emblemKey={form.emblemKey}
                emblems={apiEmblems.map(e => ({ sortOrder: e.sortOrder, svgUrlLeft: e.svgUrlLeft, svgUrlRight: e.svgUrlRight }))}
              />
            </div>
            <div className="rc-price-card">
              <div className="rc-price-card__rows">
                <div className="rc-price-card__row">
                  <span>Стрічка</span>
                  <span>{priceBase} грн</span>
                </div>
                {priceSecondary > 0 && (
                  <div className="rc-price-card__row">
                    <span>Додатковий напис</span>
                    <span>+{priceSecondary} грн</span>
                  </div>
                )}
                {priceSatin > 0 && (
                  <div className="rc-price-card__row">
                    <span>{apiMaterials.find(m => m.slug === form.material)?.name ?? 'Матеріал'}</span>
                    <span>+{priceSatin} грн</span>
                  </div>
                )}
                {priceColor > 0 && (
                  <div className="rc-price-card__row">
                    <span>{apiColors.find(c => c.slug === form.color)?.name ?? 'Колір'}</span>
                    <span>+{priceColor} грн</span>
                  </div>
                )}
                {price3d > 0 && (
                  <div className="rc-price-card__row">
                    <span>3Д напис</span>
                    <span>+{price3d} грн</span>
                  </div>
                )}
              </div>
              <div className="rc-price-card__divider" />
              <div className="rc-price-card__unit-row">
                <span className="rc-price-card__unit-price">{pricePerUnit} грн/шт</span>
                <div className="rc-price-card__counter">
                  <button
                    className="rc-price-card__counter-btn"
                    onClick={() => setManualQty(prev => Math.max(minQty, prev - 1))}
                    disabled={qty <= minQty}
                  >
                    &minus;
                  </button>
                  <span className="rc-price-card__counter-val">{qty}</span>
                  <button
                    className="rc-price-card__counter-btn"
                    onClick={() => setManualQty(prev => prev + 1)}
                  >
                    +
                  </button>
                </div>
              </div>
              {qty > 1 && (
                <div className="rc-price-card__total-row">
                  <span>{pricePerUnit} &times; {qty}</span>
                  <span className="rc-price-card__eq">=</span>
                  <span className="rc-price-card__sum">{total} грн</span>
                </div>
              )}
              {qty === 1 && (
                <div className="rc-price-card__total-row">
                  <span className="rc-price-card__sum">{pricePerUnit} грн</span>
                </div>
              )}
            </div>
            <p className="rc-preview-note">Реальні стрічки можуть незначно відрізнятись від превью в конструкторі</p>
            <p className="rc-preview-note">Випускник/Випускниця буде визначено на етапі виробництва по роду імені</p>
          </div>

          {/* ── Form column ── */}
          <div className="rc-form-col">

            {/* 1. Main text */}
            <div className="rc-field">
              <label className="rc-label">Основний напис</label>
              {(() => {
                const ftRule = rules.forcedTexts.find(r =>
                  r.targetField === 'mainText' && getFieldValue(form, r.triggerType) === r.triggerSlug
                )
                if (ftRule) {
                  return (
                    <Tooltip title={ftRule.message ?? 'Доступні значення обмежені правилами'}>
                      <Select
                        value={form.mainText}
                        options={ftRule.values.map(v => ({ value: v, label: v }))}
                        onChange={v => update({ mainText: v })}
                        size="large"
                        style={{ width: '100%' }}
                      />
                    </Tooltip>
                  )
                }
                return (
                  <Input
                    value={form.mainText}
                    onChange={e => update({ mainText: e.target.value })}
                    placeholder="Випускник 2026"
                    size="large"
                  />
                )
              })()}
            </div>

            {/* 2. Additional inscription block */}
            <div className="rc-section">
              <p className="rc-section__title">Додатковий напис</p>

              <div className="rc-field">
                <label className="rc-label">Школа</label>
                <Input
                  value={form.school}
                  onChange={e => update({ school: e.target.value })}
                  placeholder="Назва навчального закладу"
                  size="large"
                />
              </div>

              <div className="rc-field">
                <label className="rc-label">Імена учнів</label>
                <button
                  className={`rc-names-btn ${namedCount > 0 ? 'rc-names-btn--filled' : ''}`}
                  onClick={() => setNamesOpen(true)}
                >
                  <span className="rc-names-btn__icon">+</span>
                  {namedCount > 0 ? `${namedCount} іменних стрічок` : 'Додати імена'}
                </button>
              </div>

              <div className="rc-field">
                <label className="rc-label">Колір додаткового напису</label>
                <div className="rc-color-swatches">
                  {apiPrintColors.filter(c => c.isForExtraText).map(opt => (
                    <Tooltip key={opt.slug} title={opt.name}>
                      <button
                        className={`rc-color-swatch ${form.extraTextColor === opt.slug ? 'rc-color-swatch--active' : ''}`}
                        onClick={() => update({ extraTextColor: opt.slug as RibbonState['extraTextColor'] })}
                        aria-label={opt.name}
                      >
                        <span className="rc-color-swatch__dot" style={{ background: opt.hex }} />
                      </button>
                    </Tooltip>
                  ))}
                </div>
              </div>
            </div>

            {/* 3. Material */}
            <div className="rc-field">
              <label className="rc-label">Матеріал</label>
              <div className="rc-chips">
                {apiMaterials.map(m => {
                  const status = getOptionStatus('material', m.slug)
                  return (
                    <Chip
                      key={m.slug}
                      active={form.material === m.slug}
                      disabled={status.disabled}
                      disabledReason={status.message ?? undefined}
                      onClick={() => update({ material: m.slug as RibbonState['material'] })}
                    >
                      {m.name}
                    </Chip>
                  )
                })}
              </div>
            </div>

            {/* 4. Ribbon color */}
            <div className="rc-field">
              <label className="rc-label">Колір стрічки</label>
              <div className="rc-color-swatches">
                {apiColors.map(c => (
                  <Tooltip key={c.slug} title={c.name}>
                    <button
                      className={`rc-color-swatch ${form.color === c.slug ? 'rc-color-swatch--active' : ''}`}
                      onClick={() => update({ color: c.slug as RibbonState['color'] })}
                      aria-label={c.name}
                    >
                      {c.secondaryHex
                        ? <FlagSwatch hex={c.hex} secondaryHex={c.secondaryHex} />
                        : <span className="rc-color-swatch__dot" style={{ background: c.hex }} />
                      }
                    </button>
                  </Tooltip>
                ))}
              </div>
            </div>

            {/* 5. Print type */}
            <div className="rc-field">
              <label className="rc-label">Тип напису</label>
              <div className="rc-chips">
                {apiPrintTypes.map(opt => {
                  const status = getOptionStatus('printType', opt.slug)
                  return (
                    <Chip
                      key={opt.slug}
                      active={form.printType === opt.slug}
                      disabled={status.disabled}
                      disabledReason={status.message ?? undefined}
                      onClick={() => update({ printType: opt.slug as RibbonState['printType'] })}
                    >
                      {opt.name}
                    </Chip>
                  )
                })}
              </div>
            </div>

            {/* 6. Text color */}
            <div className="rc-field">
              <label className="rc-label">Колір напису</label>
              <div className="rc-color-swatches">
                {apiPrintColors.filter(c => c.isForMainText).map(opt => {
                  const status = getOptionStatus('textColor', opt.slug)
                  return (
                    <Tooltip key={opt.slug} title={status.disabled ? (status.message ?? 'Недоступно') : opt.name}>
                      <button
                        className={`rc-color-swatch ${form.textColor === opt.slug ? 'rc-color-swatch--active' : ''} ${status.disabled ? 'rc-color-swatch--disabled' : ''}`}
                        onClick={status.disabled ? undefined : () => update({ textColor: opt.slug as RibbonState['textColor'] })}
                        aria-disabled={status.disabled}
                        aria-label={opt.name}
                      >
                        <span className="rc-color-swatch__dot" style={{ background: opt.hex }} />
                      </button>
                    </Tooltip>
                  )
                })}
              </div>
            </div>

            {/* 7. Emblem */}
            <div className="rc-field">
              <label className="rc-label">Емблема</label>
              <div className="rc-emblem-swatches">
                {apiEmblems.map(e => {
                  const status = getOptionStatus('emblem', e.slug)
                  return (
                    <Tooltip key={e.sortOrder} title={status.disabled ? (status.message ?? 'Недоступно') : e.name}>
                      <button
                        className={`rc-emblem-swatch ${form.emblemKey === e.sortOrder ? 'rc-emblem-swatch--active' : ''} ${status.disabled ? 'rc-emblem-swatch--disabled' : ''}`}
                        onClick={status.disabled ? undefined : () => update({ emblemKey: e.sortOrder })}
                        aria-disabled={status.disabled}
                        aria-label={e.name}
                      >
                        <EmblemSvg emblemKey={e.sortOrder} />
                      </button>
                    </Tooltip>
                  )
                })}
              </div>
            </div>

            {/* 8. Font */}
            <div className="rc-field">
              <label className="rc-label">Шрифт</label>
              <div className="rc-font-swatches">
                {apiFonts.map(f => {
                  const status = getOptionStatus('font', f.slug)
                  return (
                    <Tooltip key={f.slug} title={status.disabled ? (status.message ?? 'Недоступно') : undefined}>
                      <button
                        className={`rc-font-swatch ${form.font === f.slug ? 'rc-font-swatch--active' : ''} ${status.disabled ? 'rc-font-swatch--disabled' : ''}`}
                        onClick={status.disabled ? undefined : () => update({ font: f.slug as RibbonState['font'] })}
                        aria-disabled={status.disabled}
                        style={{ fontFamily: f.fontFamily }}
                      >
                        <span className="rc-font-swatch__preview">Аб</span>
                        <span className="rc-font-swatch__label">{f.name}</span>
                      </button>
                    </Tooltip>
                  )
                })}
              </div>
            </div>

            {/* 9. Comment */}
            <div className="rc-field">
              <label className="rc-label">Коментар / уточнення</label>
              <Input.TextArea
                value={form.comment}
                onChange={e => update({ comment: e.target.value })}
                placeholder="Наприклад: Саша, Женя — жіночого роду"
                autoSize={{ minRows: 2, maxRows: 4 }}
              />
            </div>

            <Button type="primary" className="rc-form-col__cart-btn" onClick={handleAddToCart}>
              Додати до кошика
            </Button>

          </div>
        </div>
      </div>

      <NamesDrawer
        open={namesOpen}
        onClose={() => setNamesOpen(false)}
        data={namesData}
        onChange={setNamesData}
        hideSchool
      />
    </div>
  )
})

export default RibbonConstructor
