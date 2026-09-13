import { motion } from 'framer-motion'
import { ui } from '../assets'

/**
 * The white progress pill from Figma: rounded track (#f3f3f5) with a green
 * fill (#20bf7a), yellow milestone stars and the "+100 XP" badge on the end.
 */
export function ProgressPill({ progress }: { progress: number }) {
  const percent = Math.min(100, progress * 100)

  return (
    <div className="progress-pill">
      <Star size={30} style={{ marginRight: 4, flexShrink: 0, zIndex: 2 }} />

      <div className="progress-pill__track">
        <motion.div
          animate={{ width: `${percent}%` }}
          initial={false}
          transition={{ type: 'spring', stiffness: 90, damping: 18, mass: 0.9 }}
          style={{
            height: '100%',
            borderRadius: 'var(--r-progress)',
            background: 'var(--green)',
          }}
        />
      </div>

      <Star size={30} className="progress-pill__star--mid" />

      <img
        src={ui.badge100}
        alt="+100 XP"
        style={{
          width: 54,
          marginLeft: 4,
          marginRight: -8,
          flexShrink: 0,
          zIndex: 2,
          filter: 'drop-shadow(0 2px 4px rgba(31,31,31,0.25))',
        }}
      />
    </div>
  )
}

function Star({
  size,
  style,
  className,
}: {
  size: number
  style?: React.CSSProperties
  className?: string
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      style={style}
      className={className}
      aria-hidden
    >
      <path
        d="M12 1.8l3.1 6.5 7.1.9-5.2 4.9 1.3 7-6.3-3.4-6.3 3.4 1.3-7L1.8 9.2l7.1-.9L12 1.8Z"
        fill="var(--star)"
        stroke="#fff"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/** Level badge + progress + the «Ещё N XP» line, as one reusable block. */
export function ProgressBlock({
  level,
  progress,
  note,
  onTheme,
}: {
  level: number
  progress: number
  note?: string
  onTheme: string
}) {
  return (
    <div className="progress-block">
      <span className="levelbadge">{level} уровень</span>
      <ProgressPill progress={progress} />
      {note && (
        <span
          style={{
            color: onTheme,
            fontSize: 17,
            fontWeight: 500,
            textAlign: 'center',
          }}
        >
          {note}
        </span>
      )}
    </div>
  )
}
