import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import clsx from 'clsx';
import { 
  ArrowLeftIcon, 
  PencilIcon, 
  TrashIcon,
  BuildingOfficeIcon,
  CalendarIcon,
  DocumentTextIcon,
  EyeIcon,
  LinkIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import ConfirmDialog from '../Applications/components/ConfirmDialog';
import { StatusBadge, StatusSelect } from '../../components/Applications';
import { useApplications, useApplicationDeletion } from '../../hooks/applications';
import apiService from '../../services/api';
import { devLog, formatDate } from '../../utils/helpers';
import styles from './ApplicationDetailPage.module.css';

const ApplicationDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Custom hooks
  const { 
    loading: operationLoading, 
    error: operationError, 
    updateApplicationStatus, 
    deleteApplication, 
    clearError: clearOperationError 
  } = useApplications();

  const {
    applicationToDelete,
    confirmDeleteApplication,
    cancelDeletion,
    getDeleteDialogProps
  } = useApplicationDeletion();

  useEffect(() => {
    loadApplication();
  }, [id]);

  // Clear operation errors when they change
  useEffect(() => {
    if (operationError) {
      setError(operationError);
      const timer = setTimeout(clearOperationError, 5000);
      return () => clearTimeout(timer);
    }
  }, [operationError, clearOperationError]);

  const loadApplication = async () => {
    setLoading(true);
    setError('');
    
    try {
      const data = await apiService.getApplication(id);
      setApplication(data);
      devLog('Application loaded:', data);
    } catch (error) {
      console.error('Failed to load application:', error);
      setError('Failed to load application details');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    const success = await updateApplicationStatus(
      id, 
      newStatus, 
      (applicationId, status) => {
        setApplication(prev => ({ ...prev, status }));
      }
    );
  };

  const handleDeleteApplication = async () => {
    if (!applicationToDelete) return;

    const success = await deleteApplication(
      applicationToDelete.id,
      () => {
        navigate('/applications');
        cancelDeletion();
      }
    );
  };

  const handleDeleteClick = () => {
    if (application) {
      confirmDeleteApplication(application);
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorContent}>
          <div className={styles.errorAlert}>
            {error || 'Application not found'}
          </div>
          <div className={styles.errorBackLink}>
            <Link
              to="/applications"
              className={styles.backLinkText}
            >
              ← Back to Applications
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerTop}>
          <div className={styles.headerLeft}>
            <Link
              to="/applications"
              className={styles.backLink}
            >
              <ArrowLeftIcon className={styles.backIcon} />
              Back to Applications
            </Link>
          </div>
          
          <div className={styles.headerActions}>
            <Link
              to={`/applications/${id}/edit`}
              className={styles.editButton}
            >
              <PencilIcon className={styles.buttonIcon} />
              Edit
            </Link>
            <button
              onClick={handleDeleteClick}
              disabled={operationLoading}
              className={styles.deleteButton}
            >
              {operationLoading ? (
                <LoadingSpinner size="sm" />
              ) : (
                <TrashIcon className={styles.buttonIcon} />
              )}
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Application Details */}
      <div className={styles.detailsContainer}>
        {/* Header Section */}
        <div className={styles.detailsHeader}>
          <div className={styles.detailsHeaderContent}>
            <div className={styles.detailsHeaderLeft}>
              <div className={styles.detailsHeaderTitleRow}>
                <h1 className={styles.detailsTitle}>
                  {application.position}
                </h1>
                <StatusBadge status={application.status} />
              </div>
              
              <div className={styles.detailsSubtitle}>
                <div className={styles.detailsSubtitleItem}>
                  <BuildingOfficeIcon className={styles.detailsIcon} />
                  {application.company}
                </div>
                <div className={styles.detailsSubtitleItem}>
                  <CalendarIcon className={styles.detailsIcon} />
                  Applied: {formatDate(application.applied_date)}
                </div>
              </div>
            </div>

            {/* Status Dropdown */}
            <div className={styles.statusDropdownContainer}>
              <label className={styles.statusDropdownLabel}>
                Update Status
              </label>
              <StatusSelect
                value={application.status}
                onChange={handleStatusChange}
                disabled={operationLoading}
                className={styles.statusDropdown}
              />
            </div>
          </div>
        </div>

        {/* Details Section */}
        <div className={styles.detailsGrid}>
          <dl className={styles.detailsList}>
            {/* Job Description */}
            {application.job_description && (
              <div className={styles.detailItem}>
                <dt className={styles.detailLabel}>Job Description</dt>
                <dd className={styles.detailValue}>
                  <div className={styles.detailTextArea}>
                    <pre className={styles.detailPreformatted}>{application.job_description}</pre>
                  </div>
                </dd>
              </div>
            )}

            {/* Notes */}
            {application.notes && (
              <div className={styles.detailItem}>
                <dt className={styles.detailLabel}>Notes</dt>
                <dd className={styles.detailValue}>
                  <div className={styles.detailTextAreaSmall}>
                    <pre className={styles.detailPreformatted}>{application.notes}</pre>
                  </div>
                </dd>
              </div>
            )}

            {/* Resume Information */}
            <div className={styles.detailItemSingle}>
              <dt className={styles.detailLabel}>Resume Used</dt>
              <dd className={styles.detailValue}>
                <div className={styles.detailLinkRow}>
                  <DocumentTextIcon className={styles.detailLinkIcon} />
                  <span>Resume ID: {application.resume_id}</span>
                  <Link
                    to={`/resumes/${application.resume_id}`}
                    className={styles.detailLink}
                    title="View resume"
                  >
                    <EyeIcon className={styles.detailLinkIconButton} />
                  </Link>
                </div>
              </dd>
            </div>

            {/* Resume Version */}
            <div className={styles.detailItemSingle}>
              <dt className={styles.detailLabel}>Resume Version</dt>
              <dd className={styles.detailValue}>
                <div className={styles.detailLinkRow}>
                  <span>Version ID: {application.resume_version_id}</span>
                  <Link
                    to={`/resumes/${application.resume_id}/versions/${application.resume_version_id}`}
                    className={styles.detailLink}
                    title="View version"
                  >
                    <LinkIcon className={styles.detailLinkIconButton} />
                  </Link>
                </div>
              </dd>
            </div>

            {/* Created Date */}
            <div className={styles.detailItemSingle}>
              <dt className={styles.detailLabel}>Created</dt>
              <dd className={styles.detailValue}>
                {formatDate(application.created_at)}
              </dd>
            </div>

            {/* Last Updated */}
            <div className={styles.detailItemSingle}>
              <dt className={styles.detailLabel}>Last Updated</dt>
              <dd className={styles.detailValue}>
                {formatDate(application.updated_at)}
              </dd>
            </div>

            {/* Cover Letter */}
            {application.cover_letter_id && (
              <div className={styles.detailItem}>
                <dt className={styles.detailLabel}>Cover Letter</dt>
                <dd className={styles.detailValue}>
                  <div className={styles.detailLinkRow}>
                    <DocumentTextIcon className={styles.detailLinkIcon} />
                    <span>Cover Letter ID: {application.cover_letter_id}</span>
                    <Link
                      to={`/cover-letters/${application.cover_letter_id}`}
                      className={styles.detailLink}
                      title="View cover letter"
                    >
                      <EyeIcon className={styles.detailLinkIconButton} />
                    </Link>
                  </div>
                </dd>
              </div>
            )}
          </dl>
        </div>

        {/* Actions Section */}
        <div className={styles.actionsFooter}>
          <div className={styles.actionsContent}>
            <div className={styles.actionsId}>
              Application #{application.id}
            </div>
            <div className={styles.actionsButtons}>
              <Link
                to={`/applications/${id}/edit`}
                className={styles.actionButton}
              >
                <PencilIcon className={styles.actionButtonIcon} />
                Edit Application
              </Link>
              <Link
                to={`/resumes/${application.resume_id}`}
                className={styles.actionButton}
              >
                <DocumentTextIcon className={styles.actionButtonIcon} />
                View Resume
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className={styles.errorMessage}>
          {error}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        {...getDeleteDialogProps()}
        onConfirm={handleDeleteApplication}
        confirmLabel="Delete"
        confirmStyle="danger"
      />
    </div>
  );
};

export default ApplicationDetailPage;
