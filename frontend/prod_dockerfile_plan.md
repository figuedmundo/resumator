# AI Task: Frontend Production Dockerfile

> **Purpose**: This document outlines the plan to create a production-ready, multi-stage Dockerfile for the Resumator frontend application, ensuring small, secure, and efficient container images for deployment.

---

## 📋 Template Metadata

- **Template Version**: 1.0.0
- **Template Type**: New Feature Development
- **Last Updated**: 2025-10-24
- **Project Name**: Resumator
- **Feature ID**: `FEAT-FRONTEND-PROD-DOCKERFILE`

---

## 🎯 Feature Definition

### Feature Overview
Create a `Dockerfile.prod` for the frontend project that builds the React application and serves it using a lightweight, secure Nginx web server. This will follow Docker best practices, including multi-stage builds, to produce an optimized image for production.

### Business Problem
**Problem Statement**: The frontend project lacks a dedicated production Dockerfile. The current deployment process in `DEPLOYMENT.md` involves manual build steps on the production server, which is not ideal for portability, consistency, or efficiency.
**Current State**: No `frontend/Dockerfile.prod` exists. Deployment requires running `docker run ... npm install` and `docker run ... npm build` directly on the server.
**Desired State**: A self-contained, optimized Docker image for the frontend that can be built once and deployed anywhere. This simplifies the deployment process, reduces image size, and increases security.

---

## 🏗️ Project Context

The project is a full-stack application with a React frontend and a FastAPI backend. The frontend is built with Vite and served via Caddy in the production environment, as outlined in `DEPLOYMENT.md`. This new Dockerfile will produce the static assets that Caddy will serve.

---

## 🔍 PHASE 1: Requirements Analysis

### Functional Requirements:
- The Dockerfile must build the Vite application into static HTML, JS, and CSS files.
- The final Docker image must contain a web server configured to serve these static files.
- The web server must be configured to support client-side routing (e.g., React Router) by redirecting all not-found requests to `index.html`.

### Non-Functional Requirements:
- **Performance**: The final image size should be minimized (target < 50MB).
- **Security**: The final image must not contain build-time dependencies (Node.js, npm), source code, or development tools. The web server should run as a non-root user (handled by the base Nginx image).
- **Efficiency**: The build process should be cacheable and reproducible. Using `npm ci` is preferred over `npm install`.

---

## 🎨 PHASE 2: Design & Architecture

### System Architecture
A multi-stage Docker build will be implemented. This is a best practice that separates the build environment from the final production environment, resulting in a much smaller and more secure image.

**Stage 1: The `builder` stage**
- **Base Image**: `node:20-alpine`. This is a lightweight version of Node.js, perfect for a build environment.
- **Steps**:
    1.  Set the working directory to `/app`.
    2.  Copy `package.json` and `package-lock.json`.
    3.  Run `npm ci` to install dependencies based on the lock file, ensuring a clean and reproducible build.
    4.  Copy the rest of the frontend source code.
    5.  Run `npm run build` to compile the React application. The output will be placed in the `/app/build` directory, as configured in `vite.config.mjs`.

**Stage 2: The `production` stage**
- **Base Image**: `nginx:stable-alpine`. This is a minimal, secure, and high-performance web server image.
- **Steps**:
    1.  Copy the built static assets from the `builder` stage (from `/app/build`) into Nginx's default web root directory (`/usr/share/nginx/html`).
    2.  A custom `nginx.conf` file will be created and copied into the image. This configuration will instruct Nginx to serve the static files and properly handle client-side routing by redirecting all requests for non-existent files to `/index.html`.
    3.  Expose port 80 for the Nginx server.

### Technical Decisions
1.  **Web Server Choice: Nginx over Node.js (`serve`)**
    - **Rationale**: Nginx is a high-performance web server optimized for serving static content. It is significantly more lightweight and secure for this purpose than a Node.js-based server, leading to a smaller attack surface and a much smaller final Docker image.
2.  **Dependency Installation: `npm ci` over `npm install`**
    - **Rationale**: `npm ci` (Clean Install) is designed for automated environments like production builds. It installs dependencies directly from `package-lock.json`, ensuring that the exact same dependency tree is used every time, which prevents unexpected issues.
3.  **Build Process: Multi-stage Docker builds**
    - **Rationale**: This is a critical Docker best practice. The final image will not contain any build tools, source code, or development dependencies. It only contains the compiled static assets and the Nginx server, making it lean and secure.

---

## 🛠️ PHASE 3: Implementation Plan

### Task Breakdown
1.  **Task 1**: Create a new file named `frontend/nginx.conf` to configure the Nginx server for a Single Page Application (SPA).
2.  **Task 2**: Create the new `frontend/Dockerfile.prod` file that implements the multi-stage build process described above.
3.  **Task 3 (User Action)**: The `docker-compose.prod.yml` file will need to be updated to use this new Dockerfile for the frontend service. This will replace the manual `docker run` commands for building the frontend.

### Implementation Details

**`frontend/nginx.conf` will contain:**
```nginx
server {
    listen 80;
    server_name localhost;

    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Basic security headers
    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";
    add_header X-XSS-Protection "1; mode=block";
}
```

**`frontend/Dockerfile.prod` will contain:**
```dockerfile
# Stage 1: Build the React application
FROM node:20-alpine AS build
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy the rest of the application source code
COPY . .

# Build the application for production
# The output will be in /app/build, as per vite.config.mjs
RUN npm run build

# Stage 2: Serve the application with Nginx
FROM nginx:stable-alpine AS production

# Copy the custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from the build stage
COPY --from=build /app/build /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# The default Nginx entrypoint will start the server
CMD ["nginx", "-g", "daemon off;"]
```

---

## 📊 PHASE 5: Testing Strategy

### Test Plan
1.  **Build**: Run `docker build -t resumator-frontend-prod -f frontend/Dockerfile.prod .` from the project root.
2.  **Run**: Execute `docker run -p 8080:80 resumator-frontend-prod`.
3.  **Verify**:
    - Access `http://localhost:8080` in a browser and confirm the application loads.
    - Navigate to a deep link (e.g., `http://localhost:8080/resumes`) and refresh the page to ensure client-side routing is handled correctly by Nginx.
    - Check the final image size with `docker images resumator-frontend-prod` to confirm it is small.
