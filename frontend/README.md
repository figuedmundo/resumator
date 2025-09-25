# Resumator Frontend

A React-based frontend for the Resumator application - an AI-powered resume customization platform.

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Backend API running on `http://localhost:8000`

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   # or
   npm start
   ```

3. **Access the application:**
   - Frontend: `http://localhost:3000`
   - Backend API should be running on: `http://localhost:8000`

## 📁 Project Structure

```
src/
├── App.jsx                 ✅ Main app component with routing
├── main.jsx               ✅ React root entry point
├── components/
│   ├── common/            ✅ Shared components (Header, LoadingSpinner, etc.)
│   ├── resume/            🔄 Resume-specific components (TODO)
│   └── application/       🔄 Application-specific components (TODO)
├── pages/
│   ├── auth/              ✅ Login and Register pages
│   ├── DashboardPage.jsx  ✅ Main dashboard
│   ├── ResumesPage.jsx    ✅ Resume list page
│   ├── ResumeEditorPage.jsx 🔄 Resume editor (placeholder)
│   ├── ResumeViewPage.jsx   🔄 Resume view (placeholder)
│   ├── ApplicationsPage.jsx 🔄 Applications list (placeholder)
│   └── ...                🔄 Other pages (placeholders)
├── hooks/
│   └── useAuth.js         ✅ Authentication hook
├── services/
│   └── api.js             ✅ API service layer
├── utils/
│   ├── constants.js       ✅ App constants
│   └── helpers.js         ✅ Utility functions
└── styles/
    └── globals.css        ✅ Global styles with Tailwind
```

## ✅ What's Already Complete

### Core Infrastructure
- ✅ Vite + React setup
- ✅ Tailwind CSS configuration
- ✅ React Router setup with protected routes
- ✅ Authentication system with JWT
- ✅ API service with axios interceptors
- ✅ Global state management with Context API
- ✅ Responsive design system

### Completed Components & Pages
- ✅ **Authentication Flow**: Login/Register pages with validation
- ✅ **Header**: Navigation with user menu
- ✅ **Dashboard**: Overview with stats and quick actions
- ✅ **Resumes List**: Display user's resumes
- ✅ **Loading States**: Spinner component
- ✅ **Error Handling**: Consistent error display

### API Integration
- ✅ **Auth endpoints**: Login, register, token refresh
- ✅ **Resume endpoints**: CRUD operations, customization, PDF download
- ✅ **Application endpoints**: Job application tracking
- ✅ **File upload**: Resume file handling

## 🔄 Next Steps - Priority Order

### 1. Resume Editor (High Priority)
Create `src/components/resume/ResumeEditor.jsx`:
- Markdown editor with CodeMirror
- Real-time preview
- Auto-save functionality
- File upload for existing resumes

### 2. Resume Customization (High Priority)
Enhance `ResumeEditorPage.jsx` for customization mode:
- Job description input
- AI-powered customization
- Compare original vs customized versions
- Save customized versions

### 3. Application Management (Medium Priority)
Complete `ApplicationsPage.jsx` and `ApplicationFormPage.jsx`:
- Application list with status tracking
- Add/edit application forms
- Link resumes to applications
- Status updates and notes

### 4. Resume Viewer (Medium Priority)
Complete `ResumeViewPage.jsx`:
- Formatted resume display
- PDF generation and download
- Version management
- Share/export options

### 5. Enhanced UI Components (Low Priority)
- Resume templates
- Drag & drop file upload
- Advanced filters and search
- Dark mode toggle

## 🏗️ Key Features to Implement

### Resume Editor Component
```jsx
// Example structure for ResumeEditor
import CodeMirror from '@uiw/react-codemirror';
import { markdown } from '@codemirror/lang-markdown';

export default function ResumeEditor({ resumeId, content, onSave }) {
  // Implementation needed
}
```

### Customization Flow
```jsx
// Example customization flow
const customizeResume = async (resumeId, jobDescription) => {
  const response = await apiService.customizeResume(resumeId, jobDescription);
  // Handle AI-customized content
};
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production  
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🌐 API Endpoints

The frontend integrates with these backend endpoints:

### Authentication
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- 
### Resumes
- `GET /api/v1/resumes` - List resumes
- `POST /api/v1/resumes/upload` - Upload resume
- `GET /api/v1/resumes/{id}` - Get resume
- `PUT /api/v1/resumes/{id}` - Update resume
- `POST /api/v1/resumes/{id}/customize` - AI customize
- `GET /api/v1/resumes/{id}/download` - Download PDF

### Applications
- `GET /api/v1/applications` - List applications
- `POST /api/v1/applications` - Create application
- `PUT /api/v1/applications/{id}` - Update application

## 🎨 Design System

The app uses a consistent design system built with Tailwind CSS:

### Colors
- Primary: Blue (`blue-600`, `blue-700`)
- Secondary: Gray (`gray-500`, `gray-600`)
- Success: Green (`green-600`)
- Warning: Yellow (`yellow-600`)
- Error: Red (`red-600`)

### Components
- Buttons: `.btn`, `.btn-primary`, `.btn-secondary`
- Forms: `.input`, `.textarea`
- Cards: `.card`, `.card-header`, `.card-content`
- Alerts: `.alert`, `.alert-error`, `.alert-success`

## 🔒 Authentication Flow

1. **Login/Register**: User credentials processed via API
2. **Token Storage**: JWT tokens stored in localStorage
3. **Route Protection**: Private routes require authentication
4. **Auto-refresh**: Tokens automatically refreshed when expired
5. **Logout**: Clears all stored tokens and user data

## 📱 Responsive Design

The application is fully responsive with breakpoints:
- Mobile: `sm:` (640px+)
- Tablet: `md:` (768px+)  
- Desktop: `lg:` (1024px+)
- Large: `xl:` (1280px+)

## 🐛 Known Issues & TODOs

- [ ] Complete resume editor implementation
- [ ] Add drag & drop file upload
- [ ] Implement PDF preview
- [ ] Add resume templates
- [ ] Create application status dashboard
- [ ] Add export/import functionality
- [ ] Implement real-time collaboration
- [ ] Add email notifications

## 🚀 Deployment

For production deployment:

1. **Build the project:**
   ```bash
   npm run build
   ```

2. **Deploy the `dist/` folder to your hosting service**

3. **Set environment variables:**
   ```bash
   VITE_API_URL=https://your-api-domain.com
   ```

---

**Status**: Frontend foundation complete ✅  
**Next Priority**: Resume Editor implementation 🔄
