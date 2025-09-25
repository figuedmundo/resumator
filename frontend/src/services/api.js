import axios from 'axios';
import { API_ENDPOINTS, STORAGE_KEYS, ERROR_MESSAGES } from '@/utils/constants';
import { getErrorMessage, devLog } from '@/utils/helpers';

class ApiService {
  constructor() {
    // Create axios instance with basic configuration
    this.api = axios.create({
      baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor - add auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = this.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        devLog(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        devLog('Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor - handle token refresh
    this.api.interceptors.response.use(
      (response) => {
        devLog(`API Response: ${response.status} ${response.config.url}`);
        return response;
      },
      async (error) => {
        const originalRequest = error.config;

        // Handle 401 with token refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            await this.refreshToken();
            const token = this.getToken();
            if (token) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return this.api(originalRequest);
            }
          } catch (refreshError) {
            devLog('Token refresh failed:', refreshError);
            this.handleAuthFailure();
          }
        }

        // Handle rate limiting
        if (error.response?.status === 429) {
          devLog('Rate limit exceeded');
          return Promise.reject(new Error(ERROR_MESSAGES.RATE_LIMITED));
        }

        return Promise.reject(error);
      }
    );
  }

  // Token management
  getToken() {
    return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  }

  getRefreshToken() {
    return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
  }

  setTokens(accessToken, refreshToken) {
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
    if (refreshToken) {
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
    }
  }

  clearTokens() {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER_DATA);
  }

  // Auth methods
  async register(userData) {
    try {
      const response = await this.api.post(API_ENDPOINTS.REGISTER, userData);
      const { access_token, refresh_token, user } = response.data;

      this.setTokens(access_token, refresh_token);
      localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));

      return { user, access_token, refresh_token };
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  async login(credentials) {
    try {
      const response = await this.api.post(API_ENDPOINTS.LOGIN, credentials);
      const { access_token, refresh_token, user } = response.data;

      this.setTokens(access_token, refresh_token);
      localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));

      return { user, access_token, refresh_token };
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  async logout() {
    try {
      // Try to notify server of logout
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
  async createResume(data) {
    const response = await this.api.post(API_ENDPOINTS.RESUMES, data);
    return response.data;
  }

  async uploadResume(file, metadata = {}) {
    const formData = new FormData();
    formData.append('file', file);

    // Add metadata
    Object.keys(metadata).forEach(key => {
      formData.append(key, metadata[key]);
    });

    const response = await this.api.post(API_ENDPOINTS.UPLOAD_RESUME, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  }

  async getResumes(params = {}) {
    const response = await this.api.get(API_ENDPOINTS.RESUMES, { params });
    return response.data;
  }

  async getResume(id) {
    const response = await this.api.get(`${API_ENDPOINTS.RESUMES}/${id}`);
    return response.data;
  }

  async updateResume(id, data) {
    const response = await this.api.put(`${API_ENDPOINTS.RESUMES}/${id}`, data);
    return response.data;
  }

  async deleteResume(id) {
    const response = await this.api.delete(`${API_ENDPOINTS.RESUMES}/${id}`);
    return response.data;
  }

  async customizeResume(id, jobDescription, options = {}) {
    const response = await this.api.post(API_ENDPOINTS.CUSTOMIZE_RESUME(id), {
      job_description: jobDescription,
      ...options
    });
    return response.data;
  }

  async getResumeVersions(id) {
    const response = await this.api.get(API_ENDPOINTS.RESUME_VERSIONS(id));
    return response.data;
  }

  async getResumeVersion(resumeId, versionId) {
    const response = await this.api.get(API_ENDPOINTS.RESUME_VERSION(resumeId, versionId));
    return response.data;
  }

  async downloadResumePDF(id, options = {}) {
    const response = await this.api.get(API_ENDPOINTS.DOWNLOAD_PDF(id), {
      params: options,
      responseType: 'blob',
    });
    return response.data;
  }

  async generateCoverLetter(id, jobDescription, options = {}) {
    const response = await this.api.post(API_ENDPOINTS.COVER_LETTER(id), {
      job_description: jobDescription,
      ...options
    });
    return response.data;
  }

  async getPDFTemplates() {
    const response = await this.api.get(API_ENDPOINTS.PDF_TEMPLATES);
    return response.data;
  }

  // Application endpoints
  async createApplication(applicationData) {
    const response = await this.api.post(API_ENDPOINTS.APPLICATIONS, applicationData);
    return response.data;
  }

  async getApplications(params = {}) {
    const response = await this.api.get(API_ENDPOINTS.APPLICATIONS, { params });
    return response.data;
  }

  async getApplication(id) {
    const response = await this.api.get(`${API_ENDPOINTS.APPLICATIONS}/${id}`);
    return response.data;
  }

  async updateApplication(id, data) {
    const response = await this.api.put(`${API_ENDPOINTS.APPLICATIONS}/${id}`, data);
    return response.data;
  }

  async deleteApplication(id) {
    const response = await this.api.delete(`${API_ENDPOINTS.APPLICATIONS}/${id}`);
    return response.data;
  }

  // Generic methods
  async get(endpoint, params = {}) {
    const response = await this.api.get(endpoint, { params });
    return response.data;
  }

  async post(endpoint, data = {}) {
    const response = await this.api.post(endpoint, data);
    return response.data;
  }

  async put(endpoint, data = {}) {
    const response = await this.api.put(endpoint, data);
    return response.data;
  }

  async delete(endpoint) {
    const response = await this.api.delete(endpoint);
    return response.data;
  }

  // Utility methods
  isAuthenticated() {
    return !!this.getToken();
  }

  getCurrentUser() {
    const userData = localStorage.getItem(STORAGE_KEYS.USER_DATA);
    if (!userData) {
      return null;
    }

    try {
      return JSON.parse(userData);
    } catch (error) {
      devLog('Failed to parse user data:', error);
      localStorage.removeItem(STORAGE_KEYS.USER_DATA);
      return null;
    }
  }

  handleAuthFailure() {
    this.clearTokens();
    // Redirect to login after a short delay
    setTimeout(() => {
      if (window.location.pathname !== '/login') {
        window.location.href = '/login?expired=1';
      }
    }, 1000);
  }

  // Health check
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

  // PDF Preview URL helper
  getPreviewPDFUrl(id, options = {}) {
    const token = this.getToken();
    const params = new URLSearchParams(options);
    const baseUrl = `${this.api.defaults.baseURL}${API_ENDPOINTS.PREVIEW_PDF(id)}`;

    if (token) {
      params.set('token', token);
    }

    return `${baseUrl}?${params.toString()}`;
  }
}

// Create and export singleton instance
const apiService = new ApiService();
export default apiService;

// Export class for testing
export { ApiService };
