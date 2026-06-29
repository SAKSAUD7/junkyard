import { useInView } from 'react-intersection-observer'

/**
 * Returns [ref, isVisible] using IntersectionObserver.
 * triggerOnce = true means the animation only plays once.
 */
export function useScrollReveal(threshold = 0.12, triggerOnce = true) {
  const [ref, inView] = useInView({ threshold, triggerOnce })
  return [ref, inView]
}
