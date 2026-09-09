import { motion } from 'framer-motion'
import { useEffect } from 'react'
import { sideArt } from '../../assets'
import { usePrefersReducedMotion } from '../../motion/reduced'

/**
 * Pink toast beat between the hub and the board — the existing play-toast
 * language, used as a doorway rather than a dead-end screen.
 */
export function GameIntro({ onDone }: { onDone: () => void }) {
  const reduced = usePrefersReducedMotion()

  useEffect(() => {
    const timer = setTimeout(onDone, reduced ? 180 : 1280)
    return () => clearTimeout(timer)
  }, [onDone, reduced])

  return (
    <motion.button
      className="game-intro"
      type="button"
      onClick={onDone}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reduced ? 0.12 : 0.36, ease: [0.22, 1, 0.36, 1] }}
      aria-label="Продолжить"
    >
      <motion.div
        className="game-intro__glow"
        animate={reduced ? undefined : { scale: [1, 1.08, 1], opacity: [0.55, 0.8, 0.55] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
      />

      <motion.img
        className="game-intro__food"
        src={sideArt.toastNew}
        alt=""
        initial={{ scale: 0.72, rotate: -8, y: 24 }}
        animate={{ scale: 1, rotate: -2, y: 0 }}
        transition={{ type: 'spring', stiffness: 280, damping: 18, mass: 0.9 }}
      />

      <motion.span
        className="game-intro__new"
        initial={{ opacity: 0, scale: 0.7, rotate: -8 }}
        animate={{ opacity: 1, scale: 1, rotate: -4 }}
        transition={{ type: 'spring', stiffness: 420, damping: 16, delay: 0.16 }}
      >
        NEW
      </motion.span>
    </motion.button>
  )
}
