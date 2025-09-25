import { useState, useEffect, useRef } from 'react';
import clsx from 'clsx';
import LoadingSpinner from '../../../components/LoadingSpinner/LoadingSpinner';
import apiService from '../../../services/api';
import { devLog, downloadBlob } from '@/utils/helpers';
import styles from './PDFPreview.module.css';

const PDFPreview = ({ 
  resumeId, 
  versionId = null, 
  template = 'modern', 
  className = '',
  onLoadStart,
  onLoadComplete,
  onError 
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pdfUrl, setPdfUrl] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const iframeRef = useRef(null);

  useEffect(() => {
    if (resumeId) {
      loadPDFPreview();
    }
    
    // No need to cleanup URL for preview URLs
    return () => {};
  }, [resumeId, versionId, template]);

  const loadPDFPreview = async () => {
    try {
      setLoading(true);
      setError('');
      onLoadStart?.();
      
      const params = {
        template: template || 'modern'
      };
      
      if (versionId) {
        params.version_id = versionId;
      }

      // Get preview URL with authentication
      const previewUrl = apiService.getPreviewPDFUrl(resumeId, params);
      setPdfUrl(previewUrl);
      
      devLog('PDF preview URL created for VersionComparison:', resumeId, 'template:', template);
      onLoadComplete?.();
      
    } catch (err) {
      console.error('Failed to load PDF preview:', err);
      const errorMessage = err.message || 'Failed to load PDF preview';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      
      const params = {
        template: template || 'modern'
      };
      
      if (versionId) {
        params.version_id = versionId;
      }

      const pdfBlob = await apiService.downloadResumePDF(resumeId, params);
      
      // Generate filename
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `resume_${template}_${timestamp}.pdf`;
      
      // Download file
      downloadBlob(pdfBlob, filename);
      
      devLog('PDF downloaded:', filename);
      
    } catch (err) {
      console.error('Failed to download PDF:', err);
      setError('Failed to download PDF');
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePrint = () => {
    if (pdfUrl && iframeRef.current) {
      try {
        // Try to print the PDF directly
        iframeRef.current.contentWindow.print();
        devLog('Print initiated');
      } catch (err) {
        console.error('Print failed:', err);
        // Fallback: open PDF in new window for printing
        window.open(pdfUrl, '_blank');
      }
    }
  };

  const handleRefresh = () => {
    loadPDFPreview();
  };

  if (!resumeId) {
    return (
      <div className={clsx(styles.emptyState, className)}>
        <div className={styles.emptyStateContent}>
          <svg className={styles.emptyStateIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className={styles.emptyStateText}>No resume selected</p>
        </div>
      </div>
    );
  }

  return (
    <div className={clsx(styles.container, className)}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerLeft}>
            <svg className={styles.headerIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className={styles.headerTitle}>PDF Preview</span>
            <span className={styles.templateBadge}>
              {template} Template
            </span>
          </div>
          
          <div className={styles.headerActions}>
            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              disabled={loading}
              className={clsx(
                styles.actionButton,
                "hover:text-gray-900 hover:bg-gray-100",
                loading && styles.actionButtonDisabled
              )}
              title="Refresh preview"
            >
              <svg className={clsx(styles.actionIcon, loading && styles.actionIconSpin)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
            
            {/* Print Button */}
            <button
              onClick={handlePrint}
              disabled={loading || error || !pdfUrl}
              className={clsx(
                styles.actionButton,
                "hover:text-gray-900 hover:bg-gray-100",
                (loading || error || !pdfUrl) && styles.actionButtonDisabled
              )}
              title="Print resume"
            >
              <svg className={styles.actionIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
            </button>
            
            {/* Download Button */}
            <button
              onClick={handleDownload}
              disabled={loading || error || isDownloading}
              className={clsx(
                styles.downloadButton,
                "hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500",
                (loading || error || isDownloading) && styles.downloadButtonDisabled
              )}
            >
              {isDownloading ? (
                <>
                  <LoadingSpinner size="sm" className={styles.downloadSpinner} />
                  <span>Downloading...</span>
                </>
              ) : (
                <>
                  <svg className={styles.downloadIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>Download</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className={styles.content}>
        {/* Loading State */}
        {loading && (
          <div className={styles.loadingOverlay}>
            <div className={styles.loadingContent}>
              <LoadingSpinner size="lg" />
              <p className={styles.loadingText}>Generating PDF preview...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className={styles.errorState}>
            <div className={styles.errorContent}>
              <svg className={styles.errorIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className={styles.errorTitle}>Preview Error</h3>
              <p className={styles.errorMessage}>{error}</p>
              <div className={styles.errorActions}>
                <button
                  onClick={handleRefresh}
                  className={clsx(styles.retryButton, "hover:bg-blue-700")}
                >
                  <svg className={styles.retryIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Try Again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* PDF Preview */}
        {pdfUrl && !loading && !error && (
          <div className={styles.previewContainer}>
            <div className={styles.previewWrapper}>
              <iframe
                ref={iframeRef}
                src={pdfUrl}
                className={styles.previewIframe}
                title="Resume PDF Preview"
                onLoad={() => devLog('PDF iframe loaded')}
                onError={() => setError('Failed to display PDF preview')}
              />
            </div>
            
            {/* Mobile Message */}
            <div className={styles.mobileMessage}>
              <p>For best viewing experience, use the download button to open the PDF in your device's PDF viewer.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PDFPreview;
