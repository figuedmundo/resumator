import { useState, useEffect } from 'react';
import Select from '@/components/forms/Select';
import apiService from '@/services/api';

const ResumeSelect = ({ name = "resume_id", label = "Resume", value, onChange, error, required, disabled }) => {
  const [resumes, setResumes] = useState([]);
  const [loadingResumes, setLoadingResumes] = useState(true);

  useEffect(() => {
    const loadResumes = async () => {
      try {
        const data = await apiService.getResumes();
        setResumes(data.resumes || data || []);
      } catch (error) {
        console.error('Failed to load resumes:', error);
        // Optionally set an error state here to display in the UI
      } finally {
        setLoadingResumes(false);
      }
    };
    loadResumes();
  }, []);

  return (
    <Select
      label={label}
      name={name}
      value={value}
      onChange={onChange}
      error={error}
      required={required}
      disabled={disabled || loadingResumes}
      loading={loadingResumes}
    >
      <option value="">
        {loadingResumes ? 'Loading resumes...' : 'Select a resume'}
      </option>
      {resumes.map(resume => (
        <option key={resume.id} value={resume.id}>
          {resume.title} {resume.is_default && '(Default)'}
        </option>
      ))}
    </Select>
  );
};

export default ResumeSelect;
