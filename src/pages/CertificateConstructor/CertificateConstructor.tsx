import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Button, Input, Tooltip, Spin } from 'antd'
import PeakSeasonBanner from '../../components/ui/PeakSeasonBanner'
import { observer } from 'mobx-react-lite'
import { EditOutlined, UserOutlined } from '@ant-design/icons'
import { useRootStore } from '../../stores/RootStore'
import CertificateEditorPreview from '../../components/ui/CertificateEditorPreview'
import CertificateNamesDrawer, {
  CertificateNamesData,
  EMPTY_CERTIFICATE_NAMES,
  countCertificateNames,
  getCertificateNamesList,
} from '../../components/ui/CertificateNamesDrawer'
import {
  CertificateState,
  DEFAULT_CERTIFICATE_STATE,
  CERTIFICATE_TITLES,
  CERTIFICATE_BASE_PRICE,
} from '../../constants/certificateData'
import { getCertificateTemplates } from '../../api/certificate-templates'
import { getCertificatePaperTypes } from '../../api/certificate-paper-types'
import { getCertificateFonts } from '../../api/certificate-fonts'
import type {
  CertificateTemplateResponse,
  CertificatePaperTypeResponse,
  CertificateFontResponse,
} from '../../api/types'
import './CertificateConstructor.css'

const CertificateConstructor = observer(function CertificateConstructor() {
  const { cart, toast, auth, settings } = useRootStore()

  const [designName, setDesignName]   = useState('Моя грамота')
  const [editingName, setEditingName] = useState(false)
  const [form, setForm]               = useState<CertificateState>(DEFAULT_CERTIFICATE_STATE)
  const [namesOpen, setNamesOpen]     = useState(false)
  const [namesData, setNamesData]     = useState<CertificateNamesData>(EMPTY_CERTIFICATE_NAMES)
  const [manualQty, setManualQty]     = useState(1)
  const [previewNameIdx, setPreviewNameIdx] = useState(0)

  const [templates, setTemplates]           = useState<CertificateTemplateResponse[]>([])
  const [templatesLoading, setTemplatesLoading] = useState(true)
  const [paperTypes, setPaperTypes]         = useState<CertificatePaperTypeResponse[]>([])
  const [fonts, setFonts]                   = useState<CertificateFontResponse[]>([])

  const loadedFromDesign = useRef(false)

  useEffect(() => {
    const pending = auth.consumePendingCertificateDesign()
    if (pending) {
      loadedFromDesign.current = true
      setDesignName(pending.designName)
      setForm(pending.state)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    getCertificateTemplates().then(data => {
      setTemplates(data)
      if (data.length > 0 && !loadedFromDesign.current) {
        setForm(prev => ({ ...prev, templateId: data[0].id }))
      }
    }).finally(() => setTemplatesLoading(false))

    getCertificatePaperTypes().then(data => {
      setPaperTypes(data)
      if (data.length > 0 && !loadedFromDesign.current) {
        setForm(prev => ({ ...prev, paperTypeId: data[0].id }))
      }
    })

    getCertificateFonts().then(data => {
      setFonts(data)
      if (data.length > 0 && !loadedFromDesign.current) {
        setForm(prev => ({ ...prev, fontId: data[0].id }))
      }
    })
  }, [])

  function update(patch: Partial<CertificateState>) {
    setForm(prev => ({ ...prev, ...patch }))
  }

  // Cycle through names in preview
  const namesList = getCertificateNamesList(namesData)
  useEffect(() => {
    if (namesList.length === 0) { setPreviewNameIdx(0); return }
    const t = setInterval(() => {
      setPreviewNameIdx(i => (i + 1) % namesList.length)
    }, 2000)
    return () => clearInterval(t)
  }, [namesList.length])

  const previewName = namesList.length > 0 ? namesList[previewNameIdx] : ''

  // Derived
  const namedCount    = countCertificateNames(namesData)
  const templateOption = templates.find(t => t.id === form.templateId) ?? templates[0]
  const paperOption    = paperTypes.find(p => p.id === form.paperTypeId) ?? paperTypes[0]
  const fontOption     = fonts.find(f => f.id === form.fontId) ?? fonts[0]

  const parsedLayout = (() => {
    if (!templateOption?.layoutJson) return null
    try {
      return JSON.parse(templateOption.layoutJson)
    } catch { return null }
  })()
  const activeLayout = parsedLayout?.[form.orientation] ?? null

  const pricePerUnit = CERTIFICATE_BASE_PRICE
    + (templateOption?.priceModifier ?? 0)
    + (paperOption?.priceModifier ?? 0)
    + (fontOption?.priceModifier ?? 0)

  const minQty = Math.max(namedCount, 1)
  const qty    = Math.max(manualQty, minQty)
  const total  = pricePerUnit * qty

  function handleSave() {
    if (!auth.isLoggedIn) return
    auth.saveCertificateDesign(designName, form)
    toast.show(`Дизайн "${designName}" збережено`)
  }

  function handleAddToCart() {
    cart.addItem({
      productId: null,
      productName: `Грамота: ${designName}`,
      productCategory: 'certificate',
      basePrice: pricePerUnit,
      qty,
      namesData: null,
      certificateCustomization: {
        templateId: form.templateId,
        templateName: templateOption?.name ?? '',
        paperTypeId: form.paperTypeId,
        paperTypeName: paperOption?.name ?? '',
        orientation: form.orientation,
        title: form.title,
        bodyText: form.bodyText,
        organization: form.organization,
        year: form.year,
        signerName: form.signerName,
        signerTitle: form.signerTitle,
        signer2Name: form.signer2Name,
        signer2Title: form.signer2Title,
        additionalText: form.additionalText,
        fontId: form.fontId,
        fontFamily: fontOption?.fontFamily ?? 'serif',
        comment: form.comment,
        designName,
        namesCount: namedCount,
      },
    })
    toast.show(
      `${qty} ${qty === 1 ? 'грамоту додано' : qty < 5 ? 'грамоти додано' : 'грамот додано'} до кошика`,
    )
  }

  return (
    <div className="cc-page">
      <PeakSeasonBanner />

      {/* Top band */}
      <div className="cc-top-band">
        <div className="cc-container">
          <nav className="cc-breadcrumbs">
            <Link to="/" className="cc-breadcrumbs__link">Головна</Link>
            <span className="cc-breadcrumbs__sep">/</span>
            <Link to="/constructor" className="cc-breadcrumbs__link">Конструктори</Link>
            <span className="cc-breadcrumbs__sep">/</span>
            <span className="cc-breadcrumbs__current">Грамота</span>
          </nav>
        </div>
      </div>

      <div className="cc-container">
        <div className="cc-layout">

          {/* ── Preview column ── */}
          <div className="cc-preview-col">

            <div className="cc-design-header">
              <div className="cc-design-name">
                {editingName ? (
                  <Input
                    autoFocus
                    value={designName}
                    onChange={e => setDesignName(e.target.value)}
                    onBlur={() => setEditingName(false)}
                    onPressEnter={() => setEditingName(false)}
                    className="cc-design-name__input"
                  />
                ) : (
                  <button className="cc-design-name__btn" onClick={() => setEditingName(true)}>
                    <span>{designName}</span>
                    <EditOutlined className="cc-design-name__edit-icon" />
                  </button>
                )}
              </div>
              <div className="cc-design-header__actions">
                <Button
                  type="primary"
                  size="small"
                  className="cc-actions__cart-btn"
                  onClick={handleAddToCart}
                >
                  Додати до кошика
                </Button>
                <Tooltip title={auth.isLoggedIn ? undefined : 'Увійдіть, щоб зберегти'}>
                  <Button
                    size="small"
                    className="cc-actions__save-btn"
                    disabled={!auth.isLoggedIn}
                    onClick={handleSave}
                  >
                    Зберегти
                  </Button>
                </Tooltip>
              </div>
            </div>

            <div className="cc-preview-card">
              <CertificateEditorPreview
                templateUrl={templateOption?.imageUrl ?? null}
                nativeOrientation={templateOption?.nativeOrientation ?? 'portrait'}
                orientation={form.orientation}
                layout={activeLayout}
                title={form.title}
                bodyText={form.bodyText}
                organization={form.organization}
                year={form.year}
                signerName={form.signerName}
                signerTitle={form.signerTitle}
                signer2Name={form.signer2Name}
                signer2Title={form.signer2Title}
                additionalText={form.additionalText}
                fontFamily={fontOption?.fontFamily ?? 'Georgia, serif'}
                previewName={previewName}
              />
            </div>

            {/* Price card */}
            <div className="cc-price-card">
              <div className="cc-price-card__rows">
                <div className="cc-price-card__row">
                  <span>Базова ціна</span>
                  <span>{CERTIFICATE_BASE_PRICE} грн</span>
                </div>
                {(templateOption?.priceModifier ?? 0) > 0 && (
                  <div className="cc-price-card__row">
                    <span>Шаблон ({templateOption?.name})</span>
                    <span>+{templateOption?.priceModifier} грн</span>
                  </div>
                )}
                {(paperOption?.priceModifier ?? 0) > 0 && (
                  <div className="cc-price-card__row">
                    <span>Папір ({paperOption?.name})</span>
                    <span>+{paperOption?.priceModifier} грн</span>
                  </div>
                )}
                {(fontOption?.priceModifier ?? 0) > 0 && (
                  <div className="cc-price-card__row">
                    <span>Шрифт ({fontOption?.name})</span>
                    <span>+{fontOption?.priceModifier} грн</span>
                  </div>
                )}
              </div>

              <div className="cc-price-card__divider" />

              <div className="cc-price-card__unit-row">
                <span className="cc-price-card__unit-price">{pricePerUnit} грн / шт</span>
                <div className="cc-price-card__counter">
                  <button
                    className="cc-price-card__counter-btn"
                    onClick={() => setManualQty(q => Math.max(minQty, q - 1))}
                    disabled={qty <= minQty}
                  >−</button>
                  <span className="cc-price-card__counter-val">{qty}</span>
                  <button
                    className="cc-price-card__counter-btn"
                    onClick={() => setManualQty(q => q + 1)}
                  >+</button>
                </div>
              </div>

              <div className="cc-price-card__total-row">
                <span>{qty} шт</span>
                <span className="cc-price-card__eq">×</span>
                <span>{pricePerUnit} грн</span>
                <span className="cc-price-card__sum">{total} грн</span>
              </div>

              <Button
                type="primary"
                size="large"
                block
                className="cc-order-btn cc-order-btn--gold"
                onClick={handleAddToCart}
              >
                Додати до кошика
              </Button>
            </div>
          </div>

          {/* ── Form column ── */}
          <div className="cc-form-col">

            {/* 1. Template */}
            <div className="cc-field">
              <label className="cc-label">Шаблон</label>
              {templatesLoading ? (
                <Spin size="small" />
              ) : templates.length > 0 ? (
                <div className="cc-template-grid">
                  {templates.map(t => (
                    <button
                      key={t.id}
                      className={`cc-template-card${form.templateId === t.id ? ' cc-template-card--active' : ''}`}
                      onClick={() => update({ templateId: t.id })}
                    >
                      {t.imageUrl ? (
                        <img src={t.imageUrl} alt={t.name} className="cc-template-card__img" />
                      ) : (
                        <div className="cc-template-card__placeholder" />
                      )}
                      <span className="cc-template-card__name">{t.name}</span>
                      {t.priceModifier > 0 && (
                        <span className="cc-template-card__mod">+{t.priceModifier} грн</span>
                      )}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="cc-hint">Шаблони ще не додані</p>
              )}
            </div>

            {/* 2. Orientation */}
            <div className="cc-field">
              <label className="cc-label">Орієнтація</label>
              <div className="cc-chips">
                <button
                  className={`cc-chip${form.orientation === 'landscape' ? ' cc-chip--active' : ''}`}
                  onClick={() => update({ orientation: 'landscape' })}
                >
                  Альбомна
                </button>
                <button
                  className={`cc-chip${form.orientation === 'portrait' ? ' cc-chip--active' : ''}`}
                  onClick={() => update({ orientation: 'portrait' })}
                >
                  Книжкова
                </button>
              </div>
            </div>

            {/* 3. Paper type */}
            {paperTypes.length > 0 && (
              <div className="cc-field">
                <label className="cc-label">Папір</label>
                <div className="cc-chips">
                  {paperTypes.map(p => (
                    <button
                      key={p.id}
                      className={`cc-chip${form.paperTypeId === p.id ? ' cc-chip--active' : ''}`}
                      onClick={() => update({ paperTypeId: p.id })}
                    >
                      {p.name}
                      {p.priceModifier > 0 && <span className="cc-chip__mod">+{p.priceModifier}</span>}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 4. Texts section */}
            <div className="cc-section">
              <p className="cc-section__title">Текст грамоти</p>

              {/* Title */}
              <div className="cc-field">
                <label className="cc-label">Заголовок</label>
                <div className="cc-chips">
                  {CERTIFICATE_TITLES.map(t => (
                    <button
                      key={t}
                      className={`cc-chip${form.title === t ? ' cc-chip--active' : ''}`}
                      onClick={() => update({ title: t })}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Body text */}
              <div className="cc-field">
                <label className="cc-label">Текст нагороди</label>
                <Input.TextArea
                  value={form.bodyText}
                  onChange={e => update({ bodyText: e.target.value })}
                  placeholder="за перемогу в олімпіаді…"
                  autoSize={{ minRows: 2, maxRows: 5 }}
                  maxLength={settings.getNumber('certificate_max_body_length', 300)}
                  showCount
                />
              </div>

              {/* Names button */}
              <button
                className={`cc-names-btn${namedCount > 0 ? ' cc-names-btn--active' : ''}`}
                onClick={() => setNamesOpen(true)}
              >
                <UserOutlined />
                <span>
                  {namedCount > 0
                    ? `Іменні грамоти · ${namedCount} ${namedCount === 1 ? "ім'я" : namedCount < 5 ? 'імені' : 'імен'}`
                    : 'Іменні грамоти'}
                </span>
                <span className="cc-names-btn__arrow">›</span>
              </button>
            </div>

            {/* 5. Issuer section */}
            <div className="cc-section">
              <p className="cc-section__title">Від кого</p>

              <div className="cc-field">
                <label className="cc-label">Організація</label>
                <Input
                  value={form.organization}
                  onChange={e => update({ organization: e.target.value })}
                  placeholder="ЗОШ №5 ім. Тараса Шевченка"
                  maxLength={100}
                />
              </div>

              <div className="cc-field">
                <label className="cc-label">Рік</label>
                <Input
                  value={form.year}
                  onChange={e => update({ year: e.target.value })}
                  placeholder="2026"
                  maxLength={10}
                  style={{ maxWidth: 120 }}
                />
              </div>
            </div>

            {/* 6. Signer section */}
            <div className="cc-section">
              <p className="cc-section__title">Підписант</p>

              <div className="cc-field">
                <label className="cc-label">Ім'я</label>
                <Input
                  value={form.signerName}
                  onChange={e => update({ signerName: e.target.value })}
                  placeholder="Іванова О.П."
                  maxLength={80}
                />
              </div>

              <div className="cc-field">
                <label className="cc-label">Посада</label>
                <Input
                  value={form.signerTitle}
                  onChange={e => update({ signerTitle: e.target.value })}
                  placeholder="Директор школи"
                  maxLength={80}
                />
              </div>
            </div>

            {/* 6b. Second signer (conditional on template) */}
            {templateOption?.hasSecondSigner && (
              <div className="cc-section">
                <p className="cc-section__title">Другий підписант</p>
                <div className="cc-field">
                  <label className="cc-label">Ім'я</label>
                  <Input
                    value={form.signer2Name}
                    onChange={e => update({ signer2Name: e.target.value })}
                    placeholder="Петренко І.В."
                    maxLength={80}
                  />
                </div>
                <div className="cc-field">
                  <label className="cc-label">Посада</label>
                  <Input
                    value={form.signer2Title}
                    onChange={e => update({ signer2Title: e.target.value })}
                    placeholder="Голова методичної ради"
                    maxLength={80}
                  />
                </div>
              </div>
            )}

            {/* 6c. Additional text (conditional on template) */}
            {templateOption?.hasAdditionalText && (
              <div className="cc-field">
                <label className="cc-label">Додатковий текст</label>
                <Input
                  value={form.additionalText}
                  onChange={e => update({ additionalText: e.target.value })}
                  placeholder="Додаткова інформація"
                  maxLength={150}
                />
              </div>
            )}

            {/* 7. Font */}
            {fonts.length > 0 && (
              <div className="cc-field">
                <label className="cc-label">Шрифт</label>
                <div className="cc-font-chips">
                  {fonts.map(f => (
                    <button
                      key={f.id}
                      className={`cc-font-chip${form.fontId === f.id ? ' cc-font-chip--active' : ''}`}
                      onClick={() => update({ fontId: f.id })}
                      style={{ fontFamily: f.fontFamily }}
                    >
                      <span className="cc-font-chip__preview">Аб</span>
                      <span className="cc-font-chip__label">{f.name}</span>
                      {f.priceModifier > 0 && (
                        <span className="cc-font-chip__mod">+{f.priceModifier}</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 8. Comment */}
            <div className="cc-field">
              <label className="cc-label">Коментар / уточнення</label>
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

      <CertificateNamesDrawer
        open={namesOpen}
        onClose={() => setNamesOpen(false)}
        data={namesData}
        onChange={setNamesData}
      />
    </div>
  )
})

export default CertificateConstructor
