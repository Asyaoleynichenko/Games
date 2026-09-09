import { motion } from 'framer-motion'
import { useCallback, useEffect, useRef, useState } from 'react'
import { ui } from '../../assets'

type Slice = { x: number; width: number; tilt: number }

const BOARD_W = 361
const BOARD_H = 215
const MIN_WIDTH = 36
const TARGET = 7

/**
 * Toast stacking round — the play frame in Figma only shows a photo of a
 * toast tower, so this is the playable reading of that image: drop slices
 * onto the pile, keep the overlap, build seven high.
 */
export function ToastStack({
  seed,
  dropTick = 0,
  enabled,
  onScore,
}: {
  seed: number
  dropTick?: number
  enabled: boolean
  onScore: (xp: number) => void
}) {
  const [stack, setStack] = useState<Slice[]>([
    { x: 112, width: 140, tilt: -4 },
  ])
  const [flyerX, setFlyerX] = useState(40)
  const [miss, setMiss] = useState(false)
  const [won, setWon] = useState(false)
  const dir = useRef(1)
  const xRef = useRef(40)
  const frozen = useRef(false)
  const flyRef = useRef<HTMLSpanElement>(null)
  const onScoreRef = useRef(onScore)
  onScoreRef.current = onScore

  const stackRef = useRef(stack)
  const wonRef = useRef(won)
  stackRef.current = stack
  wonRef.current = won

  const reset = useCallback(() => {
    frozen.current = false
    dir.current = 1
    xRef.current = 40
    setFlyerX(40)
    setMiss(false)
    setWon(false)
    setStack([{ x: 112, width: 140, tilt: -4 }])
  }, [])

  const drop = useCallback(() => {
    if (!enabled) return
    if (wonRef.current) {
      reset()
      return
    }
    if (frozen.current) return
    const current = stackRef.current
    const top = current[current.length - 1]
    const width = top.width
    const x = xRef.current
    const left = Math.max(x, top.x)
    const right = Math.min(x + width, top.x + top.width)
    const overlap = right - left

    if (overlap < MIN_WIDTH) {
      setMiss(true)
      frozen.current = true
      setTimeout(() => {
        setMiss(false)
        frozen.current = false
      }, 420)
      return
    }

    const next: Slice = {
      x: left,
      width: overlap,
      tilt: current.length % 2 === 0 ? -5 : 6,
    }
    const piled = [...current, next]
    setStack(piled)
    xRef.current = left
    setFlyerX(left)
    onScoreRef.current(40)

    if (piled.length >= TARGET) {
      frozen.current = true
      setWon(true)
    }
  }, [enabled, reset])

  const dropRef = useRef(drop)
  dropRef.current = drop

  useEffect(() => {
    reset()
  }, [seed, reset])

  useEffect(() => {
    if (dropTick === 0) return
    dropRef.current()
  }, [dropTick])

  useEffect(() => {
    if (!enabled) return
    let frame = 0
    let last = performance.now()
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      if (!frozen.current) {
        const current = stackRef.current
        const top = current[current.length - 1]
        const width = top?.width ?? 140
        const speed = 160 + current.length * 18
        let x = xRef.current + dir.current * speed * dt
        const max = BOARD_W - width - 8
        if (x < 8) {
          x = 8
          dir.current = 1
        } else if (x > max) {
          x = max
          dir.current = -1
        }
        xRef.current = x
        if (flyRef.current) {
          flyRef.current.style.transform = `translate(${x}px, 16px)`
        }
      }
      frame = requestAnimationFrame(loop)
    }
    frame = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(frame)
  }, [enabled])

  const top = stack[stack.length - 1]
  const flyerWidth = won ? 0 : top.width
  const baseY = BOARD_H - 28

  return (
    <button className="toast-game" onClick={drop} aria-label="Уронить тост">
      <img className="toast-game__photo" src={ui.photoToastStack} alt="" />
      <div className="toast-game__play">
        {stack.map((slice, index) => (
          <motion.span
            key={`${seed}-${index}`}
            className="toast-slice"
            initial={{ y: -40, opacity: 0 }}
            animate={{
              x: slice.x,
              y: baseY - index * 20,
              width: slice.width,
              rotate: slice.tilt,
              opacity: 1,
            }}
            transition={{ type: 'spring', stiffness: 420, damping: 22 }}
            style={{ height: 24 }}
          />
        ))}

        {!won && (
          <span
            ref={flyRef}
            className={`toast-slice toast-slice--fly${miss ? ' is-miss' : ''}`}
            style={{
              width: flyerWidth,
              height: 24,
              transform: `translate(${flyerX}px, 16px)`,
            }}
          />
        )}
      </div>

      <p className="toast-game__hint">
        {won
          ? 'Башня готова!'
          : miss
            ? 'Мимо — ещё раз'
            : `Нажми · ${stack.length}/${TARGET}`}
      </p>
    </button>
  )
}
