/** Procedural theme backdrops — SVG only, no Figma PNGs. */

import { useEffect, useRef } from 'react'

export type BurstVariant = 'purple' | 'magenta' | 'orange'

function rng(seed: number) {
  let s = seed % 2147483647
  if (s <= 0) s += 2147483646
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

function polar(cx: number, cy: number, r: number, deg: number) {
  const a = (deg * Math.PI) / 180
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)] as const
}

function wedge(
  cx: number,
  cy: number,
  inner: number,
  outer: number,
  angle: number,
  width: number,
) {
  const [x1, y1] = polar(cx, cy, inner, angle - width / 2)
  const [x2, y2] = polar(cx, cy, inner, angle + width / 2)
  const [x3, y3] = polar(cx, cy, outer, angle + width / 2)
  const [x4, y4] = polar(cx, cy, outer, angle - width / 2)
  return `${x1},${y1} ${x2},${y2} ${x3},${y3} ${x4},${y4}`
}

/** Egg hub — Figma «Sunshine 65»: soft god-rays fanning down from the top. */
function Sunshine() {
  const rand = rng(17)
  const ox = 50
  const oy = 10
  const beams = Array.from({ length: 16 }, (_, i) => {
    const mid = 58 + i * 4.15 + (rand() - 0.5) * 2.4
    const spread = 1.1 + rand() * 2.6
    const len = 42 + rand() * 38
    const [lx, ly] = polar(ox, oy, len, mid - spread)
    const [rx, ry] = polar(ox, oy, len * (0.82 + rand() * 0.2), mid + spread)
    return {
      points: `${ox},${oy} ${lx},${ly} ${rx},${ry}`,
      opacity: 0.12 + rand() * 0.28,
    }
  })

  return (
    <svg className="burst burst--purple" viewBox="0 0 100 100" aria-hidden>
      <defs>
        <filter id="burst-soft" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="0.55" />
        </filter>
        <radialGradient id="burst-hole-purple" cx="50%" cy="42%" r="42%">
          <stop offset="0%" stopColor="#fff" stopOpacity="0" />
          <stop offset="38%" stopColor="#fff" stopOpacity="0" />
          <stop offset="52%" stopColor="#fff" stopOpacity="1" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0.15" />
        </radialGradient>
        <mask id="burst-mask-purple">
          <rect width="100" height="100" fill="url(#burst-hole-purple)" />
        </mask>
      </defs>
      <g filter="url(#burst-soft)" mask="url(#burst-mask-purple)" fill="#fff">
        {beams.map((beam, i) => (
          <polygon key={i} points={beam.points} opacity={beam.opacity} />
        ))}
      </g>
    </svg>
  )
}

/** Toast hub — Figma «Lines»: sharp manga burst, white → magenta. */
function MagentaLines() {
  const rand = rng(42)
  const rays: { points: string }[] = []
  let angle = rand() * 8
  while (angle < 360) {
    const width = 0.7 + rand() * 7.5
    const inner = 20 + rand() * 6
    const outer = 46 + rand() * 10
    rays.push({ points: wedge(50, 50, inner, outer, angle, width) })
    angle += width + 2.4 + rand() * 9
  }

  return (
    <svg className="burst burst--magenta" viewBox="0 0 100 100" aria-hidden>
      <defs>
        <linearGradient id="burst-mag" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#ff47fc" />
        </linearGradient>
      </defs>
      <g fill="url(#burst-mag)" opacity="0.85">
        {rays.map((ray, i) => (
          <polygon key={i} points={ray.points} />
        ))}
      </g>
    </svg>
  )
}

function clamp01(value: number) {
  return Math.max(0, Math.min(1, value))
}

/**
 * Comic ink at a point in 0–1 frame space.
 * Open highlight behind the lemon; weight in the corners and along the floor.
 */
function comicTone(nx: number, ny: number) {
  const dx = (nx - 0.5) * 1.08
  const dy = (ny - 0.27) * 0.9
  const dist = Math.sqrt(dx * dx + dy * dy)
  const highlight = clamp01((dist - 0.1) * 1.55)
  const gravity = clamp01(ny * 0.68 + nx * 0.16)
  const left = Math.max(0, 0.18 - nx) * 3
  const right = Math.max(0, nx - 0.82) * 2.8
  const bottom = Math.max(0, ny - 0.66) * 1.7
  const corners = clamp01(left + right + bottom)
  return clamp01(highlight * 0.32 + gravity * 0.34 + corners * 0.42)
}

function stampScreen(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  angle: number,
  spacing: number,
  amp: number,
  seed: number,
) {
  const rad = (angle * Math.PI) / 180
  const cos = Math.cos(rad)
  const sin = Math.sin(rad)
  const rowH = spacing * 0.86602540378
  const reach = Math.hypot(w, h) * 0.62
  const cols = Math.ceil((reach * 2) / spacing) + 2
  const rows = Math.ceil((reach * 2) / rowH) + 2
  const cx = w * 0.5
  const cy = h * 0.3
  const rand = rng(seed)

  ctx.save()
  ctx.translate(cx, cy)
  ctx.rotate(rad)

  for (let row = 0; row < rows; row += 1) {
    const ly = -reach + row * rowH
    const stagger = (row % 2) * spacing * 0.5
    for (let col = 0; col < cols; col += 1) {
      const lx = -reach + col * spacing + stagger
      const wx = cx + lx * cos - ly * sin
      const wy = cy + lx * sin + ly * cos
      if (wx < -spacing || wx > w + spacing || wy < -spacing || wy > h + spacing) {
        continue
      }
      const tone = comicTone(wx / w, wy / h) * amp
      if (tone < 0.05) continue
      const shaped = tone * tone * (3 - 2 * tone)
      const radius = spacing * (0.08 + 0.36 * shaped)
      if (radius < 0.32) continue
      ctx.beginPath()
      ctx.arc(
        lx + (rand() - 0.5) * 0.45,
        ly + (rand() - 0.5) * 0.45,
        radius,
        0,
        Math.PI * 2,
      )
      ctx.fill()
    }
  }

  ctx.restore()
}

/**
 * Lemon print screen — two Ben-Day plates at print angles.
 * Dot size carries the tone, the way comics actually screen a fill.
 */
export function LemonHalftone() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const paint = () => {
      const w = canvas.clientWidth
      const h = canvas.clientHeight
      if (w < 8 || h < 8 || w > 1200 || h > 2000) return
      const dpr = Math.min(2, window.devicePixelRatio || 1)
      const bw = Math.round(w * dpr)
      const bh = Math.round(h * dpr)
      if (canvas.width !== bw || canvas.height !== bh) {
        canvas.width = bw
        canvas.height = bh
      }
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, w, h)
      ctx.fillStyle = 'rgba(198, 96, 0, 0.7)'
      stampScreen(ctx, w, h, 16, 13, 0.88, 3)
      ctx.fillStyle = 'rgba(210, 118, 24, 0.45)'
      stampScreen(ctx, w, h, 61, 7.6, 0.4, 11)
    }

    paint()
    const observer = new ResizeObserver(paint)
    observer.observe(canvas)
    return () => observer.disconnect()
  }, [])

  return <canvas ref={canvasRef} className="halftone" aria-hidden />
}

/** Lemon hub — Figma «Lines»: comic sunburst from behind the fruit, cream → gold. */
function OrangeLines() {
  const rand = rng(99)
  const cx = 500
  const cy = 380
  const rays: string[] = []
  let angle = rand() * 3
  while (angle < 360) {
    const width = 1.8 + rand() * 4.6
    const gap = 1.15 + rand() * 2.2
    const outer = 710 + rand() * 90
    rays.push(wedge(cx, cy, 0, outer, angle + width / 2, width))
    angle += width + gap
  }

  return (
    <svg
      className="burst burst--orange"
      viewBox="0 0 1000 1000"
      preserveAspectRatio="xMidYMid slice"
      shapeRendering="geometricPrecision"
      aria-hidden
    >
      <defs>
        <radialGradient id="burst-org" cx="50%" cy="38%" r="62%">
          <stop offset="0%" stopColor="#fff8d6" stopOpacity="0.08" />
          <stop offset="28%" stopColor="#ffe066" stopOpacity="0.32" />
          <stop offset="70%" stopColor="#ffbf48" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#ffbf48" stopOpacity="0" />
        </radialGradient>
        <filter id="burst-org-aa" x="-8%" y="-8%" width="116%" height="116%">
          <feGaussianBlur stdDeviation="0.9" />
        </filter>
      </defs>
      <g fill="url(#burst-org)" opacity="0.55" filter="url(#burst-org-aa)">
        {rays.map((points, i) => (
          <polygon key={i} points={points} />
        ))}
      </g>
    </svg>
  )
}

export function RaysBurst({ variant }: { variant: BurstVariant }) {
  if (variant === 'magenta') return <MagentaLines />
  if (variant === 'orange') return <OrangeLines />
  return <Sunshine />
}

/** Burst inside a reward card — unique seed, kind and colours per sticker. */
export function CardRays({
  seed,
  kind,
  from,
  to,
}: {
  seed: number
  kind: 'soft' | 'lines' | 'needles'
  from: string
  to: string
}) {
  const uid = `card-${seed}`
  const rand = rng(seed)

  if (kind === 'soft') {
    const ox = 50
    const oy = 12
    const beams = Array.from({ length: 14 }, (_, i) => {
      const mid = 56 + i * 4.6 + (rand() - 0.5) * 2.2
      const spread = 1.2 + rand() * 2.8
      const len = 40 + rand() * 36
      const [lx, ly] = polar(ox, oy, len, mid - spread)
      const [rx, ry] = polar(ox, oy, len * (0.8 + rand() * 0.2), mid + spread)
      return {
        points: `${ox},${oy} ${lx},${ly} ${rx},${ry}`,
        opacity: 0.16 + rand() * 0.32,
      }
    })
    return (
      <svg className="featured__svg" viewBox="0 0 100 100" aria-hidden>
        <defs>
          <filter id={`${uid}-soft`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="0.5" />
          </filter>
          <linearGradient id={`${uid}-grad`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={from} />
            <stop offset="100%" stopColor={to} />
          </linearGradient>
        </defs>
        <g filter={`url(#${uid}-soft)`} fill={`url(#${uid}-grad)`}>
          {beams.map((beam, i) => (
            <polygon key={i} points={beam.points} opacity={beam.opacity} />
          ))}
        </g>
      </svg>
    )
  }

  const rays: { points: string }[] = []
  let angle = rand() * 10
  const fat = kind === 'needles' ? 3.2 : 7.2
  const gap = kind === 'needles' ? 5.4 : 8.5
  while (angle < 360) {
    const width = 0.55 + rand() * fat
    const inner = 18 + rand() * 7
    const outer = 44 + rand() * 12
    rays.push({ points: wedge(50, 46, inner, outer, angle, width) })
    angle += width + 2 + rand() * gap
  }

  return (
    <svg className="featured__svg" viewBox="0 0 100 100" aria-hidden>
      <defs>
        <linearGradient id={`${uid}-grad`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={from} />
          <stop offset="100%" stopColor={to} />
        </linearGradient>
      </defs>
      <g fill={`url(#${uid}-grad)`} opacity="0.88">
        {rays.map((ray, i) => (
          <polygon key={i} points={ray.points} />
        ))}
      </g>
    </svg>
  )
}
