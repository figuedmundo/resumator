import axios from 'axios';
import { API_ENDPOINTS, STORAGE_KEYS, ERROR_MESSAGES } from '../utils/constants';
import { getErrorMessage, devLog } from '../utils/helpers';

class ApiService {
  constructor() {
    // Create axios instance with base configuration
    this.api = axios.create({
      baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = this.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        devLog('API Request:', config.method?.toUpperCase(), config.url);
        return config;
      },
      (error) => {
        devLog('Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle errors and token refresh
    this.api.interceptors.response.use(
      (response) => {
        devLog('API Response:', response.status, response.config.url);
        return response;
      },
      async (error) => {
        const originalRequest = error.config;

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
            this.logout();
            window.location.href = '/login';
          }
        }

        devLog('API Error:', error.response?.status, error.response?.data);
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

  // Auth endpoints
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
      // FastAPI expects form data for OAuth2 login 
      // const formData = new FormData();
      // formData.append('username', credentials.email);
      // formData.append('password', credentials.password);

      // const response = await this.api.post(API_ENDPOINTS.LOGIN, formData, {
      //   headers: {
      //     'Content-Type': 'multipart/form-data',
      //   },
      // });
      // [TODO] currently not working OAuth2 login, changing to json
      const response = await this.api.post(API_ENDPOINTS.LOGIN, {
        username: credentials.email,
        password: credentials.password,
      });

      const { access_token, refresh_token, user } = response.data;

      this.setTokens(access_token, refresh_token);
      localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));

      return { user, access_token, refresh_token };
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  async refreshToken() {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL || 'http://localhost:8000'}${API_ENDPOINTS.REFRESH_TOKEN}`,
        { refresh_token: refreshToken }
      );

      const { access_token, refresh_token: newRefreshToken } = response.data;
      this.setTokens(access_token, newRefreshToken);

      return access_token;
    } catch (error) {
      this.clearTokens();
      throw new Error('Token refresh failed');
    }
  }

  async verifyToken() {
    try {
      const response = await this.api.get(API_ENDPOINTS.VERIFY_TOKEN);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  logout() {
    this.clearTokens();
  }

  // Resume endpoints
  async uploadResume(file, metadata = {}) {
    try {
      const formData = new FormData();
      formData.append('file', file);

      // Add metadata if provided
      Object.keys(metadata).forEach(key => {
        formData.append(key, metadata[key]);
      });

      const response = await this.api.post(API_ENDPOINTS.UPLOAD_RESUME, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
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

  async customizeResume(id, jobDescription, options = {}) {
    try {
      const response = await this.api.post(API_ENDPOINTS.CUSTOMIZE_RESUME(id), {
        job_description: jobDescription,
        ...options
      });
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

  getPreviewPDFUrl(id, options = {}) {
    // Create URL with auth token for PDF preview
    const token = this.getToken();
    const params = new URLSearchParams(options);
    const baseUrl = `${this.api.defaults.baseURL}${API_ENDPOINTS.PREVIEW_PDF(id)}`;

    if (token) {
      params.set('token', token);
    }

    return `${baseUrl}?${params.toString()}`;
  }

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

  // Health check
  async healthCheck() {
    try {
      const response = await this.api.get(API_ENDPOINTS.HEALTH);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  // Utility methods
  isAuthenticated() {
    return !!this.getToken();
  }

  getCurrentUser() {
    const userData = localStorage.getItem(STORAGE_KEYS.USER_DATA);
    return userData ? JSON.parse(userData) : null;
  }
}

// Create and export a singleton instance
const apiService = new ApiService();
export default apiService;

// Export the class for testing purposes
export { ApiService };
