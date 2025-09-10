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
import LoadingSpinner from '../common/LoadingSpinner';
import ConfirmDialog from '../common/ConfirmDialog';
import apiService from '../../services/api';
import { APPLICATION_STATUS, SUCCESS_MESSAGES, ERROR_MESSAGES } from '../../utils/constants';
import { devLog, formatDate } from '../../utils/helpers';

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

  const getStatusBadge = (status) => {
    const statusOption = statusOptions.find(opt => opt.value === status);
    if (!statusOption) return null;

    const colorClasses = {
      blue: 'bg-blue-100 text-blue-800 border-blue-200',
      yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      green: 'bg-green-100 text-green-800 border-green-200',
      red: 'bg-red-100 text-red-800 border-red-200',
      gray: 'bg-gray-100 text-gray-800 border-gray-200'
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colorClasses[statusOption.color]}`}>
        {statusOption.label}
      </span>
    );
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  if (loading && applications.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Job Applications</h1>
          <p className="mt-1 text-sm text-gray-600">
            Track and manage your job applications
          </p>
        </div>
        <Link
          to="/applications/new"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <PlusIcon className="-ml-1 mr-2 h-4 w-4" />
          New Application
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DocumentTextIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total</dt>
                  <dd className="text-lg font-medium text-gray-900">{totalCount}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {statusOptions.slice(1).map((status) => (
          <div key={status.value} className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`w-3 h-3 rounded-full ${
                    status.color === 'blue' ? 'bg-blue-400' :
                    status.color === 'yellow' ? 'bg-yellow-400' :
                    status.color === 'green' ? 'bg-green-400' :
                    status.color === 'red' ? 'bg-red-400' :
                    'bg-gray-400'
                  }`} />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">{status.label}</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats[status.value] || 0}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters and Search */}
      <div className="bg-white shadow rounded-lg">
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search companies, positions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </form>

            {/* Status Filter */}
            <div className="flex items-center space-x-4">
              <FunnelIcon className="h-4 w-4 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
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
          <div className="p-4 bg-red-50 border-l-4 border-red-400">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Applications List */}
        <div className="overflow-hidden">
          {applications.length === 0 && !loading ? (
            <div className="text-center py-12">
              <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No applications</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchQuery || statusFilter 
                  ? 'No applications match your current filters.'
                  : 'Get started by creating your first job application.'
                }
              </p>
              {!searchQuery && !statusFilter && (
                <div className="mt-6">
                  <Link
                    to="/applications/new"
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <PlusIcon className="-ml-1 mr-2 h-4 w-4" />
                    New Application
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {applications.map((application) => (
                <div key={application.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <h3 className="text-lg font-medium text-gray-900">
                              {application.position}
                            </h3>
                            {getStatusBadge(application.status)}
                          </div>
                          
                          <div className="mt-2 flex items-center text-sm text-gray-500 space-x-4">
                            <div className="flex items-center">
                              <BuildingOfficeIcon className="flex-shrink-0 mr-1.5 h-4 w-4" />
                              {application.company}
                            </div>
                            <div className="flex items-center">
                              <CalendarIcon className="flex-shrink-0 mr-1.5 h-4 w-4" />
                              {formatDate(application.applied_date)}
                            </div>
                          </div>

                          {application.notes && (
                            <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                              {application.notes}
                            </p>
                          )}
                        </div>

                        <div className="ml-4 flex items-center space-x-2">
                          {/* Status Dropdown */}
                          <select
                            value={application.status}
                            onChange={(e) => handleStatusChange(application.id, e.target.value)}
                            className="text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          >
                            {statusOptions.slice(1).map(option => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>

                          {/* Actions */}
                          <div className="flex items-center space-x-1">
                            <button
                              onClick={() => navigate(`/applications/${application.id}`)}
                              className="p-1 text-gray-400 hover:text-gray-600"
                              title="View details"
                            >
                              <EyeIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => navigate(`/applications/${application.id}/edit`)}
                              className="p-1 text-gray-400 hover:text-blue-600"
                              title="Edit application"
                            >
                              <PencilIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => confirmDeleteApplication(application)}
                              disabled={deleting === application.id}
                              className="p-1 text-gray-400 hover:text-red-600 disabled:opacity-50"
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
          <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing{' '}
                    <span className="font-medium">{(currentPage - 1) * perPage + 1}</span>
                    {' '}to{' '}
                    <span className="font-medium">
                      {Math.min(currentPage * perPage, totalCount)}
                    </span>
                    {' '}of{' '}
                    <span className="font-medium">{totalCount}</span>
                    {' '}results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            currentPage === page
                              ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                    
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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
        confirmLabel="Delete"
        confirmStyle="danger"
      />
    </div>
  );
};

export default ApplicationList;
