import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { sanitizeInput, sanitizeHTML, validateURL } from '../../utils/security';
import { SECURITY_CONFIG, ERROR_MESSAGES } from '../../utils/constants';

/**
 * SecureInput - Input component with built-in XSS protection
 */
export const SecureInput = ({ 
  value = '', 
  onChange, 
  onValidationError,
  maxLength = SECURITY_CONFIG.MAX_INPUT_LENGTH,
  allowHtml = false,
  placeholder,
  className,
  type = 'text',
  ...props 
}) => {
  const [sanitizedValue, setSanitizedValue] = useState('');
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    const sanitized = sanitizeInput(value, { allowHtml, maxLength });
    setSanitizedValue(sanitized);
    
    if (sanitized !== value && value) {
      const error = ERROR_MESSAGES.CONTENT_FILTERED;
      setValidationError(error);
      onValidationError?.(error);
    }
  }, [value, allowHtml, maxLength, onValidationError]);

  const handleChange = useCallback((event) => {
    const inputValue = event.target.value;
    
    if (validationError) {
      setValidationError('');
    }

    if (inputValue.length > maxLength) {
      const error = `Input exceeds maximum length of ${maxLength} characters`;
      setValidationError(error);
      onValidationError?.(error);
      return;
    }

    const sanitized = sanitizeInput(inputValue, { allowHtml, maxLength });
    setSanitizedValue(sanitized);

    if (sanitized !== inputValue && inputValue) {
      const error = ERROR_MESSAGES.CONTENT_FILTERED;
      setValidationError(error);
      onValidationError?.(error);
    }

    onChange?.(sanitized);
  }, [onChange, onValidationError, allowHtml, maxLength, validationError]);

  return (
    <div className="secure-input-wrapper">
      <input
        {...props}
        type={type}
        value={sanitizedValue}
        onChange={handleChange}
        placeholder={placeholder}
        className={`${className} ${validationError ? 'border-red-500' : ''}`}
        maxLength={maxLength}
      />
      {validationError && (
        <div className="text-red-500 text-sm mt-1 flex items-center">
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {validationError}
        </div>
      )}
    </div>
  );
};

/**
 * SecureTextArea - TextArea component with built-in XSS protection
 */
export const SecureTextArea = ({ 
  value = '', 
  onChange, 
  onValidationError,
  maxLength = SECURITY_CONFIG.MAX_INPUT_LENGTH,
  allowHtml = false,
  placeholder,
  className,
  rows = 4,
  ...props 
}) => {
  const [sanitizedValue, setSanitizedValue] = useState('');
  const [validationError, setValidationError] = useState('');
  const [charCount, setCharCount] = useState(0);

  useEffect(() => {
    const sanitized = sanitizeInput(value, { allowHtml, maxLength });
    setSanitizedValue(sanitized);
    setCharCount(sanitized.length);
    
    if (sanitized !== value && value) {
      const error = ERROR_MESSAGES.CONTENT_FILTERED;
      setValidationError(error);
      onValidationError?.(error);
    }
  }, [value, allowHtml, maxLength, onValidationError]);

  const handleChange = useCallback((event) => {
    const inputValue = event.target.value;
    
    if (validationError) {
      setValidationError('');
    }

    if (inputValue.length > maxLength) {
      const error = `Input exceeds maximum length of ${maxLength} characters`;
      setValidationError(error);
      onValidationError?.(error);
      return;
    }

    const sanitized = sanitizeInput(inputValue, { allowHtml, maxLength });
    setSanitizedValue(sanitized);
    setCharCount(sanitized.length);

    if (sanitized !== inputValue && inputValue) {
      const error = ERROR_MESSAGES.CONTENT_FILTERED;
      setValidationError(error);
      onValidationError?.(error);
    }

    onChange?.(sanitized);
  }, [onChange, onValidationError, allowHtml, maxLength, validationError]);

  const isNearLimit = charCount > maxLength * 0.9;
  const isOverLimit = charCount > maxLength;

  return (
    <div className="secure-textarea-wrapper">
      <textarea
        {...props}
        value={sanitizedValue}
        onChange={handleChange}
        placeholder={placeholder}
        className={`${className} ${validationError ? 'border-red-500' : ''}`}
        rows={rows}
        maxLength={maxLength}
      />
      <div className="flex justify-between items-center mt-1">
        <div>
          {validationError && (
            <div className="text-red-500 text-sm flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {validationError}
            </div>
          )}
        </div>
        <div className={`text-sm ${
          isOverLimit ? 'text-red-500' : 
          isNearLimit ? 'text-yellow-500' : 
          'text-gray-500'
        }`}>
          {charCount}/{maxLength}
        </div>
      </div>
    </div>
  );
};

/**
 * SecureLink - Link component that validates URLs for safety
 */
export const SecureLink = ({ 
  href, 
  children, 
  className,
  target = '_blank',
  rel = 'noopener noreferrer',
  onUnsafeUrl,
  ...props 
}) => {
  const isValidUrl = useMemo(() => {
    if (!href) return false;
    return validateURL(href);
  }, [href]);

  const handleClick = useCallback((event) => {
    if (!isValidUrl) {
      event.preventDefault();
      const error = ERROR_MESSAGES.UNSAFE_URL;
      onUnsafeUrl?.(error);
      console.warn('Unsafe URL blocked:', href);
      return false;
    }
  }, [isValidUrl, href, onUnsafeUrl]);

  if (!isValidUrl) {
    return (
      <span className={`${className} text-red-500 cursor-not-allowed`} title="Unsafe URL blocked">
        {children} ⚠️
      </span>
    );
  }

  return (
    <a
      {...props}
      href={href}
      className={className}
      target={target}
      rel={rel}
      onClick={handleClick}
    >
      {children}
    </a>
  );
};

/**
 * SecureContent - Component for displaying sanitized HTML content
 */
export const SecureContent = ({ 
  content, 
  allowBasicFormatting = true,
  className,
  onContentFiltered,
  ...props 
}) => {
  const [sanitizedContent, setSanitizedContent] = useState('');
  const [wasFiltered, setWasFiltered] = useState(false);

  useEffect(() => {
    if (!content) {
      setSanitizedContent('');
      setWasFiltered(false);
      return;
    }

    const sanitized = sanitizeHTML(content, { allowBasicFormatting });
    setSanitizedContent(sanitized);
    
    const filtered = sanitized !== content;
    setWasFiltered(filtered);
    
    if (filtered) {
      onContentFiltered?.(ERROR_MESSAGES.CONTENT_FILTERED);
    }
  }, [content, allowBasicFormatting, onContentFiltered]);

  return (
    <div className={className} {...props}>
      {wasFiltered && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-2 mb-2">
          <div className="flex items-center">
            <svg className="w-4 h-4 text-yellow-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span className="text-yellow-800 text-sm">Content has been filtered for security</span>
          </div>
        </div>
      )}
      <div dangerouslySetInnerHTML={{ __html: sanitizedContent }} />
    </div>
  );
};

/**
 * SecurityBanner - Component to show security status and warnings
 */
export const SecurityBanner = ({ 
  level = 'info', 
  message, 
  onDismiss,
  autoHide = false,
  hideAfter = 5000 
}) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (autoHide && hideAfter > 0) {
      const timer = setTimeout(() => {
        setVisible(false);
        onDismiss?.();
      }, hideAfter);
      
      return () => clearTimeout(timer);
    }
  }, [autoHide, hideAfter, onDismiss]);

  if (!visible) return null;

  const levelStyles = {
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    success: 'bg-green-50 border-green-200 text-green-800'
  };

  const levelIcons = {
    info: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
      </svg>
    ),
    warning: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
    ),
    error: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
      </svg>
    ),
    success: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
    )
  };

  return (
    <div className={`border rounded-md p-4 ${levelStyles[level]}`}>
      <div className="flex items-center">
        <div className="flex-shrink-0">
          {levelIcons[level]}
        </div>
        <div className="ml-3">
          <p className="text-sm font-medium">{message}</p>
        </div>
        {onDismiss && (
          <div className="ml-auto pl-3">
            <button
              onClick={() => {
                setVisible(false);
                onDismiss();
              }}
              className="inline-flex text-sm hover:opacity-75 focus:outline-none"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
