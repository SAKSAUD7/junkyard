import React from 'react';
import { Link } from 'react-router-dom';
import { useCMS } from '../hooks/useCMS';
import { getLogoUrl } from '../utils/imageUrl';

export default function PromoBanner({ className = '' }) {
    const { get } = useCMS('home');

    const logo = get('promo_card', 'logo');
    const logoUrl = logo ? getLogoUrl(logo) : null;
    const heading = get('promo_card', 'heading', 'QUALITY AUTO PARTS');
    const phone = get('promo_card', 'phone', '1-866-293-3731');
    
    const bullets = [
        get('promo_card', 'bullet_1', '✔ QUALITY USED AUTO PARTS'),
        get('promo_card', 'bullet_2', '✔ LOW PRICES'),
        get('promo_card', 'bullet_3', '✔ WARRANTIED OEM PARTS'),
        get('promo_card', 'bullet_4', '✔ MILLIONS OF PARTS AVAILABLE')
    ].filter(Boolean);

    return (
        <div className={`w-full bg-white border border-blue-100/60 rounded-[2rem] p-4 lg:p-6 shadow-[0_8px_32px_rgba(0,0,0,0.06)] flex flex-col lg:flex-row items-center justify-between gap-6 ${className}`}>
            
            {/* Left Section: Logo & Name */}
            <div className="flex items-center gap-4 shrink-0">
                {logoUrl ? (
                    <img src={logoUrl} alt="Quality Auto Parts" className="h-16 w-16 object-contain drop-shadow-sm" />
                ) : (
                    <div className="relative flex items-center justify-center w-16 h-16 shrink-0">
                        <svg className="w-16 h-16 text-blue-600 absolute opacity-10" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.06-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.73,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.06,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.43-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.49-0.12-0.61L19.14,12.94z M12,19c-3.87,0-7-3.13-7-7s3.13-7,7-7s7,3.13,7,7 S15.87,19,12,19z"/>
                        </svg>
                        <div className="z-10 text-center font-serif mt-1">
                            <div className="text-blue-900 text-[14px] font-black tracking-tight leading-none">QUALITY</div>
                            <div className="text-blue-600 text-[9px] font-bold tracking-tight">Auto Parts</div>
                        </div>
                    </div>
                )}
                <div>
                    <h3 className="text-[15px] leading-tight text-slate-800 font-black tracking-wide uppercase mb-1">
                        {heading}
                    </h3>
                    <div className="flex items-center gap-1.5 text-orange-500 font-bold text-[12px]">
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                        Sponsored Partner
                    </div>
                </div>
            </div>

            {/* Middle Section: Bullets */}
            <div className="hidden md:flex flex-wrap items-center justify-center gap-x-6 gap-y-2 flex-1 border-l border-slate-100 pl-6">
                {bullets.map((bullet, idx) => {
                    const isCheckmark = bullet.trim().startsWith('✔');
                    const text = isCheckmark ? bullet.replace('✔', '').trim() : bullet.trim();
                    return (
                        <div key={idx} className="text-slate-600 text-[12px] font-bold tracking-wide flex items-center">
                            {isCheckmark && <span className="mr-1.5 text-emerald-500 font-black">✔</span>}
                            <span>{text}</span>
                        </div>
                    );
                })}
            </div>

            {/* Right Section: Call to Action */}
            <div className="flex flex-col sm:flex-row items-center gap-4 shrink-0 w-full lg:w-auto md:border-l md:border-slate-100 md:pl-6">
                <a href={`tel:${phone.replace(/\D/g, '')}`} className="flex items-center justify-center gap-2 text-slate-800 hover:text-blue-600 transition-colors group">
                    <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                    </div>
                    <span className="font-black text-[18px] tracking-tight">{phone}</span>
                </a>
                <Link to="/quote" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-bold py-2.5 px-6 rounded-xl transition-all shadow-[0_4px_12px_rgba(37,99,235,0.2)] hover:shadow-[0_6px_16px_rgba(37,99,235,0.3)] text-center whitespace-nowrap">
                    Get Instant Quote
                </Link>
            </div>
        </div>
    );
}
