import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../services/api'

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
                // Use centralized API service
                const data = await api.searchPincodes(pincode)
                console.log('Pincode API Response:', data)
                console.log('Number of suggestions:', data.length)
                setSuggestions(data)
                setShowDropdown(data.length > 0)
                console.log('Show dropdown:', data.length > 0)
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
        <div className="relative w-full max-w-2xl" ref={dropdownRef}>
            <form onSubmit={handleSubmit} className="relative group">
                <div className="relative flex items-center bg-white/80 border-2 border-slate-100 group-hover:border-blue-500/50 rounded-[2rem] p-1.5 transition-all duration-300 shadow-inner">
                    {/* Input Field */}
                    <div className="relative flex-1">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        </div>
                        <input
                            type="text"
                            value={pincode}
                            onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            placeholder="Enter ZIP or Pincode..."
                            className="w-full pl-12 pr-[110px] sm:pr-[155px] py-3 bg-transparent text-slate-800 placeholder-slate-400 font-bold outline-none transition-all duration-300 text-sm sm:text-base"
                            autoComplete="off"
                        />
                        {loading && (
                            <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                <div className="w-4 h-4 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
                            </div>
                        )}
                    </div>

                    {/* Search Floating Button */}
                    <button
                        type="submit"
                        className="absolute right-1.5 top-1.5 bottom-1.5 px-6 sm:px-8 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black rounded-[1.5rem] transition-all duration-300 shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:shadow-[0_0_30px_rgba(37,99,235,0.6)] hover:scale-105 active:scale-95 text-xs sm:text-sm whitespace-nowrap flex items-center gap-2"
                    >
                        <span>SEARCH</span>
                        <span className="hidden sm:inline opacity-80 font-semibold uppercase tracking-wider">IT'S FREE!</span>
                        <svg className="w-4 h-4 ml-1 hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                    </button>
                </div>

                {/* Dropdown Suggestions */}
                {showDropdown && suggestions.length > 0 && (
                    <div className="absolute z-[99999] left-0 right-0 mt-3 bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.15)] border border-slate-100 max-h-80 overflow-y-auto overflow-x-hidden animate-slide-up origin-top">
                        <div className="p-2">
                            {suggestions.map((suggestion, index) => (
                                <button
                                    key={index}
                                    type="button"
                                    onClick={() => handleSelectPincode(suggestion)}
                                    className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-slate-50 transition-colors duration-200 rounded-xl group relative overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-blue-50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    <div className="relative z-10 flex flex-col gap-0.5">
                                        <div className="font-extrabold text-slate-800 text-[15px] group-hover:text-blue-600 transition-colors">
                                            {suggestion.postal_code}
                                        </div>
                                        <div className="text-[12px] font-semibold text-slate-400 uppercase tracking-wider group-hover:text-slate-500">
                                            {suggestion.city_name}, {suggestion.state_abbr}
                                        </div>
                                    </div>
                                    <div className="relative z-10 w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </form>
        </div>
    )
}
