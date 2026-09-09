import { motion } from 'framer-motion'
import { stickerArt } from '../../assets'
import {
  awardCopy,
  COLLECTION_ORDER,
  LOCKED_ORDER,
  stickerById,
} from '../../data/stickers'
import { featuredTheme } from '../../data/featured'
import { ShareIcon } from './Chrome'
import { CardRays } from './Rays'

const smart = { type: 'spring' as const, stiffness: 380, damping: 36, mass: 0.9 }

function LockMark() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <rect x="2.5" y="6" width="9" height="6.5" rx="1.6" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M4.4 6V4.6a2.6 2.6 0 0 1 5.2 0V6"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  )
}

export interface AwardsGridProps {
  unlocked: string[]
  placed: string[]
  openId: string | null
  onPick: (id: string | null) => void
  onStick: (id: string) => void
}

export function AwardsGrid({
  unlocked,
  placed,
  openId,
  onPick,
  onStick,
}: AwardsGridProps) {
  const ordered = [
    ...COLLECTION_ORDER.filter((id) => unlocked.includes(id)),
    ...unlocked.filter((id) => !COLLECTION_ORDER.includes(id)),
  ]

  const locked = LOCKED_ORDER.filter(
    (id) => !unlocked.includes(id) && id !== openId,
  )

  const cells: { id: string; locked: boolean }[] = [
    ...ordered.filter((id) => id !== openId).map((id) => ({ id, locked: false })),
    ...locked.map((id) => ({ id, locked: true })),
  ]

  return (
    <div className="awards-stack">
      {openId && (
        <RewardCard
          key={openId}
          id={openId}
          placed={placed.includes(openId)}
          locked={!unlocked.includes(openId)}
          onClose={() => onPick(null)}
          onStick={() => onStick(openId)}
        />
      )}

      <motion.div className="awards-grid" layout transition={smart}>
        {cells.map(({ id, locked: isLocked }) => {
          const copy = awardCopy(id)
          const art = stickerArt[id]

          if (isLocked) {
            return (
              <motion.button
                key={id}
                className="awardcard awardcard--locked"
                layout
                onClick={() => onPick(id)}
                whileTap={{ scale: 0.96 }}
                aria-label={`${copy.title}. Не открыто. ${copy.requirement}. Награда: ${copy.reward}`}
                transition={smart}
              >
                {art && <img src={art} alt="" />}
                <span className="awardcard__lock">
                  <LockMark />
                </span>
              </motion.button>
            )
          }

          return (
            <motion.button
              key={id}
              className={`awardcard${stickerById(id)?.rare ? ' awardcard--rare' : ''}`}
              layout
              onClick={() => onPick(id)}
              whileTap={{ scale: 0.96 }}
              aria-label={copy.title}
              transition={smart}
            >
              <motion.img
                layoutId={`award-art-${id}`}
                src={art}
                alt=""
                transition={smart}
              />
            </motion.button>
          )
        })}
      </motion.div>
    </div>
  )
}

export function RewardCard({
  id,
  placed,
  locked = false,
  onClose,
  onStick,
}: {
  id: string
  placed: boolean
  locked?: boolean
  onClose: () => void
  onStick: () => void
}) {
  const copy = awardCopy(id)
  const theme = featuredTheme(id)

  return (
    <motion.div layout className="awards-featured" transition={smart}>
      <motion.article
        className={`featured${locked ? ' featured--locked' : ''}`}
        layout
        initial={{ opacity: 0, y: -12, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -8, scale: 0.97 }}
        transition={smart}
        onClick={onClose}
        style={{
          background: `linear-gradient(180deg, ${theme.from} 0%, ${theme.mid} 42%, #ffffff 100%)`,
        }}
      >
        <div
          className={`featured__burst featured__burst--${theme.motion}`}
          aria-hidden
        >
          <CardRays
            seed={theme.seed}
            kind={theme.rayKind}
            from={theme.rayFrom}
            to={theme.rayTo}
          />
        </div>

        <motion.img
          className="featured__art"
          layoutId={locked ? undefined : `award-art-${id}`}
          src={stickerArt[id]}
          alt=""
          transition={smart}
        />

        {locked ? (
          <span className="featured__lock glass" aria-hidden>
            <LockMark />
          </span>
        ) : (
          <button
            className="featured__share glass"
            aria-label="Поделиться"
            onClick={(event) => event.stopPropagation()}
          >
            <ShareIcon />
          </button>
        )}

        <motion.h3
          className="featured__name"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.32, delay: 0.14, ease: [0.22, 1, 0.36, 1] }}
        >
          {copy.title}
        </motion.h3>
        <motion.p
          className="featured__desc"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.32, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        >
          {locked
            ? `Чтобы открыть — ${copy.requirement}\nНаграда: ${copy.reward}`
            : copy.body}
        </motion.p>
      </motion.article>

      {!locked && !placed && (
        <motion.button
          className="featured__stick"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, delay: 0.16, ease: [0.22, 1, 0.36, 1] }}
          onClick={onStick}
        >
          Наклеить
        </motion.button>
      )}
    </motion.div>
  )
}

