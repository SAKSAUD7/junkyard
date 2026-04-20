import React from 'react';
import { motion } from 'framer-motion';

/**
 * Shared Skeleton Loader for generic cards
 */
export const CardSkeleton = () => (
    <div className="vendor-glass-card p-6 animate-pulse">
        <div className="h-6 bg-slate-200 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
            <div className="h-4 bg-slate-200 rounded w-3/4"></div>
            <div className="h-4 bg-slate-200 rounded w-1/2"></div>
            <div className="h-4 bg-slate-200 rounded w-5/6"></div>
        </div>
    </div>
);

/**
 * Premium Empty State Visual
 */
export const EmptyState = ({ title, description, actionText, onAction, icon }) => (
    <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center p-12 text-center vendor-glass-card w-full"
    >
        <div className="w-16 h-16 mb-4 text-slate-300">
            {icon || (
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
            )}
        </div>
        <h3 className="text-xl font-semibold text-slate-800 mb-2">{title}</h3>
        <p className="text-slate-500 mb-6 max-w-md">{description}</p>
        {actionText && onAction && (
            <button 
                onClick={onAction}
                className="vendor-btn vendor-btn-primary px-6 py-2"
            >
                {actionText}
            </button>
        )}
    </motion.div>
);

/**
 * Animated Button with built-in loading spinner
 */
export const LoadingButton = ({ isLoading, disabled, children, className = '', ...props }) => {
    return (
        <button 
            disabled={isLoading || disabled}
            className={`vendor-btn relative disabled:opacity-70 disabled:cursor-not-allowed ${className}`}
            {...props}
        >
            <span className={isLoading ? 'opacity-0' : 'opacity-100'}>{children}</span>
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                </div>
            )}
        </button>
    );
};
