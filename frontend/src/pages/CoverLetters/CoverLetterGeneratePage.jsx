import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import { CoverLetterPreview, TemplateSelector } from '../../components/CoverLetters';
import apiService from '../../services/api';
import styles from './CoverLetterGeneratePage.module.css';

export default function CoverLetterGeneratePage() {
  const navigate = useNavigate();

  // Step management
  const [currentStep, setCurrentStep] = useState(1);
  const [totalSteps] = useState(4);

  // Form data
  const [selectedResume, setSelectedResume] = useState(null);
  const [resumes, setResumes] = useState([]);
  const [resumesLoading, setResumesLoading] = useState(false);

  const [jobDetails, setJobDetails] = useState({
    company: '',
    position: '',
    jobDescription: '',
  });

  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [templates, setTemplates] = useState([]);

  const [generatedContent, setGeneratedContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Load resumes on mount
  const loadResumes = async () => {
    try {
      setResumesLoading(true);
      const response = await apiService.getResumes();
      const resumeList = response.resumes || response || [];
      setResumes(resumeList);
      if (resumeList.length > 0 && !selectedResume) {
        setSelectedResume(resumeList[0]);
      }
    } catch (err) {
      setError('Failed to load resumes: ' + err.message);
    } finally {
      setResumesLoading(false);
    }
  };

  // Load templates on mount
  const loadTemplates = async () => {
    try {
      const response = await apiService.getCoverLetterTemplates();
      const templateList = response.templates || [];
      setTemplates(templateList);
      if (templateList.length > 0 && !selectedTemplate) {
        setSelectedTemplate(templateList[0]);
      }
    } catch (err) {
      console.error('Failed to load templates:', err);
      // Use default templates if API fails
    }
  };

  // Handle step transitions
  const handleStepClick = async (step) => {
    if (step < currentStep || step === currentStep) {
      setCurrentStep(step);
      if (step === 1 && resumes.length === 0) {
        await loadResumes();
      }
      if (step === 3 && templates.length === 0) {
        await loadTemplates();
      }
    }
  };

  const handleNextStep = async () => {
    setError(null);

    // Validate current step
    if (currentStep === 1) {
      if (!selectedResume) {
        setError('Please select a resume');
        return;
      }
      if (resumes.length === 0) {
        await loadResumes();
      }
    }

    if (currentStep === 2) {
      if (!jobDetails.company || !jobDetails.position) {
        setError('Please fill in company and position');
        return;
      }
    }

    if (currentStep === 3) {
      if (!selectedTemplate) {
        setError('Please select a template');
        return;
      }
      // Generate cover letter
      await handleGenerateCoverLetter();
      return;
    }

    // Move to next step
    const nextStep = currentStep + 1;
    setCurrentStep(nextStep);

    // Preload data for next steps
    if (nextStep === 1 && resumes.length === 0) {
      await loadResumes();
    }
    if (nextStep === 3 && templates.length === 0) {
      await loadTemplates();
    }
  };

  const handleGenerateCoverLetter = async () => {
    try {
      setIsGenerating(true);
      setError(null);

      // Get resume content
      let resumeContent = '';
      if (selectedResume && selectedResume.versions && selectedResume.versions.length > 0) {
        resumeContent = selectedResume.versions[0].markdown_content || '';
      }

      const response = await apiService.generateCoverLetter({
        resume_id: selectedResume.id,
        resume_content: resumeContent,
        company: jobDetails.company,
        position: jobDetails.position,
        job_description: jobDetails.jobDescription,
        template_id: selectedTemplate?.id,
      });

      setGeneratedContent(response.content || '');
      setCurrentStep(4);
    } catch (err) {
      setError('Failed to generate cover letter: ' + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveCoverLetter = async () => {
    try {
      setIsGenerating(true);
      setError(null);

      const response = await apiService.createCoverLetter({
        title: `${jobDetails.company} - ${jobDetails.position}`,
        company: jobDetails.company,
        position: jobDetails.position,
        content: generatedContent,
      });

      setSuccessMessage('Cover letter saved successfully!');
      setTimeout(() => {
        navigate(`/cover-letters/${response.id}/edit`);
      }, 1500);
    } catch (err) {
      setError('Failed to save cover letter: ' + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEditCoverLetter = () => {
    // Create a temporary cover letter and redirect to editor
    navigate('/cover-letters/new', {
      state: {
        initialContent: generatedContent,
        initialTitle: `${jobDetails.company} - ${jobDetails.position}`,
        initialCompany: jobDetails.company,
        initialPosition: jobDetails.position,
      },
    });
  };

  const handleBackStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setError(null);
    }
  };

  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel? Any unsaved changes will be lost.')) {
      navigate('/cover-letters');
    }
  };

  const steps = [
    { number: 1, title: 'Select Resume', description: 'Choose a resume to use' },
    { number: 2, title: 'Job Details', description: 'Enter job information' },
    { number: 3, title: 'Select Template', description: 'Choose a template style' },
    { number: 4, title: 'Review & Save', description: 'Review and save' },
  ];

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Generate Cover Letter with AI</h1>
          <p className={styles.subtitle}>
            Create a tailored cover letter in 4 simple steps
          </p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className={styles.errorAlert}>
          <div className={styles.errorContent}>
            <svg className={styles.errorIcon} viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <p className={styles.errorText}>{error}</p>
            <button
              onClick={() => setError(null)}
              className={styles.errorClose}
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Success Message */}
      {successMessage && (
        <div className={styles.successAlert}>
          <div className={styles.successContent}>
            <svg className={styles.successIcon} viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <p className={styles.successText}>{successMessage}</p>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className={styles.mainContent}>
        {/* Step Indicator */}
        <div className={styles.stepsContainer}>
          <div className={styles.stepsWrapper}>
            {steps.map((step, index) => (
              <div key={step.number}>
                <button
                  onClick={() => handleStepClick(step.number)}
                  disabled={step.number > currentStep}
                  className={clsx(
                    styles.stepButton,
                    step.number === currentStep && styles.stepButtonActive,
                    step.number < currentStep && styles.stepButtonCompleted,
                    step.number > currentStep && styles.stepButtonDisabled
                  )}
                >
                  <div className={styles.stepNumber}>
                    {step.number < currentStep ? '✓' : step.number}
                  </div>
                  <div className={styles.stepLabel}>
                    <div className={styles.stepTitle}>{step.title}</div>
                    <div className={styles.stepDescription}>{step.description}</div>
                  </div>
                </button>
                {index < steps.length - 1 && (
                  <div
                    className={clsx(
                      styles.stepConnector,
                      step.number < currentStep && styles.stepConnectorActive
                    )}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className={styles.stepContent}>
          {/* Step 1: Select Resume */}
          {currentStep === 1 && (
            <div className={styles.stepPanel}>
              <h2 className={styles.stepTitle}>Select a Resume</h2>
              <p className={styles.stepDescription}>
                Choose which resume to base your cover letter on
              </p>

              {resumesLoading ? (
                <div className={styles.loadingContainer}>
                  <LoadingSpinner size="lg" />
                </div>
              ) : resumes.length === 0 ? (
                <div className={styles.emptyState}>
                  <p>No resumes found. Please create a resume first.</p>
                </div>
              ) : (
                <div className={styles.resumeGrid}>
                  {resumes.map((resume) => (
                    <div
                      key={resume.id}
                      onClick={() => setSelectedResume(resume)}
                      className={clsx(
                        styles.resumeCard,
                        selectedResume?.id === resume.id && styles.resumeCardSelected
                      )}
                    >
                      <div className={styles.resumeCardContent}>
                        <h3 className={styles.resumeTitle}>
                          {resume.title || 'Untitled Resume'}
                        </h3>
                        <p className={styles.resumeDescription}>
                          {resume.description || 'No description'}
                        </p>
                        <div className={styles.resumeMeta}>
                          {resume.versions?.length || 1} version{(resume.versions?.length || 1) !== 1 ? 's' : ''}
                        </div>
                      </div>
                      {selectedResume?.id === resume.id && (
                        <div className={styles.checkmark}>✓</div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 2: Job Details */}
          {currentStep === 2 && (
            <div className={styles.stepPanel}>
              <h2 className={styles.stepTitle}>Enter Job Details</h2>
              <p className={styles.stepDescription}>
                Tell us about the position you're applying for
              </p>

              <form className={styles.form}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Company Name *</label>
                  <input
                    type="text"
                    className={styles.input}
                    value={jobDetails.company}
                    onChange={(e) => setJobDetails({ ...jobDetails, company: e.target.value })}
                    placeholder="e.g., Acme Corporation"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Position Title *</label>
                  <input
                    type="text"
                    className={styles.input}
                    value={jobDetails.position}
                    onChange={(e) => setJobDetails({ ...jobDetails, position: e.target.value })}
                    placeholder="e.g., Senior Software Engineer"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Job Description (Optional)</label>
                  <textarea
                    className={styles.textarea}
                    value={jobDetails.jobDescription}
                    onChange={(e) => setJobDetails({ ...jobDetails, jobDescription: e.target.value })}
                    placeholder="Paste the job description here to help tailor the cover letter..."
                    rows={8}
                  />
                  <p className={styles.helperText}>
                    Providing the job description helps create a more tailored cover letter
                  </p>
                </div>
              </form>
            </div>
          )}

          {/* Step 3: Select Template */}
          {currentStep === 3 && (
            <div className={styles.stepPanel}>
              <h2 className={styles.stepTitle}>Select a Template</h2>
              <p className={styles.stepDescription}>
                Choose a template style for your cover letter
              </p>

              <TemplateSelector
                templates={templates}
                selectedTemplate={selectedTemplate}
                onSelect={setSelectedTemplate}
                displayMode="grid"
              />
            </div>
          )}

          {/* Step 4: Review & Save */}
          {currentStep === 4 && (
            <div className={styles.stepPanel}>
              <h2 className={styles.stepTitle}>Review Your Cover Letter</h2>
              <p className={styles.stepDescription}>
                Review the generated cover letter and make any adjustments
              </p>

              <div className={styles.reviewContainer}>
                <div className={styles.previewSection}>
                  <CoverLetterPreview content={generatedContent} />
                </div>

                <div className={styles.jobDetailsBox}>
                  <h3 className={styles.detailsTitle}>Job Details</h3>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Company:</span>
                    <span className={styles.detailValue}>{jobDetails.company}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Position:</span>
                    <span className={styles.detailValue}>{jobDetails.position}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Resume:</span>
                    <span className={styles.detailValue}>{selectedResume?.title}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className={styles.actions}>
          <button
            onClick={handleCancel}
            className={styles.cancelButton}
          >
            Cancel
          </button>

          {currentStep > 1 && (
            <button
              onClick={handleBackStep}
              className={styles.backButton}
            >
              Back
            </button>
          )}

          {currentStep < 4 && (
            <button
              onClick={handleNextStep}
              disabled={isGenerating}
              className={clsx(styles.nextButton, isGenerating && styles.buttonDisabled)}
            >
              {isGenerating ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  {currentStep === 3 ? 'Generate' : 'Next'}
                  <svg className={styles.buttonIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </>
              )}
            </button>
          )}

          {currentStep === 4 && (
            <>
              <button
                onClick={handleEditCoverLetter}
                className={styles.editButton}
              >
                Edit
              </button>
              <button
                onClick={handleSaveCoverLetter}
                disabled={isGenerating}
                className={clsx(styles.saveButton, isGenerating && styles.buttonDisabled)}
              >
                {isGenerating ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    Save Cover Letter
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
