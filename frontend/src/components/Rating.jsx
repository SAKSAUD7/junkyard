import React from 'react';

/**
 * Reusable rating component that displays stars and percentage
 * Admin-controlled, no frontend calculation
 */
export default function Rating({
    stars = 5,
    percentage = 100,
    showPercentage = true,
    size = 'md'
}) {
    // Size variants for responsive design
    const sizes = {
        sm: 'w-3 h-3 sm:w-4 sm:h-4',
        md: 'w-4 h-4 sm:w-5 sm:h-5',
        lg: 'w-5 h-5 sm:w-6 sm:h-6'
    };

    const sizeClass = sizes[size] || sizes.md;

    // Render stars (filled based on rating_stars from backend)
    const renderStars = () => {
        return [...Array(5)].map((_, index) => (
            <svg
                key={index}
                className={`${sizeClass} ${index < stars ? 'text-yellow-400' : 'text-gray-600'
                    }`}
                fill="currentColor"
                viewBox="0 0 20 20"
            >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
        ));
    };

    return (
        <div className="flex items-center gap-1 sm:gap-2">
            <div className="flex items-center gap-0.5">
                {renderStars()}
            </div>
            {showPercentage && (
                <span className="text-xs sm:text-sm text-white/70 font-medium">
                    {percentage}%
                </span>
            )}
        </div>
    );
}
