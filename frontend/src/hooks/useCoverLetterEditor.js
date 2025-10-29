import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import apiService from '../services/api';

const getDefaultTemplate = () => {
    return `Dear Hiring Manager,

I am writing to express my strong interest in the [Position] role at [Company]. With my background in [relevant field], I am confident in my ability to make a significant contribution to your team.

Throughout my career, I have developed expertise in [key skills]. I am particularly drawn to [Company] because [reasons for interest in company]. I am excited about the opportunity to bring my skills and experience to your organization.

In my current role at [Current Company], I have [key achievements and responsibilities]. This experience has equipped me with the skills necessary to excel in the [Position] position, particularly in [relevant areas].

I am impressed by [Company's] commitment to [company values/mission], and I would welcome the opportunity to contribute to your continued success. I am confident that my [relevant skills] and passion for [relevant field] make me an excellent fit for your team.

Thank you for considering my application. I look forward to discussing how I can contribute to your organization. I am available for an interview at your convenience.

Sincerely,
[Your Name]`
};

export const useCoverLetterEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

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

  const loadCoverLetterData = useCallback(async () => {
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
  }, [id]);

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
  }, [id, location.state, loadCoverLetterData]);

  useEffect(() => {
    if (versionsLoaded && versions.length > 0 && !selectedVersionId) {
      const desiredVersionId = desiredVersionIdRef.current;
      if (desiredVersionId && versions.find(v => v.id === desiredVersionId)) {
        setSelectedVersionId(desiredVersionId);
        desiredVersionIdRef.current = null;
      } else if (versions[0]) {
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
      setIsDirty(true);
    }
  }, [content, title, isLoading]);

  const handleManualSave = async () => {
    try {
      setIsSaving(true);
      setError(null);

      if (id && id !== 'new') {
        await apiService.updateCoverLetter(id, { title });
        if (selectedVersionId) {
          await apiService.updateCoverLetterVersion(id, selectedVersionId, { content });
        }
      } else {
        const response = await apiService.createCoverLetter({ title, content });
        setCoverLetter(response);
        navigate(`/cover-letters/${response.id}/edit`, { replace: true });
      }

      setIsDirty(false);
      if (id && id !== 'new') {
        loadCoverLetterData();
      }
    } catch (err) {
      console.error('Manual save failed:', err);
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return {
    state: {
      id,
      coverLetter,
      content,
      title,
      isLoading,
      error,
      viewMode,
      isDarkMode,
      versions,
      selectedVersionId,
      isDirty,
      isSaving,
    },
    handlers: {
      navigate,
      setContent,
      setTitle,
      setError,
      setViewMode,
      setIsDarkMode,
      setSelectedVersionId,
      handleManualSave,
    },
  };
};
