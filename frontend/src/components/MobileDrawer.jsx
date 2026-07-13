import { Link } from 'react-router-dom';

export default function MobileDrawer({ isOpen, onClose, navLinks, isAuthenticated, user, handleLogout, onOpenLogin, onOpenSignup }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex">
            {/* Overlay */}
            <div 
                className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" 
                onClick={onClose}
            />

            {/* Drawer */}
            <div className="relative ml-auto w-full max-w-sm h-full bg-white shadow-2xl flex flex-col animate-slide-left">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-100">
                    <Link to="/" onClick={onClose} className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none">
                                <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                                <path d="M2 17l10 5 10-5" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                                <path d="M2 12l10 5 10-5" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <span className="text-xl font-bold text-slate-900 tracking-tight">JYNM</span>
                    </Link>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Navigation Links */}
                <div className="flex-1 overflow-y-auto py-6 px-6 space-y-1">
                    {navLinks.map((link) => (
                        <Link
                            key={link.path}
                            to={link.path}
                            onClick={onClose}
                            className="flex items-center gap-4 py-3 text-sm font-semibold text-slate-700 hover:text-blue-600 transition-colors"
                        >
                            <span className="w-5 flex justify-center text-slate-400">
                                {link.path === '/' && <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" /></svg>}
                                {link.path === '/junkyards' && <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" /></svg>}
                                {link.path === '/junkyards-by-location' && <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" /></svg>}
                                {link.path === '/blog' && <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M2 5a2 2 0 012-2h8a2 2 0 012 2v10a2 2 0 002 2H4a2 2 0 01-2-2V5zm3 1h6v2H5V6zm6 3H5v2h6V9z" clipRule="evenodd" /></svg>}
                                {link.path === '/about' && <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>}
                                {link.path === '/contact' && <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" /></svg>}
                                {(!['/', '/junkyards', '/junkyards-by-location', '/blog', '/about', '/contact'].includes(link.path)) && <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>}
                            </span>
                            {link.label}
                        </Link>
                    ))}

                    <div className="my-6 border-t border-slate-100" />

                    {/* Auth & Actions */}
                    <div className="space-y-3">
                        {isAuthenticated ? (
                            <>
                                <div className="p-3 bg-slate-50 rounded-xl mb-4">
                                    <p className="text-sm font-semibold text-slate-900">{user?.first_name} {user?.last_name}</p>
                                    <p className="text-xs text-slate-500">{user?.email}</p>
                                </div>
                                <button
                                    onClick={() => { handleLogout(); onClose(); }}
                                    className="w-full py-3 rounded-xl text-sm font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-colors"
                                >
                                    Log Out
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    onClick={() => { onClose(); onOpenLogin(); }}
                                    className="w-full py-3 rounded-xl text-sm font-bold text-blue-600 bg-white border border-blue-100 hover:bg-blue-50 transition-colors shadow-sm"
                                >
                                    Sign In
                                </button>
                                <Link
                                    to="/add-a-yard"
                                    onClick={onClose}
                                    className="block w-full py-3 rounded-xl text-sm font-bold text-center text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-md shadow-blue-600/20"
                                >
                                    Add A Yard
                                </Link>
                                <Link
                                    to="/admin/login"
                                    onClick={onClose}
                                    className="block w-full py-2.5 rounded-xl text-xs font-semibold text-center text-slate-500 bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-colors"
                                >
                                    ⚙️ Admin Login
                                </Link>
                            </>
                        )}
                    </div>
                </div>

                {/* Bottom Icon Dock */}
                <div className="mt-auto grid grid-cols-3 gap-2 px-6 py-4 border-t border-slate-100 bg-slate-50/50">
                    <a href="tel:18005551234" className="flex flex-col items-center gap-1.5 text-slate-500 hover:text-blue-600 transition-colors">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                        <span className="text-[10px] font-medium tracking-wide">Call Us</span>
                    </a>
                    <a href="https://wa.me/18005551234" className="flex flex-col items-center gap-1.5 text-slate-500 hover:text-green-600 transition-colors">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.711.927 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.274.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.099.824z"/></svg>
                        <span className="text-[10px] font-medium tracking-wide">WhatsApp</span>
                    </a>
                    <Link to="/search" onClick={onClose} className="flex flex-col items-center gap-1.5 text-slate-500 hover:text-blue-600 transition-colors">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        <span className="text-[10px] font-medium tracking-wide">Search</span>
                    </Link>
                </div>
            </div>
            <style>{`
                @keyframes slideLeft { from { transform: translateX(100%); } to { transform: translateX(0); } }
                .animate-slide-left { animation: slideLeft 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
            `}</style>
        </div>
    );
}
