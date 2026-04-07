import { motion } from 'framer-motion'
import { useScrollAnimation } from '../../hooks/useScrollAnimation'

type Direction = 'up' | 'down' | 'left' | 'right' | 'fade'

interface AnimatedSectionProps {
  children: React.ReactNode
  className?: string
  delay?: number
  direction?: Direction
}

const variants: Record<Direction, { hidden: object; visible: object }> = {
  up:    { hidden: { opacity: 0, y: 50 },  visible: { opacity: 1, y: 0 } },
  down:  { hidden: { opacity: 0, y: -50 }, visible: { opacity: 1, y: 0 } },
  left:  { hidden: { opacity: 0, x: -60 }, visible: { opacity: 1, x: 0 } },
  right: { hidden: { opacity: 0, x: 60 },  visible: { opacity: 1, x: 0 } },
  fade:  { hidden: { opacity: 0 },         visible: { opacity: 1 } },
}

export default function AnimatedSection({
  children,
  className = '',
  delay = 0,
  direction = 'up',
}: AnimatedSectionProps) {
  const { ref, isInView } = useScrollAnimation()

  return (
    <motion.div
      ref={ref}
      className={className}
      variants={variants[direction]}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      transition={{ duration: 0.6, delay, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  )
}
