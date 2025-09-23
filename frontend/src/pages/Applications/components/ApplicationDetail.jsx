import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import clsx from 'clsx';
import { 
  ArrowLeftIcon, 
  PencilIcon, 
  TrashIcon,
  BuildingOfficeIcon,
  BriefcaseIcon,
  CalendarIcon,
  DocumentTextIcon,
  EyeIcon,
  LinkIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../../../components/LoadingSpinner/LoadingSpinner';
import ConfirmDialog from './ConfirmDialog';
import apiService from '../../../services/api';
import { APPLICATION_STATUS, SUCCESS_MESSAGES, ERROR_MESSAGES } from '../../../utils/constants';
import { devLog, formatDate } from '../../../utils/helpers';
import styles from './ApplicationDetail.module.css';

const ApplicationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const statusOptions = [
    { value: APPLICATION_STATUS.APPLIED, label: 'Applied', color: 'blue' },
    { value: APPLICATION_STATUS.INTERVIEWING, label: 'Interviewing', color: 'yellow' },
    { value: APPLICATION_STATUS.OFFER, label: 'Offer', color: 'green' },
    { value: APPLICATION_STATUS.REJECTED, label: 'Rejected', color: 'red' },
    { value: APPLICATION_STATUS.WITHDRAWN, label: 'Withdrawn', color: 'gray' }
  ];

  useEffect(() => {
    loadApplication();
  }, [id]);

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
    try {
      await apiService.updateApplication(id, { status: newStatus });
      setApplication(prev => ({ ...prev, status: newStatus }));
      devLog(`Application ${id} status updated to ${newStatus}`);
    } catch (error) {
      console.error('Failed to update status:', error);
      setError('Failed to update status');
    }
  };

  const handleDeleteApplication = async () => {
    setDeleting(true);
    setShowDeleteDialog(false);
    
    try {
      await apiService.deleteApplication(id);
      navigate('/applications');
      devLog(`Application ${id} deleted`);
    } catch (error) {
      console.error('Failed to delete application:', error);
      setError('Failed to delete application');
    } finally {
      setDeleting(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusOption = statusOptions.find(opt => opt.value === status);
    if (!statusOption) return null;

    const colorClasses = {
      blue: styles.statusBlue,
      yellow: styles.statusYellow,
      green: styles.statusGreen,
      red: styles.statusRed,
      gray: styles.statusGray
    };

    return (
      <span className={clsx(styles.statusBadge, colorClasses[statusOption.color])}>
        {statusOption.label}
      </span>
    );
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
              onClick={() => setShowDeleteDialog(true)}
              disabled={deleting}
              className={styles.deleteButton}
            >
              {deleting ? (
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
                {getStatusBadge(application.status)}
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
              <select
                value={application.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                className={styles.statusDropdown}
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
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
            <div>
              <dt className="text-sm font-medium text-gray-500">Resume Version</dt>
              <dd className="mt-1 text-sm text-gray-900">
                <div className="flex items-center space-x-2">
                  <span>Version ID: {application.resume_version_id}</span>
                  <Link
                    to={`/resumes/${application.resume_id}/versions/${application.resume_version_id}`}
                    className="text-blue-600 hover:text-blue-700"
                    title="View version"
                  >
                    <LinkIcon className="h-4 w-4" />
                  </Link>
                </div>
              </dd>
            </div>

            {/* Created Date */}
            <div>
              <dt className="text-sm font-medium text-gray-500">Created</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {formatDate(application.created_at)}
              </dd>
            </div>

            {/* Last Updated */}
            <div>
              <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {formatDate(application.updated_at)}
              </dd>
            </div>

            {/* Cover Letter */}
            {application.cover_letter_id && (
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500">Cover Letter</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  <div className="flex items-center space-x-2">
                    <DocumentTextIcon className="h-4 w-4 text-gray-400" />
                    <span>Cover Letter ID: {application.cover_letter_id}</span>
                    <Link
                      to={`/cover-letters/${application.cover_letter_id}`}
                      className="text-blue-600 hover:text-blue-700"
                      title="View cover letter"
                    >
                      <EyeIcon className="h-4 w-4" />
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
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDeleteApplication}
        title="Delete Application"
        message={`Are you sure you want to delete your application to ${application.company} for the ${application.position} position? This action cannot be undone.`}
        confirmLabel="Delete"
        confirmStyle="danger"
      />
    </div>
  );
};

export default ApplicationDetail;
