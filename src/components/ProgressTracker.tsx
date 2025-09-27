import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle, Circle, Trophy, Star, Clock, Target, TrendingUp, 
  Award, Zap, Calendar, BarChart3, Activity 
} from 'lucide-react';
import { useProgress } from '../context/ProgressContext';

interface ProgressTrackerProps {
  lessonId?: string;
  showStats?: boolean;
  compact?: boolean;
  showAnimation?: boolean;
  showStreak?: boolean;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType;
  unlocked: boolean;
  progress?: number;
  maxProgress?: number;
}

const ProgressTracker: React.FC<ProgressTrackerProps> = ({ 
  lessonId, 
  showStats = false,
  compact = false,
  showAnimation = true,
  showStreak = true
}) => {
  const { progress, getTotalProgress, getCompletedCount } = useProgress();
  const [showAchievements, setShowAchievements] = useState(false);
  const [animatedProgress, setAnimatedProgress] = useState(0);
  const totalProgress = getTotalProgress();
  const completedLessons = getCompletedCount();

  const calculateAverageScore = () => {
    const scores = Object.values(progress)
      .filter(p => p.completed)
      .map(p => p.score);
    return scores.length > 0 ? Math.round(scores.reduce((acc, score) => acc + score, 0) / scores.length) : 0;
  };

  const calculateStreak = () => {
    // Mock streak calculation - in real app would be based on dates
    return Math.floor(Math.random() * 15) + 1;
  };

  const calculateXP = () => {
    return Object.values(progress)
      .filter(p => p.completed)
      .reduce((total, p) => total + p.score, 0);
  };

  const getAchievements = (): Achievement[] => {
    const currentXP = calculateXP();
    const streak = calculateStreak();
    
    return [
      {
        id: 'first_lesson',
        title: 'First Steps',
        description: 'Complete your first lesson',
        icon: Star,
        unlocked: completedLessons > 0
      },
      {
        id: 'streak_master',
        title: 'Streak Master',
        description: 'Maintain a 7-day learning streak',
        icon: Zap,
        unlocked: streak >= 7,
        progress: Math.min(streak, 7),
        maxProgress: 7
      },
      {
        id: 'high_scorer',
        title: 'High Scorer',
        description: 'Achieve an average score of 90+',
        icon: Trophy,
        unlocked: calculateAverageScore() >= 90,
        progress: calculateAverageScore(),
        maxProgress: 100
      },
      {
        id: 'dedicated_learner',
        title: 'Dedicated Learner',
        description: 'Complete 10 lessons',
        icon: Target,
        unlocked: completedLessons >= 10,
        progress: completedLessons,
        maxProgress: 10
      }
    ];
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return 'from-green-400 to-green-600';
    if (percentage >= 60) return 'from-blue-400 to-blue-600';
    if (percentage >= 40) return 'from-yellow-400 to-yellow-600';
    return 'from-red-400 to-red-600';
  };

  // Animate progress on mount
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedProgress(totalProgress);
    }, 500);
    return () => clearTimeout(timer);
  }, [totalProgress]);

  if (lessonId) {
    const lessonProgress = progress[lessonId] || { completed: false, score: 0 };
    return (
      <div className="card">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Lesson Progress</h3>
          {lessonProgress.completed ? (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex items-center space-x-2 text-primary-500"
            >
              <CheckCircle className="h-6 w-6" />
              <span className="font-semibold">Completed</span>
            </motion.div>
          ) : (
            <div className="flex items-center space-x-2 text-gray-400">
              <Circle className="h-6 w-6" />
              <span>In Progress</span>
            </div>
          )}
        </div>
        
        {lessonProgress.score > 0 && (
          <div className="mt-4">
            <div className="flex items-center space-x-2">
              <Star className="h-5 w-5 text-yellow-500" />
              <span className="text-sm text-gray-400">Score:</span>
              <span className="font-semibold text-yellow-500">
                {lessonProgress.score}/100
              </span>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Overall Progress</h3>
        <div className="flex items-center space-x-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          <span className="text-2xl font-bold text-primary-500">
            {Math.round(totalProgress * 100)}%
          </span>
        </div>
      </div>
      
      <div className="space-y-3">
        <div>
          <div className="flex justify-between text-sm text-gray-400 mb-1">
            <span>Progress</span>
            <span>{Math.round(totalProgress * 100)}%</span>
          </div>
          <div className="w-full bg-dark-700 rounded-full h-2">
            <motion.div
              className="bg-gradient-to-r from-primary-500 to-purple-500 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${totalProgress * 100}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-400">Completed:</span>
            <div className="font-semibold text-primary-500">
              {Object.values(progress).filter(p => p.completed).length} lessons
            </div>
          </div>
          <div>
            <span className="text-gray-400">Average Score:</span>
            <div className="font-semibold text-yellow-500">
              {Math.round(
                Object.values(progress).reduce((acc, p) => acc + p.score, 0) / 
                Math.max(Object.values(progress).length, 1)
              )}/100
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressTracker;