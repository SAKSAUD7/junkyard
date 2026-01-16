import { useState, useEffect, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../services/api'

// US States with full names and sample ZIP codes
const US_STATES = [
    { code: 'AL', name: 'Alabama', zip: '35004' },
    { code: 'AK', name: 'Alaska', zip: '99501' },
    { code: 'AZ', name: 'Arizona', zip: '85001' },
    { code: 'AR', name: 'Arkansas', zip: '72201' },
    { code: 'CA', name: 'California', zip: '90001' },
    { code: 'CO', name: 'Colorado', zip: '80201' },
    { code: 'CT', name: 'Connecticut', zip: '06101' },
    { code: 'DE', name: 'Delaware', zip: '19901' },
    { code: 'FL', name: 'Florida', zip: '32003' },
    { code: 'GA', name: 'Georgia', zip: '30002' },
    { code: 'HI', name: 'Hawaii', zip: '96801' },
    { code: 'ID', name: 'Idaho', zip: '83254' },
    { code: 'IL', name: 'Illinois', zip: '60007' },
    { code: 'IN', name: 'Indiana', zip: '46001' },
    { code: 'IA', name: 'Iowa', zip: '50001' },
    { code: 'KS', name: 'Kansas', zip: '66002' },
    { code: 'KY', name: 'Kentucky', zip: '40003' },
    { code: 'LA', name: 'Louisiana', zip: '70001' },
    { code: 'ME', name: 'Maine', zip: '04032' },
    { code: 'MD', name: 'Maryland', zip: '20601' },
    { code: 'MA', name: 'Massachusetts', zip: '01001' },
    { code: 'MI', name: 'Michigan', zip: '48001' },
    { code: 'MN', name: 'Minnesota', zip: '55001' },
    { code: 'MS', name: 'Mississippi', zip: '38601' },
    { code: 'MO', name: 'Missouri', zip: '63005' },
    { code: 'MT', name: 'Montana', zip: '59001' },
    { code: 'NE', name: 'Nebraska', zip: '68001' },
    { code: 'NV', name: 'Nevada', zip: '89001' },
    { code: 'NH', name: 'New Hampshire', zip: '03031' },
    { code: 'NJ', name: 'New Jersey', zip: '07001' },
    { code: 'NM', name: 'New Mexico', zip: '87001' },
    { code: 'NY', name: 'New York', zip: '10001' },
    { code: 'NC', name: 'North Carolina', zip: '27006' },
    { code: 'ND', name: 'North Dakota', zip: '58001' },
    { code: 'OH', name: 'Ohio', zip: '43001' },
    { code: 'OK', name: 'Oklahoma', zip: '73001' },
    { code: 'OR', name: 'Oregon', zip: '97001' },
    { code: 'PA', name: 'Pennsylvania', zip: '15001' },
    { code: 'RI', name: 'Rhode Island', zip: '02801' },
    { code: 'SC', name: 'South Carolina', zip: '29001' },
    { code: 'SD', name: 'South Dakota', zip: '57001' },
    { code: 'TN', name: 'Tennessee', zip: '37010' },
    { code: 'TX', name: 'Texas', zip: '75001' },
    { code: 'UT', name: 'Utah', zip: '84003' },
    { code: 'VT', name: 'Vermont', zip: '05001' },
    { code: 'VA', name: 'Virginia', zip: '20101' },
    { code: 'WA', name: 'Washington', zip: '98001' },
    { code: 'WV', name: 'West Virginia', zip: '24701' },
    { code: 'WI', name: 'Wisconsin', zip: '53001' },
    { code: 'WY', name: 'Wyoming', zip: '82001' }
]

export default function LeadForm({ layout = 'vertical' }) {
    const navigate = useNavigate()

    // -- State --
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
        // DON'T load makes on mount - wait for user to click dropdown
    }, [])

    // Auto-populate ZIP code when state changes
    useEffect(() => {
        if (state) {
            const selectedState = US_STATES.find(s => s.code === state)
            if (selectedState && !zip) {
                setZip(selectedState.zip)
            }
        }
    }, [state])

    // -- API Loaders --

    const loadMakes = async () => {
        // Only load if not already loaded
        if (makes.length > 0 || loadingMakes) return

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

    // When Make Changes -> Load Models (with debouncing)
    useEffect(() => {
        if (!selectedMake) {
            setModels([])
            setYears([])
            setParts([])
            return
        }

        // Debounce to prevent rapid API calls
        const timeoutId = setTimeout(() => {
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
        }, 100) // 100ms debounce

        // Reset downstream
        setSelectedModel('')
        setSelectedYear('')
        setSelectedPart('')

        return () => clearTimeout(timeoutId)
    }, [selectedMake])

    // When Model Changes -> Load Years (with debouncing)
    useEffect(() => {
        if (!selectedMake || !selectedModel) {
            setYears([])
            setParts([])
            return
        }

        const timeoutId = setTimeout(() => {
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
        }, 100) // 100ms debounce

        // Reset downstream
        setSelectedYear('')
        setSelectedPart('')

        return () => clearTimeout(timeoutId)
    }, [selectedModel])


    // When Year Changes -> Load Parts (Filtered, with debouncing)
    useEffect(() => {
        if (!selectedMake || !selectedModel || !selectedYear) {
            setParts([])
            return
        }

        const timeoutId = setTimeout(() => {
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
        }, 100) // 100ms debounce

        // Reset downstream
        setSelectedPart('')

        return () => clearTimeout(timeoutId)
    }, [selectedYear])


    // Lookup Hollander number when Everything Selected
    useEffect(() => {
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
                            model: modelObj?.modelName || '', // We need model string for lookup logic sometimes, but ID is safer if backend supports it
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
                            setHollanderNumber('Call for Availability - Best results for 2010-2024 vehicles')
                            setOptions('')
                        }
                    } else {
                        setHollanderNumber('Call for Availability - Best results for 2010-2024 vehicles')
                        setOptions('')
                    }
                } catch (error) {
                    console.error('Hollander lookup error:', error)
                    setHollanderNumber('Unable to lookup - Please try again')
                    setOptions('')
                }

                setLoadingHollander(false)
            } else {
                setHollanderNumber('')
                setOptions('')
            }
        }

        lookupHollander()
    }, [selectedYear, selectedMake, selectedModel, selectedPart, makes, models, parts])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSubmitError(null)

        if (!selectedMake || !selectedModel || !selectedPart || !selectedYear) {
            setSubmitError('Please select all vehicle details.')
            return
        }
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

        const payload = {
            make: makeObj ? makeObj.makeName : 'Unknown',
            model: selectedModel,
            part: partObj ? partObj.partName : 'Unknown',
            year: parseInt(selectedYear),
            name,
            email,
            phone,
            state,
            zip,
            options: options || '',
            hollander_number: hollanderNumber || ''
        }

        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/api/leads/`, {
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

    // Memoize dropdown options for performance
    const makeOptions = useMemo(() =>
        makes?.map(m => <option key={m.makeID} value={m.makeID}>{m.makeName}</option>),
        [makes]
    )

    const modelOptions = useMemo(() =>
        models.map(m => <option key={m.modelID} value={m.modelID}>{m.modelName}</option>),
        [models]
    )

    const yearOptions = useMemo(() =>
        years.map(y => <option key={y} value={y}>{y}</option>),
        [years]
    )

    const partOptions = useMemo(() =>
        parts.map(p => <option key={p.partID} value={p.partID}>{p.partName}</option>),
        [parts]
    )

    if (isSuccess) {
        return (
            <div className={`w-full ${layout === 'horizontal' ? 'max-w-xl' : 'max-w-sm'} mx-auto font-sans bg-dark-900/95 backdrop-blur-md p-8 rounded-xl border border-white/10 shadow-2xl text-center flex flex-col items-center justify-center min-h-[400px] animate-fade-in`}>
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
                <button onClick={handleReset} className="text-orange-500 font-bold hover:text-orange-400 transition-colors uppercase tracking-wide text-sm border-b border-transparent hover:border-orange-500">
                    Submit Another Request
                </button>
            </div>
        )
    }

    const isHorizontal = layout === 'horizontal'

    return (
        <>
            {/* Loading Overlay */}
            {submitting && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
                    <div className="bg-dark-900/95 backdrop-blur-md p-8 rounded-2xl border border-white/20 shadow-2xl text-center">
                        <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-orange-500 border-t-transparent mb-4"></div>
                        <p className="text-white text-lg font-semibold">Submitting your request...</p>
                        <p className="text-white/60 text-sm mt-2">Please wait</p>
                    </div>
                </div>
            )}

            <div className={`w-full ${isHorizontal ? 'max-w-4xl' : 'max-w-sm'} mx-auto font-sans transition-all duration-300`}>
                {/* Header */}
                <div className={`bg-gradient-to-r from-orange-400 to-orange-500 rounded-t-xl p-2 md:p-3 text-center shadow-lg ${isHorizontal ? 'py-2 md:py-3' : ''}`}>
                    <h2 className={`${isHorizontal ? 'text-sm md:text-lg' : 'text-sm md:text-lg'} font-black text-white uppercase tracking-wide leading-tight`}>
                        NEED A QUALITY USED PART?
                    </h2>
                </div>

                {/* Form Body */}
                <form onSubmit={handleSubmit} className={`bg-dark-900/95 backdrop-blur-md p-3 md:p-5 rounded-b-xl border border-white/10 shadow-2xl ${isHorizontal ? 'grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-5 p-4 md:p-6' : 'space-y-2 md:space-y-3'}`}>

                    {/* Left Column (Vehicle Info) */}
                    <div className={`space-y-1.5 md:space-y-2 ${isHorizontal ? 'border-r border-white/10 pr-3 md:pr-6' : ''}`}>
                        {isHorizontal && <h3 className="text-orange-500 font-bold uppercase tracking-wider mb-1.5 md:mb-2 text-[10px] md:text-xs border-b border-white/10 pb-1">Vehicle Details</h3>}

                        {/* 1. Make */}
                        <div className="space-y-0.5 md:space-y-1">
                            <label className="text-[10px] md:text-xs font-bold text-white uppercase flex justify-between">
                                1. Make <span className="text-orange-500">*</span>
                                {loadingMakes && <span className="text-[9px] text-orange-400 lowercase animate-pulse">loading...</span>}
                            </label>
                            <select
                                value={selectedMake}
                                onChange={(e) => setSelectedMake(e.target.value)}
                                onFocus={loadMakes}
                                className="w-full bg-white text-dark-900 text-xs md:text-sm font-semibold rounded-md px-2 md:px-3 py-1.5 md:py-2 border border-gray-300 focus:border-orange-500 outline-none"
                                required
                            >
                                <option value="">Select Make</option>
                                {makeOptions}
                            </select>
                        </div>

                        {/* 2. Model */}
                        <div className="space-y-0.5 md:space-y-1">
                            <label className="text-[10px] md:text-xs font-bold text-white uppercase flex justify-between">
                                2. Model <span className="text-orange-500">*</span>
                                {loadingModels && <span className="text-[9px] text-orange-400 lowercase animate-pulse">loading...</span>}
                            </label>
                            <select
                                value={selectedModel}
                                onChange={(e) => setSelectedModel(e.target.value)}
                                className="w-full bg-white text-dark-900 text-xs md:text-sm font-semibold rounded-md px-2 md:px-3 py-1.5 md:py-2 border border-gray-300 focus:border-orange-500 outline-none disabled:bg-gray-200"
                                disabled={!selectedMake}
                                required
                            >
                                <option value="">Select Model</option>
                                {modelOptions}
                            </select>
                        </div>

                        {/* 3. Year */}
                        <div className="space-y-0.5 md:space-y-1">
                            <label className="text-[10px] md:text-xs font-bold text-white uppercase flex justify-between">
                                3. Year <span className="text-orange-500">*</span>
                                {loadingYears && <span className="text-[9px] text-orange-400 lowercase animate-pulse">loading...</span>}
                            </label>
                            <select
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(e.target.value)}
                                className="w-full bg-white text-dark-900 text-xs md:text-sm font-semibold rounded-md px-2 md:px-3 py-1.5 md:py-2 border border-gray-300 focus:border-orange-500 outline-none disabled:bg-gray-200"
                                disabled={!selectedModel}
                                required
                            >
                                <option value="">Select Year</option>
                                {yearOptions}
                            </select>
                            <p className="text-[9px] md:text-[10px] text-white/50 mt-0.5">
                                💡 Best results for 2010-2024 vehicles
                            </p>
                        </div>

                        {/* 4. Part */}
                        <div className="space-y-0.5 md:space-y-1">
                            <label className="text-[10px] md:text-xs font-bold text-white uppercase flex justify-between">
                                4. Part <span className="text-orange-500">*</span>
                                {loadingParts && <span className="text-[9px] text-orange-400 lowercase animate-pulse">loading...</span>}
                            </label>
                            <select
                                value={selectedPart}
                                onChange={(e) => setSelectedPart(e.target.value)}
                                className="w-full bg-white text-dark-900 text-xs md:text-sm font-semibold rounded-md px-2 md:px-3 py-1.5 md:py-2 border border-gray-300 focus:border-orange-500 outline-none disabled:bg-gray-200"
                                disabled={!selectedYear}
                                required
                            >
                                <option value="">Select Part</option>
                                {partOptions}
                            </select>
                        </div>

                        {/* 5. Options (Auto-populated from Hollander) */}
                        <div className="space-y-0.5 md:space-y-1">
                            <label className="text-[10px] md:text-xs font-bold text-white uppercase flex items-center gap-1">
                                5. Options
                                {loadingHollander && <span className="text-orange-500 text-[8px]">(Loading...)</span>}
                            </label>
                            <input
                                type="text"
                                value={options}
                                readOnly
                                placeholder="Auto-populated from part specs"
                                className="w-full bg-gray-700/50 text-white text-xs md:text-sm px-2 md:px-3 py-1.5 md:py-2 rounded-md border border-white/20 outline-none cursor-not-allowed"
                            />
                        </div>

                        {/* Hollander Number (Auto-populated) */}
                        <div className="space-y-0.5 md:space-y-1">
                            <label className="text-[10px] md:text-xs font-bold text-white uppercase flex items-center gap-1">
                                Hollander #
                                {loadingHollander && (
                                    <span className="flex items-center gap-1 text-orange-500 text-[8px]">
                                        <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Finding part numbers...
                                    </span>
                                )}
                            </label>
                            <input
                                type="text"
                                value={hollanderNumber}
                                readOnly
                                placeholder="Auto-populated"
                                className="w-full bg-gray-700/50 text-white text-xs md:text-sm px-2 md:px-3 py-1.5 md:py-2 rounded-md border border-white/20 outline-none cursor-not-allowed"
                            />
                        </div>
                    </div>

                    {/* Right Column (Contact Info) */}
                    <div className={`space-y-1.5 md:space-y-2 ${isHorizontal ? '' : ''}`}>
                        {isHorizontal && <h3 className="text-orange-500 font-bold uppercase tracking-wider mb-1.5 md:mb-2 text-[10px] md:text-xs border-b border-white/10 pb-1">Contact Information</h3>}

                        {/* Contact Grid */}
                        <div className={`grid grid-cols-2 gap-2 md:gap-3 ${!isHorizontal ? 'pt-1.5 md:pt-2 border-t border-white/10' : ''}`}>
                            <div className="col-span-2 space-y-0.5 md:space-y-1">
                                <label className="text-[10px] font-bold text-white/70 uppercase">Name <span className="text-orange-500">*</span></label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    placeholder="Your Name"
                                    className="w-full bg-white/10 text-white text-xs md:text-sm px-2 md:px-3 py-1.5 md:py-2 rounded-md border border-white/20 focus:border-orange-500 outline-none placeholder-white/30"
                                    required
                                />
                            </div>

                            <div className="col-span-2 space-y-0.5 md:space-y-1">
                                <label className="text-[10px] font-bold text-white/70 uppercase">Email <span className="text-orange-500">*</span></label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    placeholder="Your Email Address"
                                    className="w-full bg-white/10 text-white text-xs md:text-sm px-2 md:px-3 py-1.5 md:py-2 rounded-md border border-white/20 focus:border-orange-500 outline-none placeholder-white/30"
                                    required
                                />
                            </div>

                            <div className="col-span-2 space-y-0.5 md:space-y-1">
                                <label className="text-[10px] font-bold text-white/70 uppercase">Phone <span className="text-orange-500">*</span></label>
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={e => setPhone(e.target.value)}
                                    placeholder="(555) 555-5555"
                                    className="w-full bg-white/10 text-white text-xs md:text-sm px-2 md:px-3 py-1.5 md:py-2 rounded-md border border-white/20 focus:border-orange-500 outline-none placeholder-white/30"
                                    required
                                />
                            </div>

                            <div className="space-y-0.5 md:space-y-1">
                                <label className="text-[10px] font-bold text-white/70 uppercase">State <span className="text-orange-500">*</span></label>
                                <select
                                    value={state}
                                    onChange={e => setState(e.target.value)}
                                    className="w-full bg-white/10 text-white text-xs md:text-sm px-2 md:px-3 py-1.5 md:py-2 rounded-md border border-white/20 focus:border-orange-500 outline-none"
                                    required
                                >
                                    <option value="">Select State</option>
                                    {US_STATES.map(s => <option key={s.code} value={s.code}>{s.name}</option>)}
                                </select>
                            </div>

                            <div className="space-y-0.5 md:space-y-1">
                                <label className="text-[10px] font-bold text-white/70 uppercase">Zip <span className="text-orange-500">*</span></label>
                                <input
                                    type="text"
                                    value={zip}
                                    onChange={e => setZip(e.target.value)}
                                    placeholder="Zip Code"
                                    className="w-full bg-white/10 text-white text-xs md:text-sm px-2 md:px-3 py-1.5 md:py-2 rounded-md border border-white/20 focus:border-orange-500 outline-none placeholder-white/30"
                                    required
                                />
                            </div>
                        </div>

                        {/* Security Code */}
                        <div className="bg-white/5 p-2 md:p-3 rounded-lg border border-white/10 flex items-center justify-between gap-2 md:gap-3 mt-2 md:mt-4">
                            <div className="bg-white/90 text-dark-900 font-mono font-black text-base md:text-lg px-2 md:px-3 py-1 rounded tracking-widest select-none bg-opacity-80 decoration-slice shadow-inner w-20 md:w-24 text-center">
                                {securityCode}
                            </div>
                            <input
                                type="text"
                                value={userSecurityCode}
                                onChange={e => setUserSecurityCode(e.target.value)}
                                placeholder="ENTER CODE"
                                className="flex-1 bg-white/10 text-white text-xs md:text-sm px-2 md:px-3 py-1.5 md:py-2 rounded-md border border-white/20 focus:border-orange-500 outline-none placeholder-white/30 text-center uppercase font-bold"
                                maxLength={4}
                                required
                            />
                        </div>

                        {/* Submit Button */}
                        <div className="space-y-1.5 md:space-y-2 pt-1.5 md:pt-2">
                            {submitError && (
                                <div className="text-red-400 text-[10px] md:text-xs text-center font-bold bg-red-900/20 p-1.5 md:p-2 rounded">
                                    {submitError}
                                </div>
                            )}
                            <button
                                type="submit"
                                disabled={submitting}
                                className={`w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white font-black text-xs md:text-sm uppercase rounded-lg shadow-lg hover:shadow-orange-500/20 transition-all transform active:scale-95 disabled:opacity-50 disabled:transform-none ${isHorizontal ? 'py-3 md:py-4 text-sm md:text-base' : 'py-2.5 md:py-3'}`}
                            >
                                {submitting ? 'SENDING...' : 'FIND MY PART NOW'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </>
    )
}
