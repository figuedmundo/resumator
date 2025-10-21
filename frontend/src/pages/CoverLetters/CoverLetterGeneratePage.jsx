import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  DocumentTextIcon,
  BriefcaseIcon,
  SparklesIcon,
  AdjustmentsHorizontalIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import apiService from '../../services/api';
import styles from './CoverLetterGeneratePage.module.css';

export default function CoverLetterGeneratePage() {
  const navigate = useNavigate();

  // Form data
  const [resumes, setResumes] = useState([]);
  const [selectedResume, setSelectedResume] = useState(null);
  const [coverLetters, setCoverLetters] = useState([]);
  const [selectedCoverLetter, setSelectedCoverLetter] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [jobDetails, setJobDetails] = useState({
    title: '',
    company: '',
    position: '',
    jobDescription: '',
    additionalInstructions: '',
  });

  // State
  const [generatedContent, setGeneratedContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  // Character counters
  const jobDescriptionMaxLength = 5000;
  const instructionsMaxLength = 1000;

  useEffect(() => {
    const loadData = async () => {
      try {
        const [resumesResponse, coverLettersResponse, templatesResponse] = await Promise.all([
          apiService.getResumes(),
          apiService.getCoverLetters(),
          apiService.getCoverLetterTemplates(),
        ]);

        const resumeList = resumesResponse.resumes || resumesResponse || [];
        setResumes(resumeList);
        if (resumeList.length > 0) {
          setSelectedResume(resumeList[0]);
        }

        const coverLetterList = coverLettersResponse.cover_letters || coverLettersResponse || [];
        setCoverLetters(coverLetterList);

        const templateList = Array.isArray(templatesResponse) ? templatesResponse : [];
        setTemplates(templateList);

      } catch (err) {
        setError('Failed to load data: ' + err.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Auto-hide success message
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const validateForm = () => {
    const errors = {};

    if (!selectedResume) {
      errors.resume = 'Please select a resume.';
    }

    if (!jobDetails.company.trim()) {
      errors.company = 'Company name is required.';
    }

    if (!jobDetails.position.trim()) {
      errors.position = 'Position title is required.';
    }

    if (!jobDetails.jobDescription.trim()) {
      errors.jobDescription = 'Job description is required.';
    } else if (jobDetails.jobDescription.length > jobDescriptionMaxLength) {
      errors.jobDescription = `Job description must be less than ${jobDescriptionMaxLength} characters.`;
    }

    if (jobDetails.additionalInstructions.length > instructionsMaxLength) {
      errors.additionalInstructions = `Instructions must be less than ${instructionsMaxLength} characters.`;
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleGenerate = async () => {
    if (!validateForm()) {
      setError('Please fix the validation errors before generating.');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setSuccessMessage('');

    try {
      const response = await apiService.generateCoverLetterPreview({
        title: jobDetails.title || `${jobDetails.company} - ${jobDetails.position}`,
        resume_id: selectedResume.id,
        company: jobDetails.company,
        position: jobDetails.position,
        job_description: jobDetails.jobDescription,
        template_id: selectedTemplate?.id,
        base_cover_letter_content: selectedCoverLetter?.markdown_content,
        additional_instructions: jobDetails.additionalInstructions,
      });
      
      setGeneratedContent(response.content || '');
      setSuccessMessage('Cover letter generated successfully! Review the preview and save when ready.');
    } catch (err) {
      setError('Failed to generate cover letter: ' + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!generatedContent) {
      setError('No content to save.');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const response = await apiService.createCoverLetter({
        title: jobDetails.title || `${jobDetails.company} - ${jobDetails.position}`,
        content: generatedContent,
        company: jobDetails.company,
        position: jobDetails.position,
      });
      
      setSuccessMessage('Cover letter saved successfully! Redirecting to editor...');
      setTimeout(() => {
        navigate(`/cover-letters/${response.id}/edit`);
      }, 1000);
    } catch (err) {
      setError('Failed to save cover letter: ' + err.message);
      setIsSaving(false);
    }
  };

  const handleFieldChange = (field, value) => {
    setJobDetails({ ...jobDetails, [field]: value });
    
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors({ ...validationErrors, [field]: null });
    }
  };

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingContent}>
          <LoadingSpinner size="lg" />
          <p className={styles.loadingText}>Loading resources...</p>
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
            onClick={() => navigate('/cover-letters')}
            className={styles.backButton}
          >
            <ArrowLeftIcon className={styles.backIcon} />
            Back to Cover Letters
          </button>
          
          <div className={styles.headerInfo}>
            <h1 className={styles.title}>Generate AI Cover Letter</h1>
            <p className={styles.subtitle}>
              Create a tailored cover letter using AI based on your resume and job details
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
                <button
                  onClick={() => setSuccessMessage('')}
                  className={styles.messageClose}
                >
                  <svg className={styles.messageCloseIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Main Content - Split Layout */}
      <div className={styles.mainContent}>
        {/* Left Panel - Form */}
        <div className={styles.leftPanel}>
          <div className={styles.formContainer}>
            
            {/* Section 1: Resume Selection */}
            <div className={styles.formSection}>
              <div className={styles.sectionHeader}>
                <DocumentTextIcon className={styles.sectionIcon} />
                <h2 className={styles.sectionTitle}>Resume Selection</h2>
              </div>
              <div className={styles.sectionContent}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    Select Resume <span className={styles.required}>*</span>
                  </label>
                  <p className={styles.helperText}>Choose the resume to base your cover letter on</p>
                  <select
                    className={clsx(
                      styles.select,
                      validationErrors.resume && styles.inputError
                    )}
                    value={selectedResume?.id || ''}
                    onChange={(e) => {
                      const resume = resumes.find((r) => r.id === parseInt(e.target.value));
                      setSelectedResume(resume);
                      if (validationErrors.resume) {
                        setValidationErrors({ ...validationErrors, resume: null });
                      }
                    }}
                  >
                    <option value="">Select a resume...</option>
                    {resumes.map((resume) => (
                      <option key={resume.id} value={resume.id}>
                        {resume.title}
                      </option>
                    ))}
                  </select>
                  {validationErrors.resume && (
                    <p className={styles.errorText}>{validationErrors.resume}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Section 2: Job Details */}
            <div className={styles.formSection}>
              <div className={styles.sectionHeader}>
                <BriefcaseIcon className={styles.sectionIcon} />
                <h2 className={styles.sectionTitle}>Job Details</h2>
              </div>
              <div className={styles.sectionContent}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    Company Name <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="text"
                    className={clsx(
                      styles.input,
                      validationErrors.company && styles.inputError
                    )}
                    placeholder="e.g., Google, Microsoft, Apple"
                    value={jobDetails.company}
                    onChange={(e) => handleFieldChange('company', e.target.value)}
                  />
                  {validationErrors.company && (
                    <p className={styles.errorText}>{validationErrors.company}</p>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    Position Title <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="text"
                    className={clsx(
                      styles.input,
                      validationErrors.position && styles.inputError
                    )}
                    placeholder="e.g., Senior Software Engineer, Product Manager"
                    value={jobDetails.position}
                    onChange={(e) => handleFieldChange('position', e.target.value)}
                  />
                  {validationErrors.position && (
                    <p className={styles.errorText}>{validationErrors.position}</p>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    Job Description <span className={styles.required}>*</span>
                  </label>
                  <p className={styles.helperText}>
                    Paste the full job description to help AI tailor your cover letter
                  </p>
                  <textarea
                    className={clsx(
                      styles.textarea,
                      validationErrors.jobDescription && styles.inputError
                    )}
                    rows="12"
                    placeholder="Paste the complete job description here..."
                    value={jobDetails.jobDescription}
                    onChange={(e) => handleFieldChange('jobDescription', e.target.value)}
                  />
                  <div className={styles.characterCounter}>
                    <span className={clsx(
                      jobDetails.jobDescription.length > jobDescriptionMaxLength && styles.counterError
                    )}>
                      {jobDetails.jobDescription.length} / {jobDescriptionMaxLength}
                    </span>
                  </div>
                  {validationErrors.jobDescription && (
                    <p className={styles.errorText}>{validationErrors.jobDescription}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Section 3: Customization Options */}
            <div className={styles.formSection}>
              <div className={styles.sectionHeader}>
                <AdjustmentsHorizontalIcon className={styles.sectionIcon} />
                <h2 className={styles.sectionTitle}>Customization Options</h2>
              </div>
              <div className={styles.sectionContent}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    Cover Letter Title <span className={styles.optional}>(Optional)</span>
                  </label>
                  <p className={styles.helperText}>
                    Custom title for your cover letter (defaults to Company - Position)
                  </p>
                  <input
                    type="text"
                    className={styles.input}
                    placeholder="e.g., My Application for Senior Developer at TechCorp"
                    value={jobDetails.title}
                    onChange={(e) => handleFieldChange('title', e.target.value)}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    Base Cover Letter <span className={styles.optional}>(Optional)</span>
                  </label>
                  <p className={styles.helperText}>
                    Use an existing cover letter as a starting point
                  </p>
                  <select
                    className={styles.select}
                    value={selectedCoverLetter?.id || ''}
                    onChange={(e) => {
                      const cl = coverLetters.find((c) => c.id === parseInt(e.target.value));
                      setSelectedCoverLetter(cl);
                    }}
                  >
                    <option value="">None - Start fresh</option>
                    {coverLetters.map((cl) => (
                      <option key={cl.id} value={cl.id}>
                        {cl.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    Template <span className={styles.optional}>(Optional)</span>
                  </label>
                  <p className={styles.helperText}>
                    Choose a template style for your cover letter
                  </p>
                  <select
                    className={styles.select}
                    value={selectedTemplate?.id || ''}
                    onChange={(e) => {
                      const t = templates.find((t) => t.id === parseInt(e.target.value));
                      setSelectedTemplate(t);
                    }}
                  >
                    <option value="">None - Standard format</option>
                    {templates.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    Additional Instructions <span className={styles.optional}>(Optional)</span>
                  </label>
                  <p className={styles.helperText}>
                    Any specific requirements or preferences for the AI
                  </p>
                  <textarea
                    className={clsx(
                      styles.textarea,
                      validationErrors.additionalInstructions && styles.inputError
                    )}
                    rows="4"
                    placeholder="e.g., Emphasize my leadership experience, keep it under 300 words, use a formal tone..."
                    value={jobDetails.additionalInstructions}
                    onChange={(e) => handleFieldChange('additionalInstructions', e.target.value)}
                  />
                  <div className={styles.characterCounter}>
                    <span className={clsx(
                      jobDetails.additionalInstructions.length > instructionsMaxLength && styles.counterError
                    )}>
                      {jobDetails.additionalInstructions.length} / {instructionsMaxLength}
                    </span>
                  </div>
                  {validationErrors.additionalInstructions && (
                    <p className={styles.errorText}>{validationErrors.additionalInstructions}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Generate Button */}
            <div className={styles.actionButtons}>
              <button
                className={clsx(
                  styles.generateButton,
                  (isGenerating || isSaving) && styles.buttonDisabled
                )}
                onClick={handleGenerate}
                disabled={isGenerating || isSaving}
              >
                {isGenerating ? (
                  <>
                    <LoadingSpinner size="sm" className={styles.buttonSpinner} />
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <SparklesIcon className={styles.buttonIcon} />
                    <span>Generate with AI</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Panel - Preview */}
        <div className={styles.rightPanel}>
          <div className={styles.previewContainer}>
            <div className={styles.previewHeader}>
              <h3 className={styles.previewTitle}>Preview</h3>
              {generatedContent && (
                <button
                  className={clsx(
                    styles.saveButton,
                    isSaving && styles.buttonDisabled
                  )}
                  onClick={handleSave}
                  disabled={isSaving || isGenerating}
                >
                  {isSaving ? (
                    <>
                      <LoadingSpinner size="sm" className={styles.buttonSpinner} />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircleIcon className={styles.buttonIcon} />
                      <span>Save Cover Letter</span>
                    </>
                  )}
                </button>
              )}
            </div>

            <div className={styles.previewContent}>
              {isGenerating ? (
                <div className={styles.previewLoading}>
                  <LoadingSpinner size="lg" />
                  <p className={styles.previewLoadingText}>
                    AI is generating your cover letter...
                  </p>
                  <p className={styles.previewLoadingSubtext}>
                    This may take 15-30 seconds
                  </p>
                </div>
              ) : generatedContent ? (
                <div className={styles.previewMarkdown}>
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm]}
                    className={styles.markdown}
                  >
                    {generatedContent}
                  </ReactMarkdown>
                </div>
              ) : (
                <div className={styles.previewEmpty}>
                  <DocumentTextIcon className={styles.previewEmptyIcon} />
                  <h4 className={styles.previewEmptyTitle}>No Preview Yet</h4>
                  <p className={styles.previewEmptyText}>
                    Fill in the form on the left and click "Generate with AI" to create your cover letter
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
