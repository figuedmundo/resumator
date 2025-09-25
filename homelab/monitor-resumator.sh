#!/bin/bash

# Simple monitoring script for Resumator in Home Lab
HOMELAB_ROOT="$1"

if [ -z "$HOMELAB_ROOT" ]; then
    echo "❌ Usage: $0 /path/to/your/homelab"
    echo "   Example: $0 /home/yourusername"
    exit 1
fi

APP_DIR="$HOMELAB_ROOT/apps/resumator"

if [ ! -d "$APP_DIR" ]; then
    echo "❌ Resumator not found in $APP_DIR"
    exit 1
fi

echo "📊 Resumator Status Report"
echo "========================="

cd "$APP_DIR"

# Check container status
echo "🐳 Container Status:"
docker-compose -f docker-compose.resumator.yml ps

echo ""
echo "💾 Disk Usage:"
du -sh storage/ logs/ 2>/dev/null || echo "Storage directories not found"

echo ""
echo "📈 Recent Backend Logs (last 20 lines):"
docker-compose -f docker-compose.resumator.yml logs --tail=20 resumator-backend

echo ""
echo "🔄 Worker Logs (last 10 lines):"
docker-compose -f docker-compose.resumator.yml logs --tail=10 resumator-worker

# Load environment to get domain
set -a
source "$HOMELAB_ROOT/.env" 2>/dev/null || echo "Could not load .env"
set +a

echo ""
echo "🏥 Health Check:"
if [ ! -z "$RESUMATOR_DOMAIN" ]; then
    curl -f -s "https://$RESUMATOR_DOMAIN/api/v1/health" && echo "✅ API Healthy" || echo "❌ API Health check failed"
    curl -f -s "https://$RESUMATOR_DOMAIN/" > /dev/null && echo "✅ Frontend Accessible" || echo "❌ Frontend not accessible"
else
    echo "⚠️  RESUMATOR_DOMAIN not set"
fi

echo ""
echo "🗄️  Database Status:"
POSTGRES_USER=$(grep "POSTGRES_USER=" "$HOMELAB_ROOT/.env" | cut -d'=' -f2)
RESUMATOR_DB_NAME=$(grep "RESUMATOR_DB_NAME=" "$HOMELAB_ROOT/.env" | cut -d'=' -f2)

if [ ! -z "$POSTGRES_USER" ] && [ ! -z "$RESUMATOR_DB_NAME" ]; then
    cd "$HOMELAB_ROOT"
    docker-compose exec -T postgres psql -U "$POSTGRES_USER" -d "$RESUMATOR_DB_NAME" -c "SELECT COUNT(*) as user_count FROM users;" 2>/dev/null || echo "❌ Database connection failed"
else
    echo "⚠️  Database variables not set"
fi

echo ""
echo "📊 System Resources:"
docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}" | grep resumator || echo "No resource data available"
