import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import apiService from '../services/api';
import { AUTO_SAVE_DELAY } from '../utils/constants';

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

export const useResumeEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Refs
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

  // Load resume metadata
  const loadResumeMetadata = useCallback(async () => {
    try {
      const response = await apiService.getResume(id);
      setResume(response);
      setTitle(response.title || 'Untitled Resume');
      setLastSavedTitle(response.title || 'Untitled Resume');
    } catch (err) {
      console.error('Failed to load resume metadata:', err);
      setError(err.message);
    }
  }, [id]);

  // Load all versions
  const loadVersions = useCallback(async () => {
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
  }, [id]);

  // PHASE 1: Initialize
  useEffect(() => {
    if (id && id !== 'new') {
      if (location.state?.versionId) {
        desiredVersionIdRef.current = location.state.versionId;
      }
      loadVersions();
      loadResumeMetadata();
    } else {
      setIsLoading(false);
      setContent(getDefaultResumeTemplate());
      setTitle('Untitled Resume');
      setLastSavedContent('');
      setLastSavedTitle('');
      setVersionsLoaded(true);
    }
  }, [id, location.state, loadVersions, loadResumeMetadata]);

  // PHASE 2: Set selected version
  useEffect(() => {
    if (versionsLoaded && versions.length > 0 && !selectedVersionId) {
      const desiredVersionId = desiredVersionIdRef.current;
      if (desiredVersionId && versions.find(v => v.id === desiredVersionId)) {
        setSelectedVersionId(desiredVersionId);
        desiredVersionIdRef.current = null;
      } else {
        setSelectedVersionId(versions[0].id);
      }
    }
  }, [versionsLoaded, versions, selectedVersionId]);

  // PHASE 3: Load content
  useEffect(() => {
    if (selectedVersionId && versions.length > 0) {
      const version = versions.find(v => v.id === selectedVersionId);
      if (version) {
        setContent(version.markdown_content || '');
        setLastSavedContent(version.markdown_content || '');
        setIsLoading(false);
        setSaveStatus('saved');
      }
    }
  }, [selectedVersionId, versions]);

  const handleAutoSave = useCallback(async () => {
    if (saveStatus !== 'unsaved') return;

    try {
      setSaveStatus('saving');
      setIsSaving(true);
      
      if (id && id !== 'new') {
        await apiService.updateResumeVersion(id, selectedVersionId, { markdown: content });
      } else {
        const response = await apiService.createResume({ title, markdown: content });
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
  }, [id, selectedVersionId, content, title, saveStatus, navigate]);

  // Auto-save trigger
  useEffect(() => {
    if (isLoading) return;
    const hasChanges = content !== lastSavedContent || title !== lastSavedTitle;

    if (hasChanges) {
      setSaveStatus('unsaved');
      if (id && id !== 'new') {
        if (saveTimeout) clearTimeout(saveTimeout);
        const timeout = setTimeout(() => handleAutoSave(), AUTO_SAVE_DELAY);
        setSaveTimeout(timeout);
      }
    }

    return () => {
      if (saveTimeout) clearTimeout(saveTimeout);
    };
  }, [content, title, isLoading, lastSavedContent, lastSavedTitle, id, handleAutoSave, saveTimeout]);

  const handleManualSave = async () => {
    try {
      setSaveStatus('saving');
      setIsSaving(true);
      setError(null);
      
      if (id && id !== 'new') {
        if (selectedVersionId) {
          await apiService.updateResumeVersion(id, selectedVersionId, { markdown: content });
        } else {
          await apiService.updateResume(id, { title, content });
        }
      } else {
        const response = await apiService.createResume({ title, markdown: content });
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

  return {
    state: {
      id,
      resume,
      content,
      title,
      isLoading,
      isSaving,
      saveStatus,
      error,
      viewMode,
      isDarkMode,
      showVersions,
      showUploadZone,
      versions,
      selectedVersionId,
    },
    handlers: {
      navigate,
      setContent,
      setTitle,
      setError,
      setViewMode,
      setIsDarkMode,
      setShowVersions,
      setShowUploadZone,
      setSelectedVersionId,
      handleManualSave,
      handleFileUpload,
    },
    refs: {
      // None needed externally for now
    }
  };
};
