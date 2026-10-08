import { useState } from 'react';
import { getLogoUrl } from '../utils/imageUrl';

/**
 * JYNMAvatar — shared avatar for customer, vendor, and admin.
 *
 * Props:
 *   user            – customer user object { first_name, last_name, email, profile_image, user_type }
 *   vendorProfile   – vendor profile object { business_name, logo }
 *   size            – 'xs'|'sm'|'md'|'lg' (default: 'md')
 *   className       – extra tailwind classes
 *
 * Logic:
 *   Vendor with logo      → show logo image
 *   Vendor without logo   → first letter of business_name
 *   Customer with photo   → show profile image
 *   Customer without photo → first letter(s) of name
 *   Unauthenticated       → generic person icon
 */
export default function JYNMAvatar({ user = null, vendorProfile = null, size = 'md', className = '' }) {
    const [imgError, setImgError] = useState(false);

    const sizeMap = {
        xs: 'w-6 h-6 text-[9px]',
        sm: 'w-7 h-7 text-[10px]',
        md: 'w-8 h-8 text-[11px]',
        lg: 'w-12 h-12 text-[15px]',
        xl: 'w-16 h-16 text-[20px]',
    };
    const sizeClass = sizeMap[size] || sizeMap.md;

    // ── Vendor branch ──
    if (vendorProfile) {
        const logoRaw = vendorProfile.logo;
        const logoUrl = logoRaw ? getLogoUrl(logoRaw) : null;
        const businessName = vendorProfile.business_name || vendorProfile.name || '';
        const initial = businessName.trim().charAt(0).toUpperCase() || '?';

        if (logoUrl && !imgError) {
            return (
                <div
                    className={`${sizeClass} rounded-full overflow-hidden bg-slate-100 border border-slate-200 flex-shrink-0 ${className}`}
                >
                    <img
                        src={logoUrl}
                        alt={businessName}
                        className="w-full h-full object-cover"
                        onError={() => setImgError(true)}
                    />
                </div>
            );
        }

        return (
            <div
                className={`${sizeClass} rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-black shadow-sm border border-emerald-600/20 flex-shrink-0 ${className}`}
            >
                {initial}
            </div>
        );
    }

    // ── Customer / Admin branch ──
    if (user) {
        const profileImage = user.profile_image || user.avatar;
        const imgUrl = profileImage ? (profileImage.startsWith('http') ? profileImage : getLogoUrl(profileImage)) : null;
        const nameInitial = user.first_name
            ? user.first_name.charAt(0).toUpperCase()
            : user.email
                ? user.email.charAt(0).toUpperCase()
                : 'U';

        if (imgUrl && !imgError) {
            return (
                <div
                    className={`${sizeClass} rounded-full overflow-hidden bg-slate-100 border border-slate-200 flex-shrink-0 ${className}`}
                >
                    <img
                        src={imgUrl}
                        alt={user.first_name || 'Profile'}
                        className="w-full h-full object-cover"
                        onError={() => setImgError(true)}
                    />
                </div>
            );
        }

        return (
            <div
                className={`${sizeClass} rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black shadow-sm border border-indigo-600/20 flex-shrink-0 ${className}`}
            >
                {nameInitial}
            </div>
        );
    }

    // ── Unauthenticated ──
    return (
        <div
            className={`${sizeClass} rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 flex-shrink-0 ${className}`}
        >
            <svg className="w-[60%] h-[60%]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
        </div>
    );
}
