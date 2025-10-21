import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import {
  ArrowLeftIcon,
  BriefcaseIcon,
  DocumentTextIcon,
  SparklesIcon,
  ChartBarIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';
import apiService from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import styles from './ApplicationFormPage.module.css';

export default function ApplicationFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    company: '',
    position: '',
    jobDescription: '',
    resumeId: '',
    resumeVersionId: '',
    coverLetterId: '',
    coverLetterVersionId: '',
    customizeResume: false,
    additionalInstructions: '',
    status: 'Applied',
    appliedDate: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const [resumes, setResumes] = useState([]);
  const [coverLetters, setCoverLetters] = useState([]);
  const [selectedResume, setSelectedResume] = useState(null);
  const [selectedCoverLetter, setSelectedCoverLetter] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resumesResponse, coverLettersResponse] = await Promise.all([
          apiService.getResumes(),
          apiService.getCoverLetters(),
        ]);
        
        const resumeList = resumesResponse.resumes || resumesResponse || [];
        const coverLetterList = coverLettersResponse.cover_letters || coverLettersResponse || [];
        
        setResumes(resumeList);
        setCoverLetters(coverLetterList);

        if (isEdit) {
          const application = await apiService.getApplication(id);
          setFormData({
            company: application.company || '',
            position: application.position || '',
            jobDescription: application.job_description || '',
            resumeId: application.resume_id || '',
            resumeVersionId: application.resume_version_id || '',
            coverLetterId: application.cover_letter_id || '',
            coverLetterVersionId: application.cover_letter_version_id || '',
            customizeResume: !!application.additional_instructions,
            additionalInstructions: application.additional_instructions || '',
            status: application.status || 'Applied',
            appliedDate: application.applied_date ? new Date(application.applied_date).toISOString().split('T')[0] : '',
            notes: application.notes || '',
          });

          // Set selected documents
          const resume = resumeList.find(r => r.id === application.resume_id);
          setSelectedResume(resume);
          
          const coverLetter = coverLetterList.find(cl => cl.id === application.cover_letter_id);
          setSelectedCoverLetter(coverLetter);
        }
      } catch (err) {
        setError('Failed to load data: ' + err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id, isEdit]);

  // Auto-hide success message
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Load resume versions when resume is selected
  useEffect(() => {
    if (formData.resumeId) {
      const resume = resumes.find(r => r.id === parseInt(formData.resumeId));
      setSelectedResume(resume);
    } else {
      setSelectedResume(null);
      setFormData(prev => ({ ...prev, resumeVersionId: '' }));
    }
  }, [formData.resumeId, resumes]);

  // Load cover letter versions when cover letter is selected
  useEffect(() => {
    if (formData.coverLetterId) {
      const fetchCoverLetter = async () => {
        try {
          const cl = await apiService.getCoverLetter(formData.coverLetterId);
          setSelectedCoverLetter(cl);
        } catch (err) {
          console.error('Failed to load cover letter:', err);
        }
      };
      fetchCoverLetter();
    } else {
      setSelectedCoverLetter(null);
      setFormData(prev => ({ ...prev, coverLetterVersionId: '' }));
    }
  }, [formData.coverLetterId]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.company.trim()) {
      errors.company = 'Company name is required';
    }

    if (!formData.position.trim()) {
      errors.position = 'Position is required';
    }

    if (!formData.resumeId) {
      errors.resumeId = 'Please select a resume';
    }

    if (!formData.resumeVersionId) {
      errors.resumeVersionId = 'Please select a resume version';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      setError('Please fix the validation errors before submitting');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const payload = {
        company: formData.company,
        position: formData.position,
        job_description: formData.jobDescription,
        status: formData.status,
        applied_date: formData.appliedDate,
        notes: formData.notes,
        resume_id: parseInt(formData.resumeId, 10),
        resume_version_id: parseInt(formData.resumeVersionId, 10),
        cover_letter_id: formData.coverLetterId ? parseInt(formData.coverLetterId, 10) : null,
        cover_letter_version_id: formData.coverLetterVersionId ? parseInt(formData.coverLetterVersionId, 10) : null,
        additional_instructions: formData.customizeResume ? formData.additionalInstructions : null,
        customize_resume: formData.customizeResume,
      };

      if (isEdit) {
        await apiService.updateApplication(id, payload);
        setSuccessMessage('Application updated successfully!');
      } else {
        await apiService.createApplication(payload);
        setSuccessMessage('Application created successfully!');
      }

      setTimeout(() => {
        navigate('/applications');
      }, 1000);
    } catch (err) {
      setError('Failed to save application: ' + err.message);
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingContent}>
          <LoadingSpinner size="lg" />
          <p className={styles.loadingText}>Loading form...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <button
            onClick={() => navigate('/applications')}
            className={styles.backButton}
          >
            <ArrowLeftIcon className={styles.backIcon} />
            Back to Applications
          </button>

          <div className={styles.headerInfo}>
            <h1 className={styles.title}>
              {isEdit ? 'Edit Application' : 'New Application'}
            </h1>
            <p className={styles.subtitle}>
              {isEdit
                ? 'Update your job application details'
                : 'Create a new job application with AI-powered customization'}
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      {(error || successMessage) && (
        <div className={styles.messagesContainer}>
          {error && (
            <div className={styles.errorMessage}>
              <div className={styles.messageContent}>
                <ExclamationCircleIcon className={styles.messageIcon} />
                <div className={styles.messageText}>
                  <p>{error}</p>
                </div>
                <button
                  onClick={() => setError(null)}
                  className={styles.messageClose}
                >
                  <svg className={styles.messageCloseIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {successMessage && (
            <div className={styles.successMessage}>
              <div className={styles.messageContent}>
                <CheckCircleIcon className={styles.messageIcon} />
                <div className={styles.messageText}>
                  <p>{successMessage}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Form Container */}
      <div className={styles.formContainer}>
        <form onSubmit={handleSubmit} className={styles.form}>
          
          {/* Section 1: Job Details */}
          <div className={styles.formSection}>
            <div className={styles.sectionHeader}>
              <BriefcaseIcon className={styles.sectionIcon} />
              <h2 className={styles.sectionTitle}>Job Details</h2>
            </div>
            <div className={styles.sectionContent}>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label htmlFor="company" className={styles.label}>
                    Company Name <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    placeholder="e.g., Google, Microsoft, Apple"
                    className={clsx(
                      styles.input,
                      validationErrors.company && styles.inputError
                    )}
                  />
                  {validationErrors.company && (
                    <p className={styles.errorText}>{validationErrors.company}</p>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="position" className={styles.label}>
                    Position <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="text"
                    id="position"
                    name="position"
                    value={formData.position}
                    onChange={handleInputChange}
                    placeholder="e.g., Senior Software Engineer"
                    className={clsx(
                      styles.input,
                      validationErrors.position && styles.inputError
                    )}
                  />
                  {validationErrors.position && (
                    <p className={styles.errorText}>{validationErrors.position}</p>
                  )}
                </div>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="jobDescription" className={styles.label}>
                  Job Description <span className={styles.optional}>(Optional)</span>
                </label>
                <p className={styles.helperText}>
                  Paste the job description for AI customization
                </p>
                <textarea
                  id="jobDescription"
                  name="jobDescription"
                  value={formData.jobDescription}
                  onChange={handleInputChange}
                  placeholder="Paste the full job description here..."
                  rows="8"
                  className={styles.textarea}
                />
              </div>
            </div>
          </div>

          {/* Section 2: Documents */}
          <div className={styles.formSection}>
            <div className={styles.sectionHeader}>
              <DocumentTextIcon className={styles.sectionIcon} />
              <h2 className={styles.sectionTitle}>Documents</h2>
            </div>
            <div className={styles.sectionContent}>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label htmlFor="resumeId" className={styles.label}>
                    Resume <span className={styles.required}>*</span>
                  </label>
                  <select
                    id="resumeId"
                    name="resumeId"
                    value={formData.resumeId}
                    onChange={handleInputChange}
                    className={clsx(
                      styles.select,
                      validationErrors.resumeId && styles.inputError
                    )}
                  >
                    <option value="">Select a resume...</option>
                    {resumes.map((resume) => (
                      <option key={resume.id} value={resume.id}>
                        {resume.title}
                      </option>
                    ))}
                  </select>
                  {validationErrors.resumeId && (
                    <p className={styles.errorText}>{validationErrors.resumeId}</p>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="resumeVersionId" className={styles.label}>
                    Resume Version <span className={styles.required}>*</span>
                  </label>
                  <select
                    id="resumeVersionId"
                    name="resumeVersionId"
                    value={formData.resumeVersionId}
                    onChange={handleInputChange}
                    disabled={!formData.resumeId}
                    className={clsx(
                      styles.select,
                      validationErrors.resumeVersionId && styles.inputError
                    )}
                  >
                    <option value="">Select a version...</option>
                    {selectedResume?.versions?.map((version) => (
                      <option key={version.id} value={version.id}>
                        Version {version.version || version.id}
                        {version.is_original && ' (Original)'}
                      </option>
                    ))}
                  </select>
                  {validationErrors.resumeVersionId && (
                    <p className={styles.errorText}>{validationErrors.resumeVersionId}</p>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="coverLetterId" className={styles.label}>
                    Cover Letter <span className={styles.optional}>(Optional)</span>
                  </label>
                  <select
                    id="coverLetterId"
                    name="coverLetterId"
                    value={formData.coverLetterId}
                    onChange={handleInputChange}
                    className={styles.select}
                  >
                    <option value="">None - Skip cover letter</option>
                    {coverLetters.map((cl) => (
                      <option key={cl.id} value={cl.id}>
                        {cl.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="coverLetterVersionId" className={styles.label}>
                    Cover Letter Version
                  </label>
                  <select
                    id="coverLetterVersionId"
                    name="coverLetterVersionId"
                    value={formData.coverLetterVersionId}
                    onChange={handleInputChange}
                    disabled={!formData.coverLetterId}
                    className={styles.select}
                  >
                    <option value="">Select a version...</option>
                    {selectedCoverLetter?.versions?.map((version) => (
                      <option key={version.id} value={version.id}>
                        Version {version.version || version.id}
                        {version.is_original && ' (Original)'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: AI Customization */}
          <div className={clsx(
            styles.formSection,
            styles.aiSection,
            formData.customizeResume && styles.aiSectionActive
          )}>
            <div className={styles.sectionHeader}>
              <SparklesIcon className={styles.sectionIcon} />
              <h2 className={styles.sectionTitle}>AI Customization</h2>
            </div>
            <div className={styles.sectionContent}>
              <div className={styles.aiToggle}>
                <div className={styles.checkboxGroup}>
                  <input
                    type="checkbox"
                    id="customizeResume"
                    name="customizeResume"
                    checked={formData.customizeResume}
                    onChange={handleInputChange}
                    className={styles.checkbox}
                  />
                  <label htmlFor="customizeResume" className={styles.checkboxLabel}>
                    <span className={styles.checkboxLabelText}>
                      Customize resume and cover letter using AI
                    </span>
                    <span className={styles.checkboxLabelHelper}>
                      AI will tailor your documents to match the job description
                    </span>
                  </label>
                </div>
              </div>

              {formData.customizeResume && (
                <div className={styles.aiInstructions}>
                  <div className={styles.formGroup}>
                    <label htmlFor="additionalInstructions" className={styles.label}>
                      Additional Instructions <span className={styles.optional}>(Optional)</span>
                    </label>
                    <p className={styles.helperText}>
                      Provide specific guidance for AI customization
                    </p>
                    <textarea
                      id="additionalInstructions"
                      name="additionalInstructions"
                      value={formData.additionalInstructions}
                      onChange={handleInputChange}
                      placeholder="e.g., Emphasize my leadership experience, highlight React skills, keep it concise..."
                      rows="4"
                      className={styles.textarea}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Section 4: Application Tracking */}
          <div className={styles.formSection}>
            <div className={styles.sectionHeader}>
              <ChartBarIcon className={styles.sectionIcon} />
              <h2 className={styles.sectionTitle}>Application Tracking</h2>
            </div>
            <div className={styles.sectionContent}>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label htmlFor="status" className={styles.label}>
                    Status
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className={styles.select}
                  >
                    <option value="Applied">Applied</option>
                    <option value="Interviewing">Interviewing</option>
                    <option value="Offer">Offer</option>
                    <option value="Rejected">Rejected</option>
                    <option value="Withdrawn">Withdrawn</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="appliedDate" className={styles.label}>
                    Applied Date
                  </label>
                  <input
                    type="date"
                    id="appliedDate"
                    name="appliedDate"
                    value={formData.appliedDate}
                    onChange={handleInputChange}
                    className={styles.input}
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="notes" className={styles.label}>
                  Notes <span className={styles.optional}>(Optional)</span>
                </label>
                <p className={styles.helperText}>
                  Add any notes about this application (interview dates, contacts, etc.)
                </p>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Add notes about interviews, follow-ups, or other important details..."
                  rows="4"
                  className={styles.textarea}
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className={styles.actions}>
            <button
              type="button"
              onClick={() => navigate('/applications')}
              className={clsx(styles.button, styles.cancelButton)}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={clsx(
                styles.button,
                styles.submitButton,
                isSubmitting && styles.buttonDisabled
              )}
            >
              {isSubmitting ? (
                <>
                  <LoadingSpinner size="sm" className={styles.buttonSpinner} />
                  <span>{isEdit ? 'Saving...' : 'Creating...'}</span>
                </>
              ) : (
                <span>{isEdit ? 'Save Changes' : 'Create Application'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
