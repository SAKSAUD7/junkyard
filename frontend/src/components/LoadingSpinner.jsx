export default function LoadingSpinner({ size = 'md', variant = 'default', className = '' }) {
    const sizes = {
        sm: 'w-6 h-6 border-2',
        md: 'w-10 h-10 border-4',
        lg: 'w-16 h-16 border-4',
        xl: 'w-24 h-24 border-8',
    }

    const variants = {
        default: 'spinner',
        glow: 'spinner-glow',
        primary: 'w-10 h-10 border-4 border-teal-500/20 border-t-teal-500 rounded-full animate-spin',
        gradient: 'w-10 h-10 border-4 border-transparent border-t-teal-500 rounded-full animate-spin bg-gradient-to-r from-teal-500 to-amber-500',
    }

    if (variant === 'default' || variant === 'glow') {
        return (
            <div className={`${variants[variant]} ${className}`} role="status" aria-label="Loading">
                <span className="sr-only">Loading...</span>
            </div>
        )
    }

    return (
        <div className="flex items-center justify-center">
            <div className={`${sizes[size]} ${variants[variant]} ${className}`} role="status" aria-label="Loading">
                <span className="sr-only">Loading...</span>
            </div>
        </div>
    )
}
