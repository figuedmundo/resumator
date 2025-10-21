# AI Task Template: New Feature Development

> **Purpose**: This template provides a systematic framework for AI assistants to design, plan, and implement new features with consistent high quality and alignment with project goals.

---

## 📋 Template Metadata

- **Template Version**: 1.0.0
- **Template Type**: New Feature Development
- **Last Updated**: [DATE]
- **Project Name**: [PROJECT_NAME]
- **Feature ID**: [FEATURE_ID or TICKET_NUMBER]

---

## 🎯 Feature Definition

### Feature Overview
**[Provide a clear, compelling description of the feature]**

Example: "Add AI-powered job matching that suggests relevant job postings based on user's resume and preferences"

### Business Problem
**Problem Statement**: [What problem does this solve?]
**Current State**: [How do users handle this now?]
**Desired State**: [What will be possible after this feature?]

### Success Metrics
**Primary Metrics**:
- [ ] Metric 1: [e.g., "50% of users use the feature within first week"]
- [ ] Metric 2: [e.g., "Average match relevance score > 80%"]

**Secondary Metrics**:
- [ ] Metric 3: [e.g., "Reduced time to find relevant jobs by 30%"]

---

## 👥 Stakeholder Information

### Who Requested This?
- **Requester**: [Name/Role]
- **Priority**: [P0 / P1 / P2 / P3]
- **Business Value**: [High / Medium / Low]

### Target Users
**Primary Users**: [Who will use this most?]
**Secondary Users**: [Who else benefits?]
**User Personas**: [Link to personas or brief description]

### Success Criteria
**Must Have** (MVP):
- [ ] Requirement 1
- [ ] Requirement 2

**Should Have** (V1.1):
- [ ] Requirement 3
- [ ] Requirement 4

**Nice to Have** (Future):
- [ ] Requirement 5

---

## 🏗️ Project Context

### Project Information
```yaml
Project Name: Resumator
Technology Stack:
  Frontend: React 18.2.0, Vite 7.1.5, TailwindCSS 3.3.6
  Backend: FastAPI, Python 3.11, PostgreSQL
  State Management: React Context API
  Testing: Vitest, React Testing Library, Pytest
  UI Components: HeroIcons, Custom Components
  Code Editor: CodeMirror 6
  Markdown: react-markdown, remark-gfm
  HTTP Client: Axios 1.6.2
  Utilities: clsx, date-fns, DOMPurify

Project Paths:
  Root: /Users/edmundo.figueroaherbas@medirect.com.mt/projects/resumator
  Backend: /Users/edmundo.figueroaherbas@medirect.com.mt/projects/resumator/backend
  Frontend: /Users/edmundo.figueroaherbas@medirect.com.mt/projects/resumator/frontend
  Docs: /Users/edmundo.figueroaherbas@medirect.com.mt/projects/resumator/.vibe
  Templates: /Users/edmundo.figueroaherbas@medirect.com.mt/projects/resumator/.vibe/templates
```

### Project Standards & Guidelines

#### Coding Standards
```yaml
Frontend:
  - Component Style: Functional Components with Hooks (useState, useEffect, useContext, useMemo, useCallback)
  - Styling Approach: CSS Modules + TailwindCSS utility classes
  - File Naming: 
      * PascalCase for components (e.g., CoverLetterCard.jsx)
      * camelCase for utilities (e.g., apiService.js)
      * Component styles: ComponentName.module.css
  - Import Order: 
      1. React imports
      2. Third-party libraries (heroicons, clsx, axios, etc.)
      3. Local components
      4. Hooks and utilities
      5. Styles (module.css)
  - State Management: React Context API with custom hooks (useAuth)
  - Props Validation: PropTypes for all components
  - Naming Conventions:
      * Event handlers: handleEventName (e.g., handleDelete, handleSubmit)
      * Boolean props: isLoading, hasError, canEdit
      * State variables: descriptive names (e.g., coverLetters, isDeleting)
  - Code Organization:
      * One component per file
      * Extract complex logic into custom hooks
      * Keep components under 300 lines
  - Error Handling:
      * try-catch for async operations
      * Display user-friendly error messages
      * Log errors to console for debugging

Backend:
  - Code Style: PEP 8 compliant, formatted with Black
  - Python Version: 3.11+
  - API Pattern: RESTful with FastAPI
  - Error Handling: 
      * Custom exceptions (ValidationError, NotFoundError)
      * Proper HTTP status codes (200, 201, 204, 400, 401, 404, 422, 500)
      * Structured error responses with detail field
  - Validation: Pydantic schemas for all request/response models
  - Logging: Structured logging with structlog (INFO, WARNING, ERROR levels)
  - Documentation: 
      * Docstrings for all public methods (Google style)
      * Type hints for all function signatures
      * API endpoint descriptions in FastAPI decorators
  - Security:
      * JWT tokens with access + refresh pattern
      * Argon2/bcrypt password hashing
      * Rate limiting with Redis
      * Input validation and sanitization
      * CORS configured properly
  - Database:
      * SQLAlchemy ORM for models
      * Alembic for migrations
      * Relationship definitions with proper cascades
  - Background Tasks:
      * Celery for async operations
      * Redis as message broker
```

#### UI/UX Standards
```yaml
Design System:
  - Component Library: Custom components with shadcn/ui-inspired design
  - Color Palette:
      * Primary: Blue (#3b82f6, #2563eb, #1d4ed8) - Trust, professionalism
      * Secondary: Gray (#6b7280, #4b5563, #374151) - Neutral elements
      * Success: Green (#10b981) - Positive actions, confirmations
      * Warning: Yellow (#f59e0b) - Cautions, alerts
      * Danger: Red (#ef4444) - Destructive actions, errors
      * Background: White/Gray-50 (#ffffff, #f9fafb)
  - Typography:
      * Font Family: Inter (fallback: ui-sans-serif, system-ui)
      * Headings: font-semibold to font-bold
      * Body: font-normal
      * Sizes: text-sm, text-base, text-lg, text-xl, text-2xl
  - Spacing System: Tailwind default (4px base unit)
      * Consistent padding: p-4, p-6, p-8
      * Consistent margins: mb-4, mb-6, mb-8
      * Gaps in flex/grid: gap-2, gap-4, gap-6
  - Icons: HeroIcons (@heroicons/react/24/outline and /24/solid)
  - Borders: 
      * Border radius: rounded-lg (8px) for cards, rounded-md (6px) for buttons
      * Border colors: border-gray-200, border-gray-300
  - Shadows:
      * Card hover: shadow-sm → shadow-md transition
      * Modals: shadow-lg
      * Buttons: shadow-sm on hover
  
Interaction Patterns:
  - Loading States:
      * Component-level: LoadingSpinner component (sizes: sm, md, lg)
      * Button loading: Disable button + spinner + "Loading..." text
      * Skeleton screens for list loading
      * Page-level: Centered spinner with size="lg"
  - Error Display:
      * Toast notifications: Auto-dismiss after 3-5 seconds
      * Inline errors: Below form fields with red text
      * Error alerts: Red banner at top of page/section with icon
      * Modal alerts: For critical errors requiring acknowledgment
  - Confirmations:
      * ConfirmDialog component for destructive actions (delete, archive)
      * Two-button layout: Cancel (secondary) + Confirm (danger/primary)
      * Clear messaging: "Are you sure you want to delete [item]?"
      * Disable buttons while processing
  - Feedback:
      * Success messages: Green toast/banner, auto-dismiss 3 seconds
      * Error messages: Red alert, manual dismiss or auto-dismiss 5 seconds
      * Loading indicators: Spinners, disabled states, skeleton UI
      * Hover states: All interactive elements (shadow, background change)
      * Focus states: Visible outline for keyboard navigation
  - Animations:
      * Fade in: 0.3s ease-in-out for appearing elements
      * Slide up: 0.3s ease-out for modals
      * Smooth transitions: transition-colors, transition-shadow (duration-200)
      * Avoid jarring animations: Keep subtle and purposeful
  
Accessibility:
  - WCAG Level: AA compliance target
  - Keyboard Navigation: Required for all interactive elements
      * Tab order logical and intuitive
      * Focus visible with outline
      * Escape key closes modals/dialogs
      * Enter key submits forms
  - Screen Reader Support: Required
      * ARIA labels on icon-only buttons
      * ARIA-live regions for dynamic content
      * Semantic HTML (nav, main, article, button, etc.)
      * Alt text for images
  - Color Contrast:
      * Text: Minimum 4.5:1 for normal text, 3:1 for large text
      * Interactive elements: 3:1 minimum
      * Use color AND text/icons for status (not color alone)
  - Form Accessibility:
      * Labels associated with inputs
      * Error messages linked with aria-describedby
      * Required fields marked
      * Clear error states

Component Patterns:
  - Cards:
      * White background (bg-white)
      * Border (border border-gray-200)
      * Rounded corners (rounded-lg)
      * Shadow on hover (hover:shadow-md transition-shadow)
      * Padding (p-4 to p-6)
  - Buttons:
      * Primary: bg-blue-600 hover:bg-blue-700 text-white
      * Secondary: bg-gray-200 hover:bg-gray-300 text-gray-900
      * Danger: bg-red-600 hover:bg-red-700 text-white OR bg-red-100 hover:bg-red-200 text-red-700
      * Disabled: opacity-50 cursor-not-allowed
      * Size: px-3 py-2 (small), px-4 py-2 (default), px-6 py-3 (large)
      * Icons with text: Use flex items-center gap-2
  - Forms:
      * Input fields: border-gray-300 focus:ring-2 focus:ring-blue-500
      * Labels: font-medium text-gray-700 mb-1
      * Error states: border-red-500 text-red-600
      * Helper text: text-sm text-gray-500
  - Lists:
      * Grid layout for cards: grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6
      * List layout: divide-y divide-gray-200
      * Empty states: Centered with icon, title, description, CTA
  - Modals/Dialogs:
      * Backdrop: fixed inset-0 bg-black bg-opacity-50
      * Container: Centered, max-width, rounded-lg, shadow-xl
      * Header: font-semibold text-lg border-b
      * Footer: border-t with action buttons
      * Close button: Top-right with X icon
```


#### Testing Standards
```yaml
Frontend Testing:
  - Framework: Vitest + React Testing Library
  - Coverage Target: > 80% for critical components
  - Test Types:
      * Unit tests: Individual component behavior
      * Integration tests: Component interactions
      * User event tests: Simulating user actions
  - Testing Patterns:
      * Arrange-Act-Assert structure
      * Mock API calls with test data
      * Test user-visible behavior, not implementation
      * Use data-testid sparingly, prefer accessible queries
  - What to Test:
      * Component renders correctly with props
      * User interactions trigger expected callbacks
      * Loading/error states display properly
      * Form validation works
      * Conditional rendering based on props/state
  - What NOT to Test:
      * Implementation details (state names, function names)
      * Third-party library internals
      * CSS styles (rely on visual testing)

Backend Testing:
  - Framework: Pytest + Pytest-asyncio
  - Coverage Target: > 85% for services and API endpoints
  - Test Types:
      * Unit tests: Service methods, utilities
      * Integration tests: API endpoints with database
      * Security tests: Auth, permissions, input validation
  - Testing Patterns:
      * Use fixtures for database sessions
      * Mock external services (AI, storage)
      * Test happy path and error cases
      * Verify HTTP status codes and response structure
  - What to Test:
      * API endpoints return correct status codes
      * Request validation (Pydantic schemas)
      * Database operations (CRUD)
      * Business logic in services
      * Authentication and authorization
      * Error handling
  
Test Data:
  - Use factories/fixtures for consistent test data
  - Clear test database between tests
  - Use realistic but anonymized data
  - Cover edge cases (empty, null, invalid)
```

#### Documentation Standards
```yaml
Code Documentation:
  - JSDoc/Docstrings: Required for all public APIs and exported functions
  - Inline Comments: 
      * For complex logic only (why, not what)
      * Explain non-obvious decisions
      * Document workarounds and known issues
      * Keep comments up-to-date with code
  - README Files: 
      * Each major module/feature has README.md
      * Include: Purpose, Usage, Examples, API
  - API Documentation: 
      * FastAPI auto-generates OpenAPI docs
      * Add descriptions to endpoints and schemas
      * Document query parameters and request bodies
  - Component Documentation:
      * PropTypes with descriptions
      * Usage examples in comments
      * Document complex state management

Change Documentation:
  - Commit Messages: 
      * Format: "type: description" (e.g., "fix: resolve delete bug")
      * Types: fix, feat, refactor, test, docs, style, chore
      * Keep under 72 characters
      * Reference issue numbers when applicable
  - PR Descriptions: 
      * What: What was changed
      * Why: Why the change was needed
      * How: How it was implemented
      * Testing: How to verify the change
      * Screenshots for UI changes
  - Changelog: Keep CHANGELOG.md (if exists) updated with notable changes
```

---

## 🔍 PHASE 1: Requirements Analysis

### Step 1.1: Gather Detailed Requirements
**AI Instructions**: Extract and document all requirements clearly.

#### Functional Requirements:

### User Stories

**As a** [user type]
**I want to** [action]
**So that** [benefit]

**Acceptance Criteria**:
- [ ] Criterion 1
- [ ] Criterion 2

Example:
**As a** job seeker
**I want to** receive AI-suggested jobs based on my resume
**So that** I can quickly find relevant opportunities without manual searching

**Acceptance Criteria**:
- [ ] System analyzes resume content
- [ ] Matches against job database
- [ ] Shows top 10 matches with relevance scores
- [ ] Updates daily with new postings
- [ ] Allows filtering by location, salary, etc.


#### Non-Functional Requirements:

### Performance
- [ ] Response time: [e.g., "< 2s for job matching"]
- [ ] Throughput: [e.g., "Support 1000 concurrent users"]
- [ ] Scalability: [e.g., "Handle 100K resumes"]

### Security
- [ ] Authentication: [Required access level]
- [ ] Data Privacy: [PII handling requirements]
- [ ] Compliance: [GDPR, CCPA, etc.]

### Usability
- [ ] Accessibility: [WCAG 2.1 Level AA]
- [ ] Mobile: [Responsive, mobile-first, native app]
- [ ] Browser Support: [Chrome, Firefox, Safari, Edge]

### Reliability
- [ ] Uptime: [e.g., "99.9% SLA"]
- [ ] Error Rate: [e.g., "< 0.1%"]
- [ ] Recovery Time: [e.g., "< 5 minutes"]

---

### Step 1.2: Research Existing Implementations
**AI Instructions**: Look at similar features in the codebase.

#### Analysis Questions:
- [ ] Are there similar features already implemented?
- [ ] What patterns do they use?
- [ ] What can be reused?
- [ ] What should be done differently?

#### Output Format:
```markdown
### Similar Features Analysis

#### Feature 1: [Name]
**Location**: `path/to/feature`
**Patterns Used**:
- Pattern 1: [Description]
- Pattern 2: [Description]

**What Works Well**:
- ✅ [Positive aspect]

**What Could Be Improved**:
- 🔄 [Area for improvement]

**Reusable Components**:
- Component 1: [How it can be reused]
- Component 2: [How it can be reused]
```

---

### Step 1.3: Define Data Model
**AI Instructions**: Design the data structures needed.

#### Data Model Template:
```markdown
### Data Entities

#### Entity 1: JobMatch
**Purpose**: Stores AI-generated job matches for users

**Fields**:
| Field | Type | Required | Description | Constraints |
|-------|------|----------|-------------|-------------|
| id | Integer | Yes | Primary key | Auto-increment |
| user_id | Integer | Yes | Foreign key to User | ON DELETE CASCADE |
| job_id | Integer | Yes | Foreign key to Job | ON DELETE CASCADE |
| relevance_score | Float | Yes | Match score 0-100 | 0 <= score <= 100 |
| matched_skills | JSON | No | Skills that matched | Array of strings |
| created_at | Timestamp | Yes | When match created | Auto |
| expires_at | Timestamp | Yes | When match expires | Default +30 days |

**Relationships**:
- Belongs to User (Many-to-One)
- Belongs to Job (Many-to-One)

**Indexes**:
- `idx_user_id_score` on (user_id, relevance_score DESC)
- `idx_job_id` on (job_id)
- `idx_created_at` on (created_at)

**Validation Rules**:
- relevance_score must be between 0 and 100
- expires_at must be after created_at
- User must have active resume

---

#### Entity 2: [Next Entity]
[Same format]
```

#### Database Schema:
```sql
-- SQL Schema for JobMatch
CREATE TABLE job_matches (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    job_id INTEGER NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    relevance_score DECIMAL(5,2) NOT NULL CHECK (relevance_score >= 0 AND relevance_score <= 100),
    matched_skills JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    
    CONSTRAINT unique_user_job UNIQUE(user_id, job_id)
);

CREATE INDEX idx_user_id_score ON job_matches(user_id, relevance_score DESC);
CREATE INDEX idx_job_id ON job_matches(job_id);
CREATE INDEX idx_created_at ON job_matches(created_at);
```

---

### Step 1.4: Define API Contract
**AI Instructions**: Design the API endpoints needed.

#### API Design Template:
```markdown
### API Endpoints

#### GET /api/v1/job-matches
**Description**: Get AI-matched jobs for current user

**Authentication**: Required (Bearer token)

**Query Parameters**:
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| limit | integer | No | 10 | Number of results (max 50) |
| offset | integer | No | 0 | Pagination offset |
| min_score | float | No | 70 | Minimum relevance score |
| location | string | No | null | Filter by location |
| sort | enum | No | score | Sort by: score, date, salary |

**Request Example**:
```bash
GET /api/v1/job-matches?limit=20&min_score=80&sort=score
Authorization: Bearer {token}
```

**Response 200 OK**:
```json
{
  "matches": [
    {
      "id": 123,
      "job": {
        "id": 456,
        "title": "Senior Software Engineer",
        "company": "Tech Corp",
        "location": "San Francisco, CA",
        "salary_range": "$120k - $180k",
        "posted_date": "2024-01-15"
      },
      "relevance_score": 95.5,
      "matched_skills": ["Python", "FastAPI", "React", "PostgreSQL"],
      "match_reasons": [
        "5+ years Python experience matches requirement",
        "FastAPI skills highly relevant",
        "Location preference matches"
      ],
      "created_at": "2024-01-20T10:30:00Z"
    }
  ],
  "total": 156,
  "limit": 20,
  "offset": 0
}
```

**Response 401 Unauthorized**:
```json
{
  "detail": "Authentication required"
}
```

**Response 404 Not Found**:
```json
{
  "detail": "No resume found for user"
}
```

---

#### POST /api/v1/job-matches/refresh
**Description**: Trigger fresh job matching analysis

**Authentication**: Required

**Request Body**:
```json
{
  "resume_id": 123,
  "preferences": {
    "locations": ["San Francisco", "New York", "Remote"],
    "min_salary": 100000,
    "job_types": ["full-time", "contract"]
  }
}
```

**Response 202 Accepted**:
```json
{
  "task_id": "abc-123-def",
  "status": "processing",
  "estimated_time": "30s",
  "message": "Job matching in progress"
}
```

---

[Continue for all endpoints...]
```

---

### Step 1.5: Design User Flow
**AI Instructions**: Map out the complete user journey.

#### User Flow Template:
```markdown
### User Flow: Job Matching

#### Happy Path
```
1. User lands on Dashboard
   ↓
2. Sees "AI Job Matches" card with badge showing "15 new matches"
   ↓
3. Clicks "View Matches"
   ↓
4. Navigates to /job-matches page
   ↓
5. Sees list of matched jobs sorted by relevance
   ↓
6. Can filter by location, salary, job type
   ↓
7. Clicks on a job to see details
   ↓
8. Sees match explanation with matched skills highlighted
   ↓
9. Can save job to favorites or apply directly
   ↓
10. Can provide feedback (thumbs up/down) on match quality
```

#### Alternative Paths

**Path A: No Resume**
```
1. User visits job matches page
   ↓
2. Sees empty state: "Upload your resume to get AI-powered job matches"
   ↓
3. Clicks "Upload Resume" button
   ↓
4. Taken to resume upload flow
   ↓
5. After upload, redirected back to job matches
   ↓
6. Sees loading state while matches are generated
   ↓
7. Matches appear within 30 seconds
```

**Path B: No Matches Found**
```
1. User with resume visits job matches
   ↓
2. Sees message: "No matches found with current criteria"
   ↓
3. Suggested actions:
   - Adjust filters (lower min score, expand locations)
   - Update resume with more skills
   - Check back tomorrow for new postings
```

#### Error Paths

**Path E1: Matching Service Down**
```
1. User tries to refresh matches
   ↓
2. API returns 503 Service Unavailable
   ↓
3. Shows error message with retry button
   ↓
4. User can view cached matches (if available)
```

---

### Wireframes/Mockups
**Location**: [Link to Figma/Sketch/etc. or describe]

**Key Screens**:
1. Dashboard widget
2. Job Matches list page
3. Job detail with match explanation
4. Empty states
5. Loading states
6. Error states
```

---

## 🎨 PHASE 2: Design & Architecture

### Step 2.1: System Architecture
**AI Instructions**: Design the overall system architecture.

#### Architecture Diagram:

### System Components

```
┌─────────────────┐
│   Frontend      │
│   (React)       │
└────────┬────────┘
         │ HTTP/REST
         ↓
┌─────────────────┐
│   API Gateway   │
│   (FastAPI)     │
└────────┬────────┘
         │
    ┌────┴─────┬──────────────┬────────────┐
    ↓          ↓              ↓            ↓
┌────────┐ ┌─────────┐  ┌──────────┐ ┌──────────┐
│ Job    │ │ Match   │  │ Resume   │ │ User     │
│ Service│ │ Service │  │ Service  │ │ Service  │
└───┬────┘ └────┬────┘  └────┬─────┘ └────┬─────┘
    │           │             │            │
    └───────────┴─────────────┴────────────┘
                      │
                      ↓
              ┌───────────────┐
              │   PostgreSQL  │
              │   Database    │
              └───────┬───────┘
                      │
              ┌───────┴────────┐
              │                │
          ┌───────┐      ┌─────────┐
          │ Jobs  │      │ Matches │
          │ Table │      │  Table  │
          └───────┘      └─────────┘
                      │
              ┌───────┴───────┐
              │               │
          ┌────────┐     ┌────────┐
          │ Redis  │     │ Celery │
          │ Cache  │     │ Queue  │
          └────────┘     └────────┘
                      │
              ┌───────┴────────┐
              │                │
          ┌────────┐      ┌──────────┐
          │ OpenAI │      │ Vector   │
          │ API    │      │ Database │
          └────────┘      └──────────┘
```

### Component Responsibilities

#### Frontend Components
- **JobMatchesPage**: Main page container
- **JobMatchList**: Displays list of matches
- **JobMatchCard**: Individual job match card
- **JobMatchFilter**: Filter and sort controls
- **JobMatchDetail**: Detailed view with explanations

#### Backend Services
- **JobMatchService**: Core matching logic
- **ResumeParsingService**: Extract skills from resumes
- **JobScrapingService**: Fetch and update job postings
- **NotificationService**: Notify users of new matches

#### External Dependencies
- **OpenAI API**: For semantic matching
- **Job Board APIs**: For job data
- **Vector Database**: For semantic search

---

### Step 2.2: Technical Decisions
**AI Instructions**: Document key technical choices.

#### Decision Template:

### Technical Decision 1: Matching Algorithm

**Decision**: Use hybrid approach combining keyword matching and semantic similarity

**Options Considered**:
1. **Keyword Matching Only**
   - Pros: Fast, simple, predictable
   - Cons: Misses semantic similarities, brittle

2. **Pure ML/AI Matching**
   - Pros: Intelligent, captures semantics
   - Cons: Slower, requires training data, less explainable

3. **Hybrid Approach** ← CHOSEN
   - Pros: Best of both worlds, explainable, tunable
   - Cons: More complex implementation

**Rationale**:
- Need explainability for user trust
- Want semantic understanding for better matches
- Performance requirements met with caching
- Can tune weights based on feedback

**Implementation**:
```python
def calculate_match_score(resume, job):
    # 40% weight: Keyword matching (fast, explainable)
    keyword_score = match_keywords(resume.skills, job.required_skills)
    
    # 40% weight: Semantic similarity (intelligent matching)
    semantic_score = calculate_semantic_similarity(
        resume.embedding, 
        job.embedding
    )
    
    # 20% weight: Experience and other factors
    experience_score = match_experience(resume, job)
    
    # Weighted average
    final_score = (
        keyword_score * 0.4 + 
        semantic_score * 0.4 + 
        experience_score * 0.2
    )
    
    return final_score, {
        'keyword': keyword_score,
        'semantic': semantic_score,
        'experience': experience_score
    }
```

**Trade-offs Accepted**:
- More complex than simple keyword matching
- Requires embeddings infrastructure
- Worth it for quality improvements

---

### Technical Decision 2: Real-time vs Batch Processing

**Decision**: Use batch processing with Redis caching for UI reads

**Options Considered**:
1. **Real-time Matching**: Calculate on every request
2. **Batch Processing**: Pre-calculate matches daily ← CHOSEN
3. **Hybrid**: Cache + on-demand refresh

**Rationale**:
- Matching is computationally expensive
- Job postings don't change that frequently
- Users can wait for daily updates
- Can add manual refresh for power users

**Implementation**:
- Celery job runs daily at 2 AM
- Processes all active users
- Stores results in database
- Redis caches top 20 matches per user
- TTL of 24 hours

---

[Continue for all major decisions...]

---

### Step 2.3: Data Flow Design
**AI Instructions**: Map how data moves through the system.

#### Data Flow Diagram:

### Data Flow: Job Matching

#### Flow 1: Initial Match Generation
```
User uploads resume
    ↓
Resume stored in database
    ↓
Resume parsing service extracts text
    ↓
OpenAI API generates embeddings
    ↓
Embeddings stored in vector database
    ↓
Matching job scheduled (Celery)
    ↓
Celery worker picks up task
    ↓
For each active job posting:
    - Calculate keyword match score
    - Calculate semantic similarity
    - Calculate experience match
    - Compute final score
    ↓
Filter matches (score > 70)
    ↓
Store top 100 matches in database
    ↓
Cache top 20 in Redis
    ↓
Send notification to user
```

#### Flow 2: Viewing Matches
```
User navigates to /job-matches
    ↓
Frontend calls GET /api/v1/job-matches
    ↓
Backend checks Redis cache
    ↓
If cache hit:
    Return cached matches (fast path)
Else:
    Query database
    ↓
    Cache results in Redis
    ↓
    Return to frontend
    ↓
Frontend renders match cards
```

#### Flow 3: Feedback Loop
```
User gives feedback (thumbs up/down)
    ↓
Frontend sends POST /api/v1/job-matches/{id}/feedback
    ↓
Backend stores feedback
    ↓
Async job analyzes feedback patterns
    ↓
Adjusts matching algorithm weights
    ↓
Improves future matches
```

---

### Security Considerations
```markdown
### Security Requirements

#### Authentication & Authorization
- [ ] All endpoints require authentication
- [ ] Users can only access their own matches
- [ ] Admin endpoints have elevated permissions
- [ ] API keys secured for external services

#### Data Privacy
- [ ] Resume data encrypted at rest
- [ ] PII handling complies with GDPR
- [ ] User can delete all match history
- [ ] Audit log for data access

#### API Security
- [ ] Rate limiting: 100 requests/minute per user
- [ ] Input validation on all parameters
- [ ] SQL injection prevention
- [ ] XSS prevention in frontend

#### External API Keys
- [ ] OpenAI API key in environment variables
- [ ] Rotate keys quarterly
- [ ] Monitor usage and billing
- [ ] Fallback if quota exceeded
```

---

## 🛠️ PHASE 3: Implementation Plan

### Step 3.1: Break Down into Tasks
**AI Instructions**: Create detailed task breakdown.

#### Task Breakdown Template:
```markdown
### Implementation Tasks

#### Milestone 1: Data Layer (Week 1)
**Goal**: Database schema and models ready

**Tasks**:
1. **Task 1.1**: Create database migration
   - **Effort**: 2 hours
   - **Owner**: Backend dev
   - **Deliverable**: SQL migration file
   - **Dependencies**: None
   - **Acceptance Criteria**:
     - [ ] Tables created with correct schema
     - [ ] Indexes added for performance
     - [ ] Foreign keys and constraints in place
     - [ ] Migration tested on dev database

2. **Task 1.2**: Create SQLAlchemy models
   - **Effort**: 3 hours
   - **Owner**: Backend dev
   - **Deliverable**: Python model files
   - **Dependencies**: Task 1.1
   - **Acceptance Criteria**:
     - [ ] Models match database schema
     - [ ] Relationships defined
     - [ ] Validation methods added
     - [ ] Unit tests passing

3. **Task 1.3**: Create Pydantic schemas
   - **Effort**: 2 hours
   - **Owner**: Backend dev
   - **Deliverable**: Schema files
   - **Dependencies**: Task 1.2
   - **Acceptance Criteria**:
     - [ ] Request/response schemas defined
     - [ ] Validation rules applied
     - [ ] Documentation strings added

---

#### Milestone 2: Backend Services (Week 1-2)
**Goal**: Core matching logic implemented

**Tasks**:
1. **Task 2.1**: Resume parsing service
   - **Effort**: 8 hours
   - **Owner**: Backend dev
   - **Deliverable**: ResumeParsingService class
   - **Dependencies**: Task 1.2
   - **Acceptance Criteria**:
     - [ ] Extracts text from PDF/DOCX
     - [ ] Identifies skills using NLP
     - [ ] Extracts experience information
     - [ ] Returns structured data
     - [ ] Unit tests coverage > 80%

2. **Task 2.2**: Embedding generation service
   - **Effort**: 6 hours
   - **Owner**: Backend dev
   - **Deliverable**: EmbeddingService class
   - **Dependencies**: Task 2.1
   - **Acceptance Criteria**:
     - [ ] Integrates with OpenAI API
     - [ ] Handles rate limiting
     - [ ] Caches embeddings
     - [ ] Error handling for API failures
     - [ ] Tests with mocked API

3. **Task 2.3**: Matching algorithm service
   - **Effort**: 12 hours
   - **Owner**: Backend dev
   - **Deliverable**: JobMatchService class
   - **Dependencies**: Task 2.1, 2.2
   - **Acceptance Criteria**:
     - [ ] Keyword matching implemented
     - [ ] Semantic matching implemented
     - [ ] Experience matching implemented
     - [ ] Score calculation with weights
     - [ ] Explanation generation
     - [ ] Performance: < 100ms per match
     - [ ] Unit tests coverage > 85%

4. **Task 2.4**: Celery background jobs
   - **Effort**: 4 hours
   - **Owner**: Backend dev
   - **Deliverable**: Celery tasks
   - **Dependencies**: Task 2.3
   - **Acceptance Criteria**:
     - [ ] Daily matching job scheduled
     - [ ] Manual refresh endpoint works
     - [ ] Progress tracking implemented
     - [ ] Error handling and retries
     - [ ] Monitoring/logging in place

---

#### Milestone 3: API Endpoints (Week 2)
**Goal**: REST API ready for frontend

**Tasks**:
1. **Task 3.1**: GET /job-matches endpoint
   - **Effort**: 4 hours
   - **Owner**: Backend dev
   - **Deliverable**: API endpoint
   - **Dependencies**: Task 2.3
   - **Acceptance Criteria**:
     - [ ] Returns paginated matches
     - [ ] Filtering works correctly
     - [ ] Sorting implemented
     - [ ] Response matches schema
     - [ ] Integration tests passing

2. **Task 3.2**: POST /job-matches/refresh endpoint
   - **Effort**: 3 hours
   - **Owner**: Backend dev
   - **Deliverable**: API endpoint
   - **Dependencies**: Task 2.4
   - **Acceptance Criteria**:
     - [ ] Triggers background job
     - [ ] Returns task ID
     - [ ] Status polling works
     - [ ] Rate limiting applied

3. **Task 3.3**: Feedback endpoints
   - **Effort**: 2 hours
   - **Owner**: Backend dev
   - **Deliverable**: API endpoints
   - **Dependencies**: Task 3.1
   - **Acceptance Criteria**:
     - [ ] Can submit feedback
     - [ ] Feedback stored correctly
     - [ ] Analytics tracking works

---

#### Milestone 4: Frontend Components (Week 3)
**Goal**: UI components ready

**Tasks**:
1. **Task 4.1**: JobMatchesPage container
   - **Effort**: 4 hours
   - **Owner**: Frontend dev
   - **Deliverable**: React component
   - **Dependencies**: Task 3.1
   - **Acceptance Criteria**:
     - [ ] Fetches matches on mount
     - [ ] Handles loading states
     - [ ] Handles error states
     - [ ] Pagination works
     - [ ] Component tests passing

2. **Task 4.2**: JobMatchCard component
   - **Effort**: 6 hours
   - **Owner**: Frontend dev
   - **Deliverable**: React component
   - **Dependencies**: None (can work in parallel)
   - **Acceptance Criteria**:
     - [ ] Displays job information
     - [ ] Shows relevance score
     - [ ] Match reasons displayed
     - [ ] Actions (save, apply) work
     - [ ] Responsive design
     - [ ] Accessible (ARIA labels)
     - [ ] Component tests passing

3. **Task 4.3**: JobMatchFilter component
   - **Effort**: 5 hours
   - **Owner**: Frontend dev
   - **Deliverable**: React component
   - **Dependencies**: Task 4.1
   - **Acceptance Criteria**:
     - [ ] Location filter works
     - [ ] Salary filter works
     - [ ] Min score slider works
     - [ ] Sort options work
     - [ ] Filters persist in URL
     - [ ] Component tests passing

4. **Task 4.4**: Empty and error states
   - **Effort**: 3 hours
   - **Owner**: Frontend dev
   - **Deliverable**: React components
   - **Dependencies**: Task 4.1
   - **Acceptance Criteria**:
     - [ ] No matches state
     - [ ] No resume state
     - [ ] Error state with retry
     - [ ] Loading skeletons
     - [ ] All states tested

---

#### Milestone 5: Integration & Testing (Week 4)
**Goal**: Everything works together

**Tasks**:
1. **Task 5.1**: Integration testing
   - **Effort**: 8 hours
   - **Owner**: QA/Backend dev
   - **Deliverable**: Test suite
   - **Dependencies**: All previous tasks
   - **Acceptance Criteria**:
     - [ ] End-to-end user flows work
     - [ ] API integration tests pass
     - [ ] Database transactions correct
     - [ ] Error scenarios handled

2. **Task 5.2**: Performance testing
   - **Effort**: 4 hours
   - **Owner**: Backend dev
   - **Deliverable**: Performance report
   - **Dependencies**: Task 5.1
   - **Acceptance Criteria**:
     - [ ] API response < 500ms (p95)
     - [ ] Matching job completes in < 5min
     - [ ] Frontend loads < 2s
     - [ ] No memory leaks

3. **Task 5.3**: Security audit
   - **Effort**: 4 hours
   - **Owner**: Security/Senior dev
   - **Deliverable**: Security report
   - **Dependencies**: Task 5.1
   - **Acceptance Criteria**:
     - [ ] No SQL injection vulnerabilities
     - [ ] No XSS vulnerabilities
     - [ ] Authentication enforced
     - [ ] API keys secured

4. **Task 5.4**: Documentation
   - **Effort**: 6 hours
   - **Owner**: Tech writer/Dev
   - **Deliverable**: Documentation
   - **Dependencies**: All previous tasks
   - **Acceptance Criteria**:
     - [ ] API documentation complete
     - [ ] User guide written
     - [ ] Architecture documented
     - [ ] Code comments added

---

#### Milestone 6: Deployment (Week 4)
**Goal**: Feature live in production

**Tasks**:
1. **Task 6.1**: Staging deployment
2. **Task 6.2**: Production deployment
3. **Task 6.3**: Monitoring setup
4. **Task 6.4**: User communication
```

---

### Step 3.2: Define Dependencies
**AI Instructions**: Map task dependencies.

#### Dependency Graph:
```markdown
### Task Dependencies

```
[1.1 DB Migration]
      ↓
[1.2 SQLAlchemy Models] ─────────┐
      ↓                          │
[1.3 Pydantic Schemas]           │
                                 │
[2.1 Resume Parsing] ←───────────┘
      ↓
[2.2 Embedding Service]
      ↓
[2.3 Matching Service]
      ↓
[2.4 Celery Jobs]
      ↓
[3.1 GET endpoint] ───→ [4.1 JobMatchesPage]
      ↓                        ↓
[3.2 Refresh endpoint]   [4.2 JobMatchCard]
      ↓                        ↓
[3.3 Feedback]           [4.3 Filters]
                              ↓
                         [4.4 States]
                              ↓
                    [5.1 Integration Tests]
                              ↓
                    [5.2 Performance Tests]
                              ↓
                    [5.3 Security Audit]
                              ↓
                    [5.4 Documentation]
                              ↓
                    [6.1 Staging Deploy]
                              ↓
                    [6.2 Production Deploy]
```

**Critical Path** (must complete in order):
1.1 → 1.2 → 2.1 → 2.2 → 2.3 → 2.4 → 3.1 → 5.1 → 6.2

**Parallel Work** (can be done simultaneously):
- Tasks 4.x (Frontend) can start after 3.1 is done
- Task 4.2 can start even earlier (with mock data)
- Task 1.3, 3.3, 5.4 can be done anytime after their dependencies
```

---

### Step 3.3: Risk Assessment
**AI Instructions**: Identify and plan for risks.

#### Risk Matrix:
```markdown
### Feature Risks

#### Risk 1: OpenAI API Rate Limiting
**Likelihood**: Medium
**Impact**: High
**Category**: Technical

**Description**: OpenAI API has rate limits that could slow down embedding generation

**Mitigation Strategies**:
1. Implement request batching (50 resumes per batch)
2. Add exponential backoff retry logic
3. Cache embeddings aggressively
4. Consider alternative embedding services as backup
5. Monitor usage and upgrade plan if needed

**Contingency Plan**:
- Fallback to keyword-only matching if API unavailable
- Queue requests and process when rate limit resets
- Notify users of delay with estimated time

---

#### Risk 2: Poor Match Quality
**Likelihood**: Medium
**Impact**: High
**Category**: Product

**Description**: Users might find matches irrelevant, leading to low engagement

**Mitigation Strategies**:
1. Start with conservative matching (higher threshold)
2. Implement feedback loop early
3. A/B test different algorithms
4. Provide clear match explanations
5. Allow manual refresh if unsatisfied

**Contingency Plan**:
- Quick iteration on algorithm based on feedback
- Add manual job search as alternative
- Provide filters to refine results
- Consider human-in-the-loop for initial matches

---

#### Risk 3: Performance Issues with Scale
**Likelihood**: Low
**Impact**: High
**Category**: Technical

**Description**: Matching algorithm might be too slow with thousands of users

**Mitigation Strategies**:
1. Batch processing instead of real-time
2. Optimize database queries with indexes
3. Use Redis caching extensively
4. Limit matches per user (top 100)
5. Load test with realistic data volumes

**Contingency Plan**:
- Scale horizontally with more workers
- Optimize algorithm (remove expensive operations)
- Reduce matching frequency (weekly instead of daily)
- Prioritize active users

---

[Continue for all identified risks...]
```

---

### Step 3.4: Timeline and Milestones
**AI Instructions**: Create realistic project timeline.

#### Gantt Chart (Text Format):
```markdown
### Project Timeline: 4 Weeks

#### Week 1: Foundation
```
Mon  ███████ [1.1 DB Migration]
     ███████ [1.2 Models]
Tue  ███████ [1.3 Schemas]
     ████░░░ [2.1 Resume Parsing] (started)
Wed  ███████ [2.1 Resume Parsing] (continued)
     ████░░░ [2.2 Embeddings] (started)
Thu  ███████ [2.2 Embeddings] (completed)
     ████░░░ [2.3 Matching Service] (started)
Fri  ███████ [2.3 Matching Service] (continued)

Milestone: Data layer and parsing services complete ✓
```

#### Week 2: Backend Services
```
Mon  ███████ [2.3 Matching Service] (completed)
     ████░░░ [2.4 Celery Jobs] (started)
Tue  ███████ [2.4 Celery Jobs] (completed)
     ████░░░ [3.1 GET endpoint] (started)
Wed  ███████ [3.1 GET endpoint] (completed)
     ███████ [3.2 Refresh endpoint]
Thu  ███████ [3.3 Feedback endpoints]
     ████░░░ [4.1 Frontend Page] (started, parallel)
Fri  ███████ [4.1 Frontend Page] (continued)

Milestone: API endpoints complete ✓
```

#### Week 3: Frontend Development
```
Mon  ███████ [4.1 Frontend Page] (completed)
     ████░░░ [4.2 JobMatchCard] (started)
Tue  ███████ [4.2 JobMatchCard] (continued)
Wed  ███████ [4.2 JobMatchCard] (completed)
     ████░░░ [4.3 Filters] (started)
Thu  ███████ [4.3 Filters] (completed)
     ███████ [4.4 Empty/Error States]
Fri  ████░░░ [5.1 Integration Testing] (started)

Milestone: Frontend components complete ✓
```

#### Week 4: Testing & Launch
```
Mon  ███████ [5.1 Integration Testing] (completed)
     ███████ [5.2 Performance Testing]
Tue  ███████ [5.3 Security Audit]
     ████░░░ [5.4 Documentation] (started)
Wed  ███████ [5.4 Documentation] (completed)
     ███████ [6.1 Staging Deployment]
Thu  ███████ Staging testing & fixes
Fri  ███████ [6.2 Production Deployment]
     ███████ [6.3 Monitoring Setup]

Milestone: Feature launched! 🚀
```

**Buffer**: 2 days at end for unexpected issues
**Total**: 4 weeks (20 working days)
```

---

## 📦 PHASE 4: Implementation Guidance

### Step 4.1: Code Structure
**AI Instructions**: Define file organization.

#### Directory Structure:
```markdown
### New Files to Create

#### Backend
```
backend/
├── app/
│   ├── models/
│   │   └── job_match.py              # New: JobMatch model
│   ├── schemas/
│   │   └── job_match.py              # New: JobMatch schemas
│   ├── services/
│   │   ├── resume_parsing_service.py # New: Resume parsing
│   │   ├── embedding_service.py      # New: Embedding generation
│   │   └── job_match_service.py      # New: Core matching logic
│   ├── api/v1/
│   │   └── job_matches.py            # New: API endpoints
│   ├── worker/
│   │   └── matching_tasks.py         # New: Celery tasks
│   └── utils/
│       └── matching_utils.py         # New: Helper functions
└── migrations/
    └── 001_add_job_matches.sql       # New: DB migration
```

#### Frontend
```
frontend/src/
├── pages/
│   └── JobMatches/
│       ├── JobMatchesPage.jsx        # New: Main page
│       ├── JobMatchesPage.module.css # New: Page styles
│       └── __tests__/
│           └── JobMatchesPage.test.jsx
├── components/
│   └── JobMatches/
│       ├── JobMatchCard.jsx          # New: Match card
│       ├── JobMatchCard.module.css
│       ├── JobMatchList.jsx          # New: List container
│       ├── JobMatchFilter.jsx        # New: Filters
│       ├── JobMatchDetail.jsx        # New: Detail modal
│       ├── EmptyState.jsx            # New: Empty state
│       └── __tests__/
│           ├── JobMatchCard.test.jsx
│           └── JobMatchFilter.test.jsx
├── hooks/
│   └── useJobMatches.js              # New: Custom hook
├── services/
│   └── jobMatchApi.js                # New: API service
└── types/
    └── jobMatch.ts                   # New: TypeScript types
```

---

### Step 4.2: Implementation Examples
**AI Instructions**: Provide code templates.

#### Backend Model Example:
```python
"""Job Match Model"""
from sqlalchemy import Column, Integer, Float, JSON, ForeignKey, TIMESTAMP, CheckConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class JobMatch(Base):
    """
    Represents an AI-generated job match for a user.
    
    A job match is created when the matching algorithm determines
    that a job posting is relevant to a user's resume and preferences.
    """
    __tablename__ = "job_matches"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    job_id = Column(Integer, ForeignKey("jobs.id", ondelete="CASCADE"), nullable=False, index=True)
    
    relevance_score = Column(
        Float, 
        nullable=False,
        doc="Match score from 0-100, higher is better"
    )
    
    matched_skills = Column(
        JSON,
        doc="List of skills that matched between resume and job"
    )
    
    match_reasons = Column(
        JSON,
        doc="Human-readable explanations for why this job matched"
    )
    
    algorithm_scores = Column(
        JSON,
        doc="Breakdown of scores from different matching algorithms"
    )
    
    created_at = Column(TIMESTAMP, server_default=func.now(), nullable=False, index=True)
    expires_at = Column(TIMESTAMP, nullable=False, doc="When this match becomes stale")
    
    # Feedback tracking
    feedback_score = Column(Integer, doc="User feedback: 1 (thumbs up), -1 (thumbs down), null (no feedback)")
    feedback_at = Column(TIMESTAMP, doc="When user provided feedback")
    
    # Relationships
    user = relationship("User", back_populates="job_matches")
    job = relationship("Job", back_populates="matches")
    
    # Constraints
    __table_args__ = (
        CheckConstraint('relevance_score >= 0 AND relevance_score <= 100', name='valid_score'),
        CheckConstraint('feedback_score IN (-1, 1)', name='valid_feedback'),
    )
    
    def __repr__(self):
        return f"<JobMatch(id={self.id}, user_id={self.user_id}, job_id={self.job_id}, score={self.relevance_score})>"
    
    def is_expired(self):
        """Check if this match has expired."""
        from datetime import datetime
        return datetime.utcnow() > self.expires_at
```

#### Backend Service Example:
```python
"""Job Matching Service"""
import logging
from typing import List, Dict, Tuple
from sqlalchemy.orm import Session
from app.models.job_match import JobMatch
from app.models.resume import Resume
from app.models.job import Job
from app.services.embedding_service import EmbeddingService
from app.utils.matching_utils import calculate_keyword_match, calculate_experience_match


logger = logging.getLogger(__name__)


class JobMatchService:
    """
    Service for generating and managing job matches.
    
    This service implements the core matching algorithm that combines
    keyword matching, semantic similarity, and experience matching to
    find relevant jobs for users.
    """
    
    def __init__(self, db: Session):
        self.db = db
        self.embedding_service = EmbeddingService()
        
        # Algorithm weights (can be tuned based on feedback)
        self.KEYWORD_WEIGHT = 0.4
        self.SEMANTIC_WEIGHT = 0.4
        self.EXPERIENCE_WEIGHT = 0.2
        self.MIN_MATCH_SCORE = 70.0
    
    def generate_matches_for_user(self, user_id: int, limit: int = 100) -> List[JobMatch]:
        """
        Generate job matches for a user based on their resume.
        
        Args:
            user_id: ID of the user
            limit: Maximum number of matches to generate
            
        Returns:
            List of JobMatch objects
            
        Raises:
            ValueError: If user has no active resume
        """
        logger.info(f"Generating job matches for user {user_id}")
        
        # Get user's active resume
        resume = self.db.query(Resume).filter(
            Resume.user_id == user_id,
            Resume.is_active == True
        ).first()
        
        if not resume:
            raise ValueError(f"No active resume found for user {user_id}")
        
        # Get active job postings
        jobs = self.db.query(Job).filter(
            Job.is_active == True,
            Job.expires_at > func.now()
        ).all()
        
        logger.info(f"Found {len(jobs)} active jobs to match against")
        
        # Calculate match scores for all jobs
        matches = []
        for job in jobs:
            try:
                score, breakdown = self.calculate_match_score(resume, job)
                
                if score >= self.MIN_MATCH_SCORE:
                    match = self._create_match_object(
                        user_id=user_id,
                        job=job,
                        score=score,
                        breakdown=breakdown
                    )
                    matches.append(match)
            except Exception as e:
                logger.error(f"Error matching job {job.id}: {e}")
                continue
        
        # Sort by score and limit
        matches.sort(key=lambda m: m.relevance_score, reverse=True)
        matches = matches[:limit]
        
        logger.info(f"Generated {len(matches)} matches for user {user_id}")
        
        # Save to database
        self.db.bulk_save_objects(matches)
        self.db.commit()
        
        return matches
    
    def calculate_match_score(
        self, 
        resume: Resume, 
        job: Job
    ) -> Tuple[float, Dict[str, float]]:
        """
        Calculate match score between a resume and job.
        
        Uses a hybrid approach combining:
        - Keyword matching (40%)
        - Semantic similarity (40%)  
        - Experience matching (20%)
        
        Args:
            resume: User's resume
            job: Job posting
            
        Returns:
            Tuple of (final_score, score_breakdown)
        """
        # 1. Keyword matching
        keyword_score = calculate_keyword_match(
            resume_skills=resume.extracted_skills,
            job_requirements=job.required_skills
        )
        
        # 2. Semantic similarity
        semantic_score = self.embedding_service.calculate_similarity(
            resume.embedding,
            job.embedding
        )
        
        # 3. Experience matching
        experience_score = calculate_experience_match(
            resume_years=resume.years_experience,
            job_min_years=job.min_years_experience,
            job_max_years=job.max_years_experience
        )
        
        # 4. Weighted average
        final_score = (
            keyword_score * self.KEYWORD_WEIGHT +
            semantic_score * self.SEMANTIC_WEIGHT +
            experience_score * self.EXPERIENCE_WEIGHT
        )
        
        breakdown = {
            'keyword': keyword_score,
            'semantic': semantic_score,
            'experience': experience_score,
            'final': final_score
        }
        
        return final_score, breakdown
    
    def _create_match_object(
        self,
        user_id: int,
        job: Job,
        score: float,
        breakdown: Dict[str, float]
    ) -> JobMatch:
        """Create a JobMatch object with match explanations."""
        from datetime import datetime, timedelta
        
        # Generate human-readable match reasons
        reasons = self._generate_match_reasons(job, breakdown)
        
        return JobMatch(
            user_id=user_id,
            job_id=job.id,
            relevance_score=round(score, 2),
            matched_skills=job.required_skills[:10],  # Top 10 matched skills
            match_reasons=reasons,
            algorithm_scores=breakdown,
            expires_at=datetime.utcnow() + timedelta(days=30)
        )
    
    def _generate_match_reasons(self, job: Job, breakdown: Dict[str, float]) -> List[str]:
        """Generate explanations for why this job matched."""
        reasons = []
        
        if breakdown['keyword'] > 80:
            reasons.append(f"Strong skill match with {job.company}")
        
        if breakdown['semantic'] > 80:
            reasons.append("Job description closely aligns with your experience")
        
        if breakdown['experience'] > 90:
            reasons.append(f"Your experience level is ideal for this {job.title} role")
        
        if job.is_remote:
            reasons.append("Remote work opportunity")
        
        if len(reasons) == 0:
            reasons.append("Good overall match based on your profile")
        
        return reasons
```

#### Frontend Component Example:
```javascript
/**
 * JobMatchCard Component
 * Displays a single job match with relevance score and match reasons
 */
import { useState } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { 
  BuildingOfficeIcon, 
  MapPinIcon, 
  CurrencyDollarIcon,
  HeartIcon,
  SparklesIcon 
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import styles from './JobMatchCard.module.css';

/**
 * JobMatchCard displays a job posting with AI match information
 * 
 * @param {Object} props
 * @param {Object} props.match - Job match data
 * @param {Function} props.onSave - Callback when user saves job
 * @param {Function} props.onApply - Callback when user applies
 * @param {Function} props.onFeedback - Callback for match feedback
 */
export default function JobMatchCard({ match, onSave, onApply, onFeedback }) {
  const [isSaved, setIsSaved] = useState(match.is_saved || false);
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

  const { job, relevance_score, match_reasons, matched_skills } = match;

  /**
   * Get color class based on relevance score
   */
  const getScoreColor = (score) => {
    if (score >= 90) return styles.scoreExcellent;
    if (score >= 80) return styles.scoreGood;
    if (score >= 70) return styles.scoreFair;
    return styles.scorePoor;
  };

  /**
   * Handle save/unsave toggle
   */
  const handleSave = async () => {
    const newState = !isSaved;
    setIsSaved(newState);
    
    try {
      await onSave(match.id, newState);
    } catch (error) {
      // Revert on error
      setIsSaved(!newState);
      console.error('Failed to save job:', error);
    }
  };

  /**
   * Handle feedback submission
   */
  const handleFeedback = async (isPositive) => {
    setIsSubmittingFeedback(true);
    try {
      await onFeedback(match.id, isPositive ? 1 : -1);
    } catch (error) {
      console.error('Failed to submit feedback:', error);
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  return (
    <article className={styles.card}>
      {/* Header with company and score */}
      <div className={styles.header}>
        <div className={styles.companyInfo}>
          <BuildingOfficeIcon className={styles.companyIcon} />
          <div>
            <h3 className={styles.jobTitle}>{job.title}</h3>
            <p className={styles.companyName}>{job.company}</p>
          </div>
        </div>
        
        <div className={styles.scoreContainer}>
          <div className={clsx(styles.scoreBadge, getScoreColor(relevance_score))}>
            <SparklesIcon className={styles.scoreIcon} />
            <span className={styles.scoreValue}>{Math.round(relevance_score)}%</span>
          </div>
          <span className={styles.scoreLabel}>Match</span>
        </div>
      </div>

      {/* Job details */}
      <div className={styles.details}>
        <div className={styles.detailItem}>
          <MapPinIcon className={styles.detailIcon} />
          <span>{job.location || 'Remote'}</span>
        </div>
        
        {job.salary_range && (
          <div className={styles.detailItem}>
            <CurrencyDollarIcon className={styles.detailIcon} />
            <span>{job.salary_range}</span>
          </div>
        )}
      </div>

      {/* Match reasons */}
      {match_reasons && match_reasons.length > 0 && (
        <div className={styles.matchReasons}>
          <p className={styles.matchReasonsTitle}>Why this matches:</p>
          <ul className={styles.matchReasonsList}>
            {match_reasons.slice(0, 3).map((reason, index) => (
              <li key={index} className={styles.matchReason}>
                <span className={styles.matchReasonBullet}>•</span>
                {reason}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Matched skills */}
      {matched_skills && matched_skills.length > 0 && (
        <div className={styles.skills}>
          {matched_skills.slice(0, 5).map((skill, index) => (
            <span key={index} className={styles.skillTag}>
              {skill}
            </span>
          ))}
          {matched_skills.length > 5 && (
            <span className={styles.skillTag}>+{matched_skills.length - 5} more</span>
          )}
        </div>
      )}

      {/* Actions */}
      <div className={styles.actions}>
        <button
          className={clsx(styles.button, styles.buttonPrimary)}
          onClick={() => onApply(job.id)}
          aria-label={`Apply to ${job.title} at ${job.company}`}
        >
          Apply Now
        </button>
        
        <button
          className={clsx(styles.button, styles.buttonSecondary)}
          onClick={handleSave}
          aria-label={isSaved ? 'Remove from saved jobs' : 'Save job for later'}
        >
          {isSaved ? (
            <HeartSolidIcon className={styles.buttonIcon} />
          ) : (
            <HeartIcon className={styles.buttonIcon} />
          )}
          {isSaved ? 'Saved' : 'Save'}
        </button>
      </div>

      {/* Feedback */}
      <div className={styles.feedback}>
        <span className={styles.feedbackLabel}>Is this match relevant?</span>
        <div className={styles.feedbackButtons}>
          <button
            className={styles.feedbackButton}
            onClick={() => handleFeedback(true)}
            disabled={isSubmittingFeedback}
            aria-label="Yes, this match is relevant"
          >
            👍
          </button>
          <button
            className={styles.feedbackButton}
            onClick={() => handleFeedback(false)}
            disabled={isSubmittingFeedback}
            aria-label="No, this match is not relevant"
          >
            👎
          </button>
        </div>
      </div>
    </article>
  );
}

JobMatchCard.propTypes = {
  match: PropTypes.shape({
    id: PropTypes.number.isRequired,
    job: PropTypes.shape({
      id: PropTypes.number.isRequired,
      title: PropTypes.string.isRequired,
      company: PropTypes.string.isRequired,
      location: PropTypes.string,
      salary_range: PropTypes.string,
    }).isRequired,
    relevance_score: PropTypes.number.isRequired,
    match_reasons: PropTypes.arrayOf(PropTypes.string),
    matched_skills: PropTypes.arrayOf(PropTypes.string),
    is_saved: PropTypes.bool,
  }).isRequired,
  onSave: PropTypes.func.isRequired,
  onApply: PropTypes.func.isRequired,
  onFeedback: PropTypes.func.isRequired,
};
```

---

## 📊 PHASE 5: Testing Strategy

### Step 5.1: Test Plan
**AI Instructions**: Define comprehensive testing approach.

#### Testing Pyramid:
```markdown
### Test Coverage Strategy

```
               /\
              /  \
           E2E Tests
          /  (10%)  \
         /            \
        /--------------\
       / Integration    \
      /    Tests (30%)   \
     /                    \
    /----------------------\
   /     Unit Tests        \
  /       (60%)             \
 /                           \
/-----------------------------\
```

#### Unit Tests (60% of tests):
```markdown
**Backend Unit Tests**:
- [ ] JobMatchService.calculate_match_score()
- [ ] JobMatchService.generate_matches_for_user()
- [ ] ResumeParsingService.extract_skills()
- [ ] EmbeddingService.generate_embedding()
- [ ] Matching utility functions
- [ ] Model validation methods
- [ ] Schema validation

**Frontend Unit Tests**:
- [ ] JobMatchCard renders correctly
- [ ] JobMatchCard handles user interactions
- [ ] JobMatchFilter applies filters
- [ ] useJobMatches hook fetches data
- [ ] Score calculation utilities
- [ ] Date formatting utilities

**Target**: 80% code coverage
```

#### Integration Tests (30% of tests):
```markdown
**API Integration Tests**:
- [ ] GET /job-matches returns correct data structure
- [ ] POST /job-matches/refresh triggers background job
- [ ] Feedback endpoints store data correctly
- [ ] Authentication required on all endpoints
- [ ] Pagination works correctly
- [ ] Filtering and sorting work together

**Database Integration Tests**:
- [ ] JobMatch creation with relationships
- [ ] Cascade deletes work correctly
- [ ] Indexes improve query performance
- [ ] Constraints enforce data integrity

**External Service Integration**:
- [ ] OpenAI API integration (with mocks)
- [ ] Celery task execution
- [ ] Redis caching

**Target**: 70% coverage of integration points
```

#### E2E Tests (10% of tests):
```markdown
**Critical User Flows**:
1. [ ] **First-time user flow**:
   - User uploads resume
   - Matches are generated
   - User views matches
   - User saves a job
   - User applies to a job

2. [ ] **Returning user flow**:
   - User logs in
   - Sees dashboard with new matches
   - Filters matches by location
   - Provides feedback on match
   - Applies to job

3. [ ] **Error recovery flow**:
   - API timeout occurs
   - User sees error message
   - User retries successfully
   - Data is consistent

**Target**: All critical flows covered
```

---

### Step 5.2: Test Implementation Examples
**AI Instructions**: Provide test templates.

#### Backend Test Example:
```python
"""Tests for JobMatchService"""
import pytest
from unittest.mock import Mock, patch
from datetime import datetime, timedelta
from app.services.job_match_service import JobMatchService
from app.models.resume import Resume
from app.models.job import Job


class TestJobMatchService:
    """Test suite for job matching service."""
    
    @pytest.fixture
    def service(self, db_session):
        """Create service instance with test database."""
        return JobMatchService(db_session)
    
    @pytest.fixture
    def sample_resume(self):
        """Create a sample resume for testing."""
        return Resume(
            id=1,
            user_id=1,
            extracted_skills=['Python', 'FastAPI', 'React', 'PostgreSQL'],
            years_experience=5,
            embedding=[0.1, 0.2, 0.3],  # Mock embedding
            is_active=True
        )
    
    @pytest.fixture
    def sample_job(self):
        """Create a sample job posting for testing."""
        return Job(
            id=1,
            title='Senior Software Engineer',
            company='Tech Corp',
            required_skills=['Python', 'FastAPI', 'AWS'],
            min_years_experience=4,
            max_years_experience=7,
            embedding=[0.15, 0.18, 0.32],  # Mock embedding
            is_active=True,
            expires_at=datetime.utcnow() + timedelta(days=30)
        )
    
    def test_calculate_match_score_high_match(self, service, sample_resume, sample_job):
        """Test that high-quality match produces high score."""
        score, breakdown = service.calculate_match_score(sample_resume, sample_job)
        
        assert score >= 70.0, "High-quality match should have score >= 70"
        assert 0 <= score <= 100, "Score should be between 0 and 100"
        
        # Check breakdown components
        assert 'keyword' in breakdown
        assert 'semantic' in breakdown
        assert 'experience' in breakdown
        assert 'final' in breakdown
        
        # Keyword match should be strong (2 out of 3 skills match)
        assert breakdown['keyword'] >= 60.0
    
    def test_calculate_match_score_poor_match(self, service):
        """Test that poor match produces low score."""
        resume = Resume(
            extracted_skills=['Java', 'Spring', 'Oracle'],
            years_experience=2,
            embedding=[0.9, 0.8, 0.1]
        )
        
        job = Job(
            required_skills=['Python', 'Django', 'PostgreSQL'],
            min_years_experience=5,
            max_years_experience=8,
            embedding=[0.1, 0.2, 0.3]
        )
        
        score, breakdown = service.calculate_match_score(resume, job)
        
        assert score < 70.0, "Poor match should have score < 70"
        assert breakdown['keyword'] < 40.0, "Keyword match should be low"
    
    def test_generate_matches_for_user_no_resume(self, service, db_session):
        """Test error handling when user has no resume."""
        with pytest.raises(ValueError, match="No active resume found"):
            service.generate_matches_for_user(user_id=999)
    
    @patch('app.services.job_match_service.calculate_keyword_match')
    def test_generate_matches_filters_low_scores(
        self, 
        mock_keyword_match,
        service,
        db_session,
        sample_resume
    ):
        """Test that only high-scoring matches are returned."""
        # Setup
        db_session.add(sample_resume)
        
        # Create jobs with different match qualities
        high_match_job = Job(id=1, required_skills=['Python'], is_active=True)
        low_match_job = Job(id=2, required_skills=['Java'], is_active=True)
        db_session.add_all([high_match_job, low_match_job])
        db_session.commit()
        
        # Mock scoring to return high and low scores
        mock_keyword_match.side_effect = [85.0, 50.0]
        
        # Execute
        matches = service.generate_matches_for_user(user_id=1)
        
        # Verify
        assert len(matches) == 1, "Should only return high-scoring match"
        assert matches[0].job_id == 1
        assert matches[0].relevance_score >= 70.0
    
    def test_match_reasons_generation(self, service, sample_job):
        """Test that match reasons are generated correctly."""
        breakdown = {
            'keyword': 85.0,
            'semantic': 90.0,
            'experience': 95.0,
            'final': 90.0
        }
        
        reasons = service._generate_match_reasons(sample_job, breakdown)
        
        assert len(reasons) > 0, "Should generate at least one reason"
        assert any('skill match' in reason.lower() for reason in reasons)
        assert any('experience' in reason.lower() for reason in reasons)
```

#### Frontend Test Example:
```javascript
/**
 * Tests for JobMatchCard component
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import JobMatchCard from './JobMatchCard';

describe('JobMatchCard', () => {
  const mockMatch = {
    id: 1,
    job: {
      id: 123,
      title: 'Senior Software Engineer',
      company: 'Tech Corp',
      location: 'San Francisco, CA',
      salary_range: '$120k - $180k',
    },
    relevance_score: 95.5,
    match_reasons: [
      'Strong skill match with Tech Corp',
      'Your experience level is ideal for this role',
      'Remote work opportunity',
    ],
    matched_skills: ['Python', 'React', 'PostgreSQL', 'FastAPI', 'AWS'],
    is_saved: false,
  };

  const mockHandlers = {
    onSave: jest.fn(),
    onApply: jest.fn(),
    onFeedback: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders job information correctly', () => {
      render(<JobMatchCard match={mockMatch} {...mockHandlers} />);

      expect(screen.getByText('Senior Software Engineer')).toBeInTheDocument();
      expect(screen.getByText('Tech Corp')).toBeInTheDocument();
      expect(screen.getByText('San Francisco, CA')).toBeInTheDocument();
      expect(screen.getByText('$120k - $180k')).toBeInTheDocument();
    });

    it('displays relevance score with correct color', () => {
      render(<JobMatchCard match={mockMatch} {...mockHandlers} />);

      const scoreElement = screen.getByText('96%');
      expect(scoreElement).toBeInTheDocument();
      // High score (>90) should have excellent color class
      expect(scoreElement.parentElement).toHaveClass('scoreExcellent');
    });

    it('displays match reasons', () => {
      render(<JobMatchCard match={mockMatch} {...mockHandlers} />);

      expect(screen.getByText(/Strong skill match/)).toBeInTheDocument();
      expect(screen.getByText(/experience level is ideal/)).toBeInTheDocument();
      expect(screen.getByText(/Remote work opportunity/)).toBeInTheDocument();
    });

    it('displays matched skills', () => {
      render(<JobMatchCard match={mockMatch} {...mockHandlers} />);

      expect(screen.getByText('Python')).toBeInTheDocument();
      expect(screen.getByText('React')).toBeInTheDocument();
      expect(screen.getByText('PostgreSQL')).toBeInTheDocument();
    });

    it('limits displayed skills to 5', () => {
      const matchWithManySkills = {
        ...mockMatch,
        matched_skills: ['Skill1', 'Skill2', 'Skill3', 'Skill4', 'Skill5', 'Skill6', 'Skill7'],
      };

      render(<JobMatchCard match={matchWithManySkills} {...mockHandlers} />);

      expect(screen.getByText('Skill5')).toBeInTheDocument();
      expect(screen.getByText('+2 more')).toBeInTheDocument();
      expect(screen.queryByText('Skill6')).not.toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('calls onApply when Apply button clicked', async () => {
      render(<JobMatchCard match={mockMatch} {...mockHandlers} />);

      const applyButton = screen.getByText('Apply Now');
      await userEvent.click(applyButton);

      expect(mockHandlers.onApply).toHaveBeenCalledWith(123);
      expect(mockHandlers.onApply).toHaveBeenCalledTimes(1);
    });

    it('toggles save state when Save button clicked', async () => {
      mockHandlers.onSave.mockResolvedValue();
      render(<JobMatchCard match={mockMatch} {...mockHandlers} />);

      const saveButton = screen.getByText('Save');
      await userEvent.click(saveButton);

      await waitFor(() => {
        expect(mockHandlers.onSave).toHaveBeenCalledWith(1, true);
      });

      expect(screen.getByText('Saved')).toBeInTheDocument();
    });

    it('reverts save state on error', async () => {
      const consoleError = jest.spyOn(console, 'error').mockImplementation();
      mockHandlers.onSave.mockRejectedValue(new Error('Save failed'));

      render(<JobMatchCard match={mockMatch} {...mockHandlers} />);

      const saveButton = screen.getByText('Save');
      await userEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText('Save')).toBeInTheDocument();
      });

      expect(consoleError).toHaveBeenCalled();
      consoleError.mockRestore();
    });

    it('submits positive feedback when thumbs up clicked', async () => {
      mockHandlers.onFeedback.mockResolvedValue();
      render(<JobMatchCard match={mockMatch} {...mockHandlers} />);

      const thumbsUpButton = screen.getByLabelText('Yes, this match is relevant');
      await userEvent.click(thumbsUpButton);

      await waitFor(() => {
        expect(mockHandlers.onFeedback).toHaveBeenCalledWith(1, 1);
      });
    });

    it('submits negative feedback when thumbs down clicked', async () => {
      mockHandlers.onFeedback.mockResolvedValue();
      render(<JobMatchCard match={mockMatch} {...mockHandlers} />);

      const thumbsDownButton = screen.getByLabelText('No, this match is not relevant');
      await userEvent.click(thumbsDownButton);

      await waitFor(() => {
        expect(mockHandlers.onFeedback).toHaveBeenCalledWith(1, -1);
      });
    });

    it('disables feedback buttons while submitting', async () => {
      mockHandlers.onFeedback.mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 100))
      );

      render(<JobMatchCard match={mockMatch} {...mockHandlers} />);

      const thumbsUpButton = screen.getByLabelText('Yes, this match is relevant');
      const thumbsDownButton = screen.getByLabelText('No, this match is not relevant');

      fireEvent.click(thumbsUpButton);

      expect(thumbsUpButton).toBeDisabled();
      expect(thumbsDownButton).toBeDisabled();

      await waitFor(() => {
        expect(thumbsUpButton).not.toBeDisabled();
      });
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels for buttons', () => {
      render(<JobMatchCard match={mockMatch} {...mockHandlers} />);

      expect(
        screen.getByLabelText('Apply to Senior Software Engineer at Tech Corp')
      ).toBeInTheDocument();
      expect(screen.getByLabelText('Save job for later')).toBeInTheDocument();
      expect(screen.getByLabelText('Yes, this match is relevant')).toBeInTheDocument();
    });

    it('is keyboard navigable', () => {
      render(<JobMatchCard match={mockMatch} {...mockHandlers} />);

      const applyButton = screen.getByText('Apply Now');
      applyButton.focus();

      expect(document.activeElement).toBe(applyButton);
    });
  });

  describe('Edge Cases', () => {
    it('handles missing optional fields gracefully', () => {
      const minimalMatch = {
        id: 1,
        job: {
          id: 123,
          title: 'Job Title',
          company: 'Company',
        },
        relevance_score: 75,
      };

      render(<JobMatchCard match={minimalMatch} {...mockHandlers} />);

      expect(screen.getByText('Job Title')).toBeInTheDocument();
      expect(screen.queryByText('Why this matches:')).not.toBeInTheDocument();
    });

    it('handles very low relevance scores', () => {
      const lowScoreMatch = { ...mockMatch, relevance_score: 50 };

      render(<JobMatchCard match={lowScoreMatch} {...mockHandlers} />);

      const scoreElement = screen.getByText('50%');
      expect(scoreElement.parentElement).toHaveClass('scorePoor');
    });
  });
});
```

---

## 📝 PHASE 6: Documentation

### Step 6.1: Feature Documentation
**AI Instructions**: Create comprehensive feature docs.

#### Documentation Template:
```markdown
# Job Matching Feature

## Overview
The Job Matching feature uses AI to analyze user resumes and match them with relevant job postings from our database. It provides personalized job recommendations with explanations for why each job is a good match.

## User Guide

### For End Users

#### Viewing Job Matches
1. Navigate to Dashboard
2. Click on "AI Job Matches" card
3. Browse through recommended jobs sorted by relevance
4. Click on any job to see full details

#### Filtering Matches
- **Location**: Filter by city, state, or "Remote"
- **Salary**: Set minimum salary requirement
- **Match Score**: Adjust minimum relevance threshold

#### Saving Jobs
- Click the heart icon to save jobs for later
- Access saved jobs from the "Saved Jobs" page

#### Applying to Jobs
- Click "Apply Now" to be directed to application
- Application tracked automatically in your dashboard

#### Providing Feedback
- Use 👍/👎 to rate match quality
- Feedback improves future recommendations

---

### For Developers

#### Architecture
The job matching system consists of:
- **Frontend**: React components for UI
- **API Layer**: FastAPI endpoints
- **Matching Service**: Core algorithm
- **Background Jobs**: Celery tasks for batch processing
- **Caching**: Redis for performance
- **AI**: OpenAI embeddings for semantic matching

#### API Endpoints

##### GET /api/v1/job-matches
Returns paginated list of job matches for authenticated user.

**Query Parameters**:
- `limit` (int): Number of results (max 50, default 10)
- `offset` (int): Pagination offset (default 0)
- `min_score` (float): Minimum relevance score (default 70)
- `location` (string): Filter by location
- `sort` (string): Sort by `score`, `date`, or `salary`

**Response**:
```json
{
  "matches": [/* array of matches */],
  "total": 156,
  "limit": 10,
  "offset": 0
}
```

**Error Codes**:
- `401`: Not authenticated
- `404`: No resume found for user
- `500`: Server error

##### POST /api/v1/job-matches/refresh
Triggers fresh matching analysis for user.

**Request Body**:
```json
{
  "resume_id": 123,
  "preferences": {
    "locations": ["San Francisco", "Remote"],
    "min_salary": 100000
  }
}
```

**Response**:
```json
{
  "task_id": "abc-123",
  "status": "processing",
  "estimated_time": "30s"
}
```

#### Matching Algorithm

The hybrid matching algorithm combines:

1. **Keyword Matching (40% weight)**
   - Exact skill matches
   - Synonym matching
   - Fast and explainable

2. **Semantic Similarity (40% weight)**
   - OpenAI embeddings
   - Captures context and meaning
   - Finds related opportunities

3. **Experience Matching (20% weight)**
   - Years of experience
   - Seniority level
   - Career progression

**Formula**:
```
final_score = (keyword_score × 0.4) + (semantic_score × 0.4) + (experience_score × 0.2)
```

#### Performance Considerations

- Matching runs daily at 2 AM UTC
- Results cached in Redis for 24 hours
- Manual refresh available (rate limited)
- Top 100 matches stored per user
- Top 20 matches cached for quick access

#### Monitoring

**Key Metrics**:
- Match generation time
- API response times
- User feedback (positive/negative)
- Cache hit rates
- OpenAI API usage

**Alerts**:
- Match generation failures
- OpenAI API quota exceeded
- High error rates on endpoints

## Troubleshooting

### Common Issues

**Issue**: User sees "No matches found"
**Cause**: Resume has too few skills or very specific requirements
**Solution**: 
- Encourage user to update resume with more skills
- Lower minimum score threshold
- Expand location preferences

**Issue**: Matches seem irrelevant
**Cause**: Algorithm needs tuning or resume parsing issues
**Solution**:
- Check resume parsing output
- Review algorithm weights
- Analyze user feedback patterns
- Consider A/B testing different weights

**Issue**: Slow match generation
**Cause**: Large number of active jobs or API rate limiting
**Solution**:
- Implement batching
- Add more Celery workers
- Optimize database queries
- Consider caching embeddings longer

## Future Enhancements

- [ ] Company culture matching
- [ ] Salary negotiation insights
- [ ] Interview preparation suggestions
- [ ] Network connections at companies
- [ ] Job market trends and analytics
- [ ] Custom matching criteria per user
- [ ] Email notifications for new high matches

---

**Last Updated**: [DATE]
**Version**: 1.0.0
**Maintainer**: [TEAM/PERSON]
