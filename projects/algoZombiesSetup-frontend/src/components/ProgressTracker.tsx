import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Circle, Trophy, Star } from 'lucide-react';
import { useProgress } from '../context/ProgressContext';

interface ProgressTrackerProps {
  lessonId?: string;
}



const ProgressTracker: React.FC<ProgressTrackerProps> = React.memo(({ lessonId }) => {
  const { progress, getTotalProgress } = useProgress();
  const totalProgress = getTotalProgress();



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
});

ProgressTracker.displayName = 'ProgressTracker';

export default ProgressTracker;