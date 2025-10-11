import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import clsx from 'clsx';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import { CoverLetterEditor, CoverLetterPreview } from '../../components/CoverLetters';
import apiService from '../../services/api';
import { AUTO_SAVE_DELAY } from '../../utils/constants';
import styles from './CoverLetterEditorPage.module.css';

export default function CoverLetterEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // State management
  const [coverLetter, setCoverLetter] = useState(null);
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [position, setPosition] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState('saved'); // 'saved', 'saving', 'unsaved', 'error'
  const [error, setError] = useState(null);
  
  // View and UI options
  const [viewMode, setViewMode] = useState('edit'); // 'edit', 'preview', 'split'
  const [isDownloading, setIsDownloading] = useState(false);
  
  // Auto-save
  const [saveTimeout, setSaveTimeout] = useState(null);
  const [lastSavedContent, setLastSavedContent] = useState('');
  const [lastSavedTitle, setLastSavedTitle] = useState('');
  const [lastSavedCompany, setLastSavedCompany] = useState('');
  const [lastSavedPosition, setLastSavedPosition] = useState('');

  // Initialize editor
  useEffect(() => {
    if (id && id !== 'new') {
      loadCoverLetter();
    } else {
      setIsLoading(false);
      setContent(getDefaultTemplate());
      setTitle('Untitled Cover Letter');
      setLastSavedContent('');
      setLastSavedTitle('');
    }
  }, [id]);

  // Auto-save when content changes
  useEffect(() => {
    if (!isLoading && (
      content !== lastSavedContent || 
      title !== lastSavedTitle || 
      company !== lastSavedCompany ||
      position !== lastSavedPosition
    )) {
      setSaveStatus('unsaved');
      
      if (saveTimeout) {
        clearTimeout(saveTimeout);
      }

      const timeout = setTimeout(() => {
        handleAutoSave();
      }, AUTO_SAVE_DELAY);

      setSaveTimeout(timeout);
    }

    return () => {
      if (saveTimeout) {
        clearTimeout(saveTimeout);
      }
    };
  }, [content, title, company, position, isLoading, lastSavedContent, lastSavedTitle, lastSavedCompany, lastSavedPosition]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl+S or Cmd+S to save
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleManualSave();
      }
      
      // Ctrl+P or Cmd+P for preview toggle
      if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault();
        setViewMode(prev => {
          if (prev === 'edit') return 'preview';
          if (prev === 'preview') return 'split';
          return 'edit';
        });
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const loadCoverLetter = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiService.getCoverLetter(id);
      setCoverLetter(response);

      setContent(response.content || '');
      setTitle(response.title || 'Untitled Cover Letter');
      setCompany(response.company || '');
      setPosition(response.position || '');
      
      setLastSavedContent(response.content || '');
      setLastSavedTitle(response.title || '');
      setLastSavedCompany(response.company || '');
      setLastSavedPosition(response.position || '');
      
      setSaveStatus('saved');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAutoSave = async () => {
    if (saveStatus === 'saved') return;

    try {
      setSaveStatus('saving');
      setIsSaving(true);
      
      if (id && id !== 'new') {
        // Update existing cover letter
        await apiService.updateCoverLetter(id, {
          title,
          company,
          position,
          content,
        });
      } else {
        // Create new cover letter
        const response = await apiService.createCoverLetter({
          title,
          company,
          position,
          content,
        });
        setCoverLetter(response);
        navigate(`/cover-letters/${response.id}/edit`, { replace: true });
      }
      
      setLastSavedContent(content);
      setLastSavedTitle(title);
      setLastSavedCompany(company);
      setLastSavedPosition(position);
      setSaveStatus('saved');
    } catch (err) {
      console.error('Auto-save failed:', err);
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleManualSave = async () => {
    try {
      setSaveStatus('saving');
      setIsSaving(true);
      setError(null);
      
      if (id && id !== 'new') {
        await apiService.updateCoverLetter(id, {
          title,
          company,
          position,
          content,
        });
      } else {
        const response = await apiService.createCoverLetter({
          title,
          company,
          position,
          content,
        });
        setCoverLetter(response);
        navigate(`/cover-letters/${response.id}/edit`, { replace: true });
      }
      
      setLastSavedContent(content);
      setLastSavedTitle(title);
      setLastSavedCompany(company);
      setLastSavedPosition(position);
      setSaveStatus('saved');
    } catch (err) {
      setError(err.message);
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      setIsDownloading(true);
      
      // First save if there are unsaved changes
      if (saveStatus === 'unsaved') {
        await handleManualSave();
      }

      // Download PDF from API
      if (id && id !== 'new') {
        await apiService.downloadCoverLetterPDF(id);
      }
    } catch (err) {
      setError('Failed to download PDF: ' + err.message);
    } finally {
      setIsDownloading(false);
    }
  };

  const getSaveStatusColor = () => {
    switch (saveStatus) {
      case 'saved': return styles.saveStatusSaved;
      case 'saving': return styles.saveStatusSaving;
      case 'unsaved': return styles.saveStatusUnsaved;
      case 'error': return styles.saveStatusError;
      default: return 'text-gray-600';
    }
  };

  const getSaveStatusText = () => {
    switch (saveStatus) {
      case 'saved': return '✓ Saved';
      case 'saving': return 'Saving...';
      case 'unsaved': return '• Unsaved changes';
      case 'error': return '⚠ Save failed';
      default: return '';
    }
  };

  const getDefaultTemplate = () => {
    return `Dear Hiring Manager,

I am writing to express my strong interest in the [Position] role at [Company]. With my background in [relevant field], I am confident in my ability to make a significant contribution to your team.

Throughout my career, I have developed expertise in [key skills]. I am particularly drawn to [Company] because [reasons for interest in company]. I am excited about the opportunity to bring my skills and experience to your organization.

In my current role at [Current Company], I have [key achievements and responsibilities]. This experience has equipped me with the skills necessary to excel in the [Position] position, particularly in [relevant areas].

I am impressed by [Company's] commitment to [company values/mission], and I would welcome the opportunity to contribute to your continued success. I am confident that my [relevant skills] and passion for [relevant field] make me an excellent fit for your team.

Thank you for considering my application. I look forward to discussing how I can contribute to your organization. I am available for an interview at your convenience.

Sincerely,
[Your Name]`;
  };

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingContent}>
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerLeft}>
            <button
              onClick={() => navigate('/cover-letters')}
              className={styles.backButton}
            >
              <svg className={styles.backIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Cover Letters
            </button>
            <div className={styles.titleSection}>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={styles.titleInput}
                placeholder="Cover Letter Title"
              />
              <span className={clsx(styles.saveStatus, getSaveStatusColor())}>
                {getSaveStatusText()}
              </span>
            </div>
          </div>

          <div className={styles.headerRight}>
            {/* Metadata Inputs */}
            <div className={styles.metadataInputs}>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className={styles.metadataInput}
                placeholder="Company Name"
              />
              <input
                type="text"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                className={styles.metadataInput}
                placeholder="Position Title"
              />
            </div>

            {/* View Mode Toggle */}
            <div className={styles.viewModeToggle}>
              <button
                onClick={() => setViewMode('edit')}
                className={clsx(
                  styles.viewModeButton,
                  viewMode === 'edit' ? styles.viewModeButtonActive : styles.viewModeButtonInactive
                )}
                title="Edit mode (Ctrl+P)"
              >
                Edit
              </button>
              <button
                onClick={() => setViewMode('preview')}
                className={clsx(
                  styles.viewModeButton,
                  viewMode === 'preview' ? styles.viewModeButtonActive : styles.viewModeButtonInactive
                )}
                title="Preview mode (Ctrl+P)"
              >
                Preview
              </button>
              <button
                onClick={() => setViewMode('split')}
                className={clsx(
                  styles.viewModeButton,
                  viewMode === 'split' ? styles.viewModeButtonActive : styles.viewModeButtonInactive
                )}
                title="Split view (Ctrl+P)"
              >
                Split
              </button>
            </div>

            {/* Download PDF Button */}
            {id && id !== 'new' && (
              <button
                onClick={handleDownloadPDF}
                disabled={isDownloading}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                title="Download as PDF"
              >
                {isDownloading ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Downloading...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    PDF
                  </>
                )}
              </button>
            )}

            {/* Save Button */}
            <button
              onClick={handleManualSave}
              disabled={isSaving || saveStatus === 'saved'}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              title="Save (Ctrl+S)"
            >
              {isSaving ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  Save
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className={styles.errorContainer}>
          <div className={styles.errorContent}>
            <div className={styles.errorAlert}>
              <svg className={styles.errorIcon} viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className={styles.errorText}>{error}</p>
              <button
                onClick={() => setError(null)}
                className={styles.errorClose}
              >
                <svg className={styles.errorCloseIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className={styles.mainContent}>
        {viewMode === 'edit' && (
          <div className={styles.editorPanelFull}>
            <CoverLetterEditor
              initialContent={content}
              onChange={setContent}
              onSave={handleManualSave}
              isLoading={isSaving}
              metadata={{ company, position, title }}
            />
          </div>
        )}

        {viewMode === 'preview' && (
          <div className={styles.previewPanelFull}>
            <CoverLetterPreview content={content} />
          </div>
        )}

        {viewMode === 'split' && (
          <div className={styles.splitView}>
            <div className={styles.splitPanel}>
              <CoverLetterEditor
                initialContent={content}
                onChange={setContent}
                onSave={handleManualSave}
                isLoading={isSaving}
                metadata={{ company, position, title }}
              />
            </div>
            <div className={styles.splitDivider} />
            <div className={styles.splitPanel}>
              <CoverLetterPreview content={content} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
