import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import ResumeCustomizer from './components/ResumeCustomizer';
import VersionComparison from '../../components/VersionComparison/VersionComparison';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import apiService from '../../services/api';
import { formatDate } from '@/utils/helpers';
import styles from './ResumeCustomizePage.module.css';

export default function ResumeCustomizePage() {
  const { id } = useParams();
  const navigate = useNavigate();

  // State management
  const [resume, setResume] = useState(null);
  const [originalContent, setOriginalContent] = useState('');
  const [customizedContent, setCustomizedContent] = useState('');
  const [versions, setVersions] = useState([]);
  const [currentJobDescription, setCurrentJobDescription] = useState('');
  const [customInstructions, setCustomInstructions] = useState('');
  
  const [isLoading, setIsLoading] = useState(true);
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  
  // UI state
  const [showVersions, setShowVersions] = useState(false);
  const [viewMode, setViewMode] = useState('customize'); // 'customize', 'compare', 'preview'

  // Keep track of last customization result for navigation
  const [lastCustomizationResult, setLastCustomizationResult] = useState(null);

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

  // Navigate to compare view after successful customization
  useEffect(() => {
    if (lastCustomizationResult) {
      setCustomizedContent(lastCustomizationResult.customized_markdown);
      setViewMode('compare');
      setSuccessMessage('Resume customized successfully! Reviewing customized version.');
      
      // Update resume state with new version info
      setResume(prev => ({
        ...prev,
        updated_at: new Date().toISOString()
      }));
      
      // Clear the result to prevent repeated navigation
      setLastCustomizationResult(null);
    }
  }, [lastCustomizationResult]);

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
      
      // Store form data in case of error
      setCurrentJobDescription(jobDescription);
      setCustomInstructions(options.custom_instructions || '');

      const response = await apiService.customizeResume(id, jobDescription, options);
      
      // Store result for processing in useEffect
      setLastCustomizationResult(response);
      
      // Reload versions to show the new one
      await loadVersions();
      
    } catch (err) {
      // Don't clear form data on error - keep jobDescription and options
      setError(err.message || 'Failed to customize resume. Please check your inputs and try again.');
    } finally {
      setIsCustomizing(false);
    }
  };

  const handleSaveAsApplication = async () => {
    try {
      setIsLoading(true);
      
      // First save the customized content as a new version
      const versionResponse = await apiService.updateResume(id, {
        title: resume.title,
        content: customizedContent
      });
      
      // Navigate to application form with pre-filled data
      const applicationData = {
        resume_id: parseInt(id),
        job_description: currentJobDescription,
      };
      
      // Store data in sessionStorage to pass to the form
      sessionStorage.setItem('applicationFormData', JSON.stringify(applicationData));
      
      navigate('/applications/new');
      
    } catch (err) {
      setError(err.message || 'Failed to save as application.');
      setIsLoading(false);
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
    setCustomInstructions('');
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
      <div className={styles.loadingContainer}>
        <div className={styles.loadingContent}>
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
    <div className={styles.pageContainer}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContainer}>
          <div className={styles.headerContent}>
            <div className={styles.headerLeft}>
              <button
                onClick={() => navigate(`/resumes/${id}`)}
                className={styles.backButton}
              >
                <svg className={styles.backIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Resume
              </button>
              
              <div className={styles.headerInfo}>
                <h1 className={styles.title}>
                  Customize: {resume?.title}
                </h1>
                <p className={styles.subtitle}>
                  Use AI to tailor your resume for specific job descriptions
                </p>
              </div>
            </div>

            <div className={styles.headerRight}>
              {/* View Mode Toggle */}
              <div className={styles.viewModeToggle}>
                <button
                  onClick={() => setViewMode('customize')}
                  className={clsx(
                    styles.viewModeButton,
                    viewMode === 'customize' ? styles.viewModeButtonActive : styles.viewModeButtonInactive
                  )}
                >
                  Customize
                </button>
                <button
                  onClick={() => setViewMode('compare')}
                  disabled={!hasChanges}
                  className={clsx(
                    styles.viewModeButton,
                    viewMode === 'compare' ? styles.viewModeButtonActive : styles.viewModeButtonInactive
                  )}
                >
                  Compare
                </button>
                <button
                  onClick={() => setViewMode('preview')}
                  disabled={!hasChanges}
                  className={clsx(
                    styles.viewModeButton,
                    viewMode === 'preview' ? styles.viewModeButtonActive : styles.viewModeButtonInactive
                  )}
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
                    className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200"
                  >
                    {isLoading ? (
                      <>
                        <LoadingSpinner size="sm" className="mr-2" />
                        Saving...
                      </>
                    ) : (
                      'Save as Version'
                    )}
                  </button>
                  <button
                    onClick={handleSaveAsApplication}
                    disabled={isLoading}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    {isLoading ? (
                      <>
                        <LoadingSpinner size="sm" className="mr-2" />
                        Saving...
                      </>
                    ) : (
                      'Save as Application'
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
        <div className={styles.messagesContainer}>
          <div className={styles.messagesContent}>
            {error && (
              <div className={styles.errorMessage}>
                <div className={styles.messageContent}>
                  <svg className={styles.messageIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className={styles.messageText}>
                    <p>{error}</p>
                  </div>
                  <button
                    onClick={() => setError(null)}
                    className={styles.messageClose}
                  >
                    <svg className={styles.messageCloseIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {successMessage && (
              <div className={styles.successMessage}>
                <div className={styles.messageContent}>
                  <svg className={styles.messageIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className={styles.messageText}>
                    <p>{successMessage}</p>
                  </div>
                  <button
                    onClick={() => setSuccessMessage('')}
                    className={styles.messageClose}
                  >
                    <svg className={styles.messageCloseIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
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
                  // Pass stored form data to preserve on errors
                  initialJobDescription={currentJobDescription}
                  initialCustomInstructions={customInstructions}
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
