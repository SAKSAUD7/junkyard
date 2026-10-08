// FloatingActionButtons — compact speed-dial FAB per JYNM Phase 9 spec
// - Single circular + button, expands to show Call / WhatsApp / Feedback
// - Fixed bottom-right, never covers mobile bottom nav or form fields
// - Glassmorphism pill labels, keyboard accessible, closes on outside click
import { useState, useEffect, useRef } from 'react';

const PHONE_NUMBER = '+18662933731';
const WHATSAPP_NUMBER = '+18662933731';

const WhatsAppIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5" aria-hidden="true">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.487" />
    </svg>
);

const PhoneIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
    </svg>
);

const FeedbackIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
    </svg>
);

const ACTIONS = [
    {
        id: 'call',
        label: 'Call Us',
        icon: <PhoneIcon />,
        href: `tel:${PHONE_NUMBER}`,
        color: 'bg-blue-600 hover:bg-blue-700',
        shadow: 'shadow-blue-500/40',
        external: false,
    },
    {
        id: 'whatsapp',
        label: 'WhatsApp',
        icon: <WhatsAppIcon />,
        href: `https://wa.me/${WHATSAPP_NUMBER.replace('+', '')}?text=Hi!%20I%20need%20a%20used%20auto%20part.`,
        color: 'bg-green-500 hover:bg-green-600',
        shadow: 'shadow-green-500/40',
        external: true,
    },
    {
        id: 'feedback',
        label: 'Feedback',
        icon: <FeedbackIcon />,
        href: '/contact',
        color: 'bg-violet-600 hover:bg-violet-700',
        shadow: 'shadow-violet-500/40',
        external: false,
    },
];

export default function FloatingActionButtons({ onFeedbackClick }) {
    const [open, setOpen] = useState(false);
    const fabRef = useRef(null);

    // Close on outside click
    useEffect(() => {
        if (!open) return;
        const handleClick = (e) => {
            if (fabRef.current && !fabRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClick);
        document.addEventListener('touchstart', handleClick);
        return () => {
            document.removeEventListener('mousedown', handleClick);
            document.removeEventListener('touchstart', handleClick);
        };
    }, [open]);

    // Keyboard: close on Escape
    useEffect(() => {
        const handleKey = (e) => { if (e.key === 'Escape') setOpen(false); };
        document.addEventListener('keydown', handleKey);
        return () => document.removeEventListener('keydown', handleKey);
    }, []);

    const handleActionClick = (action) => {
        if (action.id === 'feedback' && onFeedbackClick) {
            onFeedbackClick();
        }
        setOpen(false);
    };

    return (
        // bottom-20 on mobile to avoid the bottom navigation; bottom-6 on md+
        <div
            ref={fabRef}
            className="fixed bottom-20 md:bottom-6 right-4 md:right-5 z-40 flex flex-col items-end gap-2"
            role="complementary"
            aria-label="Quick contact options"
        >
            {/* Expanded action items */}
            {ACTIONS.map((action, i) => {
                const delay = open ? `${i * 55}ms` : `${(ACTIONS.length - 1 - i) * 40}ms`;
                return (
                    <div
                        key={action.id}
                        className="flex items-center gap-2.5"
                        style={{
                            transition: `opacity 0.22s ease ${delay}, transform 0.28s cubic-bezier(0.16,1,0.3,1) ${delay}`,
                            opacity: open ? 1 : 0,
                            transform: open ? 'translateY(0) scale(1)' : 'translateY(12px) scale(0.8)',
                            pointerEvents: open ? 'auto' : 'none',
                        }}
                    >
                        {/* Glassmorphism label pill */}
                        <span className="bg-slate-900/75 backdrop-blur-sm text-white text-[11px] font-bold px-3 py-1.5 rounded-full shadow-lg whitespace-nowrap border border-white/10">
                            {action.label}
                        </span>

                        {/* Action button */}
                        {action.id === 'feedback' && onFeedbackClick ? (
                            <button
                                onClick={() => handleActionClick(action)}
                                aria-label={action.label}
                                className={`w-11 h-11 rounded-full text-white flex items-center justify-center shadow-lg ${action.shadow} ${action.color} transition-all duration-150 hover:scale-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500`}
                            >
                                {action.icon}
                            </button>
                        ) : (
                            <a
                                href={action.href}
                                target={action.external ? '_blank' : undefined}
                                rel={action.external ? 'noopener noreferrer' : undefined}
                                onClick={() => setOpen(false)}
                                aria-label={action.label}
                                className={`w-11 h-11 rounded-full text-white flex items-center justify-center shadow-lg ${action.shadow} ${action.color} transition-all duration-150 hover:scale-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                            >
                                {action.icon}
                            </a>
                        )}
                    </div>
                );
            })}

            {/* Main FAB trigger */}
            <button
                onClick={() => setOpen(v => !v)}
                aria-label={open ? 'Close contact options' : 'Open contact options'}
                aria-expanded={open}
                aria-controls="fab-actions"
                className="w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shadow-[0_8px_28px_rgba(37,99,235,0.45)] transition-all duration-300 active:scale-95 ring-4 ring-white/10 focus:outline-none focus:ring-blue-400"
                style={{
                    transform: open ? 'rotate(45deg)' : 'rotate(0deg)',
                    transition: 'transform 0.25s cubic-bezier(0.16,1,0.3,1), box-shadow 0.2s ease',
                }}
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
            </button>
        </div>
    );
}
