// API client for AlgoZombies backend communication
import { RateLimiter } from './crypto';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ApiConfig {
  baseURL: string;
  timeout: number;
  retries: number;
  rateLimit?: {
    requests: number;
    windowMs: number;
  };
}

export class ApiClient {
  private config: ApiConfig;
  private defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  constructor(config: Partial<ApiConfig> = {}) {
    this.config = {
      baseURL: config.baseURL || process.env.REACT_APP_API_URL || 'http://localhost:3001/api',
      timeout: config.timeout || 10000,
      retries: config.retries || 3,
      rateLimit: config.rateLimit || { requests: 100, windowMs: 60000 },
    };
  }

  // Set authentication token
  setAuthToken(token: string): void {
    this.defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  // Remove authentication token
  clearAuthToken(): void {
    delete this.defaultHeaders['Authorization'];
  }

  // Generic request method
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    attempt = 1
  ): Promise<ApiResponse<T>> {
    const url = `${this.config.baseURL}${endpoint}`;
    
    // Rate limiting check
    if (this.config.rateLimit) {
      const { requests, windowMs } = this.config.rateLimit;
      if (!RateLimiter.isAllowed('api_client', requests, windowMs)) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.defaultHeaders,
          ...options.headers,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error(`API request failed (attempt ${attempt}):`, error);

      // Retry logic
      if (attempt < this.config.retries && this.shouldRetry(error)) {
        await this.delay(Math.pow(2, attempt) * 1000); // Exponential backoff
        return this.request<T>(endpoint, options, attempt + 1);
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  // HTTP methods
  async get<T>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    const url = params ? `${endpoint}?${new URLSearchParams(params).toString()}` : endpoint;
    return this.request<T>(url, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // File upload
  async uploadFile<T>(endpoint: string, file: File, additionalData?: Record<string, any>): Promise<ApiResponse<T>> {
    const formData = new FormData();
    formData.append('file', file);
    
    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, String(value));
      });
    }

    return this.request<T>(endpoint, {
      method: 'POST',
      body: formData,
      headers: {
        // Remove Content-Type to let browser set it with boundary
        ...Object.fromEntries(
          Object.entries(this.defaultHeaders).filter(([key]) => key !== 'Content-Type')
        ),
      },
    });
  }

  // Helper methods
  private shouldRetry(error: any): boolean {
    if (error.name === 'AbortError') return false;
    if (error.message?.includes('Rate limit')) return false;
    return true;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Specific API endpoints for AlgoZombies
export class AlgoZombiesApi extends ApiClient {
  // User management
  async getUserProfile(): Promise<ApiResponse<any>> {
    return this.get('/user/profile');
  }

  async updateUserProfile(profile: any): Promise<ApiResponse<any>> {
    return this.put('/user/profile', profile);
  }

  async getUserProgress(): Promise<ApiResponse<any>> {
    return this.get('/user/progress');
  }

  async updateUserProgress(progress: any): Promise<ApiResponse<any>> {
    return this.put('/user/progress', progress);
  }

  // Lessons and challenges
  async getLessons(): Promise<ApiResponse<any[]>> {
    return this.get('/lessons');
  }

  async getLesson(lessonId: string): Promise<ApiResponse<any>> {
    return this.get(`/lessons/${lessonId}`);
  }

  async submitSolution(lessonId: string, solution: any): Promise<ApiResponse<any>> {
    return this.post(`/lessons/${lessonId}/submit`, solution);
  }

  async validateCode(code: string, language: string): Promise<ApiResponse<any>> {
    return this.post('/code/validate', { code, language });
  }

  async compileCode(code: string, language: string): Promise<ApiResponse<any>> {
    return this.post('/code/compile', { code, language });
  }

  // Leaderboard and achievements
  async getLeaderboard(timeframe?: string): Promise<ApiResponse<any[]>> {
    return this.get('/leaderboard', timeframe ? { timeframe } : undefined);
  }

  async getAchievements(): Promise<ApiResponse<any[]>> {
    return this.get('/achievements');
  }

  async unlockAchievement(achievementId: string): Promise<ApiResponse<any>> {
    return this.post(`/achievements/${achievementId}/unlock`);
  }

  // Smart contract interactions
  async deployContract(contractCode: string, params: any): Promise<ApiResponse<any>> {
    return this.post('/contracts/deploy', { code: contractCode, params });
  }

  async getContractStatus(contractId: string): Promise<ApiResponse<any>> {
    return this.get(`/contracts/${contractId}/status`);
  }

  async callContract(contractId: string, method: string, args: any[]): Promise<ApiResponse<any>> {
    return this.post(`/contracts/${contractId}/call`, { method, args });
  }

  // Analytics and feedback
  async trackEvent(event: string, properties?: any): Promise<ApiResponse<any>> {
    return this.post('/analytics/track', { event, properties, timestamp: Date.now() });
  }

  async submitFeedback(feedback: any): Promise<ApiResponse<any>> {
    return this.post('/feedback', feedback);
  }

  async reportIssue(issue: any): Promise<ApiResponse<any>> {
    return this.post('/issues', issue);
  }

  // Health check
  async healthCheck(): Promise<ApiResponse<any>> {
    return this.get('/health');
  }
}

// Mock API for development
export class MockApiClient extends ApiClient {
  private mockDelay = 1000; // Simulate network delay

  private async mockResponse<T>(data: T, shouldFail = false): Promise<ApiResponse<T>> {
    await this.delay(Math.random() * this.mockDelay);
    
    if (shouldFail) {
      return {
        success: false,
        error: 'Mock API error',
      };
    }

    return {
      success: true,
      data,
    };
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    console.log(`Mock GET: ${endpoint}`);
    
    // Mock different endpoints
    if (endpoint === '/lessons') {
      return this.mockResponse([
        { id: '1', title: 'Introduction to PyTeal', difficulty: 'beginner' },
        { id: '2', title: 'Smart Contract Basics', difficulty: 'intermediate' },
        { id: '3', title: 'Advanced TEAL Concepts', difficulty: 'advanced' },
      ] as T);
    }
    
    if (endpoint.startsWith('/lessons/')) {
      const lessonId = endpoint.split('/')[2];
      return this.mockResponse({
        id: lessonId,
        title: `Lesson ${lessonId}`,
        content: 'Mock lesson content...',
        challenges: [],
      } as T);
    }

    if (endpoint === '/user/progress') {
      return this.mockResponse({
        level: 3,
        xp: 1250,
        completedLessons: ['1', '2'],
        currentStreak: 5,
      } as T);
    }

    return this.mockResponse({} as T);
  }

  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    console.log(`Mock POST: ${endpoint}`, data);
    
    if (endpoint.includes('/submit')) {
      return this.mockResponse({
        correct: Math.random() > 0.3, // 70% success rate
        score: Math.floor(Math.random() * 100),
        feedback: 'Good job! Your solution works.',
      } as T);
    }

    if (endpoint === '/code/validate') {
      return this.mockResponse({
        valid: Math.random() > 0.2, // 80% valid rate
        errors: Math.random() > 0.8 ? ['Syntax error on line 5'] : [],
        warnings: [],
      } as T);
    }

    return this.mockResponse({ success: true } as T);
  }

  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    console.log(`Mock PUT: ${endpoint}`, data);
    return this.mockResponse({ updated: true } as T);
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    console.log(`Mock DELETE: ${endpoint}`);
    return this.mockResponse({ deleted: true } as T);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// API client instance
const isDevelopment = process.env.NODE_ENV === 'development';
const useMockApi = process.env.REACT_APP_USE_MOCK_API === 'true' || !process.env.REACT_APP_API_URL;

export const apiClient = useMockApi && isDevelopment 
  ? new MockApiClient()
  : new AlgoZombiesApi({
      baseURL: process.env.REACT_APP_API_URL,
      timeout: 15000,
      retries: 3,
    });

// Export convenience methods
export const api = {
  // Auth
  setToken: (token: string) => apiClient.setAuthToken(token),
  clearToken: () => apiClient.clearAuthToken(),
  
  // Quick access methods
  getLessons: () => (apiClient as AlgoZombiesApi).getLessons(),
  getLesson: (id: string) => (apiClient as AlgoZombiesApi).getLesson(id),
  submitSolution: (lessonId: string, solution: any) => 
    (apiClient as AlgoZombiesApi).submitSolution(lessonId, solution),
  validateCode: (code: string, language: string) => 
    (apiClient as AlgoZombiesApi).validateCode(code, language),
  trackEvent: (event: string, properties?: any) => 
    (apiClient as AlgoZombiesApi).trackEvent(event, properties),
};