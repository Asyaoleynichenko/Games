import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

export function Cta({
  children,
  onClick,
  variant = 'green',
  size = 'lg',
  block = false,
}: {
  children: ReactNode
  onClick?: () => void
  variant?: 'green' | 'white' | 'ghost'
  size?: 'lg' | 'sm'
  block?: boolean
}) {
  const classes = [
    'cta',
    block ? 'cta--block' : '',
    size === 'sm' ? 'cta--sm' : '',
    variant === 'white' ? 'cta--white' : '',
    variant === 'ghost' ? 'cta--ghost' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <motion.button
      className={classes}
      onClick={onClick}
      whileTap={{ scale: 0.965 }}
      transition={{ type: 'spring', stiffness: 520, damping: 22 }}
    >
      {children}
    </motion.button>
  )
}

/** Floating «+N XP» — appears at the action, then travels toward the bar. */
export function FloatingXp({
  amount,
  from = 'center',
}: {
  amount: number
  from?: 'center' | 'board'
}) {
  const start = from === 'board' ? 168 : 80
  return (
    <motion.div
      initial={{ opacity: 0, y: start, scale: 0.72 }}
      animate={{
        opacity: [0, 1, 1, 0],
        y: [start, start * 0.35, 4, -28],
        scale: [0.72, 1, 1, 0.92],
      }}
      transition={{ duration: 1.35, times: [0, 0.22, 0.72, 1], ease: [0.22, 1, 0.36, 1] }}
      style={{
        position: 'absolute',
        left: '50%',
        top: 'calc(340 * 100cqh / 852)',
        translateX: '-50%',
        padding: '8px 16px',
        borderRadius: 'var(--r-pill)',
        background: '#fff',
        color: 'var(--ink)',
        fontWeight: 700,
        fontSize: 18,
        boxShadow: 'var(--shadow-float)',
        pointerEvents: 'none',
        whiteSpace: 'nowrap',
        zIndex: 8,
      }}
    >
      +{amount} XP
    </motion.div>
  )
}

export function Sparkles({ count = 12, radius = 130 }: { count?: number; radius?: number }) {
  const points = Array.from({ length: count }, (_, i) => {
    const angle = (360 / count) * i + (i % 2 ? 12 : -8)
    const distance = radius * (i % 3 === 0 ? 1 : 0.76)
    return {
      id: i,
      x: Math.cos((angle * Math.PI) / 180) * distance,
      y: Math.sin((angle * Math.PI) / 180) * distance,
      size: i % 3 === 0 ? 14 : 9,
      delay: (i % 5) * 0.07,
    }
  })

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 3 }} aria-hidden>
      {points.map((p) => (
        <motion.span
          key={p.id}
          initial={{ opacity: 0, scale: 0.2, x: 0, y: 0 }}
          animate={{ opacity: [0, 1, 0], scale: [0.2, 1, 0.5], x: p.x, y: p.y }}
          transition={{ duration: 1.25, delay: p.delay, ease: 'easeOut' }}
          style={{
            position: 'absolute',
            left: '50%',
            top: '46%',
            width: p.size,
            height: p.size,
            marginLeft: -p.size / 2,
            marginTop: -p.size / 2,
            background:
              'radial-gradient(circle, #fff 0%, rgba(255,245,200,0.9) 45%, rgba(255,245,200,0) 70%)',
            borderRadius: '50%',
          }}
        />
      ))}
    </div>
  )
}

export function BottomSheet({
  children,
  onClose,
}: {
  children: ReactNode
  onClose: () => void
}) {
  return (
    <motion.div
      className="overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={onClose}
    >
      <motion.div
        className="bottomsheet"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 340, damping: 32 }}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="bottomsheet__grip" />
        {children}
      </motion.div>
    </motion.div>
  )
}
