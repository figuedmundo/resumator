import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import {
  EyeIcon,
  PencilIcon,
  TrashIcon,
  BuildingOfficeIcon,
  CalendarIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';
import { StatusBadge, StatusSelect } from './';
import { formatDate } from '@/utils/helpers';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';
import styles from '../../pages/Applications/components/ApplicationList.module.css';

const ApplicationCard = ({
  application,
  onStatusChange,
  onDelete,
  onDownloadResume,
  onDownloadCoverLetter,
  operationLoading,
}) => {
  const navigate = useNavigate();

  return (
    <div className={clsx(styles.applicationItem, "hover:bg-gray-50")}>
      <div className={styles.applicationContent}>
        {/* Left Section - Main Info */}
        <div className={styles.applicationLeft}>
          <div className={styles.applicationTitleRow}>
            <h3 className={styles.applicationTitle}>
              {application.position}
            </h3>
            <StatusBadge status={application.status} />
          </div>
          
          <div className={styles.applicationMeta}>
            <div className={styles.metaItem}>
              <BuildingOfficeIcon className={styles.metaIcon} />
              {application.company}
            </div>
            <div className={styles.metaItem}>
              <CalendarIcon className={styles.metaIcon} />
              {formatDate(application.applied_date)}
            </div>
          </div>

          {application.notes && (
            <p className={styles.applicationNotes}>
              {application.notes}
            </p>
          )}
        </div>

        {/* Center Section - Status Control */}
        <div className={styles.applicationCenter}>
          <div className={styles.statusControl}>
            <span className={styles.statusLabel}>Status</span>
            <StatusSelect
              value={application.status}
              onChange={(newStatus) => onStatusChange(application.id, newStatus)}
              disabled={operationLoading}
              className={clsx(
                styles.statusSelectInline,
                "focus:ring-blue-500 focus:border-blue-500"
              )}
            />
          </div>
        </div>

        {/* Right Section - Actions */}
        <div className={styles.applicationRight}>
          <div className={styles.actionButtons}>
            <button
              onClick={() => onDownloadResume(application.id, application.company)}
              className={clsx(
                styles.actionButton,
                styles.actionButtonDownload,
                "hover:text-green-600"
              )}
              title="Download resume"
            >
              <ArrowDownTrayIcon className="h-4 w-4" />
              <span className={styles.actionButtonText}>Resume</span>
            </button>
            {application.cover_letter_version_id && (
              <button
                onClick={() => onDownloadCoverLetter(application.id, application.company)}
                className={clsx(
                  styles.actionButton,
                  styles.actionButtonDownloadCL,
                  "hover:text-green-600"
                )}
                title="Download cover letter"
              >
                <ArrowDownTrayIcon className="h-4 w-4" />
                <span className={styles.actionButtonText}>Cover Letter</span>
              </button>
            )}
            <button
              onClick={() => navigate(`/applications/${application.id}`)}
              className={clsx(
                styles.actionButton,
                styles.actionButtonView,
                "hover:text-gray-600"
              )}
              title="View details"
            >
              <EyeIcon className="h-4 w-4" />
            </button>
            <button
              onClick={() => navigate(`/applications/${application.id}/edit`)}
              className={clsx(
                styles.actionButton,
                styles.actionButtonEdit,
                "hover:text-blue-600"
              )}
              title="Edit application"
            >
              <PencilIcon className="h-4 w-4" />
            </button>
            <button
              onClick={() => onDelete(application)}
              disabled={operationLoading}
              className={clsx(
                styles.actionButton,
                styles.actionButtonDelete,
                "hover:text-red-600 disabled:opacity-50"
              )}
              title="Delete application"
            >
              {operationLoading ? (
                <LoadingSpinner size="sm" />
              ) : (
                <TrashIcon className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationCard;
