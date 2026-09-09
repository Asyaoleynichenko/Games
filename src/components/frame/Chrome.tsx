import { useRef } from 'react'
import { sideArt, ui } from '../../assets'
import { useAmbientBackground } from '../../motion/ambient'
import { usePrefersReducedMotion } from '../../motion/reduced'
import PrismaticBurst from './PrismaticBurst'
import { LemonHalftone, RaysBurst } from './Rays'

/**
 * Per-character frame furniture, read off the hub frames.
 *
 * The three characters each own a themed background and sit at their own
 * offset and size — the lemon artwork bleeds past the top-left corner, the
 * egg and toast are inset. Neighbours are the cropped 282px peeks.
 */
export interface FrameTheme {
  base: string
  hero: { left: number; top: number; size: number; opacity: number }
  /**
   * The neighbour artwork each frame carries, and the character it depicts —
   * tapping a neighbour goes to the character you can see, which is not
   * always the adjacent one in the carousel.
   */
  left: { art: string; to: string; left: number; top: number }
  right: { art: string; to: string; left: number; top: number }
  /** Colour of the «Ещё 85 XP» line on this background. */
  onTheme: string
}

export const themes: Record<string, FrameTheme> = {
  egg: {
    base: 'var(--purple)',
    hero: { left: 39, top: 27, size: 338, opacity: 1 },
    left: { art: sideArt.orangeFace, to: 'lemon', left: -173, top: 45 },
    right: { art: sideArt.toastNew, to: 'toast', left: 347, top: 53 },
    onTheme: '#ffffff',
  },
  toast: {
    base: 'var(--magenta)',
    hero: { left: 28, top: 27, size: 338, opacity: 1 },
    left: { art: sideArt.orangeFace, to: 'lemon', left: -173, top: 45 },
    right: { art: sideArt.egg, to: 'egg', left: 337, top: 53 },
    onTheme: '#ffffff',
  },
  lemon: {
    base: 'var(--orange)',
    hero: { left: -14, top: -15, size: 421, opacity: 1 },
    left: { art: sideArt.toast, to: 'toast', left: -173, top: 45 },
    right: { art: sideArt.egg, to: 'egg', left: 337, top: 53 },
    onTheme: '#1f1f1f',
  },
}

/** Base fill plus the frame's ray texture, composited as in Figma. */
const THEME_ORDER = ['egg', 'toast', 'lemon'] as const

export function burstFor(character: string) {
  if (character === 'toast') return 'magenta'
  if (character === 'lemon') return 'orange'
  return 'purple'
}

export function ThemeLayer({
  character,
  paused = false,
}: {
  character: string
  paused?: boolean
}) {
  const reduced = usePrefersReducedMotion()

  if (character === 'egg') {
    return (
      <PrismaticBurst
        animationType="rotate3d"
        intensity={2}
        speed={0.5}
        distort={0}
        paused={paused || reduced}
        offset={{ x: 0, y: 0 }}
        hoverDampness={0.25}
        rayCount={0}
        mixBlendMode="lighten"
        colors={['#ff007a', '#4d3dff', '#ffffff']}
        color0="#A855F7"
        color1="#7C3AED"
        color2="#6366F1"
      />
    )
  }

  return (
    <>
      {character === 'lemon' && <LemonHalftone />}
      <div className="rays-spin">
        <RaysBurst variant={burstFor(character)} />
      </div>
    </>
  )
}

/** Base fill plus the frame's ray texture, composited as in Figma. */
export function ThemeBackground({ character }: { character: string }) {
  const theme = themes[character]

  return (
    <div className="frame__bg" style={{ background: theme.base }}>
      <ThemeLayer character={character} />
    </div>
  )
}

/** Cross-fades the three themes as the game pager scrolls. */
export function BlendedBackground({
  progress,
  pace = 1,
}: {
  progress: number
  /** 1 = hub idle. Play / intro slightly accelerates the rays. */
  pace?: number
}) {
  const rootRef = useRef<HTMLDivElement>(null)
  const reduced = usePrefersReducedMotion()
  useAmbientBackground(rootRef, reduced, pace)

  return (
    <div className="frame__bg" ref={rootRef}>
      {THEME_ORDER.map((id, index) => {
        const opacity = Math.max(0, 1 - Math.abs(progress - index))
        return (
          <div
            key={id}
            className="frame__bg-layer"
            style={{ opacity, background: themes[id].base }}
          >
            <ThemeLayer character={id} paused={opacity < 0.02} />
          </div>
        )
      })}
    </div>
  )
}

export function TrophyIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden>
      <path
        d="M4.2 2h6.6v2.8c0 1.82-1.49 3.3-3.3 3.3S4.2 6.62 4.2 4.8V2Z"
        stroke="#1f1f1f"
        strokeWidth="1.35"
        strokeLinejoin="round"
      />
      <path
        d="M10.8 2.75h1.4c.83 0 1.5.67 1.5 1.5v.12c0 1.12-.83 2.07-1.94 2.24M4.2 2.75H2.8c-.83 0-1.5.67-1.5 1.5v.12c0 1.12.83 2.07 1.94 2.24"
        stroke="#1f1f1f"
        strokeWidth="1.35"
        strokeLinecap="round"
      />
      <path
        d="M7.5 8.15v2M5.35 12.85h4.3M5.7 12.85C5.7 11.7 6.52 10.85 7.5 10.85s1.8.85 1.8 2"
        stroke="#1f1f1f"
        strokeWidth="1.35"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function GiftIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden>
      <rect
        x="1.9"
        y="6.1"
        width="12.2"
        height="8"
        rx="1.5"
        stroke="#1f1f1f"
        strokeWidth="1.5"
      />
      <path d="M1 6.1h14M8 6.1v8" stroke="#1f1f1f" strokeWidth="1.5" />
      <path
        d="M8 6.1S6.6 2.1 4.9 2.1a1.9 1.9 0 0 0 0 4M8 6.1s1.4-4 3.1-4a1.9 1.9 0 0 1 0 4"
        stroke="#1f1f1f"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function BellIcon() {
  return (
    <svg width="15" height="16" viewBox="0 0 16 17" fill="none" aria-hidden>
      <path
        d="M8 1.6a4.3 4.3 0 0 0-4.3 4.3v2.4L2.5 10.8h11L12.3 8.3V5.9A4.3 4.3 0 0 0 8 1.6Z"
        stroke="#1f1f1f"
        strokeWidth="1.35"
        strokeLinejoin="round"
      />
      <path
        d="M6.3 12.9a1.8 1.8 0 0 0 3.4 0"
        stroke="#1f1f1f"
        strokeWidth="1.35"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function ShareIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden>
      <path
        d="M7.5 1.5v8"
        stroke="#1f1f1f"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M4.6 4.4 7.5 1.5l2.9 2.9"
        stroke="#1f1f1f"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M2.2 9v2.9c0 .9.7 1.6 1.6 1.6h7.4c.9 0 1.6-.7 1.6-1.6V9"
        stroke="#1f1f1f"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  )
}

/** Figma 18:3831 / 18:3832 — 37.28×34.45 star, fill only, 1.88 corner, hard 1.25 offset. */
export function ProgressStar({
  className = '',
  style,
}: {
  className?: string
  style?: React.CSSProperties
}) {
  return (
    <svg
      className={['xpinfo__star', className].filter(Boolean).join(' ')}
      style={style}
      viewBox="0 0 37.28 34.45"
      fill="none"
      aria-hidden
    >
      <path
        d="M18.64 1.2 22.96 11.3l11.12.86-8.52 7.24 2.68 10.82-9.6-5.94-9.6 5.94 2.68-10.82-8.52-7.24 11.12-.86Z"
        fill="var(--star)"
        stroke="var(--star)"
        strokeWidth="1.88"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export interface HeaderProps {
  onRewards: () => void
  onTasks: () => void
}

/** Two 38×38 glass Tabs — trophy / bell — same instance on every frame. */
export function FrameHeader({ onRewards, onTasks }: HeaderProps) {
  return (
    <>
      <button
        className="hpill glass hpill--rewards"
        onClick={onRewards}
        aria-label="Награды"
      >
        <span className="hpill__icon">
          <TrophyIcon />
        </span>
      </button>
      <button
        className="hpill glass hpill--bell"
        onClick={onTasks}
        aria-label="Задания"
      >
        <span className="hpill__icon">
          <BellIcon />
        </span>
      </button>
    </>
  )
}

/**
 * The nav is a single export from the design, so the tabs are transparent hit
 * areas laid over it.
 */
export function FrameNav({
  onHome,
  onProfile,
}: {
  onHome: () => void
  onProfile: () => void
}) {
  return (
    <div className="navbar">
      <img src={ui.bottomNav} alt="" />
      <button
        className="navbar__tab navbar__tab--home"
        onClick={onHome}
        aria-label="Главная"
      />
      <button
        className="navbar__tab navbar__tab--profile"
        onClick={onProfile}
        aria-label="Профиль"
      />
    </div>
  )
}
