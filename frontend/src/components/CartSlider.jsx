import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';

/**
 * Cart Slider Drawer
 * Slide-in panel showing quote-request cart items with remove and clear-all functionality.
 */

function PartIcon() {
    return (
        <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2 1h7l1-1zM13 16h4l3-6H9" />
        </svg>
    );
}

function timeAgo(dateStr) {
    if (!dateStr) return '';
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function CartSlider({ isOpen, onClose, isAuthenticated, onOpenLogin }) {
    const { cartItems, removeFromCart, clearCart, cartCount } = useCart();

    return (
        <AnimatePresence>
            {isOpen && (
                <React.Fragment>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[9998]"
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 28, stiffness: 220 }}
                        className="fixed top-0 right-0 bottom-0 w-full max-w-[420px] bg-white z-[9999] flex flex-col border-l border-slate-200 shadow-2xl"
                    >
                        {/* Header */}
                        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-blue-50/40">
                            <div className="flex items-center gap-2.5">
                                <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/25">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <h2 className="text-[13px] font-black text-slate-800 uppercase tracking-widest leading-none">My Quotes</h2>
                                    <p className="text-[11px] text-slate-400 font-bold mt-0.5">{cartCount} request{cartCount !== 1 ? 's' : ''}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {isAuthenticated && cartItems.length > 0 && (
                                    <button
                                        onClick={clearCart}
                                        className="text-[11px] font-bold text-slate-500 hover:text-rose-600 uppercase tracking-wider px-2 py-1 rounded-lg hover:bg-rose-50 transition-colors"
                                        title="Discard all"
                                    >
                                        Discard All
                                    </button>
                                )}
                                <button
                                    onClick={onClose}
                                    className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors shadow-sm"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>
                        </div>

                        {/* Body */}
                        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
                            {!isAuthenticated ? (
                                /* Guest state */
                                <div className="flex flex-col items-center justify-center h-full text-center px-6 py-16">
                                    <div className="w-20 h-20 rounded-3xl bg-slate-100 border border-slate-200 flex items-center justify-center mb-6">
                                        <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-lg font-black text-slate-900 mb-2">Sign in to view your cart</h3>
                                    <p className="text-[13px] text-slate-500 font-medium mb-6 leading-relaxed">
                                        Save your quote requests and get faster responses from verified junkyards nationwide.
                                    </p>
                                    <button
                                        onClick={() => { onClose(); onOpenLogin?.(); }}
                                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md shadow-blue-500/25 transition-all hover:-translate-y-0.5"
                                    >
                                        Sign In to Continue
                                    </button>
                                </div>
                            ) : cartItems.length === 0 ? (
                                /* Empty state */
                                <div className="flex flex-col items-center justify-center h-full text-center px-6 py-16">
                                    <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-blue-50 to-indigo-100 border border-blue-200 flex items-center justify-center mb-6">
                                        <svg className="w-12 h-12 text-blue-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-lg font-black text-slate-900 mb-2">Your cart is empty</h3>
                                    <p className="text-[13px] text-slate-500 font-medium mb-6 leading-relaxed max-w-xs">
                                        When you request a quote from a junkyard, it will appear here so you can track all your requests.
                                    </p>
                                    <Link
                                        to="/junkyards"
                                        onClick={onClose}
                                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md shadow-blue-500/20 transition-all hover:-translate-y-0.5"
                                    >
                                        Browse Junkyards
                                    </Link>
                                </div>
                            ) : (
                                /* Cart items */
                                cartItems.map((item) => (
                                    <div
                                        key={item.id}
                                        className="relative flex items-start gap-3 p-4 bg-white border border-slate-100 rounded-xl shadow-sm hover:border-blue-100 transition-colors group"
                                    >
                                        {/* Part icon */}
                                        <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center flex-shrink-0">
                                            <PartIcon />
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0 pr-7">
                                            <p className="text-[13px] font-extrabold text-slate-900 truncate">
                                                {item.part_name || item.partName || 'Auto Part'}
                                            </p>
                                            {(item.year || item.make || item.model) && (
                                                <p className="text-[11px] text-slate-500 font-semibold mt-0.5 truncate">
                                                    {[item.year, item.make, item.model].filter(Boolean).join(' ')}
                                                </p>
                                            )}
                                            {item.location && (
                                                <p className="text-[11px] text-slate-400 mt-0.5 truncate">📍 {item.location}</p>
                                            )}
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1.5">
                                                {timeAgo(item.addedAt)}
                                            </p>
                                        </div>

                                        {/* Remove button */}
                                        <button
                                            onClick={() => removeFromCart(item.id)}
                                            className="absolute top-3 right-3 w-6 h-6 rounded-full bg-slate-100 hover:bg-rose-100 text-slate-400 hover:text-rose-600 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                                            title="Remove from cart"
                                        >
                                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Footer */}
                        {isAuthenticated && cartItems.length > 0 && (
                            <div className="px-4 py-4 border-t border-slate-100 bg-slate-50">
                                <Link
                                    to="/quotes"
                                    onClick={onClose}
                                    className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md shadow-blue-500/25 transition-all"
                                >
                                    View Full Cart
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
                                </Link>
                            </div>
                        )}

                        {!isAuthenticated || cartItems.length === 0 ? (
                            <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/80 text-center">
                                <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">
                                    JYNM — Find parts from 5,000+ verified junkyards
                                </span>
                            </div>
                        ) : null}
                    </motion.div>
                </React.Fragment>
            )}
        </AnimatePresence>
    );
}
