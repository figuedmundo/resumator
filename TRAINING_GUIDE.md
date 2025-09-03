# Resumator Project Documentation - Training Guide

## 📋 Project Overview

**Project Name:** Resumator  
**Purpose:** AI-powered resume customization platform for job applications  
**Architecture:** FastAPI backend + React frontend  
**Project Path:** `/Users/edmundo.figueroaherbas@medirect.com.mt/projects/resumator/`

### Core Concept
Resumator allows users to:
1. Upload/create markdown resumes
2. Customize resumes using AI based on job descriptions
3. Generate PDF downloads
4. Track job applications

## 🏗️ Project Architecture

```
resumator/
├── backend/          # FastAPI backend (COMPLETED)
│   ├── app/
│   │   ├── api/v1/   # API routes
│   │   ├── models/   # Database models
│   │   ├── services/ # Business logic
│   │   └── core/     # Configuration
│   ├── requirements.txt
│   └── main.py
└── frontend/         # React frontend (FOUNDATION COMPLETE)
    ├── src/
    │   ├── pages/    # Route components
    │   ├── components/ # Reusable components
    │   ├── services/ # API integration
    │   ├── hooks/    # React hooks
    │   └── utils/    # Utilities
    ├── package.json
    └── vite.config.js
```

## 🔧 Technology Stack

### Backend (Complete)
- **Framework:** FastAPI (Python)
- **Database:** SQLAlchemy with PostgreSQL/SQLite
- **Authentication:** JWT tokens
- **AI Integration:** OpenAI API for resume customization
- **PDF Generation:** ReportLab
- **File Handling:** Markdown processing

### Frontend (Foundation Complete)
- **Framework:** React 18 + Vite
- **Routing:** React Router v6
- **Styling:** Tailwind CSS
- **HTTP Client:** Axios
- **State Management:** React Context API
- **Authentication:** JWT with refresh tokens
- **Editor:** CodeMirror (planned)

## ✅ Current Status

### Backend Status: **COMPLETED** ✅
All backend functionality is implemented and working:
- ✅ User registration and authentication
- ✅ Resume CRUD operations
- ✅ AI-powered resume customization
- ✅ PDF generation and download
- ✅ Job application tracking
- ✅ File upload handling
- ✅ Database models and migrations

### Frontend Status: **FOUNDATION COMPLETE** ✅
Core infrastructure is ready, some features need implementation:
- ✅ Authentication system (login/register)
- ✅ Protected routing
- ✅ Dashboard with statistics
- ✅ Resume list page
- ✅ API integration layer
- ✅ Responsive design system
- 🔄 Resume editor (placeholder - needs implementation)
- 🔄 Resume customization UI (placeholder)
- 🔄 Application management (placeholder)
- 🔄 Resume viewer (placeholder)

## 🧪 How to Test the Current System

### Prerequisites Check
1. **Backend Dependencies:**
   ```bash
   cd backend/
   pip install -r requirements.txt
   ```

2. **Frontend Dependencies:**
   ```bash
   cd frontend/
   npm install
   ```

### Backend Testing
1. **Start the backend:**
   ```bash
   cd backend/
   uvicorn main:app --reload
   ```
   - Should start on `http://localhost:8000`
   - API docs available at `http://localhost:8000/docs`

2. **Test API endpoints:**
   ```bash
   # Health check
   curl http://localhost:8000/health
   
   # Register user
   curl -X POST http://localhost:8000/api/v1/auth/register \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"TestPass123","full_name":"Test User"}'
   ```

### Frontend Testing
1. **Start the frontend:**
   ```bash
   cd frontend/
   npm run dev
   ```
   - Should start on `http://localhost:3000`
   - Should proxy API calls to backend

2. **Test user flow:**
   - Navigate to `http://localhost:3000`
   - Should redirect to login (not authenticated)
   - Register a new account
   - Should redirect to dashboard after successful registration
   - Check dashboard loads with welcome message
   - Navigate to "Resumes" page (should show empty state)
   - Test logout functionality

### Expected Working Features
- ✅ User registration with validation
- ✅ User login with error handling  
- ✅ Dashboard statistics display
- ✅ Protected route navigation
- ✅ Responsive header with user menu
- ✅ Resume list page (shows empty state initially)
- ✅ Automatic token refresh
- ✅ Clean logout functionality

## 📊 API Endpoints Reference

### Authentication
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login (Form data: username, password)
- `GET /api/v1/auth/verify-token` - Verify JWT token
- `POST /api/v1/auth/refresh-token` - Refresh expired token

### Resumes
- `GET /api/v1/resumes/` - List user's resumes
- `POST /api/v1/resumes/upload` - Upload resume file
- `GET /api/v1/resumes/{id}` - Get specific resume
- `PUT /api/v1/resumes/{id}` - Update resume
- `DELETE /api/v1/resumes/{id}` - Delete resume
- `POST /api/v1/resumes/{id}/customize` - AI customize resume
- `GET /api/v1/resumes/{id}/download` - Download resume as PDF

### Applications
- `GET /api/v1/applications/` - List job applications
- `POST /api/v1/applications/` - Create application
- `GET /api/v1/applications/{id}` - Get application
- `PUT /api/v1/applications/{id}` - Update application
- `DELETE /api/v1/applications/{id}` - Delete application

## 🚨 Common Issues & Solutions

### Backend Issues
1. **Port 8000 already in use:**
   ```bash
   uvicorn main:app --reload --port 8001
   ```

2. **Database connection errors:**
   - Check SQLite file permissions
   - Ensure database migrations ran

3. **Import errors:**
   - Verify all dependencies in requirements.txt are installed
   - Check Python version compatibility

### Frontend Issues
1. **Port 3000 already in use:**
   ```bash
   npm run dev -- --port 3001
   ```

2. **API connection refused:**
   - Ensure backend is running on localhost:8000
   - Check proxy configuration in vite.config.js

3. **Authentication issues:**
   - Clear browser localStorage
   - Check JWT token format
   - Verify API endpoints are responding

### Network Issues
1. **CORS errors:**
   - Backend should allow localhost:3000 origin
   - Check FastAPI CORS middleware configuration

2. **Proxy not working:**
   - Verify Vite proxy config matches backend URL
   - Restart frontend dev server after config changes

## 🔍 Debug Commands

### Check Backend Health
```bash
curl -v http://localhost:8000/health
curl -v http://localhost:8000/docs
```

### Check Frontend Build
```bash
cd frontend/
npm run build  # Should complete without errors
```

### Inspect Database
```bash
cd backend/
python -c "from app.database import engine; from sqlalchemy import inspect; print(inspect(engine).get_table_names())"
```

## 📝 Key Files to Check

### Backend Key Files
- `backend/main.py` - FastAPI app entry point
- `backend/app/api/v1/auth.py` - Authentication endpoints
- `backend/app/api/v1/resumes.py` - Resume endpoints
- `backend/app/models/user.py` - User model
- `backend/app/models/resume.py` - Resume model
- `backend/app/core/config.py` - Configuration
- `backend/requirements.txt` - Python dependencies

### Frontend Key Files
- `frontend/src/App.jsx` - Main application with routing
- `frontend/src/main.jsx` - React entry point
- `frontend/src/services/api.js` - API service layer
- `frontend/src/hooks/useAuth.js` - Authentication hook
- `frontend/src/pages/DashboardPage.jsx` - Dashboard implementation
- `frontend/src/pages/ResumesPage.jsx` - Resume list page
- `frontend/package.json` - NPM dependencies
- `frontend/vite.config.js` - Vite configuration

## 🎯 Testing Checklist

### Full System Test
- [ ] Backend starts without errors
- [ ] Frontend starts and connects to backend
- [ ] User can register new account
- [ ] User can login with valid credentials
- [ ] Dashboard shows welcome message and stats
- [ ] Navigation between pages works
- [ ] User can logout successfully
- [ ] API calls include proper authentication headers
- [ ] Error messages display appropriately
- [ ] Responsive design works on mobile

### API Integration Test
- [ ] Register endpoint creates user in database
- [ ] Login endpoint returns valid JWT token
- [ ] Protected endpoints require authentication
- [ ] Token refresh works automatically
- [ ] Resume endpoints return proper data structures
- [ ] File upload endpoints accept multipart/form-data

### Frontend Features Test
- [ ] Form validation works on auth pages
- [ ] Loading states display during API calls
- [ ] Error states show user-friendly messages
- [ ] Routing redirects work properly
- [ ] Header menu functions correctly
- [ ] Dashboard stats load from API
- [ ] Empty states display when no data

## 🔄 Next Development Phase

### Priority 1: Resume Editor
The next major feature to implement is the resume editor:
- Markdown editor with CodeMirror
- Real-time preview
- Auto-save functionality
- File upload integration

### Priority 2: AI Customization
Implement the AI customization interface:
- Job description input form
- Customization request handling
- Display customized vs original versions
- Save/manage multiple versions

### Priority 3: Application Management
Complete the application tracking system:
- Application form with resume linking
- Status management
- Application list with filtering
- Notes and follow-up tracking

## 📞 Support Information

### Getting Help
If you encounter issues:
1. Check this documentation first
2. Review error messages in browser console and terminal
3. Verify all dependencies are installed
4. Ensure both backend and frontend are running
5. Check network connectivity between components

### Environment Requirements
- **Python:** 3.8+ (for backend)
- **Node.js:** 18+ (for frontend)
- **Operating System:** macOS/Linux/Windows
- **Browser:** Chrome, Firefox, Safari (latest versions)

---

**Document Version:** 1.0  
**Last Updated:** September 2025  
**Project Status:** Foundation Complete, Ready for Feature Development
