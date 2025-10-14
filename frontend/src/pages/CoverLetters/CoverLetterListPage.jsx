import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import ConfirmDialog from '../Applications/components/ConfirmDialog';
import apiService from '../../services/api';
import styles from './CoverLetterListPage.module.css';

export default function CoverLetterListPage() {
  const navigate = useNavigate();
  const [coverLetters, setCoverLetters] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTemplate, setFilterTemplate] = useState('all');
  const [templates, setTemplates] = useState([]);

  useEffect(() => {
    loadCoverLetters();
    loadTemplates();
  }, []);

  const loadCoverLetters = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiService.getCoverLetters();
      setCoverLetters(response.cover_letters || response || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const loadTemplates = async () => {
    try {
      const response = await apiService.getCoverLetterTemplates();
      setTemplates(response.templates || response || []);
    } catch (err) {
      console.error('Failed to load templates:', err);
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
      
      setCoverLetters(coverLetters.filter(cl => cl.id !== deleteConfirm.id));
      
      setSuccessMessage(`Cover letter "${deleteConfirm.title}" deleted successfully`);
      setTimeout(() => setSuccessMessage(null), 3000);
      
      setDeleteConfirm(null);
    } catch (err) {
      setError(err.message || 'Failed to delete cover letter');
      setDeleteConfirm(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'draft':
        return styles.statusDraft;
      case 'complete':
        return styles.statusComplete;
      default:
        return styles.statusDefault;
    }
  };

  // Filter and search
  const filteredLetters = coverLetters.filter(letter => {
    const matchesSearch = 
      !searchTerm || 
      letter.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      letter.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      letter.position?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTemplate = 
      filterTemplate === 'all' || 
      letter.template === filterTemplate;
    
    return matchesSearch && matchesTemplate;
  });

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
          <h1 className={styles.title}>My Cover Letters</h1>
          <p className={styles.subtitle}>
            Manage your cover letters and create tailored versions for different job applications.
          </p>
        </div>
        <div className={styles.headerActions}>
          <Link
            to="/cover-letters/new"
            className={clsx(
              styles.createButton,
              "hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            )}
          >
            <svg className={styles.createButtonIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Cover Letter
          </Link>
        </div>
      </div>

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

      {/* Search and Filter Bar */}
      {coverLetters.length > 0 && (
        <div className={styles.filterBar}>
          <div className={styles.searchBox}>
            <svg className={styles.searchIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search by title, company, or position..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          {templates.length > 0 && (
            <select
              value={filterTemplate}
              onChange={(e) => setFilterTemplate(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="all">All Templates</option>
              {templates.map(template => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </select>
          )}
        </div>
      )}

      {/* Empty State */}
      {filteredLetters.length === 0 && !isLoading && !error ? (
        <div className={styles.emptyState}>
          <svg className={styles.emptyStateIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className={styles.emptyStateTitle}>
            {searchTerm || filterTemplate !== 'all' ? 'No cover letters found' : 'No cover letters'}
          </h3>
          <p className={styles.emptyStateDescription}>
            {searchTerm || filterTemplate !== 'all' 
              ? 'Try adjusting your search or filter criteria.'
              : 'Get started by creating a new cover letter.'}
          </p>
          <div className={styles.emptyStateActions}>
            <Link
              to="/cover-letters/new"
              className={clsx(
                styles.emptyStateButton,
                "hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
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
        <div className={styles.letterGrid}>
          {filteredLetters.map((letter) => (
            <div
              key={letter.id}
              className={clsx(styles.letterCard, "hover:shadow-md")}
            >
              <div className={styles.letterCardContent}>
                <div className={styles.letterCardHeader}>
                  <h3 className={styles.letterTitle}>
                    {letter.title || 'Untitled Cover Letter'}
                  </h3>
                  <div className={styles.statusBadge}>
                    <span className={clsx(
                      styles.statusBadgeInner,
                      getStatusBadgeClass(letter.status)
                    )}>
                      {letter.status || 'Draft'}
                    </span>
                  </div>
                </div>

                <div className={styles.letterInfo}>
                  {letter.company && (
                    <div className={styles.infoItem}>
                      <svg className={styles.infoIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
                      </svg>
                      <span>{letter.company}</span>
                    </div>
                  )}
                  {letter.position && (
                    <div className={styles.infoItem}>
                      <svg className={styles.infoIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{letter.position}</span>
                    </div>
                  )}
                </div>

                <div className={styles.letterMeta}>
                  <svg className={styles.metaIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Updated {new Date(letter.updated_at).toLocaleDateString()}
                </div>

                {letter.versions && (
                  <div className={styles.letterMeta}>
                    <svg className={styles.metaIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17v4a2 2 0 002 2h4M13 13h4a2 2 0 012 2v4a2 2 0 01-2 2h-4m-6-6V9a2 2 0 012-2h2m0 0V5a2 2 0 012-2h4a2 2 0 012 2v2m0 0a2 2 0 01-2 2h-4a2 2 0 01-2-2V5z" />
                    </svg>
                    {letter.versions.length} version{letter.versions.length !== 1 ? 's' : ''}
                  </div>
                )}
              </div>

              <div className={styles.letterFooter}>
                <div className={styles.letterActions}>
                  <Link
                    to={`/cover-letters/${letter.id}`}
                    className={clsx(
                      styles.actionLink,
                      styles.actionLinkView,
                      "hover:text-blue-500 transition-colors duration-200"
                    )}
                  >
                    View
                  </Link>
                  <Link
                    to={`/cover-letters/${letter.id}/edit`}
                    className={clsx(
                      styles.actionLink,
                      styles.actionLinkEdit,
                      "hover:text-gray-500 transition-colors duration-200"
                    )}
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDeleteClick(letter)}
                    className={clsx(
                      styles.actionLink,
                      styles.actionLinkDelete,
                      "hover:text-red-500 transition-colors duration-200"
                    )}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Cover Letter"
        message={`Are you sure you want to delete "${deleteConfirm?.title}"? This will delete the cover letter and all its versions. Applications using this cover letter will not be affected, but will reference the deleted versions.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}