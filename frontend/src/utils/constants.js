// API endpoints
export const API_ENDPOINTS = {
  // Auth
  REGISTER: '/api/v1/auth/register',
  LOGIN: '/api/v1/auth/login',
  VERIFY_TOKEN: '/api/v1/auth/verify-token',
  REFRESH_TOKEN: '/api/v1/auth/refresh-token',
  
  // Resumes
  RESUMES: '/api/v1/resumes',
  UPLOAD_RESUME: '/api/v1/resumes/upload',
  CUSTOMIZE_RESUME: (id) => `/api/v1/resumes/${id}/customize`,
  RESUME_VERSIONS: (id) => `/api/v1/resumes/${id}/versions`,
  RESUME_VERSION: (resumeId, versionId) => `/api/v1/resumes/${resumeId}/versions/${versionId}`,
  DOWNLOAD_PDF: (id) => `/api/v1/resumes/${id}/download`,
  COVER_LETTER: (id) => `/api/v1/resumes/${id}/cover-letter`,
  PDF_TEMPLATES: '/api/v1/resumes/templates/list',
  
  // Applications
  APPLICATIONS: '/api/v1/applications',
  APPLICATION_STATS: '/api/v1/applications/stats',
  APPLICATION_SEARCH: '/api/v1/applications/search',
  
  // Health
  HEALTH: '/health'
};

// Application status options
export const APPLICATION_STATUS = {
  APPLIED: 'Applied',
  INTERVIEWING: 'Interviewing',
  OFFER: 'Offer',
  REJECTED: 'Rejected',
  WITHDRAWN: 'Withdrawn'
};

// PDF Template options
export const PDF_TEMPLATES = {
  MODERN: 'modern',
  CLASSIC: 'classic',
  MINIMAL: 'minimal'
};

// Local storage keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'resumator_token',
  REFRESH_TOKEN: 'resumator_refresh_token',
  USER_DATA: 'resumator_user',
  THEME: 'resumator_theme',
  RECENT_RESUMES: 'resumator_recent_resumes'
};

// Theme options
export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system'
};

// Maximum file sizes
export const MAX_FILE_SIZE = {
  RESUME_MD: 50 * 1024, // 50KB
  JOB_DESCRIPTION: 20 * 1024 // 20KB
};

// Debounce delay for auto-save
export const AUTO_SAVE_DELAY = 2000; // 2 seconds

// Error messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized. Please log in again.',
  SERVER_ERROR: 'Server error. Please try again later.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  FILE_TOO_LARGE: 'File size is too large.',
  INVALID_FORMAT: 'Invalid file format.',
  GENERIC_ERROR: 'Something went wrong. Please try again.'
};

// Success messages
export const SUCCESS_MESSAGES = {
  RESUME_UPLOADED: 'Resume uploaded successfully!',
  RESUME_CUSTOMIZED: 'Resume customized successfully!',
  RESUME_UPDATED: 'Resume updated successfully!',
  APPLICATION_CREATED: 'Application created successfully!',
  APPLICATION_UPDATED: 'Application updated successfully!',
  PDF_GENERATED: 'PDF generated successfully!',
  COVER_LETTER_GENERATED: 'Cover letter generated successfully!'
};

// Regular expressions
export const REGEX = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  USERNAME: /^[a-zA-Z0-9_]{3,20}$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/
};

// Validation messages
export const VALIDATION_MESSAGES = {
  REQUIRED_FIELD: 'This field is required',
  INVALID_EMAIL: 'Please enter a valid email address',
  INVALID_USERNAME: 'Username must be 3-20 characters with letters, numbers, and underscores only',
  WEAK_PASSWORD: 'Password must be at least 8 characters with uppercase, lowercase, and number',
  PASSWORDS_DONT_MATCH: 'Passwords do not match'
};

// Date format options
export const DATE_FORMATS = {
  SHORT: 'MMM dd, yyyy',
  LONG: 'MMMM dd, yyyy',
  ISO: 'yyyy-MM-dd',
  RELATIVE: 'relative'
};
