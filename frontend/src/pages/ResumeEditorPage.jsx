import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CodeMirror from '@uiw/react-codemirror';
import { markdown } from '@codemirror/lang-markdown';
import { oneDark } from '@codemirror/theme-one-dark';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import LoadingSpinner from '../components/common/LoadingSpinner';
import apiService from '../services/api';

export default function ResumeEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [resume, setResume] = useState(null);
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Auto-save functionality
  const [saveTimeout, setSaveTimeout] = useState(null);

  useEffect(() => {
    if (id && id !== 'new') {
      loadResume();
    } else {
      // New resume
      setIsLoading(false);
      setContent(getDefaultResumeTemplate());
      setTitle('Untitled Resume');
    }
  }, [id]);

  // Auto-save when content changes
  useEffect(() => {
    if (!isLoading && resume) {
      setHasUnsavedChanges(true);
      
      // Clear existing timeout
      if (saveTimeout) {
        clearTimeout(saveTimeout);
      }

      // Set new timeout for auto-save
      const timeout = setTimeout(() => {
        handleAutoSave();
      }, 2000); // Auto-save after 2 seconds of inactivity

      setSaveTimeout(timeout);
    }

    return () => {
      if (saveTimeout) {
        clearTimeout(saveTimeout);
      }
    };
  }, [content, title]);

  const loadResume = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiService.getResume(id);
      setResume(response);
      setContent(response.content || '');
      setTitle(response.title || 'Untitled Resume');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAutoSave = async () => {
    if (!hasUnsavedChanges) return;

    try {
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
        // Navigate to the new resume's edit URL
        navigate(`/resumes/${response.id}/edit`, { replace: true });
      }
      
      setHasUnsavedChanges(false);
    } catch (err) {
      console.error('Auto-save failed:', err);
      // Don't show error for auto-save failures to avoid disrupting UX
    } finally {
      setIsSaving(false);
    }
  };

  const handleSave = async () => {
    try {
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
        navigate(`/resumes/${response.id}/edit`, { replace: true });
      }
      
      setHasUnsavedChanges(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileUpload = useCallback((event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const fileContent = e.target.result;
      setContent(fileContent);
      setTitle(file.name.replace(/\.[^/.]+$/, '')); // Remove file extension
    };
    reader.readAsText(file);
  }, []);

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center min-h-96">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-full mx-auto">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
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
              {hasUnsavedChanges && (
                <span className="ml-2 text-sm text-yellow-600">• Unsaved changes</span>
              )}
              {isSaving && (
                <span className="ml-2 text-sm text-blue-600">Saving...</span>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setPreviewMode(false)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200 ${
                  !previewMode ? 'bg-white text-gray-900 shadow' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Edit
              </button>
              <button
                onClick={() => setPreviewMode(true)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200 ${
                  previewMode ? 'bg-white text-gray-900 shadow' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Preview
              </button>
            </div>

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
            <label className="cursor-pointer p-2 text-gray-600 hover:text-gray-900 transition-colors duration-200" title="Upload file">
              <input
                type="file"
                accept=".md,.txt"
                onChange={handleFileUpload}
                className="hidden"
              />
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </label>

            {/* Save Button */}
            <button
              onClick={handleSave}
              disabled={isSaving}
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

      {/* Error Message */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Editor/Preview */}
      <div className="flex h-screen" style={{ height: 'calc(100vh - 140px)' }}>
        {!previewMode ? (
          // Editor Mode
          <div className="w-full">
            <CodeMirror
              value={content}
              onChange={(value) => setContent(value)}
              extensions={[markdown()]}
              theme={isDarkMode ? oneDark : 'light'}
              height="100%"
              basicSetup={{
                lineNumbers: true,
                foldGutter: true,
                dropCursor: false,
                allowMultipleSelections: false,
              }}
              className="h-full text-sm"
            />
          </div>
        ) : (
          // Preview Mode
          <div className="w-full overflow-auto bg-white">
            <div className="max-w-4xl mx-auto p-8">
              <div className="prose prose-lg max-w-none">
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