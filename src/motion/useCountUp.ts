import { useEffect, useRef, useState } from 'react'

/** Smoothly counts a displayed number toward `target`. */
export function useCountUp(target: number, duration = 900, reduced = false) {
  const [value, setValue] = useState(target)
  const fromRef = useRef(target)

  useEffect(() => {
    const from = fromRef.current
    if (from === target) {
      setValue(target)
      return
    }
    if (reduced) {
      fromRef.current = target
      setValue(target)
      return
    }

    const started = performance.now()
    let frame = 0

    const tick = (now: number) => {
      const t = Math.min(1, (now - started) / duration)
      const eased = 1 - (1 - t) ** 3
      setValue(Math.round(from + (target - from) * eased))
      if (t < 1) frame = requestAnimationFrame(tick)
      else fromRef.current = target
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [target, duration, reduced])

  return value
}
