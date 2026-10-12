# JYNM Platform Modernization Tasks

- [/] Phase 1: Planning and Architecture Review <!-- id: phase-1 -->
    - [x] Analyze PageHero and missing background image root causes across `/blog`, `/how-it-works`, `/faq`, `/quote`, `/sell-your-car` <!-- id: p1-hero -->
    - [x] Analyze [SellYourCar.jsx](file:///home/adminpc/junkyard/junkyard-1/frontend/src/pages/SellYourCar.jsx) layout collisions between hero section and 4-card step lane <!-- id: p1-sell -->
    - [x] Analyze Navbar "Add a Yard" redirect vs modal trigger logic and dropdown redundancy <!-- id: p1-navbar -->
    - [x] Analyze Image 2 ([media__1791739886787.png](file:///home/adminpc/.gemini/antigravity/brain/8b05da9e-4f62-4015-92e5-9381df1af7e3/media__1791739886787.png)) 4-slot ads layout, Recommended Yards, Top Deals, Trust pillars <!-- id: p1-ads -->
    - [x] Analyze [AdminLogin.jsx](file:///home/adminpc/junkyard/junkyard-1/frontend/src/pages/AdminLogin.jsx) header logo/back button layout and workspace back-navigation <!-- id: p1-admin-login -->
    - [x] Analyze Admin portal interactive metrics, dual pagination, and action column psychological icons <!-- id: p1-admin-tables -->
    - [x] Analyze 1-5 star feedback system, unique ID tracking, and automated email response mechanism <!-- id: p1-feedback -->
    - [x] Formulate comprehensive [implementation_plan.md](file:///home/adminpc/.gemini/antigravity/brain/8b05da9e-4f62-4015-92e5-9381df1af7e3/implementation_plan.md) <!-- id: p1-plan -->

- [ ] Phase 2: Hero Section Background Fixes & Page Modernization <!-- id: phase-2 -->
    - [ ] Update [PageHero.jsx](file:///home/adminpc/junkyard/junkyard-1/frontend/src/components/PageHero.jsx) with bulletproof fallback background images <!-- id: p2-pagehero -->
    - [ ] Refactor [BlogList.jsx](file:///home/adminpc/junkyard/junkyard-1/frontend/src/pages/blog/BlogList.jsx) hero to use dynamic PageHero with aerial background <!-- id: p2-blog -->
    - [ ] Modernize [HowItWorks.jsx](file:///home/adminpc/junkyard/junkyard-1/frontend/src/pages/HowItWorks.jsx) with hero background and interactive 3-step feature cards <!-- id: p2-how -->
    - [ ] Enhance [FAQ.jsx](file:///home/adminpc/junkyard/junkyard-1/frontend/src/pages/FAQ.jsx) with background image, search filter, and category accordions <!-- id: p2-faq -->
    - [ ] Ensure [QuoteRequest.jsx](file:///home/adminpc/junkyard/junkyard-1/frontend/src/pages/QuoteRequest.jsx) hero background renders consistently <!-- id: p2-quote -->

- [ ] Phase 3: "Sell Your Car" Step Lane & Layout Collision Fix <!-- id: phase-3 -->
    - [ ] Remove negative margin overlap between hero and 4-step card container <!-- id: p3-layout -->
    - [ ] Modernize 4-card step lane with 3D gradient cards, hover lift, and clear step indicators <!-- id: p3-steps -->
    - [ ] Integrate on-screen auth modal gate when unauthenticated user proceeds <!-- id: p3-auth -->

- [ ] Phase 4: Navbar "Add a Yard" Modal Flow & Dropdown Cleanup <!-- id: phase-4 -->
    - [ ] Connect "Add a Yard" button to on-screen Vendor Login/Signup modal instead of page navigation <!-- id: p4-add-yard -->
    - [ ] Clean up redundant links in Navbar dropdown menus <!-- id: p4-dropdown -->
    - [ ] Verify [OnboardingOverlay.jsx](file:///home/adminpc/junkyard/junkyard-1/frontend/src/components/OnboardingOverlay.jsx) respects current screen context <!-- id: p4-onboarding -->

- [ ] Phase 5: Homepage 4-Slot Ads Section (Image 2 Redesign) <!-- id: phase-5 -->
    - [ ] Create `FeaturedPartnersSection.jsx` featuring 4-slot 3D cards with sponsored/premium badges <!-- id: p5-partners -->
    - [ ] Create `RecommendedYardsSection.jsx` with yard details, reviews, and service tags <!-- id: p5-rec-yards -->
    - [ ] Create `TopDealsSection.jsx` with part thumbnails, vehicle fitment, warranties, and prices <!-- id: p5-deals -->
    - [ ] Create `TrustPillarsBanner.jsx` highlighting 10,000+ junkyards, parts, fast shipping, trust <!-- id: p5-trust -->
    - [ ] Integrate backend impression & click tracking for all ad cards <!-- id: p5-tracking -->
    - [ ] Replace homepage carousel instances with the new modular cards layout <!-- id: p5-home -->

- [ ] Phase 6: Admin Login, Logout & Portal Navigation Polish <!-- id: phase-6 -->
    - [ ] In [AdminLogin.jsx](file:///home/adminpc/junkyard/junkyard-1/frontend/src/pages/AdminLogin.jsx), remove redundant portal links ("User Login", "Vendor Login") from footer <!-- id: p6-links -->
    - [ ] Position logo on right side and back button on left side in [AdminLogin.jsx](file:///home/adminpc/junkyard/junkyard-1/frontend/src/pages/AdminLogin.jsx) <!-- id: p6-header -->
    - [ ] Configure Back button to return to workspace questionnaire when on login step <!-- id: p6-back -->
    - [ ] Style "Remember Me" and "Forgot Password" cleanly <!-- id: p6-remember -->
    - [ ] Remove automatic 3-second redirect in [LogoutFeedbackModal.jsx](file:///home/adminpc/junkyard/junkyard-1/frontend/src/components/LogoutFeedbackModal.jsx) <!-- id: p6-logout -->

- [ ] Phase 7: Admin Portal Interactive Metrics, Dual Pagination & Psychologically Colored Actions <!-- id: phase-7 -->
    - [ ] Transform static metric cards in [Dashboard.jsx](file:///home/adminpc/junkyard/junkyard-1/frontend/src/pages/admin/Dashboard.jsx) into interactive, clickable filtering widgets <!-- id: p7-metrics -->
    - [ ] Create reusable `AdminTablePagination.jsx` component with top and bottom controls and smooth scroll <!-- id: p7-pagination -->
    - [ ] Implement standardized psychologically colored action icons with tooltips (View, Edit, Delete) across all admin tables <!-- id: p7-actions -->
    - [ ] Update [Leads.jsx](file:///home/adminpc/junkyard/junkyard-1/frontend/src/pages/admin/Leads.jsx), [Vendors.jsx](file:///home/adminpc/junkyard/junkyard-1/frontend/src/pages/admin/Vendors.jsx), [Messages.jsx](file:///home/adminpc/junkyard/junkyard-1/frontend/src/pages/admin/Messages.jsx), [Payments.jsx](file:///home/adminpc/junkyard/junkyard-1/frontend/src/pages/admin/Payments.jsx), [FeedbackAdmin.jsx](file:///home/adminpc/junkyard/junkyard-1/frontend/src/pages/admin/FeedbackAdmin.jsx), [Ads.jsx](file:///home/adminpc/junkyard/junkyard-1/frontend/src/pages/admin/Ads.jsx) <!-- id: p7-tables -->

- [ ] Phase 8: 1-5 Star Feedback System & Automated Email Response Architecture <!-- id: phase-8 -->
    - [ ] Update [Feedback](file:///home/adminpc/junkyard/junkyard-1/backend/apps/common/models.py#85-111) model to support star rating (1-5), user email, and admin reply fields <!-- id: p8-model -->
    - [ ] Update `FeedbackWidget.jsx` with interactive 1-5 star selector, unique ID generation, and email field <!-- id: p8-widget -->
    - [ ] Create backend `/api/common/feedback/<id>/reply/` endpoint with branded HTML email template <!-- id: p8-reply-api -->
    - [ ] Update [FeedbackAdmin.jsx](file:///home/adminpc/junkyard/junkyard-1/frontend/src/pages/admin/FeedbackAdmin.jsx) to display star ratings and include "Reply to Customer" modal <!-- id: p8-admin-reply -->

- [ ] Phase 9: Mobile Floating Action Buttons (FAB) Redesign <!-- id: phase-9 -->
    - [ ] Redesign [GlobalFAB.jsx](file:///home/adminpc/junkyard/junkyard-1/frontend/src/components/GlobalFAB.jsx) into an innovative, ultra-clean floating glass dock <!-- id: p9-fab -->
    - [ ] Ensure tactile micro-animations and proper safe-area inset positioning above bottom nav <!-- id: p9-position -->

- [ ] Phase 10: Verification, Testing & Deployment <!-- id: phase-10 -->
    - [ ] Run frontend production build to verify zero errors <!-- id: p10-build -->
    - [ ] Verify public pages, hero images, modals, and ads layout via browser testing <!-- id: p10-browser -->
    - [ ] Verify Admin Portal interactivity, pagination, and feedback email workflow <!-- id: p10-admin-verify -->
