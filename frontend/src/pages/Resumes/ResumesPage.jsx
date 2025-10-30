import { Link } from 'react-router-dom';
import clsx from 'clsx';
import { useResumes } from '../../hooks/useResumes';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import ConfirmDialog from '../Applications/components/ConfirmDialog';
import ResumeCard from '../../components/resumes/ResumeCard';
import EmptyState from '../../components/common/EmptyState';
import Alert from '../../components/common/Alert';
import PageLayout from '../../components/common/PageLayout';
import styles from './ResumesPage.module.css';

export default function ResumesPage() {
  const { state, handlers } = useResumes();
  const { resumes, isLoading, error, deleteConfirm, isDeleting, successMessage } = state;
  const { handleDeleteClick, handleDeleteConfirm, setDeleteConfirm } = handlers;

  if (isLoading) {
    return (
      <PageLayout>
        <div className={styles.loadingContainer}>
          <LoadingSpinner size="lg" />
        </div>
      </PageLayout>
    );
  }

  const renderEmptyState = () => (
    <EmptyState
      icon={
        <svg className={styles.emptyStateIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      }
      title="No resumes"
      description="Get started by creating a new resume."
      actions={
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
      }
    />
  );

  return (
    <PageLayout>
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

      <Alert variant="success" message={successMessage} />
      <Alert variant="error" message={error} />

      {resumes.length === 0 && !isLoading && !error ? (
        renderEmptyState()
      ) : (
        <div className={styles.resumeGrid}>
          {resumes.map((resume) => (
            <ResumeCard key={resume.id} resume={resume} onDeleteClick={handleDeleteClick} />
          ))}
        </div>
      )}

      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Resume"
        message={`Are you sure you want to delete "${deleteConfirm?.title}"? This will delete the resume and all its versions. Applications using this resume will not be affected, but will reference the deleted resume versions.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        isLoading={isDeleting}
      />
    </PageLayout>
  );
}
