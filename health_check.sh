#!/bin/bash

# Resumator Project Health Check Script
# This script verifies that both backend and frontend are working correctly

echo "🔍 RESUMATOR PROJECT HEALTH CHECK"
echo "=================================="
echo ""

PROJECT_ROOT="/Users/edmundo.figueroaherbas@medirect.com.mt/projects/resumator"
BACKEND_DIR="$PROJECT_ROOT/backend"
FRONTEND_DIR="$PROJECT_ROOT/frontend"

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if directories exist
echo "📁 Checking project structure..."
if [ ! -d "$PROJECT_ROOT" ]; then
    echo -e "${RED}❌ Project root directory not found: $PROJECT_ROOT${NC}"
    exit 1
fi

if [ ! -d "$BACKEND_DIR" ]; then
    echo -e "${RED}❌ Backend directory not found: $BACKEND_DIR${NC}"
    exit 1
fi

if [ ! -d "$FRONTEND_DIR" ]; then
    echo -e "${RED}❌ Frontend directory not found: $FRONTEND_DIR${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Project directories found${NC}"
echo ""

# Check Python and Node versions
echo "🔧 Checking system requirements..."
python_version=$(python3 --version 2>/dev/null)
node_version=$(node --version 2>/dev/null)

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Python: $python_version${NC}"
else
    echo -e "${RED}❌ Python 3 not found${NC}"
fi

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Node.js: $node_version${NC}"
else
    echo -e "${RED}❌ Node.js not found${NC}"
fi
echo ""

# Check backend dependencies
echo "🐍 Checking backend setup..."
cd "$BACKEND_DIR"

if [ ! -f "requirements.txt" ]; then
    echo -e "${RED}❌ requirements.txt not found${NC}"
else
    echo -e "${GREEN}✅ requirements.txt found${NC}"
fi

if [ ! -f "main.py" ]; then
    echo -e "${RED}❌ main.py not found${NC}"
else
    echo -e "${GREEN}✅ main.py found${NC}"
fi

# Check if virtual environment is recommended
if [ ! -d "venv" ] && [ ! -d ".venv" ]; then
    echo -e "${YELLOW}⚠️  No virtual environment detected. Consider creating one:${NC}"
    echo "   python3 -m venv venv"
    echo "   source venv/bin/activate"
fi

echo ""

# Check frontend dependencies
echo "⚛️  Checking frontend setup..."
cd "$FRONTEND_DIR"

if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ package.json not found${NC}"
else
    echo -e "${GREEN}✅ package.json found${NC}"
fi

if [ ! -f "vite.config.js" ]; then
    echo -e "${RED}❌ vite.config.js not found${NC}"
else
    echo -e "${GREEN}✅ vite.config.js found${NC}"
fi

if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}⚠️  node_modules not found. Run: npm install${NC}"
else
    echo -e "${GREEN}✅ node_modules found${NC}"
fi

echo ""

# Check key source files
echo "📄 Checking key source files..."

# Backend files
backend_files=(
    "app/__init__.py"
    "app/main.py"
    "app/api/v1/auth.py"
    "app/api/v1/resumes.py"
    "app/models/user.py"
    "app/models/resume.py"
)

cd "$BACKEND_DIR"
for file in "${backend_files[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅ Backend: $file${NC}"
    else
        echo -e "${RED}❌ Backend: $file missing${NC}"
    fi
done

# Frontend files
frontend_files=(
    "src/App.jsx"
    "src/main.jsx"
    "src/services/api.js"
    "src/hooks/useAuth.js"
    "src/pages/DashboardPage.jsx"
    "src/pages/ResumesPage.jsx"
    "src/components/common/Header.jsx"
    "src/styles/globals.css"
)

cd "$FRONTEND_DIR"
for file in "${frontend_files[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅ Frontend: $file${NC}"
    else
        echo -e "${RED}❌ Frontend: $file missing${NC}"
    fi
done

echo ""

# Test backend startup (if possible)
echo "🚀 Testing backend startup..."
cd "$BACKEND_DIR"

# Check if backend can be imported
python3 -c "
try:
    from app.main import app
    print('✅ Backend app can be imported successfully')
except Exception as e:
    print(f'❌ Backend import error: {e}')
    exit(1)
" 2>/dev/null

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Backend imports working${NC}"
else
    echo -e "${RED}❌ Backend import issues detected${NC}"
fi

echo ""

# Test frontend build
echo "⚛️  Testing frontend build..."
cd "$FRONTEND_DIR"

if [ -d "node_modules" ]; then
    echo "Attempting frontend build test..."
    npm run build --silent > /dev/null 2>&1
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Frontend builds successfully${NC}"
        # Clean up build directory
        rm -rf dist 2>/dev/null
    else
        echo -e "${RED}❌ Frontend build issues detected${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Skipping build test (node_modules missing)${NC}"
fi

echo ""

# Configuration check
echo "⚙️  Checking configuration..."

cd "$BACKEND_DIR"
if grep -q "DATABASE_URL" app/core/config.py 2>/dev/null; then
    echo -e "${GREEN}✅ Backend database configuration found${NC}"
else
    echo -e "${YELLOW}⚠️  Backend database configuration check${NC}"
fi

cd "$FRONTEND_DIR"
if grep -q "proxy" vite.config.js 2>/dev/null; then
    echo -e "${GREEN}✅ Frontend API proxy configured${NC}"
else
    echo -e "${YELLOW}⚠️  Frontend API proxy configuration check${NC}"
fi

echo ""

# Port availability check
echo "🌐 Checking port availability..."
if lsof -i :8000 >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Port 8000 is in use (backend may be running)${NC}"
else
    echo -e "${GREEN}✅ Port 8000 available for backend${NC}"
fi

if lsof -i :3000 >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Port 3000 is in use (frontend may be running)${NC}"
else
    echo -e "${GREEN}✅ Port 3000 available for frontend${NC}"
fi

echo ""

# Summary and instructions
echo "📋 HEALTH CHECK SUMMARY"
echo "======================"
echo ""
echo -e "${BLUE}🔧 TO START THE PROJECT:${NC}"
echo ""
echo "1. Backend Setup:"
echo "   cd $BACKEND_DIR"
echo "   # Optional: python3 -m venv venv && source venv/bin/activate"
echo "   pip install -r requirements.txt"
echo "   uvicorn main:app --reload"
echo ""
echo "2. Frontend Setup (in new terminal):"
echo "   cd $FRONTEND_DIR"
echo "   npm install  # if not already done"
echo "   npm run dev"
echo ""
echo "3. Access:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:8000"
echo "   API Docs: http://localhost:8000/docs"
echo ""
echo -e "${BLUE}📝 TEST USER FLOW:${NC}"
echo "1. Navigate to http://localhost:3000"
echo "2. Register new account"
echo "3. Login with credentials"
echo "4. Check dashboard loads"
echo "5. Navigate to Resumes page"
echo "6. Test logout"
echo ""
echo -e "${BLUE}🐛 IF ISSUES OCCUR:${NC}"
echo "- Check terminal outputs for errors"
echo "- Verify both services are running"
echo "- Check browser developer console"
echo "- Ensure API connectivity between frontend/backend"
echo ""
echo -e "${GREEN}✨ Health check completed!${NC}"
