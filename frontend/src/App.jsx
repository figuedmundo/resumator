import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import clsx from 'clsx';
import { useAuth } from './hooks/useAuth';
import Header from './components/common/Header';
import LoadingSpinner from './components/common/LoadingSpinner';
import styles from './styles/modules/layouts/App.module.css';

// Auth pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Main pages
import DashboardPage from './pages/DashboardPage';
import ResumesPage from './pages/ResumesPage';
import ResumeEditorPage from './pages/ResumeEditorPage';
import ResumeViewPage from './pages/ResumeViewPage';
import ResumeCustomizePage from './pages/ResumeCustomizePage';
import ApplicationsPage from './pages/ApplicationsPage';
import ApplicationFormPage from './pages/ApplicationFormPage';
import ProfilePage from './pages/ProfilePage';

// Application components
import ApplicationDetail from './components/application/ApplicationDetail';

// 404 page
import NotFoundPage from './pages/NotFoundPage';

// Protected Route component
function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className={styles.protectedRouteLoading}>
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login page with return url
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

// Public Route component (redirects to dashboard if already authenticated)
function PublicRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
}

// Layout component for protected pages
function AppLayout({ children }) {
  return (
    <div className={styles.appLayout}>
      <Header />
      <main className={styles.appLayoutMain}>
        {children}
      </main>
    </div>
  );
}

// Layout component for auth pages (no header)
function AuthLayout({ children }) {
  return (
    <div className={styles.authLayout}>
      {children}
    </div>
  );
}

function App() {
  const { isLoading } = useAuth();

  // Show loading spinner during initial auth check
  if (isLoading) {
    return (
      <div className={styles.initialLoadingContainer}>
        <div className={styles.loadingContent}>
          <LoadingSpinner size="lg" />
          <p className={styles.loadingText}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.app}>
      <Routes>
        {/* Public routes (auth pages) */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <AuthLayout>
                <LoginPage />
              </AuthLayout>
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <AuthLayout>
                <RegisterPage />
              </AuthLayout>
            </PublicRoute>
          }
        />

        {/* Protected routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AppLayout>
                <DashboardPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/resumes"
          element={
            <ProtectedRoute>
              <AppLayout>
                <ResumesPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/resumes/new"
          element={
            <ProtectedRoute>
              <AppLayout>
                <ResumeEditorPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/resumes/:id"
          element={
            <ProtectedRoute>
              <AppLayout>
                <ResumeViewPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/resumes/:id/edit"
          element={
            <ProtectedRoute>
              <AppLayout>
                <ResumeEditorPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/resumes/:id/customize"
          element={
            <ProtectedRoute>
              <AppLayout>
                <ResumeCustomizePage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/applications"
          element={
            <ProtectedRoute>
              <AppLayout>
                <ApplicationsPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/applications/new"
          element={
            <ProtectedRoute>
              <AppLayout>
                <ApplicationFormPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/applications/:id"
          element={
            <ProtectedRoute>
              <AppLayout>
                <ApplicationDetail />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/applications/:id/edit"
          element={
            <ProtectedRoute>
              <AppLayout>
                <ApplicationFormPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <AppLayout>
                <ProfilePage />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        {/* 404 page */}
        <Route
          path="*"
          element={
            <AuthLayout>
              <NotFoundPage />
            </AuthLayout>
          }
        />
      </Routes>
    </div>
  );
}

export default App;
