import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import SEO from "../components/SEO";
import { api } from "../services/api";
import AcceptJsCheckout from "../components/vendor/AcceptJsCheckout";
import PostSubmissionFeedback from "../components/PostSubmissionFeedback";

const SELL_VEHICLE_FEE = "9.99";

// ── Searchable Dropdown Component (Reused exactly from HeroSection) ──
function SearchableDropdown({ value, label, placeholder, options, onSelect, disabled, loading }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = options
    .filter((o) => (o.label || o).toString().toLowerCase().includes(query.toLowerCase()))
    .slice(0, 1000);

  return (
    <div ref={ref} className="relative w-full">
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          if (!disabled) setOpen((v) => !v);
          setQuery("");
        }}
        className={`w-full flex items-center justify-between gap-1 px-4 py-4 lg:py-4 text-[14px] font-bold transition-all
                    ${disabled ? "text-slate-400 cursor-not-allowed" : "text-slate-800 cursor-pointer hover:text-blue-600"}
                    bg-transparent outline-none border-0 rounded-xl lg:rounded-none border border-slate-100 lg:border-y-0 lg:border-l-0 lg:border-r-2
                `}
      >
        <span className={`truncate ${!value ? "text-slate-400 font-semibold" : "text-slate-900"}`}>
          {loading ? "Loading..." : value || placeholder}
        </span>
        <svg
          className={`w-3.5 h-3.5 shrink-0 transition-transform ${open ? "rotate-180" : ""} text-slate-400`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute top-full left-0 z-[200] mt-2 w-64 bg-white rounded-2xl shadow-[0_16px_50px_rgba(0,0,0,0.18)] border border-slate-100 overflow-hidden">
          <div className="px-3 pt-3 pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2 bg-slate-50 rounded-xl px-3 py-2">
              <svg className="w-4 h-4 text-blue-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                autoFocus
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={`Search ${label}...`}
                className="bg-transparent text-[13px] font-semibold text-slate-800 placeholder-slate-400 outline-none w-full"
              />
            </div>
          </div>
          <div className="max-h-52 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <p className="px-4 py-3 text-[13px] text-slate-400 text-center">No results for "{query}"</p>
            ) : (
              filtered.map((o, i) => {
                const val = o.value !== undefined ? o.value : o;
                const lbl = o.label !== undefined ? o.label : o;
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      onSelect(val, lbl);
                      setOpen(false);
                      setQuery("");
                    }}
                    className={`w-full text-left px-4 py-2.5 text-[13px] font-semibold transition-colors
                                        ${String(val) === String(value?.split(" ")[0]) ? "bg-blue-50 text-blue-600" : "text-slate-700 hover:bg-slate-50 hover:text-blue-600"}`}
                  >
                    {lbl}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Step 1: Vehicle Identifier using exact JYNM Pill Design ──
function StepVehicleID({ data, setData, onNext, onVinDecode, vinLoading, vinError, makes, models, years, loadingMakes, loadingVehicle }) {
  const isVehicleFullySelected = data.year && (data.make || data.makeName) && (data.model || data.modelName);

  return (
    <div className="space-y-12">
      {/* ── VIN Decoder Pill (PRIMARY) ── */}
      <div>
        <div className="flex items-center gap-3 mb-4 pl-1">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-600 text-white text-[11px] font-black uppercase tracking-widest rounded-full shadow-[0_4px_14px_rgba(37,99,235,0.45)]">
            <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
            Step 1
          </span>
          <h3 className="text-[13px] font-black text-slate-700 uppercase tracking-[0.2em] whitespace-nowrap">
            Identify Your Vehicle
          </h3>
        </div>

        <div className="bg-white shadow-[0_20px_50px_rgba(0,0,0,0.15)] ring-[8px] ring-blue-500/15 border-2 border-blue-500 relative z-10 overflow-visible transition-all duration-300 hover:shadow-[0_25px_60px_rgba(37,99,235,0.25)] rounded-2xl lg:rounded-full">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center p-2 lg:p-2 gap-3 lg:gap-0 w-full">
            <div className="hidden lg:flex items-center gap-2.5 px-6 border-r-2 border-slate-100 shrink-0">
              <span className="text-[20px]">🔍</span>
              <span className="text-[12px] font-black text-slate-800 uppercase tracking-[0.15em]">Enter VIN</span>
            </div>

            <div className="flex-1 px-4 py-2 lg:py-0 w-full z-10">
              <input
                type="text"
                className="w-full bg-transparent text-[16px] font-bold text-slate-900 placeholder-slate-400 outline-none uppercase tracking-widest py-2"
                placeholder="ENTER 17-CHARACTER VIN"
                maxLength={17}
                value={data.vin}
                onChange={e => setData(d => ({ ...d, vin: e.target.value.toUpperCase() }))}
              />
            </div>

            <button
              type="button"
              onClick={() => onVinDecode(data.vin)}
              disabled={vinLoading || data.vin.length !== 17}
              className="w-full lg:min-w-0 lg:w-auto bg-gradient-to-r from-blue-600 to-blue-500 disabled:from-slate-400 disabled:to-slate-300 text-white text-[15px] font-black rounded-xl lg:rounded-full px-8 py-3.5 hover:from-blue-700 hover:to-blue-600 hover:-translate-y-0.5 transition-all shadow-[0_8px_25px_rgb(37,99,235,0.4)] disabled:shadow-none flex items-center justify-center gap-2 shrink-0 mt-1 lg:mt-0"
            >
              {vinLoading ? "Decoding..." : "Autofill Details"}
              <svg className="w-5 h-5 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </button>
          </div>
        </div>
        
        {vinError && <p className="text-sm font-bold text-red-500 mt-4 pl-4 animate-fade-in">{vinError}</p>}
        {isVehicleFullySelected && !vinError && data.vin.length === 17 && (
          <div className="mt-6 bg-emerald-50 text-emerald-700 p-4 rounded-2xl border border-emerald-100 font-semibold flex items-center gap-3 animate-fade-in shadow-sm max-w-3xl">
            <span className="text-2xl">✅</span>
            <div>
              <div className="text-[12px] uppercase tracking-widest text-emerald-600 font-black mb-0.5">Vehicle Identified</div>
              <div className="text-lg">{data.year} {data.makeName || data.make} {data.modelName || data.model} {data.trim && ` ${data.trim}`}</div>
              <div className="text-[11px] text-emerald-600 font-bold mt-1 max-w-lg">Valid US market VIN decoded successfully. JYNM database automatically filled required vehicle constraints.</div>
            </div>
          </div>
        )}
      </div>

      <div className="relative py-4 flex items-center max-w-[800px] mx-auto z-10">
        <div className="flex-grow border-t border-slate-200"></div>
        <span className="flex-shrink-0 mx-4 text-slate-400 text-[11px] font-black uppercase tracking-widest bg-slate-50 px-4 py-1.5 rounded-full border border-slate-100">Don't Have Your VIN?</span>
        <div className="flex-grow border-t border-slate-200"></div>
      </div>

      {/* ── Manual Entry Pill (SECONDARY) ── */}
      <div>
        <div className="bg-white shadow-[0_10px_30px_rgba(0,0,0,0.08)] border border-slate-200 relative overflow-visible transition-all duration-300 hover:shadow-[0_15px_40px_rgba(0,0,0,0.12)] rounded-2xl lg:rounded-full">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center p-2 lg:p-2 gap-3 lg:gap-0 w-full">
            <div className="hidden xl:flex items-center gap-2.5 px-6 border-r-2 border-slate-100 shrink-0">
              <span className="text-[12px] font-black text-slate-500 uppercase tracking-[0.1em]">Select Manually</span>
            </div>

            <div className="grid grid-cols-2 lg:flex lg:flex-1 lg:flex-row gap-2 lg:gap-0 min-w-0">
              {/* MAKE */}
              <div className="col-span-1 lg:flex-1 lg:min-w-0 z-40">
                <SearchableDropdown
                  label="Make"
                  placeholder="Select Make"
                  value={data.makeName || data.make}
                  loading={loadingMakes}
                  options={makes.map((m) => ({ value: m.makeID, label: m.makeName }))}
                  onSelect={(val, lbl) => setData(d => ({ ...d, make: String(val), makeName: lbl, model: "", modelName: "", year: "" }))}
                />
              </div>

              {/* MODEL */}
              <div className="col-span-1 lg:flex-1 lg:min-w-0 z-30">
                <SearchableDropdown
                  label="Model"
                  placeholder="Select Model"
                  value={data.modelName || data.model}
                  loading={loadingVehicle}
                  disabled={!data.make}
                  options={models.map((m) => ({ value: m.modelID, label: m.modelName }))}
                  onSelect={(val, lbl) => setData(d => ({ ...d, model: String(val), modelName: lbl, year: "" }))}
                />
              </div>

              {/* YEAR */}
              <div className="col-span-2 lg:flex-1 lg:min-w-0 z-20">
                <SearchableDropdown
                  label="Year"
                  placeholder="Select Year"
                  value={data.year}
                  disabled={!data.model}
                  options={years.map((y) => ({ value: y, label: y }))}
                  onSelect={(val) => setData(d => ({ ...d, year: String(val) }))}
                />
              </div>
            </div>
            
            <button
              type="button"
              disabled={!isVehicleFullySelected}
              onClick={onNext}
              className="w-full lg:min-w-0 lg:w-auto bg-slate-800 disabled:bg-slate-300 text-white text-[13px] font-black uppercase tracking-wide rounded-xl lg:rounded-full px-8 py-3.5 hover:bg-slate-700 transition-all flex items-center justify-center gap-2 shrink-0 mt-1 lg:mt-0"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
      
      {/* Continue button if VIN is decoded and it's successful */}
      {isVehicleFullySelected && !vinError && data.vin.length === 17 && (
        <div className="flex justify-center pt-6 z-0 relative">
            <button
              type="button"
              onClick={onNext}
              className="inline-flex min-w-[280px] w-full max-w-sm bg-gradient-to-r from-emerald-500 to-emerald-600 border border-emerald-400 text-white text-[15px] font-black uppercase tracking-wide rounded-full px-8 py-4 shadow-[0_8px_30px_rgb(16,185,129,0.3)] transition-all hover:scale-105 active:scale-95 items-center justify-center gap-2"
            >
              Confirm Vehicle
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
        </div>
      )}
    </div>
  );
}

// ── Step 2: Condition Form (Aligned with styling) ──
function StepCondition({ data, setData, onBack, onNext, dbStates, dbCities }) {
  const tog = (field) => setData((d) => ({ ...d, [field]: !d[field] }));

  return (
    <div className="space-y-6 max-w-[800px] mx-auto bg-white p-6 sm:p-8 rounded-3xl shadow-[0_8px_40px_rgba(0,0,0,0.06)] border border-slate-100">
      <div className="mb-8">
        <h2 className="text-2xl font-black text-slate-900 mb-2">Vehicle Condition & Location</h2>
        <p className="text-slate-500 font-medium">Be honest — it helps us give you a more accurate cash offer.</p>
      </div>

      <div className="pt-2">
        <label className="block text-[12px] font-bold text-slate-400 uppercase tracking-wider mb-3">Vehicle Details (Select all that apply)</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          {[
            { field: "drivable", label: "Vehicle is Drivable", icon: "🚗" },
            { field: "starts", label: "Engine Starts", icon: "🔑" },
            { field: "transportation_required", label: "Needs Towing", icon: "🚚" },
            { field: "has_title", label: "I have the Title", icon: "📄" },
            { field: "has_keys", label: "I have the Keys", icon: "🗝️" },
            { field: "has_all_tires", label: "All 4 Tires Present", icon: "⚙️" },
            { field: "engine_issue", label: "Engine Problems", icon: "🔧" },
            { field: "transmission_issue", label: "Transmission Problems", icon: "⚙️" },
          ].map(({ field, label, icon }) => (
            <button
              key={field}
              type="button"
              className={`flex w-full items-center gap-3 p-4 rounded-xl border text-left transition-all ${
                data[field] ? "bg-blue-50 border-blue-600 text-blue-900 shadow-sm" : "bg-white border-slate-200 text-slate-600 hover:border-blue-300"
              }`}
              onClick={() => tog(field)}
            >
              <span className="text-xl flex-shrink-0">{icon}</span>
              <span className="font-semibold text-sm flex-1">{label}</span>
              <div className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 border ${data[field] ? "border-none bg-blue-600 text-white" : "border-slate-300"}`}>
                {data[field] && (
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-5 mb-5 space-y-5 sm:space-y-0">
        <div className="w-full sm:w-1/2">
          <label className="block text-[12px] font-bold text-slate-400 uppercase tracking-wider mb-2">Mileage *</label>
          <input
            className="w-full bg-slate-50 border border-slate-200 rounded-xl h-[52px] px-4 text-sm font-semibold text-slate-700 outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all shadow-sm"
            placeholder="e.g. 120000"
            type="number"
            value={data.mileage}
            onChange={(e) => setData((d) => ({ ...d, mileage: e.target.value }))}
          />
        </div>
        <div className="w-full sm:w-1/2 relative">
          <label className="block text-[12px] font-bold text-slate-400 uppercase tracking-wider mb-2">Body Damage *</label>
          <div className="relative group">
            <select
              className="w-full bg-slate-50 border border-slate-200 rounded-xl h-[52px] px-4 text-sm font-semibold text-slate-700 outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all appearance-none shadow-sm cursor-pointer"
              value={data.body_damage}
              onChange={(e) => setData((d) => ({ ...d, body_damage: e.target.value }))}
            >
              <option value="None">None – Excellent condition</option>
              <option value="Minor">Minor – Small dents or scratches</option>
              <option value="Moderate">Moderate – Noticeable damage</option>
              <option value="Severe">Severe – Major damage</option>
            </select>
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
            </div>
          </div>
        </div>
      </div>

      {/* Location Row (State and City) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
        <div className="relative z-30">
          <label className="block text-[12px] font-bold text-slate-400 uppercase tracking-wider mb-2">State *</label>
          <div className="bg-slate-50 border border-slate-200 rounded-xl transition-all shadow-sm focus-within:bg-white focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-50">
            <SearchableDropdown
              label="State"
              placeholder="Select State"
              value={data.state}
              options={dbStates.map(s => ({ value: s, label: s }))}
              onSelect={(val) => setData(d => ({ ...d, state: String(val), city: "" }))}
            />
          </div>
        </div>
        <div className="relative z-20">
          <label className="block text-[12px] font-bold text-slate-400 uppercase tracking-wider mb-2">City *</label>
          <div className="bg-slate-50 border border-slate-200 rounded-xl transition-all shadow-sm focus-within:bg-white focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-50">
            <SearchableDropdown
              label="City"
              placeholder="Select City"
              value={data.city}
              disabled={!data.state}
              options={dbCities.map(c => ({ value: c, label: c }))}
              onSelect={(val) => setData(d => ({ ...d, city: String(val) }))}
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-[12px] font-bold text-slate-400 uppercase tracking-wider mb-2">Additional Description (Optional)</label>
        <textarea
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm font-semibold text-slate-700 outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all shadow-sm resize-none"
          placeholder="Any other details about the vehicle..."
          rows={3}
          value={data.description}
          onChange={(e) => setData(d => ({ ...d, description: e.target.value }))}
        />
      </div>

      <div className="pt-8 flex gap-4">
        <button type="button" onClick={onBack} className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition text-[13px] uppercase tracking-wide">
          Back
        </button>
        <div className="flex-1 hidden sm:block"></div>
        <button
          type="button"
          disabled={!data.mileage || !data.state || !data.city}
          onClick={onNext}
          className="w-full sm:w-auto bg-blue-600 disabled:bg-slate-300 text-white text-[13px] font-black uppercase tracking-wide rounded-xl px-8 py-3.5 hover:bg-blue-700 transition shadow-[0_4px_14px_rgb(37,99,235,0.4)] disabled:shadow-none"
        >
          Continue
        </button>
      </div>
    </div>
  );
}

// ── Step 3: Contact Info ──
function StepContact({ data, setData, onBack, onNext }) {
  return (
    <div className="space-y-6 max-w-[800px] mx-auto bg-white p-6 sm:p-8 rounded-3xl shadow-[0_8px_40px_rgba(0,0,0,0.06)] border border-slate-100">
      <div className="mb-8">
        <h2 className="text-2xl font-black text-slate-900 mb-2">Your contact info</h2>
        <p className="text-slate-500 font-medium">We need this to securely contact you with an offer.</p>
      </div>

      <div className="flex flex-col gap-4">
        <div>
          <label className="block text-[12px] font-bold text-slate-400 uppercase tracking-wider mb-2">Full Name *</label>
          <input className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm font-semibold text-slate-700 outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all shadow-sm" placeholder="John Doe" value={data.name} onChange={(e) => setData((d) => ({ ...d, name: e.target.value }))} />
        </div>
        <div>
          <label className="block text-[12px] font-bold text-slate-400 uppercase tracking-wider mb-2">Phone *</label>
          <input className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm font-semibold text-slate-700 outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all shadow-sm" placeholder="(555) 000-0000" type="tel" value={data.phone} onChange={(e) => setData((d) => ({ ...d, phone: e.target.value }))} />
        </div>
        <div>
          <label className="block text-[12px] font-bold text-slate-400 uppercase tracking-wider mb-2">Email *</label>
          <input className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm font-semibold text-slate-700 outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all shadow-sm" placeholder="you@email.com" type="email" value={data.email} onChange={(e) => setData((d) => ({ ...d, email: e.target.value }))} />
        </div>
        <div>
          <label className="block text-[12px] font-bold text-slate-400 uppercase tracking-wider mb-2">ZIP Code *</label>
          <input className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm font-semibold text-slate-700 outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all shadow-sm" placeholder="e.g. 90210" value={data.zip_code} onChange={(e) => setData((d) => ({ ...d, zip_code: e.target.value }))} />
        </div>
      </div>

      <div className="pt-8 flex gap-4">
        <button type="button" onClick={onBack} className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition text-[13px] uppercase tracking-wide">Back</button>
        <div className="flex-1 hidden sm:block"></div>
        <button
          type="button"
          disabled={!data.name || !data.phone || !data.email || !data.zip_code}
          onClick={onNext}
          className="w-full sm:w-auto bg-blue-600 disabled:bg-slate-300 text-white text-[13px] font-black uppercase tracking-wide rounded-xl px-8 py-3.5 hover:bg-blue-700 transition shadow-[0_4px_14px_rgb(37,99,235,0.4)] disabled:shadow-none"
        >
          Review
        </button>
      </div>
    </div>
  );
}

// ── Step 4: Review ──
function StepReview({ data, onBack, onPaymentSuccess, submitting, submitError }) {
  const [payError, setPayError] = useState("");
  return (
    <div className="space-y-6 max-w-[800px] mx-auto bg-white p-6 sm:p-8 rounded-3xl shadow-[0_8px_40px_rgba(0,0,0,0.06)] border border-slate-100">
      <div className="mb-8">
        <h2 className="text-2xl font-black text-slate-900 mb-2">Review Submission</h2>
        <p className="text-slate-500 font-medium">Verify your vehicle and contact details before submitting.</p>
      </div>
      
      {(submitError || payError) && (
        <div className="mb-6 p-4 bg-red-50 text-red-600 text-sm font-bold rounded-xl border border-red-100">
          {submitError || payError}
        </div>
      )}

      <div className="space-y-4">
        <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-[11px] font-black text-blue-600 uppercase tracking-widest mb-2 flex items-center gap-2"><span className="text-base">🚗</span> Vehicle Details</h3>
          <p className="font-semibold text-slate-900 text-xl">{data.year} {data.makeName || data.make} {data.modelName || data.model}</p>
          <p className="text-slate-500 text-sm mt-1 font-medium">{data.trim && `Trim: ${data.trim} • `}VIN: {data.vin || "Not Provided"}</p>
        </div>

        <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-[11px] font-black text-blue-600 uppercase tracking-widest mb-3 flex items-center gap-2"><span className="text-base">📋</span> Condition</h3>
          <div className="grid grid-cols-2 gap-y-3 text-sm">
            <div className="text-slate-500 font-semibold tracking-wide text-xs uppercase">Mileage</div>
            <div className="font-bold text-slate-800 text-right">{data.mileage || "N/A"}</div>
            
            <div className="text-slate-500 font-semibold tracking-wide text-xs uppercase">Body Damage</div>
            <div className="font-bold text-slate-800 text-right">{data.body_damage}</div>
            
            <div className="text-slate-500 font-semibold tracking-wide text-xs uppercase">Drivable / Starts</div>
            <div className="font-bold text-slate-800 text-right">{data.drivable ? "Yes" : "No"} / {data.starts ? "Yes" : "No"}</div>
            
            <div className="text-slate-500 font-semibold tracking-wide text-xs uppercase">Has Title</div>
            <div className="font-bold text-slate-800 text-right">{data.has_title ? "Yes" : "No"}</div>
            
            <div className="text-slate-500 font-semibold tracking-wide text-xs uppercase">Issues & Extras</div>
            <div className="font-bold text-red-500 text-right">
              {[data.engine_issue && "Engine", data.transmission_issue && "Transmission", data.transportation_required && "Needs Tow"].filter(Boolean).join(", ") || "None"}
            </div>
            
            {(data.state || data.city) && (
              <>
                <div className="text-slate-500 font-semibold tracking-wide text-xs uppercase">Location</div>
                <div className="font-bold text-slate-800 text-right">{data.city}, {data.state}</div>
              </>
            )}
            
            {data.description && (
              <>
                <div className="text-slate-500 font-semibold tracking-wide text-xs uppercase">Description</div>
                <div className="font-bold text-slate-800 text-right">{data.description}</div>
              </>
            )}
          </div>
        </div>

        <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-[11px] font-black text-blue-600 uppercase tracking-widest mb-2 flex items-center gap-2"><span className="text-base">👤</span> Contact Details</h3>
          <p className="font-bold text-slate-900">{data.name}</p>
          <p className="text-slate-600 font-medium text-sm mt-1">{data.email}</p>
          <p className="text-slate-600 font-medium text-sm">{data.phone} • ZIP {data.zip_code}</p>
        </div>
      </div>

      <div className="pt-8 border-t border-slate-100">
        <div className="flex justify-between items-center mb-8">
            <button type="button" onClick={onBack} disabled={submitting} className="px-6 py-3.5 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition text-[13px] uppercase tracking-wide">Change Details</button>
            <div className="text-right">
                <div className="text-sm font-bold text-slate-500 uppercase tracking-widest">Listing Fee</div>
                <div className="text-3xl font-black text-slate-900">${SELL_VEHICLE_FEE}</div>
            </div>
        </div>
        
        <div className="max-w-md mx-auto">
            {submitting ? (
                <div className="w-full bg-blue-50 text-blue-600 font-bold text-center py-4 rounded-xl flex items-center justify-center gap-2">
                    <svg className="w-5 h-5 animate-spin text-blue-600" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Processing Submission...
                </div>
            ) : (
                <AcceptJsCheckout
                   amount={SELL_VEHICLE_FEE}
                   buttonText="Pay & Submit Vehicle"
                   onSuccess={onPaymentSuccess}
                   onError={(err) => setPayError(err)}
                />
            )}
        </div>
      </div>
    </div>
  );
}

// ── Success Screen ──
function SuccessScreen({ vehicle, onReset }) {
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    if (countdown <= 0) { onReset(); return; }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown, onReset]);

  const progress = ((10 - countdown) / 10) * 100;

  return (
    <PostSubmissionFeedback
      title="Submission Received!"
      message={
        <>
          We have received the details for your{' '}
          <span className="font-bold text-slate-900">
            {vehicle.year} {vehicle.makeName || vehicle.make} {vehicle.modelName || vehicle.model}
          </span>.
          {' '}Our team will contact you within 24 hours with an offer.
        </>
      }
      referenceId={`SYC-${vehicle.vin || Date.now()}`}
      actionText="Submit Another Vehicle"
      onAction={onReset}
      extra={
        <div className="mt-4 w-full flex flex-col items-center">
          <div className="w-full max-w-[240px]">
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mb-2">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-1000 ease-linear"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest text-center">
              Resetting in {countdown}s…
            </p>
          </div>
        </div>
      }
    />
  );
}

const STEPS = ["Vehicle", "Condition", "Contact", "Review"];
const INITIAL = {
  vin: "", year: "", make: "", model: "", makeName: "", modelName: "", trim: "",
  fuelType: "", driveType: "", vehicleType: "",
  mileage: "", drivable: false, starts: true, transportation_required: false, has_title: false,
  has_keys: false, has_all_tires: false, body_damage: "None", engine_issue: false, transmission_issue: false,
  name: "", email: "", phone: "", zip_code: "", state: "", city: "", description: ""
};

export default function SellYourCar() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState(INITIAL);
  const [vinLoading, setVinLoading] = useState(false);
  const [vinError, setVinError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  // ── Make/Model Local Database Hook Integration ──
  const [makes, setMakes] = useState([]);
  const [models, setModels] = useState([]);
  
  // ── Locations Hook Integration ──
  const [dbStates, setDbStates] = useState([]);
  const [dbCities, setDbCities] = useState([]);

  useEffect(() => {
    api.getZipcodeStates().then((res) => {
      if (res.states) setDbStates(res.states);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!data.state) {
      setDbCities([]);
      return;
    }
    api.getZipcodeCities(data.state).then((res) => {
      if (res.cities) setDbCities(res.cities);
    }).catch(() => {});
  }, [data.state]);
  const [years, setYears] = useState([]);
  const [loadingMakes, setLoadingMakes] = useState(false);
  const [loadingVehicle, setLoadingVehicle] = useState(false);

  useEffect(() => {
    setLoadingMakes(true);
    api.getMakes().then((d) => setMakes(d || [])).catch(() => {}).finally(() => setLoadingMakes(false));
  }, []);

  useEffect(() => {
    // Only fetch models when make is a NUMERIC database ID.
    // String names (e.g. "FORD" from VIN decode) are display-only
    // and should NOT trigger the bulk vehicle-data API call.
    if (!data.make || isNaN(Number(data.make))) {
      if (!data.make) setModels([]);
      return;
    }
    setLoadingVehicle(true);
    const CACHE_VERSION = 'v3';
    const LS_KEY = `jynm_vdata_${CACHE_VERSION}_${data.make}`;
    
    const applyData = (d) => {
      setModels((d.models || []).map((m) => ({ modelID: m.model_id, modelName: m.model_name, years: m.years || [] })));
    };

    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        const { ts, data: cachedData } = JSON.parse(raw);
        if (Date.now() - ts < 12 * 60 * 60 * 1000) {
          applyData(cachedData);
          setLoadingVehicle(false);
          return;
        }
      }
    } catch (_) {}

    api.getVehicleDataBulk(data.make).then((d) => {
      try { localStorage.setItem(LS_KEY, JSON.stringify({ ts: Date.now(), data: d })); } catch (_) {}
      applyData(d);
    }).catch(() => setModels([])).finally(() => setLoadingVehicle(false));
  }, [data.make]);

  // Initialize years statically (go deeply back so DB years are all included)
  useEffect(() => {
    const currentYear = new Date().getFullYear();
    const staticYears = Array.from({ length: currentYear - 1939 }, (_, i) => currentYear + 1 - i); // goes to 1940
    setYears(staticYears);
  }, []);
  // ── End Database integration ──

  const handleVinDecode = useCallback(async (vin) => {
    setVinLoading(true);
    setVinError("");
    try {
      const json = await api.decodeVin(vin);
      if (!json.success) {
        setVinError(json.error || "Could not decode VIN. Please proceed by entering manually.");
        return;
      }
      const v = json.vehicle;
      // Only set display fields (makeName/modelName), NOT the ID fields (make/model).
      // Setting make/model to a string like "FORD" would trigger the model-bulk-fetch
      // API with a non-numeric ID, causing a 404. The Start Now button and submit
      // both fall back to makeName/modelName so this is safe.
      setData(d => ({
        ...d,
        year: v.year ? String(v.year) : d.year,
        makeName: v.make || d.makeName,
        modelName: v.model || d.modelName,
        trim: v.trim || "",
      }));
    } catch (err) {
      setVinError("Network error decoding VIN. Check that the backend is running.");
    } finally {
      setVinLoading(false);
    }
  }, []);

  const handleSubmit = async (nonce) => {
    setSubmitting(true);
    setSubmitError("");
    try {
      // 1. Process Authorize.net Payment
      await api.chargeCard({
         nonce: nonce,
         amount: SELL_VEHICLE_FEE,
         item_type: 'sell_vehicle_fee',
         item_id: 'sell_vehicle',
         source_module: 'sell_vehicle',
         description: `Vehicle Submission Fee - ${data.year} ${data.makeName || data.make} ${data.modelName || data.model}`,
         guest_email: data.email
      });

      // 2. Submit the vehicle lead
      // data.name, data.email, data.phone, data.zip_code are set
      // directly by StepContact form fields — pass them as-is.
      const payload = {
        vin: data.vin || '',
        year: parseInt(data.year) || null,
        make: data.makeName || data.make,
        model: data.modelName || data.model,
        trim: data.trim || '',
        mileage: data.mileage || '',
        drivable: data.drivable || false,
        has_title: data.has_title || false,
        has_keys: data.has_keys || false,
        has_all_tires: data.has_all_tires || false,
        body_damage: data.body_damage || 'None',
        engine_issue: data.engine_issue || false,
        transmission_issue: data.transmission_issue || false,
        name: data.name,
        email: data.email,
        phone: data.phone,
        zip_code: data.zip_code,
      };
      await api.sellVehicle(payload);
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e) {
      const errMsg = e?.response?.data
        ? JSON.stringify(e.response.data)
        : "Submission failed. Please try again or call us directly.";
      setSubmitError(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const nextStep = async () => {
    if (step === 0 && !data.vin && data.year && (data.make || data.makeName) && (data.model || data.modelName)) {
      setVinLoading(true);
      try {
        await api.vehicleLookup(data.year, data.makeName || data.make, data.modelName || data.model);
      } catch (e) {}
      setVinLoading(false);
    }
    setStep(s => s + 1); 
    window.scrollTo({ top: 0, behavior: 'smooth' }); 
  };
  const prevStep = () => { setStep(s => s - 1); window.scrollTo({ top: 0, behavior: 'smooth' }); };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans overflow-x-hidden">
      <SEO title="Sell Your Vehicle | Junkyards Near Me" description="Submit your vehicle details." canonicalUrl="/sell-your-car" />
      <Navbar />

      <div className="flex-1 w-full relative">
        {/* Simple Page Header in JYNM style */}
        <div className="bg-white border-b border-slate-100 py-8 md:py-16 text-center">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>
              Sell Your Vehicle
            </h1>
            <p className="mt-4 text-slate-500 font-medium text-lg max-w-2xl mx-auto">
              Tell us about your vehicle to request a quote. Provide your VIN or enter details manually below.
            </p>
          </div>
        </div>

        {/* Form Container (resembles homepage spacing) */}
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
          {submitted ? (
            <SuccessScreen 
              vehicle={data} 
              onReset={() => {
                setSubmitted(false);
                setStep(0);
                setData(INITIAL);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }} 
            />
          ) : (
            <>
              {/* Stepper Navigation */}
              <div className="flex justify-center mb-10 w-full overflow-x-auto hide-scrollbar">
                <div className="flex items-center gap-2 sm:gap-4 bg-white px-2 sm:px-6 py-3 rounded-full border border-slate-200 shadow-sm min-w-max">
                  {STEPS.map((label, i) => (
                    <div key={label} className="flex items-center">
                      <div className={`flex items-center justify-center text-[10px] sm:text-[11px] font-black uppercase tracking-widest px-3 sm:px-4 py-1.5 rounded-full transition-colors ${
                        step === i ? "bg-blue-600 text-white shadow-md" : step > i ? "bg-emerald-100 text-emerald-700" : "bg-transparent text-slate-400"
                      }`}>
                        {step > i ? "✓" : `${i + 1}.`} {label}
                      </div>
                      {i < STEPS.length - 1 && <div className="w-4 sm:w-8 border-t-2 border-slate-100 mx-1 sm:mx-2 border-dotted"></div>}
                    </div>
                  ))}
                </div>
              </div>

             <div className="pb-20">
                <AnimatePresence mode="wait">
                  <motion.div key={step} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                    {step === 0 && (
                      <StepVehicleID 
                        data={data} setData={setData} onNext={nextStep} 
                        onVinDecode={handleVinDecode} vinLoading={vinLoading} vinError={vinError}
                        makes={makes} models={models} years={years}
                        loadingMakes={loadingMakes} loadingVehicle={loadingVehicle}
                      />
                    )}
                    {step === 1 && <StepCondition data={data} setData={setData} onBack={prevStep} onNext={nextStep} dbStates={dbStates} dbCities={dbCities} />}
                    {step === 2 && <StepContact data={data} setData={setData} onBack={prevStep} onNext={nextStep} />}
                    {step === 3 && <StepReview data={data} onBack={prevStep} onPaymentSuccess={handleSubmit} submitting={submitting} submitError={submitError} />}
                  </motion.div>
                </AnimatePresence>
             </div>
            </>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
