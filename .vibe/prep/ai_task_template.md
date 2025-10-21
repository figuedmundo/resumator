# AI Task Planning Template - Starter Framework

> **About This Template:** This is a systematic framework for planning and executing technical projects with AI assistance. Use this structure to break down complex features, improvements, or fixes into manageable, trackable tasks that AI agents can execute effectively.

---

## 1. Task Overview

### Task Title
<!-- Give your task a clear, specific name that describes what you're building or fixing -->
**Title:** [Brief, descriptive title of what you're building/fixing - e.g., "Add User Authentication System" or "Fix Payment Integration Bug"]

### Goal Statement
<!-- Write one paragraph explaining what you want to achieve and why it matters for your project -->
**Goal:** [Clear statement of the end result you want and the business/user value it provides]

---
## 2. Strategic Analysis & Solution Options

### When to use use strategic analysis
<!-- AI Agent: Use your judgment to determine when strategic analysis is needed vs direct implementation 

** CONDUCT STRATIC ANALYSIS WHEN:** 
- Multiple viable technical approaches exist
- Trade-offs between different solutions are significant
- User requirements could be met through different UX patterns
- Architectural decisions will impact furute development
- Implementation approach affects performance, security, or maintainability significantly
- Change touches multiple systems or has broad impact

** X SKOP STRATEGIC ANALYSIS WHEN:**
- Only one obvios technical solution exists
- It's a straighforward bug fix or minor enhancement
- The implementation pattern is clearly established in the codebase
- Change is small and isolated with minimal impact
- User has already specified the exact approach they want

**DEFAULT BEHAVIOR:** when in doubt, provide strategic analysis. It's better to over-communicate than to assume.
-->

### Problem Context
<!-- Resteta the problem and why it needs is a strategic consideration -->
[Explain the problem and why multiple solutions should be considered. What makes this decision important.]

### Solution Options Analysis
#### Option 1: [Solution Name]
**Approach:** [Brief description of this solution approach]

**Pros:**
- [Advantage 1: Specific benefit]
- [Advantage 2: quantified when possible]
- [Advantage 3: why this is a better]

**Cons:**
- [Disadvantage 1: Specific limitation]
- [Disadvantage 2: trade-off or cost]
- [Disadvantage 3: risk or complexity]


**Implementation complexity:** [low/medium/high] [brief justification]
**Risk level:** [low/medium/high] [primary risk factors]

#### Option 2: [Solution Name]
**Approach:** [Brief description of this solution approach]

**Pros:**
- [Advantage 1:]
- [Advantage 2: ]
- [Advantage 3: ]

**Cons:**
- [Disadvantage 1: ]
- [Disadvantage 2: ]
- [Disadvantage 3: ]


**Implementation complexity:** [low/medium/high] [brief justification]
**Risk level:** [low/medium/high] [primary risk factors]


### recommendation and estimates

**RECOMENDED SOLUTION**, Option [X] - [solution name]

**Why this is the best choice:**
1. **[Primary reason]** - [specific justification]
2. **[Second reason]** - [supporting evidence]
3. **[additional reason]** - [long term considerations]

**Key decision factors:**
- **Performance impact:** [how this affects app performance]
- **User experience:** [how this affects users]
- **Maintanability:** [how this affects future development]
- **Scalability:** [how these handles growth]
- **Security:** [security implications]

**Alternative consideration**
If there is a close second choice, explain why it wasn't selected and under what conditions it should be considered

---

## 3. Project Analysis & Current State

### Technology & Architecture
<!-- This is where you document your current tech stack so the AI understands your environment -->
- **Frameworks & Versions:** React 18.2.0 (with Vite), FastAPI, Python 3.9+
- **Language:** JavaScript (ES6+), Python 3.9+
- **Database & ORM:** PostgreSQL with SQLAlchemy
- **UI & Styling:** Tailwind CSS, CSS Modulesv
- **Authentication:** JWT
- **Key Architectural Patterns:** Service Layer, Dependency Injection, Component-Based UI

### Current State
<!-- Describe what exists today - what's working, what's broken, what's missing -->
[Analysis of your current codebase state, existing functionality, and what needs to be changed]

---
## 4. Context & Problem Definition

### Problem Statement
<!-- This is where you clearly define the specific problem you're solving -->
[Detailed explanation of the problem, including user impact, pain points, and why it needs to be solved now]

### Success Criteria
<!-- Define exactly how you'll know when this task is complete and successful -->
- [ ] [Specific, measurable outcome 1]
- [ ] [Specific, measurable outcome 2]
- [ ] [Specific, measurable outcome 3]

---

## 5. Development Mode Context

### Development Mode Context
<!-- This is where you tell the AI agent about your project's constraints and priorities -->
- **🚨 Project Stage:** TODO: Define if this is new development, production system, or legacy migration
- **Breaking Changes:** TODO: Specify if breaking changes are acceptable or must be avoided
- **Data Handling:** TODO: Define data preservation requirements
- **User Base:** TODO: Describe who will be affected by changes
- **Priority:** High priority. The focus is on stability and delivering a correct fix.

---

## 6. Technical Requirements

### Functional Requirements
<!-- This is where the AI will understand exactly what the system should do - be specific about user actions and system behaviors -->

TODO: Define what users can do and what the system will automatically handle
- Example format: "User can [specific action]"
- Example format: "System automatically [specific behavior]" 
- Example format: "When [condition] occurs, then [system response]"

### Non-Functional Requirements
<!-- This is where you define performance, security, and usability standards -->
- **Performance:** TODO: Define response time and load handling requirements
- **Security:** TODO: Specify authentication and data protection needs
- **Usability:** TODO: Set user experience and accessibility standards
- **Responsive Design:** TODO: Define mobile, tablet, desktop support requirements
- **Theme Support:** TODO: Specify light/dark mode and brand requirements

### Technical Constraints
<!-- This is where you list limitations the AI agent must work within -->
- [Must use existing system X]
- [Cannot modify database table Y]
- [Must maintain compatibility with feature Z]

---

## 7. Data & Database Changes

### Database Schema Changes
<!-- This is where you specify any database modifications needed -->

TODO: Add your SQL schema changes here (new tables, columns, indexes, etc.)

### Data Model Updates
<!-- This is where you define TypeScript types, schema updates, or data structure changes -->

TODO: Define your TypeScript types, interfaces, and data structure changes

### Data Migration Plan
<!-- This is where you plan how to handle existing data during changes -->

TODO: Plan your data migration steps (backup, apply changes, transform data, validate)

---

## 8. API & Backend Changes

### Data Access Pattern Rules
<!-- This is where you tell the AI agent how to structure backend code in your project -->

TODO: Define where different types of code should go in your project (mutations, queries, API routes)

### Server Actions
<!-- List the backend mutation operations you need -->

TODO: List your create, update, delete operations and what they do

### Database Queries
<!-- Specify how you'll fetch data -->

TODO: Define your data fetching approach (direct queries vs separate functions)

---

## 9. Frontend Changes

### New Components
<!-- This is where you specify UI components to be created -->

TODO: List the new components you need to create and their purpose

### Page Updates
<!-- This is where you list pages that need modifications -->

TODO: List the pages that need changes and what modifications are required

### State Management
<!-- This is where you plan how data flows through your frontend -->

TODO: Define your state management approach and data flow strategy

---

## 10. Implementation Plan

TODO: Break your work into phases with specific tasks and file paths

---

## 11. Task Completion Tracking

### Real-Time Progress Tracking
<!-- This is where you tell the AI agent to update progress as work is completed -->

TODO: Define how you want the AI to track and report progress on tasks

---

## 12. File Structure & Organization

TODO: Plan what new files to create and existing files to modify

---

## 13. AI Agent Instructions

### Implementation Workflow
<!-- This is where you give specific instructions to your AI agent -->
🎯 **MANDATORY PROCESS:**
TODO:

### Communication Preferences
<!-- This is where you set expectations for how the AI should communicate -->
TODO: How do you want the agent to communicate with you

### Code Quality Standards
<!-- This is where you define your coding standards for the AI to follow -->
TODO: Any specific code standards

---

## 13. Second-Order Impact Analysis

### Impact Assessment
<!-- This is where you think through broader consequences of your changes -->

TODO: Tell the AI what sections of code you're worried about breaking, performance concerns, and user workflow impacts

---


