import { useState, useEffect } from 'react';
import LoadingSpinner from '../common/LoadingSpinner';
import AIProgressIndicator from './AIProgressIndicator';
import { MAX_FILE_SIZE } from '../../utils/constants';

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
      onError?.(error.message || 'Failed to customize resume');
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
      <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
        <div className="flex items-center justify-center py-12">
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
      
      <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              AI Resume Customization
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Tailor your resume to match a specific job description using AI
            </p>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>AI-powered customization</span>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Job Description Input */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label htmlFor="job-description" className="block text-sm font-medium text-gray-700">
              Job Description *
            </label>
            <button
              onClick={handlePasteJobDescription}
              className="text-xs text-blue-600 hover:text-blue-800 transition-colors duration-200 flex items-center space-x-1"
              title="Paste from clipboard"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            className={`w-full px-4 py-3 border rounded-lg resize-vertical transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.jobDescription || errors.size
                ? 'border-red-300 bg-red-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
          />
          
          {/* Character count */}
          <div className="flex justify-between items-center mt-2">
            <div className="space-y-1">
              {errors.jobDescription && (
                <p className="text-sm text-red-600">{errors.jobDescription}</p>
              )}
              {errors.size && (
                <p className="text-sm text-red-600">{errors.size}</p>
              )}
            </div>
            <div className={`text-xs ${
              isOverLimit ? 'text-red-600' : isNearLimit ? 'text-yellow-600' : 'text-gray-500'
            }`}>
              {characterCount.toLocaleString()} / {maxChars.toLocaleString()} characters
            </div>
          </div>
        </div>

        {/* Custom Instructions */}
        <div>
          <label htmlFor="custom-instructions" className="block text-sm font-medium text-gray-700 mb-3">
            Additional Instructions (Optional)
          </label>
          <textarea
            id="custom-instructions"
            value={customInstructions}
            onChange={(e) => setCustomInstructions(e.target.value)}
            placeholder="Add specific instructions for customization (e.g., 'Focus on highlighting leadership experience' or 'Emphasize technical skills')..."
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-vertical hover:border-gray-400 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-2">
            Provide specific guidance on what aspects to emphasize or how to tailor the resume.
          </p>
        </div>

        {/* Resume Info */}
        {resume && (
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {resume.title}
                </p>
                <p className="text-xs text-gray-500">
                  {resume.content ? `${resume.content.length} characters` : 'No content'} • 
                  Last updated {new Date(resume.updated_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="flex justify-end pt-4 border-t border-gray-200">
          <button
            onClick={handleCustomize}
            disabled={isCustomizing || !jobDescription.trim() || isOverLimit}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {isCustomizing ? (
              <>
                <LoadingSpinner size="sm" className="mr-3" />
                <span>Customizing Resume...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>Customize Resume</span>
              </>
            )}
          </button>
        </div>

        {/* Tips */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-3">
              <h4 className="text-sm font-medium text-blue-800">Tips for better results:</h4>
              <div className="mt-2 text-sm text-blue-700">
                <ul className="list-disc list-inside space-y-1">
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