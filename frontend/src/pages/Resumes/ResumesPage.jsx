import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import clsx from 'clsx';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import apiService from '../../services/secureApi';
import styles from './ResumesPage.module.css';

export default function ResumesPage() {
  const [resumes, setResumes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadResumes();
  }, []);

  const loadResumes = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiService.getResumes();
      setResumes(response.resumes || response || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'active':
        return styles.statusActive;
      case 'draft':
        return styles.statusDraft;
      default:
        return styles.statusDefault;
    }
  };

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingContainer}>
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>My Resumes</h1>
          <p className={styles.subtitle}>
            Manage your resumes and create tailored versions for different job applications.
          </p>
        </div>
        <div className={styles.headerActions}>
          <Link
            to="/resumes/new"
            className={clsx(
              styles.createButton,
              "hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            )}
          >
            <svg className={styles.createButtonIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Resume
          </Link>
        </div>
      </div>

      {error && (
        <div className={styles.errorAlert}>
          <div className={styles.errorContent}>
            <svg className={styles.errorIcon} viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div className={styles.errorText}>
              <p className={styles.errorMessage}>{error}</p>
            </div>
          </div>
        </div>
      )}

      {resumes.length === 0 && !isLoading && !error ? (
        <div className={styles.emptyState}>
          <svg className={styles.emptyStateIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className={styles.emptyStateTitle}>No resumes</h3>
          <p className={styles.emptyStateDescription}>
            Get started by creating a new resume.
          </p>
          <div className={styles.emptyStateActions}>
            <Link
              to="/resumes/new"
              className={clsx(
                styles.emptyStateButton,
                "hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              )}
            >
              <svg className={styles.emptyStateButtonIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Resume
            </Link>
          </div>
        </div>
      ) : (
        <div className={styles.resumeGrid}>
          {resumes.map((resume) => (
            <div
              key={resume.id}
              className={clsx(styles.resumeCard, "hover:shadow-md")}
            >
              <div className={styles.resumeCardContent}>
                <div className={styles.resumeCardHeader}>
                  <h3 className={styles.resumeTitle}>
                    {resume.title || 'Untitled Resume'}
                  </h3>
                  <div className={styles.statusBadge}>
                    <span className={clsx(
                      styles.statusBadgeInner,
                      getStatusBadgeClass(resume.status)
                    )}>
                      {resume.status || 'Draft'}
                    </span>
                  </div>
                </div>
                <p className={styles.resumeDescription}>
                  {resume.description || 'No description available.'}
                </p>
                <div className={styles.resumeMeta}>
                  <svg className={styles.metaIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Updated {new Date(resume.updated_at).toLocaleDateString()}
                </div>
                <div className={styles.resumeMeta}>
                  <svg className={styles.metaIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17v4a2 2 0 002 2h4M13 13h4a2 2 0 012 2v4a2 2 0 01-2 2h-4m-6-6V9a2 2 0 012-2h2m0 0V5a2 2 0 012-2h4a2 2 0 012 2v2m0 0a2 2 0 01-2 2h-4a2 2 0 01-2-2V5z" />
                  </svg>
                  {resume.versions?.length || 1} version{(resume.versions?.length || 1) !== 1 ? 's' : ''}
                </div>
              </div>
              <div className={styles.resumeFooter}>
                <div className={styles.resumeActions}>
                  <Link
                    to={`/resumes/${resume.id}`}
                    className={clsx(
                      styles.actionLink,
                      styles.actionLinkView,
                      "hover:text-blue-500 transition-colors duration-200"
                    )}
                  >
                    View
                  </Link>
                  <Link
                    to={`/resumes/${resume.id}/edit`}
                    className={clsx(
                      styles.actionLink,
                      styles.actionLinkEdit,
                      "hover:text-gray-500 transition-colors duration-200"
                    )}
                  >
                    Edit
                  </Link>
                  <Link
                    to={`/resumes/${resume.id}/customize`}
                    className={clsx(
                      styles.actionLink,
                      styles.actionLinkCustomize,
                      "hover:text-green-500 transition-colors duration-200"
                    )}
                  >
                    Customize
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
