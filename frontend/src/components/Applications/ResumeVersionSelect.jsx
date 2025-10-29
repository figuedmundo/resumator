import { useState, useEffect } from 'react';
import Select from '@/components/forms/Select';
import apiService from '@/services/api';

const ResumeVersionSelect = ({ name = "resume_version_id", label = "Resume Version", value, onChange, error, required, disabled, resumeId }) => {
  const [resumeVersions, setResumeVersions] = useState([]);
  const [loadingVersions, setLoadingVersions] = useState(false);

  useEffect(() => {
    if (!resumeId) {
      setResumeVersions([]);
      return;
    }

    const loadResumeVersions = async () => {
      setLoadingVersions(true);
      try {
        const data = await apiService.getResumeVersions(resumeId);
        setResumeVersions(data.versions || data || []);
      } catch (error) {
        console.error('Failed to load resume versions:', error);
        setResumeVersions([]);
        // Optionally set an error state here to display in the UI
      } finally {
        setLoadingVersions(false);
      }
    };
    loadResumeVersions();
  }, [resumeId]);

  return (
    <Select
      label={label}
      name={name}
      value={value}
      onChange={onChange}
      error={error}
      required={required}
      disabled={disabled || !resumeId || loadingVersions}
      loading={loadingVersions}
    >
      <option value="">
        {loadingVersions ? 'Loading versions...' : 'Select version'}
      </option>
      {resumeVersions.map(version => (
        <option key={version.id} value={version.id}>
          {version.version} {version.is_original && '(Original)'}
          {version.job_description && ' - Customized'}
        </option>
      ))}
    </Select>
  );
};

export default ResumeVersionSelect;
