import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import clsx from 'clsx';
import CodeMirror from '@uiw/react-codemirror';
import { markdown } from '@codemirror/lang-markdown';
import { oneDark } from '@codemirror/theme-one-dark';
import { EditorView } from '@codemirror/view';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import MarkdownToolbar from '../ResumeEditor/components/MarkdownToolbar';
import VersionPicker from '../../components/Resumes/VersionPicker';
import apiService from '../../services/api';
import styles from './CoverLetterEditorPage.module.css';

export default function CoverLetterEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  const codeMirrorRef = useRef(null);
  const desiredVersionIdRef = useRef(null);
  
  const [coverLetter, setCoverLetter] = useState(null);
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [viewMode, setViewMode] = useState('edit');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [versions, setVersions] = useState([]);
  const [selectedVersionId, setSelectedVersionId] = useState(null);
  const [versionsLoaded, setVersionsLoaded] = useState(false);
  
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');

  useEffect(() => {
    if (id && id !== 'new') {
      if (location.state?.versionId) {
        desiredVersionIdRef.current = location.state.versionId;
      }
      loadCoverLetterData();
    } else {
      setIsLoading(false);
      setContent(getDefaultTemplate());
      setTitle('Untitled Cover Letter');
      setVersionsLoaded(true);
    }
  }, [id, location.state]);

  useEffect(() => {
    if (versionsLoaded && versions.length > 0 && !selectedVersionId) {
      const desiredVersionId = desiredVersionIdRef.current;
      
      if (desiredVersionId) {
        const desiredVersion = versions.find(v => v.id === desiredVersionId);
        if (desiredVersion) {
          setSelectedVersionId(desiredVersionId);
          desiredVersionIdRef.current = null; // Reset after use
          return;
        }
      }
      
      // Fallback to the first version if desired version not found or not specified
      if (versions[0]) {
        setSelectedVersionId(versions[0].id);
      }
    }
  }, [versionsLoaded, versions, selectedVersionId]);

  useEffect(() => {
    if (selectedVersionId && versions.length > 0) {
      const version = versions.find(v => v.id === selectedVersionId);
      if (version) {
        setContent(version.markdown_content || '');
        setIsLoading(false);
      }
    }
  }, [selectedVersionId, versions]);

  useEffect(() => {
    if (!isLoading) {
      if (content || title) {
        setIsDirty(true);
      } else {
        setIsDirty(false);
      }
    }
  }, [content, title, isLoading]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleManualSave();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault();
        setViewMode(prev => prev === 'edit' ? 'preview' : 'edit');
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const loadCoverLetterData = async () => {
    setIsLoading(true);
    try {
      const response = await apiService.getCoverLetter(id);
      setCoverLetter(response);
      setTitle(response.title || 'Untitled Cover Letter');
      
      const versionsList = response.versions || [];
      setVersions(versionsList);
      setVersionsLoaded(true);

    } catch (err) {
      console.error('Failed to load cover letter data:', err);
      setError('Failed to load cover letter data. Please try again.');
      setIsLoading(false);
      setVersionsLoaded(true);
    }
  };

  const handleManualSave = async () => {
    try {
      setSaveStatus('saving');
      setIsSaving(true);
      setError(null);
      
      if (id && id !== 'new') {
        // Update title (metadata)
        await apiService.updateCoverLetter(id, {
          title,
        });

        // Update content (version)
        if (selectedVersionId) {
          await apiService.updateCoverLetterVersion(id, selectedVersionId, {
            content,
          });
        } else {
            console.error("No selected version to save content to.");
            // Or should we throw an error? For now, just log it.
        }

      } else {
        const response = await apiService.createCoverLetter({
          title,
          content,
        });
        setCoverLetter(response);
        navigate(`/cover-letters/${response.id}/edit`, { replace: true });
      }
      
      setSaveStatus('saved');
      setIsDirty(false);
      
      if (id && id !== 'new') {
        loadCoverLetterData();
      }
    } catch (err) {
      console.error('Manual save failed:', err);
      setError(err.message);
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  const insertMarkdown = useCallback((markdownText) => {
    if (codeMirrorRef.current && codeMirrorRef.current.view) {
      const view = codeMirrorRef.current.view;
      const state = view.state;
      const selection = state.selection.main;

      if (selection.from !== selection.to) {
        const selectedText = state.sliceDoc(selection.from, selection.to);
        const wrappedText = markdownText.replace('text', selectedText);
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
            </div>
          </div>

          <div className={styles.headerRight}>
            {versions.length > 0 && (
              <VersionPicker
                versions={versions}
                selectedVersionId={selectedVersionId}
                onVersionSelect={(version) => setSelectedVersionId(version.id)}
                showCount={false}
              />
            )}

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

            {id && id !== 'new' && (
              <Link
                to={`/cover-letters/${id}`}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                View
              </Link>
            )}

            <button
              onClick={handleManualSave}
              disabled={isSaving || !isDirty}
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
        {viewMode === 'edit' && (
          <div className={styles.editorPanelFull}>
            <div className={styles.editorProse}>
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
  );
}