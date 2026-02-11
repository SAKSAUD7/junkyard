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

Frontend will be available at: **http://localhost:3001**

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
