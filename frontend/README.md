# JYNM Website - Junkyard Search Platform

A modern React-based website for searching junkyards and auto parts across the United States.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

The website will be available at: **http://localhost:3000**

## 📁 Project Structure

```
jynm-website/
├── public/
│   └── data/               # All data JSON files
│       ├── data_cities.json      # 500+ cities
│       ├── data_junkyards.json   # 1,018 junkyards with ZIP codes
│       ├── data_makes.json       # 31 vehicle makes
│       ├── data_models.json      # 109 vehicle models
│       ├── data_parts.json       # 40 auto parts
│       └── data_states.json      # 50+ US states
├── src/
│   ├── components/         # React components
│   │   ├── LeadForm.jsx         # Lead generation form
│   │   ├── Navbar.jsx           # Navigation bar
│   │   └── Footer.jsx           # Footer
│   ├── pages/              # Page components
│   │   ├── Home.jsx             # Homepage with search
│   │   ├── Search.jsx           # Search results
│   │   ├── BrowseStates.jsx     # Browse by state
│   │   ├── BrowseState.jsx      # State detail
│   │   ├── JunkyardDetail.jsx   # Junkyard detail
│   │   └── About.jsx            # About page
│   ├── hooks/              # Custom React hooks
│   │   └── useData.js           # Data fetching hook
│   ├── App.jsx             # Main app component
│   ├── main.jsx            # Entry point
│   └── index.css           # Global styles
├── scripts/                # Utility scripts
│   ├── generate_comprehensive_models.php
│   └── generate_models.js
├── package.json
├── vite.config.js
├── tailwind.config.js
└── README.md
```

## ✨ Features

### 🔍 Lead Form
- **Cascading Dropdowns**: Make → Model → Part → Year
- **Real-time Filtering**: Models update based on selected make
- **Visual Feedback**: Checkmarks show completed fields
- **Smart Search**: Filters 1,018 junkyards by criteria

### 📍 ZIP Code Search
- Search by ZIP code proximity
- Matches first 3 digits for area-based results
- Also searches by city/state names

### 🗺️ Browse by Location
- Browse all 50+ US states
- View junkyards by city
- Detailed junkyard information

## 📊 Data

All data is **100% real** extracted from the project:

- **1,018 Junkyards** - Real businesses with ratings, reviews, locations, and ZIP codes
- **109 Vehicle Models** - Popular models for all 31 makes
- **31 Vehicle Makes** - Acura, Audi, BMW, Buick, Cadillac, Chevrolet, Chrysler, Dodge, Ford, GMC, Honda, Hyundai, Infiniti, Jeep, Kia, Lexus, Lincoln, Mazda, Mercedes-Benz, Mercury, Mitsubishi, Nissan, Oldsmobile, Plymouth, Pontiac, Ram, Saturn, Subaru, Toyota, Volkswagen, Volvo
- **40 Auto Parts** - Common parts like Engine, Transmission, Brakes, etc.
- **500+ Cities** - Major cities across the US
- **50+ States** - All US states plus Canadian provinces

## 🎨 Design

- **Color Scheme**: Orange (#FF6B35) and Teal (#2C5F5D)
- **Responsive**: Works on desktop, tablet, and mobile
- **Modern UI**: Tailwind CSS with custom styling
- **Background**: Junkyard-themed imagery

## 🛠️ Technology Stack

- **React 18** - UI framework
- **Vite 5** - Build tool and dev server
- **React Router 6** - Client-side routing
- **Tailwind CSS 3** - Utility-first CSS framework

## 📝 Usage

### Lead Form Search
1. Select a **Make** (e.g., Toyota)
2. Select a **Model** (e.g., Camry) - automatically filtered
3. Select a **Part** (e.g., Engine)
4. Select a **Year** (e.g., 2020)
5. Click **"FIND MY PART NOW"**
6. View filtered junkyard results

### ZIP Code Search
1. Enter a ZIP code or location name
2. Click **"SEARCH. IT'S FREE!"**
3. View nearby junkyards

### Browse by State
1. Click **"JUNK YARDS BY LOCATION"**
2. Select a state
3. View all junkyards in that state

## 🔧 Development

```bash
# Install dependencies
npm install

# Start dev server (port 3000)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📦 Self-Contained

This project is completely self-contained with:
- ✅ All data files in `public/data/`
- ✅ All components and pages in `src/`
- ✅ All dependencies in `package.json`
- ✅ No external database required
- ✅ Ready to deploy anywhere

## 🚀 Deployment

The built website can be deployed to any static hosting service:
- Vercel
- Netlify
- GitHub Pages
- AWS S3
- Any web server

Simply run `npm run build` and deploy the `dist/` folder.

## 📄 License

This project is part of the JYNM (JunkYardNearMe.com) platform.
