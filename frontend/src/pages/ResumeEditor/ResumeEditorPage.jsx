import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import clsx from 'clsx';
import CodeMirror from '@uiw/react-codemirror';
import { markdown } from '@codemirror/lang-markdown';
import { oneDark } from '@codemirror/theme-one-dark';
import { EditorView } from '@codemirror/view';
import { EditorState } from '@codemirror/state';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import MarkdownToolbar from './components/MarkdownToolbar';
import VersionComparison from '../../components/VersionComparison/VersionComparison';
import FileUploadZone from './components/FileUploadZone';
import VersionPicker from '../../components/Resumes/VersionPicker';
import apiService from '../../services/api';
import { AUTO_SAVE_DELAY, MAX_FILE_SIZE } from '../../utils/constants';
import styles from './ResumeEditorPage.module.css';

export default function ResumeEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Refs
  const fileInputRef = useRef(null);
  const codeMirrorRef = useRef(null);
  const desiredVersionIdRef = useRef(null);
  
  // State management
  const [resume, setResume] = useState(null);
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState('saved');
  const [error, setError] = useState(null);
  
  // View options
  const [viewMode, setViewMode] = useState('edit');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showVersions, setShowVersions] = useState(false);
  const [showUploadZone, setShowUploadZone] = useState(false);
  const [versions, setVersions] = useState([]);
  const [selectedVersionId, setSelectedVersionId] = useState(null);
  const [versionsLoaded, setVersionsLoaded] = useState(false);
  
  // Auto-save
  const [saveTimeout, setSaveTimeout] = useState(null);
  const [lastSavedContent, setLastSavedContent] = useState('');
  const [lastSavedTitle, setLastSavedTitle] = useState('');

  // PHASE 1: Initialize - store desired version and start loading
  useEffect(() => {
    if (id && id !== 'new') {
      // Store the desired version ID from navigation state
      if (location.state?.versionId) {
        desiredVersionIdRef.current = location.state.versionId;
        console.log('📍 Desired version from navigation:', location.state.versionId);
      }
      
      // Load versions and resume metadata
      loadVersions();
      loadResumeMetadata();
    } else {
      // New resume
      setIsLoading(false);
      setContent(getDefaultResumeTemplate());
      setTitle('Untitled Resume');
      setLastSavedContent('');
      setLastSavedTitle('');
      setVersionsLoaded(true);
    }
  }, [id]);

  // PHASE 2: Once versions are loaded, set the selected version
  useEffect(() => {
    if (versionsLoaded && versions.length > 0 && !selectedVersionId) {
      const desiredVersionId = desiredVersionIdRef.current;
      
      if (desiredVersionId) {
        // Look for the desired version
        const desiredVersion = versions.find(v => v.id === desiredVersionId);
        if (desiredVersion) {
          console.log('✅ Found desired version, selecting:', desiredVersionId);
          setSelectedVersionId(desiredVersionId);
          desiredVersionIdRef.current = null;
          return;
        } else {
          console.log('⚠️ Desired version not found, falling back to latest');
        }
      }
      
      // Default to latest version
      console.log('📌 Selecting latest version:', versions[0].id);
      setSelectedVersionId(versions[0].id);
    }
  }, [versionsLoaded, versions, selectedVersionId]);

  // PHASE 3: Load content when selected version changes
  useEffect(() => {
    if (selectedVersionId && versions.length > 0) {
      const version = versions.find(v => v.id === selectedVersionId);
      if (version) {
        console.log('📄 Loading content for version:', selectedVersionId);
        setContent(version.markdown_content || '');
        setLastSavedContent(version.markdown_content || '');
        setIsLoading(false);
        setSaveStatus('saved');
      }
    }
  }, [selectedVersionId, versions]);

  // Auto-save when content changes
  useEffect(() => {
    if (isLoading) return;

    const hasChanges = content !== lastSavedContent || title !== lastSavedTitle;

    if (hasChanges) {
      setSaveStatus('unsaved');

      if (id && id !== 'new') {
        if (saveTimeout) {
          clearTimeout(saveTimeout);
        }
        const timeout = setTimeout(() => handleAutoSave(), AUTO_SAVE_DELAY);
        setSaveTimeout(timeout);
      }
    }

    return () => {
      if (saveTimeout) {
        clearTimeout(saveTimeout);
      }
    };
  }, [content, title, isLoading, lastSavedContent, lastSavedTitle, id]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleManualSave();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault();
        insertMarkdown('**bold text**');
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
        e.preventDefault();
        insertMarkdown('*italic text*');
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault();
        setViewMode(prev => prev === 'edit' ? 'preview' : 'edit');
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Load resume metadata
  const loadResumeMetadata = async () => {
    try {
      const response = await apiService.getResume(id);
      setResume(response);
      setTitle(response.title || 'Untitled Resume');
      setLastSavedTitle(response.title || 'Untitled Resume');
    } catch (err) {
      console.error('Failed to load resume metadata:', err);
      setError(err.message);
    }
  };

  // Load all versions
  const loadVersions = async () => {
    try {
      console.log('🔄 Loading versions...');
      const response = await apiService.getResumeVersions(id);
      const versionsList = response.versions || response || [];
      console.log('📦 Versions loaded:', versionsList);
      setVersions(versionsList);
      setVersionsLoaded(true);
    } catch (err) {
      console.error('❌ Failed to load versions:', err);
      setError('Failed to load resume versions');
      setVersionsLoaded(true);
    }
  };

  const handleAutoSave = async () => {
    if (saveStatus !== 'unsaved') return;

    try {
      setSaveStatus('saving');
      setIsSaving(true);
      
      if (id && id !== 'new') {
        await apiService.updateResumeVersion(id, selectedVersionId, {
          markdown: content,
        });
      } else {
        // This case should not be reached due to the new useEffect logic
        const response = await apiService.createResume({
          title,
          markdown: content,
        });
        setResume(response);
        navigate(`/resumes/${response.id}/edit`, { replace: true });
      }
      
      setLastSavedContent(content);
      setLastSavedTitle(title);
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
        if (selectedVersionId) {
          await apiService.updateResumeVersion(id, selectedVersionId, {
            markdown: content,
          });
        } else {
          await apiService.updateResume(id, {
            title,
            content,
          });
        }
      } else {
        const response = await apiService.createResume({
          title,
          markdown: content,
        });
        setResume(response);
        navigate(`/resumes/${response.id}/edit`, { replace: true });
      }
      
      setLastSavedContent(content);
      setLastSavedTitle(title);
      setSaveStatus('saved');
      
      if (id && id !== 'new') {
        loadVersions();
      }
    } catch (err) {
      console.error('Manual save failed:', err);
      setError(err.message);
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileUpload = useCallback(({ content: fileContent, title: fileTitle }) => {
    setContent(fileContent);
    setTitle(fileTitle);
    setShowUploadZone(false);
    setError(null);
  }, []);

  const handleLegacyFileUpload = useCallback((event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE.RESUME_MD) {
      setError(`File size too large. Maximum allowed size is ${MAX_FILE_SIZE.RESUME_MD / 1024}KB`);
      return;
    }

    const validTypes = ['.md', '.txt'];
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    if (!validTypes.includes(fileExtension)) {
      setError('Invalid file type. Please upload a .md or .txt file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const fileContent = e.target.result;
        setContent(fileContent);
        setTitle(file.name.replace(/\.[^/.]+$/, ''));
        setError(null);
      } catch (err) {
        setError('Failed to read file content.');
      }
    };
    reader.onerror = () => {
      setError('Failed to read the file.');
    };
    reader.readAsText(file);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const insertMarkdown = useCallback((markdownText) => {
    if (codeMirrorRef.current && codeMirrorRef.current.view) {
      const view = codeMirrorRef.current.view;
      const state = view.state;
      const selection = state.selection.main;

      if (selection.from !== selection.to) {
        const selectedText = state.sliceDoc(selection.from, selection.to);
        const wrappedText = markdownText.replace('bold text', selectedText).replace('italic text', selectedText).replace('code', selectedText);
        const transaction = state.update({
          changes: {
            from: selection.from,
            to: selection.to,
            insert: wrappedText
          },
          selection: {
            anchor: selection.from + wrappedText.length,
            head: selection.from + wrappedText.length
          }
        });
        view.dispatch(transaction);
      } else {
        const transaction = state.update({
          changes: {
            from: selection.head,
            to: selection.head,
            insert: markdownText
          },
          selection: {
            anchor: selection.head + markdownText.length,
            head: selection.head + markdownText.length
          }
        });
        view.dispatch(transaction);
      }
      view.focus();
    } else {
      setContent(prevContent => prevContent + markdownText);
    }
  }, []);

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

  const getDefaultResumeTemplate = () => {
    return `# Your Name

## Contact Information
- **Email:** your.email@example.com
- **Phone:** (555) 123-4567
- **Location:** City, State
- **LinkedIn:** linkedin.com/in/yourname
- **Portfolio:** yourwebsite.com

## Professional Summary

Write a brief summary of your professional background, key skills, and career objectives.

## Technical Skills

- List your skills here

## Professional Experience

### Job Title
**Company Name** | Location | Start Date - End Date

- Achievement 1
- Achievement 2

## Education

### Degree Name
**University Name** | Graduation Year

## Projects

### Project Name
- Description and link

## Certifications

- Certification Name (Year)
`;
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
              onClick={() => navigate('/resumes')}
              className={styles.backButton}
            >
              <svg className={styles.backIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Resumes
            </button>
            <div className={styles.titleSection}>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={styles.titleInput}
                placeholder="Resume Title"
              />
              <span className={clsx(styles.saveStatus, getSaveStatusColor())}>
                {getSaveStatusText()}
              </span>
            </div>
          </div>

          <div className={styles.headerRight}>
            <div className={styles.viewModeToggle}>
              <button
                onClick={() => setViewMode('edit')}
                className={clsx(
                  styles.viewModeButton,
                  viewMode === 'edit' ? styles.viewModeButtonActive : styles.viewModeButtonInactive
                )}
              >
                Edit
              </button>
              <button
                onClick={() => setViewMode('preview')}
                className={clsx(
                  styles.viewModeButton,
                  viewMode === 'preview' ? styles.viewModeButtonActive : styles.viewModeButtonInactive
                )}
              >
                Preview
              </button>
            </div>

            {/* Version Picker - ALWAYS SHOW if versions exist */}
            {versions.length > 0 && (
              <VersionPicker
                versions={versions}
                selectedVersionId={selectedVersionId}
                onVersionSelect={(version) => setSelectedVersionId(version.id)}
                showCount={false}
              />
            )}

            {versions.length > 0 && (
              <button
                onClick={() => setShowVersions(!showVersions)}
                className={styles.actionButton}
                title="Version History"
              >
                <svg className={styles.actionIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
            )}

            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={styles.actionButton}
              title={isDarkMode ? 'Light Mode' : 'Dark Mode'}
            >
              {isDarkMode ? (
                <svg className={styles.actionIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className={styles.actionIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0112 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>

            <button
              onClick={() => setShowUploadZone(!showUploadZone)}
              className={styles.actionButton}
              title="Upload file"
            >
              <svg className={styles.actionIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept=".md,.txt"
              onChange={handleLegacyFileUpload}
              className={styles.hiddenFileInput}
            />

            {id && id !== 'new' && (
              <Link
                to={`/resumes/${id}`}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                View Resume
              </Link>
            )}

            <button
              onClick={handleManualSave}
              disabled={isSaving || saveStatus === 'saved'}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
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

      {showUploadZone && (
        <div className={styles.uploadModal}>
          <div className={styles.uploadModalContent}>
            <div className={styles.uploadModalHeader}>
              <h3 className={styles.uploadModalTitle}>Upload Resume</h3>
              <button
                onClick={() => setShowUploadZone(false)}
                className={styles.uploadModalClose}
              >
                <svg className={styles.uploadModalCloseIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <FileUploadZone onFileSelect={handleFileUpload} />
          </div>
        </div>
      )}

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

      {viewMode === 'edit' && (
        <MarkdownToolbar onInsert={insertMarkdown} />
      )}

      <div className={styles.mainContent}>
        {showVersions && (
          <div className={styles.versionSidebar}>
            <VersionComparison 
              versions={versions}
              currentContent={content}
              onVersionSelect={(version) => {
                setContent(version.content);
                setTitle(version.title);
                setShowVersions(false);
              }}
              onClose={() => setShowVersions(false)}
            />
          </div>
        )}

        <div className={styles.editorArea}>
          {viewMode === 'edit' && (
            <div className={styles.editorPanelFull}>
              <div className={styles.editorWrapper}>
                <CodeMirror
                  ref={codeMirrorRef}
                  value={content}
                  onChange={(value) => setContent(value)}
                  extensions={[
                    markdown(),
                    EditorView.lineWrapping,
                    EditorView.theme({
                      '&': {
                        fontSize: '14px',
                      },
                      '.cm-content': {
                        padding: '16px',
                        minHeight: '100%',
                      },
                      '.cm-focused': {
                        outline: 'none',
                      },
                      '.cm-editor': {
                        height: '100%',
                      },
                      '.cm-scroller': {
                        fontFamily: 'ui-monospace, "SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace',
                      },
                    }),
                  ]}
                  theme={isDarkMode ? oneDark : 'light'}
                  height="100%"
                  basicSetup={{
                    lineNumbers: true,
                    foldGutter: true,
                    dropCursor: false,
                    allowMultipleSelections: false,
                    highlightSelectionMatches: false,
                  }}
                />
              </div>
            </div>
          )}

          {viewMode === 'preview' && (
            <div className={styles.previewPanelFull}>
              <div className={styles.previewContent}>
                <div className={styles.previewProse}>
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {content}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
