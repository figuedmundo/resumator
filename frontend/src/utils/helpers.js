import { format, formatDistanceToNow, isValid, parseISO } from 'date-fns';
import { clsx } from 'clsx';
import { REGEX, VALIDATION_MESSAGES } from './constants';

/**
 * Combine class names conditionally
 */
export function cn(...inputs) {
  return clsx(inputs);
}

/**
 * Format date with various options
 */
export function formatDate(date, formatStr = 'MMM dd, yyyy') {
  if (!date) return '';
  
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  
  if (!isValid(parsedDate)) return '';
  
  if (formatStr === 'relative') {
    return formatDistanceToNow(parsedDate, { addSuffix: true });
  }
  
  return format(parsedDate, formatStr);
}

/**
 * Truncate text to specified length
 */
export function truncateText(text, maxLength = 100, suffix = '...') {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + suffix;
}

/**
 * Extract plain text from markdown
 */
export function extractPlainText(markdown) {
  if (!markdown) return '';
  
  return markdown
    .replace(/#{1,6}\s+/g, '') // Remove headers
    .replace(/\*{1,2}(.*?)\*{1,2}/g, '$1') // Remove bold/italic
    .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Remove links
    .replace(/`(.*?)`/g, '$1') // Remove inline code
    .replace(/```[\s\S]*?```/g, '') // Remove code blocks
    .replace(/^\s*[-*+]\s+/gm, '') // Remove list markers
    .replace(/^\s*\d+\.\s+/gm, '') // Remove numbered list markers
    .replace(/\n{2,}/g, '\n') // Collapse multiple newlines
    .trim();
}

/**
 * Generate initials from full name
 */
export function getInitials(name) {
  if (!name) return '';
  
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
}

/**
 * Validate email format
 */
export function validateEmail(email) {
  if (!email) return VALIDATION_MESSAGES.REQUIRED_FIELD;
  if (!REGEX.EMAIL.test(email)) return VALIDATION_MESSAGES.INVALID_EMAIL;
  return null;
}

/**
 * Validate username format
 */
export function validateUsername(username) {
  if (!username) return VALIDATION_MESSAGES.REQUIRED_FIELD;
  if (!REGEX.USERNAME.test(username)) return VALIDATION_MESSAGES.INVALID_USERNAME;
  return null;
}

/**
 * Validate password strength
 */
export function validatePassword(password) {
  if (!password) return VALIDATION_MESSAGES.REQUIRED_FIELD;
  if (!REGEX.PASSWORD.test(password)) return VALIDATION_MESSAGES.WEAK_PASSWORD;
  return null;
}

/**
 * Validate password confirmation
 */
export function validatePasswordConfirm(password, confirmPassword) {
  if (!confirmPassword) return VALIDATION_MESSAGES.REQUIRED_FIELD;
  if (password !== confirmPassword) return VALIDATION_MESSAGES.PASSWORDS_DONT_MATCH;
  return null;
}

/**
 * Generate random ID
 */
export function generateId() {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

/**
 * Debounce function
 */
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function
 */
export function throttle(func, limit) {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Download file from blob
 */
export function downloadBlob(blob, filename) {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}

/**
 * Format file size
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      document.execCommand('copy');
      textArea.remove();
      return true;
    } catch (err) {
      textArea.remove();
      return false;
    }
  }
}

/**
 * Check if string is valid JSON
 */
export function isValidJSON(str) {
  try {
    JSON.parse(str);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Safe JSON parse
 */
export function safeJSONParse(str, fallback = null) {
  try {
    return JSON.parse(str);
  } catch (e) {
    return fallback;
  }
}

/**
 * Calculate reading time for text
 */
export function calculateReadingTime(text, wordsPerMinute = 200) {
  if (!text) return 0;
  
  const wordCount = text.trim().split(/\s+/).length;
  const minutes = Math.ceil(wordCount / wordsPerMinute);
  
  return minutes;
}

/**
 * Generate random color for avatars
 */
export function generateAvatarColor(name) {
  const colors = [
    'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500',
    'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500'
  ];
  
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  return colors[Math.abs(hash) % colors.length];
}

/**
 * Escape HTML
 */
export function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Get error message from error object
 */
export function getErrorMessage(error) {
  if (typeof error === 'string') return error;
  if (error?.response?.data?.detail) return error.response.data.detail;
  if (error?.response?.data?.message) return error.response.data.message;
  if (error?.message) return error.message;
  return 'An unexpected error occurred';
}

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
      const match = detail.match(/Resume customization failed: (.+)$/);
      if (match) {
        return `Resume customization failed: ${match[1]}`;
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
      case 503:
        return 'Service temporarily unavailable. Please try again later.';
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
  
  // Check if it's an AI service related error
  if (message.toLowerCase().includes('stream') && message.toLowerCase().includes('choices')) {
    return 'AI service is currently experiencing issues. This might be due to API changes or temporary unavailability. Please try again in a few moments.';
  }
  
  if (message.toLowerCase().includes('api key') || message.toLowerCase().includes('authentication')) {
    return 'AI service authentication failed. Please contact support.';
  }
  
  if (message.toLowerCase().includes('rate limit') || message.toLowerCase().includes('quota')) {
    return 'AI service rate limit exceeded. Please wait a few minutes and try again.';
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
    return 'Please provide a valid job description.';
  }
  
  if (message.toLowerCase().includes('resume content') || message.toLowerCase().includes('markdown')) {
    return 'Resume content appears to be invalid or empty.';
  }
  
  return message;
}

/**
 * Check if current environment is development
 */
export function isDevelopment() {
  return import.meta.env.DEV;
}

/**
 * Log only in development
 */
export function devLog(...args) {
  if (isDevelopment()) {
    console.log(...args);
  }
}
