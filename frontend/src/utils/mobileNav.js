// Routes that render no fixed bottom navigation, so their page wrappers must not
// reserve vertical space for it.
export const BOTTOM_NAV_EXCLUDED_PREFIXES = [
    '/admin-portal',
    '/admin',
    '/vendor',
    '/signin',
    '/signup',
    '/forgot-password'
];

export function hasBottomNav(pathname) {
    return !BOTTOM_NAV_EXCLUDED_PREFIXES.some(prefix => pathname.startsWith(prefix));
}
