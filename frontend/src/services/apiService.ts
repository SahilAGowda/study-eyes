/**
 * API service for handling HTTP requests to the backend
 */

import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';

export interface ApiError {
  message: string;
  status?: number;
  data?: any;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  created_at: string;
}

export interface StudySession {
  id: number;
  start_time: string;
  end_time?: string;
  duration: number;
  status: string;
  focus_percentage: number;
  average_attention_score: number;
  blink_rate: number;
  posture_score: number;
  fatigue_level: number;
  break_count: number;
  is_active: boolean;
}

export interface DashboardData {
  today: {
    date: string;
    total_sessions: number;
    total_study_time: number;
    average_focus_percentage: number;
    average_attention_score: number;
    productivity_score: number;
  };
  weekly: {
    total_study_time: number;
    total_sessions: number;
    average_focus_percentage: number;
    productivity_score: number;
  };
  active_session?: StudySession;
  recent_sessions: StudySession[];
}

class ApiService {
  private api: AxiosInstance;
  private token: string | null = null;

  constructor() {
    this.api = axios.create({
      baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        if (this.token) {
          config.headers.Authorization = `Bearer ${this.token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          this.clearToken();
          // Only redirect if we're not already on login/register page
          if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
            window.location.href = '/login';
          }
        }
        return Promise.reject(this.handleError(error));
      }
    );

    // Load token from localStorage
    this.loadToken();
  }

  /**
   * Set authentication token
   */
  setToken(token: string): void {
    this.token = token;
    localStorage.setItem('study_eyes_token', token);
  }

  /**
   * Clear authentication token
   */
  clearToken(): void {
    this.token = null;
    localStorage.removeItem('study_eyes_token');
  }

  /**
   * Load token from localStorage
   */
  private loadToken(): void {
    const token = localStorage.getItem('study_eyes_token');
    if (token) {
      this.token = token;
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.token;
  }

  /**
   * Handle API errors
   */
  private handleError(error: AxiosError): ApiError {
    const apiError: ApiError = {
      message: 'An unexpected error occurred',
      status: error.response?.status,
      data: error.response?.data,
    };

    if (error.response?.data) {
      const data = error.response.data as any;
      apiError.message = data.message || data.error || apiError.message;
    } else if (error.request) {
      apiError.message = 'Network error. Please check your connection.';
    } else {
      apiError.message = error.message;
    }

    return apiError;
  }  // Authentication API methods
  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    const response = await this.api.post('/auth/login', { email, password });
    const { access_token, user } = response.data;
    this.setToken(access_token);
    return { user, token: access_token };
  }
  async register(username: string, email: string, password: string): Promise<{ user: User; token: string }> {
    const response = await this.api.post('/auth/register', { 
      username, 
      email, 
      password,
      first_name: username.split(' ')[0] || 'Demo',
      last_name: username.split(' ')[1] || 'User'
    });
    const { access_token, user } = response.data;
    this.setToken(access_token);
    return { user, token: access_token };
  }

  async logout(): Promise<void> {
    await this.api.post('/auth/logout');
    this.clearToken();
  }

  async getProfile(): Promise<User> {
    const response = await this.api.get('/auth/profile');
    return response.data;
  }

  // Session API methods
  async startSession(): Promise<StudySession> {
    const response = await this.api.post('/sessions/start');
    return response.data;
  }

  async pauseSession(sessionId: number): Promise<StudySession> {
    const response = await this.api.post(`/sessions/${sessionId}/pause`);
    return response.data;
  }

  async resumeSession(sessionId: number): Promise<StudySession> {
    const response = await this.api.post(`/sessions/${sessionId}/resume`);
    return response.data;
  }

  async endSession(sessionId: number): Promise<StudySession> {
    const response = await this.api.post(`/sessions/${sessionId}/end`);
    return response.data;
  }

  async getSessions(limit?: number): Promise<StudySession[]> {
    const params = limit ? { limit } : {};
    const response = await this.api.get('/sessions', { params });
    return response.data;
  }

  async getActiveSession(): Promise<StudySession | null> {
    const response = await this.api.get('/sessions/active');
    return response.data;
  }

  // Analytics API methods
  async getDashboardData(period?: string): Promise<DashboardData> {
    const params = period ? { period } : {};
    const response = await this.api.get('/analytics/dashboard', { params });
    return response.data;
  }

  async getDailyAnalytics(startDate?: string, endDate?: string): Promise<any> {
    const params: any = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    const response = await this.api.get('/analytics/daily', { params });
    return response.data;
  }

  async getWeeklyAnalytics(): Promise<any> {
    const response = await this.api.get('/analytics/weekly');
    return response.data;
  }

  async getMonthlyAnalytics(): Promise<any> {
    const response = await this.api.get('/analytics/monthly');
    return response.data;
  }

  async getInsights(): Promise<any> {
    const response = await this.api.get('/analytics/insights');
    return response.data;
  }

  // User API methods
  async updateProfile(userData: Partial<User>): Promise<User> {
    const response = await this.api.put('/users/profile', userData);
    return response.data;
  }

  async updatePassword(oldPassword: string, newPassword: string): Promise<void> {
    await this.api.put('/users/password', { old_password: oldPassword, new_password: newPassword });
  }

  async updateSettings(settings: any): Promise<any> {
    const response = await this.api.put('/users/settings', settings);
    return response.data;
  }

  async getSettings(): Promise<any> {
    const response = await this.api.get('/users/settings');
    return response.data;
  }

  async exportData(format: 'json' | 'csv' = 'json'): Promise<Blob> {
    const response = await this.api.get(`/users/export`, {
      params: { format },
      responseType: 'blob',
    });
    return response.data;
  }

  async deleteAccount(): Promise<void> {
    await this.api.delete('/users/account');
    this.clearToken();
  }

  // Health check
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    const response = await this.api.get('/health');
    return response.data;
  }

  // ==================== STUDENT API METHODS ====================
  
  /**
   * Get student engagement data
   */
  async getStudentEngagement(studentId?: number): Promise<any> {
    const endpoint = studentId ? `/students/${studentId}/engagement` : '/students/engagement';
    const response = await this.api.get(endpoint);
    return response.data;
  }

  /**
   * Get student quizzes
   */
  async getStudentQuizzes(studentId?: number): Promise<any> {
    const endpoint = studentId ? `/students/${studentId}/quizzes` : '/students/quizzes';
    const response = await this.api.get(endpoint);
    return response.data;
  }

  /**
   * Submit quiz answer
   */
  async submitQuizAnswer(quizId: number, answers: any): Promise<any> {
    const response = await this.api.post(`/quizzes/${quizId}/submit`, { answers });
    return response.data;
  }

  /**
   * Get student reports
   */
  async getStudentReports(studentId?: number, params?: any): Promise<any> {
    const endpoint = studentId ? `/students/${studentId}/reports` : '/students/reports';
    const response = await this.api.get(endpoint, { params });
    return response.data;
  }

  /**
   * Get student notifications
   */
  async getStudentNotifications(): Promise<any> {
    const response = await this.api.get('/students/notifications');
    return response.data;
  }

  /**
   * Mark notification as read
   */
  async markNotificationRead(notificationId: number): Promise<any> {
    const response = await this.api.put(`/notifications/${notificationId}/read`);
    return response.data;
  }

  // ==================== TEACHER API METHODS ====================

  /**
   * Get teacher's live class data
   */
  async getTeacherClassData(classId?: number): Promise<any> {
    const endpoint = classId ? `/teachers/classes/${classId}` : '/teachers/classes';
    const response = await this.api.get(endpoint);
    return response.data;
  }

  /**
   * Start a live class
   */
  async startLiveClass(classData: any): Promise<any> {
    const response = await this.api.post('/teachers/classes/start', classData);
    return response.data;
  }

  /**
   * End a live class
   */
  async endLiveClass(classId: number): Promise<any> {
    const response = await this.api.post(`/teachers/classes/${classId}/end`);
    return response.data;
  }

  /**
   * Get teacher's students overview
   */
  async getTeacherStudents(params?: any): Promise<any> {
    const response = await this.api.get('/teachers/students', { params });
    return response.data;
  }

  /**
   * Get individual student data for teacher
   */
  async getStudentDataForTeacher(studentId: number): Promise<any> {
    const response = await this.api.get(`/teachers/students/${studentId}`);
    return response.data;
  }

  /**
   * Get teacher analytics
   */
  async getTeacherAnalytics(params?: any): Promise<any> {
    const response = await this.api.get('/teachers/analytics', { params });
    return response.data;
  }

  /**
   * Create quiz/exam
   */
  async createQuiz(quizData: any): Promise<any> {
    const response = await this.api.post('/teachers/quizzes', quizData);
    return response.data;
  }

  /**
   * Get teacher's quizzes
   */
  async getTeacherQuizzes(params?: any): Promise<any> {
    const response = await this.api.get('/teachers/quizzes', { params });
    return response.data;
  }

  /**
   * Get quiz results
   */
  async getQuizResults(quizId: number): Promise<any> {
    const response = await this.api.get(`/teachers/quizzes/${quizId}/results`);
    return response.data;
  }

  // ==================== MANAGEMENT/ADMIN API METHODS ====================

  /**
   * Get admin summary reports
   */
  async getAdminReports(params?: any): Promise<any> {
    const response = await this.api.get('/management/reports', { params });
    return response.data;
  }

  /**
   * Get department performance data
   */
  async getDepartmentPerformance(departmentId?: number): Promise<any> {
    const endpoint = departmentId 
      ? `/management/departments/${departmentId}/performance` 
      : '/management/departments/performance';
    const response = await this.api.get(endpoint);
    return response.data;
  }

  /**
   * Get all students analytics for management
   */
  async getManagementStudentsAnalytics(params?: any): Promise<any> {
    const response = await this.api.get('/management/students/analytics', { params });
    return response.data;
  }

  /**
   * Get all teachers overview for management
   */
  async getManagementTeachersOverview(params?: any): Promise<any> {
    const response = await this.api.get('/management/teachers', { params });
    return response.data;
  }

  /**
   * Get system-wide statistics
   */
  async getSystemStatistics(): Promise<any> {
    const response = await this.api.get('/management/statistics');
    return response.data;
  }

  /**
   * Update system settings
   */
  async updateSystemSettings(settings: any): Promise<any> {
    const response = await this.api.put('/management/settings', settings);
    return response.data;
  }

  /**
   * Get system settings
   */
  async getSystemSettings(): Promise<any> {
    const response = await this.api.get('/management/settings');
    return response.data;
  }

  /**
   * Get institutional dashboard data
   */
  async getInstitutionalDashboard(): Promise<any> {
    const response = await this.api.get('/management/dashboard');
    return response.data;
  }

  /**
   * Export institutional data
   */
  async exportInstitutionalData(format: 'json' | 'csv' | 'pdf' = 'csv', params?: any): Promise<Blob> {
    const response = await this.api.get('/management/export', {
      params: { format, ...params },
      responseType: 'blob',
    });
    return response.data;
  }

  /**
   * Manage user roles (admin only)
   */
  async updateUserRole(userId: number, role: string): Promise<any> {
    const response = await this.api.put(`/management/users/${userId}/role`, { role });
    return response.data;
  }

  /**
   * Get all users (admin only)
   */
  async getAllUsers(params?: any): Promise<any> {
    const response = await this.api.get('/management/users', { params });
    return response.data;
  }
}

// Export singleton instance
const apiService = new ApiService();
export default apiService;
