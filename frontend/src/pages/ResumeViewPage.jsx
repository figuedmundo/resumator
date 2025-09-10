import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import LoadingSpinner from '../components/common/LoadingSpinner';
import TemplateSelector from '../components/resume/TemplateSelector';
import PDFPreview from '../components/resume/PDFPreview';
import apiService from '../services/api';
import { formatDate, devLog } from '../utils/helpers';
import { STORAGE_KEYS } from '../utils/constants';

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center min-h-96">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  // Error state
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
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit
              </Link>

              <Link
                to={`/resumes/${id}/customize`}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Customize
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {viewMode === 'preview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Template Selector */}
            <div className="lg:col-span-1">
              <TemplateSelector
                selectedTemplate={selectedTemplate}
                onTemplateChange={handleTemplateChange}
                className="h-fit"
              />
            </div>

            {/* Content Preview */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Resume Preview</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Formatted preview using {selectedTemplate} template
                  </p>
                </div>
                <div className="p-8 bg-gray-50">
                  <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-lg">
                    <div className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-strong:text-gray-900 prose-ul:text-gray-700 prose-ol:text-gray-700">
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
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
            {/* Template Selector */}
            <div className="xl:col-span-1">
              <TemplateSelector
                selectedTemplate={selectedTemplate}
                onTemplateChange={handleTemplateChange}
                className="h-fit"
              />

              {/* PDF Loading Status */}
              {pdfLoading && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center">
                    <LoadingSpinner size="sm" className="mr-2" />
                    <span className="text-sm text-blue-800">Generating PDF...</span>
                  </div>
                </div>
              )}
            </div>

            {/* PDF Preview */}
            <div className="xl:col-span-3">
              <PDFPreview
                resumeId={parseInt(id)}
                versionId={selectedVersion?.id}
                template={selectedTemplate}
                onLoadStart={handlePDFLoadStart}
                onLoadComplete={handlePDFLoadComplete}
                onError={handlePDFError}
                className="h-fit"
              />
            </div>
          </div>
        )}

        {viewMode === 'markdown' && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Markdown Source</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Raw markdown content of your resume
                    </p>
                  </div>
                  <button
                    onClick={() => navigator.clipboard.writeText(currentContent)}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    title="Copy to clipboard"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copy
                  </button>
                </div>
              </div>
              <div className="p-6">
                <pre className="whitespace-pre-wrap font-mono text-sm text-gray-800 bg-gray-50 p-4 rounded-lg border overflow-auto">
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
