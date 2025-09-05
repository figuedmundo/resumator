import { useState, useEffect } from 'react';
import LoadingSpinner from '../common/LoadingSpinner';

export default function AIProgressIndicator({ 
  isActive = false, 
  stage = 'analyzing', // 'analyzing', 'customizing', 'generating', 'finalizing'
  message = '',
  progress = 0, // 0-100
  className = ''
}) {
  const [dots, setDots] = useState('');

  // Animate dots for loading effect
  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      setDots(prev => {
        if (prev === '...') return '';
        return prev + '.';
      });
    }, 500);

    return () => clearInterval(interval);
  }, [isActive]);

  const getStageInfo = () => {
    switch (stage) {
      case 'analyzing':
        return {
          icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          ),
          title: 'Analyzing Job Description',
          defaultMessage: 'Reading and understanding the job requirements'
        };
      case 'customizing':
        return {
          icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          ),
          title: 'Customizing Resume',
          defaultMessage: 'Tailoring your resume to match the job description'
        };
      case 'generating':
        return {
          icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a1 1 0 01-1-1V9a1 1 0 011-1h1a2 2 0 100-4H4a1 1 0 01-1-1V4a1 1 0 011-1h3a1 1 0 011 1v1z" />
            </svg>
          ),
          title: 'Generating Content',
          defaultMessage: 'Creating optimized content sections'
        };
      case 'finalizing':
        return {
          icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ),
          title: 'Finalizing Resume',
          defaultMessage: 'Applying final touches and formatting'
        };
      default:
        return {
          icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          ),
          title: 'Processing',
          defaultMessage: 'Working on your resume'
        };
    }
  };

  if (!isActive) return null;

  const stageInfo = getStageInfo();
  const displayMessage = message || stageInfo.defaultMessage;

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${className}`}>
      <div className="bg-white rounded-xl shadow-xl p-8 m-4 max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <div className="text-blue-600 animate-pulse">
              {stageInfo.icon}
            </div>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {stageInfo.title}
          </h3>
          <p className="text-sm text-gray-600">
            {displayMessage}{dots}
          </p>
        </div>

        {/* Progress Bar */}
        {progress > 0 && (
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-blue-600 h-3 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Spinner */}
        <div className="flex justify-center">
          <LoadingSpinner size="lg" />
        </div>

        {/* Tips */}
        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h4 className="text-sm font-medium text-blue-800 mb-2">
            💡 Did you know?
          </h4>
          <p className="text-sm text-blue-700">
            {getTip(stage)}
          </p>
        </div>

        {/* Cancel button - optional */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            This usually takes 30-60 seconds
          </p>
        </div>
      </div>
    </div>
  );
}

function getTip(stage) {
  const tips = {
    analyzing: "AI is scanning the job description to identify key skills, requirements, and keywords that should be emphasized in your resume.",
    customizing: "Your resume content is being intelligently restructured to better align with the job requirements while maintaining your unique experience.",
    generating: "New content sections are being generated to highlight relevant experience and skills that match the job posting.",
    finalizing: "Final optimizations are being applied to ensure your resume passes ATS systems and catches recruiter attention."
  };

  return tips[stage] || "AI is working to create the best possible version of your resume for this specific job opportunity.";
}