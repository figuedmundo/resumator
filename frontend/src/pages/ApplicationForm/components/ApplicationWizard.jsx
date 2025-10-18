import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import clsx from 'clsx';
import LoadingSpinner from '../../../components/LoadingSpinner/LoadingSpinner';
import apiService from '../../../services/api';
import { APPLICATION_STATUS } from '@/utils/constants';
import { devLog } from '@/utils/helpers';
import styles from './ApplicationWizard.module.css';
import CoverLetterSelector from '../../../components/Applications/CoverLetterSelector';

const ApplicationWizard = ({ applicationId = null, onSuccess }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [resumes, setResumes] = useState([]);
  const [resumeVersions, setResumeVersions] = useState([]);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    company: '',
    position: '',
    job_description: '',
    additional_instructions: '',
    resume_id: '',
    resume_version_id: '',
    cover_letter_version_id: '',
    customize_resume: false,
    status: APPLICATION_STATUS.APPLIED,
    applied_date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  // Updated steps array - merged step 2 and 3
  const steps = [
    { number: 1, title: 'Job Details', description: 'Company and position information' },
    { number: 2, title: 'Select Resume & Customize', description: 'Choose resume and customization options' },
    { number: 3, title: 'Review & Create', description: 'Final review and submission' }
  ];

  useEffect(() => {
    loadResumes();
    if (location.state?.jobData) {
      setFormData(prev => ({ ...prev, ...location.state.jobData }));
    }
  }, [location.state]);

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
    }
  };

  const loadResumeVersions = async (resumeId) => {
    if (!resumeId) return;
    try {
      const data = await apiService.getResumeVersions(resumeId);
      setResumeVersions(data.versions || data || []);
      if ((data.versions || data)?.length > 0) {
        setFormData(prev => ({
          ...prev,
          resume_version_id: (data.versions || data)[0].id
        }));
      }
    } catch (error) {
      console.error('Failed to load resume versions:', error);
      setResumeVersions([]);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validateStep = (step) => {
    const newErrors = {};
    switch (step) {
      case 1:
        if (!formData.company.trim()) newErrors.company = 'Company is required';
        if (!formData.position.trim()) newErrors.position = 'Position is required';
        break;
      case 2:
        if (!formData.resume_id) newErrors.resume_id = 'Please select a resume';
        if (!formData.resume_version_id) newErrors.resume_version_id = 'Please select a version';
        if (formData.customize_resume && !formData.job_description.trim()) {
          newErrors.job_description = 'Job description is required for AI customization';
        }
        break;
      case 3:
        if (!formData.applied_date) newErrors.applied_date = 'Applied date is required';
        break;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 3));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) return;
    
    setSubmitting(true);
    setErrors({});
    
    try {
      const submitData = {
        company: formData.company.trim(),
        position: formData.position.trim(),
        job_description: formData.job_description.trim() || null,
        resume_id: parseInt(formData.resume_id),
        resume_version_id: parseInt(formData.resume_version_id),
        cover_letter_version_id: formData.cover_letter_version_id ? parseInt(formData.cover_letter_version_id) : null,
        customize_resume: formData.customize_resume,
        additional_instructions: formData.additional_instructions.trim() || null,
        status: formData.status,
        applied_date: formData.applied_date,
        notes: formData.notes.trim() || null
      };
      
      const result = await apiService.createApplication(submitData);
      devLog('Application created:', result);
      
      if (onSuccess) {
        onSuccess(result);
      } else {
        navigate('/applications');
      }
    } catch (error) {
      console.error('Failed to create application:', error);
      setErrors({ general: error.message || 'Failed to create application' });
    } finally {
      setSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className={styles.stepContent}>
            <h3 className={styles.stepTitle}>Job Details</h3>
            <p className={styles.stepDescription}>Tell us about the position you're applying for</p>
            
            <div className={styles.formGrid}>
              <div className={styles.fieldGroup}>
                <label htmlFor="company" className={clsx(styles.label, styles.required)}>Company</label>
                <input 
                  type="text" 
                  id="company" 
                  name="company" 
                  value={formData.company} 
                  onChange={handleChange}
                  className={clsx(styles.input, errors.company && styles.inputError)} 
                  placeholder="Enter company name" 
                  required 
                />
                {errors.company && <p className={styles.error}>{errors.company}</p>}
              </div>
              
              <div className={styles.fieldGroup}>
                <label htmlFor="position" className={clsx(styles.label, styles.required)}>Position</label>
                <input 
                  type="text" 
                  id="position" 
                  name="position" 
                  value={formData.position} 
                  onChange={handleChange}
                  className={clsx(styles.input, errors.position && styles.inputError)} 
                  placeholder="Enter job title/position" 
                  required 
                />
                {errors.position && <p className={styles.error}>{errors.position}</p>}
              </div>
            </div>
            
            <div className={styles.fieldGroup}>
              <label htmlFor="job_description" className={styles.label}>Job Description</label>
              <textarea 
                id="job_description" 
                name="job_description" 
                value={formData.job_description} 
                onChange={handleChange}
                rows={6} 
                className={styles.textarea} 
                placeholder="Paste the job description here (recommended for AI customization)" 
              />
              <p className={styles.helpText}>Including the job description helps our AI tailor your resume perfectly</p>
            </div>
          </div>
        );
        
      case 2:
        return (
          <div className={styles.stepContent}>
            <h3 className={styles.stepTitle}>Select Resume & Cover Letter</h3>
            <p className={styles.stepDescription}>Choose your resume and an optional cover letter</p>
            
            <div className={styles.formGrid}>
              <div className={styles.fieldGroup}>
                <label htmlFor="resume_id" className={clsx(styles.label, styles.required)}>Resume</label>
                <select 
                  id="resume_id" 
                  name="resume_id" 
                  value={formData.resume_id} 
                  onChange={handleChange}
                  className={clsx(styles.select, errors.resume_id && styles.selectError)} 
                  required
                >
                  <option value="">Select a resume</option>
                  {resumes.map(resume => (
                    <option key={resume.id} value={resume.id}>
                      {resume.title} {resume.is_default && '(Default)'}
                    </option>
                  ))}
                </select>
                {errors.resume_id && <p className={styles.error}>{errors.resume_id}</p>}
              </div>
              
              <div className={styles.fieldGroup}>
                <label htmlFor="resume_version_id" className={clsx(styles.label, styles.required)}>Version</label>
                <select 
                  id="resume_version_id" 
                  name="resume_version_id" 
                  value={formData.resume_version_id} 
                  onChange={handleChange}
                  disabled={!formData.resume_id} 
                  className={clsx(
                    styles.select, 
                    errors.resume_version_id && styles.selectError, 
                    !formData.resume_id && styles.selectDisabled
                  )} 
                  required
                >
                  <option value="">Select version</option>
                  {resumeVersions.map(version => (
                    <option key={version.id} value={version.id}>
                      {version.version} {version.is_original && '(Original)'}
                      {version.job_description && ' - Customized'}
                    </option>
                  ))}
                </select>
                {errors.resume_version_id && <p className={styles.error}>{errors.resume_version_id}</p>}
              </div>
            </div>

            <CoverLetterSelector onSelect={(id) => setFormData(prev => ({...prev, cover_letter_version_id: id}))} selectedCoverLetter={formData.cover_letter_version_id} />
            
            <div className={styles.customizationSection}>
              <div className={styles.customizationOption}>
                <label className={styles.checkboxLabel}>
                  <input 
                    type="checkbox" 
                    name="customize_resume" 
                    checked={formData.customize_resume} 
                    onChange={handleChange} 
                    className={styles.checkbox} 
                  />
                  <span className={styles.checkboxText}>
                    <strong>Customize resume using AI</strong>
                  </span>
                </label>
                <p className={styles.helpText}>
                  Create a tailored version optimized for this specific {formData.company || 'company'} position
                  {formData.customize_resume && formData.company && 
                    ` (will be saved as "v${resumeVersions.length + 1} - ${formData.company}")`
                  }
                </p>
              </div>
              
              {formData.customize_resume && (
                <div className={styles.additionalInstructions}>
                  <label htmlFor="additional_instructions" className={styles.label}>
                    Additional Instructions (Optional)
                  </label>
                  <textarea 
                    id="additional_instructions" 
                    name="additional_instructions" 
                    value={formData.additional_instructions} 
                    onChange={handleChange}
                    rows={3} 
                    className={styles.textarea} 
                    placeholder='e.g., "Emphasize leadership experience" or "Highlight Python skills"' 
                  />
                  <p className={styles.helpText}>
                    Provide specific instructions for how you want your resume customized
                  </p>
                  
                  {!formData.job_description.trim() && (
                    <div className={styles.warningMessage}>
                      <svg className={styles.warningIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                        />
                      </svg>
                      <span>
                        Job description is required for AI customization. Please go back to Step 1 to add it.
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        );
        
      case 3:
        return (
          <div className={styles.stepContent}>
            <h3 className={styles.stepTitle}>Review & Create</h3>
            <p className={styles.stepDescription}>Review your application details before creating</p>
            
            <div className={styles.reviewGrid}>
              <div className={styles.reviewSection}>
                <h4 className={styles.reviewSectionTitle}>Job Information</h4>
                <div className={styles.reviewItem}>
                  <span className={styles.reviewLabel}>Company:</span>
                  <span className={styles.reviewValue}>{formData.company}</span>
                </div>
                <div className={styles.reviewItem}>
                  <span className={styles.reviewLabel}>Position:</span>
                  <span className={styles.reviewValue}>{formData.position}</span>
                </div>
                <div className={styles.reviewItem}>
                  <span className={styles.reviewLabel}>Job Description:</span>
                  <span className={styles.reviewValue}>
                    {formData.job_description 
                      ? `${formData.job_description.substring(0, 100)}${formData.job_description.length > 100 ? '...' : ''}` 
                      : 'Not provided'
                    }
                  </span>
                </div>
              </div>
              
              <div className={styles.reviewSection}>
                <h4 className={styles.reviewSectionTitle}>Resume & Cover Letter</h4>
                <div className={styles.reviewItem}>
                  <span className={styles.reviewLabel}>Resume:</span>
                  <span className={styles.reviewValue}>
                    {resumes.find(r => r.id == formData.resume_id)?.title || 'Unknown'}
                  </span>
                </div>
                <div className={styles.reviewItem}>
                  <span className={styles.reviewLabel}>Version:</span>
                  <span className={styles.reviewValue}>
                    {resumeVersions.find(v => v.id == formData.resume_version_id)?.version || 'Unknown'}
                  </span>
                </div>
                <div className={styles.reviewItem}>
                  <span className={styles.reviewLabel}>Cover Letter:</span>
                  <span className={styles.reviewValue}>
                    {formData.cover_letter_version_id ? 'Selected' : 'Not Selected'}
                  </span>
                </div>
                <div className={styles.reviewItem}>
                  <span className={styles.reviewLabel}>Customization:</span>
                  <span className={clsx(
                    styles.reviewValue, 
                    formData.customize_resume ? styles.customizationEnabled : styles.customizationDisabled
                  )}>
                    {formData.customize_resume 
                      ? `Yes - Will create "v${resumeVersions.length + 1} - ${formData.company}"` 
                      : 'No - Using selected version as-is'
                    }
                  </span>
                </div>
                {formData.customize_resume && formData.additional_instructions && (
                  <div className={styles.reviewItem}>
                    <span className={styles.reviewLabel}>AI Instructions:</span>
                    <span className={styles.reviewValue}>
                      {formData.additional_instructions.substring(0, 100)}
                      {formData.additional_instructions.length > 100 && '...'}
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            <div className={styles.formGrid}>
              <div className={styles.fieldGroup}>
                <label htmlFor="status" className={styles.label}>Status</label>
                <select 
                  id="status" 
                  name="status" 
                  value={formData.status} 
                  onChange={handleChange} 
                  className={styles.select}
                >
                  <option value={APPLICATION_STATUS.APPLIED}>Applied</option>
                  <option value={APPLICATION_STATUS.INTERVIEWING}>Interviewing</option>
                  <option value={APPLICATION_STATUS.OFFER}>Offer</option>
                  <option value={APPLICATION_STATUS.REJECTED}>Rejected</option>
                  <option value={APPLICATION_STATUS.WITHDRAWN}>Withdrawn</option>
                </select>
              </div>
              
              <div className={styles.fieldGroup}>
                <label htmlFor="applied_date" className={clsx(styles.label, styles.required)}>
                  Applied Date
                </label>
                <input 
                  type="date" 
                  id="applied_date" 
                  name="applied_date" 
                  value={formData.applied_date} 
                  onChange={handleChange}
                  className={clsx(styles.input, errors.applied_date && styles.inputError)} 
                  required 
                />
                {errors.applied_date && <p className={styles.error}>{errors.applied_date}</p>}
              </div>
            </div>
            
            <div className={styles.fieldGroup}>
              <label htmlFor="notes" className={styles.label}>Notes</label>
              <textarea 
                id="notes" 
                name="notes" 
                value={formData.notes} 
                onChange={handleChange} 
                rows={3} 
                className={styles.textarea} 
                placeholder="Any additional notes about this application" 
              />
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className={styles.wizard}>
      {/* Progress Bar */}
      <div className={styles.progressContainer}>
        <div className={styles.progressBar}>
          {steps.map((step) => (
            <div 
              key={step.number} 
              className={clsx(
                styles.progressStep,
                currentStep >= step.number && styles.progressStepActive,
                currentStep > step.number && styles.progressStepCompleted
              )}
            >
              <div className={styles.progressStepNumber}>
                {currentStep > step.number ? (
                  <svg className={styles.checkIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  step.number
                )}
              </div>
              <div className={styles.progressStepContent}>
                <div className={styles.progressStepTitle}>{step.title}</div>
                <div className={styles.progressStepDescription}>{step.description}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Error Alert */}
      {errors.general && (
        <div className={styles.errorAlert}>
          <svg className={styles.errorIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
            />
          </svg>
          <span>{errors.general}</span>
        </div>
      )}

      {/* Step Content */}
      <div className={styles.stepContainer}>
        {renderStep()}
      </div>

      {/* Loading Overlay */}
      {submitting && (
        <div className={styles.loadingOverlay}>
          <div className={styles.loadingContent}>
            <LoadingSpinner size="lg" />
            <p className={styles.loadingText}>
              {formData.customize_resume 
                ? 'Creating application and customizing resume with AI...' 
                : 'Creating application...'
              }
            </p>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className={styles.navigation}>
        <div className={styles.navigationLeft}>
          {currentStep > 1 && (
            <button 
              type="button" 
              onClick={handlePrevious} 
              className={styles.previousButton} 
              disabled={submitting}
            >
              <svg className={styles.buttonIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Previous
            </button>
          )}
        </div>
        
        <div className={styles.navigationRight}>
          <button 
            type="button" 
            onClick={() => navigate('/applications')} 
            className={styles.cancelButton} 
            disabled={submitting}
          >
            Cancel
          </button>
          
          {currentStep < 3 ? (
            <button 
              type="button" 
              onClick={handleNext} 
              className={styles.nextButton} 
              disabled={submitting}
            >
              Next
              <svg className={styles.buttonIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          ) : (
            <button 
              type="button" 
              onClick={handleSubmit} 
              disabled={submitting} 
              className={styles.submitButton}
            >
              {submitting && <LoadingSpinner size="sm" className={styles.spinner} />}
              Create Application
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApplicationWizard;
