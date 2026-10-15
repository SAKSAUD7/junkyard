# JYNM Phase 1 Repository Audit Report

**Date:** October 15, 2026  
**Repository:** /home/adminpc/junkyard/junkyard-1/junkyard  
**Branch:** main (clean working tree)

---

## Executive Summary

The JYNM application has a dual authentication system (buyer AuthContext + vendor VendorAuthContext) with JWT tokens stored in localStorage. The critical P0 issues stem from:

1. **Race condition** between AuthContext initialization and VendorDetail rendering
2. **Missing dedicated vendor login modal** - Vendor Login reuses AddYardModal
3. **Auth wall on VendorDetail** triggers even for authenticated buyers during loading state

---

## Technology Stack Verification

### Frontend
- React 18 with Vite
- React Router v7 (with future flags enabled)
- Tailwind CSS
- Framer Motion
- JWT-based authentication (localStorage)

### Backend
- Django 5.0
- Django REST Framework
- SimpleJWT for token authentication
- PostgreSQL (intended, verify actual DB)

### Infrastructure
- Hostinger VPS
- Nginx + Gunicorn
- Redis (configured)

---

## P0.1: Buyer Session Lost - Root Cause Analysis

### Problem Description
A signed-in buyer clicks "View Inventory" on a vendor card and is asked to sign in again.

### Root Cause Identified

**File:** `frontend/src/pages/VendorDetail.jsx` (lines 70-79)

```javascript
// Enforce Auth Wall
useEffect(() => {
    if (!loading && !error && vendor && !isAuthenticated) {
        setShowSecurityCheck(true);
    } else {
        setShowSecurityCheck(false);
        setShowSignup(false);
        setShowLogin(false);
    }
}, [loading, error, vendor, isAuthenticated]);
```

**The Issue:**
1. VendorDetail wraps the route with `VendorAuthProvider` (App.jsx line 210)
2. VendorDetail checks `isAuthenticated` from `AuthContext` (buyer auth)
3. When the component mounts, `AuthContext.loading` may still be `true` while it initializes
4. The effect runs when `loading` becomes `false`, but if `isAuthenticated` hasn't been set yet, it triggers the auth wall
5. This creates a race condition where a valid session appears unauthenticated during initialization

**Contributing Factors:**
- AuthContext initialization (AuthContext.jsx lines 13-54) is async and calls `authService.getCurrentUser()`
- The `loading` state transitions from `true` → `false` before `isAuthenticated` is confirmed
- VendorDetail doesn't wait for AuthContext to fully initialize before checking auth state

**Files Involved:**
- `frontend/src/contexts/AuthContext.jsx` - Buyer authentication context
- `frontend/src/pages/VendorDetail.jsx` - Vendor detail page with auth wall
- `frontend/src/components/VendorCard.jsx` - "View Inventory" button links to vendor detail
- `frontend/src/services/authService.js` - Token storage and API calls

---

## P0.2: Vendor Login vs Add Your Yard - Root Cause Analysis

### Problem Description
"Vendor Login" menu item redirects to Add Your Yard registration modal instead of a dedicated vendor login.

### Root Cause Identified

**File:** `frontend/src/components/Navbar.jsx` (lines 98-101)

```javascript
const handleVendorLogin = () => {
    setAddYardModalInitialMode('login')
    setAddYardModalOpen(true)
}
```

**The Issue:**
1. Navbar's "Vendor Login" button opens `AddYardModal` with `initialMode='login'`
2. AddYardModal is designed for yard registration (signup) but has a mode toggle for login
3. This is confusing - the modal title says "List Your Junkyard" in signup mode but "Partner Sign In" in login mode
4. There IS a dedicated vendor login route at `/vendor/login` (App.jsx line 241-245) with a dedicated VendorLogin page
5. The Navbar bypasses the dedicated route and uses a shared modal instead

**Expected Behavior:**
- "Vendor Login" should open the dedicated `/vendor/login` route or a dedicated vendor login modal
- "Add Your Yard" should open the yard registration flow (AddYardModal or /add-a-yard route)

**Files Involved:**
- `frontend/src/components/Navbar.jsx` - Account menu with Vendor Login button
- `frontend/src/components/auth/AddYardModal.jsx` - Shared modal for signup/login
- `frontend/src/pages/vendor/Login.jsx` - Dedicated vendor login page (not used by Navbar)
- `frontend/src/App.jsx` - Route definitions

---

## P0.3: Modal Behavior Issues

### Identified Issues

**AddYardModal:**
- No Escape key handler
- No backdrop click handler (has onClick on parent div but may not work correctly)
- z-index is 120, which is higher than LoginModal (100) - correct hierarchy
- Mobile responsive with max-height and overflow-y: auto
- No focus trap or focus management

**LoginModal:**
- No Escape key handler
- Backdrop click handler exists
- z-index is 100
- No focus trap or focus management

**VendorDetail Modals:**
- SecurityQuestionnaireModal, SignupModal, LoginModal are conditionally rendered
- No Escape key handlers
- No focus management

---

## P0.4: Route and Access Control Matrix

### Public Routes
| Route | Page | Auth Required | Role | Current Implementation |
|-------|------|---------------|------|----------------------|
| `/` | Home | No | None | Public |
| `/search` | Search | No | None | Public |
| `/quote` | QuoteRequest | No | None | Public |
| `/junkyards` | AllVendors | No | None | Public |
| `/junkyards/:state` | BrowseState | No | None | Public |
| `/junkyards/:state/:slug` | VendorDetail | **Yes** | Buyer | Auth wall on VendorDetail |
| `/junkyard/:slug` | VendorDetail | **Yes** | Buyer | Auth wall on VendorDetail |
| `/blog` | BlogList | No | None | Public |
| `/blog/:slug` | BlogDetail | No | None | Public |
| `/about` | About | No | None | Public |
| `/contact` | Contact | No | None | Public |
| `/privacy` | Privacy | No | None | Public |
| `/terms` | Terms | No | None | Public |
| `/how-it-works` | HowItWorks | No | None | Public |
| `/faq` | FAQ | No | None | Public |

### Buyer Authentication Routes
| Route | Page | Auth Required | Role | Current Implementation |
|-------|------|---------------|------|----------------------|
| `/signin` | SignIn | No | None | Public (login page) |
| `/signup` | SignUp | No | None | Public (registration) |
| `/forgot-password` | ForgotPassword | No | None | Public |
| `/profile` | Profile | Yes | Buyer | ProtectedRoute wrapper |
| `/quotes` | QuotesCart | Yes | Buyer | ProtectedRoute wrapper |

### Vendor Registration Routes
| Route | Page | Auth Required | Role | Current Implementation |
|-------|------|---------------|------|----------------------|
| `/add-a-yard` | AddYardStart | No | None | Public (wrapped in VendorAuthProvider) |
| `/add-a-yard/form` | AddYardPage | No | None | Public (wrapped in VendorAuthProvider) |

### Vendor Portal Routes
| Route | Page | Auth Required | Role | Current Implementation |
|-------|------|---------------|------|----------------------|
| `/vendor/login` | VendorLogin | No | None | Public (dedicated login page) |
| `/vendor/signup` | VendorSignUp | No | None | Public |
| `/vendor/forgot-password` | VendorForgotPassword | No | None | Public |
| `/vendor/dashboard` | VendorDashboard | Yes | Vendor | ProtectedVendorRoute wrapper |
| `/vendor/profile` | VendorProfile | Yes | Vendor | ProtectedVendorRoute wrapper |
| `/vendor/inventory` | VendorInventory | Yes | Vendor | ProtectedVendorRoute wrapper |
| `/vendor/leads` | VendorLeads | Yes | Vendor | ProtectedVendorRoute wrapper |
| `/vendor/leads/:id` | VendorLeadDetail | Yes | Vendor | ProtectedVendorRoute wrapper |
| `/vendor/notifications` | VendorNotifications | Yes | Vendor | ProtectedVendorRoute wrapper |
| `/vendor/ads` | VendorAds | Yes | Vendor | ProtectedVendorRoute wrapper |

### Admin Portal Routes
| Route | Page | Auth Required | Role | Current Implementation |
|-------|------|---------------|------|----------------------|
| `/admin-portal/login` | AdminLogin | No | None | Public |
| `/admin-portal/dashboard` | AdminDashboard | Yes | Admin | AdminProtectedRoute wrapper |
| `/admin-portal/messages` | AdminMessages | Yes | Admin | AdminProtectedRoute wrapper |
| `/admin-portal/leads` | AdminLeads | Yes | Admin | AdminProtectedRoute wrapper |
| `/admin-portal/vendor-leads` | AdminVendorLeads | Yes | Admin | AdminProtectedRoute wrapper |
| `/admin-portal/sell-vehicle-leads` | AdminSellVehicleLeads | Yes | Admin | AdminProtectedRoute wrapper |
| `/admin-portal/lead-distribution` | AdminLeadDistribution | Yes | Admin | AdminProtectedRoute wrapper |
| `/admin-portal/yard-submissions` | AdminYardSubmissions | Yes | Admin | AdminProtectedRoute wrapper |
| `/admin-portal/vendors` | AdminVendors | Yes | Admin | AdminProtectedRoute wrapper |
| `/admin-portal/ads` | AdminAds | Yes | Admin | AdminProtectedRoute wrapper |
| `/admin-portal/payments` | AdminPayments | Yes | Admin | AdminProtectedRoute wrapper |
| `/admin-portal/analytics` | AdminAnalytics | Yes | Admin | AdminProtectedRoute wrapper |
| `/admin-portal/settings` | AdminSettings | Yes | Admin | AdminProtectedRoute wrapper |
| `/admin-portal/blog` | AdminBlogList | Yes | Admin | AdminProtectedRoute wrapper |
| `/admin-portal/blog/new` | AdminBlogEditor | Yes | Admin | AdminProtectedRoute wrapper |
| `/admin-portal/blog/edit/:id` | AdminBlogEditor | Yes | Admin | AdminProtectedRoute wrapper |
| `/admin-portal/feedback` | AdminFeedback | Yes | Admin | AdminProtectedRoute wrapper |
| `/admin-portal/cms` | AdminCMS | Yes | Admin | AdminProtectedRoute wrapper |
| `/admin-portal/cms/:page` | AdminCMS | Yes | Admin | AdminProtectedRoute wrapper |
| `/admin-portal/roles` | AdminRoles | Yes | Admin | AdminProtectedRoute wrapper |
| `/admin-portal/part-pricing` | AdminPartPricing | Yes | Admin | AdminProtectedRoute wrapper |

### Critical Findings

1. **VendorDetail auth wall is inconsistent** - It requires buyer authentication but this is not documented in the route matrix. The auth check happens client-side, not via ProtectedRoute wrapper.

2. **Vendor Login route exists but is unused** - `/vendor/login` has a dedicated page but Navbar opens AddYardModal instead.

3. **No backend authorization on VendorDetail** - The route is public in App.jsx but has client-side auth wall. This means direct navigation to the URL bypasses the auth check if the client-side logic fails.

---

## Backend Authentication Architecture

### JWT Token Flow
- **Access Token:** Short-lived (default SimpleJWT settings)
- **Refresh Token:** Long-lived, can be used to get new access token
- **Storage:** localStorage (both buyer and vendor use separate token keys)

### Token Storage Keys
**Buyer (AuthContext):**
- `access_token` - JWT access token
- `refresh_token` - JWT refresh token
- `user` - Serialized user object
- `vendor_profile` - Serialized vendor profile (if applicable)

**Vendor (VendorAuthContext):**
- `vendor_access_token` - Vendor-specific access token
- `vendor_refresh_token` - Vendor-specific refresh token
- `vendor_user` - Serialized vendor user object
- `vendor_profile` - Serialized vendor profile

### Backend Endpoints
- `POST /api/auth/register/` - User registration
- `POST /api/auth/login/` - User login (returns user, vendor_profile, tokens)
- `POST /api/auth/logout/` - User logout (blacklists refresh token)
- `POST /api/auth/token/refresh/` - Refresh access token
- `GET /api/auth/me/` - Get current user
- `GET /api/auth/vendor-profile/` - Get vendor profile

### Token Refresh Logic
**authService.js (lines 25-75):**
- Intercepts 401 errors
- Attempts token refresh using refresh token
- If refresh fails, clears auth and redirects to login
- For public routes, retries request without token to prevent 401 crashes

**vendorApi.js (lines 30-64):**
- Similar refresh logic for vendor tokens
- Falls back to `access_token` if `vendor_access_token` not set (bridges dual-token gap)

---

## Database Models

### User Model (apps.users.models.User)
- email (unique, USERNAME_FIELD)
- username (required)
- user_type (customer/vendor/admin)
- phone
- avatar
- email_verified
- created_at, updated_at

### VendorProfile Model
- Links User to Vendor (hollander.Vendor)
- is_owner, can_edit, can_respond_reviews, can_manage_inventory
- last_login_ip
- created_at

### CustomerProfile Model
- Links User to security questionnaire answers
- security_user_type, security_purpose
- created_at

---

## Recommendations for P0 Fixes

### P0.1: Fix Buyer Session Persistence
1. **Remove auth wall from VendorDetail** - VendorDetail should be publicly accessible
2. **OR fix the race condition** - Wait for AuthContext to fully initialize before checking auth state
3. **OR use ProtectedRoute** - If auth is required, use the existing ProtectedRoute wrapper instead of custom auth wall

### P0.2: Separate Vendor Login from Add Your Yard
1. **Create dedicated VendorLoginModal** - Separate from AddYardModal
2. **Update Navbar** - "Vendor Login" should open VendorLoginModal or navigate to `/vendor/login`
3. **Keep AddYardModal** - Use only for "Add Your Yard" registration

### P0.3: Fix Modal Behavior
1. **Add Escape key handlers** to all modals
2. **Ensure backdrop click works correctly**
3. **Add focus management** (focus trap, initial focus)
4. **Test mobile responsiveness**

### P0.4: Complete Route Audit
1. **Document all routes** with auth requirements
2. **Add backend authorization** where missing
3. **Test role-based access control**

---

## Risks and Dependencies

### High Risk
- Changing VendorDetail auth behavior may affect existing user flows
- Token storage changes could break existing sessions
- Modal behavior changes require thorough testing

### Medium Risk
- Vendor login separation may confuse existing users
- Route changes require SEO consideration

### Low Risk
- Adding Escape key handlers
- Improving focus management

---

## Next Steps

1. Create Git branch for P0 fixes
2. Implement P0.1 fix (remove or fix VendorDetail auth wall)
3. Implement P0.2 fix (create dedicated VendorLoginModal)
4. Implement P0.3 fix (improve modal behavior)
5. Create P0.4 route audit document
6. Test all authentication flows
7. Deploy to staging for verification
