import { motion } from 'framer-motion'
import { ui } from '../../assets'
import { useCountUp } from '../../motion/useCountUp'
import { usePrefersReducedMotion } from '../../motion/reduced'
import { useHub } from '../../state/HubState'
import { ProgressStar } from './Chrome'

const TRACK = 235
const PILL_W = 267

/**
 * The frames draw the opening state — 415 XP, 85 to go — with the track
 * filled to 126 of 235. Fill and the leading star are percentages of the
 * live pill, so they stay glued when the frame scales.
 */
const DESIGN_FILL = 126 / TRACK
const PROMO_GAP = 85
/** Star 1 sits at left 124 when the fill is 126 (Figma Tab coords). */
const STAR_HEAD_INSET = 2

/** XP Info: 267×122 at 63,341 — Progress container on every hub/play frame. */
export function XpInfo({ onTheme }: { onTheme: string }) {
  const { level, xpToNext } = useHub()
  const reduced = usePrefersReducedMotion()
  const shownToNext = useCountUp(xpToNext, 900, reduced)

  const earned = Math.max(0, Math.min(PROMO_GAP, PROMO_GAP - xpToNext))
  const progress = Math.min(
    1,
    DESIGN_FILL + (1 - DESIGN_FILL) * (earned / PROMO_GAP),
  )
  const fillPct = `${progress * 100}%`
  const starHeadPct = `${(Math.max(0, TRACK * progress - STAR_HEAD_INSET) / PILL_W) * 100}%`

  return (
    <div className="xpinfo">
      <p className="xpinfo__level">
        <span className="xpinfo__level-stroke" aria-hidden>
          {level} уровень
        </span>
        <span className="xpinfo__level-fill">{level} уровень</span>
      </p>

      <div className="xpinfo__pill">
        <div className="xpinfo__track">
          <div className="xpinfo__rest" />
          <motion.div
            className="xpinfo__fill"
            animate={{ width: fillPct }}
            initial={{ width: fillPct }}
            transition={{ duration: 0.95, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>

        <ProgressStar className="xpinfo__star--start" />
        <motion.div
          className="xpinfo__star-head"
          animate={{ left: starHeadPct }}
          initial={{ left: starHeadPct }}
          transition={{ duration: 0.95, ease: [0.22, 1, 0.36, 1] }}
        >
          <ProgressStar />
        </motion.div>

        <img className="xpinfo__badge" src={ui.badge100} alt="" />
      </div>

      <p className="xpinfo__note" style={{ color: onTheme }}>
        {shownToNext > 0
          ? `Ещё ${shownToNext} XP — и новый промокод`
          : 'Промокод открыт!'}
      </p>
    </div>
  )
}
