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
 * Check if current environment is development
 */
export function isDevelopment() {
  return process.env.NODE_ENV === 'development';
}

/**
 * Log only in development
 */
export function devLog(...args) {
  if (isDevelopment()) {
    console.log(...args);
  }
}
