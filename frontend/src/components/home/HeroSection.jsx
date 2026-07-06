import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../services/api';
import Captcha from '../Captcha';
import PincodeSearch from '../PincodeSearch';
import PromoBanner from '../PromoBanner';

export default function HeroSection({ get, ready = false }) {
    const leadFormRef = useRef(null);

    // ── Hero 2-Step Inline Lead Form State ─────────────────────────────────
    const [makes, setMakes] = useState([]);
    const [models, setModels] = useState([]);
    const [years, setYears] = useState([]);
    const [parts, setParts] = useState([]);
    const [vehicleCache, setVehicleCache] = useState(null);
    const [heroMake, setHeroMake] = useState('');
    const [heroMakeName, setHeroMakeName] = useState('');
    const [heroModel, setHeroModel] = useState('');
    const [heroModelName, setHeroModelName] = useState('');
    const [heroYear, setHeroYear] = useState('');
    const [heroPartId, setHeroPartId] = useState('');
    const [heroPartName, setHeroPartName] = useState('');
    const [partVariants, setPartVariants] = useState([]);
    const [selectedOptionTags, setSelectedOptionTags] = useState([]);
    const [hollanderNumber, setHollanderNumber] = useState('');
    const [options, setOptions] = useState('');
    const [allUniqueOptions, setAllUniqueOptions] = useState([]);

    const [loadingMakes, setLoadingMakes] = useState(false);
    const [loadingVehicle, setLoadingVehicle] = useState(false);
    const [loadingParts, setLoadingParts] = useState(false);
    
    // Contact info (step 2)
    const [heroName, setHeroName] = useState('');
    const [heroEmail, setHeroEmail] = useState('');
    const [heroPhone, setHeroPhone] = useState('');
    const [heroState, setHeroState] = useState('');
    const [heroZip, setHeroZip] = useState('');
    
    // Flow control
    const [heroStep, setHeroStep] = useState(1);   // 1 or 2
    const [heroError, setHeroError] = useState('');
    const [heroSubmitting, setHeroSubmitting] = useState(false);
    const [heroSuccess, setHeroSuccess] = useState(false);
    
    // CAPTCHA
    const generateCaptcha = () => {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
        const nums = '23456789';
        const code = [
            nums[Math.floor(Math.random() * nums.length)],
            chars[Math.floor(Math.random() * chars.length)],
            (chars + nums)[Math.floor(Math.random() * (chars.length + nums.length))],
            (chars + nums)[Math.floor(Math.random() * (chars.length + nums.length))]
        ];
        return code.sort(() => Math.random() - 0.5).join('');
    };
    const [captchaCode, setCaptchaCode] = useState(generateCaptcha());
    const [captchaInput, setCaptchaInput] = useState('');

    const formatPhone = (val) => {
        const raw = val.replace(/\D/g, '').substring(0, 10);
        if (raw.length === 0) return '';
        if (raw.length <= 3) return raw;
        if (raw.length <= 6) return `(${raw.slice(0, 3)}) ${raw.slice(3)}`;
        return `(${raw.slice(0, 3)}) ${raw.slice(3, 6)}-${raw.slice(6)}`;
    };

    const US_STATES = ['AK', 'AL', 'AR', 'AS', 'AZ', 'CA', 'CO', 'CT', 'DC', 'DE', 'FL', 'GA', 'GU', 'HI', 'IA', 'ID', 'IL', 'IN', 'KS', 'KY', 'LA', 'MA', 'MD', 'ME', 'MI', 'MN', 'MO', 'MP', 'MS', 'MT', 'NC', 'ND', 'NE', 'NH', 'NJ', 'NM', 'NV', 'NY', 'OH', 'OK', 'OR', 'PA', 'PR', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VA', 'VI', 'VT', 'WA', 'WI', 'WV', 'WY'];

    // Zip Code Dropdown State
    const [zipcodes, setZipcodes] = useState([]);
    const [showZipSuggestions, setShowZipSuggestions] = useState(false);
    const [loadingZipcodes, setLoadingZipcodes] = useState(false);

    /* Load zipcodes when state changes */
    useEffect(() => {
        const fetchZipcodes = async () => {
            if (!heroState) {
                setZipcodes([]); setShowZipSuggestions(false); return;
            }
            setLoadingZipcodes(true);
            try {
                const data = await api.getZipcodesByState(heroState);
                if (data && data.zipcodes) {
                    setZipcodes(data.zipcodes);
                } else {
                    setZipcodes([]);
                }
            } catch (err) {
                setZipcodes([]);
            } finally {
                setLoadingZipcodes(false);
            }
        };
        fetchZipcodes();
    }, [heroState]);

    useEffect(() => {
        setLoadingMakes(true);
        api.getMakes().then(d => setMakes(d || [])).catch(() => { }).finally(() => setLoadingMakes(false));
    }, []);

    /* Bulk-fetch models+years when make changes */
    useEffect(() => {
        if (!heroMake) { setModels([]); setYears([]); setParts([]); setVehicleCache(null); setHeroModel(''); setHeroYear(''); setHeroPartId(''); return; }
        setLoadingVehicle(true);
        api.getVehicleDataBulk(heroMake)
            .then(d => {
                setVehicleCache(d);
                setModels((d.models || []).map(m => ({ modelID: m.model_id, modelName: m.model_name, years: m.years || [], parts: m.parts || {} })));
            })
            .catch(() => setModels([]))
            .finally(() => setLoadingVehicle(false));
        setHeroModel(''); setHeroYear(''); setHeroPartId('');
    }, [heroMake]);

    /* Filter years from cache when model changes */
    useEffect(() => {
        if (!heroModel) { setYears([]); setParts([]); setHeroYear(''); setHeroPartId(''); return; }
        const mod = models.find(m => String(m.modelID) === String(heroModel));
        setYears(mod ? mod.years : []);
        setHeroYear(''); setHeroPartId('');
    }, [heroModel, models]);

    /* Load parts when year changes */
    useEffect(() => {
        if (!heroYear || !heroModel) { setParts([]); setHeroPartId(''); return; }
        // Try cache first
        const mod = models.find(m => String(m.modelID) === String(heroModel));
        if (mod?.parts?.[heroYear]?.length > 0) {
            setParts(mod.parts[heroYear].map(p => ({ 
                partID: p.part_id,
                partName: p.part_name,
                variants: p.variants || []
            })));
            setHeroPartId('');
            setPartVariants([]);
            setSelectedOptionTags([]);
            setHollanderNumber('');
            setOptions('');
            return;
        }
        // Fallback to API
        setLoadingParts(true);
        api.getParts({ make_id: heroMake, model_id: heroModel, year: heroYear })
            .then(d => setParts((d || []).map(p => ({ partID: p.partID || p.part_id, partName: p.partName || p.part_name, variants: p.variants || [] }))))
            .catch(() => setParts([]))
            .finally(() => setLoadingParts(false));
        setHeroPartId('');
    }, [heroYear, heroModel, models]);

    // Helper to extract unique options for a part
    useEffect(() => {
        if (!partVariants || partVariants.length === 0) {
            setAllUniqueOptions([]);
            return;
        }
        const unique = new Set();
        partVariants.forEach(v => {
            if (v.options) {
                v.options.split(',').forEach(opt => unique.add(opt.trim()));
            }
        });
        setAllUniqueOptions(Array.from(unique).filter(Boolean));
    }, [partVariants]);

    const toggleOptionTag = (tag) => {
        const newTags = selectedOptionTags.includes(tag) ? selectedOptionTags.filter(t => t !== tag) : [...selectedOptionTags, tag];
        setSelectedOptionTags(newTags);
        if (newTags.length === 0 && partVariants.length > 0) {
            setHollanderNumber(partVariants[0].hollander_number || '');
            setOptions(partVariants[0].options || '');
            return;
        }
        let bestMatch = partVariants[0];
        let maxMatches = -1;
        partVariants.forEach(v => {
            if (!v.options) return;
            const variantOpts = v.options.split(',').map(s => s.trim());
            const matches = newTags.filter(t => variantOpts.includes(t)).length;
            if (matches > maxMatches) { maxMatches = matches; bestMatch = v; }
        });
        if (bestMatch) {
            setHollanderNumber(bestMatch.hollander_number || '');
            setOptions(bestMatch.options || '');
        }
    };

    const handleHeroNext = () => {
        if (heroStep === 1) {
            if (!heroMake || !heroModel || !heroYear || !heroPartId) {
                setHeroError('Please select all vehicle details.');
                return;
            }
            setHeroError('');
            if (partVariants.length > 1 && allUniqueOptions.length > 0) {
                setHeroStep(2);
            } else {
                setHeroStep(3);
            }
        } else if (heroStep === 2) {
            setHeroStep(3);
        }
        setCaptchaInput('');
    };

    const handleHeroBack = () => { 
        if (heroStep === 3) {
            if (partVariants.length > 1 && allUniqueOptions.length > 0) {
                setHeroStep(2);
            } else {
                setHeroStep(1);
            }
        } else if (heroStep === 2) {
            setHeroStep(1);
        }
        setHeroError('');
        setCaptchaInput(''); 
    };

    const handleHeroSubmit = async (e) => {
        e.preventDefault();
        if (!heroName || !heroEmail || !heroPhone || !heroState || !heroZip) {
            setHeroError('Please fill in all contact fields.');
            return;
        }
        if (!captchaInput.trim()) {
            setHeroError('Please enter the CAPTCHA value.');
            return;
        }
        if (captchaInput.trim().toUpperCase() !== captchaCode) {
            setHeroError('Please re-enter the CAPTCHA value properly.');
            setCaptchaCode(generateCaptcha());
            setCaptchaInput('');
            return;
        }
        setHeroError('');
        setHeroSubmitting(true);
        try {
            const finalMake = makes.find(m => String(m.makeID) === String(heroMake))?.makeName || heroMakeName || heroMake;
            const finalModel = models.find(m => String(m.modelID) === String(heroModel))?.modelName || heroModelName || heroModel;
            const finalPart = parts.find(p => String(p.partID) === String(heroPartId))?.partName || heroPartName || heroPartId || '';

            await api.createLead({
                make: finalMake,
                model: finalModel,
                year: parseInt(heroYear),
                part: finalPart.split(' (')[0].trim(),
                hollander_number: hollanderNumber && hollanderNumber !== 'Not Found' ? hollanderNumber : null,
                options: options || '',
                name: heroName, email: heroEmail, phone: heroPhone,
                state: heroState, zip: heroZip,
                lead_type: 'quality_auto_parts',
            });
            setHeroSuccess(true);
        } catch { setHeroError('Submission failed. Please try again.'); }
        finally { setHeroSubmitting(false); }
    };

    const handleHeroReset = () => { setHeroSuccess(false); setHeroStep(1); setHeroMake(''); setHeroModel(''); setHeroYear(''); setHeroPartId(''); setHeroName(''); setHeroEmail(''); setHeroPhone(''); setHeroState(''); setHeroZip(''); setHeroError(''); setCaptchaCode(''); setCaptchaInput(''); setPartVariants([]); setSelectedOptionTags([]); setHollanderNumber(''); setOptions(''); };

    const [successCountdown, setSuccessCountdown] = useState(10);
    useEffect(() => {
        if (!heroSuccess) { setSuccessCountdown(10); return; }
        setSuccessCountdown(10);
        const interval = setInterval(() => {
            setSuccessCountdown(prev => {
                if (prev <= 1) { clearInterval(interval); handleHeroReset(); return 0; }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, [heroSuccess]);

    return (
        <section className="relative overflow-hidden border-b border-slate-100 bg-slate-50 pt-4 lg:pt-8 pb-20 min-h-[90vh] flex flex-col justify-start">
            {/* Full-bleed cinematic background video - DESKTOP ONLY */}
            <div className="absolute inset-0 z-0 bg-white hidden lg:block">
                <video
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="w-full h-full object-cover mix-blend-multiply opacity-90"
                    style={{ filter: 'brightness(1.05) contrast(1.1)' }}
                >
                    <source src="/Video/hero-models-bg-v2.mp4" type="video/mp4" />
                </video>
                {/* Light Gradient Overlay */}
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-white via-white/80 to-transparent w-3/4" />
            </div>

            <div className="relative w-full max-w-[1400px] mx-auto z-10 flex flex-col justify-start px-4 sm:px-6 lg:px-8 flex-1 mt-2">
                    <div className="w-full lg:max-w-[70%] text-left mb-2 lg:mb-10 text-center lg:text-left">
                        <div className="inline-flex items-center px-4 py-1.5 rounded-full mb-6 bg-blue-50 text-blue-600 text-[12px] lg:text-[13px] font-bold border border-blue-100/50 backdrop-blur-md">
                            <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                            </svg>
                            The #1 Junkyard & Auto Salvage Network in the U.S.
                        </div>

                        {/* Heading — hidden until CMS ready to prevent FOUC */}
                        {!ready ? (
                            <div className="mb-4 lg:mb-5 space-y-3">
                                <div className="h-12 lg:h-14 bg-slate-200/60 rounded-xl animate-pulse w-full" />
                                <div className="h-12 lg:h-14 bg-slate-200/60 rounded-xl animate-pulse w-5/6" />
                                <div className="h-12 lg:h-14 bg-slate-200/60 rounded-xl animate-pulse w-4/6" />
                            </div>
                        ) : (
                            <h1
                                className="text-[22px] sm:text-3xl md:text-5xl lg:text-[54px] font-black text-[#1e293b] mb-4 lg:mb-5 tracking-tight leading-[1.15] transition-opacity duration-300 opacity-100"
                                style={{ fontFamily: "'Outfit', sans-serif" }}
                                dangerouslySetInnerHTML={{ __html: get('hero', 'heading', '') }}
                            />
                        )}

                        {/* Subheading — hidden until CMS ready */}
                        {!ready ? (
                            <div className="space-y-2 mb-2 lg:mb-8 max-w-[540px] mx-auto lg:mx-0">
                                <div className="h-5 bg-slate-200/60 rounded-lg animate-pulse w-full" />
                                <div className="h-5 bg-slate-200/60 rounded-lg animate-pulse w-4/5" />
                            </div>
                        ) : (
                            <p
                                className="text-[15px] lg:text-[17px] text-slate-600 mb-2 lg:mb-8 max-w-[540px] font-medium leading-relaxed mx-auto lg:mx-0 transition-opacity duration-300 opacity-100"
                                dangerouslySetInnerHTML={{ __html: get('hero', 'subheading', '') }}
                            />
                        )}
                    </div>

                <div className="w-[100vw] -ml-[calc(50vw-50%)] relative z-0 flex lg:hidden items-center justify-center mix-blend-multiply aspect-video mt-0 mb-2">
                    <video
                        autoPlay muted loop playsInline
                        className="w-full h-full object-cover scale-[1.1] origin-[center_70%] opacity-100"
                        style={{ filter: 'brightness(1.05) contrast(1.05)' }}
                    >
                        <source src="/Video/hero-models-bg.mp4" type="video/mp4" />
                    </video>
                </div>

                <div className="w-full xl:max-w-[800px] lg:max-w-[750px] flex flex-col items-start mt-2 space-y-4">
                    <div ref={leadFormRef} className="w-full mb-8 relative z-20">
                        <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.25em] mb-3 relative z-10 pl-2">Fill This Form To Find Your Part</h3>
                        <div className={`bg-white/80 backdrop-blur-2xl shadow-[0_8px_40px_rgba(37,99,235,0.18),0_2px_12px_rgba(0,0,0,0.08)] border border-blue-200/60 relative z-20 overflow-visible
                            before:absolute before:inset-0 before:rounded-[inherit] before:bg-gradient-to-b before:from-white/60 before:to-white/10 before:pointer-events-none
                            ${heroStep > 1 && !heroSuccess ? 'rounded-3xl' : 'rounded-2xl lg:rounded-full'}`}>

                            {/* SUCCESS STATE */}
                            {heroSuccess && (
                                <div className="flex items-center gap-4 px-6 py-4">
                                    <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
                                        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-black text-slate-900 text-[15px]">The lead has been submitted 🎉</p>
                                    </div>
                                    <button onClick={handleHeroReset} className="text-blue-600 text-[13px] font-bold hover:underline whitespace-nowrap flex-shrink-0">New Search</button>
                                </div>
                            )}

                            {/* STEP 1 — Vehicle + Part */}
                            {!heroSuccess && heroStep === 1 && (
                                <div className="flex flex-col lg:flex-row items-stretch lg:items-center p-1.5 lg:p-1.5 gap-3 lg:gap-0 w-full">
                                    <div className="hidden lg:flex items-center gap-2 px-5 border-r border-slate-100 shrink-0">
                                        <span className="w-6 h-6 bg-blue-600 text-white rounded-full text-[11px] font-black flex items-center justify-center">1</span>
                                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Vehicle</span>
                                    </div>
                                    <div className="grid grid-cols-2 lg:flex lg:flex-1 lg:flex-row gap-2 lg:gap-0 min-w-0">
                                        <select value={heroMake} onChange={e => {
                                            const val = e.target.value;
                                            setHeroMake(val);
                                            const found = makes.find(m => String(m.makeID) === String(val));
                                            setHeroMakeName(found ? found.makeName : '');
                                        }}
                                            className="col-span-1 lg:flex-1 lg:min-w-0 bg-slate-50 lg:bg-transparent border border-slate-100 lg:border-y-0 lg:border-l-0 lg:border-r text-[13px] font-semibold text-slate-700 outline-none px-4 py-2.5 lg:py-2 appearance-none cursor-pointer rounded-xl lg:rounded-none truncate">
                                            <option value="">{loadingMakes ? 'Loading...' : '🚗 Make'}</option>
                                            {makes.map(m => <option key={m.makeID} value={m.makeID}>{m.makeName}</option>)}
                                        </select>
                                        <select value={heroModel} onChange={e => {
                                            const val = e.target.value;
                                            setHeroModel(val);
                                            const found = models.find(m => String(m.modelID) === String(val));
                                            setHeroModelName(found ? found.modelName : '');
                                        }} disabled={!heroMake}
                                            className="col-span-1 lg:flex-1 lg:min-w-0 bg-slate-50 lg:bg-transparent border border-slate-100 lg:border-y-0 lg:border-l-0 lg:border-r text-[13px] font-semibold text-slate-700 outline-none px-4 py-2.5 lg:py-2 appearance-none cursor-pointer disabled:opacity-40 rounded-xl lg:rounded-none truncate">
                                            <option value="">{loadingVehicle ? 'Loading...' : 'Model'}</option>
                                            {models.map(m => <option key={m.modelID} value={m.modelID}>{m.modelName}</option>)}
                                        </select>
                                        <select value={heroYear} onChange={e => setHeroYear(e.target.value)} disabled={!heroModel}
                                            className="col-span-1 lg:flex-1 lg:min-w-0 bg-slate-50 lg:bg-transparent border border-slate-100 lg:border-y-0 lg:border-l-0 lg:border-r text-[13px] font-semibold text-slate-700 outline-none px-4 py-2.5 lg:py-2 appearance-none cursor-pointer disabled:opacity-40 rounded-xl lg:rounded-none truncate">
                                            <option value="">Year</option>
                                            {years.map(y => <option key={y} value={y}>{y}</option>)}
                                        </select>
                                        <select value={heroPartId} onChange={e => {
                                            const val = e.target.value;
                                            setHeroPartId(val);
                                            const found = parts.find(p => String(p.partID) === String(val));
                                            setHeroPartName(found ? found.partName : '');
                                            
                                            if (found) {
                                                setPartVariants(found.variants || []);
                                                setSelectedOptionTags([]);
                                                if (found.variants?.length === 1) {
                                                    setHollanderNumber(found.variants[0].hollander_number || '');
                                                    setOptions(found.variants[0].options || '');
                                                } else if (found.variants?.length > 1) {
                                                    setHollanderNumber(found.variants[0].hollander_number || '');
                                                    setOptions(found.variants[0].options || '');
                                                } else {
                                                    setHollanderNumber('');
                                                    setOptions('');
                                                }
                                            }
                                        }} disabled={!heroYear || loadingParts}
                                            className="col-span-1 lg:flex-[1.5] lg:min-w-0 bg-slate-50 lg:bg-transparent border border-slate-100 lg:border-none text-[13px] font-semibold text-slate-700 outline-none px-4 py-2.5 lg:py-2 appearance-none cursor-pointer disabled:opacity-40 rounded-xl lg:rounded-none truncate lg:max-w-[280px]">
                                            <option value="">{loadingParts ? 'Loading...' : '🔩 Part'}</option>
                                            {parts.map(p => <option key={p.partID} value={p.partID}>{p.partName}</option>)}
                                        </select>
                                    </div>
                                    <button type="button" onClick={handleHeroNext}
                                        className="w-full lg:min-w-0 lg:w-auto bg-blue-600 text-white text-[13px] font-bold rounded-xl lg:rounded-full px-7 py-2.5 hover:bg-blue-700 transition shadow-[0_8px_20px_rgb(37,99,235,0.25)] flex items-center justify-center gap-2 group shrink-0 mt-1 lg:mt-0">
                                        Next Step
                                        <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                                    </button>
                                </div>
                            )}
                            
                            {!heroSuccess && heroStep === 1 && heroPartId && partVariants.length === 1 && (
                                <div className="absolute -bottom-8 left-0 w-full flex justify-center animate-fade-in-up">
                                    <span className="bg-emerald-500 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-sm flex items-center gap-1">
                                        ✓ Exact Part Confirmed {options && <span className="opacity-75 font-medium ml-1">| {options.replace(/^\(|\)$/g, '').trim()}</span>}
                                    </span>
                                </div>
                            )}

                            {/* STEP 2 — Options (if variants > 1) */}
                            {!heroSuccess && heroStep === 2 && partVariants.length > 1 && allUniqueOptions.length > 0 && (
                                <div className="flex flex-col p-5 gap-4">
                                    <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                                        <button type="button" onClick={handleHeroBack} className="w-7 h-7 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full text-[13px] font-black flex items-center justify-center transition">
                                            ←
                                        </button>
                                        <span className="text-[12px] font-bold text-slate-500 uppercase tracking-wide">Narrow Down Your Part</span>
                                    </div>
                                    <p className="text-[12px] text-slate-500 font-medium">Select all options that apply to your vehicle to ensure a perfect fit:</p>
                                    <div className="flex flex-wrap gap-2">
                                        {allUniqueOptions.map(opt => (
                                            <button
                                                type="button"
                                                key={opt}
                                                onClick={() => toggleOptionTag(opt)}
                                                className={`px-3 py-1.5 rounded-lg text-[12px] font-bold border transition-all ${
                                                    selectedOptionTags.includes(opt)
                                                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                                                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-blue-400 hover:text-blue-600'
                                                }`}
                                            >
                                                {opt}
                                            </button>
                                        ))}
                                    </div>

                                    <button type="button" onClick={handleHeroNext}
                                        className="w-full bg-blue-600 text-white text-[13px] font-bold rounded-xl px-7 py-3.5 hover:bg-blue-700 transition shadow-[0_8px_20px_rgb(37,99,235,0.25)] flex items-center justify-center gap-2 group mt-2">
                                        Confirm Options
                                        <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                                    </button>
                                </div>
                            )}

                            {/* STEP 3 — Contact Info */}
                            {!heroSuccess && heroStep === 3 && (
                                <form onSubmit={handleHeroSubmit}
                                    className="flex flex-col p-5 gap-4">
                                    <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                                        <button type="button" onClick={handleHeroBack} className="w-7 h-7 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full text-[13px] font-black flex items-center justify-center transition">
                                            ←
                                        </button>
                                        <span className="text-[12px] font-bold text-slate-500 uppercase tracking-wide">Contact Details</span>
                                    </div>
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                                        <input type="text" placeholder="Your Name" value={heroName} onChange={e => setHeroName(e.target.value)} required
                                            className="bg-slate-50 border border-slate-100 rounded-xl text-[13px] font-semibold text-slate-700 outline-none px-4 py-3 placeholder-slate-400 focus:bg-white focus:border-blue-500 transition-colors" />
                                        <input type="email" placeholder="Email Address" value={heroEmail} onChange={e => setHeroEmail(e.target.value)} required
                                            className="bg-slate-50 border border-slate-100 rounded-xl text-[13px] font-semibold text-slate-700 outline-none px-4 py-3 placeholder-slate-400 focus:bg-white focus:border-blue-500 transition-colors" />
                                        <input type="tel" placeholder="Phone Number" value={heroPhone} onChange={e => setHeroPhone(formatPhone(e.target.value))} required
                                            className="bg-slate-50 border border-slate-100 rounded-xl text-[13px] font-semibold text-slate-700 outline-none px-4 py-3 placeholder-slate-400 focus:bg-white focus:border-blue-500 transition-colors" />
                                    </div>
                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                                        <select value={heroState} onChange={e => { setHeroState(e.target.value); setHeroZip(''); }} required
                                            className="bg-slate-50 border border-slate-100 rounded-xl text-[13px] font-semibold text-slate-700 outline-none px-4 py-3 appearance-none cursor-pointer focus:bg-white focus:border-blue-500 transition-colors">
                                            <option value="">State</option>
                                            {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>

                                        <div className="relative">
                                            <input type="text" placeholder="ZIP Code" value={heroZip}
                                                onChange={e => {
                                                    const val = e.target.value.replace(/\D/g, '').slice(0, 5)
                                                    setHeroZip(val)
                                                    if (zipcodes.length > 0) setShowZipSuggestions(true)
                                                }}
                                                onFocus={() => { if (zipcodes.length > 0) setShowZipSuggestions(true) }}
                                                onBlur={() => setTimeout(() => setShowZipSuggestions(false), 200)}
                                                maxLength={5} required
                                                className="w-full bg-slate-50 border border-slate-100 rounded-xl text-[13px] font-semibold text-slate-700 outline-none px-4 py-3 placeholder-slate-400 focus:bg-white focus:border-blue-500 transition-colors" />

                                            {showZipSuggestions && zipcodes.length > 0 && (
                                                <div className="absolute top-14 left-0 z-[100] w-full bg-white border border-slate-200 rounded-xl shadow-xl max-h-48 overflow-y-auto">
                                                    {zipcodes.filter(z => z.postal_code.startsWith(heroZip)).map((z, i) => (
                                                        <div key={`${z.postal_code}-${i}`}
                                                            className="px-4 py-2.5 hover:bg-slate-50 cursor-pointer text-[13px] text-slate-700 border-b last:border-0 border-slate-100 transition-colors"
                                                            onClick={() => {
                                                                setHeroZip(z.postal_code)
                                                                setShowZipSuggestions(false)
                                                            }}>
                                                            <span className="font-bold text-slate-900">{z.postal_code}</span> - <span className="text-slate-500">{z.city_name}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            {loadingZipcodes && <div className="absolute right-4 top-1/2 -translate-y-1/2"><div className="w-3 h-3 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div></div>}
                                        </div>

                                        <div className="col-span-2 flex flex-wrap sm:flex-nowrap items-center gap-3">
                                            <Captcha 
                                                code={captchaCode} 
                                                onRefresh={() => { setCaptchaCode(generateCaptcha()); setCaptchaInput('') }} 
                                            />
                                            <input
                                                type="text"
                                                placeholder="Enter code"
                                                value={captchaInput}
                                                onChange={e => setCaptchaInput(e.target.value.toUpperCase().slice(0, 4))}
                                                maxLength={4}
                                                autoComplete="off"
                                                required
                                                className="flex-1 min-w-[80px] bg-slate-50 border border-slate-200 rounded-xl text-[14px] font-bold text-slate-700 outline-none px-4 py-3.5 placeholder-slate-400 focus:bg-white focus:border-blue-500 transition-colors tracking-widest uppercase text-center"
                                            />
                                            <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${captchaInput.length === 4
                                                    ? captchaInput.toUpperCase() === captchaCode
                                                        ? 'bg-emerald-100 text-emerald-600'
                                                        : 'bg-red-100 text-red-500'
                                                    : 'bg-slate-100 text-slate-300'
                                                }`}>
                                                {captchaInput.length === 4 ? (
                                                    captchaInput.toUpperCase() === captchaCode
                                                        ? <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                                        : <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                                                ) : (
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <button type="submit" disabled={heroSubmitting || !heroZip || heroZip.length < 5}
                                        className="w-full mt-1 py-3 bg-emerald-500 text-white text-[15px] md:text-[16px] font-extrabold rounded-xl hover:bg-emerald-600 transition shadow-[0_8px_20px_rgb(16,185,129,0.25)] flex items-center justify-center disabled:opacity-60 disabled:shadow-none disabled:cursor-not-allowed">
                                        {heroSubmitting ? 'Sending...' : '✓ Find My Part Now'}
                                    </button>
                                </form>
                            )}

                            {heroError && (
                                <div className="px-6 pb-3 text-red-500 text-[12px] font-semibold">{heroError}</div>
                            )}
                        </div>

                        {!heroSuccess && (
                            <div className="flex items-center justify-center gap-2 mt-3 pb-4">
                                <div className={`h-1.5 rounded-full transition-all ${heroStep === 1 ? 'w-8 bg-blue-600' : 'w-4 bg-slate-200'}`} />
                                <div className={`h-1.5 rounded-full transition-all ${heroStep === 2 ? 'w-8 bg-blue-600' : 'w-4 bg-slate-200'}`} />
                                <div className={`h-1.5 rounded-full transition-all ${heroStep === 3 ? 'w-8 bg-emerald-500' : 'w-4 bg-slate-200'}`} />
                            </div>
                        )}
                    </div>

                    <div className="w-full max-w-3xl mt-4 animate-fade-in-up relative" style={{ animationDelay: '0.4s', zIndex: 50 }}>
                        <div className="bg-white/80 backdrop-blur-2xl rounded-[2rem] p-5 shadow-[0_8px_32px_rgba(0,0,0,0.10)] border border-blue-100/60 relative">
                            <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-b from-white/50 to-white/10 pointer-events-none"></div>
                            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.25em] mb-4 relative z-10 pl-2">{get('pincode_search', 'heading', 'Or Search Locally By Zip Code')}</h3>
                            <div className="relative" style={{ zIndex: 9999 }}>
                                <PincodeSearch />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="w-full mt-8 lg:mt-10 mb-8 relative z-30 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
                    <PromoBanner />
                </div>
            </div>
        </section>
    );
}
