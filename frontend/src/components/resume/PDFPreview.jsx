import { useState, useEffect, useRef } from 'react';
import LoadingSpinner from '../common/LoadingSpinner';
import apiService from '../../services/api';
import { devLog, downloadBlob } from '../../utils/helpers';

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
      
      devLog('PDF preview URL created for resume:', resumeId, 'template:', template);
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
      <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-gray-500 mt-2">No resume selected</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="text-sm font-medium text-gray-900">PDF Preview</span>
            <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded-full capitalize">
              {template} Template
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors duration-200 disabled:opacity-50"
              title="Refresh preview"
            >
              <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
            
            {/* Print Button */}
            <button
              onClick={handlePrint}
              disabled={loading || error || !pdfUrl}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors duration-200 disabled:opacity-50"
              title="Print resume"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
            </button>
            
            {/* Download Button */}
            <button
              onClick={handleDownload}
              disabled={loading || error || isDownloading}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {isDownloading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  <span>Downloading...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
      <div className="relative">
        {/* Loading State */}
        {loading && (
          <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center z-10">
            <div className="text-center">
              <LoadingSpinner size="lg" />
              <p className="text-gray-600 mt-4">Generating PDF preview...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="p-8">
            <div className="text-center">
              <svg className="mx-auto h-12 w-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Preview Error</h3>
              <p className="mt-2 text-gray-600">{error}</p>
              <div className="mt-6">
                <button
                  onClick={handleRefresh}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          <div className="bg-gray-100 p-4">
            <div className="bg-white shadow-lg mx-auto" style={{ width: 'fit-content' }}>
              <iframe
                ref={iframeRef}
                src={pdfUrl}
                className="w-full border-0"
                style={{ 
                  width: '800px', 
                  height: '1100px',
                  maxWidth: '100%'
                }}
                title="Resume PDF Preview"
                onLoad={() => devLog('PDF iframe loaded')}
                onError={() => setError('Failed to display PDF preview')}
              />
            </div>
            
            {/* Mobile Message */}
            <div className="mt-4 text-center text-sm text-gray-600 md:hidden">
              <p>For best viewing experience, use the download button to open the PDF in your device's PDF viewer.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PDFPreview;
