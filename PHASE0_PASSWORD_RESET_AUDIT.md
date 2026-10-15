# Phase 0: Password Reset, Authentication & Modal Flow Audit

**Date:** October 15, 2026  
**Status:** Completed

---

## Root Cause Analysis

### Issue 1: Forgot Password Navigates to Standalone Page Instead of Modal

**Root Cause:**
- There are THREE separate forgot password implementations in the codebase:
  1. `frontend/src/pages/ForgotPassword.jsx` - Standalone page for customers (simulated API)
  2. `frontend/src/pages/vendor/ForgotPassword.jsx` - Standalone page for vendors (real API)
  3. `frontend/src/components/auth/ForgotPasswordModal.jsx` - Modal component (simulated API)
- `LoginModal.jsx` has a link to `/forgot-password` (page navigation) instead of opening the modal
- `AdminLogin.jsx` has a link to `/forgot-password` (page navigation) instead of opening the modal
- No route handler exists to resolve `/forgot-password` to a modal experience

**Files Involved:**
- `frontend/src/pages/ForgotPassword.jsx` (lines 1-140)
- `frontend/src/pages/vendor/ForgotPassword.jsx` (lines 1-150)
- `frontend/src/components/auth/ForgotPasswordModal.jsx` (lines 1-239)
- `frontend/src/components/auth/LoginModal.jsx` (line ~150)
- `frontend/src/pages/AdminLogin.jsx` (line 151)
- `frontend/src/App.jsx` (route definitions)

**Impact:**
- Users are navigated away from their current context when clicking Forgot Password
- Inconsistent UX across customer, vendor, and admin login flows
- Modal-based design is not being used

---

### Issue 2: Customer Session Shows as "Vendor 2280053" on Vendor Login

**Root Cause:**
- Dual-token system creates confusion:
  - Customer auth uses `access_token`, `refresh_token`, `user`, `vendor_profile` in localStorage
  - Vendor auth uses `vendor_access_token`, `vendor_refresh_token`, `vendor_user`, `vendor_profile` in localStorage
- `vendorApi.js` line 19 falls back to `access_token` if `vendor_access_token` is not set:
  ```javascript
  const token = localStorage.getItem('vendor_access_token') || localStorage.getItem('access_token');
  ```
- This means a logged-in customer with `access_token` could be treated as a vendor
- `VendorAuthContext.jsx` shows a fallback message when no vendor profile exists
- The "Vendor 2280053" message likely comes from displaying a customer ID as a vendor ID

**Files Involved:**
- `frontend/src/services/vendorApi.js` (line 19)
- `frontend/src/contexts/VendorAuthContext.jsx` (lines 7-15, 31-71)
- `frontend/src/components/auth/VendorLoginModal.jsx` (needs identity check)
- `frontend/src/components/auth/AddYardModal.jsx` (needs identity check)

**Impact:**
- Customers are incorrectly identified as vendors
- Confusing error messages
- Potential security issue if customer tokens are used for vendor API calls

---

### Issue 3: Password Reset Email Delivery Not Connected

**Root Cause:**
- Customer auth (`apps/users`) has NO password reset endpoint in `urls.py` or `views.py`
- Vendor portal (`apps/vendor_portal`) has a working password reset implementation in `password_reset.py`
- `ForgotPasswordModal.jsx` uses a simulated API call (line 64-65):
  ```javascript
  await new Promise(resolve => setTimeout(resolve, 1500));
  ```
- `ForgotPassword.jsx` (customer page) also uses simulated API call
- `VendorForgotPassword.jsx` calls real vendor API at `/api/vendor/password-reset/`
- No customer password reset endpoint exists in backend

**Files Involved:**
- `backend/apps/users/urls.py` (no password reset endpoint)
- `backend/apps/users/views.py` (no password reset view)
- `backend/apps/vendor_portal/password_reset.py` (vendor-only implementation)
- `frontend/src/components/auth/ForgotPasswordModal.jsx` (simulated API)
- `frontend/src/pages/ForgotPassword.jsx` (simulated API)

**Impact:**
- Customers cannot actually reset their passwords via email
- Vendor password reset works but is separate from customer flow
- No unified password reset experience

---

### Issue 4: Admin Portal Uses Customer Auth Context

**Root Cause:**
- `AdminLogin.jsx` uses `AuthContext` (customer authentication) instead of dedicated admin auth
- Admin login links to `/forgot-password` which is customer-specific
- No admin-specific password reset endpoint
- Admin permissions are checked via `user.is_superuser` or `user.user_type === 'admin'`

**Files Involved:**
- `frontend/src/pages/AdminLogin.jsx` (line 29)
- `frontend/src/contexts/AuthContext.jsx` (shared with customers)
- `backend/apps/users/views.py` (LoginView handles all user types)

**Impact:**
- Admin password reset would use customer flow (incorrect)
- No admin-specific reset experience
- Potential security issue if admin tokens are mixed with customer tokens

---

## Email Configuration Analysis

**Current Setup:**
- Email backend configured in `backend/core/settings.py` (lines 148-175)
- Uses SendGrid in production (`smtp.sendgrid.net:587`)
- Uses local Mailpit in development (`localhost:1025`)
- SendGrid API key loaded from environment variable `SENDGRID_API_KEY`
- Default from email: `noreply@example.com` (should be configured via `DEFAULT_FROM_EMAIL`)
- Frontend URL configured via `FRONTEND_URL` environment variable (missing from settings.py)

**Security:**
- Django's `default_token_generator` is used for vendor password reset (secure, single-use tokens)
- Tokens expire after Django's default (3 days)
- Email sending is done in a separate thread (fire-and-forget, no delivery confirmation)
- Generic response for non-existent accounts (prevents account enumeration)

**Missing Configuration:**
- `FRONTEND_URL` not defined in settings.py (line 44 references it)
- Customer password reset email template not created
- Admin password reset email template not created
- No HTML email templates (only plain text for vendor)

---

## Backend API Endpoints Status

| Endpoint | Status | Notes |
|----------|--------|-------|
| `/api/auth/register/` | ✅ Working | Customer registration |
| `/api/auth/login/` | ✅ Working | Customer login |
| `/api/auth/logout/` | ✅ Working | Customer logout |
| `/api/auth/token/refresh/` | ✅ Working | JWT refresh |
| `/api/auth/me/` | ✅ Working | Get current user |
| `/api/auth/change-password/` | ✅ Working | Change password (authenticated) |
| `/api/auth/vendor-profile/` | ✅ Working | Get vendor profile |
| `/api/auth/password-reset/` | ❌ Missing | Customer password reset |
| `/api/auth/password-reset-confirm/` | ❌ Missing | Customer password reset confirm |
| `/api/vendor/password-reset/` | ✅ Working | Vendor password reset |
| `/api/vendor/password-reset-confirm/` | ✅ Working | Vendor password reset confirm |
| `/api/admin/password-reset/` | ❌ Missing | Admin password reset |

---

## Frontend Modal Status

| Modal | Status | API Connected | Notes |
|-------|--------|--------------|-------|
| LoginModal | ✅ Working | ✅ Real API | Customer login |
| SignupModal | ✅ Working | ✅ Real API | Customer registration |
| ForgotPasswordModal | ⚠️ Partial | ❌ Simulated | Needs real API |
| VendorLoginModal | ✅ Working | ✅ Real API | Vendor login |
| AddYardModal | ✅ Working | ✅ Real API | Vendor registration |
| VendorForgotPassword (page) | ✅ Working | ✅ Real API | Vendor reset (page, not modal) |

---

## Required Implementation Plan

### Phase 1: Unified Forgot Password Modal
1. Update `ForgotPasswordModal.jsx` to accept a `userType` prop ('customer' | 'vendor' | 'admin')
2. Connect modal to real backend API based on userType
3. Update `LoginModal.jsx` to open modal instead of navigating to page
4. Update `VendorLoginModal.jsx` to open modal instead of navigating to page
5. Update `AdminLogin.jsx` to open modal instead of navigating to page
6. Add route handler in `App.jsx` to resolve `/forgot-password` to modal experience
7. Preserve background route when modal opens

### Phase 2: Customer Password Reset Backend
1. Add `PasswordResetRequestView` to `apps/users/views.py`
2. Add `PasswordResetConfirmView` to `apps/users/views.py`
3. Add URL patterns to `apps/users/urls.py`
4. Create customer password reset email template (HTML + plain text)
5. Add `FRONTEND_URL` to `settings.py`
6. Implement secure token generation using Django's `default_token_generator`
7. Add rate limiting and abuse protection

### Phase 3: Admin Password Reset Backend
1. Add admin password reset views to `apps/users/views.py` or `apps/rbac/views.py`
2. Add admin-specific URL patterns
3. Create admin password reset email template
4. Ensure admin-only access to reset confirm endpoint

### Phase 4: Fix Customer/Vendor Identity Confusion
1. Remove fallback to `access_token` in `vendorApi.js` (line 19)
2. Add explicit user type checks in `VendorLoginModal.jsx`
3. Add explicit user type checks in `AddYardModal.jsx`
4. Update `VendorAuthContext.jsx` to show clear error when customer tries vendor login
5. Add account switch flow if needed
6. Clear conflicting tokens on logout

### Phase 5: Admin Portal Auth Context
1. Consider creating dedicated `AdminAuthContext` or add admin checks to existing context
2. Ensure admin password reset uses admin-specific endpoint
3. Keep admin permissions isolated from customer/vendor

---

## Security Considerations

1. **Token Security:** Use Django's `default_token_generator` (already in use for vendor)
2. **Account Enumeration:** Return generic response for non-existent accounts (already implemented for vendor)
3. **Token Expiration:** Enforce token expiration (Django default is 3 days)
4. **Single-Use Tokens:** Invalidate tokens after successful password change
5. **HTTPS Only:** Ensure reset links use HTTPS (production configured for HTTPS)
6. **Rate Limiting:** Add throttling to password reset endpoints
7. **Email Content:** Do not include passwords or sensitive data in emails
8. **Logging:** Do not log reset tokens or full reset URLs

---

## Testing Requirements

1. **Frontend Tests:**
   - Forgot Password opens modal from customer login
   - Forgot Password opens modal from vendor login
   - Forgot Password opens modal from admin login
   - Modal closes and returns to background route
   - Direct navigation to `/forgot-password` opens modal
   - Form validation works correctly
   - Loading states display correctly

2. **Backend Tests:**
   - Valid email receives reset email
   - Invalid email receives generic response
   - Reset link works and allows password change
   - Expired/invalid tokens are rejected
   - Token is single-use
   - Rate limiting works
   - Email template renders correctly

3. **Integration Tests:**
   - End-to-end password reset flow for customer
   - End-to-end password reset flow for vendor
   - End-to-end password reset flow for admin
   - Customer cannot use vendor reset flow
   - Vendor cannot use customer reset flow
   - Admin cannot use customer/vendor reset flow

---

## Environment Variables Required

- `FRONTEND_URL` - Frontend URL for reset links (e.g., `https://junkyardsnearme.com`)
- `DEFAULT_FROM_EMAIL` - Sender email address (e.g., `noreply@junkyardsnearme.com`)
- `SENDGRID_API_KEY` - SendGrid API key (already configured)
- `EMAIL_HOST` - SMTP host (already configured)
- `EMAIL_PORT` - SMTP port (already configured)
- `EMAIL_USE_TLS` - TLS setting (already configured)

---

## Next Steps

Proceed with implementation in the following order:
1. Phase 1: Unified Forgot Password Modal (frontend)
2. Phase 2: Customer Password Reset Backend
3. Phase 3: Admin Password Reset Backend
4. Phase 4: Fix Customer/Vendor Identity Confusion
5. Phase 5: Admin Portal Auth Context
6. Phase 6: Testing
7. Phase 7: Final Report
