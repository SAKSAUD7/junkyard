import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useData } from '../hooks/useData'

export default function LeadForm({ layout = 'vertical' }) {
    const navigate = useNavigate()
    const { data: makes } = useData('data_makes.json')
    const { data: parts } = useData('data_parts.json')

    const [selectedMake, setSelectedMake] = useState('')
    const [selectedModel, setSelectedModel] = useState('')
    const [selectedPart, setSelectedPart] = useState('')
    const [selectedYear, setSelectedYear] = useState('')

    // Contact Info
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [phone, setPhone] = useState('')
    const [location, setLocation] = useState('')

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
    }, [])

    // Dependent query: fetch models when make changes
    const { data: filteredModelsData } = useData('data_models.json', { makeID: selectedMake ? parseInt(selectedMake) : null })
    const filteredModels = filteredModelsData || []

    // Dynamic Year Range (1990 - 2026)
    const getFilteredYears = () => {
        const currentYear = new Date().getFullYear() + 1
        return Array.from({ length: 37 }, (_, i) => currentYear - i)
    }
    const filteredYears = getFilteredYears()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSubmitError(null)

        if (!selectedMake || !selectedModel || !selectedPart || !selectedYear) {
            setSubmitError('Please select all vehicle details.')
            return
        }
        if (!name || !email || !phone || !location) {
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
            location
        }

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/leads/`, {
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
        setLocation('')
        setUserSecurityCode('')
        generateSecurityCode()
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
                <button onClick={handleReset} className="text-orange-500 font-bold hover:text-orange-400 transition-colors uppercase tracking-wide text-sm border-b border-transparent hover:border-orange-500">
                    Submit Another Request
                </button>
            </div>
        )
    }

    const isHorizontal = layout === 'horizontal'

    return (
        <div className={`w-full ${isHorizontal ? 'max-w-4xl' : 'max-w-sm'} mx-auto font-sans transition-all duration-300`}>
            {/* Header */}
            <div className={`bg-gradient-to-r from-orange-400 to-orange-500 rounded-t-xl p-3 text-center shadow-lg ${isHorizontal ? 'py-3' : ''}`}>
                <h2 className={`${isHorizontal ? 'text-lg' : 'text-lg'} font-black text-white uppercase tracking-wide leading-tight`}>
                    NEED A QUALITY USED PART?
                </h2>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSubmit} className={`bg-dark-900/95 backdrop-blur-md p-5 rounded-b-xl border border-white/10 shadow-2xl ${isHorizontal ? 'grid grid-cols-1 lg:grid-cols-2 gap-5 p-6' : 'space-y-3'}`}>

                {/* Left Column (Vehicle Info) */}
                <div className={`space-y-2 ${isHorizontal ? 'border-r border-white/10 pr-6' : ''}`}>
                    {isHorizontal && <h3 className="text-orange-500 font-bold uppercase tracking-wider mb-2 text-xs border-b border-white/10 pb-1">Vehicle Details</h3>}

                    {/* 1. Make */}
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-white uppercase flex justify-between">
                            1. Make <span className="text-orange-500">*</span>
                        </label>
                        <select
                            value={selectedMake}
                            onChange={(e) => { setSelectedMake(e.target.value); setSelectedModel(''); }}
                            className="w-full bg-white text-dark-900 text-sm font-semibold rounded-md px-3 py-2 border border-gray-300 focus:border-orange-500 outline-none"
                            required
                        >
                            <option value="">Select Make</option>
                            {makes?.map(m => <option key={m.makeID} value={m.makeID}>{m.makeName}</option>)}
                        </select>
                    </div>

                    {/* 2. Model */}
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-white uppercase flex justify-between">
                            2. Model <span className="text-orange-500">*</span>
                        </label>
                        <select
                            value={selectedModel}
                            onChange={(e) => setSelectedModel(e.target.value)}
                            className="w-full bg-white text-dark-900 text-sm font-semibold rounded-md px-3 py-2 border border-gray-300 focus:border-orange-500 outline-none disabled:bg-gray-200"
                            disabled={!selectedMake}
                            required
                        >
                            <option value="">Select Model</option>
                            {filteredModels.map(m => <option key={m.modelID} value={m.modelName}>{m.modelName}</option>)}
                        </select>
                    </div>

                    {/* 3. Year */}
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-white uppercase flex justify-between">
                            3. Year <span className="text-orange-500">*</span>
                        </label>
                        <select
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(e.target.value)}
                            className="w-full bg-white text-dark-900 text-sm font-semibold rounded-md px-3 py-2 border border-gray-300 focus:border-orange-500 outline-none disabled:bg-gray-200"
                            disabled={!selectedModel}
                            required
                        >
                            <option value="">Select Year</option>
                            {filteredYears.map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                    </div>

                    {/* 4. Part */}
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-white uppercase flex justify-between">
                            4. Part <span className="text-orange-500">*</span>
                        </label>
                        <select
                            value={selectedPart}
                            onChange={(e) => setSelectedPart(e.target.value)}
                            className="w-full bg-white text-dark-900 text-sm font-semibold rounded-md px-3 py-2 border border-gray-300 focus:border-orange-500 outline-none disabled:bg-gray-200"
                            disabled={!selectedMake}
                            required
                        >
                            <option value="">Select OEM Part</option>
                            {parts?.map(p => <option key={p.partID} value={p.partID}>{p.partName}</option>)}
                        </select>
                    </div>
                </div>

                {/* Right Column (Contact Info) */}
                <div className={`space-y-2 ${isHorizontal ? '' : ''}`}>
                    {isHorizontal && <h3 className="text-orange-500 font-bold uppercase tracking-wider mb-2 text-xs border-b border-white/10 pb-1">Contact Information</h3>}

                    {/* Contact Grid */}
                    <div className={`grid grid-cols-2 gap-3 ${!isHorizontal ? 'pt-2 border-t border-white/10' : ''}`}>
                        <div className="col-span-2 space-y-1">
                            <label className="text-[10px] font-bold text-white/70 uppercase">Name <span className="text-orange-500">*</span></label>
                            <input
                                type="text"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                placeholder="Your Name"
                                className="w-full bg-white/10 text-white text-sm px-3 py-2 rounded-md border border-white/20 focus:border-orange-500 outline-none placeholder-white/30"
                                required
                            />
                        </div>

                        <div className="col-span-2 space-y-1">
                            <label className="text-[10px] font-bold text-white/70 uppercase">Email <span className="text-orange-500">*</span></label>
                            <input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="Your Email Address"
                                className="w-full bg-white/10 text-white text-sm px-3 py-2 rounded-md border border-white/20 focus:border-orange-500 outline-none placeholder-white/30"
                                required
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-white/70 uppercase">Phone <span className="text-orange-500">*</span></label>
                            <input
                                type="tel"
                                value={phone}
                                onChange={e => setPhone(e.target.value)}
                                placeholder="(555) 555-5555"
                                className="w-full bg-white/10 text-white text-sm px-3 py-2 rounded-md border border-white/20 focus:border-orange-500 outline-none placeholder-white/30"
                                required
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-white/70 uppercase">Zip / Location <span className="text-orange-500">*</span></label>
                            <input
                                type="text"
                                value={location}
                                onChange={e => setLocation(e.target.value)}
                                placeholder="Zip Code"
                                className="w-full bg-white/10 text-white text-sm px-3 py-2 rounded-md border border-white/20 focus:border-orange-500 outline-none placeholder-white/30"
                                required
                            />
                        </div>
                    </div>

                    {/* Security Code */}
                    <div className="bg-white/5 p-3 rounded-lg border border-white/10 flex items-center justify-between gap-3 mt-4">
                        <div className="bg-white/90 text-dark-900 font-mono font-black text-lg px-3 py-1 rounded tracking-widest select-none bg-opacity-80 decoration-slice shadow-inner w-24 text-center">
                            {securityCode}
                        </div>
                        <input
                            type="text"
                            value={userSecurityCode}
                            onChange={e => setUserSecurityCode(e.target.value)}
                            placeholder="ENTER CODE"
                            className="flex-1 bg-white/10 text-white text-sm px-3 py-2 rounded-md border border-white/20 focus:border-orange-500 outline-none placeholder-white/30 text-center uppercase font-bold"
                            maxLength={4}
                            required
                        />
                    </div>

                    {/* Submit Button */}
                    <div className="space-y-2 pt-2">
                        {submitError && (
                            <div className="text-red-400 text-xs text-center font-bold bg-red-900/20 p-2 rounded">
                                {submitError}
                            </div>
                        )}
                        <button
                            type="submit"
                            disabled={submitting}
                            className={`w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white font-black text-sm uppercase rounded-lg shadow-lg hover:shadow-orange-500/20 transition-all transform active:scale-95 disabled:opacity-50 disabled:transform-none ${isHorizontal ? 'py-4 text-base' : 'py-3'}`}
                        >
                            {submitting ? 'SENDING...' : 'FIND MY PART NOW'}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    )
}
