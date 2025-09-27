/**
 * Enhanced error handling utility for better error message display
 */
export function getDetailedErrorMessage(error) {
  if (typeof error === 'string') return error;
  
  // Check for detailed error in response data
  if (error?.response?.data?.detail) {
    const detail = error.response.data.detail;
    
    // If the detail contains nested error information, extract the most meaningful part
    if (typeof detail === 'string') {
      // Look for patterns like "422: Failed to customize resume: 503: Resume customization failed: 'Stream' object has no attribute 'choices'"
      const resumeCustomizationMatch = detail.match(/Resume customization failed: (.+)$/);
      if (resumeCustomizationMatch) {
        return `Resume customization failed: ${resumeCustomizationMatch[1]}`;
      }
      
      // Look for other specific error patterns
      const aiErrorMatch = detail.match(/AI service error: (.+)$/i);
      if (aiErrorMatch) {
        return `AI service is currently unavailable: ${aiErrorMatch[1]}`;
      }
      
      const validationErrorMatch = detail.match(/Validation error: (.+)$/i);
      if (validationErrorMatch) {
        return `Input validation failed: ${validationErrorMatch[1]}`;
      }
      
      // Look for cover letter generation errors
      const coverLetterMatch = detail.match(/Cover letter generation failed: (.+)$/);
      if (coverLetterMatch) {
        return `Cover letter generation failed: ${coverLetterMatch[1]}`;
      }
      
      // Look for resume upload/parsing errors
      const uploadErrorMatch = detail.match(/Failed to (upload|parse) resume: (.+)$/);
      if (uploadErrorMatch) {
        return `Resume ${uploadErrorMatch[1]} failed: ${uploadErrorMatch[2]}`;
      }
      
      // Return the original detail if no specific pattern is found
      return detail;
    }
    
    return detail;
  }
  
  // Fallback to other error properties
  if (error?.response?.data?.message) return error.response.data.message;
  if (error?.message) return error.message;
  
  // HTTP status-specific messages
  if (error?.response?.status) {
    switch (error.response.status) {
      case 400:
        return 'Invalid request. Please check your input and try again.';
      case 401:
        return 'Authentication required. Please log in and try again.';
      case 403:
        return 'You do not have permission to perform this action.';
      case 404:
        return 'The requested resource was not found.';
      case 422:
        return 'The data provided could not be processed. Please check your input.';
      case 429:
        return 'Too many requests. Please wait a moment and try again.';
      case 500:
        return 'Server error. Please try again later.';
      case 502:
        return 'Service temporarily unavailable. Please try again later.';
      case 503:
        return 'Service temporarily unavailable. Please try again later.';
      case 504:
        return 'Request timeout. Please try again later.';
      default:
        return `Request failed with status code ${error.response.status}`;
    }
  }
  
  return 'An unexpected error occurred. Please try again.';
}

/**
 * Specific error handler for AI service errors
 */
export function handleAIServiceError(error) {
  const message = getDetailedErrorMessage(error);
  
  // Check if it's an AI service related error with specific patterns
  if (message.toLowerCase().includes('stream') && message.toLowerCase().includes('choices')) {
    return 'AI service is currently experiencing issues. This might be due to API changes or temporary unavailability. Please try again in a few moments.';
  }
  
  if (message.toLowerCase().includes('stream') && message.toLowerCase().includes('attribute')) {
    return 'AI service configuration issue detected. The service may be updating. Please try again in a few minutes.';
  }
  
  if (message.toLowerCase().includes('api key') || message.toLowerCase().includes('authentication')) {
    return 'AI service authentication failed. Please contact support if this issue persists.';
  }
  
  if (message.toLowerCase().includes('rate limit') || message.toLowerCase().includes('quota')) {
    return 'AI service rate limit exceeded. Please wait a few minutes and try again.';
  }
  
  if (message.toLowerCase().includes('model') && message.toLowerCase().includes('not found')) {
    return 'AI model is currently unavailable. Please try again later or contact support.';
  }
  
  if (message.toLowerCase().includes('timeout') || message.toLowerCase().includes('timed out')) {
    return 'AI service is taking longer than usual. Please try again with a shorter job description or resume.';
  }
  
  if (message.toLowerCase().includes('content too long') || message.toLowerCase().includes('token limit')) {
    return 'Your resume or job description is too long. Please try with shorter content.';
  }
  
  return message;
}

/**
 * Specific error handler for validation errors
 */
export function handleValidationError(error) {
  const message = getDetailedErrorMessage(error);
  
  // Common validation patterns
  if (message.toLowerCase().includes('job description')) {
    if (message.toLowerCase().includes('required') || message.toLowerCase().includes('empty')) {
      return 'Please provide a job description to customize your resume.';
    }
    if (message.toLowerCase().includes('too long')) {
      return 'Job description is too long. Please provide a shorter description.';
    }
    return 'Please provide a valid job description.';
  }
  
  if (message.toLowerCase().includes('resume content') || message.toLowerCase().includes('markdown')) {
    if (message.toLowerCase().includes('empty') || message.toLowerCase().includes('required')) {
      return 'Resume content appears to be empty. Please upload a valid resume.';
    }
    return 'Resume content appears to be invalid. Please check your resume format.';
  }
  
  if (message.toLowerCase().includes('file format') || message.toLowerCase().includes('unsupported')) {
    return 'Unsupported file format. Please upload a PDF, DOC, or DOCX file.';
  }
  
  if (message.toLowerCase().includes('file size') || message.toLowerCase().includes('too large')) {
    return 'File is too large. Please upload a file smaller than 10MB.';
  }
  
  if (message.toLowerCase().includes('title')) {
    return 'Please provide a valid title for your resume.';
  }
  
  return message;
}

/**
 * Specific error handler for authentication errors
 */
export function handleAuthError(error) {
  const message = getDetailedErrorMessage(error);
  
  if (error?.response?.status === 401) {
    if (message.toLowerCase().includes('token')) {
      return 'Your session has expired. Please log in again.';
    }
    return 'Authentication failed. Please check your credentials and try again.';
  }
  
  if (error?.response?.status === 403) {
    return 'You do not have permission to access this resource.';
  }
  
  return message;
}

/**
 * Specific error handler for network/connectivity errors
 */
export function handleNetworkError(error) {
  if (!error?.response) {
    if (error?.code === 'NETWORK_ERROR' || error?.message?.includes('Network Error')) {
      return 'Network connection failed. Please check your internet connection and try again.';
    }
    
    if (error?.code === 'ECONNABORTED' || error?.message?.includes('timeout')) {
      return 'Request timed out. Please try again.';
    }
    
    return 'Unable to connect to the server. Please check your connection and try again.';
  }
  
  return getDetailedErrorMessage(error);
}

/**
 * Main error handler that routes to specific handlers based on error type
 */
export function handleError(error, context = 'general') {
  // Log error for debugging (only in development)
  if (process.env.NODE_ENV === 'development') {
    console.error('Error details:', error);
  }
  
  // Handle network errors first
  if (!error?.response) {
    return handleNetworkError(error);
  }
  
  // Route to specific handlers based on context
  switch (context) {
    case 'ai':
    case 'customize':
    case 'cover-letter':
      return handleAIServiceError(error);
      
    case 'validation':
    case 'upload':
    case 'form':
      return handleValidationError(error);
      
    case 'auth':
    case 'login':
    case 'register':
      return handleAuthError(error);
      
    default:
      return getDetailedErrorMessage(error);
  }
}

/**
 * Error notification helper
 */
export function createErrorNotification(error, context = 'general') {
  const message = handleError(error, context);
  
  return {
    type: 'error',
    title: getErrorTitle(error, context),
    message,
    duration: getErrorDuration(error),
    actions: getErrorActions(error, context)
  };
}

/**
 * Get appropriate error title based on context
 */
function getErrorTitle(error, context) {
  const status = error?.response?.status;
  
  switch (context) {
    case 'ai':
    case 'customize':
      return 'AI Customization Failed';
    case 'cover-letter':
      return 'Cover Letter Generation Failed';
    case 'upload':
      return 'File Upload Failed';
    case 'auth':
      return status === 401 ? 'Authentication Failed' : 'Authorization Error';
    case 'validation':
      return 'Validation Error';
    default:
      return status >= 500 ? 'Server Error' : 'Operation Failed';
  }
}

/**
 * Get appropriate error display duration
 */
function getErrorDuration(error) {
  const status = error?.response?.status;
  
  // Longer duration for important errors
  if (status === 401 || status === 403) return 10000; // 10 seconds
  if (status >= 500) return 8000; // 8 seconds
  
  return 6000; // 6 seconds default
}

/**
 * Get appropriate error actions based on error type
 */
function getErrorActions(error, context) {
  const status = error?.response?.status;
  const actions = [];
  
  if (status === 401) {
    actions.push({
      label: 'Login',
      action: () => window.location.href = '/login'
    });
  }
  
  if (context === 'ai' || context === 'customize') {
    actions.push({
      label: 'Retry',
      action: 'retry'
    });
  }
  
  if (status >= 500) {
    actions.push({
      label: 'Contact Support',
      action: () => window.open('mailto:support@resumator.com', '_blank')
    });
  }
  
  return actions;
}