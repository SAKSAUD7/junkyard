import React from 'react';
import { ClipboardDocumentIcon, CheckIcon } from '@heroicons/react/24/outline';
import { useClipboard } from '../../hooks/useClipboard';

/**
 * Reusable CopyButton component
 * 
 * @param {string} value - The text to copy
 * @param {function} onCopy - Optional callback triggered after successful copy
 * @param {string} className - Optional Tailwind classes to merge
 * @param {string} label - Optional explicit text label next to the icon
 * @param {string} title - Optional title attribute for the button (default: "Copy to clipboard")
 */
export default function CopyButton({ 
    value, 
    onCopy, 
    className = '', 
    label = '',
    title = 'Copy to clipboard'
}) {
    const { copied, copyToClipboard } = useClipboard();

    const handleCopy = (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        copyToClipboard(value);
        if (onCopy) onCopy(value);
    };

    return (
        <button
            onClick={handleCopy}
            className={`inline-flex items-center justify-center gap-1.5 transition-all outline-none focus:ring-2 focus:ring-blue-500 rounded-md ${
                copied 
                    ? 'text-emerald-600 bg-emerald-50 border-emerald-200' 
                    : 'text-slate-500 hover:text-blue-600 hover:bg-slate-50'
            } ${className}`}
            title={copied ? 'Copied!' : title}
            aria-label={copied ? 'Copied to clipboard' : title}
        >
            {copied ? (
                <>
                    <CheckIcon className="h-4 w-4" />
                    {label && <span className="text-xs font-semibold">Copied</span>}
                </>
            ) : (
                <>
                    <ClipboardDocumentIcon className="h-4 w-4" />
                    {label && <span className="text-xs font-semibold">{label || 'Copy'}</span>}
                </>
            )}
        </button>
    );
}
