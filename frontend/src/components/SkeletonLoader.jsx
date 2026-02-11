export default function SkeletonLoader({ type = 'card', count = 1, className = '' }) {
    const renderSkeleton = () => {
        switch (type) {
            case 'card':
                return (
                    <div className={`skeleton-card ${className}`}>
                        <div className="skeleton h-48 mb-4"></div>
                        <div className="skeleton-text mb-3 w-3/4"></div>
                        <div className="skeleton-text mb-2 w-full"></div>
                        <div className="skeleton-text w-2/3"></div>
                    </div>
                )

            case 'list':
                return (
                    <div className={`space-y-3 ${className}`}>
                        <div className="skeleton-text w-full"></div>
                        <div className="skeleton-text w-5/6"></div>
                        <div className="skeleton-text w-4/5"></div>
                    </div>
                )

            case 'text':
                return <div className={`skeleton-text ${className}`}></div>

            case 'avatar':
                return <div className={`skeleton w-12 h-12 rounded-full ${className}`}></div>

            case 'vendor-card':
                return (
                    <div className={`skeleton-card ${className}`}>
                        <div className="skeleton aspect-[16/9] mb-4"></div>
                        <div className="skeleton-text mb-3 w-3/4"></div>
                        <div className="flex items-center gap-2 mb-3">
                            <div className="skeleton w-20 h-4"></div>
                            <div className="skeleton w-12 h-4"></div>
                        </div>
                        <div className="skeleton-text w-2/3 mb-4"></div>
                        <div className="skeleton h-10 rounded-xl"></div>
                    </div>
                )

            default:
                return <div className={`skeleton h-20 ${className}`}></div>
        }
    }

    return (
        <>
            {Array.from({ length: count }).map((_, index) => (
                <div key={index}>{renderSkeleton()}</div>
            ))}
        </>
    )
}
