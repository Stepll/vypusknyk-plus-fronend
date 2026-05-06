import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Button, Input, Slider, Tooltip, Spin } from 'antd'
import { observer } from 'mobx-react-lite'
import { EditOutlined, UploadOutlined, UserOutlined, RotateRightOutlined } from '@ant-design/icons'
import { useRootStore } from '../../stores/RootStore'
import BadgeEditorPreview from '../../components/ui/BadgeEditorPreview'
import BadgeNamesDrawer, {
  BadgeNamesData,
  EMPTY_BADGE_NAMES,
  countBadgeNames,
  getBadgeNamesList,
} from '../../components/ui/BadgeNamesDrawer'
import {
  BadgeState,
  DEFAULT_BADGE_STATE,
  BADGE_BASE_PRICE,
  BADGE_NAMED_EXTRA,
} from '../../constants/badgeData'
import { getBadgeSizes } from '../../api/badge-sizes'
import { getBadgeImages } from '../../api/badge-images'
import { getBadgeTextColors } from '../../api/badge-text-colors'
import { getBadgeFonts } from '../../api/badge-fonts'
import { getBadgeTextSizes } from '../../api/badge-text-sizes'
import type { BadgeSizeResponse, BadgeImageResponse, BadgeTextColorResponse, BadgeFontResponse, BadgeTextSizeResponse } from '../../api/types'
import './BadgeConstructor.css'

const BadgeConstructor = observer(function BadgeConstructor() {
  const { cart, toast, auth } = useRootStore()

  const [designName, setDesignName]   = useState('Мій значок')
  const [editingName, setEditingName] = useState(false)
  const [form, setForm]               = useState<BadgeState>(DEFAULT_BADGE_STATE)
  const [namesOpen, setNamesOpen]     = useState(false)
  const [namesData, setNamesData]     = useState<BadgeNamesData>(EMPTY_BADGE_NAMES)
  const [manualQty, setManualQty]     = useState(1)
  const [previewNameIdx, setPreviewNameIdx] = useState(0)
  const [activePresetId, setActivePresetId] = useState<number | null>(null)

  const [sizes, setSizes]               = useState<BadgeSizeResponse[]>([])
  const [sizesLoading, setSizesLoading] = useState(true)
  const [presetImages, setPresetImages] = useState<BadgeImageResponse[]>([])
  const [textColors, setTextColors]     = useState<BadgeTextColorResponse[]>([])
  const [fonts, setFonts]               = useState<BadgeFontResponse[]>([])
  const [textSizes, setTextSizes]       = useState<BadgeTextSizeResponse[]>([])

  const fileInputRef = useRef<HTMLInputElement>(null)
  const loadedFromDesign = useRef(false)

  useEffect(() => {
    const pending = auth.consumePendingBadgeDesign()
    if (pending) {
      loadedFromDesign.current = true
      setDesignName(pending.designName)
      setForm(pending.state)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    getBadgeSizes().then(data => {
      setSizes(data)
      if (data.length > 0 && !loadedFromDesign.current) setForm(prev => ({ ...prev, sizeId: data[0].id }))
    }).finally(() => setSizesLoading(false))

    getBadgeImages().then(setPresetImages)

    getBadgeTextColors().then(data => {
      setTextColors(data)
      if (data.length > 0 && !loadedFromDesign.current) setForm(prev => ({ ...prev, textColorId: data[0].id }))
    })

    getBadgeFonts().then(data => {
      setFonts(data)
      if (data.length > 0 && !loadedFromDesign.current) setForm(prev => ({ ...prev, fontSlug: data[0].slug }))
    })

    getBadgeTextSizes().then(data => {
      setTextSizes(data)
      if (data.length > 0 && !loadedFromDesign.current) setForm(prev => ({ ...prev, fontSize: data[0].value }))
    })
  }, [])

  function update(patch: Partial<BadgeState>) {
    setForm(prev => ({ ...prev, ...patch }))
  }

  // Cycle through names in preview
  const namesList = getBadgeNamesList(namesData)
  useEffect(() => {
    if (namesList.length === 0) { setPreviewNameIdx(0); return }
    const t = setInterval(() => {
      setPreviewNameIdx(i => (i + 1) % namesList.length)
    }, 2000)
    return () => clearInterval(t)
  }, [namesList.length])

  const previewName = namesList.length > 0 ? namesList[previewNameIdx] : ''

  // Derived
  const namedCount  = countBadgeNames(namesData)
  const sizeOption  = sizes.find(s => s.id === form.sizeId) ?? sizes[0]
  const colorOption = textColors.find(c => c.id === form.textColorId) ?? textColors[0]
  const fontOption  = fonts.find(f => f.slug === form.fontSlug) ?? fonts[0]

  const pricePerUnit = BADGE_BASE_PRICE + (sizeOption?.priceModifier ?? 0) + (colorOption?.priceModifier ?? 0) + (namedCount > 0 ? BADGE_NAMED_EXTRA : 0)
  const minQty       = Math.max(namedCount, 1)
  const qty          = Math.max(manualQty, minQty)
  const total        = pricePerUnit * qty

  // Photo upload
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      setActivePresetId(null)
      update({
        photoUrl: ev.target?.result as string,
        photoTransform: { scale: 1, x: 0, y: 0, rotation: 0 },
      })
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  function handleSelectPreset(img: BadgeImageResponse) {
    if (!img.imageUrl) return
    setActivePresetId(img.id)
    update({
      photoUrl: img.imageUrl,
      photoTransform: { scale: 1, x: 0, y: 0, rotation: 0 },
    })
  }

  function handleSave() {
    if (!auth.isLoggedIn) return
    auth.saveBadgeDesign(designName, form)
    toast.show(`Дизайн "${designName}" збережено`)
  }

  function handleAddToCart() {
    cart.addItem({
      productId: null,
      productName: `Значок: ${designName}`,
      productCategory: 'badge',
      basePrice: pricePerUnit,
      qty,
      namesData: null,
      badgeCustomization: {
        sizeId: form.sizeId,
        sizeLabel: sizeOption?.name ?? '',
        topText: form.topText,
        bottomText: form.bottomText,
        photoUrl: form.photoUrl,
        photoTransform: form.photoTransform,
        textColorId: form.textColorId,
        textColorHex: colorOption?.hex ?? '#000000',
        fontSize: form.fontSize,
        fontSlug: form.fontSlug,
        comment: form.comment,
        designName,
        namesCount: namedCount,
        namesTextPosition: namesData.textPosition,
      },
    })
    toast.show(
      `${qty} ${qty === 1 ? 'значок додано' : qty < 5 ? 'значки додано' : 'значків додано'} до кошика`,
    )
  }

  return (
    <div className="bc-page">

      {/* Top band */}
      <div className="bc-top-band">
        <div className="bc-container">
          <nav className="bc-breadcrumbs">
            <Link to="/" className="bc-breadcrumbs__link">Головна</Link>
            <span className="bc-breadcrumbs__sep">/</span>
            <Link to="/constructor" className="bc-breadcrumbs__link">Конструктори</Link>
            <span className="bc-breadcrumbs__sep">/</span>
            <span className="bc-breadcrumbs__current">Значок</span>
          </nav>
        </div>
      </div>

      <div className="bc-container">
        <div className="bc-layout">

          {/* ── Preview column ── */}
          <div className="bc-preview-col">

            <div className="bc-design-header">
              <div className="bc-design-name">
                {editingName ? (
                  <Input
                    autoFocus
                    value={designName}
                    onChange={e => setDesignName(e.target.value)}
                    onBlur={() => setEditingName(false)}
                    onPressEnter={() => setEditingName(false)}
                    className="bc-design-name__input"
                  />
                ) : (
                  <button className="bc-design-name__btn" onClick={() => setEditingName(true)}>
                    <span>{designName}</span>
                    <EditOutlined className="bc-design-name__edit-icon" />
                  </button>
                )}
              </div>
              <div className="bc-design-header__actions">
                <Button
                  type="primary"
                  size="small"
                  className="bc-actions__cart-btn"
                  onClick={handleAddToCart}
                >
                  Додати до кошика
                </Button>
                <Tooltip title={auth.isLoggedIn ? undefined : 'Увійдіть, щоб зберегти'}>
                  <Button
                    size="small"
                    className="bc-actions__save-btn"
                    disabled={!auth.isLoggedIn}
                    onClick={handleSave}
                  >
                    Зберегти
                  </Button>
                </Tooltip>
              </div>
            </div>

            <div className="bc-preview-card">
              <div className="bc-preview-canvas-wrap">
                <BadgeEditorPreview
                  photoUrl={form.photoUrl}
                  photoTransform={form.photoTransform}
                  topText={form.topText}
                  bottomText={form.bottomText}
                  textColor={colorOption?.hex ?? '#1a1a2e'}
                  fontSize={form.fontSize}
                  fontFamily={fontOption?.fontFamily ?? 'Arial, sans-serif'}
                  onTransformChange={t => update({ photoTransform: t })}
                  previewName={previewName}
                  namePosition={namesData.textPosition}
                />
              </div>
              {form.photoUrl && (
                <p className="bc-preview-hint">
                  Перетягніть для зсуву · Колесо миші — масштаб
                </p>
              )}
            </div>

            {/* Price card */}
            <div className="bc-price-card">
              <div className="bc-price-card__rows">
                <div className="bc-price-card__row">
                  <span>Базова ціна ({sizeOption?.name ?? ''})</span>
                  <span>{BADGE_BASE_PRICE + (sizeOption?.priceModifier ?? 0)} грн</span>
                </div>
                {(colorOption?.priceModifier ?? 0) > 0 && (
                  <div className="bc-price-card__row">
                    <span>Колір тексту ({colorOption?.name})</span>
                    <span>+{colorOption?.priceModifier} грн</span>
                  </div>
                )}
                {namedCount > 0 && (
                  <div className="bc-price-card__row">
                    <span>Персоналізація</span>
                    <span>+{BADGE_NAMED_EXTRA} грн</span>
                  </div>
                )}
              </div>

              <div className="bc-price-card__divider" />

              <div className="bc-price-card__unit-row">
                <span className="bc-price-card__unit-price">{pricePerUnit} грн / шт</span>
                <div className="bc-price-card__counter">
                  <button
                    className="bc-price-card__counter-btn"
                    onClick={() => setManualQty(q => Math.max(minQty, q - 1))}
                    disabled={qty <= minQty}
                  >−</button>
                  <span className="bc-price-card__counter-val">{qty}</span>
                  <button
                    className="bc-price-card__counter-btn"
                    onClick={() => setManualQty(q => q + 1)}
                  >+</button>
                </div>
              </div>

              <div className="bc-price-card__total-row">
                <span>{qty} шт</span>
                <span className="bc-price-card__eq">×</span>
                <span>{pricePerUnit} грн</span>
                <span className="bc-price-card__sum">{total} грн</span>
              </div>

              <Button
                type="primary"
                size="large"
                block
                className="bc-order-btn bc-order-btn--pink"
                onClick={handleAddToCart}
              >
                Додати до кошика
              </Button>
            </div>
          </div>

          {/* ── Form column ── */}
          <div className="bc-form-col">

            {/* 1. Size */}
            <div className="bc-field">
              <label className="bc-label">Розмір</label>
              {sizesLoading ? (
                <Spin size="small" />
              ) : (
                <div className="bc-chips">
                  {sizes.map(s => (
                    <button
                      key={s.id}
                      className={`bc-chip${form.sizeId === s.id ? ' bc-chip--active' : ''}`}
                      onClick={() => update({ sizeId: s.id })}
                    >
                      {s.name}
                      {s.priceModifier > 0 && <span className="bc-chip__mod">+{s.priceModifier}</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 2. Photo */}
            <div className="bc-field">
              <label className="bc-label">Фото</label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
              {form.photoUrl ? (
                <div className="bc-photo-actions">
                  <Button icon={<UploadOutlined />} onClick={() => fileInputRef.current?.click()}>
                    Замінити фото
                  </Button>
                  <Button
                    danger
                    onClick={() => { setActivePresetId(null); update({ photoUrl: null, photoTransform: { scale: 1, x: 0, y: 0, rotation: 0 } }) }}
                  >
                    Видалити
                  </Button>
                </div>
              ) : (
                <div className="bc-photo-upload" onClick={() => fileInputRef.current?.click()}>
                  <UploadOutlined className="bc-photo-upload__icon" />
                  <p className="bc-photo-upload__text">Завантажити фото</p>
                  <p className="bc-photo-upload__hint">JPG, PNG, WebP · до 10 МБ</p>
                </div>
              )}

              {/* Preset photos from DB */}
              {presetImages.length > 0 && (
                <div className="bc-presets">
                  <p className="bc-presets__label">Або обрати готове фото</p>
                  <div className="bc-presets__list">
                    {presetImages.map(img => (
                      <Tooltip key={img.id} title={img.name}>
                        <button
                          className={`bc-preset${activePresetId === img.id ? ' bc-preset--active' : ''}`}
                          onClick={() => handleSelectPreset(img)}
                          aria-label={img.name}
                          disabled={!img.imageUrl}
                        >
                          {img.imageUrl
                            ? <img src={img.imageUrl} className="bc-preset__thumb" alt={img.name} />
                            : <span className="bc-preset__thumb" style={{ background: '#e5e7eb' }} />
                          }
                        </button>
                      </Tooltip>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 3. Rotation — only when photo loaded */}
            {form.photoUrl && (
              <div className="bc-field">
                <label className="bc-label">
                  <RotateRightOutlined /> Обертання — {form.photoTransform.rotation}°
                </label>
                <Slider
                  min={0}
                  max={360}
                  value={form.photoTransform.rotation}
                  onChange={v => update({ photoTransform: { ...form.photoTransform, rotation: v } })}
                />
              </div>
            )}

            {/* 4. Texts */}
            <div className="bc-section">
              <p className="bc-section__title">Написи по колу</p>

              <div className="bc-field">
                <label className="bc-label">Верхній напис</label>
                <Input
                  value={form.topText}
                  onChange={e => update({ topText: e.target.value })}
                  placeholder="Наприклад: Випускник 2026"
                  maxLength={50}
                  showCount
                />
              </div>

              <div className="bc-field">
                <label className="bc-label">Нижній напис</label>
                <Input
                  value={form.bottomText}
                  onChange={e => update({ bottomText: e.target.value })}
                  placeholder="Наприклад: ЗОШ №5"
                  maxLength={50}
                  showCount
                />
              </div>

              <button
                className={`bc-names-btn${namedCount > 0 ? ' bc-names-btn--active' : ''}`}
                onClick={() => setNamesOpen(true)}
              >
                <UserOutlined />
                <span>
                  {namedCount > 0
                    ? `Іменні значки · ${namedCount} ${namedCount === 1 ? "ім'я" : namedCount < 5 ? 'імені' : 'імен'}`
                    : 'Іменні значки'}
                </span>
                <span className="bc-names-btn__arrow">›</span>
              </button>
            </div>

            {/* 5. Text style */}
            <div className="bc-section">
              <p className="bc-section__title">Стиль тексту</p>

              {/* Color */}
              {textColors.length > 0 && (
                <div className="bc-field">
                  <label className="bc-label">Колір тексту</label>
                  <div className="bc-color-swatches">
                    {textColors.map(c => (
                      <Tooltip key={c.id} title={`${c.name}${c.priceModifier > 0 ? ` +${c.priceModifier}₴` : ''}`}>
                        <button
                          className={`bc-color-swatch${form.textColorId === c.id ? ' bc-color-swatch--active' : ''}`}
                          onClick={() => update({ textColorId: c.id })}
                          aria-label={c.name}
                        >
                          <span
                            className="bc-color-swatch__dot"
                            style={{
                              background: c.hex,
                              border: c.hex.toLowerCase() === '#ffffff' ? '1.5px solid #e5e7eb' : undefined,
                            }}
                          />
                        </button>
                      </Tooltip>
                    ))}
                  </div>
                </div>
              )}

              {/* Font */}
              {fonts.length > 0 && (
                <div className="bc-field">
                  <label className="bc-label">Шрифт</label>
                  <div className="bc-font-chips">
                    {fonts.map(f => (
                      <button
                        key={f.slug}
                        className={`bc-font-chip${form.fontSlug === f.slug ? ' bc-font-chip--active' : ''}`}
                        onClick={() => update({ fontSlug: f.slug })}
                        style={{ fontFamily: f.fontFamily }}
                      >
                        <span className="bc-font-chip__preview">Аб</span>
                        <span className="bc-font-chip__label">{f.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Text size */}
              {textSizes.length > 0 && (
                <div className="bc-field">
                  <label className="bc-label">Розмір тексту</label>
                  <div className="bc-chips">
                    {textSizes.map(s => (
                      <button
                        key={s.value}
                        className={`bc-chip${form.fontSize === s.value ? ' bc-chip--active' : ''}`}
                        onClick={() => update({ fontSize: s.value })}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 6. Comment */}
            <div className="bc-field">
              <label className="bc-label">Коментар / уточнення</label>
              <Input.TextArea
                value={form.comment}
                onChange={e => update({ comment: e.target.value })}
                placeholder="Будь-які уточнення до замовлення"
                autoSize={{ minRows: 2, maxRows: 4 }}
              />
            </div>

          </div>
        </div>
      </div>

      <BadgeNamesDrawer
        open={namesOpen}
        onClose={() => setNamesOpen(false)}
        data={namesData}
        onChange={setNamesData}
      />
    </div>
  )
})

export default BadgeConstructor
