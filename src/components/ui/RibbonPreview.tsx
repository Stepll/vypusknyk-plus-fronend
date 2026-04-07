import { motion, AnimatePresence } from 'framer-motion'
import './RibbonPreview.css'

export type ColorVariant = 'coral' | 'blue-yellow' | 'white' | 'gold'

const TEXT_STYLE: Record<ColorVariant, 'white-text' | 'dark-text'> = {
  coral:        'white-text',
  'blue-yellow': 'white-text',
  white:        'dark-text',
  gold:         'dark-text',
}

function BellIcon({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 48 52" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M24 4C16 4 10 11 10 20v10l-4 6h36l-4-6V20C38 11 32 4 24 4z"
        fill={color}
        fillOpacity="0.9"
      />
      <circle cx="24" cy="42" r="4" fill={color} fillOpacity="0.9" />
      <path d="M20 4 Q24 1 28 4 Q24 6 20 4z" fill={color} fillOpacity="0.9" />
    </svg>
  )
}

interface RibbonPreviewProps {
  name?:      string
  variant?:   ColorVariant
  emblemKey?: number
}

export default function RibbonPreview({
  name      = "Ваше ім'я",
  variant   = 'coral',
  emblemKey = 0,
}: RibbonPreviewProps) {
  const textStyle = TEXT_STYLE[variant]
  const bellColor = textStyle === 'dark-text' ? '#1a1a1a' : '#ffffff'

  return (
    <div className="ribbon">
      <AnimatePresence>
        <motion.div
          key={variant}
          className={`ribbon__bg ribbon__bg--${variant}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        />
      </AnimatePresence>

      <div className="ribbon__content">
        <div className="ribbon__bell">
          <AnimatePresence mode="wait">
            <motion.div
              key={emblemKey}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -18 }}
              transition={{ duration: 0.18, ease: 'easeInOut' }}
              style={{ width: '100%', height: '100%' }}
            >
              <BellIcon color={bellColor} />
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="ribbon__text">
          <AnimatePresence mode="wait">
            <motion.div
              key={name}
              className={`ribbon__name ribbon__name--${textStyle}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
            >
              {name}
            </motion.div>
          </AnimatePresence>

          <div className={`ribbon__title ribbon__title--${textStyle}`}>
            Випускник 2026
          </div>

          <div className={`ribbon__meta ribbon__meta--${textStyle}`}>
            <span>Ваш клас</span>
            <span>Ваш ліцей</span>
          </div>
        </div>
      </div>
    </div>
  )
}
