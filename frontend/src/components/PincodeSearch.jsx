import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

export default function PincodeSearch() {
    const [pincode, setPincode] = useState('')
    const [suggestions, setSuggestions] = useState([])
    const [showDropdown, setShowDropdown] = useState(false)
    const [loading, setLoading] = useState(false)
    const dropdownRef = useRef(null)
    const navigate = useNavigate()

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    // Fetch pincode suggestions from backend
    useEffect(() => {
        const fetchSuggestions = async () => {
            if (pincode.length < 1) {
                setSuggestions([])
                setShowDropdown(false)
                return
            }

            setLoading(true)
            try {
                const response = await axios.get(`http://localhost:8000/api/hollander/pincodes/search/`, {
                    params: { q: pincode }
                })
                console.log('Pincode API Response:', response.data)
                console.log('Number of suggestions:', response.data.length)
                setSuggestions(response.data)
                setShowDropdown(response.data.length > 0)
                console.log('Show dropdown:', response.data.length > 0)
            } catch (error) {
                console.error('Error fetching pincodes:', error)
                setSuggestions([])
                setShowDropdown(false)
            } finally {
                setLoading(false)
            }
        }

        const debounceTimer = setTimeout(fetchSuggestions, 300)
        return () => clearTimeout(debounceTimer)
    }, [pincode])

    const handleSelectPincode = (selectedPincode) => {
        // Navigate to browse page with exact state
        navigate(`/browse?state=${selectedPincode.state_abbr}`)
        setPincode('')
        setSuggestions([])
        setShowDropdown(false)
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        if (suggestions.length > 0) {
            handleSelectPincode(suggestions[0])
        }
    }

    return (
        <div className="relative w-full max-w-2xl mx-auto" ref={dropdownRef}>
            <form onSubmit={handleSubmit} className="relative">
                <div className="flex items-center gap-2 sm:gap-3">
                    {/* Input Field */}
                    <div className="relative flex-1">
                        <input
                            type="text"
                            value={pincode}
                            onChange={(e) => setPincode(e.target.value)}
                            placeholder="Your ZIP or Postal Code"
                            maxLength={6}
                            className="w-full px-4 sm:px-6 py-3 sm:py-4 bg-white/95 backdrop-blur-sm border-2 border-gray-300 rounded-xl sm:rounded-2xl text-dark-900 placeholder-gray-500 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all duration-300 text-sm sm:text-base font-medium shadow-soft"
                            autoComplete="off"
                        />
                        {loading && (
                            <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                <div className="w-4 h-4 border-2 border-teal-500/30 border-t-teal-500 rounded-full animate-spin"></div>
                            </div>
                        )}
                    </div>

                    {/* Search Button */}
                    <button
                        type="submit"
                        className="px-6 sm:px-10 py-3 sm:py-4 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-500 hover:to-teal-600 text-white font-bold rounded-xl sm:rounded-2xl transition-all duration-300 shadow-soft-lg hover:shadow-glow-teal transform hover:scale-105 active:scale-95 text-sm sm:text-base whitespace-nowrap"
                    >
                        SEARCH. <span className="hidden sm:inline">IT'S FREE!</span>
                    </button>
                </div>

                {/* Dropdown Suggestions - IMPROVED Z-INDEX */}
                {showDropdown && suggestions.length > 0 && (
                    <div className="absolute z-[9999] w-full mt-2 bg-white rounded-xl shadow-elevation-lg border border-gray-200 max-h-80 overflow-y-auto">
                        {suggestions.map((suggestion, index) => (
                            <button
                                key={index}
                                type="button"
                                onClick={() => handleSelectPincode(suggestion)}
                                className="w-full px-4 sm:px-6 py-3 sm:py-4 text-left hover:bg-teal-50 transition-colors duration-200 border-b border-gray-100 last:border-b-0 group"
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="font-bold text-dark-900 text-sm sm:text-base group-hover:text-teal-600">
                                            {suggestion.postal_code}
                                        </div>
                                        <div className="text-xs sm:text-sm text-gray-600">
                                            {suggestion.city_name}, {suggestion.state_abbr}
                                        </div>
                                    </div>
                                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-hover:text-teal-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </form>
        </div>
    )
}
