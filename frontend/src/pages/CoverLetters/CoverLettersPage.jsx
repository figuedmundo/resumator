import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import { DocumentTextIcon, SparklesIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import ConfirmDialog from '../Applications/components/ConfirmDialog';
import { CoverLetterList } from '../../components/CoverLetters';
import apiService from '../../services/api';
import PageLayout from '../../components/common/PageLayout';
import styles from './CoverLettersPage.module.css';

export default function CoverLettersPage() {
  const navigate = useNavigate();
  const [coverLetters, setCoverLetters] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    loadCoverLetters();
  }, []);

  const loadCoverLetters = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiService.getCoverLetters();
      setCoverLetters(response || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = (coverLetter) => {
    setDeleteConfirm(coverLetter);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) return;

    try {
      setIsDeleting(true);
      await apiService.deleteCoverLetter(deleteConfirm.id);
      
      // Remove from local state
      setCoverLetters(coverLetters.filter(cl => cl.id !== deleteConfirm.id));
      
      // Show success message
      setSuccessMessage(`Cover letter "${deleteConfirm.title}" deleted successfully`);
      setTimeout(() => setSuccessMessage(null), 3000);
      
      setDeleteConfirm(null);
    } catch (err) {
      console.error(err);
      let detail;
      try {
      if (err?.response?.data) {
        const data = err.response.data;
        detail = typeof data === 'string'
        ? data
        : data.detail ?? (Object.keys(data).length ? JSON.stringify(data) : undefined);
      }
      } catch (e) {
      // ignore parsing errors
      }
      const baseMsg = err?.message || 'Failed to delete cover letter';
      setError(detail ? `${baseMsg}: ${detail}` : baseMsg);
      setDeleteConfirm(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEdit = (coverLetterId) => {
    navigate(`/cover-letters/${coverLetterId}/edit`);
  };

  const handleSelect = (coverLetterId) => {
    navigate(`/cover-letters/${coverLetterId}`);
  };

  // Calculate stats
  const stats = {
    total: coverLetters.length,
    recent: coverLetters.filter(cl => {
      const date = new Date(cl.created_at);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return date > weekAgo;
    }).length,
    companies: new Set(coverLetters.map(cl => cl.company).filter(Boolean)).size,
  };

  if (isLoading) {
    return (
      <PageLayout>
        <div className={styles.loadingContainer}>
          <LoadingSpinner size="lg" />
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>My Cover Letters</h1>
          <p className={styles.subtitle}>
            Create, edit, and manage your cover letters for job applications.
          </p>
        </div>
        <div className={styles.headerActions}>
          <Link
            to="/cover-letters/generate"
            className={clsx(
              styles.generateButton,
              "hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors duration-200"
            )}
          >
            <svg className={styles.generateButtonIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Generate with AI
          </Link>
          <Link
            to="/cover-letters/new"
            className={clsx(
              styles.createButton,
              "hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
            )}
          >
            <svg className={styles.createButtonIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Cover Letter
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      {coverLetters.length > 0 && (
        <div className={styles.statsContainer}>
          <div className={clsx(styles.statCard, "hover:shadow-md transition-shadow duration-200")}>
            <div className={styles.statIconContainer}>
              <DocumentTextIcon className={styles.statIcon} />
            </div>
            <div className={styles.statContent}>
              <p className={styles.statLabel}>Total</p>
              <p className={styles.statValue}>{stats.total}</p>
            </div>
          </div>
          <div className={clsx(styles.statCard, "hover:shadow-md transition-shadow duration-200")}>
            <div className={styles.statIconContainer}>
              <SparklesIcon className={styles.statIcon} />
            </div>
            <div className={styles.statContent}>
              <p className={styles.statLabel}>This Week</p>
              <p className={styles.statValue}>{stats.recent}</p>
            </div>
          </div>
          <div className={clsx(styles.statCard, "hover:shadow-md transition-shadow duration-200")}>
            <div className={styles.statIconContainer}>
              <BuildingOfficeIcon className={styles.statIcon} />
            </div>
            <div className={styles.statContent}>
              <p className={styles.statLabel}>Companies</p>
              <p className={styles.statValue}>{stats.companies}</p>
            </div>
          </div>
        </div>
      )}

      {/* Success Message */}
      {successMessage && (
        <div className={styles.successAlert}>
          <div className={styles.successContent}>
            <svg className={styles.successIcon} viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <div className={styles.successText}>
              <p className={styles.successMessage}>{successMessage}</p>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
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

      {/* Cover Letters List */}
      {coverLetters.length === 0 && !isLoading && !error ? (
        <div className={styles.emptyState}>
          <DocumentTextIcon className={styles.emptyStateIcon} />
          <h3 className={styles.emptyStateTitle}>No cover letters yet</h3>
          <p className={styles.emptyStateDescription}>
            Start by creating a new cover letter or generating one with AI.
          </p>
          <div className={styles.emptyStateActions}>
            <Link
              to="/cover-letters/generate"
              className={clsx(
                styles.emptyStateButtonGenerate,
                "hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
              )}
            >
              <svg className={styles.emptyStateButtonIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Generate with AI
            </Link>
            <Link
              to="/cover-letters/new"
              className={clsx(
                styles.emptyStateButton,
                "hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
              )}
            >
              <svg className={styles.emptyStateButtonIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Cover Letter
            </Link>
          </div>
        </div>
      ) : (
        <CoverLetterList
          coverLetters={coverLetters}
          loading={isLoading}
          onSelectCoverLetter={handleSelect}
          onEdit={handleEdit}
          onDelete={handleDeleteClick}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Cover Letter"
        message={`Are you sure you want to delete the cover letter "${deleteConfirm?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        isLoading={isDeleting}
      />
    </PageLayout>
  );
}
