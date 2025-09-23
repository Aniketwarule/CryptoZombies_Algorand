// API utility functions for AlgoZombies
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  error?: string;
}

export interface LessonData {
  id: string;
  title: string;
  content: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: number;
  prerequisites: string[];
}

export interface UserProgress {
  userId: string;
  lessonId: string;
  completed: boolean;
  score: number;
  timeSpent: number;
  completedAt?: Date;
}

// Base API configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      const config: RequestInit = {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      };

      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'API request failed');
      }

      return {
        data,
        success: true,
      };
    } catch (error) {
      return {
        data: null as any,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // Lesson-related API calls
  async getLessons(): Promise<ApiResponse<LessonData[]>> {
    return this.request<LessonData[]>('/api/lessons');
  }

  async getLesson(id: string): Promise<ApiResponse<LessonData>> {
    return this.request<LessonData>(`/api/lessons/${id}`);
  }

  // Progress-related API calls
  async saveProgress(progress: UserProgress): Promise<ApiResponse<void>> {
    return this.request<void>('/api/progress', {
      method: 'POST',
      body: JSON.stringify(progress),
    });
  }

  async getUserProgress(userId: string): Promise<ApiResponse<UserProgress[]>> {
    return this.request<UserProgress[]>(`/api/progress/${userId}`);
  }

  // Code validation
  async validateCode(code: string, lessonId: string): Promise<ApiResponse<{
    isValid: boolean;
    score: number;
    feedback: string;
  }>> {
    return this.request('/api/validate', {
      method: 'POST',
      body: JSON.stringify({ code, lessonId }),
    });
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Utility functions for localStorage fallback
export const localStorageApi = {
  saveProgress: (progress: UserProgress) => {
    const existing = JSON.parse(localStorage.getItem('algozombies-progress') || '[]');
    const updated = existing.filter((p: UserProgress) => 
      !(p.userId === progress.userId && p.lessonId === progress.lessonId)
    );
    updated.push(progress);
    localStorage.setItem('algozombies-progress', JSON.stringify(updated));
  },

  getUserProgress: (userId: string): UserProgress[] => {
    const progress = JSON.parse(localStorage.getItem('algozombies-progress') || '[]');
    return progress.filter((p: UserProgress) => p.userId === userId);
  },

  clearProgress: () => {
    localStorage.removeItem('algozombies-progress');
  }
};