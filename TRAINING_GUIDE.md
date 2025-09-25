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

----
You completed the Security Hardening + Deployment phase
path: /Users/edmundo.figueroaherbas@medirect.com.mt/projects/resumator
important: you have access to filesystm

issues found
---
- after security was implemented all the request from the frontend (secureApi.js) to the backend are redirected, the original request is for example, http://localhost:8000/api/v1/resumes?limit=5 -> 307 Temporary Redirect -> http://localhost:8000/api/v1/resumes/?limit=5 ->  200 OK , this leads to unnecesary api calls , and hitting the  Rate limiting  requests_per_minute too fast 

- doesn't really make sense have a rate limit in the requests , as when the user is inside the app the rate is hitted just using the app, and then the app stop working,, for example Rate limit exceeded for: get:/api/v1/applications 
- refreshing the page is redirecting to the login page,  noticed that the POST http://localhost:8000/api/v1/auth/logout is executed when refreshing the page
- the error message when login in is automatically removed after it show up
- The Dockerfile.homelab is not completed, also you were adding there nginx, please explain why if already using caddy ? if not needed please fix and complete the Dockerfile.homelab
path: frontend/Dockerfile.homelab
-  before you mentioned that; `backend/requirements.txt` - Added argon2-cffi, slowapi, bleach; but I dont see slowapi and bleach, please review and explain
- in the implementation of secureApi.py is necessary the level of security and "sanitizacion" of everything, please review and explain
path: frontend/src/services/secureApi.js

----
You completed the Security Hardening + Deployment phase
path: /Users/edmundo.figueroaherbas@medirect.com.mt/projects/resumator
important: you have access to filesystm

issues found
- you fixed an issue with redirect due FastAPI's automatic trailing slash handling, adding redirect_slashes=False but now when the frontend try to hit an endpoint like http://localhost:8000/api/v1/applications?limit=5 I get 404 not found, but http://localhost:8000/api/v1/applications/?limit=5 is working , please analize and explain best solution
- when login, I introduce an invalid password, I dont see the error message from backend that the password dont match , or the password is incorrect 
- log from console that needs to be fixed
6737(<-number increasing all the time) useAuth.jsx:169 Warning: Maximum update depth exceeded. This can happen when a component calls setState inside useEffect, but useEffect either doesn't have a dependency array, or one of the dependencies changes on every render.
    