// JYNMSelect — Shared custom dropdown for JYNM platform (Phase 6)
// Features: search, keyboard navigation, scrollable, mobile-friendly, accessible
import { useState, useRef, useEffect, useId } from 'react';

/**
 * @param {string}   id          - HTML id (optional; auto-generated if not provided)
 * @param {string}   label       - Floating label text
 * @param {string}   placeholder - Shown when no value selected
 * @param {Array}    options     - [{ value, label }] or string[]
 * @param {*}        value       - Current selected value
 * @param {Function} onChange    - (value) => void
 * @param {boolean}  searchable  - Show search box inside dropdown
 * @param {boolean}  disabled    - Disable the control
 * @param {string}   className   - Extra classes for the wrapper
 */
export default function JYNMSelect({
    id: propId,
    label,
    placeholder = 'Select…',
    options = [],
    value,
    onChange,
    searchable = true,
    disabled = false,
    className = '',
    required = false,
}) {
    const autoId = useId();
    const id = propId || autoId;

    const [open, setOpen]       = useState(false);
    const [search, setSearch]   = useState('');
    const [focusIdx, setFocusIdx] = useState(-1);

    const wrapperRef  = useRef(null);
    const searchRef   = useRef(null);
    const listRef     = useRef(null);

    // Normalize to [{value, label}]
    const normalized = options.map(o =>
        typeof o === 'string' ? { value: o, label: o } : o
    );

    const filtered = search.trim()
        ? normalized.filter(o => o.label.toLowerCase().includes(search.toLowerCase()))
        : normalized;

    const selected = normalized.find(o => o.value === value);

    // Close on outside click
    useEffect(() => {
        if (!open) return;
        const handleClick = (e) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
                setOpen(false);
                setSearch('');
                setFocusIdx(-1);
            }
        };
        document.addEventListener('mousedown', handleClick);
        document.addEventListener('touchstart', handleClick);
        return () => {
            document.removeEventListener('mousedown', handleClick);
            document.removeEventListener('touchstart', handleClick);
        };
    }, [open]);

    // Focus search when open
    useEffect(() => {
        if (open && searchable && searchRef.current) {
            searchRef.current.focus();
        }
        if (!open) {
            setSearch('');
            setFocusIdx(-1);
        }
    }, [open, searchable]);

    // Scroll focused item into view
    useEffect(() => {
        if (focusIdx >= 0 && listRef.current) {
            const item = listRef.current.children[focusIdx];
            item?.scrollIntoView({ block: 'nearest' });
        }
    }, [focusIdx]);

    const handleKeyDown = (e) => {
        if (!open) {
            if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
                e.preventDefault();
                setOpen(true);
            }
            return;
        }
        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setFocusIdx(i => Math.min(i + 1, filtered.length - 1));
                break;
            case 'ArrowUp':
                e.preventDefault();
                setFocusIdx(i => Math.max(i - 1, 0));
                break;
            case 'Enter':
                e.preventDefault();
                if (focusIdx >= 0 && filtered[focusIdx]) {
                    select(filtered[focusIdx].value);
                }
                break;
            case 'Escape':
            case 'Tab':
                setOpen(false);
                break;
            default:
                break;
        }
    };

    const select = (val) => {
        onChange(val);
        setOpen(false);
        setSearch('');
        setFocusIdx(-1);
    };

    return (
        <div ref={wrapperRef} className={`relative ${className}`} onKeyDown={handleKeyDown}>
            {label && (
                <label
                    htmlFor={id}
                    className="block text-[11px] font-black uppercase tracking-[0.1em] text-slate-500 mb-1.5"
                >
                    {label}{required && <span className="text-rose-500 ml-0.5">*</span>}
                </label>
            )}

            {/* Trigger */}
            <button
                id={id}
                type="button"
                role="combobox"
                aria-haspopup="listbox"
                aria-expanded={open}
                aria-controls={`${id}-listbox`}
                disabled={disabled}
                onClick={() => !disabled && setOpen(v => !v)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 text-left text-[14px] font-medium transition-all bg-white cursor-pointer
                    ${open
                        ? 'border-blue-600 ring-2 ring-blue-100 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300'
                    }
                    ${disabled ? 'opacity-50 pointer-events-none bg-slate-50' : ''}
                    ${selected ? 'text-slate-900' : 'text-slate-400'}
                `}
            >
                <span className="truncate">{selected ? selected.label : placeholder}</span>
                <svg
                    className={`w-5 h-5 text-slate-400 flex-shrink-0 ml-2 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
                >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {/* Dropdown */}
            {open && (
                <div
                    id={`${id}-listbox`}
                    role="listbox"
                    aria-label={label || placeholder}
                    className="absolute z-[500] left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] overflow-hidden"
                    style={{ maxHeight: '260px', display: 'flex', flexDirection: 'column' }}
                >
                    {/* Search */}
                    {searchable && (
                        <div className="px-3 pt-2.5 pb-1.5 border-b border-slate-100 flex-shrink-0">
                            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
                                <svg className="w-4 h-4 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                <input
                                    ref={searchRef}
                                    value={search}
                                    onChange={e => { setSearch(e.target.value); setFocusIdx(0); }}
                                    placeholder={`Search ${label || ''}…`}
                                    className="flex-1 bg-transparent text-[13px] text-slate-800 font-medium placeholder-slate-400 outline-none"
                                    aria-label={`Search ${label || ''}`}
                                />
                                {search && (
                                    <button type="button" onClick={() => { setSearch(''); searchRef.current?.focus(); }} className="text-slate-400 hover:text-slate-600">
                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Options list */}
                    <ul
                        ref={listRef}
                        className="overflow-y-auto overscroll-contain py-1.5"
                        style={{ maxHeight: searchable ? '200px' : '240px', WebkitOverflowScrolling: 'touch' }}
                    >
                        {filtered.length === 0 ? (
                            <li className="px-4 py-3 text-[13px] text-slate-400 font-medium text-center">No results</li>
                        ) : (
                            filtered.map((opt, i) => {
                                const isSelected  = opt.value === value;
                                const isFocused   = i === focusIdx;
                                return (
                                    <li
                                        key={opt.value}
                                        role="option"
                                        aria-selected={isSelected}
                                        onClick={() => select(opt.value)}
                                        onMouseEnter={() => setFocusIdx(i)}
                                        className={`flex items-center justify-between px-4 py-2.5 text-[14px] font-medium cursor-pointer transition-colors
                                            ${isSelected ? 'bg-blue-50 text-blue-700 font-semibold' : isFocused ? 'bg-slate-50 text-slate-900' : 'text-slate-700 hover:bg-slate-50'}
                                        `}
                                    >
                                        {opt.label}
                                        {isSelected && (
                                            <svg className="w-4 h-4 text-blue-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                            </svg>
                                        )}
                                    </li>
                                );
                            })
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
}
