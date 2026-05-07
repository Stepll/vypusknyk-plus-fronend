import { useEffect, useRef, useCallback } from 'react'
import type { CertificateOrientation } from '../../constants/certificateData'
import { CANVAS_LANDSCAPE, CANVAS_PORTRAIT } from '../../constants/certificateData'
import type { CertificateOrientationLayout } from '../../api/types'

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
): number {
  const words = text.split(' ')
  let line = ''
  let currentY = y
  for (const word of words) {
    const test = line ? `${line} ${word}` : word
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, currentY)
      line = word
      currentY += lineHeight
    } else {
      line = test
    }
  }
  if (line) ctx.fillText(line, x, currentY)
  return currentY
}

// Fallback layout when no template layout is configured
interface FallbackLayout {
  titleY: number; nameY: number; bodyStartY: number; orgY: number
  yearY: number; signerNameY: number; signerTitleY: number; signerX: number; margin: number
}

function getFallbackLayout(orientation: CertificateOrientation, w: number): FallbackLayout {
  if (orientation === 'landscape') {
    return { titleY: 100, nameY: 155, bodyStartY: 210, orgY: 340, yearY: 368,
      signerNameY: 400, signerTitleY: 420, signerX: w - 60, margin: 60 }
  }
  return { titleY: 140, nameY: 210, bodyStartY: 275, orgY: 475, yearY: 508,
    signerNameY: 560, signerTitleY: 585, signerX: w - 50, margin: 50 }
}

interface Props {
  templateUrl: string | null
  nativeOrientation: 'portrait' | 'landscape'
  orientation: CertificateOrientation
  layout: CertificateOrientationLayout | null
  title: string
  bodyText: string
  organization: string
  year: string
  signerName: string
  signerTitle: string
  signer2Name?: string
  signer2Title?: string
  additionalText?: string
  fontFamily: string
  previewName: string
}

export default function CertificateEditorPreview({
  templateUrl, nativeOrientation, orientation, layout,
  title, bodyText, organization, year,
  signerName, signerTitle, signer2Name, signer2Title, additionalText,
  fontFamily, previewName,
}: Props) {
  const { w, h } = orientation === 'landscape' ? CANVAS_LANDSCAPE : CANVAS_PORTRAIT
  const canvasRef   = useRef<HTMLCanvasElement>(null)
  const templateRef = useRef<HTMLImageElement | null>(null)
  const drawRef     = useRef<(() => void) | null>(null)

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, w, h)
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, w, h)

    // Draw template image with rotation if orientations differ
    if (templateRef.current) {
      const needsRotation = orientation !== nativeOrientation
      ctx.save()
      if (needsRotation) {
        if (nativeOrientation === 'portrait') {
          // Portrait image → landscape canvas: rotate 90° CW
          ctx.translate(w, 0)
          ctx.rotate(Math.PI / 2)
        } else {
          // Landscape image → portrait canvas: rotate 90° CCW
          ctx.translate(0, h)
          ctx.rotate(-Math.PI / 2)
        }
        ctx.drawImage(templateRef.current, 0, 0, h, w)
      } else {
        ctx.drawImage(templateRef.current, 0, 0, w, h)
      }
      ctx.restore()
    } else {
      ctx.strokeStyle = '#c9a84c'
      ctx.lineWidth = 3
      ctx.strokeRect(16, 16, w - 32, h - 32)
      ctx.strokeStyle = 'rgba(201, 168, 76, 0.3)'
      ctx.lineWidth = 1
      ctx.strokeRect(22, 22, w - 44, h - 44)
    }

    // Draw text using layout zones if available, otherwise fallback
    if (layout) {
      drawWithLayout(ctx, layout)
    } else {
      drawWithFallback(ctx)
    }
  }, [orientation, nativeOrientation, w, h, layout, title, bodyText, organization, year,
      signerName, signerTitle, signer2Name, signer2Title, additionalText, fontFamily, previewName]) // eslint-disable-line react-hooks/exhaustive-deps

  function zoneCenter(zone: { x: number; y: number; width: number; height: number }) {
    return { cx: zone.x + zone.width / 2, cy: zone.y + zone.height / 2 }
  }

  function drawWithLayout(ctx: CanvasRenderingContext2D, zones: CertificateOrientationLayout) {
    // Title
    const titleZone = zones.title
    ctx.save()
    ctx.font = `bold ${orientation === 'landscape' ? 28 : 24}px ${fontFamily}`
    ctx.fillStyle = '#1a1a2e'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.letterSpacing = '3px'
    ctx.fillText(title, titleZone.x + titleZone.width / 2, titleZone.y + titleZone.height / 2)
    ctx.restore()

    // Decorative line under title
    ctx.save()
    const lineW = Math.min(180, titleZone.width * 0.4)
    const lineCx = titleZone.x + titleZone.width / 2
    ctx.strokeStyle = '#c9a84c'
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.moveTo(lineCx - lineW / 2, titleZone.y + titleZone.height + 4)
    ctx.lineTo(lineCx + lineW / 2, titleZone.y + titleZone.height + 4)
    ctx.stroke()
    ctx.restore()

    // Name
    if (previewName) {
      const nameZone = zones.name
      ctx.save()
      ctx.font = `italic ${orientation === 'landscape' ? 20 : 18}px ${fontFamily}`
      ctx.fillStyle = '#374151'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(previewName, nameZone.x + nameZone.width / 2, nameZone.y + nameZone.height / 2)
      ctx.restore()
    }

    // Body text
    if (bodyText) {
      const bz = zones.bodyText
      ctx.save()
      ctx.font = `${orientation === 'landscape' ? 13 : 12}px ${fontFamily}`
      ctx.fillStyle = '#374151'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      wrapText(ctx, bodyText, bz.x + bz.width / 2, bz.y + 12, bz.width, 20)
      ctx.restore()
    }

    // Additional text (optional)
    if (additionalText && zones.additionalText) {
      const az = zones.additionalText
      ctx.save()
      ctx.font = `13px ${fontFamily}`
      ctx.fillStyle = '#6b7280'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(additionalText, az.x + az.width / 2, az.y + az.height / 2)
      ctx.restore()
    }

    // Organization
    if (organization) {
      const oz = zones.organization
      ctx.save()
      ctx.font = `600 ${orientation === 'landscape' ? 12 : 11}px ${fontFamily}`
      ctx.fillStyle = '#6b7280'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(organization, oz.x + oz.width / 2, oz.y + oz.height / 2)
      ctx.restore()
    }

    // Year
    if (year) {
      const yz = zones.year
      ctx.save()
      ctx.font = `12px ${fontFamily}`
      ctx.fillStyle = '#9ca3af'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(year, yz.x + yz.width / 2, yz.y + yz.height / 2)
      ctx.restore()
    }

    // Signer 1
    if (signerName || signerTitle) {
      const snz = zones.signerName
      const stz = zones.signerTitle
      ctx.save()
      ctx.textAlign = 'right'
      ctx.textBaseline = 'middle'
      if (signerName) {
        ctx.font = `600 12px ${fontFamily}`
        ctx.fillStyle = '#374151'
        ctx.fillText(signerName, snz.x + snz.width, snz.y + snz.height / 2)
      }
      if (signerTitle) {
        ctx.font = `11px ${fontFamily}`
        ctx.fillStyle = '#9ca3af'
        ctx.fillText(signerTitle, stz.x + stz.width, stz.y + stz.height / 2)
      }
      // Signature line above
      ctx.strokeStyle = '#d1d5db'
      ctx.lineWidth = 1
      ctx.beginPath()
      const lEnd = snz.x + snz.width
      ctx.moveTo(lEnd - Math.min(120, snz.width), snz.y - 4)
      ctx.lineTo(lEnd, snz.y - 4)
      ctx.stroke()
      ctx.restore()
    }

    // Signer 2
    if ((signer2Name || signer2Title) && zones.signer2Name) {
      const s2n = zones.signer2Name
      const s2t = zones.signer2Title
      ctx.save()
      ctx.textAlign = 'left'
      ctx.textBaseline = 'middle'
      if (signer2Name) {
        ctx.font = `600 12px ${fontFamily}`
        ctx.fillStyle = '#374151'
        ctx.fillText(signer2Name, s2n.x, s2n.y + s2n.height / 2)
      }
      if (signer2Title) {
        ctx.font = `11px ${fontFamily}`
        ctx.fillStyle = '#9ca3af'
        ctx.fillText(signer2Title, s2t.x, s2t.y + s2t.height / 2)
      }
      ctx.strokeStyle = '#d1d5db'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(s2n.x, s2n.y - 4)
      ctx.lineTo(s2n.x + Math.min(120, s2n.width), s2n.y - 4)
      ctx.stroke()
      ctx.restore()
    }
  }

  function drawWithFallback(ctx: CanvasRenderingContext2D) {
    const fb = getFallbackLayout(orientation, w)
    const cx = w / 2
    const bodyMaxWidth = w - fb.margin * 2

    ctx.save()
    ctx.font = `bold ${orientation === 'landscape' ? 32 : 28}px ${fontFamily}`
    ctx.fillStyle = '#1a1a2e'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.letterSpacing = '3px'
    ctx.fillText(title, cx, fb.titleY)
    ctx.restore()

    ctx.save()
    const lineW = Math.min(200, w * 0.4)
    ctx.strokeStyle = '#c9a84c'
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.moveTo(cx - lineW / 2, fb.titleY + 22)
    ctx.lineTo(cx + lineW / 2, fb.titleY + 22)
    ctx.stroke()
    ctx.restore()

    if (previewName) {
      ctx.save()
      ctx.font = `italic ${orientation === 'landscape' ? 22 : 20}px ${fontFamily}`
      ctx.fillStyle = '#374151'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(previewName, cx, fb.nameY)
      ctx.restore()
    }

    if (bodyText) {
      ctx.save()
      ctx.font = `${orientation === 'landscape' ? 14 : 13}px ${fontFamily}`
      ctx.fillStyle = '#374151'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      wrapText(ctx, bodyText, cx, fb.bodyStartY, bodyMaxWidth, 22)
      ctx.restore()
    }

    if (organization) {
      ctx.save()
      ctx.font = `600 ${orientation === 'landscape' ? 13 : 12}px ${fontFamily}`
      ctx.fillStyle = '#6b7280'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(organization, cx, fb.orgY)
      ctx.restore()
    }

    if (year) {
      ctx.save()
      ctx.font = `13px ${fontFamily}`
      ctx.fillStyle = '#9ca3af'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(year, cx, fb.yearY)
      ctx.restore()
    }

    if (signerName || signerTitle) {
      ctx.save()
      ctx.textAlign = 'right'
      ctx.textBaseline = 'middle'
      if (signerName) {
        ctx.font = `600 13px ${fontFamily}`
        ctx.fillStyle = '#374151'
        ctx.fillText(signerName, fb.signerX, fb.signerNameY)
      }
      if (signerTitle) {
        ctx.font = `12px ${fontFamily}`
        ctx.fillStyle = '#9ca3af'
        ctx.fillText(signerTitle, fb.signerX, fb.signerTitleY)
      }
      ctx.strokeStyle = '#d1d5db'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(fb.signerX - 120, fb.signerNameY - 18)
      ctx.lineTo(fb.signerX, fb.signerNameY - 18)
      ctx.stroke()
      ctx.restore()
    }
  }

  useEffect(() => { drawRef.current = draw }, [draw])

  useEffect(() => {
    if (!templateUrl) {
      templateRef.current = null
      drawRef.current?.()
      return
    }
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => { templateRef.current = img; drawRef.current?.() }
    img.onerror = () => { templateRef.current = null; drawRef.current?.() }
    img.src = templateUrl
  }, [templateUrl])

  useEffect(() => { draw() }, [draw])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.width  = w
    canvas.height = h
    draw()
  }, [w, h, draw])

  return (
    <canvas
      ref={canvasRef}
      width={w}
      height={h}
      style={{
        display: 'block', width: '100%', height: 'auto',
        borderRadius: 8, boxShadow: '0 4px 24px rgba(0,0,0,0.13)',
      }}
    />
  )
}
