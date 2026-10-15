# P0.4: Route and Access Control Audit

**Date:** October 15, 2026  
**Status:** Completed

---

## Route Access Control Matrix

### Public Routes (No Authentication Required)
| Route | Page | Protected? | Notes |
|-------|------|------------|-------|
| `/` | Home | No | Landing page |
| `/search` | Search | No | Part search |
| `/quote` | QuoteRequest | No | Quote request form |
| `/junkyards` | AllVendors | No | Vendor directory |
| `/junkyards/:state` | BrowseState | No | State-based vendor browse |
| `/junkyards/:state/:slug` | VendorDetail | No | **FIXED** - Previously had client-side auth wall, now public |
| `/junkyard/:slug` | VendorDetail | No | **FIXED** - Previously had client-side auth wall, now public |
| `/blog` | BlogList | No | Blog listing |
| `/blog/:slug` | BlogDetail | No | Blog post |
| `/about` | About | No | About page |
| `/contact` | Contact | No | Contact form |
| `/privacy` | Privacy | No | Privacy policy |
| `/terms` | Terms | No | Terms of service |
| `/how-it-works` | HowItWorks | No | How it works |
| `/faq` | FAQ | No | FAQ page |

### Buyer Authentication Routes
| Route | Page | Protected? | Protection Method |
|-------|------|------------|------------------|
| `/signin` | SignIn | No | Public login page |
| `/signup` | SignUp | No | Public registration |
| `/forgot-password` | ForgotPassword | No | Public password reset |
| `/profile` | Profile | Yes | ProtectedRoute wrapper (AuthContext) |
| `/quotes` | QuotesCart | Yes | ProtectedRoute wrapper (AuthContext) |

### Vendor Registration Routes
| Route | Page | Protected? | Protection Method |
|-------|------|------------|------------------|
| `/add-a-yard` | AddYardStart | No | Public (wrapped in VendorAuthProvider) |
| `/add-a-yard/form` | AddYardPage | No | Public (wrapped in VendorAuthProvider) |

### Vendor Portal Routes
| Route | Page | Protected? | Protection Method |
|-------|------|------------|------------------|
| `/vendor/login` | VendorLogin | No | Public login page |
| `/vendor/signup` | VendorSignUp | No | Public registration |
| `/vendor/forgot-password` | VendorForgotPassword | No | Public password reset |
| `/vendor/dashboard` | VendorDashboard | Yes | ProtectedVendorRoute wrapper (VendorAuthContext) |
| `/vendor/profile` | VendorProfile | Yes | ProtectedVendorRoute wrapper |
| `/vendor/inventory` | VendorInventory | Yes | ProtectedVendorRoute wrapper |
| `/vendor/leads` | VendorLeads | Yes | ProtectedVendorRoute wrapper |
| `/vendor/leads/:id` | VendorLeadDetail | Yes | ProtectedVendorRoute wrapper |
| `/vendor/notifications` | VendorNotifications | Yes | ProtectedVendorRoute wrapper |
| `/vendor/ads` | VendorAds | Yes | ProtectedVendorRoute wrapper |

### Admin Portal Routes
| Route | Page | Protected? | Protection Method |
|-------|------|------------|------------------|
| `/admin-portal/login` | AdminLogin | No | Public login page |
| `/admin-portal/dashboard` | AdminDashboard | Yes | AdminProtectedRoute wrapper |
| `/admin-portal/messages` | AdminMessages | Yes | AdminProtectedRoute wrapper |
| `/admin-portal/leads` | AdminLeads | Yes | AdminProtectedRoute wrapper |
| `/admin-portal/vendor-leads` | AdminVendorLeads | Yes | AdminProtectedRoute wrapper |
| `/admin-portal/sell-vehicle-leads` | AdminSellVehicleLeads | Yes | AdminProtectedRoute wrapper |
| `/admin-portal/lead-distribution` | AdminLeadDistribution | Yes | AdminProtectedRoute wrapper |
| `/admin-portal/yard-submissions` | AdminYardSubmissions | Yes | AdminProtectedRoute wrapper |
| `/admin-portal/vendors` | AdminVendors | Yes | AdminProtectedRoute wrapper |
| `/admin-portal/ads` | AdminAds | Yes | AdminProtectedRoute wrapper |
| `/admin-portal/payments` | AdminPayments | Yes | AdminProtectedRoute wrapper |
| `/admin-portal/analytics` | AdminAnalytics | Yes | AdminProtectedRoute wrapper |
| `/admin-portal/settings` | AdminSettings | Yes | AdminProtectedRoute wrapper |
| `/admin-portal/blog` | AdminBlogList | Yes | AdminProtectedRoute wrapper |
| `/admin-portal/blog/new` | AdminBlogEditor | Yes | AdminProtectedRoute wrapper |
| `/admin-portal/blog/edit/:id` | AdminBlogEditor | Yes | AdminProtectedRoute wrapper |
| `/admin-portal/feedback` | AdminFeedback | Yes | AdminProtectedRoute wrapper |
| `/admin-portal/cms` | AdminCMS | Yes | AdminProtectedRoute wrapper |
| `/admin-portal/cms/:page` | AdminCMS | Yes | AdminProtectedRoute wrapper |
| `/admin-portal/roles` | AdminRoles | Yes | AdminProtectedRoute wrapper |
| `/admin-portal/part-pricing` | AdminPartPricing | Yes | AdminProtectedRoute wrapper |

---

## Changes Made in P0 Fixes

### P0.1: Buyer Session Persistence
**Issue:** Buyers were asked to sign in again when clicking "View Inventory" on vendor cards.

**Root Cause:** VendorDetail had a client-side auth wall that triggered during AuthContext initialization race condition.

**Fix:** Removed the client-side auth wall from VendorDetail. The route is now consistently public as defined in App.jsx.

**Files Changed:**
- `frontend/src/pages/VendorDetail.jsx` - Removed auth wall logic and modal imports

**Impact:** Buyers can now navigate to vendor detail pages without being prompted to sign in again, regardless of AuthContext initialization timing.

---

### P0.2: Vendor Login Separation
**Issue:** "Vendor Login" menu item opened AddYardModal with login mode, confusing the registration vs login journeys.

**Root Cause:** Navbar reused AddYardModal for both yard registration and vendor login.

**Fix:** Created dedicated VendorLoginModal and updated Navbar to use it for vendor login. AddYardModal is now used only for yard registration (signup mode).

**Files Changed:**
- `frontend/src/components/auth/VendorLoginModal.jsx` - New dedicated vendor login modal
- `frontend/src/components/Navbar.jsx` - Added vendorLoginModalOpen state, updated event handlers and dropdown buttons

**Impact:** Clear separation between "Add Your Yard" (registration) and "Vendor Login" (sign in) journeys.

---

### P0.3: Modal Behavior Improvements
**Issue:** Modals lacked consistent Escape key handling and body scroll prevention.

**Fix:** Added Escape key handlers and body scroll prevention to all auth modals.

**Files Changed:**
- `frontend/src/components/auth/VendorLoginModal.jsx` - Added Escape key handler and body scroll prevention
- `frontend/src/components/auth/LoginModal.jsx` - Added Escape key handler and body scroll prevention
- `frontend/src/components/auth/AddYardModal.jsx` - Added Escape key handler and body scroll prevention
- `frontend/src/components/auth/SignupModal.jsx` - Added Escape key handler and body scroll prevention
- `frontend/src/components/auth/ForgotPasswordModal.jsx` - Added Escape key handler and body scroll prevention

**Impact:** Consistent modal behavior across all authentication modals. Users can now close modals with Escape key, and body scroll is prevented when modals are open.

---

## Recommendations

### Backend Authorization
Currently, VendorDetail is a public route with no backend authorization. Consider:
1. Adding backend permission checks if certain vendor data should be restricted
2. Implementing rate limiting for vendor detail API endpoints
3. Adding CSRF protection for quote submissions

### Role-Based Access Control
The current implementation uses three separate auth contexts (AuthContext, VendorAuthContext, and admin auth). Consider:
1. Consolidating into a single auth context with role-based permissions
2. Implementing a permission system (RBAC) for granular access control
3. Adding role-based route protection at the router level

### Token Management
The dual-token system (buyer tokens + vendor tokens) adds complexity. Consider:
1. Using a single token with role claims
2. Implementing token refresh logic at the API client level
3. Adding token expiration warnings for better UX

---

## Testing Checklist

- [ ] Buyer can sign in and navigate to vendor detail pages without re-authentication
- [ ] Vendor Login opens dedicated modal (not AddYardModal)
- [ ] Add Your Yard opens registration modal (not login mode)
- [ ] All modals close on Escape key press
- [ ] Body scroll is prevented when modals are open
- [ ] Vendor login redirects to /vendor/dashboard after successful authentication
- [ ] Add Yard registration redirects to /add-a-yard/form after successful registration
- [ ] Protected buyer routes redirect to /signin with returnUrl
- [ ] Protected vendor routes redirect to /vendor/login with redirect param
- [ ] Protected admin routes redirect to /admin-portal/login

---

## Deployment Notes

1. No database migrations required
2. No backend API changes required
3. Frontend-only changes
4. Test in staging environment before production deployment
5. Clear browser localStorage after deployment to test fresh authentication flows
