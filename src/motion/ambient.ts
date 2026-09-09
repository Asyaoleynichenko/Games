import gsap from 'gsap'
import { useEffect, useRef, type RefObject } from 'react'

/**
 * Continuous environment motion. Lives on the persistent stage so navigation
 * never restarts the loop — only the pace changes.
 */
export function useAmbientBackground(
  rootRef: RefObject<HTMLElement | null>,
  reduced: boolean,
  pace = 1,
) {
  const timelineRef = useRef<gsap.core.Timeline | null>(null)

  useEffect(() => {
    const root = rootRef.current
    if (!root || reduced) return

    const ctx = gsap.context(() => {
      const timeline = gsap.timeline()
      timeline.to(
        '.rays-spin',
        {
          rotation: 360,
          duration: 28,
          ease: 'none',
          repeat: -1,
          transformOrigin: '50% 28%',
          force3D: false,
        },
        0,
      )
      timeline.to(
        '.halftone',
        {
          x: 10,
          y: -6,
          duration: 16,
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
          force3D: false,
        },
        0,
      )
      timeline.to(
        '.frame__bg-layer',
        {
          scale: 1.03,
          duration: 16,
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
          transformOrigin: '50% 28%',
          force3D: false,
        },
        0,
      )
      timeline.timeScale(pace)
      timelineRef.current = timeline
    }, root)

    return () => {
      timelineRef.current = null
      ctx.revert()
    }
  }, [reduced, rootRef])

  useEffect(() => {
    timelineRef.current?.timeScale(pace)
  }, [pace])
}

/** Side-fruit idle float — slower than the hero, so the stage reads as depth. */
export function useSideAmbient(
  rootRef: RefObject<HTMLElement | null>,
  reduced: boolean,
) {
  useEffect(() => {
    const root = rootRef.current
    if (!root || reduced) return

    return undefined
  }, [reduced, rootRef])
}

/** Pointer parallax on background and neighbours only — never the shared hero. */
export function useStageParallax(
  rootRef: RefObject<HTMLElement | null>,
  reduced: boolean,
) {
  useEffect(() => {
    const root = rootRef.current
    if (!root || reduced) return

    const onMove = (event: PointerEvent) => {
      const rect = root.getBoundingClientRect()
      const nx = (event.clientX - rect.left) / rect.width - 0.5
      const ny = (event.clientY - rect.top) / rect.height - 0.5
      gsap.to(root.querySelectorAll('.frame__bg-layer'), {
        x: nx * 6,
        y: ny * 4,
        duration: 1.1,
        ease: 'power2.out',
        overwrite: 'auto',
      })
    }

    root.addEventListener('pointermove', onMove)
    return () => root.removeEventListener('pointermove', onMove)
  }, [reduced, rootRef])
}
