# Resumator Security Hardening & Home Lab Deployment - Training Prompt

## Project Overview
You are implementing **Phase 5: Security Hardening + Deployment** for Resumator, an AI-powered resume customization web app. The project uses FastAPI (backend), React (frontend), PostgreSQL, Redis, and Groq AI API.
- path: /Users/edmundo.figueroaherbas@medirect.com.mt/projects/resumator

## What's Already Done ✅
### Backend Security Enhancements
- **Enhanced JWT system**: 15-min access tokens + 30-day refresh tokens with blacklisting
- **Rate limiting**: Redis-based with per-user/IP limits (auth: 5/hr, AI: 20/hr, uploads: 10/hr)
- **Security middleware**: Headers (HSTS, CSP, X-Frame-Options), input sanitization
- **File validation**: 2MB limit, .md/.txt only, XSS pattern detection
- **Audit logging**: Auth attempts, file uploads, sensitive operations
- **Password security**: Argon2 hashing with bcrypt fallback

### Updated Files
- `backend/app/core/security.py` - New classes: RateLimiter, TokenBlacklist, FileValidator, AuditLogger
- `backend/app/core/middleware.py` - SecurityMiddleware with rate limiting
- `backend/app/api/v1/auth.py` - Enhanced endpoints: /refresh, /logout with audit logging
- `backend/app/schemas/user.py` - Added RefreshTokenRequest schema
- `backend/main.py` - Security middleware, strict CORS, disabled docs in production
- `backend/requirements.txt` - Added argon2-cffi, slowapi, bleach

### Home Lab Integration
- `homelab/docker-compose.resumator.yml` - Optimized for existing infrastructure
- `homelab/deploy-resumator.sh` - Deployment script with Caddy integration
- `frontend/Dockerfile.homelab` - Custom build for home lab setup

## What Needs To Be Done 🎯
### Immediate Tasks
1. **Frontend security**: Update React components with XSS protection and secure API client
2. **Complete backup script**: Finish `homelab/backup-resumator.sh`
3. **Documentation**: Create security checklist and deployment guide

## Implementation Strategy 🛠️
### Security Architecture
- **Defense in depth**: Multiple rate limiting layers, token rotation, input validation
- **Principle of least privilege**: Non-root containers, minimal permissions
- **Fail secure**: Rate limits allow on Redis failure, graceful degradation

## File Locations 📁
- Security core: `backend/app/core/security.py`, `middleware.py`
- Auth endpoints: `backend/app/api/v1/auth.py`

The system is 85% complete. Focus on finishing backup script and frontend security