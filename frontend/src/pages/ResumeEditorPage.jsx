import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import CodeMirror from '@uiw/react-codemirror';
import { markdown } from '@codemirror/lang-markdown';
import { oneDark } from '@codemirror/theme-one-dark';
import { EditorView } from '@codemirror/view';
import { EditorState } from '@codemirror/state';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import LoadingSpinner from '../components/common/LoadingSpinner';
import MarkdownToolbar from '../components/resume/MarkdownToolbar';
import VersionComparison from '../components/resume/VersionComparison';
import FileUploadZone from '../components/resume/FileUploadZone';
import apiService from '../services/api';
import { AUTO_SAVE_DELAY, MAX_FILE_SIZE } from '../utils/constants';
import styles from '../styles/modules/pages/ResumeEditorPage.module.css';

export default function ResumeEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Refs
  const editorRef = useRef(null);
  const previewRef = useRef(null);
  const fileInputRef = useRef(null);
  
  // State management
  const [resume, setResume] = useState(null);
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState('saved'); // 'saved', 'saving', 'unsaved', 'error'
  const [error, setError] = useState(null);
  
  // View options
  const [viewMode, setViewMode] = useState('split'); // 'edit', 'preview', 'split'
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showVersions, setShowVersions] = useState(false);
  const [showUploadZone, setShowUploadZone] = useState(false);
  const [versions, setVersions] = useState([]);
  const [isScrollSyncing, setIsScrollSyncing] = useState(true);
  
  // Auto-save
  const [saveTimeout, setSaveTimeout] = useState(null);
  const [lastSavedContent, setLastSavedContent] = useState('');
  const [lastSavedTitle, setLastSavedTitle] = useState('');

  // Initialize editor
  useEffect(() => {
    if (id && id !== 'new') {
      loadResume();
      loadVersions();
    } else {
      setIsLoading(false);
      setContent(getDefaultResumeTemplate());
      setTitle('Untitled Resume');
      setLastSavedContent('');
      setLastSavedTitle('');
    }
  }, [id]);

  // Auto-save when content changes
  useEffect(() => {
    if (!isLoading && (content !== lastSavedContent || title !== lastSavedTitle)) {
      setSaveStatus('unsaved');
      
      // Clear existing timeout
      if (saveTimeout) {
        clearTimeout(saveTimeout);
      }

      // Set new timeout for auto-save
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
  }, [content, title, isLoading, lastSavedContent, lastSavedTitle]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl+S or Cmd+S to save
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleManualSave();
      }
      
      // Ctrl+B or Cmd+B for bold
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault();
        insertMarkdown('**bold text**');
      }
      
      // Ctrl+I or Cmd+I for italic
      if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
        e.preventDefault();
        insertMarkdown('*italic text*');
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const loadResume = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiService.getResume(id);
      setResume(response);
      setContent(response.content || '');
      setTitle(response.title || 'Untitled Resume');
      setLastSavedContent(response.content || '');
      setLastSavedTitle(response.title || 'Untitled Resume');
      setSaveStatus('saved');
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

  const handleAutoSave = async () => {
    if (saveStatus === 'saved') return;

    try {
      setSaveStatus('saving');
      setIsSaving(true);
      
      if (id && id !== 'new') {
        // Update existing resume
        await apiService.updateResume(id, {
          title,
          content,
        });
      } else {
        // Create new resume
        const response = await apiService.createResume({
          title,
          content,
        });
        setResume(response);
        // Navigate to the new resume's edit URL
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
        await apiService.updateResume(id, {
          title,
          content,
        });
      } else {
        const response = await apiService.createResume({
          title,
          content,
        });
        setResume(response);
        navigate(`/resumes/${response.id}/edit`, { replace: true });
      }
      
      setLastSavedContent(content);
      setLastSavedTitle(title);
      setSaveStatus('saved');
      
      // Reload versions after save
      if (id && id !== 'new') {
        loadVersions();
      }
    } catch (err) {
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

    // Validate file size
    if (file.size > MAX_FILE_SIZE.RESUME_MD) {
      setError(`File size too large. Maximum allowed size is ${MAX_FILE_SIZE.RESUME_MD / 1024}KB`);
      return;
    }

    // Validate file type
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
        setTitle(file.name.replace(/\.[^/.]+$/, '')); // Remove file extension
        setError(null);
      } catch (err) {
        setError('Failed to read file content.');
      }
    };
    reader.onerror = () => {
      setError('Failed to read the file.');
    };
    reader.readAsText(file);

    // Clear the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const insertMarkdown = useCallback((markdownText) => {
    setContent(prevContent => prevContent + markdownText);
    
    // Focus editor after inserting text
    setTimeout(() => {
      if (editorRef.current) {
        editorRef.current.focus();
      }
    }, 100);
  }, []);

  // Scroll synchronization
  const syncScroll = useCallback((sourceElement, targetElement) => {
    if (!isScrollSyncing || !sourceElement || !targetElement) return;
    
    const sourceScrollPercent = sourceElement.scrollTop / (sourceElement.scrollHeight - sourceElement.clientHeight);
    const targetScrollTop = sourceScrollPercent * (targetElement.scrollHeight - targetElement.clientHeight);
    
    targetElement.scrollTop = targetScrollTop;
  }, [isScrollSyncing]);

  const handleEditorScroll = useCallback((event) => {
    if (viewMode === 'split' && previewRef.current) {
      syncScroll(event.target, previewRef.current);
    }
  }, [viewMode, syncScroll]);

  const handlePreviewScroll = useCallback((event) => {
    if (viewMode === 'split' && editorRef.current) {
      const editorElement = editorRef.current.querySelector('.cm-scroller');
      if (editorElement) {
        syncScroll(event.target, editorElement);
      }
    }
  }, [viewMode, syncScroll]);

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

Write a brief summary of your professional background, key skills, and career objectives. This should be 2-3 sentences that highlight your most relevant experience and what you bring to potential employers.

## Technical Skills

### Programming Languages
- List your programming languages here
- Include proficiency levels if relevant

### Frameworks & Technologies
- List frameworks, libraries, and tools
- Group by category (Frontend, Backend, Database, etc.)

## Professional Experience

### Job Title
**Company Name** | Location | Start Date - End Date

- Bullet point describing key responsibility or achievement
- Use action verbs and quantify results where possible
- Include technologies used and impact made

### Previous Job Title
**Previous Company** | Location | Start Date - End Date

- Another bullet point with specific achievement
- Focus on results and measurable outcomes

## Education

### Degree Name
**University Name** | Location | Graduation Year
- **GPA:** 3.X/4.0 (if relevant)
- **Relevant Coursework:** List relevant courses

## Projects

### Project Name
**Technologies:** List technologies used
- Brief description of the project
- What problem it solved or what you learned
- Link to demo or repository if available

## Certifications

- Certification Name (Year)
- Another Certification (Year)

## Languages

- **English:** Native/Fluent
- **Other Language:** Proficiency Level
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
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex-shrink-0">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/resumes')}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-200"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Resumes
            </button>
            <div className="flex items-center">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-xl font-semibold text-gray-900 bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 rounded px-2 py-1"
                placeholder="Resume Title"
              />
              <span className={`ml-3 text-sm ${getSaveStatusColor()}`}>
                {getSaveStatusText()}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('edit')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200 ${
                  viewMode === 'edit' ? 'bg-white text-gray-900 shadow' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Edit
              </button>
              <button
                onClick={() => setViewMode('split')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200 ${
                  viewMode === 'split' ? 'bg-white text-gray-900 shadow' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Split
              </button>
              <button
                onClick={() => setViewMode('preview')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200 ${
                  viewMode === 'preview' ? 'bg-white text-gray-900 shadow' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Preview
              </button>
            </div>

            {/* Scroll Sync Toggle */}
            {viewMode === 'split' && (
              <button
                onClick={() => setIsScrollSyncing(!isScrollSyncing)}
                className={`p-2 rounded transition-colors duration-200 ${
                  isScrollSyncing 
                    ? 'text-blue-600 bg-blue-50' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                title="Toggle scroll synchronization"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </button>
            )}

            {/* Versions Button */}
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

            {/* Theme Toggle */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
              title={isDarkMode ? 'Light Mode' : 'Dark Mode'}
            >
              {isDarkMode ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>

            {/* File Upload */}
            <button
              onClick={() => setShowUploadZone(!showUploadZone)}
              className="p-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
              title="Upload file"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </button>

            {/* Legacy File Input (hidden) */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".md,.txt"
              onChange={handleLegacyFileUpload}
              className="hidden"
            />

            {/* Save Button */}
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

      {/* Upload Zone Modal */}
      {showUploadZone && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 m-4 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Upload Resume</h3>
              <button
                onClick={() => setShowUploadZone(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <FileUploadZone onFileSelect={handleFileUpload} />
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="flex-shrink-0 px-4 py-2">
          <div className="max-w-7xl mx-auto">
            <div className="bg-red-50 border border-red-200 rounded-md p-3 flex items-center">
              <svg className="h-5 w-5 text-red-400 mr-3" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-sm text-red-800">{error}</p>
              <button
                onClick={() => setError(null)}
                className="ml-auto text-red-600 hover:text-red-800"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Markdown Toolbar */}
      {(viewMode === 'edit' || viewMode === 'split') && (
        <MarkdownToolbar onInsert={insertMarkdown} />
      )}

      {/* Editor/Preview Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Version Comparison Sidebar */}
        {showVersions && (
          <div className="w-80 border-r border-gray-200 flex-shrink-0">
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

        {/* Main Editor Area */}
        <div className="flex-1 flex">
          {(viewMode === 'edit' || viewMode === 'split') && (
            <div className={`${viewMode === 'split' ? 'w-1/2' : 'w-full'} border-r border-gray-200`}>
              <div ref={editorRef} className="h-full">
                <CodeMirror
                  value={content}
                  onChange={(value) => setContent(value)}
                  extensions={[
                    markdown(),
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
                    EditorView.domEventHandlers({
                      scroll: handleEditorScroll,
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

          {(viewMode === 'preview' || viewMode === 'split') && (
            <div 
              className={`${viewMode === 'split' ? 'w-1/2' : 'w-full'} overflow-auto bg-white`}
              ref={previewRef}
              onScroll={handlePreviewScroll}
            >
              <div className="max-w-4xl mx-auto p-8">
                <div className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-strong:text-gray-900 prose-ul:text-gray-700 prose-ol:text-gray-700">
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