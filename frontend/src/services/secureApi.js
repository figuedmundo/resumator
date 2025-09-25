import axios from 'axios';
import { API_ENDPOINTS, STORAGE_KEYS, ERROR_MESSAGES, SECURITY_CONFIG } from '@/utils/constants';
import { getErrorMessage, devLog } from '@/utils/helpers';
import { sanitizeInput, sanitizeFormData, clientRateLimit, secureStorage, validateURL } from '@/utils/security';

class SecureApiService {
  constructor() {
    // Create axios instance with enhanced security configuration
    this.api = axios.create({
      baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'X-Content-Type-Options': 'nosniff',
      },
      withCredentials: false, // Explicitly disable credentials
      maxRedirects: 0, // Prevent redirect attacks
    });

    // Add request ID for tracking
    this.requestId = 0;

    // Security headers and request interceptor
    this.api.interceptors.request.use(
      (config) => {
        // Generate request ID
        const requestId = ++this.requestId;
        config.metadata = { requestId, startTime: Date.now() };

        // Rate limiting check
        const rateLimitKey = `${config.method}:${config.url}`;
        if (!clientRateLimit.isAllowed(rateLimitKey)) {
          devLog('Rate limit exceeded for:', rateLimitKey);
          return Promise.reject(new Error(ERROR_MESSAGES.RATE_LIMITED));
        }

        // Add auth token if available
        const token = this.getToken();
        if (token) {
          // Validate token format (basic check)
          if (this.isValidTokenFormat(token)) {
            config.headers.Authorization = `Bearer ${token}`;
          } else {
            devLog('Invalid token format detected, clearing token');
            this.clearTokens();
            return Promise.reject(new Error(ERROR_MESSAGES.SESSION_EXPIRED));
          }
        }

        // Add CSRF protection nonce
        const nonce = this.getSecurityNonce();
        if (nonce) {
          config.headers['X-Security-Nonce'] = nonce;
        }

        // Sanitize request data
        if (config.data && typeof config.data === 'object') {
          config.data = this.sanitizeRequestData(config.data);
        }

        // Update last activity
        this.updateLastActivity();

        devLog(`[${requestId}] API Request:`, config.method?.toUpperCase(), config.url);
        return config;
      },
      (error) => {
        devLog('Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Enhanced response interceptor with security checks
    this.api.interceptors.response.use(
      (response) => {
        const { requestId, startTime } = response.config.metadata || {};
        const duration = Date.now() - startTime;
        
        devLog(`[${requestId}] API Response:`, response.status, response.config.url, `(${duration}ms)`);
        
        // Validate response headers for security
        this.validateResponseSecurity(response);
        
        return response;
      },
      async (error) => {
        const originalRequest = error.config;
        const { requestId } = originalRequest?.metadata || {};

        devLog(`[${requestId}] API Error:`, error.response?.status, error.response?.data);

        // Handle 401 with token refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            await this.refreshToken();
            const token = this.getToken();
            if (token && this.isValidTokenFormat(token)) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return this.api(originalRequest);
            }
          } catch (refreshError) {
            devLog('Token refresh failed:', refreshError);
            this.handleAuthFailure();
            return Promise.reject(new Error(ERROR_MESSAGES.SESSION_EXPIRED));
          }
        }

        // Handle rate limiting
        if (error.response?.status === 429) {
          return Promise.reject(new Error(ERROR_MESSAGES.RATE_LIMITED));
        }

        return Promise.reject(error);
      }
    );

    // Initialize security nonce
    this.initializeSecurityNonce();
  }

  // Security utilities
  initializeSecurityNonce() {
    if (!this.getSecurityNonce()) {
      const nonce = this.generateSecurityNonce();
      secureStorage.setItem(STORAGE_KEYS.SECURITY_NONCE, nonce);
    }
  }

  generateSecurityNonce() {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return btoa(String.fromCharCode.apply(null, array));
  }

  getSecurityNonce() {
    return secureStorage.getItem(STORAGE_KEYS.SECURITY_NONCE);
  }

  updateLastActivity() {
    secureStorage.setItem(STORAGE_KEYS.LAST_ACTIVITY, Date.now().toString());
  }

  checkSessionTimeout() {
    const lastActivity = parseInt(secureStorage.getItem(STORAGE_KEYS.LAST_ACTIVITY) || '0', 10);
    const now = Date.now();
    
    if (lastActivity && (now - lastActivity) > SECURITY_CONFIG.SESSION_TIMEOUT_MS) {
      this.handleSessionTimeout();
      return false;
    }
    return true;
  }

  isValidTokenFormat(token) {
    // Basic JWT format validation (header.payload.signature)
    return typeof token === 'string' && token.split('.').length === 3;
  }

  sanitizeRequestData(data) {
    if (Array.isArray(data)) {
      return data.map(item => this.sanitizeRequestData(item));
    }
    
    if (data && typeof data === 'object') {
      return sanitizeFormData(data);
    }
    
    if (typeof data === 'string') {
      return sanitizeInput(data);
    }
    
    return data;
  }

  validateResponseSecurity(response) {
    // Check for required security headers
    const securityHeaders = {
      'x-content-type-options': 'nosniff',
      'x-frame-options': ['DENY', 'SAMEORIGIN'],
      'x-xss-protection': '1; mode=block'
    };

    Object.entries(securityHeaders).forEach(([header, expectedValues]) => {
      const actualValue = response.headers[header];
      if (expectedValues && Array.isArray(expectedValues)) {
        if (!expectedValues.some(val => actualValue?.includes(val))) {
          devLog(`Security warning: Missing or invalid ${header} header`);
        }
      } else if (expectedValues && actualValue !== expectedValues) {
        devLog(`Security warning: Missing or invalid ${header} header`);
      }
    });
  }

  handleAuthFailure() {
    this.clearTokens();
    // Redirect to login after a short delay to prevent timing attacks
    setTimeout(() => {
      if (window.location.pathname !== '/login') {
        window.location.href = '/login?expired=1';
      }
    }, 1000);
  }

  handleSessionTimeout() {
    this.clearTokens();
    setTimeout(() => {
      if (window.location.pathname !== '/login') {
        window.location.href = '/login?timeout=1';
      }
    }, 1000);
  }

  // Enhanced token management
  getToken() {
    if (!this.checkSessionTimeout()) {
      return null;
    }
    return secureStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  }

  getRefreshToken() {
    if (!this.checkSessionTimeout()) {
      return null;
    }
    return secureStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
  }

  setTokens(accessToken, refreshToken) {
    if (!this.isValidTokenFormat(accessToken)) {
      throw new Error('Invalid access token format');
    }
    
    secureStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
    if (refreshToken && this.isValidTokenFormat(refreshToken)) {
      secureStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
    }
    this.updateLastActivity();
  }

  clearTokens() {
    secureStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    secureStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    secureStorage.removeItem(STORAGE_KEYS.USER_DATA);
    secureStorage.removeItem(STORAGE_KEYS.SECURITY_NONCE);
    secureStorage.removeItem(STORAGE_KEYS.LAST_ACTIVITY);
  }

  // Enhanced auth endpoints with additional validation
  async register(userData) {
    try {
      // Validate and sanitize input data
      const sanitizedData = sanitizeFormData(userData);
      
      // Additional validation
      if (!sanitizedData.email || !sanitizedData.password || !sanitizedData.username) {
        throw new Error(ERROR_MESSAGES.VALIDATION_ERROR);
      }

      const response = await this.api.post(API_ENDPOINTS.REGISTER, sanitizedData);
      const { access_token, refresh_token, user } = response.data;

      this.setTokens(access_token, refresh_token);
      secureStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));

      return { user, access_token, refresh_token };
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  async login(credentials) {
    try {
      // Validate and sanitize credentials
      const sanitizedCredentials = {
        email: sanitizeInput(credentials.email),
        password: credentials.password // Don't sanitize password, just validate
      };

      if (!sanitizedCredentials.email || !sanitizedCredentials.password) {
        throw new Error(ERROR_MESSAGES.VALIDATION_ERROR);
      }

      const response = await this.api.post(API_ENDPOINTS.LOGIN, sanitizedCredentials);
      const { access_token, refresh_token, user } = response.data;

      this.setTokens(access_token, refresh_token);
      secureStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));

      return { user, access_token, refresh_token };
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  async logout() {
    try {
      // Attempt to notify server of logout
      await this.api.post(API_ENDPOINTS.LOGOUT);
    } catch (error) {
      // Continue with logout even if server request fails
      devLog('Logout request failed:', error);
    } finally {
      this.clearTokens();
    }
  }

  async refreshToken() {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      // Use a fresh axios instance to avoid interceptors
      const response = await axios.post(
        `${this.api.defaults.baseURL}${API_ENDPOINTS.REFRESH_TOKEN}`,
        { refresh_token: refreshToken },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
          },
          timeout: 10000
        }
      );

      const { access_token, refresh_token: newRefreshToken } = response.data;
      this.setTokens(access_token, newRefreshToken);

      return access_token;
    } catch (error) {
      this.clearTokens();
      throw new Error('Token refresh failed');
    }
  }

  
  // Resume endpoints
  // Enhanced file upload with additional security checks
  async uploadResume(file, metadata = {}) {
    try {
      // Validate file
      if (!this.isValidFile(file)) {
        throw new Error(ERROR_MESSAGES.INVALID_FORMAT);
      }

      const formData = new FormData();
      formData.append('file', file);

      // Sanitize metadata
      const sanitizedMetadata = sanitizeFormData(metadata);
      Object.keys(sanitizedMetadata).forEach(key => {
        formData.append(key, sanitizedMetadata[key]);
      });

      const response = await this.api.post(API_ENDPOINTS.UPLOAD_RESUME, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          devLog('Upload progress:', percentCompleted + '%');
        }
      });

      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  isValidFile(file) {
    if (!file || !(file instanceof File)) {
      return false;
    }

    // Check file size
    if (file.size > SECURITY_CONFIG.MAX_FILE_SIZE_MB * 1024 * 1024) {
      return false;
    }

    // Check file type
    if (!SECURITY_CONFIG.ALLOWED_FILE_TYPES.includes(file.type)) {
      return false;
    }

    // Check file name for suspicious patterns
    const suspiciousPatterns = [
      /\.exe$/, /\.bat$/, /\.cmd$/, /\.com$/, /\.scr$/, /\.pif$/,
      /\.js$/, /\.vbs$/, /\.jar$/, /\.php$/, /\.asp$/, /\.jsp$/
    ];

    return !suspiciousPatterns.some(pattern => pattern.test(file.name.toLowerCase()));
  }

  async createResume(data) {
    try {
      const response = await this.api.post(API_ENDPOINTS.RESUMES, data);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  async getResumes(params = {}) {
    try {
      const response = await this.api.get(API_ENDPOINTS.RESUMES, { params });
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  async getResume(id) {
    try {
      const response = await this.api.get(`${API_ENDPOINTS.RESUMES}/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  async updateResume(id, data) {
    try {
      const response = await this.api.put(`${API_ENDPOINTS.RESUMES}/${id}`, data);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  async deleteResume(id) {
    try {
      const response = await this.api.delete(`${API_ENDPOINTS.RESUMES}/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }



  async getResumeVersions(id) {
    try {
      const response = await this.api.get(API_ENDPOINTS.RESUME_VERSIONS(id));
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  async getResumeVersion(resumeId, versionId) {
    try {
      const response = await this.api.get(API_ENDPOINTS.RESUME_VERSION(resumeId, versionId));
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  async downloadResumePDF(id, options = {}) {
    try {
      const response = await this.api.get(API_ENDPOINTS.DOWNLOAD_PDF(id), {
        params: options,
        responseType: 'blob',
      });

      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  // Secure URL generation for PDF preview
  getPreviewPDFUrl(id, options = {}) {
    const token = this.getToken();
    const params = new URLSearchParams(sanitizeFormData(options));
    const baseUrl = `${this.api.defaults.baseURL}${API_ENDPOINTS.PREVIEW_PDF(id)}`;

    // Validate the base URL
    if (!validateURL(baseUrl)) {
      throw new Error(ERROR_MESSAGES.UNSAFE_URL);
    }

    if (token && this.isValidTokenFormat(token)) {
      params.set('token', token);
    }

    return `${baseUrl}?${params.toString()}`;
  }

  // Enhanced customization with content validation
  async customizeResume(id, jobDescription, options = {}) {
    try {
      // Sanitize and validate inputs
      const sanitizedJobDescription = sanitizeInput(jobDescription, { 
        maxLength: SECURITY_CONFIG.MAX_INPUT_LENGTH 
      });
      
      const sanitizedOptions = sanitizeFormData(options);

      if (!sanitizedJobDescription.trim()) {
        throw new Error('Job description cannot be empty');
      }

      const response = await this.api.post(API_ENDPOINTS.CUSTOMIZE_RESUME(id), {
        job_description: sanitizedJobDescription,
        ...sanitizedOptions
      });

      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  // async customizeResume(id, jobDescription, options = {}) {
  //   try {
  //     const response = await this.api.post(API_ENDPOINTS.CUSTOMIZE_RESUME(id), {
  //       job_description: jobDescription,
  //       ...options
  //     });
  //     return response.data;
  //   } catch (error) {
  //     throw new Error(getErrorMessage(error));
  //   }
  // }


  async generateCoverLetter(id, jobDescription, options = {}) {
    try {
      const response = await this.api.post(API_ENDPOINTS.COVER_LETTER(id), {
        job_description: jobDescription,
        ...options
      });
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  async getPDFTemplates() {
    try {
      const response = await this.api.get(API_ENDPOINTS.PDF_TEMPLATES);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  // Application endpoints
  async createApplication(applicationData) {
    try {
      const response = await this.api.post(API_ENDPOINTS.APPLICATIONS, applicationData);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  async getApplications(params = {}) {
    try {
      const response = await this.api.get(API_ENDPOINTS.APPLICATIONS, { params });
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  async getApplication(id) {
    try {
      const response = await this.api.get(`${API_ENDPOINTS.APPLICATIONS}/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  async updateApplication(id, data) {
    try {
      const response = await this.api.put(`${API_ENDPOINTS.APPLICATIONS}/${id}`, data);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  async deleteApplication(id) {
    try {
      const response = await this.api.delete(`${API_ENDPOINTS.APPLICATIONS}/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  // Utility methods with security enhancements
  isAuthenticated() {
    return !!this.getToken() && this.checkSessionTimeout();
  }

  getCurrentUser() {
    if (!this.checkSessionTimeout()) {
      return null;
    }
    
    const userData = secureStorage.getItem(STORAGE_KEYS.USER_DATA);
    if (!userData) {
      return null;
    }

    try {
      return JSON.parse(userData);
    } catch (error) {
      devLog('Failed to parse user data:', error);
      secureStorage.removeItem(STORAGE_KEYS.USER_DATA);
      return null;
    }
  }

  // Health check with enhanced error handling
  async healthCheck() {
    try {
      const response = await axios.get(
        `${this.api.defaults.baseURL}${API_ENDPOINTS.HEALTH}`,
        { timeout: 5000 }
      );
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  // Generic secure API methods
  async secureGet(endpoint, params = {}) {
    try {
      const sanitizedParams = sanitizeFormData(params);
      const response = await this.api.get(endpoint, { params: sanitizedParams });
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  async securePost(endpoint, data = {}) {
    try {
      const sanitizedData = sanitizeFormData(data);
      const response = await this.api.post(endpoint, sanitizedData);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  async securePut(endpoint, data = {}) {
    try {
      const sanitizedData = sanitizeFormData(data);
      const response = await this.api.put(endpoint, sanitizedData);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  async secureDelete(endpoint) {
    try {
      const response = await this.api.delete(endpoint);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }
}

// Create and export a singleton instance
const secureApiService = new SecureApiService();
export default secureApiService;

// Export the class for testing purposes
export { SecureApiService };
