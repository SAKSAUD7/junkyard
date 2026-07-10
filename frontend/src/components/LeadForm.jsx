import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../services/api'
import Captcha from './Captcha'

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

// ── Searchable Dropdown (portal-style fixed positioning to escape scroll containers) ──
function SearchableDropdown({ value, selectedValue, label, placeholder, options, onSelect, disabled, loading }) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [dropPos, setDropPos] = useState({ top: 0, left: 0, width: 0 });
    const btnRef = useRef(null);
    const dropRef = useRef(null);

    // Close on outside click
    useEffect(() => {
        const handler = (e) => {
            if (
                btnRef.current && !btnRef.current.contains(e.target) &&
                dropRef.current && !dropRef.current.contains(e.target)
            ) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // Recalculate position when opening or on scroll/resize
    useEffect(() => {
        if (!open || !btnRef.current) return;
        const calc = () => {
            const rect = btnRef.current.getBoundingClientRect();
            setDropPos({ top: rect.bottom + 6, left: rect.left, width: rect.width });
        };
        calc();
        window.addEventListener('scroll', calc, true);
        window.addEventListener('resize', calc);
        return () => {
            window.removeEventListener('scroll', calc, true);
            window.removeEventListener('resize', calc);
        };
    }, [open]);

    const filtered = options.filter(o =>
        (o.label || o).toString().toLowerCase().includes(query.toLowerCase())
    ).slice(0, 1000);

    return (
        <div className="relative w-full">
            <button
                ref={btnRef}
                type="button"
                disabled={disabled}
                onClick={() => { if (!disabled) { setOpen(v => !v); setQuery(''); } }}
                className={`w-full flex items-center justify-between gap-1 px-3 py-3 text-[14px] font-semibold transition-all rounded-xl border-2
                    ${ disabled
                        ? 'bg-slate-50/50 border-transparent text-slate-400 cursor-not-allowed'
                        : open
                            ? 'bg-white border-blue-500 ring-4 ring-blue-500/15 text-slate-900 cursor-pointer'
                            : 'bg-slate-50 hover:bg-slate-100 border-transparent text-slate-900 cursor-pointer'
                    }
                `}
            >
                <span className={`truncate ${!value ? 'text-slate-400' : 'text-slate-900'}`}>
                    {loading ? 'Loading...' : (value || placeholder)}
                </span>
                <svg className={`w-3.5 h-3.5 shrink-0 transition-transform ${open ? 'rotate-180' : ''} text-slate-400`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7"/></svg>
            </button>

            {open && typeof window !== 'undefined' && (
                <div
                    ref={dropRef}
                    style={{
                        position: 'fixed',
                        top: dropPos.top,
                        left: dropPos.left,
                        width: dropPos.width,
                        zIndex: 99999,
                    }}
                    className="bg-white rounded-xl shadow-[0_12px_40px_rgba(0,0,0,0.18)] border border-slate-100 overflow-hidden"
                >
                    {/* Search */}
                    <div className="px-3 pt-2.5 pb-2 border-b border-slate-100">
                        <div className="flex items-center gap-2 bg-slate-50 rounded-lg px-2.5 py-1.5">
                            <svg className="w-3.5 h-3.5 text-blue-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                            <input
                                autoFocus
                                type="text"
                                value={query}
                                onChange={e => setQuery(e.target.value)}
                                placeholder={`Search ${label}...`}
                                className="bg-transparent text-[12px] font-semibold text-slate-800 placeholder-slate-400 outline-none w-full"
                            />
                        </div>
                    </div>
                    {/* List */}
                    <div className="max-h-48 overflow-y-auto py-1">
                        {filtered.length === 0 ? (
                            <p className="px-4 py-3 text-[12px] text-slate-400 text-center">No results for "{query}"</p>
                        ) : filtered.map((o, i) => {
                            const val = o.value !== undefined ? o.value : o;
                            const lbl = o.label !== undefined ? o.label : o;
                            return (
                                <button key={i} type="button"
                                    onMouseDown={() => { onSelect(val, lbl); setOpen(false); setQuery(''); }}
                                    className={`w-full text-left px-3.5 py-2 text-[13px] font-semibold transition-colors
                                        ${String(val) === String(selectedValue) ? 'bg-blue-50 text-blue-600' : 'text-slate-700 hover:bg-slate-50 hover:text-blue-600'}`}
                                >
                                    {lbl}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}


export default function LeadForm({ layout = 'vertical', mode = null, vendorName = null, enableSteps = false, hideHeader = false }) {
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
    const [selectedMakeName, setSelectedMakeName] = useState('')
    
    const [selectedModel, setSelectedModel] = useState('')
    const [selectedModelName, setSelectedModelName] = useState('')
    
    const [selectedYear, setSelectedYear] = useState('')
    
    const [selectedPart, setSelectedPart] = useState('')
    const [selectedPartName, setSelectedPartName] = useState('')

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
    const [hollanderCandidates, setHollanderCandidates] = useState([]) // all remaining when unresolved
    const [loadingHollander, setLoadingHollander] = useState(false)

    // Progressive question engine state
    const [partVariants, setPartVariants] = useState([])
    const [questionAnswers, setQuestionAnswers] = useState([])  // [{slot, value}, ...]
    const [currentQuestion, setCurrentQuestion] = useState(null) // next question to show
    const [candidatesCount, setCandidatesCount] = useState(0)   // remaining candidates
    const [totalVariants, setTotalVariants] = useState(0)       // initial variant count
    const [hollanderResolved, setHollanderResolved] = useState(false) // true when 1 candidate
    const [loadingQuestion, setLoadingQuestion] = useState(false)

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
            return
        }

        // Find model in cache
        const model = vehicleDataCache.models.find(
            m => m.model_id == selectedModel
        )

        if (model) {
            let modelYears = model.years || [];
            if (modelYears.length === 0) {
                // Fallback to static years if the database has no years mapped for this model
                modelYears = Array.from({length: 45}, (_, i) => 2024 - i);
            }
            setYears(modelYears)
        } else {
            setYears([])
        }

        // Reset downstream
        setSelectedYear('')
        setSelectedPart('')
        setSelectedPartName('')
        setParts([])
    }, [selectedModel, vehicleDataCache])

    // Load parts from cache when Year is selected
    useEffect(() => {
        if (!vehicleDataCache || !selectedModel || !selectedYear) {
            setParts([])
            return
        }
        // Always load the full list of parts to ensure nothing is missed.
        const fetchParts = async () => {
            setLoadingParts(true)
            try {
                const partsData = await api.getParts()
                // Format the parts
                let allParts = (partsData || []).map(p => ({ 
                    partID: p.partID || p.part_id, 
                    partName: p.partName || p.part_name 
                }))
                
                // If we have cached parts for this specific year, merge them to the top
                const model = vehicleDataCache.models.find(m => m.model_id == selectedModel)
                const yearParts = model?.parts?.[selectedYear] || []
                
                if (yearParts.length > 0) {
                    const cachedIds = new Set(yearParts.map(p => String(p.part_id)))
                    const cachedFormatted = yearParts.map(p => ({ partID: p.part_id, partName: p.part_name }))
                    const remainingParts = allParts.filter(p => !cachedIds.has(String(p.partID)))
                    allParts = [...cachedFormatted, ...remainingParts]
                }
                
                setParts(allParts)
            } catch (err) {
                console.warn('[LeadForm] Parts fetch failed')
                // Fallback to cache if API fails
                const model = vehicleDataCache.models.find(m => m.model_id == selectedModel)
                const yearParts = model?.parts?.[selectedYear] || []
                setParts(yearParts.map(p => ({ partID: p.part_id, partName: p.part_name })))
            } finally {
                setLoadingParts(false)
            }
        }
        fetchParts()
        // Reset part selection when year changes
        setSelectedPart('')
        setSelectedPartName('')
    }, [selectedYear, selectedModel, vehicleDataCache])





    // Reset question engine when part/year selection changes
    useEffect(() => {
        if (leadType === 'vendor') return
        if (!vehicleDataCache || !selectedModel || !selectedYear || !selectedPart) {
            setHollanderNumber('')
            setOptions('')
            setPartVariants([])
            setQuestionAnswers([])
            setCurrentQuestion(null)
            setCandidatesCount(0)
            setTotalVariants(0)
            setHollanderResolved(false)
            setHollanderCandidates([])
            return
        }
        // Get variants from cache to check if we need Step 2
        const model = vehicleDataCache.models.find(m => m.model_id == selectedModel)
        const yearParts = model?.parts?.[selectedYear] || []
        const partObj = yearParts.find(p => String(p.part_id) === String(selectedPart))

        setQuestionAnswers([])
        setCurrentQuestion(null)
        setHollanderResolved(false)
        setHollanderCandidates([])

        if (!partObj) return
        const variants = partObj.variants || []
        setPartVariants(variants)
        setTotalVariants(variants.length)

        if (variants.length === 0) {
            // No PartPricing data — try legacy lookup
            const realPartId = parseInt(String(selectedPart).split('_')[0])
            const cleanName = (selectedPartName || '').split(' (')[0].trim()
            setHollanderNumber('Loading...')
            const doLookup = async () => {
                try {
                    const res = await api.lookupHollander({
                        make_id: parseInt(selectedMake), model_id: parseInt(selectedModel),
                        part_id: realPartId, year: parseInt(selectedYear),
                        make_name: selectedMakeName, part_name: cleanName
                    })
                    setHollanderNumber(res.hollander_number || 'Not Found')
                    setOptions(res.options || '')
                    setHollanderResolved(!!res.hollander_number)
                } catch { setHollanderNumber('Not Found'); setOptions('') }
            }
            doLookup()
        } else if (variants.length === 1) {
            // Single variant — immediately resolved, no Step 2 needed
            setHollanderNumber(variants[0].hollander_number || '')
            setOptions(variants[0].options || '')
            setHollanderResolved(true)
            setCandidatesCount(1)
        } else {
            // Multiple variants — set initial best-guess and kick off question engine
            setHollanderNumber(variants[0].hollander_number || '')
            setOptions(variants[0].options || '')
            setCandidatesCount(variants.length)
            // Trigger initial question fetch
            fetchNextQuestion([])
        }
    }, [selectedPart, vehicleDataCache, selectedModel, selectedYear, leadType])

    // Fetch next question from backend based on current answers
    const fetchNextQuestion = async (answers) => {
        if (!selectedMakeName || !selectedModelName || !selectedPartName || !selectedYear) return
        setLoadingQuestion(true)
        try {
            const cleanPartName = selectedPartName.split(' (')[0].trim()
            const result = await api.resolveHollanderQuestions({
                make: selectedMakeName,
                model: selectedModelName,
                part_name: cleanPartName,
                year: parseInt(selectedYear),
                answers,
            })
            setCandidatesCount(result.candidates_count || 0)
            setTotalVariants(result.total_candidates || totalVariants)
            setHollanderCandidates(result.all_candidates || [])

            if (result.resolved) {
                // Exact resolution
                setHollanderNumber(result.resolved)
                setOptions(result.current_best_options || '')
                setCurrentQuestion(null)
                setHollanderResolved(true)
            } else {
                // Use best-guess
                if (result.current_best_hn) setHollanderNumber(result.current_best_hn)
                if (result.current_best_options) setOptions(result.current_best_options)
                setCurrentQuestion(result.next_question || null)
                setHollanderResolved(false)
            }
        } catch (e) {
            console.warn('[LeadForm] Question fetch error:', e)
        } finally {
            setLoadingQuestion(false)
        }
    }

    // Handle customer answering a disambiguation question
    const answerQuestion = (slot, value) => {
        const newAnswers = [...questionAnswers, { slot, value }]
        setQuestionAnswers(newAnswers)
        fetchNextQuestion(newAnswers)
    }

    // Check if Step 2 disambiguation is needed
    const hasQuestions = totalVariants > 1 && (currentQuestion !== null || !hollanderResolved)


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

        // Determine endpoint and payload based on lead type
        let payload;

        // Force resolve names directly from arrays at submit time to prevent state race conditions
        const finalMake = makes.find(m => String(m.makeID) === String(selectedMake))?.makeName || selectedMakeName || 'Unknown';
        const finalModel = models.find(m => String(m.modelID) === String(selectedModel))?.modelName || selectedModelName || selectedModel;
        
        let finalPart = selectedPartName || selectedPart || '';
        if (leadType !== 'vendor' && vehicleDataCache) {
            const m = vehicleDataCache.models?.find(x => x.model_id == selectedModel);
            const p = m?.parts?.[selectedYear]?.find(x => String(x.part_id) === String(selectedPart));
            if (p) finalPart = p.part_name;
        }

        payload = {
            make: finalMake,
            model: finalModel,
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
                payload.part = finalPart.split(' (')[0].trim();
                payload.lead_type = leadType;
                payload.options = options || '';
                payload.hollander_number = (hollanderNumber && hollanderNumber !== 'Not Found' && hollanderNumber !== 'Loading...')
                    ? hollanderNumber
                    : '';
                // Include all candidate HNs if unresolved (admin will confirm)
                payload.hollander_candidates = hollanderResolved ? [] : hollanderCandidates;
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
        if (currentStep === 1) {
            if (leadType === 'quality_auto_parts') {
                if (!selectedMake || !selectedModel || !selectedPart || !selectedYear) {
                    setSubmitError('Please select all vehicle details.')
                    return
                }
                setSubmitError(null)
                // Go to Step 2 if there are disambiguation questions, skip to 3 if already resolved
                if (hasQuestions) {
                    setCurrentStep(2)
                } else {
                    setCurrentStep(3)
                }
            } else {
                if (!selectedMake || !selectedModel || !selectedYear) {
                    setSubmitError('Please select vehicle details.')
                    return
                }
                setSubmitError(null)
                setCurrentStep(3)
            }
        } else if (currentStep === 2) {
            setCurrentStep(3)
        }
    }

    const handleBack = () => {
        setSubmitError(null)
        if (currentStep === 3) {
            if (leadType === 'quality_auto_parts' && hasQuestions) {
                setCurrentStep(2)
            } else {
                setCurrentStep(1)
            }
        } else if (currentStep === 2) {
            setCurrentStep(1)
        }
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
    const showContactInfo = !enableSteps || currentStep === 3;
    const totalSteps = (leadType === 'quality_auto_parts' && hasQuestions) ? 3 : 2;
    const displayStep = currentStep > totalSteps ? totalSteps : currentStep; // fallback if step is 3 but total is 2 (handled by logic anyway)

    return (
        <div className="w-full font-sans">

            {/* Section Label (Optional) */}
            {!hideHeader && (
                <div className="mb-4">
                    <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">
                        {leadType === 'quality_auto_parts' ? 'Find a Used Part' : 'Contact This Yard'}
                    </p>
                    {enableSteps && (
                        <p className="text-[11px] text-slate-400 mt-0.5">Step {displayStep} of {totalSteps}</p>
                    )}
                </div>
            )}

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

                {/* Step Labels (Only if header is not hidden, to keep it super clean) */}
                {!hideHeader && enableSteps && currentStep === 1 && (
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Step 1: Vehicle Details</p>
                )}
                {!hideHeader && enableSteps && currentStep === 2 && (
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Step 2: Narrow Down Part</p>
                )}
                {!hideHeader && enableSteps && currentStep === 3 && (
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Step 3: Contact Info</p>
                )}

                {/* ── VEHICLE FIELDS ── */}
                {showVehicleDetails && (
                    <div className={`space-y-3 ${isHorizontal ? 'border-r border-slate-100 pr-4' : ''}`}>
                        {isHorizontal && <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Vehicle Details</h3>}

                        {/* Make */}
                        <div className="space-y-1">
                            <label className="flex justify-between text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">
                                Vehicle Make {loadingMakes && <span className="text-blue-500 normal-case tracking-normal font-semibold animate-pulse">loading...</span>}
                            </label>
                            <SearchableDropdown
                                label="make"
                                placeholder="Search make..."
                                value={selectedMakeName}
                                selectedValue={selectedMake}
                                loading={loadingMakes}
                                options={makes.map(m => ({ value: m.makeID, label: m.makeName }))}
                                onSelect={(val, lbl) => {
                                    if (String(val) !== selectedMake) {
                                        setSelectedMake(String(val));
                                        setSelectedMakeName(lbl);
                                        setSelectedModel(''); setSelectedModelName('');
                                        setSelectedYear(''); setSelectedPart(''); setSelectedPartName('');
                                        setPartVariants([]); setHollanderNumber(''); setOptions('');
                                    }
                                }}
                            />
                        </div>

                        {/* Model */}
                        <div className="space-y-1">
                            <label className="flex justify-between text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">
                                Vehicle Model {loadingVehicleData && <span className="text-blue-500 normal-case tracking-normal font-semibold animate-pulse">loading...</span>}
                            </label>
                            <SearchableDropdown
                                label="model"
                                placeholder={!selectedMake ? 'Select make first' : 'Search model...'}
                                value={selectedModelName}
                                selectedValue={selectedModel}
                                disabled={!selectedMake}
                                loading={loadingVehicleData}
                                options={models.map(m => ({ value: m.modelID, label: m.modelName }))}
                                onSelect={(val, lbl) => {
                                    if (String(val) !== selectedModel) {
                                        setSelectedModel(String(val));
                                        setSelectedModelName(lbl);
                                        setSelectedYear(''); setSelectedPart(''); setSelectedPartName('');
                                        setPartVariants([]); setHollanderNumber(''); setOptions('');
                                    }
                                }}
                            />
                        </div>

                        {/* Year */}
                        <div className="space-y-1">
                            <label className="flex justify-between text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">
                                Vehicle Year
                            </label>
                            <SearchableDropdown
                                label="year"
                                placeholder={!selectedModel ? 'Select model first' : 'Search year...'}
                                value={selectedYear}
                                selectedValue={selectedYear}
                                disabled={!selectedModel}
                                options={years.map(y => ({ value: y, label: y }))}
                                onSelect={(val) => {
                                    if (String(val) !== selectedYear) {
                                        setSelectedYear(String(val));
                                        setSelectedPart(''); setSelectedPartName('');
                                        setPartVariants([]); setHollanderNumber(''); setOptions('');
                                    }
                                }}
                            />
                        </div>

                        {/* Part (Quality Auto Parts only) */}
                        {leadType === 'quality_auto_parts' && (
                            <div className="space-y-1">
                                <label className="flex justify-between text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">
                                    Requested Part {loadingParts && <span className="text-blue-500 normal-case tracking-normal font-semibold animate-pulse">loading...</span>}
                                </label>
                                <SearchableDropdown
                                    label="part"
                                    placeholder={loadingParts ? 'Loading parts...' : !selectedYear ? 'Select year first' : 'Search part...'}
                                    value={selectedPartName}
                                    selectedValue={selectedPart}
                                    disabled={!selectedYear || loadingParts}
                                    loading={loadingParts}
                                    options={parts.map(p => ({ value: p.partID, label: p.partName }))}
                                    onSelect={(val, lbl) => {
                                        setSelectedPart(String(val));
                                        setSelectedPartName(lbl);
                                        setPartVariants([]);
                                        setHollanderNumber('');
                                        setOptions('');
                                    }}
                                />
                            </div>
                        )}
                                {/* Options tags for single variant — clean (strip wrapping parens from DB values) */}
                                {options && partVariants.length <= 1 && (
                                    <div className="space-y-1">
                                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Part Options / Specs</label>
                                        <div className="flex flex-wrap gap-1.5">
                                            {options.split(',').filter(Boolean).map((opt, i) => (
                                                <span key={i} className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                                                    {opt.replace(/^\(|\)$/g, '').trim()}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                        {enableSteps && (
                            <button type="button" onClick={handleNext}
                                className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-black text-[15px] py-4 rounded-2xl shadow-[0_8px_25px_rgba(37,99,235,0.25)] hover:shadow-[0_12px_35px_rgba(37,99,235,0.4)] hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 group mt-6 border border-blue-400/20">
                                Continue
                                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                            </button>
                        )}
                    </div>
                )}

                {/* ── STEP 2: NARROW DOWN PART (OPTIONS) ── */}
                {enableSteps && currentStep === 2 && hasQuestions && (
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                            <button type="button" onClick={handleBack} className="w-7 h-7 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full text-[13px] font-black flex items-center justify-center transition">
                                ←
                            </button>
                            <span className="text-[12px] font-bold text-slate-500 uppercase tracking-wide">Narrow Down Your Part</span>
                        </div>
                        
                        {loadingQuestion ? (
                            <div className="py-8 flex flex-col items-center justify-center space-y-3">
                                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                <span className="text-[12px] font-bold text-slate-400 uppercase tracking-widest">Analyzing Options...</span>
                            </div>
                        ) : currentQuestion ? (
                            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-4">
                                <h4 className="text-[14px] font-bold text-slate-800 leading-snug">
                                    {currentQuestion.question || `Select ${currentQuestion.feature}`}
                                </h4>
                                
                                {currentQuestion.type === 'yesno' ? (
                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            type="button"
                                            onClick={() => answerQuestion(currentQuestion.slot, currentQuestion.yes_value)}
                                            className="px-4 py-3 bg-white border-2 border-emerald-100 hover:border-emerald-500 hover:bg-emerald-50 text-emerald-700 rounded-xl text-[13px] font-bold transition-all flex flex-col items-center gap-1 shadow-sm"
                                        >
                                            <span className="text-[18px]">✅</span>
                                            Yes
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => answerQuestion(currentQuestion.slot, currentQuestion.no_value)}
                                            className="px-4 py-3 bg-white border-2 border-rose-100 hover:border-rose-500 hover:bg-rose-50 text-rose-700 rounded-xl text-[13px] font-bold transition-all flex flex-col items-center gap-1 shadow-sm"
                                        >
                                            <span className="text-[18px]">❌</span>
                                            No
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-2">
                                        {currentQuestion.values.map(val => (
                                            <button
                                                type="button"
                                                key={val}
                                                onClick={() => answerQuestion(currentQuestion.slot, val)}
                                                className="px-4 py-2.5 bg-white border border-slate-200 hover:border-blue-400 hover:text-blue-600 text-slate-700 rounded-xl text-[13px] font-bold transition-all text-left shadow-sm flex items-center justify-between group"
                                            >
                                                {val}
                                                <svg className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start gap-3">
                                <div className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shrink-0">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                </div>
                                <div>
                                    <h4 className="text-[14px] font-bold text-emerald-800">Part Confirmed</h4>
                                    <p className="text-[12px] text-emerald-600 mt-0.5">We have enough information to identify your exact part.</p>
                                </div>
                            </div>
                        )}

                        <div className="flex items-center justify-between px-1">
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                                Matching Parts: <span className="text-blue-600">{candidatesCount}</span> / {totalVariants}
                            </span>
                        </div>



                        <button type="button" onClick={handleNext} disabled={loadingQuestion || (!hollanderResolved && currentQuestion)}
                            className={`w-full text-[13px] font-bold rounded-xl px-7 py-3.5 flex items-center justify-center gap-2 group mt-2 transition-all ${
                                loadingQuestion || (!hollanderResolved && currentQuestion)
                                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                    : 'bg-blue-600 text-white hover:bg-blue-700 shadow-[0_8px_20px_rgb(37,99,235,0.25)]'
                            }`}>
                            {hollanderResolved ? 'Continue to Contact Info' : 'I am not sure, skip'}
                            {!loadingQuestion && (hollanderResolved || !currentQuestion) && <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>}
                        </button>
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
                        <div className="space-y-1.5">
                            <label className="text-[13px] font-semibold text-slate-700">Full Name <span className="text-blue-500">*</span></label>
                            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Your Name"
                                className="w-full bg-white text-slate-900 text-[14px] rounded-xl px-4 py-3 border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-sm placeholder-slate-400"
                                required />
                        </div>

                        {/* Email */}
                        <div className="space-y-1.5">
                            <label className="text-[13px] font-semibold text-slate-700">Email Address <span className="text-blue-500">*</span></label>
                            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com"
                                className="w-full bg-white text-slate-900 text-[14px] rounded-xl px-4 py-3 border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-sm placeholder-slate-400"
                                required />
                        </div>

                        {/* Phone */}
                        <div className="space-y-1.5">
                            <label className="text-[13px] font-semibold text-slate-700">Phone Number <span className="text-blue-500">*</span></label>
                            <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="(555) 555-5555"
                                className="w-full bg-white text-slate-900 text-[14px] rounded-xl px-4 py-3 border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-sm placeholder-slate-400"
                                required />
                        </div>

                        {/* State + ZIP — improved layout */}
                        <div className="space-y-2">
                            {/* State */}
                            <div className="space-y-1.5">
                                <label className="flex items-center justify-between text-[13px] font-semibold text-slate-700">
                                    <span>State <span className="text-blue-500">*</span></span>
                                    {loadingZipcodes && <span className="font-normal text-blue-500 animate-pulse text-[11px]">Loading ZIPs...</span>}
                                </label>
                                <select
                                    value={state}
                                    onChange={e => handleStateChange(e.target.value)}
                                    className="w-full bg-white text-slate-900 text-[14px] rounded-xl px-4 py-3 border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-sm"
                                    required
                                >
                                    <option value="">Select State</option>
                                    {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>

                            {/* ZIP Code */}
                            <div className="space-y-1.5">
                                <label className="flex items-center justify-between text-[13px] font-semibold text-slate-700">
                                    <span>ZIP Code <span className="text-blue-500">*</span></span>
                                    {state && zipcodes.length > 0 && !zipcodeCity && <span className="font-normal text-emerald-500 text-[11px]">Suggestions enabled</span>}
                                    {loadingZipcode && <span className="font-normal text-blue-500 animate-pulse text-[11px]">Looking up...</span>}
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
                                        disabled={!state}
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
                                        placeholder={!state ? "Select state first" : "e.g. 90210"}
                                        className="w-full bg-white text-slate-900 text-[14px] rounded-xl px-4 py-3 border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-sm placeholder-slate-400 disabled:bg-slate-50 disabled:text-slate-400"
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
                                                <div className="px-3 py-2.5 text-[11px] text-slate-400 italic text-center">No matches</div>
                                            )}
                                        </div>
                                    )}
                                </div>
                                {/* Auto-detected city/state feedback */}
                                {zipcodeCity && (
                                    <p className="text-[10px] text-emerald-600 font-bold mt-1 flex items-center gap-1">
                                        <span>✓</span> {zipcodeCity}, {state}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* CAPTCHA */}
                        <div className="flex flex-col gap-3 p-3 bg-slate-50 border border-slate-100 rounded-xl mt-2">
                            <div className="flex justify-center w-full">
                                <Captcha 
                                    code={securityCode} 
                                    onRefresh={() => { generateSecurityCode(); setUserSecurityCode('') }} 
                                />
                            </div>
                            <input type="text" value={userSecurityCode} onChange={e => setUserSecurityCode(e.target.value.toUpperCase().slice(0, 4))}
                                placeholder="Enter code"
                                className="w-full bg-white text-slate-900 text-[14px] rounded-xl px-4 py-3 border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-sm placeholder-slate-400 uppercase text-center font-bold tracking-widest"
                                maxLength={4} required autoComplete="off" />
                        </div>

                        {/* Error */}
                        {submitError && (
                            <div className="text-[12px] text-red-600 font-bold bg-red-50 border border-red-100 rounded-xl px-3 py-2 text-center">
                                {submitError}
                            </div>
                        )}

                        {/* Submit */}
                        <button type="submit" disabled={submitting}
                            className="w-full bg-[#0099cc] hover:bg-[#0086b3] disabled:opacity-50 text-white font-bold text-[15px] rounded-xl py-3.5 shadow-md hover:shadow-lg transition-all active:scale-[0.98] mt-2">
                            {submitting ? 'Sending...' : (leadType === 'vendor' ? 'Request Quote →' : 'Submit Request')}
                        </button>
                    </div>
                )}
            </form>
        </div>
    )
}
