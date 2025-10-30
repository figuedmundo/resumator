import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiService from '../services/api';
import { formatDate } from '@/utils/helpers';

export const useResumeCustomization = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [resume, setResume] = useState(null);
  const [originalContent, setOriginalContent] = useState('');
  const [baselineContent, setBaselineContent] = useState('');
  const [customizedContent, setCustomizedContent] = useState('');
  const [versions, setVersions] = useState([]);
  const [currentJobDescription, setCurrentJobDescription] = useState('');
  const [customInstructions, setCustomInstructions] = useState('');
  
  const [isLoading, setIsLoading] = useState(true);
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  
  const [showVersions, setShowVersions] = useState(false);
  const [viewMode, setViewMode] = useState('customize');

  const [lastCustomizationResult, setLastCustomizationResult] = useState(null);

  // Step 1: Load the main resume object
  useEffect(() => {
    if (id) {
      setIsLoading(true);
      apiService.getResume(id)
        .then(response => setResume(response))
        .catch(err => setError(err.message))
        .finally(() => setIsLoading(false));
    }
  }, [id]);

  // Step 2: Load all versions after the main resume is loaded
  useEffect(() => {
    if (resume) {
      apiService.getResumeVersions(id)
        .then(versionsResponse => {
          const allVersions = versionsResponse.versions || versionsResponse || [];
          allVersions.sort((a, b) => b.id - a.id); // Sort to find latest
          setVersions(allVersions);
        })
        .catch(err => console.error('Failed to load versions:', err));
    }
  }, [id, resume]);

  // Step 3: Set content states after versions are loaded
  useEffect(() => {
    if (versions.length > 0) {
      const originalVersion = versions.find(v => v.is_original) || versions[versions.length - 1];
      const latestVersion = versions[0];

      const original = originalVersion?.markdown_content || '';
      const latest = latestVersion?.markdown_content || '';

      setOriginalContent(original);
      setBaselineContent(latest);
      if (!customizedContent) {
        setCustomizedContent(latest);
      }
    }
  }, [versions]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  useEffect(() => {
    if (lastCustomizationResult) {
      setCustomizedContent(lastCustomizationResult.customized_markdown);
      setViewMode('compare');
      setSuccessMessage('Resume customized successfully! Review the preview below. Changes are NOT saved yet.');
      setResume(prev => ({ ...prev, updated_at: new Date().toISOString() }));
      setLastCustomizationResult(null);
    }
  }, [lastCustomizationResult]);

  const handleCustomization = async ({ jobDescription, options }) => {
    try {
      setIsCustomizing(true);
      setError(null);
      setCurrentJobDescription(jobDescription);
      setCustomInstructions(options.custom_instructions || '');
      const response = await apiService.previewCustomization(id, jobDescription, options);
      setLastCustomizationResult(response);
    } catch (err) {
      setError(err.message || 'Failed to customize resume. Please check your inputs and try again.');
    } finally {
      setIsCustomizing(false);
    }
  };

  const handleSaveAsApplication = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await apiService.saveCustomization(id, customizedContent, currentJobDescription, { custom_instructions: customInstructions });
      await loadVersions();
      const applicationData = {
        resume_id: parseInt(id),
        job_description: currentJobDescription,
        customized_resume_markdown: customizedContent,
      };
      sessionStorage.setItem('applicationFormData', JSON.stringify(applicationData));
      navigate('/applications/new');
    } catch (err) {
      setError(err.message || 'Failed to save as application.');
      setIsLoading(false);
    }
  };

  const handleSaveCustomization = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await apiService.saveCustomization(id, customizedContent, currentJobDescription, { custom_instructions: customInstructions });
      setBaselineContent(customizedContent);
      setSuccessMessage('Customized resume saved successfully as a new version!');
      await loadVersions();
      setViewMode('customize');
    } catch (err) {
      setError(err.message || 'Failed to save customized resume.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDiscardCustomization = () => {
    setCustomizedContent(baselineContent);
    setViewMode('customize');
    setCurrentJobDescription('');
    setCustomInstructions('');
    setSuccessMessage('');
    setError(null);
    setLastCustomizationResult(null);
  };

  const handleVersionRestore = async (version) => {
    try {
      setBaselineContent(version.markdown_content);
      setCustomizedContent(version.markdown_content);
      setViewMode('compare');
      setShowVersions(false);
      setSuccessMessage(`Restored to version from ${formatDate(version.created_at, 'relative')}`);
    } catch (err) {
      setError('Failed to restore version');
    }
  };

  const hasChanges = baselineContent !== customizedContent;

  return {
    state: {
      resume,
      originalContent,
      customizedContent,
      versions,
      currentJobDescription,
      customInstructions,
      isLoading,
      isCustomizing,
      error,
      successMessage,
      showVersions,
      viewMode,
      hasChanges,
    },
    handlers: {
      handleCustomization,
      handleSaveAsApplication,
      handleSaveCustomization,
      handleDiscardCustomization,
      handleVersionRestore,
      setShowVersions,
      setViewMode,
      setError,
      setSuccessMessage,
    },
  };
};
