import { useState } from 'react';

// Configuration — update these with real numbers
const PHONE_NUMBER = '+18005551234';      // Change to your real phone number
const WHATSAPP_NUMBER = '+18005551234';   // Change to your WhatsApp number
const CHATBOT_ROUTE = '/chat';            // Change to your AI chatbot route

// WhatsApp icon SVG
const WhatsAppIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 md:w-7 md:h-7">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.487"/>
    </svg>
);

// AI Chatbot icon
const ChatbotIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 md:w-7 md:h-7">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1 1 .03 2.798-1.332 2.798H4.13c-1.36 0-2.332-1.799-1.332-2.798L4.2 15.3" />
    </svg>
);

// Phone icon
const PhoneIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4 md:w-6 md:h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
    </svg>
);

const BUTTONS = [
    {
        id: 'call',
        label: 'Call Us',
        icon: <PhoneIcon />,
        href: `tel:${PHONE_NUMBER}`,
        bgColor: 'bg-emerald-500',
        hoverColor: 'hover:bg-emerald-600',
        ringColor: 'ring-emerald-400',
        glowColor: 'rgba(16,185,129,0.5)',
        delay: '0s',
        external: false,
    },
    {
        id: 'whatsapp',
        label: 'WhatsApp',
        icon: <WhatsAppIcon />,
        href: `https://wa.me/${WHATSAPP_NUMBER.replace('+', '')}?text=Hi!%20I%20need%20a%20used%20auto%20part.`,
        bgColor: 'bg-[#25D366]',
        hoverColor: 'hover:bg-[#1ebe5a]',
        ringColor: 'ring-[#25D366]',
        glowColor: 'rgba(37,211,102,0.5)',
        delay: '0.5s',
        external: true,
    },
    {
        id: 'chatbot',
        label: 'AI Chat',
        icon: <ChatbotIcon />,
        href: CHATBOT_ROUTE,
        bgColor: 'bg-blue-600',
        hoverColor: 'hover:bg-blue-700',
        ringColor: 'ring-blue-400',
        glowColor: 'rgba(37,99,235,0.5)',
        delay: '1s',
        external: false,
    },
];

export default function FloatingActionButtons() {
    const [expanded, setExpanded] = useState(false);
    const [hovered, setHovered] = useState(null);

    return (
        <>
            {/* Keyframe animations injected once */}
            <style>{`
                @keyframes fab-bloom {
                    0%, 100% { box-shadow: 0 0 0 0 var(--glow), 0 4px 20px rgba(0,0,0,0.25); transform: scale(1); }
                    50% { box-shadow: 0 0 0 14px transparent, 0 8px 30px rgba(0,0,0,0.3); transform: scale(1.06); }
                }
                @keyframes fab-ring {
                    0% { transform: scale(1); opacity: 0.7; }
                    100% { transform: scale(2.2); opacity: 0; }
                }
                @keyframes fab-vibrate {
                    0%, 100% { transform: rotate(0deg); }
                    20% { transform: rotate(-6deg); }
                    40% { transform: rotate(6deg); }
                    60% { transform: rotate(-4deg); }
                    80% { transform: rotate(4deg); }
                }
                .fab-bloom { animation: fab-bloom 2.4s ease-in-out infinite; }
                .fab-ring::after {
                    content: '';
                    position: absolute;
                    inset: 0;
                    border-radius: 50%;
                    border: 2px solid currentColor;
                    animation: fab-ring 2.4s ease-out infinite;
                }
                .fab-icon-vibrate { animation: fab-vibrate 0.6s ease-in-out infinite; animation-play-state: paused; }
                .fab-btn:hover .fab-icon-vibrate { animation-play-state: running; }
            `}</style>

            {/* Fixed container bottom-right */}
            <div
                className="fixed bottom-6 right-5 z-40 flex flex-col items-end gap-3"
                role="complementary"
                aria-label="Quick contact options"
            >
                {/* Action buttons (always visible) */}
                {BUTTONS.map((btn, i) => (
                    <div key={btn.id} className="flex items-center gap-3 group">
                        {/* Tooltip label */}
                        <span
                            className={`
                                hidden md:flex items-center px-3 py-1.5 rounded-full text-xs font-bold text-white 
                                shadow-lg pointer-events-none whitespace-nowrap transition-all duration-200
                                ${btn.bgColor} opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0
                            `}
                        >
                            {btn.label}
                        </span>

                        {/* The FAB button */}
                        <a
                            href={btn.href}
                            target={btn.external ? '_blank' : undefined}
                            rel={btn.external ? 'noopener noreferrer' : undefined}
                            className={`
                                fab-btn fab-bloom relative w-10 h-10 md:w-14 md:h-14 rounded-full text-white flex items-center justify-center
                                shadow-xl transition-all duration-200 cursor-pointer select-none
                                ${btn.bgColor} ${btn.hoverColor}
                            `}
                            style={{
                                '--glow': btn.glowColor,
                                animationDelay: btn.delay,
                            }}
                            aria-label={btn.label}
                            onMouseEnter={() => setHovered(btn.id)}
                            onMouseLeave={() => setHovered(null)}
                        >
                            {/* Ripple ring */}
                            <span
                                className={`absolute inset-0 rounded-full fab-ring text-white opacity-70`}
                                style={{ color: btn.glowColor, animationDelay: btn.delay }}
                            />
                            {/* Icon */}
                            <span className="fab-icon-vibrate relative z-10">
                                {btn.icon}
                            </span>
                        </a>
                    </div>
                ))}
            </div>
        </>
    );
}
