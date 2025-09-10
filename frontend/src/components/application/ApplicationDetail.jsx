import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
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
import LoadingSpinner from '../common/LoadingSpinner';
import ConfirmDialog from '../common/ConfirmDialog';
import apiService from '../../services/api';
import { APPLICATION_STATUS, SUCCESS_MESSAGES, ERROR_MESSAGES } from '../../utils/constants';
import { devLog, formatDate } from '../../utils/helpers';

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
      blue: 'bg-blue-100 text-blue-800 border-blue-200',
      yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      green: 'bg-green-100 text-green-800 border-green-200',
      red: 'bg-red-100 text-red-800 border-red-200',
      gray: 'bg-gray-100 text-gray-800 border-gray-200'
    };

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${colorClasses[statusOption.color]}`}>
        {statusOption.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
            {error || 'Application not found'}
          </div>
          <div className="mt-4">
            <Link
              to="/applications"
              className="text-blue-600 hover:text-blue-700"
            >
              ← Back to Applications
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              to="/applications"
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back to Applications
            </Link>
          </div>
          
          <div className="flex items-center space-x-3">
            <Link
              to={`/applications/${id}/edit`}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <PencilIcon className="h-4 w-4 mr-2" />
              Edit
            </Link>
            <button
              onClick={() => setShowDeleteDialog(true)}
              disabled={deleting}
              className="inline-flex items-center px-3 py-2 border border-red-300 shadow-sm text-sm leading-4 font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
            >
              {deleting ? (
                <LoadingSpinner size="sm" />
              ) : (
                <TrashIcon className="h-4 w-4 mr-2" />
              )}
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Application Details */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        {/* Header Section */}
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-4">
                <h1 className="text-2xl font-bold text-gray-900">
                  {application.position}
                </h1>
                {getStatusBadge(application.status)}
              </div>
              
              <div className="mt-2 flex items-center text-lg text-gray-600 space-x-4">
                <div className="flex items-center">
                  <BuildingOfficeIcon className="flex-shrink-0 mr-2 h-5 w-5" />
                  {application.company}
                </div>
                <div className="flex items-center">
                  <CalendarIcon className="flex-shrink-0 mr-2 h-5 w-5" />
                  Applied: {formatDate(application.applied_date)}
                </div>
              </div>
            </div>

            {/* Status Dropdown */}
            <div className="ml-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Update Status
              </label>
              <select
                value={application.status}
                onChange={(e) => handleStatusChange(e.target.value)}
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

        {/* Details Section */}
        <div className="px-4 py-5 sm:p-6">
          <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
            {/* Job Description */}
            {application.job_description && (
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500">Job Description</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  <div className="bg-gray-50 rounded-md p-4 max-h-64 overflow-y-auto">
                    <pre className="whitespace-pre-wrap font-sans">{application.job_description}</pre>
                  </div>
                </dd>
              </div>
            )}

            {/* Notes */}
            {application.notes && (
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500">Notes</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  <div className="bg-gray-50 rounded-md p-4">
                    <pre className="whitespace-pre-wrap font-sans">{application.notes}</pre>
                  </div>
                </dd>
              </div>
            )}

            {/* Resume Information */}
            <div>
              <dt className="text-sm font-medium text-gray-500">Resume Used</dt>
              <dd className="mt-1 text-sm text-gray-900">
                <div className="flex items-center space-x-2">
                  <DocumentTextIcon className="h-4 w-4 text-gray-400" />
                  <span>Resume ID: {application.resume_id}</span>
                  <Link
                    to={`/resumes/${application.resume_id}`}
                    className="text-blue-600 hover:text-blue-700"
                    title="View resume"
                  >
                    <EyeIcon className="h-4 w-4" />
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
        <div className="px-4 py-4 sm:px-6 bg-gray-50 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">
              Application #{application.id}
            </div>
            <div className="flex space-x-3">
              <Link
                to={`/applications/${id}/edit`}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <PencilIcon className="h-4 w-4 mr-2" />
                Edit Application
              </Link>
              <Link
                to={`/resumes/${application.resume_id}`}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <DocumentTextIcon className="h-4 w-4 mr-2" />
                View Resume
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
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
