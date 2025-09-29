import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import clsx from 'clsx';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import TemplateSelector from './components/TemplateSelector';
import VersionPicker from '../../components/Resumes/VersionPicker';
import apiService from '../../services/api';
import { formatDate, devLog, downloadBlob } from '@/utils/helpers';
import { STORAGE_KEYS } from '@/utils/constants';
import styles from './ResumeViewPage.module.css';

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
  const [viewMode, setViewMode] = useState('preview'); // 'preview', 'markdown'
  const [htmlContent, setHtmlContent] = useState('');
  const [htmlLoading, setHtmlLoading] = useState(false);
  const [isDownloadingPDF, setIsDownloadingPDF] = useState(false);
  const [iframeSrc, setIframeSrc] = useState('');
  const currentBlobRef = useRef(null);

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

  // Load HTML when resume data is available and in preview mode
  useEffect(() => {
    if (resume && viewMode === 'preview') {
      loadHtmlWithTemplate();
    }
  }, [resume, selectedVersion, viewMode]); // Removed selectedTemplate from dependencies to prevent double loading

  // Create iframe blob URL when htmlContent changes
  useEffect(() => {
    if (htmlContent) {
      // Clean up previous blob URL
      if (currentBlobRef.current) {
        URL.revokeObjectURL(currentBlobRef.current);
      }

      // Create new blob URL
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      setIframeSrc(url);
      currentBlobRef.current = url;
    }

    // Cleanup on unmount
    return () => {
      if (currentBlobRef.current) {
        URL.revokeObjectURL(currentBlobRef.current);
        currentBlobRef.current = null;
      }
    };
  }, [htmlContent]);

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

      // Set content from the latest version
      if (response.versions && response.versions.length > 0) {
        const latestVersion = response.versions[0]; // versions are sorted by creation date desc
        setResume(prev => ({ ...prev, content: latestVersion.markdown_content }));
      }

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

  const handleTemplateChange = async (templateId) => {
    if (templateId === selectedTemplate) return;

    devLog('Template changing from', selectedTemplate, 'to:', templateId);
    setSelectedTemplate(templateId);

    // Clear current HTML content and iframe src to show loading state
    setHtmlContent('');
    setIframeSrc('');

    // Force reload HTML with new template if in preview mode
    if (viewMode === 'preview' && resume) {
      await loadHtmlWithTemplate(templateId);
    }
  };

  const loadHtmlWithTemplate = async (templateId = selectedTemplate) => {
    try {
      setHtmlLoading(true);
      setError(null);
      
      const params = {
        template: templateId || 'modern'
      };
      
      if (selectedVersion?.id) {
        params.version_id = selectedVersion.id;
      }
      
      devLog('Fetching HTML with params:', params);
      const response = await apiService.getResumeHTML(id, params);
      
      if (response?.html) {
        setHtmlContent(response.html);
        devLog('HTML content loaded for template:', templateId);
      } else {
        console.warn('No HTML content in response:', response);
        setHtmlContent('');
      }
    } catch (error) {
      console.error('Failed to load HTML for template', templateId, ':', error);
      setError(`Failed to load preview for ${templateId} template`);
      setHtmlContent('');
    } finally {
      setHtmlLoading(false);
    }
  };

  const handleVersionChange = (versionId) => {
    const version = versions.find((v) => v.id === parseInt(versionId));
    setSelectedVersion(version);
    devLog('Version changed to:', version);
  };

const handleDownloadPDF = async () => {
    try {
      setIsDownloadingPDF(true);
      
      const params = {
        template: selectedTemplate || 'modern'
      };
      
      if (selectedVersion?.id) {
        params.version_id = selectedVersion.id;
      }

      const pdfBlob = await apiService.downloadResumePDF(id, params);
      
      // Generate filename
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `resume_${selectedTemplate}_${timestamp}.pdf`;
      
      // Download file
      downloadBlob(pdfBlob, filename);
      
      devLog('PDF downloaded:', filename);
      
    } catch (err) {
      console.error('Failed to download PDF:', err);
      setError('Failed to download PDF');
    } finally {
      setIsDownloadingPDF(false);
    }
  };

  const handlePrint = () => {
    if (htmlContent) {
      try {
        // Create a new window with the HTML content for printing
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Resume - ${resume?.title || 'Untitled'}</title>
              <style>
                body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
                @media print {
                  body { margin: 0; padding: 0; }
                }
              </style>
            </head>
            <body>
              ${htmlContent}
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        
        // Wait for content to load then print
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 1000);
        
        devLog('Print initiated');
      } catch (err) {
        console.error('Print failed:', err);
        setError('Failed to print resume');
      }
    }
  };

  const handleDeleteResume = async () => {
    try {
      setIsLoading(true);
      await apiService.deleteResume(id);
      setSuccessMessage('Resume deleted successfully!');
      setTimeout(() => navigate('/resumes'), 1500);
    } catch (err) {
      setError(getDetailedErrorMessage(err));
      setIsLoading(false);
    } finally {
      setShowDeleteConfirm(null);
    }
  };

  const handleDeleteVersion = async (versionId) => {
    try {
      await apiService.delete(`/resumes/${id}/versions/${versionId}`);
      setSuccessMessage('Version deleted successfully!');
      await loadVersions();
      
      // If the deleted version was being viewed, reset to original
      const remainingVersions = versions.filter(v => v.id !== versionId);
      if (remainingVersions.length > 0) {
        const originalVersion = remainingVersions.find(v => v.is_original) || remainingVersions[remainingVersions.length - 1];
        const originalVersionData = await apiService.getResumeVersion(id, originalVersion.id);
        setCustomizedContent(originalVersionData.markdown_content || '');
      }
    } catch (err) {
      setError(getDetailedErrorMessage(err));
    } finally {
      setShowDeleteConfirm(null);
    }
  };

  // Delete Confirmation Modal
  const DeleteConfirmModal = ({ show, type, onConfirm, onCancel }) => {
    if (!show) return null;

    const isResume = type === 'resume';
    const title = isResume ? 'Delete Resume' : 'Delete Version';
    const message = isResume 
      ? 'Are you sure you want to delete this entire resume? This action cannot be undone and will remove all versions.'
      : 'Are you sure you want to delete this version? This action cannot be undone.';

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
          <p className="text-sm text-gray-600 mb-6">{message}</p>
          <div className="flex space-x-3 justify-end">
            <button
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    );
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
    <div className={styles.pageContainer}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContainer}>
          <div className={styles.headerContent}>
            <div className={styles.headerLeft}>
              <Link
                to="/resumes"
                className={styles.backLink}
              >
                <svg className={styles.backIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Resumes
              </Link>

              <div className={styles.headerInfo}>
                <h1 className={styles.title}>
                  {resume?.title || 'Resume'}
                </h1>
                <div className={styles.metadata}>
                  <p className={styles.updatedText}>
                    Updated {formatDate(resume?.updated_at, 'relative')}
                  </p>
                </div>
              </div>
            </div>

            <div className={styles.headerRight}>
              {/* Version Picker */}
              {versions.length > 0 && (
                <VersionPicker
                  versions={versions}
                  selectedVersionId={selectedVersion?.id}
                  onVersionSelect={(version) => handleVersionChange(version.id)}
                  showCount={true}
                />
              )}

              {/* View Mode Toggle - Removed PDF */}
              <div className={styles.viewModeToggle}>
                <button
                  onClick={() => setViewMode('preview')}
                  className={clsx(
                    styles.viewModeButton,
                    viewMode === 'preview' ? styles.viewModeButtonActive : styles.viewModeButtonInactive
                  )}
                >
                  Preview
                </button>
                <button
                  onClick={() => setViewMode('markdown')}
                  className={clsx(
                    styles.viewModeButton,
                    viewMode === 'markdown' ? styles.viewModeButtonActive : styles.viewModeButtonInactive
                  )}
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
                  <div className={styles.previewHeaderContent}>
                    <div className={styles.previewHeaderLeft}>
                      <h3 className={styles.previewTitle}>Resume Preview</h3>
                      <p className={styles.previewSubtitle}>
                        Formatted preview using {selectedTemplate} template
                      </p>
                    </div>
                    <div className={styles.previewHeaderActions}>
                      {/* Print Button */}
                      <button
                        onClick={handlePrint}
                        disabled={htmlLoading || !htmlContent}
                        className={styles.previewActionButton}
                        title="Print resume"
                      >
                        <svg className={styles.previewActionIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                        </svg>
                      </button>
                      
                      {/* Download PDF Button */}
                      <button
                        onClick={handleDownloadPDF}
                        disabled={htmlLoading || isDownloadingPDF}
                        className={styles.previewDownloadButton}
                      >
                        {isDownloadingPDF ? (
                          <>
                            <LoadingSpinner size="sm" className="mr-2" />
                            <span>Downloading...</span>
                          </>
                        ) : (
                          <>
                            <svg className={styles.previewDownloadIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span>Download PDF</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
                <div className={styles.previewContent}>
                  {htmlLoading ? (
                    <div className={styles.previewLoading}>
                      <LoadingSpinner size="md" />
                      <span>Loading preview...</span>
                    </div>
                  ) : iframeSrc ? (
                    <div className={styles.previewDocument} key={selectedTemplate}>
                      <iframe
                        src={iframeSrc}
                        className={styles.previewIframe}
                        title="Resume Preview"
                        sandbox="allow-same-origin"
                      />
                    </div>
                  ) : (
                    <div className={styles.previewDocument}>
                      <div className={styles.previewProse}>
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {currentContent}
                        </ReactMarkdown>
                      </div>
                    </div>
                  )}
                </div>
              </div>
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

      {/* Delete Confirmation Modal */}
      {/* <DeleteConfirmModal
        show={!!showDeleteConfirm}
        type={showDeleteConfirm === 'resume' ? 'resume' : 'version'}
        onConfirm={() => {
          if (showDeleteConfirm === 'resume') {
            handleDeleteResume();
          } else {
            handleDeleteVersion(showDeleteConfirm);
          }
        }}
        onCancel={() => setShowDeleteConfirm(null)}
      /> */}

    </div>
  );
}
