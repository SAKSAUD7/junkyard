import { useState, useCallback } from 'react';

/**
 * Hook for safely writing to clipboard with feedback
 *
 * @param {number} resetTimeout - How long to show the "copied" state (ms)
 * @returns {Object} { copied, copyToClipboard }
 */
export function useClipboard(resetTimeout = 2000) {
    const [copied, setCopied] = useState(false);

    const copyToClipboard = useCallback((text) => {
        if (!text) return;

        // Try using the modern clipboard API
        if (navigator?.clipboard?.writeText) {
            navigator.clipboard
                .writeText(text)
                .then(() => {
                    setCopied(true);
                    setTimeout(() => setCopied(false), resetTimeout);
                })
                .catch((err) => {
                    console.error('Failed to copy to clipboard', err);
                });
        }
        // Fallback for older browsers or insecure contexts
        else {
            try {
                const textArea = document.createElement('textarea');
                textArea.value = text;

                // Avoid scrolling to bottom
                textArea.style.top = '0';
                textArea.style.left = '0';
                textArea.style.position = 'fixed';

                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();

                const successful = document.execCommand('copy');
                if (successful) {
                    setCopied(true);
                    setTimeout(() => setCopied(false), resetTimeout);
                }
                document.body.removeChild(textArea);
            } catch (err) {
                console.error('Fallback clipboard copy failed', err);
            }
        }
    }, [resetTimeout]);

    return { copied, copyToClipboard };
}
