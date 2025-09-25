#!/bin/bash

set -e

echo "🚀 Deploying Resumator to Home Lab..."

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
RESUMATOR_SOURCE="$SCRIPT_DIR/.."
HOMELAB_ROOT="$1"

if [ -z "$HOMELAB_ROOT" ]; then
    echo "❌ Usage: $0 /path/to/your/homelab"
    echo "   Example: $0 /home/yourusername"
    exit 1
fi

if [ ! -f "$HOMELAB_ROOT/docker-compose.yaml" ]; then
    echo "❌ Home lab docker-compose.yaml not found in $HOMELAB_ROOT"
    exit 1
fi

# App directory
APP_DIR="$HOMELAB_ROOT/apps/resumator"

echo "📁 Creating application directory: $APP_DIR"
mkdir -p "$APP_DIR"

# Copy Resumator files
echo "📋 Copying Resumator files..."
cp -r "$RESUMATOR_SOURCE/backend" "$APP_DIR/"
cp -r "$RESUMATOR_SOURCE/frontend" "$APP_DIR/"
cp "$RESUMATOR_SOURCE/homelab/docker-compose.resumator.yml" "$APP_DIR/"

# Create storage and logs directories
mkdir -p "$APP_DIR"/{storage,logs}
chmod 755 "$APP_DIR"/{storage,logs}

# Check if environment variables exist
if ! grep -q "RESUMATOR_DOMAIN" "$HOMELAB_ROOT/.env" 2>/dev/null; then
    echo "📝 Adding Resumator environment variables..."
    
    # Get base domain from existing env
    BASE_DOMAIN=$(grep "BASE_DOMAIN=" "$HOMELAB_ROOT/.env" 2>/dev/null | cut -d'=' -f2 || echo "localhost")
    
    cat >> "$HOMELAB_ROOT/.env" << EOF

# Resumator Configuration
RESUMATOR_DOMAIN=resumator.${BASE_DOMAIN}
RESUMATOR_DB_NAME=resumator
RESUMATOR_DB_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
RESUMATOR_JWT_SECRET=$(openssl rand -hex 32)
GROQ_API_KEY=your-groq-api-key-here
GROQ_MODEL_NAME=llama3-8b-8192
EOF

    echo "✏️  Please edit $HOMELAB_ROOT/.env and set your GROQ_API_KEY"
    echo "   Get your API key from: https://console.groq.com/keys"
    read -p "Press Enter after you've updated the GROQ_API_KEY..."
fi

# Update Caddyfile
CADDYFILE="$HOMELAB_ROOT/docker/caddy/Caddyfile"
if [ -f "$CADDYFILE" ] && ! grep -q "RESUMATOR_DOMAIN" "$CADDYFILE"; then
    echo "🌐 Updating Caddyfile..."
    
    cat >> "$CADDYFILE" << 'EOF'

# Resumator Application
{$RESUMATOR_DOMAIN} {
    # Rate limiting for security
    rate_limit {
        zone resumator_api 30r/m 100
        zone resumator_global 100r/m 100
    }
    
    # Security headers
    header {
        X-Content-Type-Options "nosniff"
        X-Frame-Options "DENY"  
        X-XSS-Protection "1; mode=block"
        Referrer-Policy "strict-origin-when-cross-origin"
        Strict-Transport-Security "max-age=63072000; includeSubDomains; preload"
        Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https:; font-src 'self' https://fonts.gstatic.com; connect-src 'self' wss: https:; frame-ancestors 'none';"
        Permissions-Policy "microphone=(), camera=(), geolocation=(), payment=(), usb=()"
        -Server
    }
    
    # API routes with enhanced security
    handle_path /api/* {
        rate_limit resumator_api
        
        reverse_proxy resumator-backend:8000 {
            health_uri /health
            health_interval 30s
            health_timeout 5s
            
            header_up Host {http.request.host}
            header_up X-Real-IP {http.request.remote.host}
            header_up X-Forwarded-For {http.request.remote.host}
            header_up X-Forwarded-Proto {http.request.scheme}
            header_up X-Forwarded-Host {http.request.host}
            
            timeout 30s
            
            header_down -X-Powered-By
            header_down -Server
        }
    }
    
    # Static files with caching
    @static {
        path *.js *.css *.png *.jpg *.jpeg *.gif *.ico *.svg *.woff *.woff2 *.ttf *.eot
    }
    
    handle @static {
        header Cache-Control "public, max-age=31536000"
        root * /usr/share/nginx/html
        file_server
    }
    
    # SPA fallback for React Router
    handle {
        root * /usr/share/nginx/html
        try_files {path} /index.html
        file_server
    }
    
    # Compression
    encode {
        gzip 6
        minimum_length 1000
    }
    
    # DNS challenge for SSL
    tls {
        dns cloudflare {$CLOUDFLARE_API_TOKEN}
    }
    
    # Access logging
    log {
        output file /var/log/caddy/resumator.log {
            roll_size 100MB
            roll_keep 5
            roll_keep_for 720h
        }
        level INFO
        format json {
            time_format "2006-01-02T15:04:05Z07:00"
        }
    }
}
EOF

    echo "✅ Caddyfile updated"
else
    echo "ℹ️  Caddyfile already contains Resumator configuration"
fi

# Update Cloudflare DDNS domains
echo "🌩️  Updating Cloudflare DDNS configuration..."
DOCKER_COMPOSE="$HOMELAB_ROOT/docker-compose.yaml"
if [ -f "$DOCKER_COMPOSE" ] && ! grep -q "RESUMATOR_DOMAIN" "$DOCKER_COMPOSE"; then
    # Add RESUMATOR_DOMAIN to the DOMAINS environment variable
    sed -i 's/DOMAINS=${NEXTCLOUD_DOMAIN},${GLANCES_DOMAIN},${TRADING_REPORT_DOMAIN},${TAROT_API_DOMAIN}/DOMAINS=${NEXTCLOUD_DOMAIN},${GLANCES_DOMAIN},${TRADING_REPORT_DOMAIN},${TAROT_API_DOMAIN},${RESUMATOR_DOMAIN}/' "$DOCKER_COMPOSE"
    echo "✅ Added Resumator domain to Cloudflare DDNS"
else
    echo "ℹ️  Cloudflare DDNS already configured"
fi

# Load environment variables
echo "⚙️  Loading environment variables..."
set -a
source "$HOMELAB_ROOT/.env"
set +a

# Check if GROQ_API_KEY is set
if [ "$GROQ_API_KEY" = "your-groq-api-key-here" ] || [ -z "$GROQ_API_KEY" ]; then
    echo "⚠️  GROQ_API_KEY is not set. Please update your .env file and run this script again."
    exit 1
fi

# Deploy Resumator
echo "🚀 Starting Resumator services..."
cd "$APP_DIR"
docker-compose -f docker-compose.resumator.yml up -d --build

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 30

# Run database migrations
echo "🗄️  Running database migrations..."
docker-compose -f docker-compose.resumator.yml exec -T resumator-backend alembic upgrade head || {
    echo "ℹ️  Database migration will be run on first API call"
}

# Update the frontend volume with domain information
echo "🌐 Updating frontend configuration..."
docker-compose -f docker-compose.resumator.yml run --rm -e RESUMATOR_DOMAIN="$RESUMATOR_DOMAIN" resumator-frontend

# Mount the frontend volume to Caddy
echo "📁 Setting up Caddy volume mount..."
cd "$HOMELAB_ROOT"

# Add volume mount to Caddy service if not already present
if ! grep -q "resumator-frontend-dist" docker-compose.yaml; then
    echo "📝 Adding frontend volume mount to Caddy..."
    
    # Create backup of docker-compose.yaml
    cp docker-compose.yaml docker-compose.yaml.bak
    
    # Add volume to Caddy service (this requires manual intervention)
    echo "⚠️  Manual step required:"
    echo "   Please add the following volume mount to your Caddy service in docker-compose.yaml:"
    echo "   - resumator-frontend-dist:/usr/share/nginx/html:ro"
    echo "   "
    echo "   And add this volume at the bottom:"
    echo "   resumator-frontend-dist:"
    echo "     external: true"
    echo "     name: resumator_resumator-frontend-dist"
    
    read -p "Press Enter after you've updated docker-compose.yaml..."
fi

# Restart Caddy to pick up new configuration
echo "🔄 Restarting Caddy to apply new configuration..."
docker-compose restart caddy

echo "✅ Resumator deployment completed!"
echo ""
echo "🌐 Application should be available at: https://$RESUMATOR_DOMAIN"
echo "📊 View logs: cd $APP_DIR && docker-compose -f docker-compose.resumator.yml logs -f"
echo "🔧 Manage: cd $APP_DIR && docker-compose -f docker-compose.resumator.yml [start|stop|restart]"
echo ""
echo "🎯 Next steps:"
echo "1. Verify the application is accessible"
echo "2. Create your first user account"
echo "3. Upload a resume and test AI customization"
echo "4. Set up automated backups (see backup-resumator.sh)"

echo ""
echo "🔒 Security Notes:"
echo "- Application uses 15-minute access tokens with refresh token rotation"
echo "- Rate limiting is enabled (20 AI calls/hour, 100 requests/minute)"
echo "- All data is stored locally in $APP_DIR/storage"
echo "- Database is automatically created in your existing PostgreSQL instance"
