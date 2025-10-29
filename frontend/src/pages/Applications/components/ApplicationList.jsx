import { Link } from 'react-router-dom';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  PlusIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';
import clsx from 'clsx';
import LoadingSpinner from '../../../components/LoadingSpinner/LoadingSpinner';
import ConfirmDialog from './ConfirmDialog';
import { StatusSelect, StatusIndicator, STATUS_CONFIG } from '../../../components/Applications';
import useApplicationList from '@/hooks/useApplicationList';
import { useApplications, useApplicationDeletion } from '@/hooks/applications';
import apiService from '../../../services/api';
import EmptyState from '../../../components/common/EmptyState';
import Pagination from '../../../components/common/Pagination';
import ApplicationCard from '../../../components/applications/ApplicationCard';
import styles from './ApplicationList.module.css';

const ApplicationList = () => {
  const {
    state,
    handlers,
  } = useApplicationList();

  const {
    applications,
    loading,
    error,
    searchQuery,
    statusFilter,
    stats,
    currentPage,
    totalPages,
    totalCount,
    perPage,
  } = state;

  const {
    setSearchQuery,
    setStatusFilter,
    handleSearch,
    handlePageChange,
    refresh,
    setApplications,
    setTotalCount,
  } = handlers;

  const { 
    loading: operationLoading, 
    error: operationError, 
    updateApplicationStatus, 
    deleteApplication, 
  } = useApplications();

  const {
    applicationToDelete,
    confirmDeleteApplication,
    cancelDeletion,
    getDeleteDialogProps
  } = useApplicationDeletion();

  const handleStatusChange = async (applicationId, newStatus) => {
    await updateApplicationStatus(applicationId, newStatus, () => refresh());
  };

  const handleDeleteApplication = async () => {
    if (!applicationToDelete) return;
    await deleteApplication(applicationToDelete.id, () => refresh());
    cancelDeletion();
  };

  const handleDownloadResume = async (applicationId, company) => {
    try {
      const response = await apiService.api.get(
        `/api/v1/applications/${applicationId}/resume/download`,
        { params: { template: 'modern' }, responseType: 'blob' }
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `resume_${company.replace(/\s+/g, '_')}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to download resume:', err);
    }
  };

  const handleDownloadCoverLetter = async (applicationId, company) => {
    try {
      const response = await apiService.api.get(
        `/api/v1/applications/${applicationId}/cover-letter/download`,
        { params: { template: 'modern' }, responseType: 'blob' }
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `cover_letter_${company.replace(/\s+/g, '_')}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to download cover letter:', err);
    }
  };

  if (loading && applications.length === 0) {
    return <div className={styles.loading}><LoadingSpinner size="lg" /></div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Job Applications</h1>
          <p className={styles.subtitle}>Track and manage your job applications</p>
        </div>
        <Link to="/applications/new" className={clsx(styles.newButton, "hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500")}>
          <PlusIcon className={styles.newButtonIcon} />
          New Application
        </Link>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statsCard}>
          <div className={styles.statsCardContent}>
            <div className={styles.statsCardInner}>
              <div className={styles.statsCardIcon}><DocumentTextIcon className={styles.statsCardIconDefault} /></div>
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
                <div className={styles.statsCardIcon}><StatusIndicator status={status.value} /></div>
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

      <div className={styles.filtersCard}>
        <div className={styles.filtersHeader}>
          <div className={styles.filtersContent}>
            <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }} className={styles.searchForm}>
              <div className={styles.searchContainer}>
                <MagnifyingGlassIcon className={styles.searchIcon} />
                <input type="text" placeholder="Search companies, positions..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className={clsx(styles.searchInput, "focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500")} />
              </div>
            </form>
            <div className={styles.filterControls}>
              <FunnelIcon className={styles.filterIcon} />
              <StatusSelect value={statusFilter} onChange={setStatusFilter} includeAllOption={true} className={clsx(styles.statusSelect, "focus:outline-none focus:ring-blue-500 focus:border-blue-500")} />
            </div>
          </div>
        </div>

        {(error || operationError) && <div className={styles.errorMessage}><p className={styles.errorText}>{error || operationError}</p></div>}

        <div className={styles.listContainer}>
          {applications.length === 0 && !loading ? (
            <EmptyState 
              icon={<DocumentTextIcon className={styles.emptyStateIcon} />}
              title="No applications"
              description={searchQuery || statusFilter ? 'No applications match your current filters.' : 'Get started by creating your first job application.'}
              actions={!searchQuery && !statusFilter && (
                <Link to="/applications/new" className={clsx(styles.emptyStateButton, "hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500")}>
                  <PlusIcon className={styles.emptyStateButtonIcon} />
                  New Application
                </Link>
              )}
            />
          ) : (
            <div className={styles.applicationsGrid}>
              {applications.map((application) => (
                <ApplicationCard 
                  key={application.id} 
                  application={application} 
                  onStatusChange={handleStatusChange} 
                  onDelete={confirmDeleteApplication} 
                  onDownloadResume={handleDownloadResume} 
                  onDownloadCoverLetter={handleDownloadCoverLetter} 
                  operationLoading={operationLoading} 
                />
              ))}
            </div>
          )}
        </div>

        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
      </div>

      <ConfirmDialog {...getDeleteDialogProps()} onConfirm={handleDeleteApplication} />
    </div>
  );
};

export default ApplicationList;
