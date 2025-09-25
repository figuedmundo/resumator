import DOMPurify from 'isomorphic-dompurify';
import { REGEX, VALIDATION_MESSAGES, XSS_PATTERNS } from './constants';

/**
 * XSS Protection Utilities
 */

// Configure DOMPurify for strict sanitization
const createDOMPurifyConfig = (allowHtml = false) => ({
  ALLOWED_TAGS: allowHtml 
    ? ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6']
    : [],
  ALLOWED_ATTR: allowHtml 
    ? ['class', 'id']
    : [],
  KEEP_CONTENT: false,
  RETURN_DOM: false,
  RETURN_DOM_FRAGMENT: false,
  RETURN_DOM_IMPORT: false,
  SANITIZE_DOM: true,
  SANITIZE_NAMED_PROPS: true,
  FORBID_ATTR: ['style', 'onerror', 'onload', 'onclick', 'onmouseover'],
  FORBID_TAGS: ['script', 'object', 'embed', 'form', 'input', 'iframe', 'meta', 'link']
});

/**
 * Sanitize user input to prevent XSS attacks
 */
export function sanitizeInput(input, options = {}) {
  if (!input || typeof input !== 'string') return input;
  
  const { allowHtml = false, maxLength = null } = options;
  
  // First check for obvious XSS patterns
  if (containsXSSPattern(input)) {
    console.warn('Potential XSS attempt detected and blocked:', input.substring(0, 50));
    return '';
  }
  
  // Sanitize with DOMPurify
  const config = createDOMPurifyConfig(allowHtml);
  let sanitized = DOMPurify.sanitize(input, config);
  
  // Truncate if max length specified
  if (maxLength && sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }
  
  // Additional security: escape any remaining special characters if HTML not allowed
  if (!allowHtml) {
    sanitized = escapeHtml(sanitized);
  }
  
  return sanitized;
}

/**
 * Check for common XSS patterns
 */
export function containsXSSPattern(input) {
  if (!input || typeof input !== 'string') return false;
  
  const xssPatterns = [
    /<script[\s\S]*?>[\s\S]*?<\/script>/gi,
    /javascript:/gi,
    /vbscript:/gi,
    /onload\s*=/gi,
    /onerror\s*=/gi,
    /onclick\s*=/gi,
    /onmouseover\s*=/gi,
    /onfocus\s*=/gi,
    /onblur\s*=/gi,
    /<iframe[\s\S]*?>/gi,
    /<object[\s\S]*?>/gi,
    /<embed[\s\S]*?>/gi,
    /eval\s*\(/gi,
    /expression\s*\(/gi,
    /url\s*\(/gi,
    /@import/gi,
    /binding\s*:/gi
  ];
  
  return xssPatterns.some(pattern => pattern.test(input));
}

/**
 * Sanitize HTML content for display
 */
export function sanitizeHTML(html, options = {}) {
  if (!html || typeof html !== 'string') return html;
  
  const { allowBasicFormatting = true } = options;
  const config = createDOMPurifyConfig(allowBasicFormatting);
  
  return DOMPurify.sanitize(html, config);
}

/**
 * Sanitize markdown content
 */
export function sanitizeMarkdown(markdown) {
  if (!markdown || typeof markdown !== 'string') return markdown;
  
  // Remove potentially dangerous markdown patterns
  return markdown
    .replace(/\[.*?\]\(javascript:.*?\)/gi, '[BLOCKED](about:blank)')
    .replace(/\[.*?\]\(data:.*?\)/gi, '[BLOCKED](about:blank)')
    .replace(/!\[.*?\]\(javascript:.*?\)/gi, '')
    .replace(/!\[.*?\]\(data:.*?\)/gi, '')
    .replace(/<[^>]*>/g, ''); // Remove any HTML tags
}

/**
 * Validate and sanitize file content
 */
export function sanitizeFileContent(content, fileType = 'text') {
  if (!content || typeof content !== 'string') return content;
  
  // Check for malicious patterns
  if (containsXSSPattern(content)) {
    throw new Error('File contains potentially malicious content');
  }
  
  // Sanitize based on file type
  switch (fileType) {
    case 'markdown':
      return sanitizeMarkdown(content);
    case 'html':
      return sanitizeHTML(content, { allowBasicFormatting: true });
    default:
      return sanitizeInput(content, { allowHtml: false });
  }
}

/**
 * Escape HTML entities
 */
export function escapeHtml(text) {
  if (!text || typeof text !== 'string') return text;
  
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Unescape HTML entities safely
 */
export function unescapeHtml(html) {
  if (!html || typeof html !== 'string') return html;
  
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent || div.innerText || '';
}

/**
 * Validate URL to prevent javascript: and data: URLs
 */
export function validateURL(url) {
  if (!url || typeof url !== 'string') return false;
  
  try {
    const urlObj = new URL(url);
    const allowedProtocols = ['http:', 'https:', 'mailto:', 'tel:'];
    
    return allowedProtocols.includes(urlObj.protocol.toLowerCase());
  } catch {
    return false;
  }
}

/**
 * Sanitize URL for safe use
 */
export function sanitizeURL(url) {
  if (!url || typeof url !== 'string') return '';
  
  if (validateURL(url)) {
    return url;
  }
  
  console.warn('Potentially unsafe URL blocked:', url);
  return 'about:blank';
}

/**
 * Content Security Policy helpers
 */
export function generateNonce() {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode.apply(null, array));
}

/**
 * Safe innerHTML replacement
 */
export function setSafeInnerHTML(element, html) {
  if (!element || !html) return;
  
  const sanitizedHTML = sanitizeHTML(html);
  element.innerHTML = sanitizedHTML;
}

/**
 * Safe attribute setting
 */
export function setSafeAttribute(element, attribute, value) {
  if (!element || !attribute || value === undefined || value === null) return;
  
  // Block dangerous attributes
  const dangerousAttrs = [
    'onclick', 'onload', 'onerror', 'onmouseover', 'onfocus', 'onblur',
    'onchange', 'onsubmit', 'onkeydown', 'onkeyup', 'onkeypress'
  ];
  
  if (dangerousAttrs.includes(attribute.toLowerCase())) {
    console.warn('Dangerous attribute blocked:', attribute);
    return;
  }
  
  // Sanitize href and src attributes
  if (attribute === 'href' || attribute === 'src') {
    value = sanitizeURL(value);
  } else {
    value = sanitizeInput(value);
  }
  
  element.setAttribute(attribute, value);
}

/**
 * Validate and sanitize form data
 */
export function sanitizeFormData(formData) {
  const sanitized = {};
  
  for (const [key, value] of Object.entries(formData)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeInput(value);
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map(item => 
        typeof item === 'string' ? sanitizeInput(item) : item
      );
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
}

/**
 * Rate limiting for client-side operations
 */
class ClientRateLimit {
  constructor(maxRequests = 10, windowMs = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.requests = new Map();
  }
  
  isAllowed(key) {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    
    // Get existing requests for this key
    let keyRequests = this.requests.get(key) || [];
    
    // Remove old requests outside the window
    keyRequests = keyRequests.filter(time => time > windowStart);
    
    // Check if we're within limits
    if (keyRequests.length >= this.maxRequests) {
      return false;
    }
    
    // Add current request
    keyRequests.push(now);
    this.requests.set(key, keyRequests);
    
    return true;
  }
  
  getRemainingRequests(key) {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    const keyRequests = this.requests.get(key) || [];
    const activeRequests = keyRequests.filter(time => time > windowStart);
    
    return Math.max(0, this.maxRequests - activeRequests.length);
  }
}

// Export rate limiter instance
export const clientRateLimit = new ClientRateLimit();

/**
 * Secure local storage wrapper
 */
class SecureStorage {
  constructor() {
    this.prefix = 'resumator_secure_';
  }
  
  setItem(key, value) {
    try {
      const sanitizedKey = this.sanitizeKey(key);
      const sanitizedValue = typeof value === 'string' ? sanitizeInput(value) : JSON.stringify(value);
      localStorage.setItem(this.prefix + sanitizedKey, sanitizedValue);
    } catch (error) {
      console.error('Secure storage set error:', error);
    }
  }
  
  getItem(key) {
    try {
      const sanitizedKey = this.sanitizeKey(key);
      const value = localStorage.getItem(this.prefix + sanitizedKey);
      return value;
    } catch (error) {
      console.error('Secure storage get error:', error);
      return null;
    }
  }
  
  removeItem(key) {
    try {
      const sanitizedKey = this.sanitizeKey(key);
      localStorage.removeItem(this.prefix + sanitizedKey);
    } catch (error) {
      console.error('Secure storage remove error:', error);
    }
  }
  
  clear() {
    try {
      Object.keys(localStorage)
        .filter(key => key.startsWith(this.prefix))
        .forEach(key => localStorage.removeItem(key));
    } catch (error) {
      console.error('Secure storage clear error:', error);
    }
  }
  
  sanitizeKey(key) {
    return sanitizeInput(key, { maxLength: 50 });
  }
}

export const secureStorage = new SecureStorage();
