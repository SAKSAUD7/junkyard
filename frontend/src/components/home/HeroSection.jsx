import React, { useState, useEffect, useRef } from "react";
import { api } from "../../services/api";
import Captcha from "../Captcha";
import PincodeSearch from "../PincodeSearch";
import PromoBanner from "../PromoBanner";

// ── Searchable Dropdown Component ───────────────────────────────────────────
function SearchableDropdown({
  value,
  label,
  placeholder,
  options,
  onSelect,
  disabled,
  loading,
}) {
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
    .filter((o) =>
      (o.label || o).toString().toLowerCase().includes(query.toLowerCase()),
    )
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
        className={`w-full flex items-center justify-between gap-1 px-4 py-3 lg:py-2.5 text-[14px] font-bold transition-all
                    ${disabled ? "text-slate-400 cursor-not-allowed" : "text-slate-800 cursor-pointer hover:text-blue-600"}
                    bg-transparent outline-none border-0 rounded-xl lg:rounded-none border border-slate-100 lg:border-y-0 lg:border-l-0 lg:border-r-2
                `}
      >
        <span
          className={`truncate ${!value ? "text-slate-400 font-semibold" : "text-slate-900"}`}
        >
          {loading ? "Loading..." : value || placeholder}
        </span>
        <svg
          className={`w-3.5 h-3.5 shrink-0 transition-transform ${open ? "rotate-180" : ""} text-slate-400`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.5}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {open && (
        <div className="absolute top-full left-0 z-[200] mt-2 w-64 bg-white rounded-2xl shadow-[0_16px_50px_rgba(0,0,0,0.18)] border border-slate-100 overflow-hidden">
          {/* Search input */}
          <div className="px-3 pt-3 pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2 bg-slate-50 rounded-xl px-3 py-2">
              <svg
                className="w-4 h-4 text-blue-500 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
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
          {/* List */}
          <div className="max-h-52 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <p className="px-4 py-3 text-[13px] text-slate-400 text-center">
                No results for "{query}"
              </p>
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

export default function HeroSection({ get, ready = false }) {
  const leadFormRef = useRef(null);
  const desktopVideoRef = useRef(null);
  const mobileVideoRef = useRef(null);

  // Observer for Sticky CTA
  useEffect(() => {
    if (!leadFormRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setFormInView(entry.isIntersecting);
      },
      { threshold: 0.1, rootMargin: "-80px 0px 0px 0px" }
    );
    observer.observe(leadFormRef.current);
    return () => observer.disconnect();
  }, []);

  // Defer video playback to avoid massive network blocking on initial load
  useEffect(() => {
    const timer = setTimeout(() => {
      if (desktopVideoRef.current) desktopVideoRef.current.play().catch(()=>{});
      if (mobileVideoRef.current) mobileVideoRef.current.play().catch(()=>{});
    }, 1500);
    return () => clearTimeout(timer);
  }, []);
  const [makes, setMakes] = useState([]);
  const [models, setModels] = useState([]);
  const [years, setYears] = useState([]);
  const [parts, setParts] = useState([]);
  const [vehicleCache, setVehicleCache] = useState(null);
  const [heroMake, setHeroMake] = useState("");
  const [heroMakeName, setHeroMakeName] = useState("");
  const [heroModel, setHeroModel] = useState("");
  const [heroModelName, setHeroModelName] = useState("");
  const [heroYear, setHeroYear] = useState("");
  const [heroPartId, setHeroPartId] = useState("");
  const [heroPartName, setHeroPartName] = useState("");
  const [partVariants, setPartVariants] = useState([]);
  const [selectedOptionTags, setSelectedOptionTags] = useState([]);
  const [hollanderNumber, setHollanderNumber] = useState("");
  const [options, setOptions] = useState("");
  const [allUniqueOptions, setAllUniqueOptions] = useState([]);

  const [loadingMakes, setLoadingMakes] = useState(false);
  const [loadingVehicle, setLoadingVehicle] = useState(false);
  const [loadingParts, setLoadingParts] = useState(false);

  // Contact info (step 2)
  const [heroName, setHeroName] = useState("");
  const [heroEmail, setHeroEmail] = useState("");
  const [heroPhone, setHeroPhone] = useState("");
  const [heroState, setHeroState] = useState("");
  const [heroZip, setHeroZip] = useState("");

  // Flow control
  const [heroStep, setHeroStep] = useState(1); // 1 or 2
  const [heroError, setHeroError] = useState("");
  const [heroSubmitting, setHeroSubmitting] = useState(false);
  const [heroSuccess, setHeroSuccess] = useState(false);

  // CAPTCHA
  const generateCaptcha = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ";
    const nums = "23456789";
    const code = [
      nums[Math.floor(Math.random() * nums.length)],
      chars[Math.floor(Math.random() * chars.length)],
      (chars + nums)[Math.floor(Math.random() * (chars.length + nums.length))],
      (chars + nums)[Math.floor(Math.random() * (chars.length + nums.length))],
    ];
    return code.sort(() => Math.random() - 0.5).join("");
  };
  const [captchaCode, setCaptchaCode] = useState(generateCaptcha());
  const [captchaInput, setCaptchaInput] = useState("");

  const formatPhone = (val) => {
    const raw = val.replace(/\D/g, "").substring(0, 10);
    if (raw.length === 0) return "";
    if (raw.length <= 3) return raw;
    if (raw.length <= 6) return `(${raw.slice(0, 3)}) ${raw.slice(3)}`;
    return `(${raw.slice(0, 3)}) ${raw.slice(3, 6)}-${raw.slice(6)}`;
  };

  const US_STATES = [
    "AK",
    "AL",
    "AR",
    "AS",
    "AZ",
    "CA",
    "CO",
    "CT",
    "DC",
    "DE",
    "FL",
    "GA",
    "GU",
    "HI",
    "IA",
    "ID",
    "IL",
    "IN",
    "KS",
    "KY",
    "LA",
    "MA",
    "MD",
    "ME",
    "MI",
    "MN",
    "MO",
    "MP",
    "MS",
    "MT",
    "NC",
    "ND",
    "NE",
    "NH",
    "NJ",
    "NM",
    "NV",
    "NY",
    "OH",
    "OK",
    "OR",
    "PA",
    "PR",
    "RI",
    "SC",
    "SD",
    "TN",
    "TX",
    "UT",
    "VA",
    "VI",
    "VT",
    "WA",
    "WI",
    "WV",
    "WY",
  ];

  // Zip Code Dropdown State
  const [zipcodes, setZipcodes] = useState([]);
  const [showZipSuggestions, setShowZipSuggestions] = useState(false);
  const [loadingZipcodes, setLoadingZipcodes] = useState(false);

  /* Load zipcodes when state changes */
  useEffect(() => {
    const fetchZipcodes = async () => {
      if (!heroState) {
        setZipcodes([]);
        setShowZipSuggestions(false);
        return;
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
    api
      .getMakes()
      .then((d) => setMakes(d || []))
      .catch(() => {})
      .finally(() => setLoadingMakes(false));
  }, []);

  /* Bulk-fetch models+years when make changes */
  useEffect(() => {
    if (!heroMake) {
      setModels([]);
      setYears([]);
      setParts([]);
      setVehicleCache(null);
      setHeroModel("");
      setHeroYear("");
      setHeroPartId("");
      return;
    }
    setHeroModel("");
    setHeroYear("");
    setHeroPartId("");

    const CACHE_VERSION = 'v3';
    const LS_KEY = `jynm_vdata_${CACHE_VERSION}_${heroMake}`;
    const CACHE_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours

    const applyData = (d) => {
      setVehicleCache(d);
      setModels(
        (d.models || []).map((m) => ({
          modelID: m.model_id,
          modelName: m.model_name,
          years: m.years || [],
          parts: m.parts || {},
        })),
      );
    };

    // Try localStorage first (instant — no spinner needed)
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        const { ts, data } = JSON.parse(raw);
        if (Date.now() - ts < CACHE_TTL_MS) {
          applyData(data);
          setLoadingVehicle(false);
          return;
        }
      }
    } catch (_) {}

    // Fetch from server
    setLoadingVehicle(true);
    api
      .getVehicleDataBulk(heroMake)
      .then((d) => {
        try { localStorage.setItem(LS_KEY, JSON.stringify({ ts: Date.now(), data: d })); } catch (_) {}
        applyData(d);
      })
      .catch(() => setModels([]))
      .finally(() => setLoadingVehicle(false));
  }, [heroMake]);


  /* Filter years from cache when model changes */
  useEffect(() => {
    if (!heroModel) {
      setYears([]);
      setParts([]);
      setHeroYear("");
      setHeroPartId("");
      return;
    }
    const mod = models.find((m) => String(m.modelID) === String(heroModel));
    let modelYears = mod ? mod.years : [];
    if (modelYears.length === 0 && heroModel) {
      // Fallback to static years if the database has no years mapped for this model
      modelYears = Array.from({length: 45}, (_, i) => 2024 - i);
    }
    setYears(modelYears);
    setHeroYear("");
    setHeroPartId("");
  }, [heroModel, models]);

  /* Load parts when year changes */
  useEffect(() => {
    if (!heroYear || !heroModel) {
      setParts([]);
      setHeroPartId("");
      return;
    }
    // Try cache first
    const mod = models.find((m) => String(m.modelID) === String(heroModel));
    if (mod?.parts?.[heroYear]?.length > 0) {
      setParts(
        mod.parts[heroYear].map((p) => ({
          partID: p.part_id,
          partName: p.part_name,
          variants: p.variants || [],
        })),
      );
      setHeroPartId("");
      setPartVariants([]);
      setSelectedOptionTags([]);
      setHollanderNumber("");
      setOptions("");
      return;
    }
    // Fallback to API
    setLoadingParts(true);
    api
      .getParts({ make_id: heroMake, model_id: heroModel, year: heroYear })
      .then((d) =>
        setParts(
          (d || []).map((p) => ({
            partID: p.partID || p.part_id,
            partName: p.partName || p.part_name,
            variants: p.variants || [],
          })),
        ),
      )
      .catch(() => setParts([]))
      .finally(() => setLoadingParts(false));
    setHeroPartId("");
  }, [heroYear, heroModel, models]);

  // Helper to extract unique options for a part
  useEffect(() => {
    if (!partVariants || partVariants.length === 0) {
      setAllUniqueOptions([]);
      return;
    }
    const unique = new Set();
    partVariants.forEach((v) => {
      if (v.options) {
        v.options.split(",").forEach((opt) => unique.add(opt.trim()));
      }
    });
    setAllUniqueOptions(Array.from(unique).filter(Boolean));
  }, [partVariants]);

  const toggleOptionTag = (tag) => {
    const newTags = selectedOptionTags.includes(tag)
      ? selectedOptionTags.filter((t) => t !== tag)
      : [...selectedOptionTags, tag];
    setSelectedOptionTags(newTags);
    if (newTags.length === 0 && partVariants.length > 0) {
      setHollanderNumber(partVariants[0].hollander_number || "");
      setOptions(partVariants[0].options || "");
      return;
    }
    let bestMatch = partVariants[0];
    let maxMatches = -1;
    partVariants.forEach((v) => {
      if (!v.options) return;
      const variantOpts = v.options.split(",").map((s) => s.trim());
      const matches = newTags.filter((t) => variantOpts.includes(t)).length;
      if (matches > maxMatches) {
        maxMatches = matches;
        bestMatch = v;
      }
    });
    if (bestMatch) {
      setHollanderNumber(bestMatch.hollander_number || "");
      setOptions(bestMatch.options || "");
    }
  };

  const handleHeroNext = () => {
    if (heroStep === 1) {
      if (!heroMake || !heroModel || !heroYear || !heroPartId) {
        setHeroError("Please select all vehicle details.");
        return;
      }
      setHeroError("");
      if (partVariants.length > 1 && allUniqueOptions.length > 0) {
        setHeroStep(2);
      } else {
        setHeroStep(3);
      }
    } else if (heroStep === 2) {
      setHeroStep(3);
    }
    setCaptchaInput("");
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
    setHeroError("");
    setCaptchaInput("");
  };

  const handleHeroSubmit = async (e) => {
    e.preventDefault();
    if (!heroName || !heroEmail || !heroPhone || !heroState || !heroZip) {
      setHeroError("Please fill in all contact fields.");
      return;
    }
    if (!captchaInput.trim()) {
      setHeroError("Please enter the CAPTCHA value.");
      return;
    }
    if (captchaInput.trim().toUpperCase() !== captchaCode) {
      setHeroError("Please re-enter the CAPTCHA value properly.");
      setCaptchaCode(generateCaptcha());
      setCaptchaInput("");
      return;
    }
    setHeroError("");
    setHeroSubmitting(true);
    try {
      const finalMake =
        makes.find((m) => String(m.makeID) === String(heroMake))?.makeName ||
        heroMakeName ||
        heroMake;
      const finalModel =
        models.find((m) => String(m.modelID) === String(heroModel))
          ?.modelName ||
        heroModelName ||
        heroModel;
      const finalPart =
        parts.find((p) => String(p.partID) === String(heroPartId))?.partName ||
        heroPartName ||
        heroPartId ||
        "";

      await api.createLead({
        make: finalMake,
        model: finalModel,
        year: parseInt(heroYear),
        part: finalPart.split(" (")[0].trim(),
        hollander_number:
          hollanderNumber && hollanderNumber !== "Not Found"
            ? hollanderNumber
            : "",
        options: options || "",
        name: heroName,
        email: heroEmail,
        phone: heroPhone,
        state: heroState,
        zip: heroZip,
        lead_type: "quality_auto_parts",
      });
      setHeroSuccess(true);
    } catch {
      setHeroError("Submission failed. Please try again.");
    } finally {
      setHeroSubmitting(false);
    }
  };

  const handleHeroReset = () => {
    setHeroSuccess(false);
    setHeroStep(1);
    setHeroMake("");
    setHeroModel("");
    setHeroYear("");
    setHeroPartId("");
    setHeroName("");
    setHeroEmail("");
    setHeroPhone("");
    setHeroState("");
    setHeroZip("");
    setHeroError("");
    setCaptchaCode("");
    setCaptchaInput("");
    setPartVariants([]);
    setSelectedOptionTags([]);
    setHollanderNumber("");
    setOptions("");
  };

  const [successCountdown, setSuccessCountdown] = useState(10);
  useEffect(() => {
    if (!heroSuccess) {
      setSuccessCountdown(10);
      return;
    }
    setSuccessCountdown(10);
    const interval = setInterval(() => {
      setSuccessCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleHeroReset();
          return 0;
        }
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
          ref={desktopVideoRef}
          muted
          loop
          playsInline
          preload="none"
          aria-label="Background video of luxury cars"
          className="w-full h-full object-cover mix-blend-multiply opacity-90"
          style={{ filter: "brightness(1.05) contrast(1.1)" }}
        >
          <source
            src="/Video/hero-models-bg.mp4"
            type="video/mp4"
          />
        </video>
        {/* Light Gradient Overlay */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-white via-white/80 to-transparent w-3/4" />
      </div>

      <div className="relative w-full max-w-[1400px] mx-auto z-10 flex flex-col justify-start px-4 sm:px-6 lg:px-8 flex-1 mt-2">
        <div className="w-full lg:max-w-[70%] text-left mb-2 lg:mb-10 text-center lg:text-left">
          <div className="inline-flex items-center px-4 py-1.5 rounded-full mb-6 bg-blue-50 text-blue-600 text-[12px] lg:text-[13px] font-bold border border-blue-100/50 backdrop-blur-md">
            <svg
              className="w-4 h-4 mr-1.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
              />
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
            <div
              className="hero-responsive-text text-[22px] sm:text-3xl md:text-5xl lg:text-[54px] font-black text-[#1e293b] mb-4 lg:mb-5 tracking-tight leading-[1.15] transition-opacity duration-300 opacity-100 [&>p]:m-0"
              style={{ fontFamily: "'Outfit', sans-serif" }}
              dangerouslySetInnerHTML={{
                __html: get(
                  "hero",
                  "heading",
                  'Find Verified Auto Parts <br /> From <span class="text-blue-600">6,500+</span> Junkyards <br /> In Under <span class="text-emerald-600">60</span> Seconds',
                ),
              }}
            />
          )}

          {/* Subheading — hidden until CMS ready */}
          {!ready ? (
            <div className="space-y-2 mb-2 lg:mb-8 max-w-[540px] mx-auto lg:mx-0">
              <div className="h-5 bg-slate-200/60 rounded-lg animate-pulse w-full" />
              <div className="h-5 bg-slate-200/60 rounded-lg animate-pulse w-4/5" />
            </div>
          ) : (
            <div
              className="hero-responsive-text text-[15px] lg:text-[17px] text-slate-600 mb-2 lg:mb-8 max-w-[540px] font-medium leading-relaxed mx-auto lg:mx-0 transition-opacity duration-300 opacity-100 [&>p]:m-0"
              dangerouslySetInnerHTML={{
                __html: get(
                  "hero",
                  "subheading",
                  'Compare prices from licensed salvage yards nationwide <br class="hidden sm:block" /> and save up to 80% compared to dealership pricing.',
                ),
              }}
            />
          )}
        </div>

        {/* MOBILE VIDEO BLOCK — compact fixed height to stay above fold */}
        <div className="w-[100vw] -ml-[calc(50vw-50%)] relative flex lg:hidden items-center justify-center overflow-hidden mt-1 mb-2" style={{ height: '200px' }}>
          <video
            ref={mobileVideoRef}
            muted
            loop
            playsInline
            preload="none"
            aria-label="Background video of cars at a junkyard"
            className="w-full h-full object-cover object-center scale-[1.05]"
            style={{ filter: "brightness(1.05) contrast(1.05)" }}
          >
            <source src="/Video/hero-models-bg.mp4" type="video/mp4" />
          </video>
          {/* subtle gradient overlay at bottom to blend into content */}
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white to-transparent pointer-events-none" />
        </div>

        <div className="w-full xl:max-w-[800px] lg:max-w-[750px] flex flex-col items-start mt-2 space-y-4">
          <div ref={leadFormRef} className="w-full mb-8 relative z-[100]">
            <div className="flex items-center gap-3 mb-4 pl-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-600 text-white text-[11px] font-black uppercase tracking-widest rounded-full shadow-[0_4px_14px_rgba(37,99,235,0.45)] animate-pulse">
                <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                Free Instant Quote
              </span>
              <h3 className="text-[13px] font-black text-slate-700 uppercase tracking-[0.2em]">
                Find Your Part in Seconds
              </h3>
            </div>
            <div
              className={`bg-white shadow-[0_20px_50px_rgba(0,0,0,0.15)] ring-[8px] ring-blue-500/15 border-2 border-blue-500 relative z-[100] overflow-visible transition-all duration-300 hover:shadow-[0_25px_60px_rgba(37,99,235,0.25)]
                            ${heroStep > 1 && !heroSuccess ? "rounded-3xl" : "rounded-2xl lg:rounded-full"}`}
            >
              {/* SUCCESS STATE */}
              {heroSuccess && (
                <div className="flex items-center gap-4 px-6 py-4">
                  <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-slate-900 text-[15px]">
                      The lead has been submitted 🎉
                    </p>
                  </div>
                  <button
                    onClick={handleHeroReset}
                    className="text-blue-600 text-[13px] font-bold hover:underline whitespace-nowrap flex-shrink-0"
                  >
                    New Search
                  </button>
                </div>
              )}
              {/* STEP 1 — Vehicle + Part */}
              {!heroSuccess && heroStep === 1 && (
                <div className="flex flex-col lg:flex-row items-stretch lg:items-center p-2 lg:p-2 gap-3 lg:gap-0 w-full">
                  <div className="hidden lg:flex items-center gap-2.5 px-6 border-r-2 border-slate-100 shrink-0">
                    <span className="w-7 h-7 bg-blue-600 text-white rounded-full text-[13px] font-black flex items-center justify-center shadow-md">
                      1
                    </span>
                    <span className="text-[12px] font-black text-slate-800 uppercase tracking-[0.15em]">
                      Vehicle
                    </span>
                  </div>

                  {/* Mobile: 2x2 grid, Desktop: flex row */}
                  <div className="grid grid-cols-2 lg:flex lg:flex-1 lg:flex-row gap-2 lg:gap-0 min-w-0">
                    {/* MAKE */}
                    <div className="col-span-1 lg:flex-1 lg:min-w-0">
                      <SearchableDropdown
                        label="Make"
                        placeholder="Make"
                        value={heroMakeName}
                        loading={loadingMakes}
                        options={makes.map((m) => ({
                          value: m.makeID,
                          label: m.makeName,
                        }))}
                        onSelect={(val, lbl) => {
                          setHeroMake(String(val));
                          setHeroMakeName(lbl);
                        }}
                      />
                    </div>

                    {/* MODEL */}
                    <div className="col-span-1 lg:flex-1 lg:min-w-0">
                      <SearchableDropdown
                        label="Model"
                        placeholder="Model"
                        value={heroModelName}
                        loading={loadingVehicle}
                        disabled={!heroMake}
                        options={models.map((m) => ({
                          value: m.modelID,
                          label: m.modelName,
                        }))}
                        onSelect={(val, lbl) => {
                          setHeroModel(String(val));
                          setHeroModelName(lbl);
                        }}
                      />
                    </div>

                    {/* YEAR */}
                    <div className="col-span-1 lg:flex-1 lg:min-w-0">
                      <SearchableDropdown
                        label="Year"
                        placeholder="Year"
                        value={heroYear}
                        disabled={!heroModel}
                        options={years.map((y) => ({ value: y, label: y }))}
                        onSelect={(val) => setHeroYear(String(val))}
                      />
                    </div>

                    {/* PART */}
                    <div className="col-span-1 lg:flex-[1.5] lg:min-w-0">
                      <SearchableDropdown
                        label="Part"
                        placeholder="Part"
                        value={heroPartName}
                        loading={loadingParts}
                        disabled={!heroYear || loadingParts}
                        options={parts.map((p) => ({
                          value: p.partID,
                          label: p.partName,
                        }))}
                        onSelect={(val, lbl) => {
                          setHeroPartId(String(val));
                          setHeroPartName(lbl);
                          const found = parts.find(
                            (p) => String(p.partID) === String(val),
                          );
                          if (found) {
                            setPartVariants(found.variants || []);
                            setSelectedOptionTags([]);
                            if (found.variants?.length >= 1) {
                              setHollanderNumber(
                                found.variants[0].hollander_number || "",
                              );
                              setOptions(found.variants[0].options || "");
                            } else {
                              setHollanderNumber("");
                              setOptions("");
                            }
                          }
                        }}
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleHeroNext}
                    className="w-full lg:min-w-0 lg:w-auto bg-gradient-to-r from-blue-600 to-blue-500 text-white text-[15px] font-black rounded-xl lg:rounded-full px-8 py-3.5 hover:from-blue-700 hover:to-blue-600 hover:-translate-y-0.5 transition-all shadow-[0_8px_25px_rgb(37,99,235,0.4)] flex items-center justify-center gap-2 group shrink-0 mt-1 lg:mt-0"
                  >
                    Next Step
                    <svg
                      className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M14 5l7 7m0 0l-7 7m7-7H3"
                      />
                    </svg>
                  </button>
                </div>
              )}

              {!heroSuccess &&
                heroStep === 1 &&
                heroPartId &&
                partVariants.length === 1 && (
                  <div className="absolute -bottom-8 left-0 w-full flex justify-center animate-fade-in-up">
                    <span className="bg-emerald-500 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-sm flex items-center gap-1">
                      ✓ Exact Part Confirmed{" "}
                      {options && (
                        <span className="opacity-75 font-medium ml-1">
                          | {options.replace(/^\(|\)$/g, "").trim()}
                        </span>
                      )}
                    </span>
                  </div>
                )}

              {/* STEP 2 — Options (if variants > 1) */}
              {!heroSuccess &&
                heroStep === 2 &&
                partVariants.length > 1 &&
                allUniqueOptions.length > 0 && (
                  <div className="flex flex-col p-5 gap-4">
                    <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                      <button
                        type="button"
                        onClick={handleHeroBack}
                        className="w-7 h-7 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full text-[13px] font-black flex items-center justify-center transition"
                      >
                        ←
                      </button>
                      <span className="text-[12px] font-bold text-slate-500 uppercase tracking-wide">
                        Narrow Down Your Part
                      </span>
                    </div>
                    <p className="text-[12px] text-slate-500 font-medium">
                      Select all options that apply to your vehicle to ensure a
                      perfect fit:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {allUniqueOptions.map((opt) => (
                        <button
                          type="button"
                          key={opt}
                          onClick={() => toggleOptionTag(opt)}
                          className={`px-3 py-1.5 rounded-lg text-[12px] font-bold border transition-all ${
                            selectedOptionTags.includes(opt)
                              ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                              : "bg-slate-50 text-slate-600 border-slate-200 hover:border-blue-400 hover:text-blue-600"
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={handleHeroNext}
                      className="w-full bg-blue-600 text-white text-[13px] font-bold rounded-xl px-7 py-3.5 hover:bg-blue-700 transition shadow-[0_8px_20px_rgb(37,99,235,0.25)] flex items-center justify-center gap-2 group mt-2"
                    >
                      Confirm Options
                      <svg
                        className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2.5}
                          d="M14 5l7 7m0 0l-7 7m7-7H3"
                        />
                      </svg>
                    </button>
                  </div>
                )}

              {/* STEP 3 — Contact Info */}
              {!heroSuccess && heroStep === 3 && (
                <form
                  onSubmit={handleHeroSubmit}
                  className="flex flex-col p-5 gap-4"
                >
                  <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                    <button
                      type="button"
                      onClick={handleHeroBack}
                      className="w-7 h-7 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full text-[13px] font-black flex items-center justify-center transition"
                    >
                      ←
                    </button>
                    <span className="text-[12px] font-bold text-slate-500 uppercase tracking-wide">
                      Contact Details
                    </span>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                    <input
                      type="text"
                      placeholder="Your Name"
                      value={heroName}
                      onChange={(e) => setHeroName(e.target.value)}
                      required
                      className="bg-slate-50 border border-slate-100 rounded-xl text-[13px] font-semibold text-slate-700 outline-none px-4 py-3 placeholder-slate-400 focus:bg-white focus:border-blue-500 transition-colors"
                    />
                    <input
                      type="email"
                      placeholder="Email Address"
                      value={heroEmail}
                      onChange={(e) => setHeroEmail(e.target.value)}
                      required
                      className="bg-slate-50 border border-slate-100 rounded-xl text-[13px] font-semibold text-slate-700 outline-none px-4 py-3 placeholder-slate-400 focus:bg-white focus:border-blue-500 transition-colors"
                    />
                    <input
                      type="tel"
                      placeholder="Phone Number"
                      value={heroPhone}
                      onChange={(e) =>
                        setHeroPhone(formatPhone(e.target.value))
                      }
                      required
                      className="bg-slate-50 border border-slate-100 rounded-xl text-[13px] font-semibold text-slate-700 outline-none px-4 py-3 placeholder-slate-400 focus:bg-white focus:border-blue-500 transition-colors"
                    />
                  </div>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <select
                      value={heroState}
                      onChange={(e) => {
                        setHeroState(e.target.value);
                        setHeroZip("");
                      }}
                      required
                      className="bg-slate-50 border border-slate-100 rounded-xl text-[13px] font-semibold text-slate-700 outline-none px-4 py-3 appearance-none cursor-pointer focus:bg-white focus:border-blue-500 transition-colors"
                    >
                      <option value="">State</option>
                      {US_STATES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>

                    <div className="relative">
                      <input
                        type="text"
                        placeholder="ZIP Code"
                        value={heroZip}
                        onChange={(e) => {
                          const val = e.target.value
                            .replace(/\D/g, "")
                            .slice(0, 5);
                          setHeroZip(val);
                          if (zipcodes.length > 0) setShowZipSuggestions(true);
                        }}
                        onFocus={() => {
                          if (zipcodes.length > 0) setShowZipSuggestions(true);
                        }}
                        onBlur={() =>
                          setTimeout(() => setShowZipSuggestions(false), 200)
                        }
                        maxLength={5}
                        required
                        className="w-full bg-slate-50 border border-slate-100 rounded-xl text-[13px] font-semibold text-slate-700 outline-none px-4 py-3 placeholder-slate-400 focus:bg-white focus:border-blue-500 transition-colors"
                      />

                      {showZipSuggestions && zipcodes.length > 0 && (
                        <div className="absolute top-14 left-0 z-[100] w-full bg-white border border-slate-200 rounded-xl shadow-xl max-h-48 overflow-y-auto">
                          {zipcodes
                            .filter((z) => z.postal_code.startsWith(heroZip))
                            .map((z, i) => (
                              <div
                                key={`${z.postal_code}-${i}`}
                                className="px-4 py-2.5 hover:bg-slate-50 cursor-pointer text-[13px] text-slate-700 border-b last:border-0 border-slate-100 transition-colors"
                                onClick={() => {
                                  setHeroZip(z.postal_code);
                                  setShowZipSuggestions(false);
                                }}
                              >
                                <span className="font-bold text-slate-900">
                                  {z.postal_code}
                                </span>{" "}
                                -{" "}
                                <span className="text-slate-500">
                                  {z.city_name}
                                </span>
                              </div>
                            ))}
                        </div>
                      )}
                      {loadingZipcodes && (
                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                          <div className="w-3 h-3 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      )}
                    </div>

                    <div className="col-span-2 flex flex-wrap sm:flex-nowrap items-center gap-3">
                      <Captcha
                        code={captchaCode}
                        onRefresh={() => {
                          setCaptchaCode(generateCaptcha());
                          setCaptchaInput("");
                        }}
                      />
                      <input
                        type="text"
                        placeholder="Enter code"
                        value={captchaInput}
                        onChange={(e) =>
                          setCaptchaInput(
                            e.target.value.toUpperCase().slice(0, 4),
                          )
                        }
                        maxLength={4}
                        autoComplete="off"
                        required
                        className="flex-1 min-w-[80px] bg-slate-50 border border-slate-200 rounded-xl text-[14px] font-bold text-slate-700 outline-none px-4 py-3.5 placeholder-slate-400 focus:bg-white focus:border-blue-500 transition-colors tracking-widest uppercase text-center"
                      />
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                          captchaInput.length === 4
                            ? captchaInput.toUpperCase() === captchaCode
                              ? "bg-emerald-100 text-emerald-600"
                              : "bg-red-100 text-red-500"
                            : "bg-slate-100 text-slate-300"
                        }`}
                      >
                        {captchaInput.length === 4 ? (
                          captchaInput.toUpperCase() === captchaCode ? (
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={3}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          ) : (
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={3}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          )
                        ) : (
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2.5}
                              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                            />
                          </svg>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={heroSubmitting || !heroZip || heroZip.length < 5}
                    className="w-full mt-1 py-3 bg-emerald-500 text-white text-[15px] md:text-[16px] font-extrabold rounded-xl hover:bg-emerald-600 transition shadow-[0_8px_20px_rgb(16,185,129,0.25)] flex items-center justify-center disabled:opacity-60 disabled:shadow-none disabled:cursor-not-allowed"
                  >
                    {heroSubmitting ? "Sending..." : "✓ Find My Part Now"}
                  </button>
                </form>
              )}

              {heroError && (
                <div className="px-6 pb-3 text-red-500 text-[12px] font-semibold">
                  {heroError}
                </div>
              )}
            </div>

            {!heroSuccess && (
              <div className="flex items-center justify-center gap-2 mt-3 pb-4">
                <div
                  className={`h-1.5 rounded-full transition-all ${heroStep === 1 ? "w-8 bg-blue-600" : "w-4 bg-slate-200"}`}
                />
                <div
                  className={`h-1.5 rounded-full transition-all ${heroStep === 2 ? "w-8 bg-blue-600" : "w-4 bg-slate-200"}`}
                />
                <div
                  className={`h-1.5 rounded-full transition-all ${heroStep === 3 ? "w-8 bg-emerald-500" : "w-4 bg-slate-200"}`}
                />
              </div>
            )}
          </div>

          <div
            className="w-full max-w-3xl mt-4 animate-fade-in-up relative"
            style={{ animationDelay: "0.4s", zIndex: 50 }}
          >
            <div className="bg-white/80 backdrop-blur-2xl rounded-[2rem] p-5 shadow-[0_8px_32px_rgba(0,0,0,0.10)] border border-blue-100/60 relative">
              <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-b from-white/50 to-white/10 pointer-events-none"></div>
              <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.25em] mb-4 relative z-10 pl-2">
                {get(
                  "pincode_search",
                  "heading",
                  "Or Search Locally By Zip Code",
                )}
              </h3>
              <div className="relative" style={{ zIndex: 9999 }}>
                <PincodeSearch />
              </div>
            </div>
          </div>
        </div>

        <div
          className="w-full mt-8 lg:mt-10 mb-8 relative z-30 animate-fade-in-up"
          style={{ animationDelay: "0.6s" }}
        >
          <PromoBanner />
        </div>
      </div>

      {/* STICKY MOBILE CTA BAR (Shows when hero form scrolls out of view) */}
      {!formInView && (
        <div
          className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 shadow-[0_-8px_30px_rgba(0,0,0,0.12)] p-3 lg:hidden mobile-cta-bar"
          style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom, 0px))' }}
        >
          <button
            onClick={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="w-full bg-blue-600 text-white font-black text-[15px] py-3.5 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-transform"
          >
            Find My Part — Free Quote
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          </button>
        </div>
      )}
    </section>
  );
}
