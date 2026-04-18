import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Button, Input, Tooltip } from 'antd'
import { observer } from 'mobx-react-lite'
import NamesDrawer, { NamesData, countNames } from '../../components/ui/NamesDrawer'
import { useRootStore } from '../../stores/RootStore'
import RibbonEditorPreview from '../../components/ui/RibbonEditorPreview'
import {
  RibbonState,
  DEFAULT_RIBBON_STATE,
  MAIN_TEXT_3D,
  RIBBON_COLORS,
  PRINT_TYPES,
  MATERIALS,
  TEXT_COLORS,
  EXTRA_TEXT_COLORS,
  FONTS,
  EMBLEMS,
  isOptionDisabled,
  sanitizeRibbonState,
} from '../../constants/ribbonRules'
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

function FlagSwatch() {
  return (
    <svg viewBox="0 0 36 36" style={{ width: 36, height: 36, display: 'block' }}>
      <defs>
        <clipPath id="flag-circle-clip">
          <circle cx="18" cy="18" r="18" />
        </clipPath>
      </defs>
      <g clipPath="url(#flag-circle-clip)">
        <rect x="0" y="0" width="36" height="18" fill="#005BBB" />
        <rect x="0" y="18" width="36" height="18" fill="#FFD500" />
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

  useEffect(() => {
    const pending = auth.consumePendingDesign()
    if (pending) {
      setDesignName(pending.designName)
      setForm(pending.state)
    }
  }, [])

  const namedCount = countNames(namesData.groups)
  const allNames   = namesData.groups.flatMap(g => g.names.split('\n').map(s => s.trim()).filter(s => s.length > 0))
  const firstClass = namesData.groups[0]?.className?.trim() || undefined

  // ── Price calculation ──
  const hasSecondaryText = Boolean(form.school.trim()) || Boolean(firstClass) || namedCount > 0
  const priceBase = 50
  const priceSecondary = hasSecondaryText ? 20 : 0
  const priceSatin = form.material === 'satin' ? 30 : 0
  const priceBlueYellow = form.color === 'blue-yellow' ? 10 : 0
  const price3d = form.printType === '3d' ? 20 : 0
  const pricePerUnit = priceBase + priceSecondary + priceSatin + priceBlueYellow + price3d
  const minQty = Math.max(namedCount, 1)
  const qty = Math.max(manualQty, minQty)
  const total = pricePerUnit * qty

  function update(patch: Partial<RibbonState>) {
    setForm(prev => sanitizeRibbonState({ ...prev, ...patch }))
  }

  function handleSave() {
    auth.saveDesign(designName, form)
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
                emblemKey={form.emblemKey}
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
                    <span>Сатин</span>
                    <span>+{priceSatin} грн</span>
                  </div>
                )}
                {priceBlueYellow > 0 && (
                  <div className="rc-price-card__row">
                    <span>Синьо-жовтий колір</span>
                    <span>+{priceBlueYellow} грн</span>
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
              <Tooltip title={form.printType === '3d' ? 'При типі 3Д текст фіксований' : undefined}>
                <Input
                  value={form.printType === '3d' ? MAIN_TEXT_3D : form.mainText}
                  onChange={e => update({ mainText: e.target.value })}
                  placeholder="Випускник 2026"
                  size="large"
                  disabled={form.printType === '3d'}
                />
              </Tooltip>
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
                  {EXTRA_TEXT_COLORS.map(opt => (
                    <Tooltip key={opt.value} title={opt.label}>
                      <button
                        className={`rc-color-swatch ${opt.value === 'white' ? '' : ''} ${form.extraTextColor === opt.value ? 'rc-color-swatch--active' : ''}`}
                        onClick={() => update({ extraTextColor: opt.value as RibbonState['extraTextColor'] })}
                        aria-label={opt.label}
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
                {MATERIALS.map(opt => (
                  <Chip
                    key={opt.value}
                    active={form.material === opt.value}
                    disabled={isOptionDisabled(opt, form)}
                    disabledReason={opt.disabledReason}
                    onClick={() => update({ material: opt.value as RibbonState['material'] })}
                  >
                    {opt.label}
                  </Chip>
                ))}
              </div>
            </div>

            {/* 4. Ribbon color */}
            <div className="rc-field">
              <label className="rc-label">Колір стрічки</label>
              <div className="rc-color-swatches">
                {RIBBON_COLORS.map(c => (
                  <Tooltip key={c.value} title={c.label}>
                    <button
                      className={`rc-color-swatch ${form.color === c.value ? 'rc-color-swatch--active' : ''}`}
                      onClick={() => update({ color: c.value as RibbonState['color'] })}
                      aria-label={c.label}
                    >
                      {c.flagStyle
                        ? <FlagSwatch />
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
                {PRINT_TYPES.map(opt => (
                  <Chip
                    key={opt.value}
                    active={form.printType === opt.value}
                    disabled={isOptionDisabled(opt, form)}
                    disabledReason={opt.disabledReason}
                    onClick={() => update({ printType: opt.value as RibbonState['printType'] })}
                  >
                    {opt.label}
                  </Chip>
                ))}
              </div>
            </div>

            {/* 6. Text color */}
            <div className="rc-field">
              <label className="rc-label">Колір напису</label>
              <div className="rc-color-swatches">
                {TEXT_COLORS.map(opt => {
                  const disabled = isOptionDisabled(opt, form)
                  return (
                    <Tooltip key={opt.value} title={disabled ? opt.disabledReason : opt.label}>
                      <button
                        className={`rc-color-swatch ${opt.value === 'white' ? '' : ''} ${form.textColor === opt.value ? 'rc-color-swatch--active' : ''} ${disabled ? 'rc-color-swatch--disabled' : ''}`}
                        onClick={disabled ? undefined : () => update({ textColor: opt.value as RibbonState['textColor'] })}
                        aria-disabled={disabled}
                        aria-label={opt.label}
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
                {EMBLEMS.map(e => {
                  const disabled = isOptionDisabled(e, form)
                  return (
                    <Tooltip key={e.key} title={disabled ? e.disabledReason : e.label}>
                      <button
                        className={`rc-emblem-swatch ${form.emblemKey === e.key ? 'rc-emblem-swatch--active' : ''} ${disabled ? 'rc-emblem-swatch--disabled' : ''}`}
                        onClick={disabled ? undefined : () => update({ emblemKey: e.key })}
                        aria-disabled={disabled}
                        aria-label={e.label}
                      >
                        <EmblemSvg emblemKey={e.key} />
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
                {FONTS.map(f => {
                  const disabled = isOptionDisabled(f, form)
                  return (
                    <Tooltip key={f.value} title={disabled ? f.disabledReason : undefined}>
                      <button
                        className={`rc-font-swatch ${form.font === f.value ? 'rc-font-swatch--active' : ''} ${disabled ? 'rc-font-swatch--disabled' : ''}`}
                        onClick={disabled ? undefined : () => update({ font: f.value as RibbonState['font'] })}
                        aria-disabled={disabled}
                        style={{ fontFamily: f.fontFamily }}
                      >
                        <span className="rc-font-swatch__preview">Аб</span>
                        <span className="rc-font-swatch__label">{f.label}</span>
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
