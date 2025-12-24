/**
 * API Service
 * 
 * Centralized API communication service for backend requests
 */

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const apiService = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiService.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiService.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    
    if (error.response?.status === 401) {
      // Only redirect if not on login/register pages
      const currentPath = window.location.pathname;
      if (!currentPath.includes('/login') && !currentPath.includes('/register')) {
        // Unauthorized - clear token and redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Authentication methods
apiService.login = async (email, password) => {
  try {
    console.log('apiService.login - Sending request to:', `${API_BASE_URL}/auth/login`);
    const response = await apiService.post('/auth/login', { email, password });
    console.log('apiService.login - Response received:', response.data);
    return response.data;
  } catch (error) {
    console.error('apiService.login - Error:', error.response?.data || error.message);
    throw error;
  }
};

apiService.register = async (username, email, password, firstName, lastName, role = 'student') => {
  try {
    // If first parameter is an object, use it directly (for backward compatibility)
    let userData;
    if (typeof username === 'object') {
      userData = username;
    } else {
      // Build userData object from parameters
      userData = {
        username,
        email,
        password,
        first_name: firstName && firstName.trim() ? firstName.trim() : username, // Use username as fallback
        last_name: lastName && lastName.trim() ? lastName.trim() : 'User', // Provide default last name
        role: role || 'student'
      };
    }
    
    console.log('Sending registration data:', { ...userData, password: '***' }); // Log without password
    
    const response = await apiService.post('/auth/register', userData);
    return response.data;
  } catch (error) {
    console.error('Registration API error:', error.response?.data || error.message);
    throw error;
  }
};

apiService.logout = async () => {
  try {
    const response = await apiService.post('/auth/logout');
    return response.data;
  } catch (error) {
    throw error;
  }
};

// User methods
apiService.getCurrentUser = async () => {
  try {
    const response = await apiService.get('/users/me');
    return response.data;
  } catch (error) {
    throw error;
  }
};

apiService.updateProfile = async (userData) => {
  try {
    const response = await apiService.put('/users/profile', userData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Analytics methods
apiService.getStudentAnalytics = async (studentId, timeRange) => {
  try {
    const response = await apiService.get(`/analytics/student/${studentId}`, {
      params: { timeRange }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

apiService.getClassAnalytics = async (classId, timeRange) => {
  try {
    const response = await apiService.get(`/analytics/class/${classId}`, {
      params: { timeRange }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Live session methods
apiService.createLiveSession = async (sessionData) => {
  try {
    const response = await apiService.post('/live-sessions', sessionData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

apiService.joinLiveSession = async (sessionId) => {
  try {
    const response = await apiService.post(`/live-sessions/${sessionId}/join`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

apiService.endLiveSession = async (sessionId) => {
  try {
    const response = await apiService.post(`/live-sessions/${sessionId}/end`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

apiService.getLiveSessionData = async (sessionId) => {
  try {
    const response = await apiService.get(`/live-sessions/${sessionId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Submit tracking data
apiService.submitTrackingData = async (sessionId, trackingData) => {
  try {
    const response = await apiService.post(`/live-sessions/${sessionId}/tracking`, trackingData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export default apiService;
