import { useEffect, useRef, useCallback } from 'react'
import type { CertificateOrientation } from '../../constants/certificateData'
import { CANVAS_LANDSCAPE, CANVAS_PORTRAIT } from '../../constants/certificateData'

interface Layout {
  titleY: number
  nameY: number
  bodyStartY: number
  orgY: number
  yearY: number
  signerNameY: number
  signerTitleY: number
  signerX: number
  margin: number
}

function getLayout(orientation: CertificateOrientation, w: number): Layout {
  if (orientation === 'landscape') {
    return {
      titleY: 100,
      nameY: 155,
      bodyStartY: 210,
      orgY: 340,
      yearY: 368,
      signerNameY: 400,
      signerTitleY: 420,
      signerX: w - 60,
      margin: 60,
    }
  }
  return {
    titleY: 140,
    nameY: 210,
    bodyStartY: 275,
    orgY: 475,
    yearY: 508,
    signerNameY: 560,
    signerTitleY: 585,
    signerX: w - 50,
    margin: 50,
  }
}

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

interface Props {
  templateUrl: string | null
  orientation: CertificateOrientation
  title: string
  bodyText: string
  organization: string
  year: string
  signerName: string
  signerTitle: string
  fontFamily: string
  previewName: string
}

export default function CertificateEditorPreview({
  templateUrl,
  orientation,
  title,
  bodyText,
  organization,
  year,
  signerName,
  signerTitle,
  fontFamily,
  previewName,
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

    const layout = getLayout(orientation, w)

    ctx.clearRect(0, 0, w, h)

    // 1. White background
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, w, h)

    // 2. Template PNG
    if (templateRef.current) {
      ctx.drawImage(templateRef.current, 0, 0, w, h)
    } else {
      // Decorative fallback border
      ctx.strokeStyle = '#c9a84c'
      ctx.lineWidth = 3
      ctx.strokeRect(16, 16, w - 32, h - 32)
      ctx.strokeStyle = 'rgba(201, 168, 76, 0.3)'
      ctx.lineWidth = 1
      ctx.strokeRect(22, 22, w - 44, h - 44)
    }

    const cx = w / 2
    const bodyMaxWidth = w - layout.margin * 2

    // 3. Title
    ctx.save()
    ctx.font = `bold ${orientation === 'landscape' ? 32 : 28}px ${fontFamily}`
    ctx.fillStyle = '#1a1a2e'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.letterSpacing = '3px'
    ctx.fillText(title, cx, layout.titleY)
    ctx.restore()

    // 4. Decorative line under title
    ctx.save()
    const lineW = Math.min(200, w * 0.4)
    ctx.strokeStyle = '#c9a84c'
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.moveTo(cx - lineW / 2, layout.titleY + 22)
    ctx.lineTo(cx + lineW / 2, layout.titleY + 22)
    ctx.stroke()
    ctx.restore()

    // 5. Name (from names cycle, italic)
    if (previewName) {
      ctx.save()
      ctx.font = `italic ${orientation === 'landscape' ? 22 : 20}px ${fontFamily}`
      ctx.fillStyle = '#374151'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(previewName, cx, layout.nameY)
      ctx.restore()
    }

    // 6. Body text
    if (bodyText) {
      ctx.save()
      ctx.font = `${orientation === 'landscape' ? 14 : 13}px ${fontFamily}`
      ctx.fillStyle = '#374151'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      wrapText(ctx, bodyText, cx, layout.bodyStartY, bodyMaxWidth, 22)
      ctx.restore()
    }

    // 7. Organization
    if (organization) {
      ctx.save()
      ctx.font = `600 ${orientation === 'landscape' ? 13 : 12}px ${fontFamily}`
      ctx.fillStyle = '#6b7280'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(organization, cx, layout.orgY)
      ctx.restore()
    }

    // 8. Year
    if (year) {
      ctx.save()
      ctx.font = `13px ${fontFamily}`
      ctx.fillStyle = '#9ca3af'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(year, cx, layout.yearY)
      ctx.restore()
    }

    // 9. Signer name + title (right-aligned)
    if (signerName || signerTitle) {
      ctx.save()
      ctx.textAlign = 'right'
      ctx.textBaseline = 'middle'

      if (signerName) {
        ctx.font = `600 13px ${fontFamily}`
        ctx.fillStyle = '#374151'
        ctx.fillText(signerName, layout.signerX, layout.signerNameY)
      }

      if (signerTitle) {
        ctx.font = `12px ${fontFamily}`
        ctx.fillStyle = '#9ca3af'
        ctx.fillText(signerTitle, layout.signerX, layout.signerTitleY)
      }

      // Signature line
      ctx.strokeStyle = '#d1d5db'
      ctx.lineWidth = 1
      ctx.beginPath()
      const lineEnd = layout.signerX
      const lineStart = lineEnd - 120
      const lineY = layout.signerNameY - 18
      ctx.moveTo(lineStart, lineY)
      ctx.lineTo(lineEnd, lineY)
      ctx.stroke()
      ctx.restore()
    }
  }, [orientation, w, h, title, bodyText, organization, year, signerName, signerTitle, fontFamily, previewName])

  useEffect(() => { drawRef.current = draw }, [draw])

  // Load template image
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

  // Redraw on any prop change
  useEffect(() => { draw() }, [draw])

  // Resize canvas when orientation changes
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
        display: 'block',
        width: '100%',
        height: 'auto',
        borderRadius: 8,
        boxShadow: '0 4px 24px rgba(0,0,0,0.13)',
      }}
    />
  )
}
