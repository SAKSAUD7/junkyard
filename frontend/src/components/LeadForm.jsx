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
    const [loadingVehicleData, setLoadingVehicleData] = useState(false)
    const [loadingParts, setLoadingParts] = useState(false)

    // Bulk Data Cache (NEW - eliminates sequential API calls)
    const [vehicleDataCache, setVehicleDataCache] = useState(null)

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
                const data = await api.lookupZipcode(zipValue)

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
                const data = await api.getZipcodesByState(stateValue)

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
            console.warn("[LeadForm] Makes unavailable — backend 500")
        } finally {
            setLoadingMakes(false)
        }
        setLoadingParts(true)
        try {
            const partsData = await api.getParts()
            setParts((partsData || []).map(p => ({ partID: p.partID || p.part_id, partName: p.partName || p.part_name })))
        } catch (err) {
            console.warn("[LeadForm] Parts unavailable")
        } finally {
            setLoadingParts(false)
        }
    }

    // OPTIMIZED: Bulk fetch all vehicle data when Make changes (SINGLE API CALL)
    useEffect(() => {
        if (!selectedMake) {
            setVehicleDataCache(null)
            setModels([])
            setYears([])
            setParts([])
            return
        }

        const fetchVehicleDataBulk = async () => {
            setLoadingVehicleData(true)
            try {
                const data = await api.getVehicleDataBulk(selectedMake)

                // Cache the entire dataset
                setVehicleDataCache(data)

                // Populate models immediately from cache
                const modelsList = (data.models || []).map(m => ({
                    modelID: m.model_id,
                    modelName: m.model_name
                }))
                setModels(modelsList)

            } catch (err) {
                console.warn("[LeadForm] Vehicle data unavailable")
                // Fallback to old API if bulk fails
                try {
                    const data = await api.getModels({ make_id: selectedMake })
                    setModels(data || [])
                } catch (fallbackErr) {
                    console.warn("[LeadForm] Model fallback unavailable")
                }
            } finally {
                setLoadingVehicleData(false)
            }
        }

        fetchVehicleDataBulk()

        // Reset downstream selections
        setSelectedModel('')
        setSelectedYear('')
        setYears([])
    }, [selectedMake])

    // OPTIMIZED: Client-side filtering for Years (NO API CALL - INSTANT)
    useEffect(() => {
        if (!vehicleDataCache || !selectedModel) {
            setYears([])
            setParts([])
            return
        }

        // Find model in cache
        const model = vehicleDataCache.models.find(
            m => m.model_id === parseInt(selectedModel)
        )

        if (model) {
            setYears(model.years || [])
        } else {
            setYears([])
        }

        // Reset downstream
        setSelectedYear('')
        setSelectedPart('')
    }, [selectedModel, vehicleDataCache])




    // OPTIMIZED: Auto-populate Hollander from cache (NO API CALL - INSTANT)
    useEffect(() => {
        if (leadType === 'vendor') return

        if (!vehicleDataCache || !selectedModel || !selectedYear || !selectedPart) {
            setHollanderNumber('')
            setOptions('')
            return
        }

        // Find part in cache
        const model = vehicleDataCache.models.find(
            m => m.model_id === parseInt(selectedModel)
        )

        if (model && model.parts && model.parts[selectedYear]) {
            const part = model.parts[selectedYear].find(
                p => p.part_id === parseInt(selectedPart)
            )

            if (part) {
                setHollanderNumber(part.hollander_number || 'Not Found')
                setOptions(part.options || '')
            } else {
                setHollanderNumber('Not Found')
                setOptions('')
            }
        } else {
            setHollanderNumber('Not Found')
            setOptions('')
        }
    }, [selectedPart, vehicleDataCache, selectedModel, selectedYear, leadType])

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
        let payload;

        payload = {
            make: makeObj ? makeObj.makeName : 'Unknown',
            model: selectedModel,
            year: parseInt(selectedYear),
            name,
            email,
            phone,
            state,
            zip,
        };

        try {
            if (leadType === 'vendor') {
                // Vendor Lead
                await api.createVendorLead(payload)
            } else {
                // Quality Auto Parts Lead
                payload.part = partObj ? partObj.partName : 'Unknown';
                payload.lead_type = leadType;
                payload.options = options || '';
                payload.hollander_number = hollanderNumber || 'Not Found';
                await api.createLead(payload)
            }

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
            <div className="w-full bg-white rounded-2xl border border-slate-100 p-8 text-center flex flex-col items-center justify-center min-h-[320px]">
                <div className="w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center mb-5 shadow-[0_8px_20px_rgba(16,185,129,0.3)]">
                    <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <h2 className="text-2xl font-black text-slate-900 mb-2" style={{ fontFamily: "'Outfit', sans-serif" }}>Request Sent!</h2>
                <p className="text-slate-500 text-[14px] mb-6 leading-relaxed">
                    We've received your request.<br />A specialist will contact you shortly.
                </p>
                <button onClick={handleReset} className="text-blue-600 font-bold text-[13px] hover:text-blue-800 transition-colors underline underline-offset-2">
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
        <div className="w-full font-sans">

            {/* Section Label */}
            <div className="mb-4">
                <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">
                    {leadType === 'quality_auto_parts' ? 'Find a Used Part' : 'Contact This Yard'}
                </p>
                {enableSteps && (
                    <p className="text-[11px] text-slate-400 mt-0.5">Step {currentStep} of 2</p>
                )}
            </div>

            <form onSubmit={handleSubmit} className={`flex flex-col gap-3 ${isHorizontal ? 'lg:grid lg:grid-cols-2 lg:gap-4' : ''}`}>

                {/* Tab Toggle (only when mode is unlocked) */}
                {!mode && (
                    <div className={`${isHorizontal ? 'col-span-2' : ''} grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl`}>
                        <button type="button" onClick={() => handleTypeChange('quality_auto_parts')}
                            className={`py-2 text-[12px] font-bold rounded-lg transition-all ${
                                leadType === 'quality_auto_parts'
                                    ? 'bg-white text-blue-600 shadow-sm'
                                    : 'text-slate-500 hover:text-slate-700'
                            }`}>
                            Used Parts
                        </button>
                        <button type="button" onClick={() => handleTypeChange('vendor')}
                            className={`py-2 text-[12px] font-bold rounded-lg transition-all ${
                                leadType === 'vendor'
                                    ? 'bg-white text-blue-600 shadow-sm'
                                    : 'text-slate-500 hover:text-slate-700'
                            }`}>
                            Junkyard Vendors
                        </button>
                    </div>
                )}

                {/* Step Label */}
                {enableSteps && currentStep === 1 && (
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Vehicle Details</p>
                )}
                {enableSteps && currentStep === 2 && (
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Your Contact Info</p>
                )}

                {/* ── VEHICLE FIELDS ── */}
                {showVehicleDetails && (
                    <div className={`space-y-3 ${isHorizontal ? 'border-r border-slate-100 pr-4' : ''}`}>
                        {isHorizontal && <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Vehicle Details</h3>}

                        {/* Make */}
                        <div className="space-y-1">
                            <label className="flex justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                                Make <span className="text-blue-500">*{loadingMakes && <span className="font-normal lowercase text-slate-400 animate-pulse"> loading...</span>}</span>
                            </label>
                            <select value={selectedMake} onChange={e => setSelectedMake(e.target.value)}
                                className="w-full bg-white text-slate-900 text-[13px] font-medium rounded-xl px-3 py-2.5 border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all"
                                required>
                                <option value="">Select Make</option>
                                {makes?.map(m => <option key={m.makeID} value={m.makeID}>{m.makeName}</option>)}
                            </select>
                        </div>

                        {/* Model */}
                        <div className="space-y-1">
                            <label className="flex justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                                Model <span className="text-blue-500">*{loadingVehicleData && <span className="font-normal lowercase text-slate-400 animate-pulse"> loading...</span>}</span>
                            </label>
                            <select value={selectedModel} onChange={e => setSelectedModel(e.target.value)}
                                disabled={!selectedMake}
                                className={`w-full text-[13px] font-medium rounded-xl px-3 py-2.5 border focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all ${
                                    !selectedMake ? 'bg-slate-100 text-slate-400 border-slate-100 cursor-not-allowed' : 'bg-white text-slate-900 border-slate-200'
                                }`}
                                required>
                                <option value="">Select Model</option>
                                {models.map(m => <option key={m.modelID} value={m.modelID}>{m.modelName}</option>)}
                            </select>
                        </div>

                        {/* Year */}
                        <div className="space-y-1">
                            <label className="flex justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                                Year <span className="text-blue-500">*</span>
                            </label>
                            <select value={selectedYear} onChange={e => setSelectedYear(e.target.value)}
                                disabled={!selectedModel}
                                className={`w-full text-[13px] font-medium rounded-xl px-3 py-2.5 border focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all ${
                                    !selectedModel ? 'bg-slate-100 text-slate-400 border-slate-100 cursor-not-allowed' : 'bg-white text-slate-900 border-slate-200'
                                }`}
                                required>
                                <option value="">Select Year</option>
                                {years.map(y => <option key={y} value={y}>{y}</option>)}
                            </select>
                        </div>

                        {/* Part (Quality Auto Parts only) */}
                        {leadType === 'quality_auto_parts' && (
                            <div className="space-y-1">
                                <label className="flex justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                                    Part <span className="text-blue-500">*{loadingParts && <span className="font-normal lowercase text-slate-400 animate-pulse"> loading...</span>}</span>
                                </label>
                                <select value={selectedPart} onChange={e => setSelectedPart(e.target.value)}
                                    disabled={loadingParts}
                                    className={`w-full text-[13px] font-medium rounded-xl px-3 py-2.5 border focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all ${
                                        loadingParts ? 'bg-slate-100 text-slate-400 border-slate-100 cursor-not-allowed' : 'bg-white text-slate-900 border-slate-200'
                                    }`}
                                    required>
                                    <option value="">Select Part</option>
                                    {parts.map(p => <option key={p.partID} value={p.partID}>{p.partName}</option>)}
                                </select>
                            </div>
                        )}

                        {/* Next Step button (step mode) */}
                        {enableSteps && (
                            <button type="button" onClick={handleNext}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-[13px] py-3 rounded-xl shadow-[0_4px_12px_rgb(37,99,235,0.25)] transition-all flex items-center justify-center gap-2 group mt-2">
                                Next Step
                                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                            </button>
                        )}
                    </div>
                )}

                {/* ── CONTACT FIELDS ── */}
                {showContactInfo && (
                    <div className="space-y-3">
                        {enableSteps && (
                            <button type="button" onClick={handleBack}
                                className="flex items-center gap-1.5 text-[12px] font-bold text-slate-500 hover:text-blue-600 transition-colors mb-1">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                                Back
                            </button>
                        )}
                        {isHorizontal && <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Contact Information</h3>}

                        {/* Name */}
                        <div className="space-y-1">
                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Name <span className="text-blue-500">*</span></label>
                            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Your Name"
                                className="w-full bg-white text-slate-900 text-[13px] font-medium rounded-xl px-3 py-2.5 border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all placeholder-slate-400"
                                required />
                        </div>

                        {/* Email */}
                        <div className="space-y-1">
                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Email <span className="text-blue-500">*</span></label>
                            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com"
                                className="w-full bg-white text-slate-900 text-[13px] font-medium rounded-xl px-3 py-2.5 border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all placeholder-slate-400"
                                required />
                        </div>

                        {/* Phone */}
                        <div className="space-y-1">
                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Phone <span className="text-blue-500">*</span></label>
                            <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="(555) 555-5555"
                                className="w-full bg-white text-slate-900 text-[13px] font-medium rounded-xl px-3 py-2.5 border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all placeholder-slate-400"
                                required />
                        </div>

                        {/* State + ZIP — improved layout */}
                        <div className="space-y-2">
                            {/* ZIP first — type to auto-detect state */}
                            <div className="space-y-1">
                                <label className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                                    <span>ZIP Code <span className="text-blue-500">*</span></span>
                                    {loadingZipcode && <span className="font-normal lowercase text-blue-500 animate-pulse normal-case tracking-normal">Looking up…</span>}
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={zip}
                                        autoComplete="off"
                                        autoCorrect="off"
                                        autoCapitalize="off"
                                        spellCheck={false}
                                        inputMode="numeric"
                                        maxLength={10}
                                        onChange={e => {
                                            const val = e.target.value
                                            setZip(val)
                                            if (zipcodes.length > 0) {
                                                setShowZipSuggestions(true)
                                                const match = zipcodes.find(z => z.postal_code === val)
                                                if (match) { setZipcodeCity(match.city_name) }
                                                else { setZipcodeCity(''); if (val.length === 5) handleZipChange(val) }
                                            } else {
                                                handleZipChange(val)
                                            }
                                        }}
                                        onFocus={() => { if (zipcodes.length > 0) setShowZipSuggestions(true) }}
                                        onBlur={() => setTimeout(() => setShowZipSuggestions(false), 200)}
                                        placeholder="e.g. 90210"
                                        className="w-full bg-white text-slate-900 text-[13px] font-medium rounded-xl px-3 py-2.5 border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all placeholder-slate-400"
                                        required
                                    />
                                    {/* Spinner */}
                                    {loadingZipcode && (
                                        <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
                                            <div className="w-3.5 h-3.5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                                        </div>
                                    )}
                                    {/* Suggestions dropdown */}
                                    {showZipSuggestions && zipcodes.length > 0 && (
                                        <div className="absolute z-50 left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-48 overflow-y-auto">
                                            {zipcodes.filter(z => z.postal_code.startsWith(zip)).slice(0, 80).map((z, i) => (
                                                <div
                                                    key={`${z.postal_code}-${i}`}
                                                    className="px-3 py-2 text-[12px] hover:bg-blue-50 cursor-pointer text-slate-700 flex justify-between items-center border-b border-slate-50 last:border-0"
                                                    onMouseDown={e => {
                                                        e.preventDefault();
                                                        setZip(z.postal_code);
                                                        setZipcodeCity(z.city_name);
                                                        setShowZipSuggestions(false);
                                                    }}
                                                >
                                                    <span className="font-bold text-slate-800">{z.postal_code}</span>
                                                    <span className="text-slate-400 text-[11px]">{z.city_name}</span>
                                                </div>
                                            ))}
                                            {zipcodes.filter(z => z.postal_code.startsWith(zip)).length === 0 && (
                                                <div className="px-3 py-2.5 text-[11px] text-slate-400 italic text-center">No matches — you can type any ZIP code</div>
                                            )}
                                        </div>
                                    )}
                                </div>
                                {/* Auto-detected city/state feedback */}
                                {zipcodeCity ? (
                                    <p className="text-[10px] text-emerald-600 font-bold mt-1 flex items-center gap-1">
                                        <span>✓</span> {zipcodeCity}, {state}
                                    </p>
                                ) : (
                                    !state && <p className="text-[10px] text-slate-400 mt-1">Type your ZIP and we'll auto-detect your state</p>
                                )}
                            </div>

                            {/* State — auto-filled or manual override */}
                            <div className="space-y-1">
                                <label className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                                    <span>State <span className="text-blue-500">*</span></span>
                                    {state && !zipcodeCity && <span className="font-normal lowercase text-slate-400 normal-case tracking-normal text-[10px]">ZIP suggestions enabled</span>}
                                </label>
                                <select
                                    value={state}
                                    onChange={e => handleStateChange(e.target.value)}
                                    className="w-full bg-white text-slate-900 text-[13px] font-medium rounded-xl px-3 py-2.5 border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all"
                                    required
                                >
                                    <option value="">Select State</option>
                                    {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                                {loadingZipcodes && <p className="text-[10px] text-blue-500 animate-pulse">Loading ZIP codes for {state}…</p>}
                            </div>
                        </div>

                        {/* CAPTCHA */}
                        <div className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-100 rounded-xl mt-1">
                            <div className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 font-mono font-black text-[16px] text-slate-800 tracking-[0.2em] select-none min-w-[72px] text-center shadow-sm">
                                {securityCode}
                            </div>
                            <input type="text" value={userSecurityCode} onChange={e => setUserSecurityCode(e.target.value)}
                                placeholder="Enter code"
                                className="flex-1 bg-white text-slate-900 text-[13px] font-medium rounded-xl px-3 py-2 border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all placeholder-slate-400 uppercase text-center font-bold"
                                maxLength={4} required />
                        </div>

                        {/* Error */}
                        {submitError && (
                            <div className="text-[12px] text-red-600 font-bold bg-red-50 border border-red-100 rounded-xl px-3 py-2 text-center">
                                {submitError}
                            </div>
                        )}

                        {/* Submit */}
                        <button type="submit" disabled={submitting}
                            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-black text-[14px] uppercase rounded-xl py-3.5 shadow-[0_8px_20px_rgb(37,99,235,0.25)] hover:shadow-[0_12px_28px_rgb(37,99,235,0.35)] transition-all active:scale-[0.98] mt-1">
                            {submitting ? 'Sending...' : (leadType === 'vendor' ? 'Request Quote →' : 'Find My Part Now →')}
                        </button>
                    </div>
                )}
            </form>
        </div>
    )
}
