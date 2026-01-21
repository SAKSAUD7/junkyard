import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../services/api'

// US States and Canadian Provinces (from zipcode database)
const US_STATES = [
    'AA', 'AB', 'AE', 'AK', 'AL', 'AP', 'AR', 'AS', 'AZ', 'BC',
    'CA', 'CO', 'CT', 'DC', 'DE', 'FL', 'FM', 'GA', 'GU', 'HI',
    'IA', 'ID', 'IL', 'IN', 'KS', 'KY', 'LA', 'MA', 'MB', 'MD',
    'ME', 'MH', 'MI', 'MN', 'MO', 'MP', 'MS', 'MT', 'NB', 'NC',
    'ND', 'NE', 'NH', 'NJ', 'NL', 'NM', 'NS', 'NT', 'NU', 'NV',
    'NY', 'OH', 'OK', 'ON', 'OR', 'PA', 'PE', 'PR', 'PW', 'QC',
    'RI', 'SC', 'SD', 'SK', 'TN', 'TX', 'UT', 'VA', 'VI', 'VT',
    'WA', 'WI', 'WV', 'WY', 'YT'
]

export default function LeadForm({ layout = 'vertical', mode = null, vendorName = null, enableSteps = false }) {
    const navigate = useNavigate()

    // -- State --
    // Lead Type Toggle
    // If mode is provided, use it. Otherwise default to 'quality_auto_parts'
    const [leadType, setLeadType] = useState(mode || 'quality_auto_parts')

    // Steps State
    const [currentStep, setCurrentStep] = useState(1)

    // Lists
    const [makes, setMakes] = useState([])
    const [models, setModels] = useState([])
    const [years, setYears] = useState([])
    const [parts, setParts] = useState([])

    // Selections
    const [selectedMake, setSelectedMake] = useState('')
    const [selectedModel, setSelectedModel] = useState('')
    const [selectedYear, setSelectedYear] = useState('')
    const [selectedPart, setSelectedPart] = useState('')

    // Loading States
    const [loadingMakes, setLoadingMakes] = useState(false)
    const [loadingModels, setLoadingModels] = useState(false)
    const [loadingYears, setLoadingYears] = useState(false)
    const [loadingParts, setLoadingParts] = useState(false)

    // Contact Info
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [phone, setPhone] = useState('')
    const [state, setState] = useState('')
    const [zip, setZip] = useState('')
    const [loadingZipcode, setLoadingZipcode] = useState(false)
    const [zipcodeCity, setZipcodeCity] = useState('')
    const [zipcodes, setZipcodes] = useState([])
    const [loadingZipcodes, setLoadingZipcodes] = useState(false)
    const [showZipSuggestions, setShowZipSuggestions] = useState(false)

    // Hollander / Options
    const [options, setOptions] = useState('')
    const [hollanderNumber, setHollanderNumber] = useState('')
    const [loadingHollander, setLoadingHollander] = useState(false)

    // Security
    const [securityCode, setSecurityCode] = useState('')
    const [userSecurityCode, setUserSecurityCode] = useState('')

    const [submitting, setSubmitting] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)
    const [submitError, setSubmitError] = useState(null)

    // Generate strict Security Code
    const generateSecurityCode = () => {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
        let code = ''
        for (let i = 0; i < 4; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length))
        }
        setSecurityCode(code)
    }

    useEffect(() => {
        generateSecurityCode()
        // Load initial Makes
        loadMakes()
    }, [])

    // If mode prop changes (unlikely but good practice), update state
    useEffect(() => {
        if (mode) setLeadType(mode)
    }, [mode])

    // ... (rest of methods)

    // Zipcode Lookup
    const handleZipChange = async (zipValue) => {
        setZip(zipValue)

        // Only lookup if we have a 5-digit zip
        if (zipValue.length === 5) {
            setLoadingZipcode(true)
            try {
                const response = await fetch(
                    `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/api/hollander/zipcode/lookup/?zip=${zipValue}`
                )
                const data = await response.json()

                if (data.found) {
                    setState(data.state)
                    setZipcodeCity(data.city)
                } else {
                    // Clear state if zip not found
                    setZipcodeCity('')
                }
            } catch (error) {
                console.error('Zipcode lookup error:', error)
            } finally {
                setLoadingZipcode(false)
            }
        } else {
            // Clear city if zip is incomplete
            setZipcodeCity('')
        }
    }

    // Load zipcodes when state changes
    const handleStateChange = async (stateValue) => {
        setState(stateValue)
        setZip('') // Clear zip when state changes
        setZipcodeCity('')

        if (stateValue) {
            setLoadingZipcodes(true)
            try {
                const response = await fetch(
                    `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/api/hollander/zipcodes/state/?state=${stateValue}`
                )
                const data = await response.json()

                if (data.zipcodes) {
                    setZipcodes(data.zipcodes)
                } else {
                    setZipcodes([])
                }
            } catch (error) {
                console.error('Error loading zipcodes:', error)
                setZipcodes([])
            } finally {
                setLoadingZipcodes(false)
            }
        } else {
            setZipcodes([])
        }
    }

    // -- API Loaders --

    const loadMakes = async () => {
        setLoadingMakes(true)
        try {
            const data = await api.getMakes()
            setMakes(data || [])
        } catch (err) {
            console.error("Failed to load makes", err)
        } finally {
            setLoadingMakes(false)
        }
    }

    // When Make Changes -> Load Models
    useEffect(() => {
        if (!selectedMake) {
            setModels([])
            setYears([])
            setParts([])
            return
        }

        const loadModels = async () => {
            setLoadingModels(true)
            try {
                // selectedMake is ID here
                const data = await api.getModels({ make_id: selectedMake })
                setModels(data || [])
            } catch (err) {
                console.error("Failed to load models", err)
            } finally {
                setLoadingModels(false)
            }
        }
        loadModels()

        // Reset downstream
        setSelectedModel('')
        setSelectedYear('')
        setSelectedPart('')
    }, [selectedMake])

    // When Model Changes -> Load Years
    useEffect(() => {
        if (!selectedMake || !selectedModel) {
            setYears([])
            setParts([])
            return
        }

        const loadYears = async () => {
            setLoadingYears(true)
            try {
                const data = await api.getYears({
                    make_id: selectedMake,
                    model_id: selectedModel
                })
                setYears(data || [])
            } catch (err) {
                console.error("Failed to load years", err)
            } finally {
                setLoadingYears(false)
            }
        }
        loadYears()

        // Reset downstream
        setSelectedYear('')
        setSelectedPart('')
    }, [selectedModel])


    // When Year Changes -> Load Parts (Filtered) - ONLY FOR QUALITY AUTO PARTS
    useEffect(() => {
        // Skip for Vendor type or missing dependencies
        if (leadType === 'vendor' || !selectedMake || !selectedModel || !selectedYear) {
            setParts([])
            return
        }

        const loadParts = async () => {
            setLoadingParts(true)
            try {
                const data = await api.getParts({
                    make_id: selectedMake,
                    model_id: selectedModel,
                    year: selectedYear
                })
                setParts(data || [])
            } catch (err) {
                console.error("Failed to load parts", err)
            } finally {
                setLoadingParts(false)
            }
        }
        loadParts()

        // Reset downstream
        setSelectedPart('')
    }, [selectedYear, leadType])


    // Lookup Hollander number when Everything Selected (ONLY FOR QUALITY AUTO PARTS)
    useEffect(() => {
        if (leadType === 'vendor') return

        const lookupHollander = async () => {
            if (selectedYear && selectedMake && selectedModel && selectedPart) {
                setLoadingHollander(true)

                // Find names for API payload
                const makeObj = makes.find(m => m.makeID === parseInt(selectedMake))
                const modelObj = models.find(m => m.modelID === parseInt(selectedModel))
                const partObj = parts.find(p => p.partID === parseInt(selectedPart))

                try {
                    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/api/hollander/lookup/`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            year: parseInt(selectedYear),
                            make: makeObj?.makeName || '',
                            make_id: selectedMake,
                            model: modelObj?.modelName || '',
                            part_type: partObj?.partName || '',
                            part_id: selectedPart
                        })
                    })

                    if (response.ok) {
                        const data = await response.json()
                        if (data.results && data.results.length > 0) {
                            const result = data.results[0]
                            setHollanderNumber(result.hollander_number)
                            // Clean up options if array or string
                            setOptions(result.options || '')
                        } else {
                            setHollanderNumber('Not Found')
                            setOptions('')
                        }
                    } else {
                        setHollanderNumber('Not Found')
                        setOptions('')
                    }
                } catch (error) {
                    console.error('Hollander lookup error:', error)
                    setHollanderNumber('Not Available')
                    setOptions('')
                }

                setLoadingHollander(false)
            } else {
                setHollanderNumber('')
                setOptions('')
            }
        }

        lookupHollander()
    }, [selectedYear, selectedMake, selectedModel, selectedPart, makes, models, parts, leadType])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSubmitError(null)

        // Validation based on Lead Type
        if (leadType === 'quality_auto_parts') {
            if (!selectedMake || !selectedModel || !selectedPart || !selectedYear) {
                setSubmitError('Please select all vehicle details.')
                return
            }
        } else {
            // Vendor Lead Validation
            if (!selectedMake || !selectedModel || !selectedYear) {
                setSubmitError('Please select vehicle details.')
                return
            }
        }

        // Common Validation
        if (!name || !email || !phone || !state || !zip) {
            setSubmitError('Please fill in all contact information.')
            return
        }
        if (userSecurityCode.toUpperCase() !== securityCode) {
            setSubmitError('Invalid Security Code. Please try again.')
            return
        }

        setSubmitting(true)

        const makeObj = makes.find(m => m.makeID === parseInt(selectedMake))
        const partObj = parts.find(p => p.partID === parseInt(selectedPart))

        // Determine endpoint and payload based on lead type
        let endpoint, payload;

        if (leadType === 'vendor') {
            // Vendor Lead - separate endpoint, no part fields
            endpoint = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/api/vendor-leads/`;
            payload = {
                make: makeObj ? makeObj.makeName : 'Unknown',
                model: selectedModel,
                year: parseInt(selectedYear),
                name,
                email,
                phone,
                state,
                zip,
                // Add vendor ID if context available? The legacy form might not expect it, 
                // but usually vendor leads should account for WHO. 
                // However, user asked to remove vendor-specific UI from home.
                // If this is a generic 'find a vendor' lead, it goes to admin usually.
            };
        } else {
            // Quality Auto Parts Lead - original endpoint
            endpoint = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/api/leads/`;
            payload = {
                make: makeObj ? makeObj.makeName : 'Unknown',
                model: selectedModel,
                year: parseInt(selectedYear),
                part: partObj ? partObj.partName : 'Unknown',
                lead_type: leadType,
                name,
                email,
                phone,
                state,
                zip,
                options: options || '',
                hollander_number: hollanderNumber || ''
            };
        }

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })

            if (!response.ok) throw new Error('Failed to submit lead')

            setSubmitting(false)
            setIsSuccess(true)
        } catch (error) {
            console.error(error)
            setSubmitError('Network failure. Please try again.')
            setSubmitting(false)
        }
    }

    const handleReset = () => {
        setIsSuccess(false)
        setCurrentStep(1)
        // Keep selected tab? Or reset? Usually keep tab. 
        // Reset fields only.
        setSelectedMake('')
        setSelectedModel('')
        setSelectedPart('')
        setSelectedYear('')
        setName('')
        setEmail('')
        setPhone('')
        setState('')
        setZip('')
        setOptions('')
        setHollanderNumber('')
        setUserSecurityCode('')
        generateSecurityCode()
    }

    const handleTypeChange = (type) => {
        if (mode) return // Prevent change if locked
        setLeadType(type)
        // Optional: Reset partial progress when switching to avoid weird state?
        // Let's keep data if compatible (Make/Model/Year), clear Part if switching to Vendor
        if (type === 'vendor') {
            setSelectedPart('')
            setHollanderNumber('')
            setOptions('')
        }
    }

    // Step Navigation Handlers
    const handleNext = () => {
        // Validate Step 1
        if (leadType === 'quality_auto_parts') {
            if (!selectedMake || !selectedModel || !selectedPart || !selectedYear) {
                setSubmitError('Please select all vehicle details.')
                return
            }
        } else {
            if (!selectedMake || !selectedModel || !selectedYear) {
                setSubmitError('Please select vehicle details.')
                return
            }
        }
        setSubmitError(null)
        setCurrentStep(2)
    }

    const handleBack = () => {
        setSubmitError(null)
        setCurrentStep(1)
    }

    if (isSuccess) {
        return (
            <div className={`w-full ${layout === 'horizontal' ? 'max-w-xl' : 'max-w-sm'} mx-auto font-sans bg-dark-900/95 backdrop-blur-md p-8 rounded-xl border border-white/10 shadow-2xl text-center flex flex-col items-center justify-center min-h-[400px]`}>
                <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mb-6 shadow-glow-lg animate-scale-in">
                    <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <h2 className="text-3xl font-black text-white mb-2">LEAD SENT!</h2>
                <p className="text-white/70 text-lg mb-6">
                    We have received your request. <br />
                    A specialist will contact you shortly.
                </p>
                <button onClick={handleReset} className="text-amber-500 font-bold hover:text-amber-400 transition-colors uppercase tracking-wide text-sm border-b border-transparent hover:border-amber-500">
                    Submit Another Request
                </button>
            </div>
        )
    }

    // Calculate layout class for step mode
    const isHorizontal = layout === 'horizontal' && !enableSteps;

    // Step Visibility Logic
    const showVehicleDetails = !enableSteps || currentStep === 1;
    const showContactInfo = !enableSteps || currentStep === 2;

    return (
        <div className={`w-full ${isHorizontal ? 'max-w-4xl' : 'max-w-sm'} mx-auto font-sans transition-all duration-300`}>
            {/* Header */}
            <div className={`bg-gradient-to-r from-blue-600 to-teal-600 rounded-t-xl p-2 md:p-3 text-center shadow-md ${isHorizontal ? 'py-2 md:py-3' : ''} flex justify-between items-center px-4`}>
                <h2 className={`${isHorizontal ? 'text-sm md:text-lg' : 'text-sm md:text-lg'} font-black text-white uppercase tracking-wide leading-tight flex-1`}>
                    {leadType === 'quality_auto_parts' ? 'NEED A QUALITY USED PART?' : 'FIND JUNKYARD VENDORS'}
                </h2>
                {enableSteps && (
                    <span className="text-white/80 text-[10px] uppercase font-bold tracking-wider">
                        Step {currentStep} of 2
                    </span>
                )}
            </div>

            <form onSubmit={handleSubmit} className={`bg-white p-3 md:p-5 rounded-b-xl border border-gray-200 shadow-lg ${isHorizontal ? 'grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-5 p-4 md:p-6' : 'flex flex-col gap-3'}`}>

                {/* Toggle Buttons (Full Width) */}
                {/* Only show toggle if mode is NOT locked */}
                {!mode && (
                    <div className={`${isHorizontal ? 'col-span-2' : ''} grid grid-cols-2 gap-2 mb-2`}>
                        <button
                            type="button"
                            onClick={() => handleTypeChange('quality_auto_parts')}
                            className={`py-2 text-xs md:text-sm font-bold uppercase rounded-md transition-all border ${leadType === 'quality_auto_parts' ? 'bg-blue-600 text-white border-blue-600 shadow-sm' : 'bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200'}`}
                        >
                            Quality Auto Parts
                        </button>
                        <button
                            type="button"
                            onClick={() => handleTypeChange('vendor')}
                            className={`py-2 text-xs md:text-sm font-bold uppercase rounded-md transition-all border ${leadType === 'vendor' ? 'bg-blue-600 text-white border-blue-600 shadow-sm' : 'bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200'}`}
                        >
                            Junkyard Vendors
                        </button>
                    </div>
                )}

                {/* Step Indicator Text (Optional) */}
                {enableSteps && currentStep === 1 && (
                    <div className="text-center text-xs text-gray-500 font-semibold uppercase tracking-wide pb-2 border-b border-gray-100 mb-2">
                        Vehicle Details
                    </div>
                )}
                {enableSteps && currentStep === 2 && (
                    <div className="text-center text-xs text-gray-500 font-semibold uppercase tracking-wide pb-2 border-b border-gray-100 mb-2">
                        Contact Information
                    </div>
                )}

                {/* Left Column (Vehicle Info) */}
                {showVehicleDetails && (
                    <div className={`space-y-1.5 md:space-y-2 ${isHorizontal ? 'border-r border-gray-200 pr-3 md:pr-6' : ''}`}>
                        {isHorizontal && <h3 className="text-blue-600 font-bold uppercase tracking-wider mb-1.5 md:mb-2 text-[10px] md:text-xs border-b border-gray-200 pb-1">Vehicle Details</h3>}

                        {/* 1. Make */}
                        <div className="space-y-0.5 md:space-y-1">
                            <label className="text-[10px] md:text-xs font-bold text-gray-700 uppercase flex justify-between">
                                1. Make <span className="text-blue-600">*</span>
                                {loadingMakes && <span className="text-[9px] text-blue-600 lowercase animate-pulse">loading...</span>}
                            </label>
                            <select
                                value={selectedMake}
                                onChange={(e) => setSelectedMake(e.target.value)}
                                className="w-full bg-white text-dark-900 text-xs md:text-sm font-semibold rounded-md px-2 md:px-3 py-1.5 md:py-2 border border-gray-300 focus:border-teal-500 outline-none"
                                required
                            >
                                <option value="">Select Make</option>
                                {makes?.map(m => <option key={m.makeID} value={m.makeID}>{m.makeName}</option>)}
                            </select>
                        </div>

                        {/* 2. Model */}
                        <div className="space-y-0.5 md:space-y-1">
                            <label className="text-[10px] md:text-xs font-bold text-gray-700 uppercase flex justify-between">
                                2. Model <span className="text-blue-600">*</span>
                                {loadingModels && <span className="text-[9px] text-blue-600 lowercase animate-pulse">loading...</span>}
                            </label>
                            <select
                                value={selectedModel}
                                onChange={(e) => setSelectedModel(e.target.value)}
                                className="w-full bg-white text-dark-900 text-xs md:text-sm font-semibold rounded-md px-2 md:px-3 py-1.5 md:py-2 border border-gray-300 focus:border-teal-500 outline-none disabled:bg-gray-200"
                                disabled={!selectedMake}
                                required
                            >
                                <option value="">Select Model</option>
                                {models.map(m => <option key={m.modelID} value={m.modelID}>{m.modelName}</option>)}
                            </select>
                        </div>

                        {/* 3. Year */}
                        <div className="space-y-0.5 md:space-y-1">
                            <label className="text-[10px] md:text-xs font-bold text-gray-700 uppercase flex justify-between">
                                3. Year <span className="text-blue-600">*</span>
                                {loadingYears && <span className="text-[9px] text-blue-600 lowercase animate-pulse">loading...</span>}
                            </label>
                            <select
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(e.target.value)}
                                className="w-full bg-white text-dark-900 text-xs md:text-sm font-semibold rounded-md px-2 md:px-3 py-1.5 md:py-2 border border-gray-300 focus:border-teal-500 outline-none disabled:bg-gray-200"
                                disabled={!selectedModel}
                                required
                            >
                                <option value="">Select Year</option>
                                {years.map(y => <option key={y} value={y}>{y}</option>)}
                            </select>
                        </div>

                        {/* FIELDS SPECIFIC TO QUALITY AUTO PARTS */}
                        {leadType === 'quality_auto_parts' && (
                            <>
                                {/* 4. Part */}
                                <div className="space-y-0.5 md:space-y-1">
                                    <label className="text-[10px] md:text-xs font-bold text-gray-700 uppercase flex justify-between">
                                        4. Part <span className="text-blue-600">*</span>
                                        {loadingParts && <span className="text-[9px] text-blue-600 lowercase animate-pulse">loading...</span>}
                                    </label>
                                    <select
                                        value={selectedPart}
                                        onChange={(e) => setSelectedPart(e.target.value)}
                                        className="w-full bg-white text-dark-900 text-xs md:text-sm font-semibold rounded-md px-2 md:px-3 py-1.5 md:py-2 border border-gray-300 focus:border-teal-500 outline-none disabled:bg-gray-200"
                                        disabled={!selectedYear}
                                        required
                                    >
                                        <option value="">Select Part</option>
                                        {parts.map(p => <option key={p.partID} value={p.partID}>{p.partName}</option>)}
                                    </select>
                                </div>

                                {/* 5. Options */}
                                <div className="space-y-0.5 md:space-y-1">
                                    <label className="text-[10px] md:text-xs font-bold text-gray-700 uppercase flex items-center gap-1">
                                        5. Options
                                        {loadingHollander && <span className="text-blue-600 text-[8px]">(Loading...)</span>}
                                    </label>
                                    <input
                                        type="text"
                                        value={options}
                                        readOnly
                                        placeholder="Auto-populated from part specs"
                                        className="w-full bg-gray-100 text-gray-600 text-xs md:text-sm px-2 md:px-3 py-1.5 md:py-2 rounded-md border border-gray-300 outline-none cursor-not-allowed"
                                    />
                                </div>

                                {/* Hollander Number */}
                                <div className="space-y-0.5 md:space-y-1">
                                    <label className="text-[10px] md:text-xs font-bold text-gray-700 uppercase flex items-center gap-1">
                                        Hollander #
                                        {loadingHollander && <span className="text-blue-600 text-[8px]">(Looking up...)</span>}
                                    </label>
                                    <input
                                        type="text"
                                        value={hollanderNumber}
                                        readOnly
                                        placeholder="Auto-populated"
                                        className="w-full bg-gray-100 text-gray-600 text-xs md:text-sm px-2 md:px-3 py-1.5 md:py-2 rounded-md border border-gray-300 outline-none cursor-not-allowed"
                                    />
                                </div>
                            </>
                        )}

                        {/* NEXT BUTTON for Step 1 */}
                        {enableSteps && (
                            <button
                                type="button"
                                onClick={handleNext}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg shadow-md transition-all mt-4 flex items-center justify-center gap-2 group"
                            >
                                Next Step
                                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                            </button>
                        )}
                    </div>
                )}

                {/* Right Column (Contact Info) */}
                {showContactInfo && (
                    <div className="space-y-1.5 md:space-y-2">
                        {/* Step 2 Back Button */}
                        {enableSteps && (
                            <button
                                type="button"
                                onClick={handleBack}
                                className="text-xs text-gray-500 hover:text-blue-600 mb-2 flex items-center gap-1 font-semibold"
                            >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                                Back to Vehicle Details
                            </button>
                        )}

                        {isHorizontal && <h3 className="text-blue-600 font-bold uppercase tracking-wider mb-1.5 md:mb-2 text-[10px] md:text-xs border-b border-gray-200 pb-1">Contact Information</h3>}

                        {/* Contact Grid */}
                        <div className={`grid grid-cols-2 gap-2 md:gap-3 ${!isHorizontal ? 'pt-1.5 md:pt-2 border-t border-gray-200' : ''}`}>
                            <div className="col-span-2 space-y-0.5 md:space-y-1">
                                <label className="text-[10px] font-bold text-gray-700 uppercase">Name <span className="text-blue-600">*</span></label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    placeholder="Your Name"
                                    className="w-full bg-white text-gray-900 text-xs md:text-sm px-2 md:px-3 py-1.5 md:py-2 rounded-md border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none placeholder-gray-400"
                                    required
                                />
                            </div>

                            <div className="col-span-2 space-y-0.5 md:space-y-1">
                                <label className="text-[10px] font-bold text-gray-700 uppercase">Email <span className="text-blue-600">*</span></label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    placeholder="Your Email Address"
                                    className="w-full bg-white text-gray-900 text-xs md:text-sm px-2 md:px-3 py-1.5 md:py-2 rounded-md border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none placeholder-gray-400"
                                    required
                                />
                            </div>

                            <div className="col-span-2 space-y-0.5 md:space-y-1">
                                <label className="text-[10px] font-bold text-gray-700 uppercase">Phone <span className="text-blue-600">*</span></label>
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={e => setPhone(e.target.value)}
                                    placeholder="(555) 555-5555"
                                    className="w-full bg-white text-gray-900 text-xs md:text-sm px-2 md:px-3 py-1.5 md:py-2 rounded-md border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none placeholder-gray-400"
                                    required
                                />
                            </div>

                            <div className="space-y-0.5 md:space-y-1">
                                <label className="text-[10px] font-bold text-gray-700 uppercase">State <span className="text-blue-600">*</span></label>
                                <select
                                    value={state}
                                    onChange={e => handleStateChange(e.target.value)}
                                    className="w-full bg-white text-dark-900 text-xs md:text-sm font-semibold px-2 md:px-3 py-1.5 md:py-2 rounded-md border border-gray-300 focus:border-teal-500 outline-none"
                                    required
                                >
                                    <option value="">State</option>
                                    {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                                {loadingZipcodes && (
                                    <p className="text-xs text-blue-600 mt-1">Loading zipcodes...</p>
                                )}
                            </div>

                            <div className="space-y-0.5 md:space-y-1">
                                <label className="text-[10px] font-bold text-gray-700 uppercase">Zip <span className="text-blue-600">*</span></label>

                                <div className="relative">
                                    <input
                                        type="text"
                                        value={zip}
                                        onChange={e => {
                                            const val = e.target.value
                                            setZip(val)
                                            // Filter suggestions?
                                            if (zipcodes.length > 0) {
                                                setShowZipSuggestions(true)
                                                // Local lookup for city match
                                                const match = zipcodes.find(z => z.postal_code === val)
                                                if (match) {
                                                    setZipcodeCity(match.city_name)
                                                } else {
                                                    // Only clear city if we were relying on a match, 
                                                    // BUT if user is typing custom we might want to let them? 
                                                    // For now, clear if strict mismatch to encourage selection, 
                                                    // but validation won't block custom.
                                                    setZipcodeCity('')
                                                    // Fallback to strict lookup if 5 digits? 
                                                    if (val.length === 5) {
                                                        handleZipChange(val) // Backend verify
                                                    }
                                                }
                                            } else {
                                                handleZipChange(val)
                                            }
                                        }}
                                        onFocus={() => {
                                            if (zipcodes.length > 0) setShowZipSuggestions(true)
                                        }}
                                        onBlur={() => {
                                            // Delay hide to allow click
                                            setTimeout(() => setShowZipSuggestions(false), 200)
                                        }}
                                        placeholder="Zip Code"
                                        className="w-full bg-white text-gray-900 text-xs md:text-sm px-2 md:px-3 py-1.5 md:py-2 rounded-md border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none placeholder-gray-400"
                                        required
                                    />

                                    {loadingZipcode && (
                                        <div className="absolute right-2 top-1/2 -translate-y-1/2">
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                        </div>
                                    )}

                                    {/* Suggestions Dropdown */}
                                    {showZipSuggestions && zipcodes.length > 0 && (
                                        <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
                                            {zipcodes
                                                .filter(z => z.postal_code.startsWith(zip))
                                                .slice(0, 100) // Limit render
                                                .map(z => (
                                                    <div
                                                        key={z.postal_code}
                                                        className="px-3 py-2 text-xs md:text-sm hover:bg-blue-50 cursor-pointer text-gray-700 flex justify-between"
                                                        onMouseDown={(e) => {
                                                            e.preventDefault() // Prevent blur
                                                            setZip(z.postal_code)
                                                            setZipcodeCity(z.city_name)
                                                            setShowZipSuggestions(false)
                                                        }}
                                                    >
                                                        <span className="font-bold">{z.postal_code}</span>
                                                        <span className="text-gray-500">{z.city_name}</span>
                                                    </div>
                                                ))}
                                            {zipcodes.filter(z => z.postal_code.startsWith(zip)).length === 0 && (
                                                <div className="px-3 py-2 text-xs text-gray-400 italic">
                                                    No matches found. You can add this zip.
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {zipcodeCity && (
                                    <p className="text-xs text-green-600 mt-1 animate-fade-in">
                                        📍 {zipcodeCity}, {state}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Security Code */}
                        <div className="bg-gray-50 p-2 md:p-3 rounded-lg border border-gray-200 flex items-center justify-between gap-2 md:gap-3 mt-2 md:mt-4">
                            <div className="bg-white text-gray-900 font-mono font-black text-base md:text-lg px-2 md:px-3 py-1 rounded tracking-widest select-none shadow-sm border border-gray-300 w-20 md:w-24 text-center">
                                {securityCode}
                            </div>
                            <input
                                type="text"
                                value={userSecurityCode}
                                onChange={e => setUserSecurityCode(e.target.value)}
                                placeholder="ENTER CODE"
                                className="flex-1 bg-white text-gray-900 text-xs md:text-sm px-2 md:px-3 py-1.5 md:py-2 rounded-md border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none placeholder-gray-400 text-center uppercase font-bold"
                                maxLength={4}
                                required
                            />
                        </div>

                        {/* Submit Button */}
                        <div className="space-y-1.5 md:space-y-2 pt-1.5 md:pt-2">
                            {submitError && (
                                <div className="text-red-600 text-[10px] md:text-xs text-center font-bold bg-red-50 p-1.5 md:p-2 rounded border border-red-200">
                                    {submitError}
                                </div>
                            )}
                            <button
                                type="submit"
                                disabled={submitting}
                                className={`w-full bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-500 hover:to-teal-600 text-white font-black text-xs md:text-sm uppercase rounded-lg shadow-soft-lg hover:shadow-elevation transition-all transform active:scale-95 disabled:opacity-50 disabled:transform-none ${isHorizontal ? 'py-3 md:py-4 text-sm md:text-base' : 'py-2.5 md:py-3'}`}
                            >
                                {submitting ? 'SENDING...' : (leadType === 'vendor' ? 'FIND VENDOR' : 'FIND MY PART NOW')}
                            </button>
                        </div>
                    </div>
                )}
            </form >
        </div >
    )
}
