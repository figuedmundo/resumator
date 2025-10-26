import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import LoadingSpinner from '../../../components/LoadingSpinner/LoadingSpinner';
import apiService from '../../../services/api';
import { APPLICATION_STATUS, SUCCESS_MESSAGES, ERROR_MESSAGES } from '@/utils/constants';
import { devLog } from '@/utils/helpers';
import styles from './ApplicationForm.module.css';

const ApplicationForm = ({ applicationId = null, onSuccess }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [loadingResumes, setLoadingResumes] = useState(true);
  const [resumes, setResumes] = useState([]);
  const [resumeVersions, setResumeVersions] = useState([]);
  const [loadingVersions, setLoadingVersions] = useState(false);
  const [errors, setErrors] = useState({});
  
  const [formData, setFormData] = useState({
    company: '',
    position: '',
    job_description: '',
    resume_id: '',
    resume_version_id: '',
    status: APPLICATION_STATUS.APPLIED,
    applied_date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const statusOptions = [
    { value: APPLICATION_STATUS.APPLIED, label: 'Applied', color: 'blue' },
    { value: APPLICATION_STATUS.INTERVIEWING, label: 'Interviewing', color: 'yellow' },
    { value: APPLICATION_STATUS.OFFER, label: 'Offer', color: 'green' },
    { value: APPLICATION_STATUS.REJECTED, label: 'Rejected', color: 'red' },
    { value: APPLICATION_STATUS.WITHDRAWN, label: 'Withdrawn', color: 'gray' }
  ];

  useEffect(() => {
    loadResumes();
    if (applicationId) {
      loadApplication();
    } else {
      // Check for pre-filled data from resume customization
      const savedData = sessionStorage.getItem('applicationFormData');
      if (savedData) {
        try {
          const data = JSON.parse(savedData);
          setFormData(prev => ({
            ...prev,
            resume_id: data.resume_id || '',
            job_description: data.job_description || ''
          }));
          // Clear the saved data
          sessionStorage.removeItem('applicationFormData');
        } catch (error) {
          console.error('Failed to parse saved form data:', error);
        }
      }
    }
  }, [applicationId]);

  useEffect(() => {
    if (formData.resume_id) {
      loadResumeVersions(formData.resume_id);
    }
  }, [formData.resume_id]);

  const loadResumes = async () => {
    try {
      const data = await apiService.getResumes();
      setResumes(data.resumes || data || []);
    } catch (error) {
      console.error('Failed to load resumes:', error);
      setErrors({ general: 'Failed to load resumes' });
    } finally {
      setLoadingResumes(false);
    }
  };

  const loadResumeVersions = async (resumeId) => {
    if (!resumeId) return;

    setLoadingVersions(true);
    try {
      const data = await apiService.getResumeVersions(resumeId);
      setResumeVersions(data.versions || data || []);

      // If editing and no version selected, select the first version
      if ((data.versions || data)?.length > 0 && !formData.resume_version_id) {
        setFormData(prev => ({
          ...prev,
          resume_version_id: (data.versions || data)[0].id
        }));
      }
    } catch (error) {
      console.error('Failed to load resume versions:', error);
      setResumeVersions([]);
    } finally {
      setLoadingVersions(false);
    }
  };

  const loadApplication = async () => {
    setLoading(true);
    try {
      const application = await apiService.getApplication(applicationId);
      setFormData({
        company: application.company || '',
        position: application.position || '',
        job_description: application.job_description || '',
        resume_id: application.resume_id || '',
        resume_version_id: application.resume_version_id || '',
        status: application.status || APPLICATION_STATUS.APPLIED,
        applied_date: application.applied_date || new Date().toISOString().split('T')[0],
        notes: application.notes || ''
      });
    } catch (error) {
      console.error('Failed to load application:', error);
      setErrors({ general: 'Failed to load application' });
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.company.trim()) {
      newErrors.company = 'Company is required';
    }

    if (!formData.position.trim()) {
      newErrors.position = 'Position is required';
    }

    if (!formData.resume_id) {
      newErrors.resume_id = 'Please select a resume';
    }

    if (!formData.resume_version_id) {
      newErrors.resume_version_id = 'Please select a resume version';
    }

    if (!formData.applied_date) {
      newErrors.applied_date = 'Applied date is required';
    }

    console.log('Validating form, newErrors:', newErrors);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const submitData = {
        company: formData.company.trim(),
        position: formData.position.trim(),
        job_description: formData.job_description.trim() || null,
        resume_id: parseInt(formData.resume_id),
        resume_version_id: parseInt(formData.resume_version_id),
        status: formData.status,
        applied_date: formData.applied_date,
        notes: formData.notes.trim() || null
      };

      let result;
      if (applicationId) {
        result = await apiService.updateApplication(applicationId, submitData);
        devLog('Application updated:', result);
      } else {
        result = await apiService.createApplication(submitData);
        devLog('Application created:', result);
      }

      if (onSuccess) {
        onSuccess(result);
      } else {
        navigate('/applications');
      }

    } catch (error) {
      console.error('Failed to save application:', error);
      setErrors({ 
        general: error.message || (applicationId ? 'Failed to update application' : 'Failed to create application')
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  if (loadingResumes || (applicationId && loading)) {
    return (
      <div className={styles.loadingContainer}>
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      {errors.general && (
        <div className={styles.errorAlert}>
          {errors.general}
        </div>
      )}

      <div className={styles.gridTwoCol}>
        {/* Company */}
        <div className={styles.fieldGroup}>
          <label htmlFor="company" className={clsx(styles.label, styles.labelRequired)}>
            Company
          </label>
          <input
            type="text"
            id="company"
            name="company"
            value={formData.company}
            onChange={handleChange}
            className={clsx(
              styles.input,
              errors.company ? styles.inputError : styles.inputDefault
            )}
            placeholder="Enter company name"
            required
          />
          {errors.company && (
            <p className={styles.errorText}>{errors.company}</p>
          )}
        </div>

        {/* Position */}
        <div className={styles.fieldGroup}>
          <label htmlFor="position" className={clsx(styles.label, styles.labelRequired)}>
            Position
          </label>
          <input
            type="text"
            id="position"
            name="position"
            value={formData.position}
            onChange={handleChange}
            className={clsx(
              styles.input,
              errors.position ? styles.inputError : styles.inputDefault
            )}
            placeholder="Enter job title/position"
            required
          />
          {errors.position && (
            <p className={styles.errorText}>{errors.position}</p>
          )}
        </div>
      </div>

      {/* Job Description */}
      <div className={styles.fieldGroup}>
        <label htmlFor="job_description" className={styles.label}>
          Job Description
        </label>
        <textarea
          id="job_description"
          name="job_description"
          value={formData.job_description}
          onChange={handleChange}
          rows={4}
          className={styles.textarea}
          placeholder="Paste job description or key requirements"
        />
        <p className={styles.helpText}>
          Optional: Include the job description to help track requirements
        </p>
      </div>

      <div className={styles.gridTwoCol}>
        {/* Resume Selection */}
        <div className={styles.fieldGroup}>
          <label htmlFor="resume_id" className={clsx(styles.label, styles.labelRequired)}>
            Resume
          </label>
          <div className={clsx(styles.resumeSelector, loadingResumes && styles.resumeSelectorLoading)}>
            <select
              id="resume_id"
              name="resume_id"
              value={formData.resume_id}
              onChange={handleChange}
              disabled={loadingResumes}
              className={clsx(
                styles.select,
                errors.resume_id ? styles.selectError : '',
                loadingResumes && styles.selectDisabled
              )}
              required
            >
              <option value="">
                {loadingResumes ? 'Loading resumes...' : 'Select a resume'}
              </option>
              {resumes.map(resume => (
                <option key={resume.id} value={resume.id}>
                  {resume.title} {resume.is_default && '(Default)'}
                </option>
              ))}
            </select>
            {loadingResumes && (
              <div className={styles.loadingOverlay}>
                <LoadingSpinner size="sm" />
              </div>
            )}
          </div>
          {errors.resume_id && (
            <p className={styles.errorText}>{errors.resume_id}</p>
          )}
        </div>

        {/* Resume Version */}
        <div className={styles.fieldGroup}>
          <label htmlFor="resume_version_id" className={clsx(styles.label, styles.labelRequired)}>
            Resume Version
          </label>
          <div className={clsx(
            styles.resumeVersionSelector, 
            (!formData.resume_id || loadingVersions) && styles.resumeVersionSelectorLoading
          )}>
            <select
              id="resume_version_id"
              name="resume_version_id"
              value={formData.resume_version_id}
              onChange={handleChange}
              disabled={!formData.resume_id || loadingVersions}
              className={clsx(
                styles.select,
                errors.resume_version_id ? styles.selectError : '',
                (!formData.resume_id || loadingVersions) && styles.selectDisabled
              )}
              required
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
            </select>
            {loadingVersions && (
              <div className={styles.loadingOverlay}>
                <LoadingSpinner size="sm" />
              </div>
            )}
          </div>
          {errors.resume_version_id && (
            <p className={styles.errorText}>{errors.resume_version_id}</p>
          )}
          <p className={styles.helpText}>
            Select the specific version of your resume used for this application
          </p>
        </div>
      </div>

      <div className={styles.gridTwoCol}>
        {/* Status */}
        <div className={styles.fieldGroup}>
          <label htmlFor="status" className={styles.label}>
            Status
          </label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            className={styles.select}
          >
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <p className={styles.helpText}>
            Current status of your job application
          </p>
        </div>

        {/* Applied Date */}
        <div className={styles.fieldGroup}>
          <label htmlFor="applied_date" className={clsx(styles.label, styles.labelRequired)}>
            Applied Date
          </label>
          <input
            type="date"
            id="applied_date"
            name="applied_date"
            value={formData.applied_date}
            onChange={handleChange}
            className={clsx(
              styles.dateInput,
              errors.applied_date && styles.dateInputError
            )}
            required
          />
          {errors.applied_date && (
            <p className={styles.errorText}>{errors.applied_date}</p>
          )}
        </div>
      </div>

      {/* Notes */}
      <div className={styles.fieldGroup}>
        <label htmlFor="notes" className={styles.label}>
          Notes
        </label>
        <textarea
          id="notes"
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          rows={3}
          className={styles.textarea}
          placeholder="Add any additional notes about this application"
        />
        <p className={styles.helpText}>
          Optional: Interview dates, contacts, follow-up reminders, etc.
        </p>
      </div>

      {/* Actions */}
      <div className={styles.actions}>
        <button
          type="button"
          onClick={() => navigate('/applications')}
          className={styles.cancelButton}
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className={styles.submitButton}
        >
          {loading && <LoadingSpinner size="sm" className={styles.loadingSpinner} />}
          <span>{applicationId ? 'Update Application' : 'Create Application'}</span>
        </button>
      </div>
    </form>
  );
};

export default ApplicationForm;
