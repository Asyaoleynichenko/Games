import { useReducedMotion } from 'framer-motion'

/** Single reduced-motion read for both Framer and GSAP loops. */
export function usePrefersReducedMotion() {
  return Boolean(useReducedMotion())
}
