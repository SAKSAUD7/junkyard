import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../services/api';

/**
 * Reusable Post-Submission Feedback Component for JYNM Forms (Phase 3)
 * @param {string}   title       - Headline (e.g. "Quote Request Sent!")
 * @param {string}   message     - Main description
 * @param {string}   referenceId - Optional submission ID or reference number
 * @param {string}   actionText  - Text for the primary button
 * @param {Function} onAction    - Primary action callback
 * @param {ReactNode} extra      - Any extra children to render (like a secondary button)
 */
export default function PostSubmissionFeedback({
    title = 'Success!',
    message = 'Your submission has been received.',
    referenceId,
    actionText = 'Done',
    onAction,
    extra,
}) {
    // Feedback Logic
    const [showFeedback, setShowFeedback] = useState(false);
    const [rating, setRating] = useState(0);
    const [feedbackText, setFeedbackText] = useState('');
    const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
    const [submittingFeedback, setSubmittingFeedback] = useState(false);

    useEffect(() => {
        // If there's a reference ID, check if we've already asked for feedback for this specific submission
        if (referenceId) {
            const hasShown = localStorage.getItem(`feedback_shown_${referenceId}`);
            if (!hasShown) {
                setShowFeedback(true);
            }
        }
    }, [referenceId]);

    const handleFeedbackSubmit = async (e) => {
        if (e && e.preventDefault) e.preventDefault();
        
        if (rating === 0) return; // Require at least a star rating
        
        setSubmittingFeedback(true);
        try {
            // Send feedback anonymously or with submission context
            await fetch(`${import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : 'http://localhost:8000')}/api/common/feedback/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    topic: 'post_submission',
                    description: `Rating: ${rating} Stars\nMessage: ${feedbackText}\nRef: ${referenceId}`
                })
            });
        } catch (error) {
            console.error('Error submitting feedback', error);
        } finally {
            // Mark as submitted locally even if API fails to prevent nagging
            setSubmittingFeedback(false);
            setFeedbackSubmitted(true);
            if (referenceId) {
                localStorage.setItem(`feedback_shown_${referenceId}`, 'true');
            }
            setTimeout(() => {
                setShowFeedback(false);
            }, 3000);
        }
    };

    const handleSkipFeedback = () => {
        if (referenceId) {
            localStorage.setItem(`feedback_shown_${referenceId}`, 'true');
        }
        setShowFeedback(false);
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center justify-center py-10 px-6 text-center bg-white rounded-3xl border border-slate-100 shadow-[0_8px_40px_rgb(0,0,0,0.04)]"
        >
            <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-6 shadow-sm border border-emerald-100">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
            </div>
            
            <h2 className="text-2xl font-black text-slate-900 mb-3" style={{ fontFamily: "'Outfit', sans-serif" }}>
                {title}
            </h2>
            
            <p className="text-slate-500 font-medium text-[15px] max-w-sm mb-6 leading-relaxed">
                {message}
            </p>

            {referenceId && (
                <div className="bg-slate-50 border border-slate-100 rounded-xl px-5 py-3 mb-8">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
                        Reference Number
                    </span>
                    <span className="font-mono text-slate-700 font-bold tracking-wider">
                        {referenceId}
                    </span>
                </div>
            )}

            <AnimatePresence>
                {showFeedback && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="w-full max-w-sm bg-blue-50/50 border border-blue-100 p-5 rounded-2xl mb-8 overflow-hidden"
                    >
                        {feedbackSubmitted ? (
                            <div className="text-green-600 font-bold flex items-center justify-center gap-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                Thank you for your feedback!
                            </div>
                        ) : (
                            <form onSubmit={handleFeedbackSubmit} className="flex flex-col text-left">
                                <h4 className="text-slate-800 font-bold text-sm mb-3 text-center">How was your experience?</h4>
                                
                                <div className="flex justify-center gap-2 mb-4">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setRating(star)}
                                            className={`transition-all ${star <= rating ? 'text-yellow-400 scale-110' : 'text-slate-300 hover:text-yellow-200'}`}
                                        >
                                            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                            </svg>
                                        </button>
                                    ))}
                                </div>

                                {rating > 0 && (
                                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                                        <textarea
                                            value={feedbackText}
                                            onChange={(e) => setFeedbackText(e.target.value)}
                                            placeholder="Optional comments..."
                                            className="w-full text-sm p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-100 bg-white resize-none h-20 mb-3"
                                        />
                                        <div className="flex gap-2">
                                            <button 
                                                type="button"
                                                onClick={handleSkipFeedback}
                                                className="flex-1 py-2 rounded-lg text-[13px] font-bold text-slate-500 hover:bg-slate-100 transition-colors"
                                            >
                                                Skip
                                            </button>
                                            <button 
                                                type="submit"
                                                disabled={submittingFeedback}
                                                className="flex-1 py-2 rounded-lg text-[13px] font-bold bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-70"
                                            >
                                                {submittingFeedback ? 'Sending...' : 'Submit'}
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </form>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="flex flex-col gap-3 w-full max-w-[240px]">
                {onAction && (
                    <button
                        onClick={onAction}
                        className="w-full bg-slate-900 hover:bg-black text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-[0_4px_14px_rgba(0,0,0,0.15)] hover:-translate-y-0.5 active:translate-y-0 text-[14px]"
                    >
                        {actionText}
                    </button>
                )}
                {extra}
            </div>
        </motion.div>
    );
}
