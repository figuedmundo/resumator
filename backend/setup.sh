#!/bin/bash

# Resumator Setup Script
# This script helps you set up the database and seed initial data

set -e  # Exit on any error

echo "🚀 Resumator Setup Script"
echo "========================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "docker-compose.yml" ]; then
    echo -e "${RED}❌ Error: docker-compose.yml not found${NC}"
    echo "Please run this script from the project root directory"
    exit 1
fi

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if Docker is running
if ! docker info >/dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker first."
    exit 1
fi

print_status "Docker is running"

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    print_info "Creating .env file from .env.example..."
    if [ -f "backend/.env.example" ]; then
        cp backend/.env.example .env
        print_status "Created .env file"
    else
        print_warning ".env.example not found, creating basic .env"
        cat > .env << EOF
# Database
DATABASE_URL=postgresql://resumator:password@db:5432/resumator

# JWT Secret (change this in production!)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Groq API Configuration
GROQ_API_KEY=your-groq-api-key-here
GROQ_MODEL_NAME=llama3-8b-8192

# Admin User (for seeding)
ADMIN_USERNAME=admin
ADMIN_EMAIL=admin@resumator.local
ADMIN_PASSWORD=admin123!
EOF
    fi
else
    print_status ".env file already exists"
fi

# Prompt user to set up Groq API key
if grep -q "your-groq-api-key-here" .env 2>/dev/null; then
    print_warning "Groq API key is not set in .env file"
    read -p "Do you have a Groq API key? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        read -p "Enter your Groq API key: " GROQ_KEY
        if [ ! -z "$GROQ_KEY" ]; then
            # Replace the placeholder in .env file
            sed -i.bak "s/your-groq-api-key-here/$GROQ_KEY/" .env
            print_status "Groq API key updated in .env file"
        fi
    else
        print_info "You can get a free Groq API key at: https://console.groq.com"
        print_info "Update GROQ_API_KEY in .env file before using AI features"
    fi
fi

# Stop any existing services
echo
print_info "Stopping any existing services..."
docker-compose down -v 2>/dev/null || true

# Build and start services
echo
print_info "Building and starting services..."
docker-compose up -d --build

# Wait for database to be ready
echo
print_info "Waiting for database to be ready..."
for i in {1..30}; do
    if docker-compose exec -T db pg_isready -U resumator >/dev/null 2>&1; then
        print_status "Database is ready"
        break
    fi
    if [ $i -eq 30 ]; then
        print_error "Database failed to start after 30 seconds"
        print_info "Check logs with: docker-compose logs db"
        exit 1
    fi
    echo -n "."
    sleep 1
done

# Wait for backend to be ready
echo
print_info "Waiting for backend to be ready..."
for i in {1..60}; do
    if curl -f http://localhost:8000/health >/dev/null 2>&1; then
        print_status "Backend is ready"
        break
    fi
    if [ $i -eq 60 ]; then
        print_error "Backend failed to start after 60 seconds"
        print_info "Check logs with: docker-compose logs backend"
        exit 1
    fi
    echo -n "."
    sleep 1
done

# Run database seeding
echo
print_info "Seeding database with admin user..."
if docker-compose exec -T backend python seed_admin.py; then
    print_status "Database seeded successfully"
else
    print_error "Failed to seed database"
    print_info "You can run it manually: docker-compose exec backend python seed_admin.py"
fi

# Check service status
echo
print_info "Checking service status..."
docker-compose ps

echo
print_status "Setup completed successfully! 🎉"
echo
echo "📋 What's been set up:"
echo "   • PostgreSQL database with initial schema"
echo "   • Backend API server"
echo "   • Frontend React application"
echo "   • Redis for caching"
echo "   • MinIO for file storage"
echo "   • Admin user account"
echo
echo "🌐 Access the application:"
echo "   • Frontend: http://localhost:3000"
echo "   • Backend API: http://localhost:8000"
echo "   • API Docs: http://localhost:8000/docs"
echo "   • MinIO Console: http://localhost:9001"
echo
echo "👤 Admin Login:"
echo "   • Username: admin"
echo "   • Email: admin@resumator.local"
echo "   • Password: admin123!"
echo
echo "📚 Useful commands:"
echo "   • View logs: docker-compose logs -f [service_name]"
echo "   • Stop services: docker-compose down"
echo "   • Restart: docker-compose restart"
echo "   • Seed more data: docker-compose exec backend python seed_admin.py"
echo
if grep -q "your-groq-api-key-here" .env 2>/dev/null; then
    print_warning "Don't forget to set your Groq API key in .env for AI features!"
fi

print_info "Happy resume customizing! 📄✨"