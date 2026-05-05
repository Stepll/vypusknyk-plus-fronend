import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Button, Input, Slider } from 'antd'
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
  BADGE_SIZES,
  BADGE_BASE_PRICE,
  BADGE_NAMED_EXTRA,
} from '../../constants/badgeData'
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

  const fileInputRef = useRef<HTMLInputElement>(null)

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

  // Price
  const namedCount  = countBadgeNames(namesData)
  const sizeOption  = BADGE_SIZES.find(s => s.id === form.sizeId) ?? BADGE_SIZES[1]
  const pricePerUnit = BADGE_BASE_PRICE + sizeOption.priceModifier + (namedCount > 0 ? BADGE_NAMED_EXTRA : 0)
  const minQty       = Math.max(namedCount, 1)
  const qty          = Math.max(manualQty, minQty)
  const total        = pricePerUnit * qty

  // Photo upload
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      update({
        photoUrl: ev.target?.result as string,
        photoTransform: { scale: 1, x: 0, y: 0, rotation: 0 },
      })
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  function handleSave() {
    if (!auth.isLoggedIn) {
      toast.show("Увійдіть, щоб зберігати дизайни")
      return
    }
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
        sizeLabel: sizeOption.label,
        topText: form.topText,
        bottomText: form.bottomText,
        photoUrl: form.photoUrl,
        photoTransform: form.photoTransform,
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
                <Button size="small" onClick={handleSave}>Зберегти</Button>
              </div>
            </div>

            <div className="bc-preview-card">
              <div className="bc-preview-canvas-wrap">
                <BadgeEditorPreview
                  photoUrl={form.photoUrl}
                  photoTransform={form.photoTransform}
                  topText={form.topText}
                  bottomText={form.bottomText}
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
                  <span>Базова ціна ({sizeOption.label})</span>
                  <span>{BADGE_BASE_PRICE + sizeOption.priceModifier} грн</span>
                </div>
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
                className="bc-order-btn"
                onClick={handleAddToCart}
              >
                Замовити
              </Button>
            </div>
          </div>

          {/* ── Form column ── */}
          <div className="bc-form-col">

            {/* 1. Size */}
            <div className="bc-field">
              <label className="bc-label">Розмір</label>
              <div className="bc-chips">
                {BADGE_SIZES.map(s => (
                  <button
                    key={s.id}
                    className={`bc-chip${form.sizeId === s.id ? ' bc-chip--active' : ''}`}
                    onClick={() => update({ sizeId: s.id })}
                  >
                    {s.label}
                    {s.priceModifier > 0 && (
                      <span className="bc-chip__mod">+{s.priceModifier}</span>
                    )}
                  </button>
                ))}
              </div>
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
                    onClick={() => update({ photoUrl: null, photoTransform: { scale: 1, x: 0, y: 0, rotation: 0 } })}
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

              {/* Names button */}
              <button
                className={`bc-names-btn${namedCount > 0 ? ' bc-names-btn--active' : ''}`}
                onClick={() => setNamesOpen(true)}
              >
                <UserOutlined />
                <span>
                  {namedCount > 0
                    ? `Іменні значки · ${namedCount} ${namedCount === 1 ? 'ім\'я' : namedCount < 5 ? 'імені' : 'імен'}`
                    : 'Іменні значки'}
                </span>
                <span className="bc-names-btn__arrow">›</span>
              </button>
            </div>

            {/* 5. Comment */}
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
