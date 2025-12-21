import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useData } from '../hooks/useData'

export default function LeadForm() {
    const navigate = useNavigate()
    const { data: makes } = useData('data_makes.json')
    const { data: models } = useData('data_models.json')
    const { data: parts } = useData('data_parts.json')

    const [selectedMake, setSelectedMake] = useState('')
    const [selectedModel, setSelectedModel] = useState('')
    const [selectedPart, setSelectedPart] = useState('')
    const [selectedYear, setSelectedYear] = useState('')

    // Vehicle type classification
    const getVehicleType = (modelName) => {
        const name = modelName.toLowerCase()

        // Trucks
        if (name.includes('f-150') || name.includes('f-250') || name.includes('f-350') ||
            name.includes('silverado') || name.includes('sierra') || name.includes('ram') ||
            name.includes('tundra') || name.includes('tacoma') || name.includes('ranger') ||
            name.includes('colorado') || name.includes('canyon') || name.includes('titan') ||
            name.includes('frontier') || name.includes('gladiator') || name.includes('ridgeline')) {
            return 'truck'
        }

        // SUVs
        if (name.includes('explorer') || name.includes('expedition') || name.includes('tahoe') ||
            name.includes('suburban') || name.includes('yukon') || name.includes('escalade') ||
            name.includes('pilot') || name.includes('cr-v') || name.includes('rav4') ||
            name.includes('highlander') || name.includes('4runner') || name.includes('sequoia') ||
            name.includes('mdx') || name.includes('rdx') || name.includes('traverse') ||
            name.includes('equinox') || name.includes('blazer') || name.includes('durango') ||
            name.includes('grand cherokee') || name.includes('wrangler') || name.includes('pathfinder') ||
            name.includes('armada') || name.includes('q5') || name.includes('q7') || name.includes('q8') ||
            name.includes('x3') || name.includes('x5') || name.includes('x7') || name.includes('enclave')) {
            return 'suv'
        }

        // Vans
        if (name.includes('odyssey') || name.includes('sienna') || name.includes('pacifica') ||
            name.includes('caravan') || name.includes('quest') || name.includes('express') ||
            name.includes('savana') || name.includes('transit') || name.includes('promaster')) {
            return 'van'
        }

        // Coupes/Sports
        if (name.includes('corvette') || name.includes('camaro') || name.includes('mustang') ||
            name.includes('challenger') || name.includes('charger') || name.includes('370z') ||
            name.includes('gt-r') || name.includes('nsx') || name.includes('911') ||
            name.includes('m3') || name.includes('m4') || name.includes('m5')) {
            return 'coupe'
        }

        return 'sedan' // Default
    }

    // Get year range for model
    const getYearRange = (modelName) => {
        const name = modelName.toLowerCase()

        const yearRanges = {
            'f-150': [1990, 2024], 'f-250': [1990, 2024], 'f-350': [1990, 2024],
            'silverado': [1999, 2024], 'sierra': [1999, 2024],
            'ram 1500': [1994, 2024], 'ram 2500': [1994, 2024],
            'camry': [1990, 2024], 'corolla': [1990, 2024], 'accord': [1990, 2024],
            'civic': [1990, 2024], 'mustang': [1990, 2024], 'corvette': [1990, 2024],
            'explorer': [1991, 2024], 'tahoe': [1995, 2024], 'suburban': [1990, 2024],
            'rav4': [1996, 2024], 'cr-v': [1997, 2024], 'pilot': [2003, 2024],
            'mdx': [2001, 2024], 'rdx': [2007, 2024], 'tlx': [2015, 2024],
            'rlx': [2014, 2020], 'nsx': [1991, 2005], 'ilx': [2013, 2024]
        }

        for (const [model, years] of Object.entries(yearRanges)) {
            if (name.includes(model)) {
                return years
            }
        }

        return [1995, 2024]
    }

    const filteredModels = models?.filter(m => m.makeID === parseInt(selectedMake)) || []

    const getFilteredParts = () => {
        if (!selectedModel || !models || !parts) return []

        const model = models.find(m => m.modelName === selectedModel)
        if (!model) return parts

        const vehicleType = getVehicleType(model.modelName)

        const truckOnlyParts = ['Bed Liner', 'Tailgate']
        const suvOnlyParts = ['Liftgate', 'Running Board']
        const sedanOnlyParts = ['Trunk Lid']
        const vanOnlyParts = ['Sliding Door']

        return parts.filter(part => {
            if (!truckOnlyParts.includes(part.partName) &&
                !suvOnlyParts.includes(part.partName) &&
                !sedanOnlyParts.includes(part.partName) &&
                !vanOnlyParts.includes(part.partName)) {
                return true
            }

            if (vehicleType === 'truck') {
                return !suvOnlyParts.includes(part.partName) &&
                    !sedanOnlyParts.includes(part.partName) &&
                    !vanOnlyParts.includes(part.partName)
            } else if (vehicleType === 'suv') {
                return !truckOnlyParts.includes(part.partName) &&
                    !sedanOnlyParts.includes(part.partName) &&
                    !vanOnlyParts.includes(part.partName)
            } else if (vehicleType === 'sedan' || vehicleType === 'coupe') {
                return !truckOnlyParts.includes(part.partName) &&
                    !suvOnlyParts.includes(part.partName) &&
                    !vanOnlyParts.includes(part.partName)
            } else if (vehicleType === 'van') {
                return !truckOnlyParts.includes(part.partName) &&
                    !suvOnlyParts.includes(part.partName) &&
                    !sedanOnlyParts.includes(part.partName)
            }

            return true
        })
    }

    const getFilteredYears = () => {
        if (!selectedModel || !models) return []

        const model = models.find(m => m.modelName === selectedModel)
        if (!model) return Array.from({ length: 35 }, (_, i) => 2024 - i)

        const [yearStart, yearEnd] = getYearRange(model.modelName)
        const yearCount = yearEnd - yearStart + 1

        return Array.from({ length: yearCount }, (_, i) => yearEnd - i)
    }

    const filteredParts = getFilteredParts()
    const filteredYears = getFilteredYears()

    // Add loading and error states
    const [submitting, setSubmitting] = useState(false)
    const [submitError, setSubmitError] = useState(null)

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!selectedMake || !selectedModel || !selectedPart || !selectedYear) {
            alert('Please select all fields')
            return
        }

        const makeName = makes?.find(m => m.makeID === parseInt(selectedMake))?.makeName
        const partName = parts?.find(p => p.partID === parseInt(selectedPart))?.partName

        try {
            setSubmitting(true)
            setSubmitError(null)

            // Submit lead to backend
            const response = await fetch(`${import.meta.env.VITE_API_URL}/leads/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    make: makeName,
                    model: selectedModel,
                    part: partName,
                    year: parseInt(selectedYear)
                })
            })

            if (!response.ok) {
                throw new Error('Failed to submit lead')
            }

            const leadData = await response.json()
            console.log('Lead submitted successfully:', leadData)

            // Navigate to quote page after successful submission
            navigate(`/quote?make=${makeName}&model=${selectedModel}&part=${partName}&year=${selectedYear}`)
        } catch (error) {
            console.error('Error submitting lead:', error)
            setSubmitError('Failed to submit request. Please try again.')
            setSubmitting(false)
        }
    }

    return (
        <div className="w-full max-w-md">
            {/* Header with Gradient */}
            <div className="relative overflow-hidden rounded-t-3xl">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-cyan-500 to-purple-500 animate-gradient"></div>
                <div className="relative py-6 px-6 text-center">
                    <h2 className="text-2xl font-black text-white mb-1">GET INSTANT QUOTE</h2>
                    <p className="text-white/80 text-sm">Find your part in seconds</p>
                </div>
            </div>

            {/* Form with Glassmorphism */}
            <form onSubmit={handleSubmit} className="bg-white/95 backdrop-blur-xl p-8 rounded-b-3xl shadow-2xl border-x-2 border-b-2 border-white/20">
                {/* Make Dropdown */}
                <div className="mb-5">
                    <label className="text-dark-900 font-bold mb-2 flex items-center text-sm">
                        <svg className="w-5 h-5 text-blue-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                            <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
                        </svg>
                        Make
                        {selectedMake && <span className="ml-2 text-green-500">✓</span>}
                    </label>
                    <select
                        value={selectedMake}
                        onChange={(e) => {
                            setSelectedMake(e.target.value)
                            setSelectedModel('')
                            setSelectedPart('')
                            setSelectedYear('')
                        }}
                        className="w-full px-4 py-3.5 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none text-dark-900 font-medium bg-white transition-all"
                        required
                    >
                        <option value="">Select Make</option>
                        {makes?.map(make => (
                            <option key={make.makeID} value={make.makeID}>
                                {make.makeName}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Model Dropdown */}
                <div className="mb-5">
                    <label className="text-dark-900 font-bold mb-2 flex items-center text-sm">
                        <svg className="w-5 h-5 text-cyan-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Model
                        {selectedModel && <span className="ml-2 text-green-500">✓</span>}
                    </label>
                    <select
                        value={selectedModel}
                        onChange={(e) => {
                            setSelectedModel(e.target.value)
                            setSelectedPart('')
                            setSelectedYear('')
                        }}
                        className="w-full px-4 py-3.5 rounded-xl border-2 border-gray-200 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100 outline-none text-dark-900 font-medium bg-white disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-400 transition-all"
                        disabled={!selectedMake}
                        required
                    >
                        <option value="">Select Model</option>
                        {filteredModels.map(model => (
                            <option key={model.modelID} value={model.modelName}>
                                {model.modelName}
                            </option>
                        ))}
                    </select>
                    {!selectedMake && (
                        <p className="text-xs text-gray-400 mt-1.5 ml-1">Select make first</p>
                    )}
                </div>

                {/* Part Dropdown */}
                <div className="mb-5">
                    <label className="text-dark-900 font-bold mb-2 flex items-center text-sm">
                        <svg className="w-5 h-5 text-purple-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                        </svg>
                        Part
                        {selectedPart && <span className="ml-2 text-green-500">✓</span>}
                    </label>
                    <select
                        value={selectedPart}
                        onChange={(e) => setSelectedPart(e.target.value)}
                        className="w-full px-4 py-3.5 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 outline-none text-dark-900 font-medium bg-white disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-400 transition-all"
                        disabled={!selectedModel}
                        required
                    >
                        <option value="">Select Part</option>
                        {filteredParts.map(part => (
                            <option key={part.partID} value={part.partID}>
                                {part.partName}
                            </option>
                        ))}
                    </select>
                    {!selectedModel && (
                        <p className="text-xs text-gray-400 mt-1.5 ml-1">Select model first</p>
                    )}
                    {selectedModel && (
                        <p className="text-xs text-gray-500 mt-1.5 ml-1">
                            {filteredParts.length} parts available
                        </p>
                    )}
                </div>

                {/* Year Dropdown */}
                <div className="mb-6">
                    <label className="text-dark-900 font-bold mb-2 flex items-center text-sm">
                        <svg className="w-5 h-5 text-blue-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                        </svg>
                        Year
                        {selectedYear && <span className="ml-2 text-green-500">✓</span>}
                    </label>
                    <select
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(e.target.value)}
                        className="w-full px-4 py-3.5 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none text-dark-900 font-medium bg-white disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-400 transition-all"
                        disabled={!selectedModel}
                        required
                    >
                        <option value="">Select Year</option>
                        {filteredYears.map(year => (
                            <option key={year} value={year}>
                                {year}
                            </option>
                        ))}
                    </select>
                    {!selectedModel && (
                        <p className="text-xs text-gray-400 mt-1.5 ml-1">Select model first</p>
                    )}
                    {selectedModel && filteredYears.length > 0 && (
                        <p className="text-xs text-gray-500 mt-1.5 ml-1">
                            {filteredYears[filteredYears.length - 1]} - {filteredYears[0]}
                        </p>
                    )}
                </div>

                {/* Error Message */}
                {submitError && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
                        <p className="text-red-600 text-sm flex items-center gap-2">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                            {submitError}
                        </p>
                    </div>
                )}

                {/* Submit Button with Gradient */}
                <button
                    type="submit"
                    disabled={submitting}
                    className="relative w-full group overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-cyan-500 to-purple-500 animate-gradient"></div>
                    <div className="relative bg-gradient-to-r from-blue-500 to-cyan-500 group-hover:from-blue-600 group-hover:to-cyan-600 text-white font-black py-4 px-6 rounded-xl text-lg transition-all duration-300 shadow-glow group-hover:shadow-glow-lg transform group-hover:scale-[1.02] disabled:transform-none">
                        {submitting ? (
                            <span className="flex items-center justify-center gap-2">
                                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                SUBMITTING...
                            </span>
                        ) : (
                            'GET MY QUOTE NOW →'
                        )}
                    </div>
                </button>

                {/* Trust Badge */}
                <div className="mt-4 text-center">
                    <p className="text-xs text-gray-500 flex items-center justify-center gap-1">
                        <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        100% Free • No Obligation • Instant Results
                    </p>
                </div>
            </form>
        </div>
    )
}
