import { useState, useEffect } from 'react'

export default function Toast({ message, type = 'success', duration = 3000, onClose }) {
    const [isVisible, setIsVisible] = useState(true)

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false)
            if (onClose) {
                setTimeout(onClose, 300) // Wait for exit animation
            }
        }, duration)

        return () => clearTimeout(timer)
    }, [duration, onClose])

    const types = {
        success: {
            bg: 'bg-gradient-to-r from-teal-500 to-teal-600',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
            ),
        },
        error: {
            bg: 'bg-gradient-to-r from-red-500 to-red-600',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            ),
        },
        warning: {
            bg: 'bg-gradient-to-r from-amber-500 to-amber-600',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
            ),
        },
        info: {
            bg: 'bg-gradient-to-r from-blue-500 to-blue-600',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
        },
    }

    const config = types[type] || types.success

    if (!isVisible) return null

    return (
        <div
            className={`fixed top-4 right-4 z-50 ${isVisible ? 'animate-slide-left' : 'animate-slide-right'
                }`}
            role="alert"
        >
            <div
                className={`${config.bg} text-white px-6 py-4 rounded-2xl shadow-elevation-lg backdrop-blur-sm flex items-center gap-3 min-w-[300px] max-w-md`}
            >
                <div className="flex-shrink-0">{config.icon}</div>
                <p className="font-medium flex-1">{message}</p>
                <button
                    onClick={() => {
                        setIsVisible(false)
                        if (onClose) setTimeout(onClose, 300)
                    }}
                    className="flex-shrink-0 hover:bg-white/20 rounded-lg p-1 transition-colors"
                    aria-label="Close notification"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        </div>
    )
}

// Toast Container for managing multiple toasts
export function ToastContainer({ toasts = [], removeToast }) {
    return (
        <div className="fixed top-4 right-4 z-50 space-y-3">
            {toasts.map((toast) => (
                <Toast
                    key={toast.id}
                    message={toast.message}
                    type={toast.type}
                    duration={toast.duration}
                    onClose={() => removeToast(toast.id)}
                />
            ))}
        </div>
    )
}
