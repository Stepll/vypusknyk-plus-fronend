import { useEffect, useRef, useCallback } from 'react'
import type { BadgePhotoTransform } from '../../constants/badgeData'

const CANVAS_SIZE = 320
const CX = CANVAS_SIZE / 2
const CY = CANVAS_SIZE / 2
const BADGE_RADIUS = 148

function drawArcText(
  ctx: CanvasRenderingContext2D,
  text: string,
  pos: 'top' | 'bottom',
  fontSize: number,
  fontFamily: string,
  textColor: string,
) {
  // Text sits just inside the badge edge
  const r = BADGE_RADIUS - fontSize / 2 - 4

  ctx.save()
  ctx.font = `bold ${fontSize}px ${fontFamily}`
  ctx.fillStyle = textColor
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  const chars = text.split('')
  let totalWidth = 0
  chars.forEach(ch => { totalWidth += ctx.measureText(ch).width })
  const totalAngle = totalWidth / r

  ctx.translate(CX, CY)

  if (pos === 'top') {
    // Clockwise at top — readable left-to-right from outside
    let angle = -Math.PI / 2 - totalAngle / 2
    for (const ch of chars) {
      const ca = ctx.measureText(ch).width / r
      angle += ca / 2
      ctx.save()
      ctx.rotate(angle)
      ctx.translate(0, -r)
      ctx.fillText(ch, 0, 0)
      ctx.restore()
      angle += ca / 2
    }
  } else {
    // Counter-clockwise at bottom — readable left-to-right from outside
    let angle = Math.PI / 2 + totalAngle / 2
    for (const ch of chars) {
      const ca = ctx.measureText(ch).width / r
      angle -= ca / 2
      ctx.save()
      ctx.rotate(angle)
      ctx.translate(0, r)
      ctx.rotate(Math.PI)
      ctx.fillText(ch, 0, 0)
      ctx.restore()
      angle -= ca / 2
    }
  }

  ctx.restore()
}

interface Props {
  photoUrl: string | null
  photoTransform: BadgePhotoTransform
  topText: string
  bottomText: string
  textColor: string
  fontSize: number
  fontFamily: string
  onTransformChange: (t: BadgePhotoTransform) => void
  previewName: string
  namePosition: 'top' | 'bottom'
}

export default function BadgeEditorPreview({
  photoUrl,
  photoTransform,
  topText,
  bottomText,
  textColor,
  fontSize,
  fontFamily,
  onTransformChange,
  previewName,
  namePosition,
}: Props) {
  const canvasRef     = useRef<HTMLCanvasElement>(null)
  const imgRef        = useRef<HTMLImageElement | null>(null)
  const dragRef       = useRef<{ sx: number; sy: number; tx0: number; ty0: number } | null>(null)
  const drawRef       = useRef<(() => void) | null>(null)
  const transformRef  = useRef(photoTransform)
  const photoUrlRef   = useRef(photoUrl)

  // Keep refs in sync so wheel handler always has fresh values
  useEffect(() => { transformRef.current  = photoTransform }, [photoTransform])
  useEffect(() => { photoUrlRef.current   = photoUrl },       [photoUrl])

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE)

    // 1. Background circle
    ctx.save()
    ctx.beginPath()
    ctx.arc(CX, CY, BADGE_RADIUS, 0, Math.PI * 2)
    ctx.fillStyle = '#f0f0f0'
    ctx.fill()
    ctx.restore()

    // 2. Photo clipped to circle
    if (imgRef.current) {
      const img = imgRef.current
      const { scale, x, y, rotation } = photoTransform

      ctx.save()
      ctx.beginPath()
      ctx.arc(CX, CY, BADGE_RADIUS, 0, Math.PI * 2)
      ctx.clip()

      const fitScale =
        Math.max(
          (BADGE_RADIUS * 2) / img.naturalWidth,
          (BADGE_RADIUS * 2) / img.naturalHeight,
        ) * scale

      ctx.translate(CX + x, CY + y)
      ctx.rotate((rotation * Math.PI) / 180)
      ctx.drawImage(
        img,
        (-img.naturalWidth  * fitScale) / 2,
        (-img.naturalHeight * fitScale) / 2,
        img.naturalWidth  * fitScale,
        img.naturalHeight * fitScale,
      )
      ctx.restore()
    } else {
      // Placeholder
      ctx.save()
      ctx.beginPath()
      ctx.arc(CX, CY, BADGE_RADIUS, 0, Math.PI * 2)
      ctx.clip()
      ctx.fillStyle = '#d1d5db'
      ctx.font = '48px Arial'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('📷', CX, CY - 10)
      ctx.font = '13px Arial'
      ctx.fillStyle = '#9ca3af'
      ctx.fillText('Завантажте фото', CX, CY + 34)
      ctx.restore()
    }

    // 3. Badge boundary overlay
    ctx.save()
    ctx.beginPath()
    ctx.arc(CX, CY, BADGE_RADIUS - 1, 0, Math.PI * 2)
    ctx.strokeStyle = 'rgba(233, 30, 140, 0.55)'
    ctx.lineWidth = 2
    ctx.setLineDash([6, 5])
    ctx.stroke()
    ctx.restore()

    // 4. Arc texts
    const displayTop    = previewName && namePosition === 'top'    ? previewName : topText
    const displayBottom = previewName && namePosition === 'bottom' ? previewName : bottomText

    if (displayTop)    drawArcText(ctx, displayTop,    'top',    fontSize, fontFamily, textColor)
    if (displayBottom) drawArcText(ctx, displayBottom, 'bottom', fontSize, fontFamily, textColor)
  }, [photoTransform, topText, bottomText, textColor, fontSize, fontFamily, previewName, namePosition])

  useEffect(() => { drawRef.current = draw }, [draw])

  // Load image
  useEffect(() => {
    if (!photoUrl) {
      imgRef.current = null
      drawRef.current?.()
      return
    }
    const img = new Image()
    img.onload = () => { imgRef.current = img; drawRef.current?.() }
    img.src = photoUrl
  }, [photoUrl])

  // Redraw on state change
  useEffect(() => { draw() }, [draw])

  // Non-passive wheel listener to prevent page scroll on zoom
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    function onWheel(e: WheelEvent) {
      if (!photoUrlRef.current) return
      e.preventDefault()
      const delta = e.deltaY < 0 ? 0.1 : -0.1
      const t = transformRef.current
      onTransformChange({
        ...t,
        scale: Math.max(0.3, Math.min(8, t.scale + delta)),
      })
    }

    canvas.addEventListener('wheel', onWheel, { passive: false })
    return () => canvas.removeEventListener('wheel', onWheel)
  }, [onTransformChange])

  // ── Mouse drag ─────────────────────────────────────────────────────────────

  function handleMouseDown(e: React.MouseEvent) {
    if (!photoUrl) return
    dragRef.current = {
      sx: e.clientX,
      sy: e.clientY,
      tx0: photoTransform.x,
      ty0: photoTransform.y,
    }
  }

  function handleMouseMove(e: React.MouseEvent) {
    if (!dragRef.current) return
    onTransformChange({
      ...photoTransform,
      x: dragRef.current.tx0 + (e.clientX - dragRef.current.sx),
      y: dragRef.current.ty0 + (e.clientY - dragRef.current.sy),
    })
  }

  function handleMouseUp() { dragRef.current = null }

  return (
    <canvas
      ref={canvasRef}
      width={CANVAS_SIZE}
      height={CANVAS_SIZE}
      style={{
        display: 'block',
        borderRadius: '50%',
        cursor: !photoUrl ? 'default' : dragRef.current ? 'grabbing' : 'grab',
        boxShadow: '0 4px 24px rgba(0,0,0,0.13)',
        userSelect: 'none',
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    />
  )
}
