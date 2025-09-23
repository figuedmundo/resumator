import { useState, useEffect } from 'react';
import clsx from 'clsx';
import LoadingSpinner from '../../../components/LoadingSpinner/LoadingSpinner';
import AIProgressIndicator from './AIProgressIndicator';
import { MAX_FILE_SIZE } from '../../../utils/constants';
import styles from './ResumeCustomizer.module.css';

export default function ResumeCustomizer({ 
  resume, 
  onCustomizationComplete, 
  onError,
  isLoading,
  className = '' 
}) {
  const [jobDescription, setJobDescription] = useState('');
  const [customInstructions, setCustomInstructions] = useState('');
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [errors, setErrors] = useState({});
  
  // AI Progress state
  const [aiStage, setAiStage] = useState('analyzing');
  const [aiProgress, setAiProgress] = useState(0);
  const [aiMessage, setAiMessage] = useState('');

  // Clear errors when inputs change
  useEffect(() => {
    if (errors.jobDescription && jobDescription.trim()) {
      setErrors(prev => ({ ...prev, jobDescription: null }));
    }
    if (errors.size && jobDescription.length <= MAX_FILE_SIZE.JOB_DESCRIPTION) {
      setErrors(prev => ({ ...prev, size: null }));
    }
  }, [jobDescription, errors]);

  const validateInputs = () => {
    const newErrors = {};

    if (!jobDescription.trim()) {
      newErrors.jobDescription = 'Job description is required';
    }

    if (jobDescription.length > MAX_FILE_SIZE.JOB_DESCRIPTION) {
      newErrors.size = `Job description is too long. Maximum ${Math.floor(MAX_FILE_SIZE.JOB_DESCRIPTION / 1024)}KB allowed.`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const simulateAIProgress = () => {
    const stages = [
      { stage: 'analyzing', duration: 8000, message: 'Reading job requirements and keywords' },
      { stage: 'customizing', duration: 15000, message: 'Matching your experience to job requirements' },
      { stage: 'generating', duration: 12000, message: 'Optimizing content for ATS systems' },
      { stage: 'finalizing', duration: 5000, message: 'Applying final formatting and improvements' }
    ];

    let currentStageIndex = 0;
    let stageProgress = 0;
    const totalDuration = stages.reduce((sum, stage) => sum + stage.duration, 0);
    let elapsedTime = 0;

    const updateProgress = () => {
      if (currentStageIndex >= stages.length) return;
      
      const currentStage = stages[currentStageIndex];
      setAiStage(currentStage.stage);
      setAiMessage(currentStage.message);
      
      stageProgress += 100;
      elapsedTime += 100;
      
      // Calculate overall progress
      const overallProgress = Math.min((elapsedTime / totalDuration) * 100, 95);
      setAiProgress(overallProgress);
      
      // Move to next stage when current stage duration is reached
      if (stageProgress >= currentStage.duration) {
        currentStageIndex++;
        stageProgress = 0;
      }
      
      if (currentStageIndex < stages.length) {
        setTimeout(updateProgress, 100);
      }
    };

    updateProgress();
  };

  const handleCustomize = async () => {
    if (!validateInputs()) {
      return;
    }

    try {
      setIsCustomizing(true);
      setErrors({});
      setAiProgress(0);
      
      // Start AI progress simulation
      simulateAIProgress();

      const options = {};
      if (customInstructions.trim()) {
        options.custom_instructions = customInstructions.trim();
      }

      await onCustomizationComplete({
        jobDescription: jobDescription.trim(),
        options
      });

      // Complete the progress
      setAiProgress(100);
      setAiStage('finalizing');
      setAiMessage('Customization complete!');
      
      // Clear form after successful customization
      setTimeout(() => {
        setJobDescription('');
        setCustomInstructions('');
      }, 1000);
      
    } catch (error) {
      onError?.(error.message || 'Failed to customize VersionComparison');
    } finally {
      setIsCustomizing(false);
    }
  };

  const handlePasteJobDescription = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text.trim()) {
        setJobDescription(text.trim());
      }
    } catch (error) {
      // Clipboard access might be denied, silently ignore
      console.warn('Could not access clipboard:', error);
    }
  };

  const characterCount = jobDescription.length;
  const maxChars = MAX_FILE_SIZE.JOB_DESCRIPTION;
  const isNearLimit = characterCount > maxChars * 0.8;
  const isOverLimit = characterCount > maxChars;

  if (isLoading) {
    return (
      <div className={clsx(styles.loadingContainer, className)}>
        <div className={styles.loadingContent}>
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  return (
    <>
      {/* AI Progress Indicator */}
      <AIProgressIndicator 
        isActive={isCustomizing}
        stage={aiStage}
        message={aiMessage}
        progress={aiProgress}
      />
      
      <div className={clsx(styles.container, className)}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerText}>
            <h2>
              AI Resume Customization
            </h2>
            <p>
              Tailor your resume to match a specific job description using AI
            </p>
          </div>
          <div className={styles.headerInfo}>
            <svg className={styles.headerIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>AI-powered customization</span>
          </div>
        </div>
      </div>

      <div className={styles.content}>
        {/* Job Description Input */}
        <div className={styles.inputGroup}>
          <div className={styles.inputHeader}>
            <label htmlFor="job-description" className={styles.inputLabel}>
              Job Description *
            </label>
            <button
              onClick={handlePasteJobDescription}
              className={styles.pasteButton}
              title="Paste from clipboard"
            >
              <svg className={styles.pasteIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <span>Paste</span>
            </button>
          </div>
          
          <textarea
            id="job-description"
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the job description here. Include key requirements, responsibilities, and qualifications..."
            rows={10}
            className={clsx(
              styles.textarea,
              errors.jobDescription || errors.size
                ? styles.textareaError
                : styles.textareaDefault
            )}
          />
          
          {/* Character count */}
          <div className={styles.inputFooter}>
            <div className={styles.errorMessages}>
              {errors.jobDescription && (
                <p className={styles.errorText}>{errors.jobDescription}</p>
              )}
              {errors.size && (
                <p className={styles.errorText}>{errors.size}</p>
              )}
            </div>
            <div className={clsx(
              styles.characterCount,
              isOverLimit ? styles.characterCountError : 
              isNearLimit ? styles.characterCountWarning : 
              styles.characterCountNormal
            )}>
              {characterCount.toLocaleString()} / {maxChars.toLocaleString()} characters
            </div>
          </div>
        </div>

        {/* Custom Instructions */}
        <div className={styles.customInstructions}>
          <label htmlFor="custom-instructions" className={styles.inputLabel}>
            Additional Instructions (Optional)
          </label>
          <textarea
            id="custom-instructions"
            value={customInstructions}
            onChange={(e) => setCustomInstructions(e.target.value)}
            placeholder="Add specific instructions for customization (e.g., 'Focus on highlighting leadership experience' or 'Emphasize technical skills')..."
            rows={3}
            className={styles.customTextarea}
          />
          <p className={styles.helperText}>
            Provide specific guidance on what aspects to emphasize or how to tailor the resume.
          </p>
        </div>

        {/* Resume Info */}
        {resume && (
          <div className={styles.resumeInfo}>
            <div className={styles.resumeContent}>
              <div className={styles.resumeIcon}>
                <svg className={styles.resumeIconSvg} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className={styles.resumeDetails}>
                <p className={styles.resumeTitle}>
                  {resume.title}
                </p>
                <p className={styles.resumeMeta}>
                  {resume.content ? `${resume.content.length} characters` : 'No content'} • 
                  Last updated {new Date(resume.updated_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className={styles.actionSection}>
          <button
            onClick={handleCustomize}
            disabled={isCustomizing || !jobDescription.trim() || isOverLimit}
            className={styles.customizeButton}
          >
            {isCustomizing ? (
              <>
                <LoadingSpinner size="sm" className={styles.buttonSpinner} />
                <span>Customizing Resume...</span>
              </>
            ) : (
              <>
                <svg className={styles.buttonIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>Customize Resume</span>
              </>
            )}
          </button>
        </div>

        {/* Tips */}
        <div className={styles.tipsSection}>
          <div className={styles.tipsContainer}>
            <div className={styles.tipsIcon}>
              <svg className={styles.tipsIconSvg} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className={styles.tipsContent}>
              <h4 className={styles.tipsTitle}>Tips for better results:</h4>
              <div className={styles.tipsList}>
                <ul className={styles.tipsListUl}>
                  <li>Include complete job descriptions with requirements and responsibilities</li>
                  <li>Paste the full job posting text for comprehensive matching</li>
                  <li>Use specific instructions to highlight particular skills or experiences</li>
                  <li>Review the customized version and make manual adjustments as needed</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </>
  );
}