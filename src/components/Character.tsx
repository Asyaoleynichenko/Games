import { AnimatePresence, motion } from 'framer-motion'
import { stickerArt } from '../assets'
import { slotPosition, stickerSizeFor, type Character } from '../data/characters'
import { slots, stickerById } from '../data/stickers'
import { usePrefersReducedMotion } from '../motion/reduced'
import type { CharacterMood } from '../state/HubState'
import { Sparkles } from './Ui'

const moodAnimate: Record<CharacterMood, Record<string, number[]>> = {
  idle: { y: [0, -4, 0], rotate: [-0.5, 0.5, -0.5], scale: [1, 1.012, 1] },
  happy: { y: [0, -8, 0], rotate: [-1.2, 1.2, -1.2], scale: [1, 1.045, 1] },
  excited: { y: [0, -12, 0], scale: [1, 1.07, 0.98, 1] },
  levelup: { scale: [1, 1.12, 1.03], y: [0, -10, 0] },
  reward: { y: [0, -6, 0], rotate: [-2, 2, -2], scale: [1, 1.03, 1] },
  playing: { y: [0, -6, 0], rotate: [-0.8, 0.8, -0.8], scale: [1, 1.02, 1] },
}

const moodTransition: Record<CharacterMood, object> = {
  idle: { duration: 5.2, repeat: Infinity, ease: 'easeInOut' },
  happy: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  excited: { duration: 0.48, ease: [0.22, 1, 0.36, 1] },
  levelup: { duration: 0.85, ease: [0.22, 1, 0.36, 1] },
  reward: { duration: 2.8, repeat: Infinity, ease: 'easeInOut' },
  playing: { duration: 3.4, repeat: Infinity, ease: 'easeInOut' },
}

/** A physical die-cut sticker, using the exported Figma artwork. */
export function StickerImage({
  id,
  size,
  locked = false,
}: {
  id: string
  size: number | string
  locked?: boolean
}) {
  const art = stickerArt[id]
  const sticker = stickerById(id)
  if (!art) return null
  return (
    <img
      src={art}
      alt={sticker?.title ?? ''}
      style={{
        width: size,
        maxWidth: '100%',
        height: 'auto',
        display: 'block',
        filter: locked
          ? 'grayscale(1) opacity(0.4)'
          : 'drop-shadow(0 4px 8px rgba(31,31,31,0.28))',
      }}
    />
  )
}

/** Simple glasses accessory, unlocked at the next level. */
function Glasses() {
  return (
    <svg viewBox="0 0 200 78" width="100%" aria-hidden>
      <rect x="6" y="14" width="80" height="50" rx="24" fill="#241c33" />
      <rect x="114" y="14" width="80" height="50" rx="24" fill="#241c33" />
      <path d="M86 32h28" stroke="#241c33" strokeWidth="10" strokeLinecap="round" />
      <path d="M20 26c8-6 18-8 26-6" stroke="#fff" strokeOpacity="0.45" strokeWidth="6" strokeLinecap="round" />
      <path d="M128 26c8-6 18-8 26-6" stroke="#fff" strokeOpacity="0.45" strokeWidth="6" strokeLinecap="round" />
    </svg>
  )
}

export function CharacterHero({
  character,
  size,
  placed,
  accessories = [],
  animateIds = [],
  highlight = null,
  float = false,
  celebrate = false,
  shared = false,
  mood,
}: {
  character: Character
  size?: number
  placed: string[]
  accessories?: string[]
  animateIds?: string[]
  highlight?: string | null
  float?: boolean
  celebrate?: boolean
  shared?: boolean
  mood?: CharacterMood
}) {
  const box = size ?? character.size
  const stickerSize = stickerSizeFor(character, box)
  const reduced = usePrefersReducedMotion()
  const resolved: CharacterMood = celebrate
    ? 'levelup'
    : (mood ?? (float ? 'idle' : 'idle'))
  const frozen = reduced || (!mood && !celebrate && !float)
  const sparkle =
    resolved === 'happy' ||
    resolved === 'excited' ||
    resolved === 'levelup' ||
    resolved === 'reward'

  const stickerPct = (stickerSize / box) * 100

  return (
    <motion.div
      className="hero-body"
      layoutId={shared ? `hero-body-${character.id}` : undefined}
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: box,
        aspectRatio: '1 / 1',
        height: 'auto',
        margin: '0 auto',
        zIndex: 1,
        filter: 'none',
      }}
      animate={frozen ? { y: 0, rotate: 0, scale: 1 } : moodAnimate[resolved]}
      transition={frozen ? { duration: 0 } : moodTransition[resolved]}
    >
      {sparkle && !reduced && <Sparkles count={10} radius={box * 0.42} />}
      <img
        src={character.art}
        alt={character.name}
        style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
      />

      <AnimatePresence>
        {accessories.includes('glasses') && (
          <motion.div
            key="glasses"
            initial={{ opacity: 0, y: -box * 0.1, scale: 0.85 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 320, damping: 16, delay: 0.15 }}
            style={{
              position: 'absolute',
              left: `${character.accessory.left}%`,
              top: `${character.accessory.top}%`,
              width: `${character.accessory.width}%`,
            }}
          >
            <Glasses />
          </motion.div>
        )}
      </AnimatePresence>

      {placed.map((id, index) => {
        const slot = slots[index]
        if (!slot) return null
        const shouldAnimate = animateIds.includes(id)
        const pos = slotPosition(character, slot)
        return (
          <motion.div
            key={id}
            layoutId={shouldAnimate ? `place-${id}` : undefined}
            style={{
              position: 'absolute',
              left: `${pos.left}%`,
              top: `${pos.top}%`,
              translateX: '-50%',
              translateY: '-50%',
              zIndex: 2,
            }}
            initial={
              shouldAnimate
                ? { scale: 1.15, rotate: slot.rotate - 16, opacity: 1 }
                : { scale: slot.scale, rotate: slot.rotate, opacity: 1 }
            }
            animate={
              shouldAnimate
                ? { scale: [1.12, slot.scale * 1.08, slot.scale], rotate: slot.rotate, opacity: 1 }
                : { scale: slot.scale, rotate: slot.rotate, opacity: 1 }
            }
            transition={
              shouldAnimate
                ? { type: 'spring', stiffness: 420, damping: 18, mass: 0.8 }
                : { duration: 0 }
            }
          >
            <div style={{ position: 'relative' }}>
              <StickerImage id={id} size={`${stickerPct}%`} />
              {highlight === id && (
                <motion.span
                  style={{
                    position: 'absolute',
                    inset: -8,
                    borderRadius: '50%',
                    border: '3px solid #fff',
                  }}
                  animate={{ opacity: [0.9, 0.2, 0.9], scale: [1, 1.1, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                />
              )}
            </div>
          </motion.div>
        )
      })}
    </motion.div>
  )
}
