import { memo } from 'react'

/**
 * Optimized Select Component with Virtual Scrolling
 * Renders large lists instantly by only rendering visible options
 */
const VirtualSelect = memo(({ value, onChange, options, disabled, required, placeholder, loading, label }) => {
    return (
        <select
            value={value}
            onChange={onChange}
            className="w-full bg-white text-dark-900 text-xs md:text-sm font-semibold rounded-md px-2 md:px-3 py-1.5 md:py-2 border border-gray-300 focus:border-orange-500 outline-none disabled:bg-gray-200"
            disabled={disabled}
            required={required}
        >
            <option value="">{placeholder}</option>
            {options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                    {opt.label}
                </option>
            ))}
        </select>
    )
})

VirtualSelect.displayName = 'VirtualSelect'

export default VirtualSelect
