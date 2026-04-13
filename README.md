# JYNM Monorepo - Junkyard Search Platform

A modern full-stack application for searching junkyards and auto parts across the United States.

## 🏗️ Architecture

This is a **monorepo** with clean separation between frontend and backend:

```
/
├── frontend/          # React + Vite application
├── backend/           # Django REST API + SQLite
├── jynm-website/      # Original codebase (preserved)
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- **Python 3.10+** (for backend)
- **Node.js 18+** (for frontend)

### Backend Setup
vSEO & Risk Mitigation Strategy for Platform Migration
1. Executive Summary
This document outlines the technical strategy for migrating the existing website to the new modern technology stack while preserving and enhancing current Search Engine Optimization (SEO) metrics. The primary objective is to maintain search visibility, preserve backlink equity, and protect existing SERP rankings during the transition.
 
2. SEO Preservation Mechanics
The migration adheres to a strict zero-loss approach for existing SEO signals. The following elements are actively ported and verified:
 
    • URL Structure & 301 Redirects: We maintain exact 1:1 URL parity wherever technically feasible. For any URLs that must change due to architectural shifts, permanent HTTP 301 redirects are implemented at the edge or server configuration level. This ensures 100% of link equity is passed to the new destinations without redirect chains.

    • Meta Tags: All existing <title>, <meta name="description">, and Open Graph (og:) tags have been mapped and dynamically injected into the <head> of the new application pages.
      
    • Heading Hierarchy (H1–H6): The semantic HTML structure is explicitly preserved. Each page maintains a single, highly relevant <h1> tag, with <h2> through <h6> tags logically nested to ensure search engine crawlers can accurately parse the document outline.
      
    • Image Alt Attributes: All legacy image alt texts are migrated to the new frontend assets. Any new structural images are assigned descriptive, keyword-appropriate alt attributes.
      
    • Internal Linking Structure: Core navigational flows, footer links, and in-content contextual links are preserved to maintain the distribution of PageRank across the domain.
      
    • Sitemap.xml & Robots.txt: An updated sitemap.xml reflecting the exact indexable URL set of the new site is generated dynamically. The robots.txt is configured to prevent crawling of development environments and staging branches, and will be updated to allow standard crawling upon production launch.
      
    • Canonical Tags: Self-referencing <link rel="canonical" href="..."> tags are enforced on all indexable pages to prevent duplicate content indexing, particularly where query parameters might generate multiple URLs for identical content.
    • Schema Markup (Structured Data): Existing JSON-LD structured data (e.g., Organization, LocalBusiness, BreadcrumbList, Article) is ported and validated to ensure rich snippets in SERPs(Search Engine Reasult Pages) remain uninterrupted.
      
    • Page Speed Optimization & Core Web Vitals: The new architecture is optimized for Core Web Vitals (LCP, FID/INP, CLS). This includes native image lazy loading (loading="lazy"), optimized asset delivery, deferred secondary scripts, and minimizing relative main-thread blocking time.
      
    • Mobile Responsiveness: The modern stack utilizes a mobile-first grid system, ensuring full compliance with Google's Mobile-First Indexing criteria. Viewports and touch targets are strictly validated.
 
3. Migration Strategy Pipeline
To ensure fail-safe execution, the deployment follows a staged approach:
 
1 - Pre-Migration Audit
    • Crawl the existing production site to generate a comprehensive URL inventory, including status codes, canonicals, and metadata.
    • Identify high-traffic, high-value pages and backlink targets to establish a priority monitoring tier.
    • Map the legacy URL inventory to the staging URL inventory to construct the 301 redirect map.
 
2 - During Migration Safeguards
    • Deploy the redirect map directly to the DNS/CDN edge or server configuration to avoid application-level latency.
    • Temporarily keep the legacy application running on a backup subnet to allow for immediate rollback if required.
    • Execute an immediate post-deployment crawl of the production environment to verify 301 redirect mapping, 200 OK statuses for new pages, and an absence of 404/500 errors.
 
3 - Post-Migration Validation
    • Submit the updated sitemap.xml to Google Search Console (GSC) and request priority indexing for high-value URLs.
    • Monitor GSC Coverage and Indexing reports daily for crawl errors, soft 404s, or canonical anomalies.
    • Compare pre- and post-migration analytics to ensure traffic continuity and user engagement stability.
 
4. Risk Mitigation Strategy
To proactively defend against ranking volatility, the following safeguards are implemented:
 
    • Staging Environment Isolation: All pre-launch environments are secured via HTTP Basic Auth and explicit X-Robots-Tag: noindex, headers to prevent premature indexing or duplicate content penalties prior to launch.
      
    • Zero-Downtime Deployment: The DNS cutover is orchestrated utilizing blue/green deployment practices to ensure search engine crawlers do not encounter connection timeouts or 503 errors during the migration window.
      
    • Automated Regression Testing: Crawler simulators are run against the staging environment prior to launch to flag any missing metadata, broken links, or schema syntax errors before they are exposed to production crawlers.
 

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
.\venv\Scripts\activate  # Windows
# source venv/bin/activate  # Mac/Linux

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Import data from JSON files
python manage.py import_data

# Start backend server (port 8000)
python manage.py runserver
```

Backend will be available at: **http://localhost:8000**

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start frontend dev server (port 3001)
npm run dev
```

Frontend will be available at: **http://localhost:3000**

## 📊 Data

The application includes:
- **1,018 Junkyards** - Real businesses with ratings, reviews, and locations
- **109 Vehicle Models** - Popular models across 31 makes
- **31 Vehicle Makes** - All major automotive brands
- **40 Auto Parts** - Common parts like engines, transmissions, etc.
- **4,760 Cities** - Across the US and Canada
- **51 States** - US states and Canadian provinces

## 🔌 API Endpoints

### Vendors
- `GET /api/vendors/` - List all vendors (supports filtering)
- `GET /api/vendors/{id}/` - Get vendor details
- Query params: `state`, `city`, `zipcode`, `search`

### Common Data
- `GET /api/common/makes/` - List vehicle makes
- `GET /api/common/models/` - List models (filter by `make_id`)
- `GET /api/common/parts/` - List auto parts
- `GET /api/common/states/` - List states
- `GET /api/common/cities/` - List cities

### Leads
- `POST /api/leads/` - Create lead from quote request

### Health
- `GET /api/health/` - Health check endpoint

## 🛠️ Technology Stack

### Backend
- **Django 5.0** - Web framework
- **Django REST Framework** - API toolkit
- **SQLite** - Database
- **django-cors-headers** - CORS support

### Frontend
- **React 18** - UI framework
- **Vite 5** - Build tool
- **React Router 6** - Routing
- **Tailwind CSS 3** - Styling

## 📁 Project Structure

### Backend
```
backend/
├── core/                  # Django project settings
│   ├── settings.py       # Configuration
│   └── urls.py           # Main URL routing
├── apps/
│   ├── vendors/          # Vendor/junkyard app
│   ├── leads/            # Lead management app
│   └── common/           # Shared data (makes, models, parts)
├── db.sqlite3            # SQLite database
└── manage.py             # Django management script
```

### Frontend
```
frontend/
├── src/
│   ├── components/       # React components
│   ├── pages/            # Page components
│   ├── services/         # API service layer
│   ├── hooks/            # Custom React hooks
│   └── main.jsx          # Entry point
├── public/               # Static assets
└── package.json
```

## 🔧 Development

### Running Both Servers

You need **both** servers running for the application to work:

**Terminal 1 - Backend:**
```bash
cd backend
.\venv\Scripts\activate
python manage.py runserver
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### Environment Variables

Frontend (`.env`):
```
VITE_API_URL=http://localhost:8000/api
```

## 🎨 Features

- **Lead Form**: Cascading dropdowns (Make → Model → Part → Year)
- **ZIP Code Search**: Search by ZIP code proximity
- **Browse by Location**: Browse all states and cities
- **Vendor Details**: Detailed junkyard information
- **Real-time Filtering**: Dynamic search and filtering

## 📝 Admin Panel

Access Django admin at: **http://localhost:8000/admin/**

Create a superuser:
```bash
cd backend
python manage.py createsuperuser
```

## 🚀 Deployment

### Backend
- Configure PostgreSQL for production
- Set `DEBUG=False` in settings
- Configure static files serving
- Set up CORS for production domain

### Frontend
```bash
cd frontend
npm run build
# Deploy dist/ folder to static hosting
```

## 📄 License

This project is part of the JYNM (JunkYardNearMe.com) platform.
