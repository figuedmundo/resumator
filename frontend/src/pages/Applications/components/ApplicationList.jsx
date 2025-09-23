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
  BriefcaseIcon,
  CalendarIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import clsx from 'clsx';
import LoadingSpinner from '../../../components/LoadingSpinner/LoadingSpinner';
import ConfirmDialog from './ConfirmDialog';
import apiService from '../../../services/api';
import { APPLICATION_STATUS, SUCCESS_MESSAGES, ERROR_MESSAGES } from '../../../utils/constants';
import { devLog, formatDate } from '../../../utils/helpers';
import styles from './ApplicationList.module.css';

const ApplicationList = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [applicationToDelete, setApplicationToDelete] = useState(null);
  const [stats, setStats] = useState({});

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const perPage = 20;

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: APPLICATION_STATUS.APPLIED, label: 'Applied', color: 'blue' },
    { value: APPLICATION_STATUS.INTERVIEWING, label: 'Interviewing', color: 'yellow' },
    { value: APPLICATION_STATUS.OFFER, label: 'Offer', color: 'green' },
    { value: APPLICATION_STATUS.REJECTED, label: 'Rejected', color: 'red' },
    { value: APPLICATION_STATUS.WITHDRAWN, label: 'Withdrawn', color: 'gray' }
  ];

  useEffect(() => {
    loadApplications();
    loadStats();
  }, [currentPage, statusFilter]);

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
      for (const status of statusOptions.slice(1)) { // Skip 'All Statuses'
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
    try {
      await apiService.updateApplication(applicationId, { status: newStatus });
      
      // Update local state
      setApplications(prev => 
        prev.map(app => 
          app.id === applicationId 
            ? { ...app, status: newStatus }
            : app
        )
      );
      
      // Refresh stats
      loadStats();
      
      devLog(`Application ${applicationId} status updated to ${newStatus}`);
    } catch (error) {
      console.error('Failed to update status:', error);
      setError('Failed to update status');
    }
  };

  const confirmDeleteApplication = (application) => {
    setApplicationToDelete(application);
    setShowDeleteDialog(true);
  };

  const handleDeleteApplication = async () => {
    if (!applicationToDelete) return;

    setDeleting(applicationToDelete.id);
    setShowDeleteDialog(false);
    
    try {
      await apiService.deleteApplication(applicationToDelete.id);
      
      // Remove from local state
      setApplications(prev => prev.filter(app => app.id !== applicationToDelete.id));
      setTotalCount(prev => prev - 1);
      
      // Refresh stats
      loadStats();
      
      devLog(`Application ${applicationToDelete.id} deleted`);
    } catch (error) {
      console.error('Failed to delete application:', error);
      setError('Failed to delete application');
    } finally {
      setDeleting(null);
      setApplicationToDelete(null);
    }
  };

  const getStatusBadgeClass = (status) => {
    const statusOption = statusOptions.find(opt => opt.value === status);
    if (!statusOption) return styles.statusBadgeGray;

    const colorClasses = {
      blue: styles.statusBadgeBlue,
      yellow: styles.statusBadgeYellow,
      green: styles.statusBadgeGreen,
      red: styles.statusBadgeRed,
      gray: styles.statusBadgeGray
    };

    return colorClasses[statusOption.color];
  };

  const getStatusIndicatorClass = (color) => {
    const colorClasses = {
      blue: styles.statusIndicatorBlue,
      yellow: styles.statusIndicatorYellow,
      green: styles.statusIndicatorGreen,
      red: styles.statusIndicatorRed,
      gray: styles.statusIndicatorGray
    };
    return colorClasses[color];
  };

  const getStatusBadge = (status) => {
    const statusOption = statusOptions.find(opt => opt.value === status);
    if (!statusOption) return null;

    return (
      <span className={clsx(styles.statusBadge, getStatusBadgeClass(status))}>
        {statusOption.label}
      </span>
    );
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
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

        {statusOptions.slice(1).map((status) => (
          <div key={status.value} className={styles.statsCard}>
            <div className={styles.statsCardContent}>
              <div className={styles.statsCardInner}>
                <div className={styles.statsCardIcon}>
                  <div className={clsx(
                    styles.statusIndicator,
                    getStatusIndicatorClass(status.color)
                  )} />
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
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className={clsx(
                  styles.statusSelect,
                  "focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                )}
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
                    <div className={styles.applicationMain}>
                      <div className={styles.applicationHeader}>
                        <div className={styles.applicationInfo}>
                          <div className={styles.applicationTitleRow}>
                            <h3 className={styles.applicationTitle}>
                              {application.position}
                            </h3>
                            {getStatusBadge(application.status)}
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

                        <div className={styles.applicationActions}>
                          {/* Status Dropdown */}
                          <select
                            value={application.status}
                            onChange={(e) => handleStatusChange(application.id, e.target.value)}
                            className={clsx(
                              styles.statusSelect,
                              "focus:ring-blue-500 focus:border-blue-500"
                            )}
                          >
                            {statusOptions.slice(1).map(option => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>

                          {/* Actions */}
                          <div className={styles.actionButtons}>
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
                              disabled={deleting === application.id}
                              className={clsx(
                                styles.actionButton,
                                styles.actionButtonDelete,
                                "hover:text-red-600 disabled:opacity-50"
                              )}
                              title="Delete application"
                            >
                              {deleting === application.id ? (
                                <LoadingSpinner size="sm" />
                              ) : (
                                <TrashIcon className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </div>
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
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDeleteApplication}
        title="Delete Application"
        message={`Are you sure you want to delete your application to ${applicationToDelete?.company} for the ${applicationToDelete?.position} position? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
};

export default ApplicationList;
