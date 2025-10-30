import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import clsx from 'clsx';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import VersionPicker from '../../components/Resumes/VersionPicker';
import apiService from '../../services/api';
import { formatDate, devLog, downloadBlob } from '@/utils/helpers';
import { STORAGE_KEYS } from '@/utils/constants';
import styles from './ResumeViewPage.module.css';
import PageLayout from '../../components/common/PageLayout';
import ResumePreview from './components/ResumePreview';
import ResumeSource from './components/ResumeSource';

export default function ResumeViewPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [resume, setResume] = useState(null);
  const [versions, setVersions] = useState([]);
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState('modern');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('preview');
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

  useEffect(() => {
    if (resume && viewMode === 'preview') {
      loadHtmlWithTemplate();
    }
  }, [resume, selectedVersion, viewMode]);

  useEffect(() => {
    if (htmlContent) {
      if (currentBlobRef.current) {
        URL.revokeObjectURL(currentBlobRef.current);
      }
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      setIframeSrc(url);
      currentBlobRef.current = url;
    }
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
      if (response.versions && response.versions.length > 0) {
        setResume(prev => ({ ...prev, content: response.versions[0].markdown_content }));
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
    setHtmlContent('');
    setIframeSrc('');
    if (viewMode === 'preview' && resume) {
      await loadHtmlWithTemplate(templateId);
    }
  };

  const loadHtmlWithTemplate = async (templateId = selectedTemplate) => {
    try {
      setHtmlLoading(true);
      setError(null);
      const params = { template: templateId || 'modern' };
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
      const params = { template: selectedTemplate || 'modern' };
      if (selectedVersion?.id) {
        params.version_id = selectedVersion.id;
      }
      const pdfBlob = await apiService.downloadResumePDF(id, params);
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `resume_${selectedTemplate}_${timestamp}.pdf`;
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
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Resume - ${resume?.title || 'Untitled'}</title>
              <style>
                body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
                @media print { body { margin: 0; padding: 0; } }
              </style>
            </head>
            <body>${htmlContent}</body>
          </html>
        `);
        printWindow.document.close();
        printWindow.focus();
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

  if (isLoading && !resume) {
    return (
      <PageLayout>
        <div className={styles.loadingContainer}>
          <LoadingSpinner size="lg" />
        </div>
      </PageLayout>
    );
  }

  if (error && !resume) {
    return (
      <PageLayout>
        <div className={styles.errorContainer}>
          <p>{error}</p>
        </div>
      </PageLayout>
    );
  }

  const currentContent = selectedVersion?.markdown_content || resume?.content || '';

  return (
    <PageLayout>
      <div className={styles.header}>
        <div className={styles.headerContainer}>
          <div className={styles.headerContent}>
            <div className={styles.headerLeft}>
              <Link to="/resumes" className={styles.backLink}>
                <svg className={styles.backIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                Back to Resumes
              </Link>
              <div className={styles.headerInfo}>
                <h1 className={styles.title}>{resume?.title || 'Resume'}</h1>
                <div className={styles.metadata}>
                  <p className={styles.updatedText}>Updated {formatDate(resume?.updated_at, 'relative')}</p>
                </div>
              </div>
            </div>
            <div className={styles.headerRight}>
              {versions.length > 0 && (
                <VersionPicker
                  versions={versions}
                  selectedVersionId={selectedVersion?.id}
                  onVersionSelect={(version) => handleVersionChange(version.id)}
                  showCount={true}
                />
              )}
              <div className={styles.viewModeToggle}>
                <button onClick={() => setViewMode('preview')} className={clsx(styles.viewModeButton, viewMode === 'preview' ? styles.viewModeButtonActive : styles.viewModeButtonInactive)}>Preview</button>
                <button onClick={() => setViewMode('markdown')} className={clsx(styles.viewModeButton, viewMode === 'markdown' ? styles.viewModeButtonActive : styles.viewModeButtonInactive)}>Source</button>
              </div>
              <button onClick={() => navigate(`/resumes/${id}/customize`, { state: { versionId: selectedVersion?.id } })} className={styles.editButton}>
                <svg className={styles.buttonIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
                Customize
              </button>
              <button onClick={() => navigate(`/resumes/${id}/edit`, { state: { versionId: selectedVersion?.id } })} className={styles.editButton}>
                <svg className={styles.buttonIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                Edit
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.mainContent}>
        {viewMode === 'preview' ? (
          <ResumePreview
            resume={resume}
            selectedTemplate={selectedTemplate}
            handleTemplateChange={handleTemplateChange}
            htmlLoading={htmlLoading}
            iframeSrc={iframeSrc}
            currentContent={currentContent}
            isDownloadingPDF={isDownloadingPDF}
            handleDownloadPDF={handleDownloadPDF}
            handlePrint={handlePrint}
          />
        ) : (
          <ResumeSource currentContent={currentContent} />
        )}
      </div>
    </PageLayout>
  );
}
