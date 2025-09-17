import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface LessonProgress {
  completed: boolean;
  score: number;
  completedAt?: Date;
}

interface ProgressContextType {
  progress: Record<string, LessonProgress>;
  completeLesson: (lessonId: string, score: number) => void;
  getTotalProgress: () => number;
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

export const useProgress = () => {
  const context = useContext(ProgressContext);
  if (context === undefined) {
    throw new Error('useProgress must be used within a ProgressProvider');
  }
  return context;
};

interface ProgressProviderProps {
  children: ReactNode;
}

const STORAGE_KEY = 'algozombies-progress';

export const ProgressProvider: React.FC<ProgressProviderProps> = ({ children }) => {
  const [progress, setProgress] = useState<Record<string, LessonProgress>>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('Failed to load progress from localStorage:', error);
      return {};
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch (error) {
      console.error('Failed to save progress to localStorage:', error);
    }
  }, [progress]);

  const completeLesson = (lessonId: string, score: number) => {
    setProgress(prev => ({
      ...prev,
      [lessonId]: {
        completed: true,
        score,
        completedAt: new Date()
      }
    }));
  };

  const getTotalProgress = () => {
    const totalLessons = 6; // Total number of lessons available
    const completedLessons = Object.values(progress).filter(p => p.completed).length;
    return completedLessons / totalLessons;
  };

  const value = {
    progress,
    completeLesson,
    getTotalProgress
  };

  return (
    <ProgressContext.Provider value={value}>
      {children}
    </ProgressContext.Provider>
  );
};