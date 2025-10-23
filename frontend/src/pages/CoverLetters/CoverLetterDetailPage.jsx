import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  ArrowLeftIcon,
  PencilSquareIcon,
  ArrowDownTrayIcon,
  TrashIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ClockIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';
import apiService from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import ConfirmDialog from '../Applications/components/ConfirmDialog';
import { formatDate } from '@/utils/helpers';
import styles from './CoverLetterDetailPage.module.css';

export default function CoverLetterDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [coverLetter, setCoverLetter] = useState(null);
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  useEffect(() => {
    fetchCoverLetter();
  }, [id]);

  // Auto-hide success message
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const fetchCoverLetter = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await apiService.getCoverLetter(id);
      setCoverLetter(data);
      
      // Set the first version as selected by default
      if (data.versions && data.versions.length > 0) {
        setSelectedVersion(data.versions[0]);
      }
    } catch (err) {
      setError(err.message || 'Failed to load cover letter');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      setIsDeleting(true);
      await apiService.deleteCoverLetter(id);
      navigate('/cover-letters', { 
        state: { successMessage: `Cover letter "${coverLetter.title}" deleted successfully` }
      });
    } catch (err) {
      setError(err.message || 'Failed to delete cover letter');
      setDeleteConfirm(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      setError(null);
      const versionId = selectedVersion?.id || coverLetter.versions[0]?.id;
      
      if (!versionId) {
        setError('No version available to download');
        return;
      }

      // Call API to generate PDF
      const blob = await apiService.downloadCoverLetterPDF(id, versionId);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${coverLetter.title.replace(/[^a-z0-9]/gi, '_')}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      setSuccessMessage('PDF downloaded successfully!');
    } catch (err) {
      setError(err.message || 'Failed to download PDF');
    }
  };

  const handleVersionChange = (version) => {
    setSelectedVersion(version);
  };

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingContent}>
          <LoadingSpinner size="lg" />
          <p className={styles.loadingText}>Loading cover letter...</p>
        </div>
      </div>
    );
  }

  if (error && !coverLetter) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorAlert}>
          <div className={styles.errorContent}>
            <ExclamationCircleIcon className={styles.errorIcon} />
            <div className={styles.errorDetails}>
              <h3 className={styles.errorTitle}>Error Loading Cover Letter</h3>
              <p className={styles.errorMessage}>{error}</p>
              <button
                onClick={() => navigate('/cover-letters')}
                className={styles.errorBackLink}
              >
                Back to Cover Letters →
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!coverLetter) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorAlert}>
          <div className={styles.errorContent}>
            <DocumentTextIcon className={styles.errorIcon} />
            <div className={styles.errorDetails}>
              <h3 className={styles.errorTitle}>Cover Letter Not Found</h3>
              <p className={styles.errorMessage}>The requested cover letter could not be found.</p>
              <button
                onClick={() => navigate('/cover-letters')}
                className={styles.errorBackLink}
              >
                Back to Cover Letters →
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentContent = selectedVersion?.markdown_content || 
                        (coverLetter.versions.length > 0 ? coverLetter.versions[0].markdown_content : '');

  return (
    <div className={styles.pageContainer}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerLeft}>
            <button
              onClick={() => navigate('/cover-letters')}
              className={styles.backButton}
            >
              <ArrowLeftIcon className={styles.backIcon} />
              Back to Cover Letters
            </button>
          </div>

          <div className={styles.headerCenter}>
            <h1 className={styles.title}>{coverLetter.title}</h1>
            <div className={styles.metadata}>
              {coverLetter.company && (
                <span className={styles.metadataItem}>
                  <strong>Company:</strong> {coverLetter.company}
                </span>
              )}
              {coverLetter.position && (
                <span className={styles.metadataItem}>
                  <strong>Position:</strong> {coverLetter.position}
                </span>
              )}
              <span className={styles.metadataItem}>
                <ClockIcon className={styles.metadataIcon} />
                Updated {formatDate(coverLetter.updated_at, 'relative')}
              </span>
            </div>
          </div>

          <div className={styles.headerRight}>
            <button
              onClick={handleDownloadPDF}
              className={clsx(
                styles.actionButton,
                styles.downloadButton,
                "hover:bg-green-700 transition-colors duration-200"
              )}
              title="Download PDF"
            >
              <ArrowDownTrayIcon className={styles.actionButtonIcon} />
              <span className={styles.actionButtonText}>Download PDF</span>
            </button>
            
            <Link
              to={`/cover-letters/${id}/edit`}
              className={clsx(
                styles.actionButton,
                styles.editButton,
                "hover:bg-blue-700 transition-colors duration-200"
              )}
            >
              <PencilSquareIcon className={styles.actionButtonIcon} />
              <span className={styles.actionButtonText}>Edit</span>
            </Link>

            <button
              onClick={() => setDeleteConfirm(true)}
              className={clsx(
                styles.actionButton,
                styles.deleteButton,
                "hover:bg-red-700 transition-colors duration-200"
              )}
              title="Delete"
            >
              <TrashIcon className={styles.actionButtonIcon} />
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      {(error || successMessage) && (
        <div className={styles.messagesContainer}>
          {error && (
            <div className={styles.errorMessage}>
              <div className={styles.messageContent}>
                <ExclamationCircleIcon className={styles.messageIcon} />
                <div className={styles.messageText}>
                  <p>{error}</p>
                </div>
                <button
                  onClick={() => setError(null)}
                  className={styles.messageClose}
                >
                  <svg className={styles.messageCloseIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {successMessage && (
            <div className={styles.successMessage}>
              <div className={styles.messageContent}>
                <CheckCircleIcon className={styles.messageIcon} />
                <div className={styles.messageText}>
                  <p>{successMessage}</p>
                </div>
                <button
                  onClick={() => setSuccessMessage('')}
                  className={styles.messageClose}
                >
                  <svg className={styles.messageCloseIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Main Content */}
      <div className={styles.mainContent}>
        <div className={styles.contentWrapper}>
          
          {/* Version Selector (if multiple versions) */}
          {coverLetter.versions && coverLetter.versions.length > 1 && (
            <div className={styles.versionSelector}>
              <label className={styles.versionLabel}>
                <DocumentTextIcon className={styles.versionLabelIcon} />
                Version:
              </label>
              <select
                className={styles.versionSelect}
                value={selectedVersion?.id || ''}
                onChange={(e) => {
                  const version = coverLetter.versions.find(v => v.id === parseInt(e.target.value));
                  handleVersionChange(version);
                }}
              >
                {coverLetter.versions.map((version, index) => (
                  <option key={version.id} value={version.id}>
                    {version.version}
                    {version.is_original && ' (Original)'}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Content Card */}
          <div className={styles.contentCard}>
            {currentContent ? (
              <div className={styles.markdownContent}>
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  className={styles.markdown}
                >
                  {currentContent}
                </ReactMarkdown>
              </div>
            ) : (
              <div className={styles.emptyContent}>
                <DocumentTextIcon className={styles.emptyIcon} />
                <h3 className={styles.emptyTitle}>No Content</h3>
                <p className={styles.emptyText}>
                  This cover letter doesn't have any content yet.
                </p>
                <Link
                  to={`/cover-letters/${id}/edit`}
                  className={styles.emptyAction}
                >
                  Add Content
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirm}
        onClose={() => setDeleteConfirm(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Cover Letter"
        message={`Are you sure you want to delete "${coverLetter.title}"? This action cannot be undone and will delete all versions.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}
