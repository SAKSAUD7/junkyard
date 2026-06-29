import { motion } from 'framer-motion'
import { useScrollReveal } from '../hooks/useScrollReveal'

/**
 * Drop-in wrapper that fades + slides up on scroll.
 * Usage: <MotionSection delay={0.1}> ... </MotionSection>
 */
export default function MotionSection({
  children,
  delay = 0,
  duration = 0.55,
  y = 32,
  className = '',
  style = {},
  as = 'div',
}) {
  const [ref, inView] = useScrollReveal()
  const Tag = motion[as] || motion.div

  return (
    <Tag
      ref={ref}
      className={className}
      style={style}
      initial={{ opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y }}
      transition={{ duration, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {children}
    </Tag>
  )
}

/**
 * Stagger container — wraps children and staggers their reveal.
 * Children must be MotionItem components.
 */
export function MotionStagger({ children, stagger = 0.09, delay = 0, className = '', style = {} }) {
  const [ref, inView] = useScrollReveal(0.08)
  return (
    <motion.div
      ref={ref}
      className={className}
      style={style}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      variants={{ visible: { transition: { staggerChildren: stagger, delayChildren: delay } } }}
    >
      {children}
    </motion.div>
  )
}

/**
 * Individual child item for MotionStagger.
 */
export function MotionItem({ children, className = '', style = {}, y = 24 }) {
  return (
    <motion.div
      className={className}
      style={style}
      variants={{
        hidden:  { opacity: 0, y },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } },
      }}
    >
      {children}
    </motion.div>
  )
}
