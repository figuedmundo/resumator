import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import ResumeCustomizer from '../components/ai/ResumeCustomizer';
import VersionComparison from '../components/resume/VersionComparison';
import LoadingSpinner from '../components/common/LoadingSpinner';
import apiService from '../services/api';
import { formatDate } from '../utils/helpers';

export default function ResumeCustomizePage() {
  const { id } = useParams();
  const navigate = useNavigate();

  // State management
  const [resume, setResume] = useState(null);
  const [originalContent, setOriginalContent] = useState('');
  const [customizedContent, setCustomizedContent] = useState('');
  const [versions, setVersions] = useState([]);
  const [currentJobDescription, setCurrentJobDescription] = useState('');
  
  const [isLoading, setIsLoading] = useState(true);
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  
  // UI state
  const [showVersions, setShowVersions] = useState(false);
  const [viewMode, setViewMode] = useState('customize'); // 'customize', 'compare', 'preview'

  useEffect(() => {
    if (id) {
      loadResume();
      loadVersions();
    }
  }, [id]);

  // Auto-hide success message
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const loadResume = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await apiService.getResume(id);
      setResume(response);
      setOriginalContent(response.content || '');
      
      // If no customized content yet, use original
      if (!customizedContent) {
        setCustomizedContent(response.content || '');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const loadVersions = async () => {
    try {
      const response = await apiService.getResumeVersions(id);
      setVersions(response.versions || []);
    } catch (err) {
      console.error('Failed to load versions:', err);
    }
  };

  const handleCustomization = async ({ jobDescription, options }) => {
    try {
      setIsCustomizing(true);
      setError(null);
      setCurrentJobDescription(jobDescription);

      const response = await apiService.customizeResume(id, jobDescription, options);
      
      if (response.customized_resume) {
        setCustomizedContent(response.customized_resume.content);
        setSuccessMessage('Resume customized successfully! A new version has been created.');
        setViewMode('compare');
        
        // Reload versions to show the new one
        await loadVersions();
        
        // Update resume state with new content
        setResume(prev => ({
          ...prev,
          content: response.customized_resume.content,
          updated_at: response.customized_resume.updated_at
        }));
      }
    } catch (err) {
      setError(err.message || 'Failed to customize resume. Please try again.');
    } finally {
      setIsCustomizing(false);
    }
  };

  const handleSaveCustomization = async () => {
    try {
      setIsLoading(true);
      
      const response = await apiService.updateResume(id, {
        title: resume.title,
        content: customizedContent
      });
      
      setResume(response);
      setOriginalContent(customizedContent);
      setSuccessMessage('Customized resume saved successfully!');
      
      await loadVersions();
    } catch (err) {
      setError(err.message || 'Failed to save customized resume.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDiscardCustomization = () => {
    setCustomizedContent(originalContent);
    setViewMode('customize');
    setCurrentJobDescription('');
    setSuccessMessage('');
    setError(null);
  };

  const handleVersionRestore = async (version) => {
    try {
      setCustomizedContent(version.content);
      setViewMode('compare');
      setShowVersions(false);
      setSuccessMessage(`Restored to version from ${formatDate(version.created_at, 'relative')}`);
    } catch (err) {
      setError('Failed to restore version');
    }
  };

  const hasChanges = originalContent !== customizedContent;

  if (isLoading && !resume) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center min-h-96">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  if (error && !resume) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex">
            <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error Loading Resume</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
              <button
                onClick={() => navigate('/resumes')}
                className="mt-3 text-sm font-medium text-red-800 hover:text-red-900"
              >
                Back to Resumes →
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4 flex-shrink-0">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(`/resumes/${id}`)}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-200"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Resume
              </button>
              
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Customize: {resume?.title}
                </h1>
                <p className="text-sm text-gray-500">
                  Use AI to tailor your resume for specific job descriptions
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {/* View Mode Toggle */}
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('customize')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                    viewMode === 'customize' ? 'bg-white text-gray-900 shadow' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Customize
                </button>
                <button
                  onClick={() => setViewMode('compare')}
                  disabled={!hasChanges}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                    viewMode === 'compare' ? 'bg-white text-gray-900 shadow' : 'text-gray-600 hover:text-gray-900 disabled:opacity-50'
                  }`}
                >
                  Compare
                </button>
                <button
                  onClick={() => setViewMode('preview')}
                  disabled={!hasChanges}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                    viewMode === 'preview' ? 'bg-white text-gray-900 shadow' : 'text-gray-600 hover:text-gray-900 disabled:opacity-50'
                  }`}
                >
                  Preview
                </button>
              </div>

              {/* Version History */}
              {versions.length > 0 && (
                <button
                  onClick={() => setShowVersions(!showVersions)}
                  className="p-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
                  title="Version History"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
              )}

              {/* Action buttons for changed content */}
              {hasChanges && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleDiscardCustomization}
                    className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200"
                  >
                    Discard Changes
                  </button>
                  <button
                    onClick={handleSaveCustomization}
                    disabled={isLoading}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    {isLoading ? (
                      <>
                        <LoadingSpinner size="sm" className="mr-2" />
                        Saving...
                      </>
                    ) : (
                      'Save Customization'
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      {(error || successMessage) && (
        <div className="flex-shrink-0 px-4 py-3">
          <div className="max-w-7xl mx-auto">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-3">
                <div className="flex">
                  <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="ml-3">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                  <button
                    onClick={() => setError(null)}
                    className="ml-auto text-red-600 hover:text-red-800"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {successMessage && (
              <div className="bg-green-50 border border-green-200 rounded-md p-4">
                <div className="flex">
                  <svg className="h-5 w-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="ml-3">
                    <p className="text-sm text-green-800">{successMessage}</p>
                  </div>
                  <button
                    onClick={() => setSuccessMessage('')}
                    className="ml-auto text-green-600 hover:text-green-800"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
          <div className="flex h-full space-x-6 py-6">
            {/* Version History Sidebar */}
            {showVersions && (
              <div className="w-80 flex-shrink-0">
                <VersionComparison
                  versions={versions}
                  currentContent={customizedContent}
                  onVersionSelect={handleVersionRestore}
                  onClose={() => setShowVersions(false)}
                />
              </div>
            )}

            {/* Main Content Area */}
            <div className="flex-1 min-w-0">
              {viewMode === 'customize' && (
                <ResumeCustomizer
                  resume={resume}
                  onCustomizationComplete={handleCustomization}
                  onError={setError}
                  isLoading={isCustomizing}
                  className="h-full overflow-auto"
                />
              )}

              {viewMode === 'compare' && hasChanges && (
                <div className="h-full flex space-x-6">
                  {/* Original */}
                  <div className="flex-1 bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                      <h3 className="text-lg font-medium text-gray-900">Original Resume</h3>
                      <p className="text-sm text-gray-600">Your original resume content</p>
                    </div>
                    <div className="p-6 overflow-auto h-full">
                      <div className="prose prose-sm max-w-none">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {originalContent}
                        </ReactMarkdown>
                      </div>
                    </div>
                  </div>

                  {/* Customized */}
                  <div className="flex-1 bg-white border border-blue-200 rounded-lg overflow-hidden">
                    <div className="bg-blue-50 px-6 py-4 border-b border-blue-200">
                      <h3 className="text-lg font-medium text-blue-900">Customized Resume</h3>
                      <p className="text-sm text-blue-700">AI-tailored for the job description</p>
                      {currentJobDescription && (
                        <p className="text-xs text-blue-600 mt-1">
                          Based on {currentJobDescription.substring(0, 100)}...
                        </p>
                      )}
                    </div>
                    <div className="p-6 overflow-auto h-full">
                      <div className="prose prose-sm max-w-none">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {customizedContent}
                        </ReactMarkdown>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {viewMode === 'preview' && hasChanges && (
                <div className="h-full bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">Customized Resume Preview</h3>
                    <p className="text-sm text-gray-600">
                      Preview of your AI-customized resume
                    </p>
                  </div>
                  <div className="p-8 overflow-auto h-full">
                    <div className="max-w-4xl mx-auto">
                      <div className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-strong:text-gray-900 prose-ul:text-gray-700 prose-ol:text-gray-700">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {customizedContent}
                        </ReactMarkdown>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Empty state for compare/preview without changes */}
              {(viewMode === 'compare' || viewMode === 'preview') && !hasChanges && (
                <div className="h-full flex items-center justify-center bg-white border border-gray-200 rounded-lg">
                  <div className="text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="mt-4 text-sm font-medium text-gray-900">No Customization Yet</h3>
                    <p className="mt-2 text-sm text-gray-500">
                      Create a customized version to see the comparison or preview.
                    </p>
                    <button
                      onClick={() => setViewMode('customize')}
                      className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-blue-100 hover:bg-blue-200"
                    >
                      Start Customizing
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}