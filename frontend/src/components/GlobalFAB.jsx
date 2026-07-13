import { useState } from 'react';
import { useLocation } from 'react-router-dom';

// ─── Route exclusion list ─────────────────────────────────────
const EXCLUDED_PREFIXES = [
    '/admin-portal',
    '/admin',
    '/vendor',
    '/signin',
    '/signup',
    '/forgot-password',
];

const PHONE_NUMBER   = '+18662933731';
const WHATSAPP_NUMBER = '+18662933731';

// Icons
const PhoneIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
    </svg>
);

const WhatsAppIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.487" />
    </svg>
);

const ChatIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M12 2C6.477 2 2 5.582 2 10c0 2.476 1.34 4.686 3.425 6.13-.19.896-.706 2.378-1.572 3.25 1.764.12 3.992-.477 5.753-1.636.757.215 1.564.336 2.394.336 5.523 0 10-3.582 10-8s-4.477-8-10-8z" />
        <circle cx="8" cy="10" r="1.5" fill="white" />
        <circle cx="12" cy="10" r="1.5" fill="white" />
        <circle cx="16" cy="10" r="1.5" fill="white" />
    </svg>
);

const ACTIONS = [
    {
        id: 'call',
        label: 'Call Us',
        icon: <PhoneIcon />,
        href: `tel:${PHONE_NUMBER}`,
        bg: '#10b981',
        external: false,
    },
    {
        id: 'whatsapp',
        label: 'WhatsApp',
        icon: <WhatsAppIcon />,
        href: `https://wa.me/${WHATSAPP_NUMBER.replace('+', '')}?text=Hi!%20I%20need%20a%20used%20auto%20part.`,
        bg: '#25D366',
        external: true,
    },
    {
        id: 'feedback',
        label: 'Feedback',
        icon: <ChatIcon />,
        bg: '#2563eb',
        external: false,
    },
];

export default function GlobalFAB({ onOpenFeedback }) {
    const location = useLocation();
    const [open, setOpen] = useState(false);

    // Hide on excluded routes
    const isExcluded = EXCLUDED_PREFIXES.some(prefix =>
        location.pathname.startsWith(prefix)
    );
    if (isExcluded) return null;

    const handleAction = (action) => {
        setOpen(false);
        if (action.id === 'feedback') {
            onOpenFeedback?.();
        }
    };

    return (
        <div
            className="fixed z-50"
            style={{
                bottom: 'calc(1.5rem + env(safe-area-inset-bottom, 0px))',
                right: '1rem',
            }}
            role="group"
            aria-label="Quick contact options"
        >
            {/* Speed-dial child buttons */}
            {open && (
                <div className="flex flex-col items-end gap-2 mb-3">
                    {ACTIONS.map((action, i) => (
                        <div
                            key={action.id}
                            className="flex items-center gap-2 fab-item-enter"
                            style={{ animationDelay: `${i * 40}ms` }}
                        >
                            {/* Label */}
                            <span className="text-[11px] font-black text-white px-2.5 py-1 rounded-full shadow-md whitespace-nowrap"
                                style={{ background: action.bg }}>
                                {action.label}
                            </span>

                            {/* Button */}
                            {action.href ? (
                                <a
                                    href={action.href}
                                    target={action.external ? '_blank' : undefined}
                                    rel={action.external ? 'noopener noreferrer' : undefined}
                                    onClick={() => handleAction(action)}
                                    className="w-11 h-11 rounded-full text-white flex items-center justify-center shadow-lg transition-transform duration-150 hover:scale-110 active:scale-95"
                                    style={{ background: action.bg }}
                                    aria-label={action.label}
                                >
                                    {action.icon}
                                </a>
                            ) : (
                                <button
                                    onClick={() => handleAction(action)}
                                    className="w-11 h-11 rounded-full text-white flex items-center justify-center shadow-lg transition-transform duration-150 hover:scale-110 active:scale-95"
                                    style={{ background: action.bg }}
                                    aria-label={action.label}
                                >
                                    {action.icon}
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Main toggle button */}
            <div className="flex justify-end">
                <button
                    onClick={() => setOpen(v => !v)}
                    className="w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/40 flex items-center justify-center transition-all duration-200 active:scale-95"
                    style={{ willChange: 'transform' }}
                    aria-label={open ? 'Close contact menu' : 'Open contact menu'}
                    aria-expanded={open}
                >
                    <svg
                        className="w-6 h-6 transition-transform duration-300"
                        style={{ transform: open ? 'rotate(45deg)' : 'rotate(0deg)' }}
                        fill="none" viewBox="0 0 24 24" stroke="currentColor"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                    </svg>
                </button>
            </div>
        </div>
    );
}
