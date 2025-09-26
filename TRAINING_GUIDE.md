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
You are helping with the development of Resumator project, you are acting as a senior developer
important: you have access to filesystem and can read and refactor the project as needed

Paths: (you can read backend and frontend in 2 different times to do not overcharge)
backend: /Users/edmundo.figueroaherbas@medirect.com.mt/projects/resumator/backend
frontend: /Users/edmundo.figueroaherbas@medirect.com.mt/projects/resumator/frontend

issues found

- when login (/Users/edmundo.figueroaherbas@medirect.com.mt/projects/resumator/frontend/src/pages/auth/Login/LoginPage.jsx), I introduce an invalid password, I dont see the error message from backend that the password dont match , or the password is incorrect , please explain why the bug happend and try to fix

- After a while of inactivity, and try to use again the app, I see an error message 401 and the page refresh and redirected to login page with the url http://localhost:3000/login?expired=1, the page shouldnt refresh automatically the user? We have a /refresh endpint in backend/app/api/v1/auth.py that Refresh access token using refresh token., so the user shouldn't be kicked out of the app

- getting 405 Method Not Allowed when trying to same a resume POST http://localhost:8000/api/v1/resumes
 /Users/edmundo.figueroaherbas@medirect.com.mt/projects/resumator/backend/app/api/v1/resumes.py

- when I navigate directly to http://localhost:3000/resumes/1 or http://localhost:3000/resumes/1/edit or refresh the browser when I am in those pages, the page is automatically refresed and redirected to http://localhost:3000/

- When I navigate to to http://localhost:3000/resumes/1 or http://localhost:3000/resumes/1/edit the page doesn't show the resume. I verified that in the console the request to the api http://localhost:8000/api/v1/resumes/1 is returning 200 with valid content
{
    "title": "Software Engineer Resume",
    "is_default": true,
    "id": 1,
    "user_id": 1,
    "created_at": "2025-09-25T09:01:19.129305Z",
    "updated_at": "2025-09-25T09:01:19.129305Z",
    "versions": [
        {
            "version": "v1",
            "markdown_content": "---\nname: John Admin\ncontact:\n  email: admin@resumator.local\n  phone: +1 (555) 123-4567\n  location: San Francisco, CA\n  linkedin: linkedin.com/in/johnadmin\n  github: github.com/johnadmin\n---\n\n## SUMMARY\n\nSenior Software Engineer with 8+ years of ..",
            "job_description": null,
            "is_original": true,
            "id": 1,
            "resume_id": 1,
            "created_at": "2025-09-25T09:01:19.129305Z"
        }
    ]
}

- log from console that needs to be fixed
6737(<-number increasing all the time) useAuth.jsx:169 Warning: Maximum update depth exceeded. This can happen when a component calls setState inside useEffect, but useEffect either doesn't have a dependency array, or one of the dependencies changes on every render.
    at LoginPage (http://localhost:3000/src/pages/auth/Login/LoginPage.jsx?t=1758879771966:27:68)
    at div
    at AuthLayout (http://localhost:3000/src/App.jsx?t=1758879771966:110:23)
    at PublicRoute (http://localhost:3000/src/App.jsx?t=1758879771966:64:24)
    at RenderedRoute (http://localhost:3000/node_modules/.vite/deps/react-router-dom.js?v=08a656b8:4088:5)
    at Routes (http://localhost:3000/node_modules/.vite/deps/react-router-dom.js?v=08a656b8:4558:5)
    at div
    at App (http://localhost:3000/src/App.jsx?t=1758879771966:120:25)
    at AuthProvider (http://localhost:3000/src/hooks/useAuth.jsx?t=1758879771966:83:32)
    at Router (http://localhost:3000/node_modules/.vite/deps/react-router-dom.js?v=08a656b8:4501:15)
    at BrowserRouter (http://localhost:3000/node_modules/.vite/deps/react-router-dom.js?v=08a656b8:5247:5)
840 useAuth.jsx:187 Warning: Maximum update depth exceeded. This can happen when a component calls setState inside useEffect, but useEffect either doesn't have a dependency array, or one of the dependencies changes on every render.
    at RegisterPage (http://localhost:3000/src/pages/auth/Register/RegisterPage.jsx?t=1758879771966:27:71)

    [note] the issue above only is seen when login and register pages are openend
    useAuth: /Users/edmundo.figueroaherbas@medirect.com.mt/projects/resumator/frontend/src/hooks/useAuth.jsx

- I want instead of using TemplateCards I want just use a simple radio button selector (only one option)
/Users/edmundo.figueroaherbas@medirect.com.mt/projects/resumator/frontend/src/pages/ResumeView/components/TemplateSelector.jsx
```
    <div className={styles.templateGrid}>
        {templates.map((template) => (
        <TemplateCard
            key={template.id}
            template={template}
            selected={selectedTemplate === template.id}
            onSelect={handleTemplateSelect}
        />
        ))}
    </div>
```

