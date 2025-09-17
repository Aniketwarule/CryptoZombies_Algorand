import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Trophy, Target, ArrowRight, Zap, Code, Users, Globe, Clock } from 'lucide-react';
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

  const features = [
    {
      icon: Code,
      title: 'Interactive Coding',
      description: 'Learn PyTeal smart contracts with hands-on coding challenges'
    },
    {
      icon: Globe,
      title: 'Algorand TestNet',
      description: 'Deploy and test your contracts on the Algorand blockchain'
    },
    {
      icon: Users,
      title: 'Community Driven',
      description: 'Join thousands of developers learning Algorand together'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-dark-900 via-dark-800 to-purple-900/20 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <div className="flex justify-center mb-6">
              <motion.div
                animate={{ rotate: [0, 15, -15, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              >
                <Zap className="h-20 w-20 text-primary-500" />
              </motion.div>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-primary-500 via-purple-500 to-primary-500 bg-clip-text text-transparent">
                AlgoZombies
              </span>
            </h1>
            <p className="text-xl text-gray-400 mb-8 max-w-3xl mx-auto">
              Learn Algorand smart contracts by building games step by step. 
              Master PyTeal, deploy on TestNet, and become a blockchain developer.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/lessons">
                <motion.button
                  className="btn-primary px-8 py-4 text-lg flex items-center space-x-2 animate-pulse-glow"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span>Start Learning</span>
                  <ArrowRight className="h-5 w-5" />
                </motion.button>
              </Link>
              <Link to="/about">
                <motion.button
                  className="btn-secondary px-8 py-4 text-lg"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Learn More
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-16 bg-dark-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="card text-center"
                >
                  <Icon className={`h-12 w-12 mx-auto mb-4 ${stat.color}`} />
                  <div className={`text-3xl font-bold mb-2 ${stat.color}`}>
                    {stat.value}
                  </div>
                  <div className="text-gray-400">{stat.label}</div>
                </motion.div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <ProgressTracker />
            </div>
            
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link
                  to="/lessons"
                  className="block p-4 bg-dark-700 hover:bg-dark-600 rounded-lg transition-colors duration-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <BookOpen className="h-5 w-5 text-primary-500" />
                      <span>Browse All Lessons</span>
                    </div>
                    <ArrowRight className="h-4 w-4 text-gray-400" />
                  </div>
                </Link>
                
                <Link
                  to="/lessons/intro-algorand"
                  className="block p-4 bg-dark-700 hover:bg-dark-600 rounded-lg transition-colors duration-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Target className="h-5 w-5 text-yellow-500" />
                      <span>Continue Learning</span>
                    </div>
                    <ArrowRight className="h-4 w-4 text-gray-400" />
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4">Why AlgoZombies?</h2>
            <p className="text-xl text-gray-400">
              The most engaging way to learn Algorand smart contract development
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="card-hover text-center"
                >
                  <Icon className="h-12 w-12 mx-auto mb-4 text-primary-500" />
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-400">{feature.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;