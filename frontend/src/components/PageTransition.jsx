import { motion, AnimatePresence } from 'framer-motion'
import { useLocation } from 'react-router-dom'
import { hasBottomNav } from '../utils/mobileNav'

const variants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.38, ease: [0.25, 0.46, 0.45, 0.94] } },
  exit:    { opacity: 0, y: -8, transition: { duration: 0.22, ease: 'easeIn' } },
}

export default function PageTransition({ children }) {
  const location = useLocation()
  // Height-locked shells (admin portal) manage their own viewport; 100vh exceeds
  // the mobile layout viewport and would add a second, phantom page scrollbar.
  const fillsViewport = hasBottomNav(location.pathname)
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        variants={variants}
        initial="initial"
        animate="animate"
        exit="exit"
        style={fillsViewport ? { minHeight: '100vh' } : { height: '100%' }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
