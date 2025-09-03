# 🚀 Resumator Quick Reference Card

## 📍 Project Location
```
/Users/edmundo.figueroaherbas@medirect.com.mt/projects/resumator/
```

## ⚡ Quick Start Commands

### Full Health Check
```bash
./health_check.sh
```

### Start Backend (Terminal 1)
```bash
cd backend/
uvicorn main:app --reload
```
**Expected:** Server running on http://localhost:8000

### Start Frontend (Terminal 2)
```bash
cd frontend/
npm run dev
```
**Expected:** Dev server running on http://localhost:3000

## 🧪 Quick Test Flow

1. **Health Check:** `./health_check.sh`
2. **Backend Test:** Visit http://localhost:8000/docs
3. **Frontend Test:** Visit http://localhost:3000
4. **User Flow Test:**
   - Register: test@example.com / TestPass123
   - Login with same credentials
   - Check dashboard loads
   - Navigate to Resumes page
   - Test logout

## 📊 Project Status

| Component | Status | Notes |
|-----------|---------|-------|
| Backend API | ✅ Complete | All endpoints working |
| Frontend Auth | ✅ Complete | Login/register/logout |
| Frontend Dashboard | ✅ Complete | Stats and navigation |
| Frontend Routing | ✅ Complete | Protected routes |
| Resume Editor | 🔄 Placeholder | **Next priority** |
| AI Customization | 🔄 Placeholder | **Next priority** |
| Application Tracking | 🔄 Placeholder | Future feature |

## 🔧 Key API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register user
- `POST /api/v1/auth/login` - Login (form data)
- `GET /api/v1/auth/verify-token` - Verify JWT

### Resumes  
- `GET /api/v1/resumes/` - List resumes
- `POST /api/v1/resumes/upload` - Upload resume
- `POST /api/v1/resumes/{id}/customize` - AI customize

### Applications
- `GET /api/v1/applications/` - List applications
- `POST /api/v1/applications/` - Create application

## 🚨 Common Issues

| Issue | Solution |
|-------|----------|
| Port 8000 in use | Use `--port 8001` or kill existing process |
| Frontend won't connect | Check backend is running on localhost:8000 |
| Auth not working | Clear browser localStorage |
| Build errors | Run `npm install` in frontend/ |
| Import errors | Install backend dependencies: `pip install -r requirements.txt` |

## 📁 Key Files to Check

### Backend
- `backend/main.py` - FastAPI entry point
- `backend/app/api/v1/auth.py` - Auth endpoints
- `backend/app/models/` - Database models

### Frontend  
- `frontend/src/App.jsx` - Main app with routing
- `frontend/src/services/api.js` - API client
- `frontend/src/pages/DashboardPage.jsx` - Dashboard

## 🎯 What Works Right Now

✅ **User Registration & Login**  
✅ **Dashboard with welcome message**  
✅ **Resume list page (empty state)**  
✅ **Protected routing**  
✅ **Responsive design**  
✅ **API integration**  
✅ **Token management**  

## 🔄 What Needs Implementation

🔲 **Resume Editor** (CodeMirror + markdown)  
🔲 **AI Customization UI** (job description input)  
🔲 **Resume Viewer** (formatted display)  
🔲 **Application Management** (CRUD interface)  
🔲 **PDF Generation UI** (download buttons)  

---
**Last Updated:** September 2025  
**Status:** Foundation Complete ✅
