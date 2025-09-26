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

- After a while of inactivity, and try to use again the app, I see an error message 401 and the page refresh and redirected to login page with the url http://localhost:3000/login?expired=1, the page shouldnt refresh automatically the user? We have a /refresh endpint in backend/app/api/v1/auth.py that Refresh access token using refresh token., so the user shouldn't be kicked out of the app



----
You are helping with the development of Resumator project, you are acting as a senior developer
important: you have access to filesystem and can read and refactor the project as needed

Paths: (you can read backend and frontend in 2 different times to do not overcharge)
backend: /Users/edmundo.figueroaherbas@medirect.com.mt/projects/resumator/backend
frontend: /Users/edmundo.figueroaherbas@medirect.com.mt/projects/resumator/frontend

issues found

- when I navigate directly to http://localhost:3000/resumes/1 or http://localhost:3000/resumes/1/edit or refresh the browser when I am in those pages, the page is automatically refresed and redirected to http://localhost:3000/ ,, is this the correct behaivor ?

- I want instead of using radio button,  I want just use a simple pane like a button where I can see the name and description of the tempalte selected
/Users/edmundo.figueroaherbas@medirect.com.mt/projects/resumator/frontend/src/pages/ResumeView/components/TemplateSelector.jsx
```
{/* Template Radio Buttons */}
      <div className={styles.content}>
        <div className={styles.templateRadios}>
          {templates.map((template) => (
            <div key={template.id} className={styles.radioOption}>
              <input
                type="radio"
                id={`template-${template.id}`}
                name="template"
                value={template.id}
                checked={selectedTemplate === template.id}
                onChange={() => handleTemplateSelect(template.id)}
                className={styles.radioInput}
              />
              <label htmlFor={`template-${template.id}`} className={styles.radioLabel}>
                <div className={styles.radioLabelContent}>
                  <span className={styles.templateName}>{template.name}</span>
                  <span className={styles.templateDescription}>{template.description}</span>
                </div>
              </label>
            </div>
          ))}
        </div>
```
- In the ResumeViewPage  
/Users/edmundo.figueroaherbas@medirect.com.mt/projects/resumator/frontend/src/pages/ResumeView/ResumeViewPage.jsx
When select the Preview option, the Resume Preview, is shown in markdown, but it was suppose to show the html preview

- In the ResumeViewPage, the PDF preview is not showing PDF , 