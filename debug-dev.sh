#!/bin/bash

echo "🔍 Resumator Development Environment Troubleshooting"
echo "===================================================="

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

echo "✅ Docker is running"

# Check if .env file exists
if [ -f ".env" ]; then
    echo "✅ .env file exists"
else
    echo "⚠️  .env file not found. Copying from .env.dev template..."
    cp .env.dev .env
    echo "📝 Please edit .env and add your API keys:"
    echo "   - GROQ_API_KEY=your-groq-api-key"
    echo "   - JWT_SECRET=your-secure-jwt-secret"
fi

# Check if containers are running
echo ""
echo "📊 Container Status:"
docker compose ps

# Check frontend environment variables
echo ""
echo "🌐 Frontend Environment Variables:"
if docker compose exec -T frontend env | grep -E "VITE_|NODE_ENV" 2>/dev/null; then
    echo "✅ Frontend environment looks good"
else
    echo "⚠️  Frontend environment variables may be missing"
fi

# Check backend environment variables
echo ""
echo "🔧 Backend Environment Variables:"
if docker compose exec -T backend env | grep -E "DATABASE_URL|JWT_SECRET|DEBUG" 2>/dev/null; then
    echo "✅ Backend environment looks good"
else
    echo "⚠️  Backend environment variables may be missing"
fi

# Test API connectivity
echo ""
echo "🌐 API Connectivity Test:"
if curl -s http://localhost:8000/health > /dev/null 2>&1; then
    echo "✅ Backend API is responding"
else
    echo "❌ Backend API is not responding at http://localhost:8000"
    echo "   Check backend logs: docker compose logs backend"
fi

# Test frontend connectivity
echo ""
echo "🖥️  Frontend Connectivity Test:"
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Frontend is responding"
else
    echo "❌ Frontend is not responding at http://localhost:3000"
    echo "   Check frontend logs: docker compose logs frontend"
fi

# Check database connectivity
echo ""
echo "🗃️  Database Connectivity Test:"
if docker compose exec -T db pg_isready -U resumator > /dev/null 2>&1; then
    echo "✅ Database is ready"
else
    echo "❌ Database is not ready"
    echo "   Check database logs: docker compose logs db"
fi

echo ""
echo "🚀 Quick Commands:"
echo "   View logs: docker compose logs -f frontend backend"
echo "   Restart:   docker compose restart"
echo "   Rebuild:   docker compose build"
echo "   Stop all:  docker compose down"
echo ""
echo "🌐 Access URLs:"
echo "   Frontend:     http://localhost:3000"
echo "   Backend:      http://localhost:8000"
echo "   API Docs:     http://localhost:8000/docs"
echo "   MinIO Admin:  http://localhost:9001"
