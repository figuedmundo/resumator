import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import clsx from 'clsx';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import LoadingSpinner from '../components/common/LoadingSpinner';
import TemplateSelector from '../components/resume/TemplateSelector';
import PDFPreview from '../components/resume/PDFPreview';
import apiService from '../services/api';
import { formatDate, devLog } from '../utils/helpers';
import { STORAGE_KEYS } from '../utils/constants';
import styles from '../styles/modules/pages/ResumeViewPage.module.css';

export default function ResumeViewPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  // State management
  const [resume, setResume] = useState(null);
  const [versions, setVersions] = useState([]);
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState('modern');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('preview'); // 'preview', 'markdown', 'pdf'
  const [pdfLoading, setPdfLoading] = useState(false);

  useEffect(() => {
    if (id) {
      loadResume();
      loadVersions();
      loadSavedTemplate();
    }
  }, [id]);

  useEffect(() => {
    if (selectedTemplate) {
      localStorage.setItem(`${STORAGE_KEYS.THEME}_template`, selectedTemplate);
    }
  }, [selectedTemplate]);

  const loadSavedTemplate = () => {
    const savedTemplate = localStorage.getItem(`${STORAGE_KEYS.THEME}_template`);
    if (savedTemplate) {
      setSelectedTemplate(savedTemplate);
    }
  };

  const loadResume = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await apiService.getResume(id);
      setResume(response);
      devLog('Resume loaded:', response);
    } catch (err) {
      console.error('Failed to load resume:', err);
      setError(err.message || 'Failed to load resume');
    } finally {
      setIsLoading(false);
    }
  };

  const loadVersions = async () => {
    try {
      const response = await apiService.getResumeVersions(id);
      setVersions(response.versions || response || []);

      if (response.versions && response.versions.length > 0) {
        setSelectedVersion(response.versions[0]);
      }
      devLog('Versions loaded:', response.versions || response);
    } catch (err) {
      console.error('Failed to load versions:', err);
    }
  };

  const handleTemplateChange = (templateId) => {
    setSelectedTemplate(templateId);
    devLog('Template changed to:', templateId);
  };

  const handleVersionChange = (versionId) => {
    const version = versions.find((v) => v.id === parseInt(versionId));
    setSelectedVersion(version);
    devLog('Version changed to:', version);
  };

  const handlePDFLoadStart = () => setPdfLoading(true);
  const handlePDFLoadComplete = () => setPdfLoading(false);
  const handlePDFError = (error) => {
    setPdfLoading(false);
    devLog('PDF error:', error);
  };

  // Loading state
  if (isLoading && !resume) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingContent}>
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  // Error state
  if (error && !resume) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorAlert}>
          <div className={styles.errorContent}>
            <svg className={styles.errorIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className={styles.errorDetails}>
              <h3 className={styles.errorTitle}>Error Loading Resume</h3>
              <p className={styles.errorMessage}>{error}</p>
              <button
                onClick={() => navigate('/resumes')}
                className={styles.errorBackLink}
              >
                Back to Resumes →
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentContent = selectedVersion?.markdown_content || resume?.content || '';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <Link
                to="/resumes"
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-200"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Resumes
              </Link>

              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  {resume?.title || 'Resume'}
                </h1>
                <div className="flex items-center space-x-4 mt-1">
                  <p className="text-sm text-gray-500">
                    Updated {formatDate(resume?.updated_at, 'relative')}
                  </p>
                  {versions.length > 1 && (
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">Version:</span>
                      <select
                        value={selectedVersion?.id || ''}
                        onChange={(e) => handleVersionChange(e.target.value)}
                        className="text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      >
                        {versions.map((version) => (
                          <option key={version.id} value={version.id}>
                            {version.version} {version.is_original && '(Original)'}
                            {version.job_description && ' - Customized'}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {/* View Mode Toggle */}
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('preview')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                    viewMode === 'preview' ? 'bg-white text-gray-900 shadow' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Preview
                </button>
                <button
                  onClick={() => setViewMode('pdf')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                    viewMode === 'pdf' ? 'bg-white text-gray-900 shadow' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  PDF
                </button>
                <button
                  onClick={() => setViewMode('markdown')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                    viewMode === 'markdown' ? 'bg-white text-gray-900 shadow' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Source
                </button>
              </div>

              {/* Action Buttons */}
              <Link
                to={`/resumes/${id}/edit`}
                className={styles.editButton}
              >
                <svg className={styles.buttonIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit
              </Link>

              <Link
                to={`/resumes/${id}/customize`}
                className={styles.customizeButton}
              >
                <svg className={styles.buttonIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Customize
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={styles.mainContent}>
        {viewMode === 'preview' && (
          <div className={styles.previewGrid}>
            {/* Template Selector */}
            <div className={styles.templateColumn}>
              <TemplateSelector
                selectedTemplate={selectedTemplate}
                onTemplateChange={handleTemplateChange}
                className={styles.templateFit}
              />
            </div>

            {/* Content Preview */}
            <div className={styles.previewColumn}>
              <div className={styles.previewCard}>
                <div className={styles.previewHeader}>
                  <h3 className={styles.previewTitle}>Resume Preview</h3>
                  <p className={styles.previewSubtitle}>
                    Formatted preview using {selectedTemplate} template
                  </p>
                </div>
                <div className={styles.previewContent}>
                  <div className={styles.previewDocument}>
                    <div className={styles.previewProse}>
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {currentContent}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {viewMode === 'pdf' && (
          <div className={styles.pdfGrid}>
            {/* Template Selector */}
            <div className={styles.pdfTemplateColumn}>
              <TemplateSelector
                selectedTemplate={selectedTemplate}
                onTemplateChange={handleTemplateChange}
                className={styles.templateFit}
              />

              {/* PDF Loading Status */}
              {pdfLoading && (
                <div className={styles.pdfLoadingStatus}>
                  <div className={styles.pdfLoadingContent}>
                    <LoadingSpinner size="sm" className={styles.pdfLoadingSpinner} />
                    <span className={styles.pdfLoadingText}>Generating PDF...</span>
                  </div>
                </div>
              )}
            </div>

            {/* PDF Preview */}
            <div className={styles.pdfPreviewColumn}>
              <PDFPreview
                resumeId={parseInt(id)}
                versionId={selectedVersion?.id}
                template={selectedTemplate}
                onLoadStart={handlePDFLoadStart}
                onLoadComplete={handlePDFLoadComplete}
                onError={handlePDFError}
                className={styles.templateFit}
              />
            </div>
          </div>
        )}

        {viewMode === 'markdown' && (
          <div className={styles.markdownContainer}>
            <div className={styles.markdownCard}>
              <div className={styles.markdownHeader}>
                <div className={styles.markdownHeaderContent}>
                  <div className={styles.markdownHeaderInfo}>
                    <h3 className={styles.markdownTitle}>Markdown Source</h3>
                    <p className={styles.markdownSubtitle}>
                      Raw markdown content of your resume
                    </p>
                  </div>
                  <button
                    onClick={() => navigator.clipboard.writeText(currentContent)}
                    className={styles.copyButton}
                    title="Copy to clipboard"
                  >
                    <svg className={styles.copyIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copy
                  </button>
                </div>
              </div>
              <div className={styles.markdownContent}>
                <pre className={styles.markdownSource}>
                  {currentContent || 'No content available'}
                </pre>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
