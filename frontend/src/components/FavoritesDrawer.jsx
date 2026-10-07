import { Link } from 'react-router-dom';
import { useFavorites } from '../contexts/FavoritesContext';

export default function FavoritesDrawer({ isOpen, onClose }) {
    const { favorites, removeFavorite } = useFavorites();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex" role="dialog" aria-modal="true" aria-label="Favorites list">
            {/* Overlay */}
            <div
                className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity no-bounce"
                onClick={onClose}
            />

            {/* Drawer */}
            <div className="relative ml-auto w-full max-w-md h-full bg-slate-50 shadow-2xl flex flex-col animate-slide-left touch-scroll"
                style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
                
                {/* Header */}
                <div className="flex items-center justify-between px-6 bg-white border-b border-slate-100"
                    style={{ paddingTop: 'max(1.5rem, env(safe-area-inset-top, 1.5rem))', paddingBottom: '1.25rem' }}>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center border border-rose-100">
                            <svg className="w-5 h-5 text-rose-500" fill="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M11.998 21.054c-1.166 0-3.235-1.025-5.999-3.415-3.04-2.628-4.999-5.59-4.999-8.497C1 5.318 3.931 3 7.067 3c1.782 0 3.393.906 4.931 2.505C13.536 3.906 15.147 3 16.929 3 20.066 3 23 5.318 23 9.142c0 2.906-1.958 5.868-4.999 8.496-2.763 2.39-4.832 3.416-6.003 3.416z" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-slate-900 tracking-tight leading-none" style={{ fontFamily: "'Outfit', sans-serif" }}>My Favorites</h2>
                            <p className="text-[11px] font-bold text-slate-400 mt-1 uppercase tracking-widest">{favorites.length} Saved {favorites.length === 1 ? 'Yard' : 'Yards'}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors touch-target"
                        aria-label="Close menu"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* List Body */}
                <div className="flex-1 overflow-y-auto p-4 touch-scroll">
                    {favorites.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center px-6">
                            <div className="w-20 h-20 rounded-full bg-rose-50 flex items-center justify-center mb-4">
                                <svg className="w-10 h-10 text-rose-200" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M11.998 21.054c-1.166 0-3.235-1.025-5.999-3.415-3.04-2.628-4.999-5.59-4.999-8.497C1 5.318 3.931 3 7.067 3c1.782 0 3.393.906 4.931 2.505C13.536 3.906 15.147 3 16.929 3 20.066 3 23 5.318 23 9.142c0 2.906-1.958 5.868-4.999 8.496-2.763 2.39-4.832 3.416-6.003 3.416z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-2">No favorites yet</h3>
                            <p className="text-[13px] text-slate-500 font-medium">When you find a junkyard you like, click the heart icon to save it here for quick access later.</p>
                            <Link to="/junkyards-by-location" onClick={onClose} className="mt-6 px-6 py-3 bg-white border border-slate-200 shadow-sm text-[13px] font-bold text-blue-600 rounded-xl hover:bg-slate-50 transition-colors">
                                Browse Yards
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {favorites.map((yard) => (
                                <div key={yard.id} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-[0_2px_10px_rgb(0,0,0,0.02)] flex items-start gap-4 hover:border-blue-200 transition-colors">
                                    {/* Thumbnail */}
                                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-100">
                                        <img 
                                            src={yard.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(yard.business_name)}&background=0D8ABC&color=fff&size=128`} 
                                            alt={yard.business_name} 
                                            className="w-full h-full object-cover"
                                            onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(yard.business_name)}&background=0D8ABC&color=fff` }}
                                        />
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0 pt-0.5">
                                        <Link to={`/junkyard/${yard.slug}`} onClick={onClose} className="block group">
                                            <h3 className="text-[15px] font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors leading-tight mb-1">
                                                {yard.business_name}
                                            </h3>
                                        </Link>
                                        <div className="text-[12px] text-slate-500 font-medium truncate mb-2">
                                            {yard.city}, {yard.state}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <a href={`tel:${yard.contact_phone}`} className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 text-blue-600 border border-blue-100 hover:bg-blue-100 transition-colors" title="Call">
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                            </a>
                                            <button onClick={() => removeFavorite(yard.id)} className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-slate-50 text-slate-400 border border-slate-200 hover:bg-rose-50 hover:text-rose-500 hover:border-rose-100 transition-colors ml-auto" title="Remove from favorites">
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer Action */}
                {favorites.length > 0 && (
                    <div className="p-4 bg-white border-t border-slate-100">
                        <Link to="/quote" onClick={onClose} className="w-full flex items-center justify-center gap-2 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[14px] font-bold transition-colors shadow-[0_4px_14px_rgba(37,99,235,0.25)]">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                            Request Multi-Yard Quote
                        </Link>
                    </div>
                )}
            </div>

            <style>{`
                @keyframes slideLeft { from { transform: translateX(100%); } to { transform: translateX(0); } }
                .animate-slide-left { animation: slideLeft 0.28s cubic-bezier(0.16, 1, 0.3, 1) forwards; will-change: transform; }
            `}</style>
        </div>
    );
}
