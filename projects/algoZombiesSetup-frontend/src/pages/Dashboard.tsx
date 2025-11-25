import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Trophy, Target, ArrowRight, Zap, Clock } from 'lucide-react';
import { useProgress } from '../context/ProgressContext';
import ProgressTracker from '../components/ProgressTracker';

const Dashboard = () => {
  const { progress, getTotalProgress, getCompletedCount } = useProgress();
  const totalProgress = getTotalProgress();
  const completedLessons = getCompletedCount();
  
  const calculateAverageScore = () => {
    const scores = Object.values(progress).filter(p => p.completed).map(p => p.score);
    return scores.length > 0 ? Math.round(scores.reduce((acc, score) => acc + score, 0) / scores.length) : 0;
  };

  // Progress badges for completed lessons/challenges
  const badges = Object.entries(progress)
    .filter(([_, p]) => p.completed)
    .map(([lessonId, p]) => (
      <span key={lessonId} className="inline-flex items-center px-3 py-1 mr-2 mb-2 rounded-full bg-green-800 text-green-200 text-xs font-semibold shadow">
        <Trophy className="w-3 h-3 mr-1" />
        {`Lesson ${lessonId}: ${p.score || 0}/100`}
      </span>
    ));
  
  const stats = [
    {
      icon: BookOpen,
      label: 'Lessons Completed',
      value: completedLessons,
      color: 'text-primary-500'
    },
    {
      icon: Trophy,
      label: 'Average Score',
      value: calculateAverageScore(),
      color: 'text-yellow-500'
    },
    {
      icon: Target,
      label: 'Progress',
      value: `${Math.round(totalProgress * 100)}%`,
      color: 'text-purple-500'
    },
    {
      icon: Clock,
      label: 'Study Time',
      value: `${completedLessons * 15}min`,
      color: 'text-blue-500'
    }
  ];

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      <h2 className="text-xl sm:text-2xl font-bold mb-4">Dashboard</h2>
      <ProgressTracker />
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 my-4 sm:my-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className={`p-3 sm:p-4 rounded-lg bg-dark-800 flex flex-col items-center shadow-lg border-b-4 ${stat.color}`}>
              <Icon className="w-6 h-6 sm:w-8 sm:h-8 mb-2" />
              <span className="text-base sm:text-lg font-bold">{stat.value}</span>
              <span className="text-xs text-gray-400 mt-1 text-center">{stat.label}</span>
            </div>
          );
        })}
      </div>
      
      <div className="my-6">
        <h3 className="text-lg font-semibold mb-2">Achievements</h3>
        <div className="flex flex-wrap items-center">
          {badges.length > 0 ? badges : (
            <>
              <Zap className="w-5 h-5 text-yellow-400 mr-2" />
              <span className="text-xs text-gray-400">Complete more lessons to earn badges!</span>
            </>
          )}
        </div>
      </div>
      
      <Link to="/lessons" className="btn-primary mt-6 inline-flex items-center">
        Go to Lessons <ArrowRight className="w-4 h-4 ml-2" />
      </Link>
    </div>
  );
};

export default Dashboard;