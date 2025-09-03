import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from '../components/common/LoadingSpinner';
import apiService from '../services/api';

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalResumes: 0,
    totalApplications: 0,
    recentResumes: [],
    recentApplications: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch dashboard statistics
      const [resumesResponse, applicationsResponse] = await Promise.all([
        apiService.getResumes({ limit: 5 }),
        apiService.getApplications({ limit: 5 })
      ]);

      setStats({
        totalResumes: resumesResponse.total || resumesResponse.length,
        totalApplications: applicationsResponse.total || applicationsResponse.length,
        recentResumes: resumesResponse.resumes || resumesResponse.slice(0, 5),
        recentApplications: applicationsResponse.applications || applicationsResponse.slice(0, 5)
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center min-h-96">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.full_name?.split(' ')[0] || 'User'}!
        </h1>
        <p className="text-gray-600 mt-2">
          Here's an overview of your resume and application activity.
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-8 bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Resumes
                  </dt>
                  <dd className="text-3xl font-semibold text-gray-900">
                    {stats.totalResumes}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <Link 
                to="/resumes" 
                className="font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200"
              >
                View all resumes
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Applications
                  </dt>
                  <dd className="text-3xl font-semibold text-gray-900">
                    {stats.totalApplications}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <Link 
                to="/applications" 
                className="font-medium text-green-600 hover:text-green-500 transition-colors duration-200"
              >
                View all applications
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link
            to="/resumes/new"
            className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow duration-200 border border-gray-200"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-100 p-2 rounded-md">
                <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-900">Create New Resume</h3>
                <p className="text-sm text-gray-500">Upload or create a new resume</p>
              </div>
            </div>
          </Link>

          <Link
            to="/applications/new"
            className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow duration-200 border border-gray-200"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-100 p-2 rounded-md">
                <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-900">Track New Application</h3>
                <p className="text-sm text-gray-500">Add a new job application</p>
              </div>
            </div>
          </Link>

          <button
            onClick={() => window.location.reload()}
            className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow duration-200 border border-gray-200 text-left"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-gray-100 p-2 rounded-md">
                <svg className="h-5 w-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-900">Refresh Data</h3>
                <p className="text-sm text-gray-500">Update dashboard statistics</p>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Resumes */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Recent Resumes
            </h3>
            {stats.recentResumes.length > 0 ? (
              <div className="space-y-3">
                {stats.recentResumes.map((resume) => (
                  <div key={resume.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                    <div className="flex-1">
                      <Link 
                        to={`/resumes/${resume.id}`}
                        className="text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors duration-200"
                      >
                        {resume.title || 'Untitled Resume'}
                      </Link>
                      <p className="text-xs text-gray-500 mt-1">
                        Updated {new Date(resume.updated_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Link
                        to={`/resumes/${resume.id}/edit`}
                        className="text-xs text-blue-600 hover:text-blue-800 transition-colors duration-200"
                      >
                        Edit
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-sm text-gray-500 mt-2">No resumes yet</p>
                <Link 
                  to="/resumes/new" 
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium mt-1 inline-block"
                >
                  Create your first resume
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Recent Applications */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Recent Applications
            </h3>
            {stats.recentApplications.length > 0 ? (
              <div className="space-y-3">
                {stats.recentApplications.map((application) => (
                  <div key={application.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                    <div className="flex-1">
                      <Link 
                        to={`/applications/${application.id}`}
                        className="text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors duration-200"
                      >
                        {application.job_title || 'Untitled Position'}
                      </Link>
                      <p className="text-xs text-gray-500 mt-1">
                        {application.company_name} • {application.status || 'Draft'}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        application.status === 'Applied' ? 'bg-blue-100 text-blue-800' :
                        application.status === 'Interviewing' ? 'bg-yellow-100 text-yellow-800' :
                        application.status === 'Offer' ? 'bg-green-100 text-green-800' :
                        application.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {application.status || 'Draft'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                </svg>
                <p className="text-sm text-gray-500 mt-2">No applications yet</p>
                <Link 
                  to="/applications/new" 
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium mt-1 inline-block"
                >
                  Track your first application
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
