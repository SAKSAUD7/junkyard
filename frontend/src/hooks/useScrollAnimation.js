import { useEffect, useRef, useState } from 'react'

export default function useScrollAnimation(threshold = 0.1) {
    const [isVisible, setIsVisible] = useState(false)
    const ref = useRef(null)

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true)
                    // Optionally unobserve after first intersection
                    // observer.unobserve(entry.target)
                }
            },
            {
                threshold,
                rootMargin: '50px',
            }
        )

        const currentRef = ref.current
        if (currentRef) {
            observer.observe(currentRef)
        }

        return () => {
            if (currentRef) {
                observer.unobserve(currentRef)
            }
        }
    }, [threshold])

    return [ref, isVisible]
}

// Hook for staggered animations
export function useStaggeredAnimation(itemCount, delay = 100) {
    const [visibleItems, setVisibleItems] = useState(new Set())
    const ref = useRef(null)

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    // Stagger the appearance of items
                    for (let i = 0; i < itemCount; i++) {
                        setTimeout(() => {
                            setVisibleItems((prev) => new Set([...prev, i]))
                        }, i * delay)
                    }
                    observer.unobserve(entry.target)
                }
            },
            {
                threshold: 0.1,
                rootMargin: '50px',
            }
        )

        const currentRef = ref.current
        if (currentRef) {
            observer.observe(currentRef)
        }

        return () => {
            if (currentRef) {
                observer.unobserve(currentRef)
            }
        }
    }, [itemCount, delay])

    return [ref, visibleItems]
}
