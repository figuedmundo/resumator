import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  MagnifyingGlassIcon, 
  FunnelIcon, 
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  BuildingOfficeIcon,
  CalendarIcon,
  DocumentTextIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';
import clsx from 'clsx';
import LoadingSpinner from '../../../components/LoadingSpinner/LoadingSpinner';
import ConfirmDialog from './ConfirmDialog';
import { StatusBadge, StatusSelect, StatusIndicator, STATUS_CONFIG } from '../../../components/Applications';
import { useApplications, useApplicationDeletion } from '@/hooks/applications';
import apiService from '../../../services/api';
import { devLog, formatDate } from '@/utils/helpers';
import styles from './ApplicationList.module.css';

const ApplicationList = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [stats, setStats] = useState({});

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const perPage = 20;

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
    loadApplications();
    loadStats();
  }, [currentPage, statusFilter]);

  // Clear operation errors when they change
  useEffect(() => {
    if (operationError) {
      setError(operationError);
      const timer = setTimeout(clearOperationError, 5000);
      return () => clearTimeout(timer);
    }
  }, [operationError, clearOperationError]);

  const loadApplications = async () => {
    setLoading(true);
    setError('');
    
    try {
      const params = {
        page: currentPage,
        per_page: perPage
      };
      
      if (statusFilter) {
        params.status = statusFilter;
      }

      const data = await apiService.getApplications(params);
      setApplications(data.applications || []);
      setTotalCount(data.total || 0);
      setTotalPages(Math.ceil((data.total || 0) / perPage));
      
      devLog('Applications loaded:', data);
    } catch (error) {
      console.error('Failed to load applications:', error);
      setError('Failed to load applications');
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const statusCounts = {};
      
      // Load counts for each status
      for (const status of STATUS_CONFIG) {
        try {
          const data = await apiService.getApplications({ 
            status: status.value, 
            page: 1, 
            per_page: 1 
          });
          statusCounts[status.value] = data.total || 0;
        } catch (e) {
          statusCounts[status.value] = 0;
        }
      }
      
      setStats(statusCounts);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      loadApplications();
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const data = await apiService.getApplications({
        page: 1,
        per_page: perPage,
        search: searchQuery.trim()
      });
      
      setApplications(data.applications || []);
      setTotalCount(data.total || 0);
      setTotalPages(Math.ceil((data.total || 0) / perPage));
      setCurrentPage(1);
    } catch (error) {
      console.error('Search failed:', error);
      setError('Search failed');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (applicationId, newStatus) => {
    const success = await updateApplicationStatus(
      applicationId, 
      newStatus, 
      (id, status) => {
        // Update local state
        setApplications(prev => 
          prev.map(app => 
            app.id === id 
              ? { ...app, status }
              : app
          )
        );
        // Refresh stats
        loadStats();
      }
    );
  };

  const handleDeleteApplication = async () => {
    if (!applicationToDelete) return;

    const success = await deleteApplication(
      applicationToDelete.id,
      (deletedId) => {
        // Remove from local state
        setApplications(prev => prev.filter(app => app.id !== deletedId));
        setTotalCount(prev => prev - 1);
        // Refresh stats
        loadStats();
        cancelDeletion();
      }
    );
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleDownloadResume = async (applicationId, company) => {
    try {
      const response = await apiService.api.get(
        `/api/v1/applications/${applicationId}/resume/download`,
        {
          params: { template: 'modern' },
          responseType: 'blob'
        }
      );
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `resume_${company.replace(/\s+/g, '_')}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download resume:', error);
      setError('Failed to download resume');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleDownloadCoverLetter = async (applicationId, company) => {
    try {
      const response = await apiService.api.get(
        `/api/v1/applications/${applicationId}/cover-letter/download`,
        {
          params: { template: 'modern' },
          responseType: 'blob'
        }
      );
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `cover_letter_${company.replace(/\s+/g, '_')}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download cover letter:', error);
      setError('Failed to download cover letter');
      setTimeout(() => setError(''), 3000);
    }
  };

  if (loading && applications.length === 0) {
    return (
      <div className={styles.loading}>
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header with Stats */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Job Applications</h1>
          <p className={styles.subtitle}>
            Track and manage your job applications
          </p>
        </div>
        <Link
          to="/applications/new"
          className={clsx(
            styles.newButton,
            "hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          )}
        >
          <PlusIcon className={styles.newButtonIcon} />
          New Application
        </Link>
      </div>

      {/* Stats Cards */}
      <div className={styles.statsGrid}>
        <div className={styles.statsCard}>
          <div className={styles.statsCardContent}>
            <div className={styles.statsCardInner}>
              <div className={styles.statsCardIcon}>
                <DocumentTextIcon className={styles.statsCardIconDefault} />
              </div>
              <div className={styles.statsCardData}>
                <dl>
                  <dt className={styles.statsCardLabel}>Total</dt>
                  <dd className={styles.statsCardValue}>{totalCount}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {STATUS_CONFIG.map((status) => (
          <div key={status.value} className={styles.statsCard}>
            <div className={styles.statsCardContent}>
              <div className={styles.statsCardInner}>
                <div className={styles.statsCardIcon}>
                  <StatusIndicator status={status.value} />
                </div>
                <div className={styles.statsCardData}>
                  <dl>
                    <dt className={styles.statsCardLabel}>{status.label}</dt>
                    <dd className={styles.statsCardValue}>{stats[status.value] || 0}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters and Search */}
      <div className={styles.filtersCard}>
        <div className={styles.filtersHeader}>
          <div className={styles.filtersContent}>
            {/* Search */}
            <form onSubmit={handleSearch} className={styles.searchForm}>
              <div className={styles.searchContainer}>
                <MagnifyingGlassIcon className={styles.searchIcon} />
                <input
                  type="text"
                  placeholder="Search companies, positions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={clsx(
                    styles.searchInput,
                    "focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  )}
                />
              </div>
            </form>

            {/* Status Filter */}
            <div className={styles.filterControls}>
              <FunnelIcon className={styles.filterIcon} />
              <StatusSelect
                value={statusFilter}
                onChange={setStatusFilter}
                includeAllOption={true}
                className={clsx(
                  styles.statusSelect,
                  "focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                )}
              />
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className={styles.errorMessage}>
            <p className={styles.errorText}>{error}</p>
          </div>
        )}

        {/* Applications List */}
        <div className={styles.listContainer}>
          {applications.length === 0 && !loading ? (
            <div className={styles.emptyState}>
              <DocumentTextIcon className={styles.emptyStateIcon} />
              <h3 className={styles.emptyStateTitle}>No applications</h3>
              <p className={styles.emptyStateDescription}>
                {searchQuery || statusFilter 
                  ? 'No applications match your current filters.'
                  : 'Get started by creating your first job application.'
                }
              </p>
              {!searchQuery && !statusFilter && (
                <div className={styles.emptyStateActions}>
                  <Link
                    to="/applications/new"
                    className={clsx(
                      styles.emptyStateButton,
                      "hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    )}
                  >
                    <PlusIcon className={styles.emptyStateButtonIcon} />
                    New Application
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className={styles.applicationsGrid}>
              {applications.map((application) => (
                <div
                  key={application.id}
                  className={clsx(styles.applicationItem, "hover:bg-gray-50")}
                >
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
                          onChange={(newStatus) => handleStatusChange(application.id, newStatus)}
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
                          onClick={() => handleDownloadResume(application.id, application.company)}
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
                            onClick={() => handleDownloadCoverLetter(application.id, application.company)}
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
                          onClick={() => confirmDeleteApplication(application)}
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
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className={styles.pagination}>
            <div className={styles.paginationContent}>
              <div className={styles.paginationMobile}>
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={clsx(
                    styles.paginationButton,
                    "hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  )}
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={clsx(
                    styles.paginationButtonNext,
                    "hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  )}
                >
                  Next
                </button>
              </div>
              <div className={styles.paginationDesktop}>
                <div className={styles.paginationInfo}>
                  <p className={styles.paginationInfoText}>
                    Showing{' '}
                    <span className={styles.paginationInfoNumber}>{(currentPage - 1) * perPage + 1}</span>
                    {' '}to{' '}
                    <span className={styles.paginationInfoNumber}>
                      {Math.min(currentPage * perPage, totalCount)}
                    </span>
                    {' '}of{' '}
                    <span className={styles.paginationInfoNumber}>{totalCount}</span>
                    {' '}results
                  </p>
                </div>
                <div>
                  <nav className={styles.paginationNav}>
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={clsx(
                        styles.paginationNavButton,
                        styles.paginationNavButtonFirst,
                        "hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      )}
                    >
                      Previous
                    </button>
                    
                    {/* Page numbers */}
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const page = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={clsx(
                            styles.pageNumber,
                            currentPage === page 
                              ? clsx(styles.pageNumberActive, "hover:bg-blue-100")
                              : clsx(styles.pageNumberInactive, "hover:bg-gray-50")
                          )}
                        >
                          {page}
                        </button>
                      );
                    })}
                    
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className={clsx(
                        styles.paginationNavButton,
                        styles.paginationNavButtonLast,
                        "hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      )}
                    >
                      Next
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        {...getDeleteDialogProps()}
        onConfirm={handleDeleteApplication}
      />
    </div>
  );
};

export default ApplicationList;
