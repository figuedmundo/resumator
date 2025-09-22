# Development Environment - Quick Start

## 🚨 Fixed Issues
- ✅ **process is not defined** error fixed by updating to Vite environment variables
- ✅ Hot reloading enabled for both frontend and backend
- ✅ Email-based authentication working correctly
- ✅ Docker development environment properly configured

## 🚀 Start Development

```bash
# 1. Copy environment variables
cp .env.dev .env

# 2. Edit .env and add your API keys
# - GROQ_API_KEY=your-groq-api-key-here
# - JWT_SECRET=your-secure-jwt-secret

# 3. Start development environment
docker compose up

# 4. Access the app
# Frontend: http://localhost:3000
# Backend:  http://localhost:8000
# API Docs: http://localhost:8000/docs
```

## 🔧 Troubleshooting

Run the debug script if you encounter issues:
```bash
./debug-dev.sh
```

## 🔄 Hot Reloading

- **Frontend**: Edit files in `./frontend/src/` - changes appear instantly
- **Backend**: Edit files in `./backend/app/` - server restarts automatically

## 🐛 Common Issues Fixed

### 1. "process is not defined" Error
**Fixed**: Changed from `process.env.REACT_APP_*` to `import.meta.env.VITE_*`

### 2. Environment Variables Not Working  
**Fixed**: Created proper `.env.development` for frontend with `VITE_` prefix

### 3. Hot Reloading Not Working
**Fixed**: Added proper volume mounts and `CHOKIDAR_USEPOLLING=true`

### 4. API Connectivity Issues
**Fixed**: Updated service names and proxy configuration

## 📚 Full Documentation

See the complete development guide in the artifacts above for detailed information about:
- Environment variable configuration
- Docker setup details
- Authentication system changes
- Troubleshooting steps
