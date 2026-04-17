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
        setSelectedPart('')
        setYears([])
        setParts([])
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

    // Loading state for the parts API fallback
    const [loadingParts, setLoadingParts] = useState(false)

    // OPTIMIZED: Client-side filtering for Parts (NO API CALL - INSTANT)
    // Falls back to api.getParts() if bulk cache has no parts for this year
    useEffect(() => {
        // Skip for Vendor type
        if (leadType === 'vendor') {
            setParts([])
            return
        }

        if (!selectedModel || !selectedYear) {
            setParts([])
            return
        }

        // Try to get parts from the bulk cache first (instant, no API call)
        if (vehicleDataCache) {
            const model = vehicleDataCache.models.find(
                m => m.model_id === parseInt(selectedModel)
            )

            if (model && model.parts && model.parts[selectedYear] && model.parts[selectedYear].length > 0) {
                // Cache hit — map to expected format
                const partsList = model.parts[selectedYear].map(p => ({
                    partID: p.part_id,
                    partName: p.part_name
                }))
                setParts(partsList)
                setSelectedPart('')
                return
            }
        }

        // Fallback: cache miss or empty — call the parts API directly
        // This endpoint has wider matching (inventory + catalog + full PartType fallback)
        const fetchPartsFromAPI = async () => {
            setLoadingParts(true)
            try {
                const data = await api.getParts({
                    make_id: selectedMake,
                    model_id: selectedModel,
                    year: selectedYear
                })
                if (data && data.length > 0) {
                    const partsList = data.map(p => ({
                        partID: p.partID,
                        partName: p.partName
                    }))
                    setParts(partsList)
                } else {
                    setParts([])
                }
            } catch (err) {
                console.warn('[LeadForm] Parts fallback unavailable')
                setParts([])
            } finally {
                setLoadingParts(false)
            }
        }

        fetchPartsFromAPI()

        // Reset downstream
        setSelectedPart('')
    }, [selectedYear, vehicleDataCache, selectedModel, leadType, selectedMake])


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
            <div className={`w-full ${layout === 'horizontal' ? 'w-full md:max-w-xl' : 'w-full max-w-[360px] px-4 sm:px-0'} mx-auto font-sans bg-white/90 backdrop-blur-md p-6 md:p-8 rounded-xl border border-slate-200 shadow-2xl text-center flex flex-col items-center justify-center min-h-[400px] overflow-hidden`}>
                <div className="w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center mb-4">
                    <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <h2 className="text-3xl font-black text-slate-800 mb-2">LEAD SENT!</h2>
                <p className="text-slate-600 text-lg mb-6">
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
        <div className={`w-full ${isHorizontal ? 'max-w-4xl' : 'w-[calc(100vw-32px)] max-w-[360px]'} mx-auto font-sans transition-all duration-300`}>
            {/* Header */}
            <div className={`bg-gradient-to-r from-[#2563eb] to-[#0d9488] rounded-t-xl p-3 flex justify-between items-center px-4 md:px-5`}>
                <h2 className={`text-base md:text-lg font-black text-slate-900 uppercase tracking-tight`}>
                    {leadType === 'quality_auto_parts' ? 'NEED A QUALITY USED PART?' : 'FIND JUNKYARD VENDORS'}
                </h2>
                {enableSteps && (
                    <span className="text-teal-900 text-[10px] md:text-xs uppercase font-black tracking-wider opacity-60">
                        Step {currentStep} of 2
                    </span>
                )}
            </div>

            <form onSubmit={handleSubmit} className={`bg-[#18202F] p-4 md:p-5 rounded-b-xl shadow-2xl ${isHorizontal ? 'grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4' : 'flex flex-col gap-3'}`}>

                {/* Toggle Buttons (Full Width) */}
                {/* Only show toggle if mode is NOT locked */}
                {!mode && (
                    <div className={`${isHorizontal ? 'col-span-2' : ''} grid grid-cols-2 gap-2 mb-2`}>
                        <button
                            type="button"
                            onClick={() => handleTypeChange('quality_auto_parts')}
                            className={`py-2 text-xs md:text-sm font-bold uppercase rounded-md transition-all border ${leadType === 'quality_auto_parts' ? 'bg-[#2563eb] text-white border-[#2563eb] shadow-sm' : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'}`}
                        >
                            Quality Auto Parts
                        </button>
                        <button
                            type="button"
                            onClick={() => handleTypeChange('vendor')}
                            className={`py-2 text-xs md:text-sm font-bold uppercase rounded-md transition-all border ${leadType === 'vendor' ? 'bg-[#2563eb] text-white border-[#2563eb] shadow-sm' : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'}`}
                        >
                            Junkyard Vendors
                        </button>
                    </div>
                )}

                {/* Step Indicator Text (Optional) */}
                {enableSteps && currentStep === 1 && (
                    <div className="text-center text-[10px] md:text-xs text-slate-400 font-bold uppercase tracking-widest pb-2 border-b border-slate-700/50 mb-0.5 mt-0.5">
                        Vehicle Details
                    </div>
                )}
                {enableSteps && currentStep === 2 && (
                    <div className="text-center text-[10px] md:text-xs text-slate-400 font-bold uppercase tracking-widest pb-2 border-b border-slate-700/50 mb-0.5 mt-0.5">
                        Contact Information
                    </div>
                )}

                {/* Left Column (Vehicle Info) */}
                {showVehicleDetails && (
                    <div className={`space-y-1.5 md:space-y-2 ${isHorizontal ? 'border-r border-gray-200 pr-3 md:pr-6' : ''}`}>
                        {isHorizontal && <h3 className="text-blue-600 font-bold uppercase tracking-wider mb-1.5 md:mb-2 text-[10px] md:text-xs border-b border-gray-200 pb-1">Vehicle Details</h3>}

                        {/* 1. Make */}
                        <div className="space-y-1">
                            <label className="text-[10px] md:text-xs font-bold text-slate-500 uppercase flex justify-between tracking-wide">
                                1. Make <span className="text-blue-500 font-black text-[10px] md:text-xs">*</span>
                                {loadingMakes && <span className="text-[9px] text-blue-500 lowercase animate-pulse">loading...</span>}
                            </label>
                            <select
                                value={selectedMake}
                                onChange={(e) => setSelectedMake(e.target.value)}
                                className={`w-full text-slate-900 text-[13px] md:text-sm font-semibold rounded px-3 py-2 outline-none border-none ring-1 ring-transparent focus:ring-[#2563eb] transition-colors ${selectedMake ? 'bg-white' : 'bg-white'}`}
                                required
                            >
                                <option value="">Select Make</option>
                                {makes?.map(m => <option key={m.makeID} value={m.makeID}>{m.makeName}</option>)}
                            </select>
                        </div>

                        {/* 2. Model */}
                        <div className="space-y-1">
                            <label className="text-[10px] md:text-xs font-bold text-slate-500 uppercase flex justify-between tracking-wide">
                                2. Model <span className="text-blue-500 font-black text-[10px] md:text-xs">*</span>
                                {loadingVehicleData && <span className="text-[9px] text-blue-500 lowercase animate-pulse">loading...</span>}
                            </label>
                            <select
                                value={selectedModel}
                                onChange={(e) => setSelectedModel(e.target.value)}
                                className={`w-full text-[13px] md:text-sm font-semibold rounded px-3 py-2 outline-none border-none ring-1 ring-transparent focus:ring-[#2563eb] transition-colors ${!selectedMake ? 'bg-[#cbd5e1] text-slate-500' : 'bg-white text-slate-900'}`}
                                disabled={!selectedMake}
                                required
                            >
                                <option value="">Select Model</option>
                                {models.map(m => <option key={m.modelID} value={m.modelID}>{m.modelName}</option>)}
                            </select>
                        </div>

                        {/* 3. Year */}
                        <div className="space-y-1">
                            <label className="text-[10px] md:text-xs font-bold text-slate-500 uppercase flex justify-between tracking-wide">
                                3. Year <span className="text-blue-500 font-black text-[10px] md:text-xs">*</span>
                                {loadingVehicleData && <span className="text-[9px] text-blue-500 lowercase animate-pulse">loading...</span>}
                            </label>
                            <select
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(e.target.value)}
                                className={`w-full text-[13px] md:text-sm font-semibold rounded px-3 py-2 outline-none border-none ring-1 ring-transparent focus:ring-[#2563eb] transition-colors ${!selectedModel ? 'bg-[#cbd5e1] text-slate-500' : 'bg-white text-slate-900'}`}
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
                                <div className="space-y-1">
                                    <label className="text-[10px] md:text-xs font-bold text-slate-500 uppercase flex justify-between tracking-wide">
                                        4. Part <span className="text-blue-500 font-black text-[10px] md:text-xs">*</span>
                                        {(loadingVehicleData || loadingParts) && <span className="text-[9px] text-blue-500 lowercase animate-pulse">loading...</span>}
                                    </label>
                                    <select
                                        value={selectedPart}
                                        onChange={(e) => setSelectedPart(e.target.value)}
                                        className={`w-full text-[13px] md:text-sm font-semibold rounded px-3 py-2 outline-none border-none ring-1 ring-transparent focus:ring-[#2563eb] transition-colors ${!selectedYear || loadingParts ? 'bg-[#cbd5e1] text-slate-500' : 'bg-white text-slate-900'}`}
                                        disabled={!selectedYear || loadingParts}
                                        required
                                    >
                                        <option value="">Select Part</option>
                                        {parts.map(p => <option key={p.partID} value={p.partID}>{p.partName}</option>)}
                                    </select>
                                </div>

                                {/* 5. Options */}
                                <div className="space-y-1">
                                    <label className="text-[10px] md:text-xs font-bold text-slate-500 uppercase flex items-center gap-1 tracking-wide">
                                        5. Options
                                        {loadingHollander && <span className="text-blue-500 text-[9px] lowercase">(Loading...)</span>}
                                    </label>
                                    <input
                                        type="text"
                                        value={options}
                                        readOnly
                                        placeholder="Auto-populated from part specs"
                                        className="w-full bg-[#f1f5f9] text-slate-500 font-semibold text-[13px] md:text-sm px-3 py-2 rounded border-none outline-none cursor-not-allowed"
                                    />
                                </div>

                                {/* Hollander Number */}
                                <div className="space-y-1">
                                    <label className="text-[10px] md:text-xs font-bold text-slate-500 uppercase flex items-center gap-1 tracking-wide">
                                        Hollander #
                                        {loadingHollander && <span className="text-blue-500 text-[9px] lowercase">(Looking up...)</span>}
                                    </label>
                                    <input
                                        type="text"
                                        value={hollanderNumber}
                                        readOnly
                                        placeholder="Auto-populated"
                                        className="w-full bg-[#f1f5f9] text-slate-500 font-semibold text-[13px] md:text-sm px-3 py-2 rounded border-none outline-none cursor-not-allowed"
                                    />
                                </div>
                            </>
                        )}

                        {/* NEXT BUTTON for Step 1 */}
                        {enableSteps && (
                            <button
                                type="button"
                                onClick={handleNext}
                                className="w-full bg-[#3b82f6] hover:bg-[#2563eb] text-white font-bold py-2.5 px-4 rounded shadow-lg transition-all mt-4 flex items-center justify-center gap-2 group text-sm"
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
                                    className="w-full bg-white text-slate-800 text-xs md:text-sm font-semibold px-2 md:px-3 py-1.5 md:py-2 rounded-md border border-gray-300 focus:border-teal-500 outline-none"
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
                                                .map((z, index) => (
                                                    <div
                                                        key={`${z.postal_code}-${index}`}
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
                                className={`w-full bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-500 hover:to-teal-600 text-slate-800 font-black text-xs md:text-sm uppercase rounded-lg shadow-soft-lg hover:shadow-elevation transition-all transform active:scale-95 disabled:opacity-50 disabled:transform-none ${isHorizontal ? 'py-3 md:py-4 text-sm md:text-base' : 'py-2.5 md:py-3'}`}
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
