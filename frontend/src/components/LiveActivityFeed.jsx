import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const ACTIVITY_TEMPLATES = [
    { type: 'quote', template: 'Someone in [CITY], [STATE] just requested a quote for a [YEAR] [MAKE] [PART].', icon: '⚡' },
    { type: 'found', template: 'Vendor found a [PART] for a [MAKE] [MODEL] in [STATE].', icon: '✓' },
    { type: 'save', template: 'A user in [CITY], [STATE] saved [SAVINGS]% on a [PART].', icon: '💰' },
    { type: 'join', template: 'New salvage yard from [CITY], [STATE] joined the network.', icon: '🏢' },
]

const DATA_POOLS = {
    cities: ['Dallas', 'Houston', 'Miami', 'Atlanta', 'Chicago', 'Phoenix', 'Los Angeles', 'Denver', 'Seattle', 'Orlando'],
    states: ['TX', 'FL', 'GA', 'IL', 'AZ', 'CA', 'CO', 'WA', 'NY', 'NJ'],
    makes: ['Ford', 'Chevrolet', 'Toyota', 'Honda', 'Nissan', 'BMW', 'Mercedes', 'Dodge'],
    models: ['F-150', 'Silverado', 'Civic', 'Camry', 'Altima', '3 Series', 'C-Class', 'Ram 1500'],
    parts: ['Engine Assembly', 'Transmission', 'Rear Bumper', 'Headlight', 'Alternator', 'Starter', 'Radiator', 'Door Assembly'],
    years: ['2015', '2016', '2017', '2018', '2019', '2020', '2021', '2022'],
    savings: ['45', '50', '60', '75', '80']
}

function getRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)]
}

function generateActivity() {
    const tpl = getRandom(ACTIVITY_TEMPLATES)
    let text = tpl.template
    
    // Replace tokens
    text = text.replace('[CITY]', getRandom(DATA_POOLS.cities))
    text = text.replace('[STATE]', getRandom(DATA_POOLS.states))
    text = text.replace('[MAKE]', getRandom(DATA_POOLS.makes))
    text = text.replace('[MODEL]', getRandom(DATA_POOLS.models))
    text = text.replace('[PART]', getRandom(DATA_POOLS.parts))
    text = text.replace('[YEAR]', getRandom(DATA_POOLS.years))
    text = text.replace('[SAVINGS]', getRandom(DATA_POOLS.savings))
    
    return {
        id: Math.random().toString(36).substring(2, 9),
        icon: tpl.icon,
        text,
        time: 'Just now'
    }
}

export default function LiveActivityFeed() {
    const [activity, setActivity] = useState(null)
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        // Initial delay before first activity
        const initTimer = setTimeout(() => {
            setActivity(generateActivity())
            setIsVisible(true)
        }, 5000)

        return () => clearTimeout(initTimer)
    }, [])

    useEffect(() => {
        if (!isVisible) return

        // Hide string
        const hideTimer = setTimeout(() => {
            setIsVisible(false)
        }, 6000)

        // Show next string
        const nextTimer = setTimeout(() => {
            setActivity(generateActivity())
            setIsVisible(true)
        }, Math.floor(Math.random() * 10000) + 8000) // Random wait 8-18s between toasts

        return () => {
            clearTimeout(hideTimer)
            clearTimeout(nextTimer)
        }
    }, [isVisible])

    return (
        <div className="fixed bottom-6 right-6 z-[8000] pointer-events-none hidden lg:block">
            <AnimatePresence mode="wait">
                {isVisible && activity && (
                    <motion.div
                        key={activity.id}
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.9 }}
                        transition={{ type: 'spring', damping: 20, stiffness: 200 }}
                        className="bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-gray-100 flex items-start gap-4 max-w-sm pointer-events-auto"
                    >
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-xl border border-blue-100">
                            {activity.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 leading-snug">
                                {activity.text}
                            </p>
                            <p className="text-xs text-gray-500 mt-1 font-medium">
                                {activity.time}
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
