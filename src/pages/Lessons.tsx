import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Clock, Trophy, CheckCircle, Lock, Filter, Search } from 'lucide-react';
import { useProgress } from '../context/ProgressContext';

const Lessons = () => {
  const { progress } = useProgress();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');

  const difficulties = ['All', 'Beginner', 'Intermediate', 'Advanced'];

  const lessons = [
    {
      id: 'intro-algorand',
      title: 'Introduction to Algorand',
      description: 'Learn the basics of Algorand blockchain and its unique features',
      difficulty: 'Beginner',
      duration: '30 min',
      unlocked: true,
      topics: ['Blockchain Basics', 'Algorand Overview', 'Consensus Mechanism']
    },
    {
      id: 'first-pyteal-contract',
      title: 'Your First PyTeal Contract',
      description: 'Write your first smart contract using PyTeal',
      difficulty: 'Beginner',
      duration: '45 min',
      unlocked: true,
      topics: ['PyTeal Syntax', 'Basic Operations', 'Contract Structure']
    },
    {
      id: 'algorand-standard-assets',
      title: 'Algorand Standard Assets',
      description: 'Create and manage tokens on the Algorand blockchain',
      difficulty: 'Intermediate',
      duration: '60 min',
      unlocked: progress['first-pyteal-contract']?.completed || false,
      topics: ['ASA Creation', 'Token Management', 'Asset Configuration']
    },
    {
      id: 'zombie-game-basics',
      title: 'Zombie Game: Basic Mechanics',
      description: 'Build the foundation of your zombie game smart contract',
      difficulty: 'Intermediate',
      duration: '75 min',
      unlocked: progress['algorand-standard-assets']?.completed || false,
      topics: ['Game Logic', 'State Management', 'Random Generation']
    },
    {
      id: 'zombie-battles',
      title: 'Zombie Battles & Combat',
      description: 'Implement battle mechanics and combat systems',
      difficulty: 'Advanced',
      duration: '90 min',
      unlocked: progress['zombie-game-basics']?.completed || false,
      topics: ['Combat Logic', 'Experience System', 'Battle Rewards']
    },
    {
      id: 'marketplace-integration',
      title: 'Zombie Marketplace',
      description: 'Create a decentralized marketplace for zombie trading',
      difficulty: 'Advanced',
      duration: '120 min',
      unlocked: progress['zombie-battles']?.completed || false,
      topics: ['Atomic Transfers', 'Escrow Contracts', 'Price Oracles']
    },
    {
      id: 'advanced-pyteal-ops',
      title: 'Advanced PyTeal Operations & Optimization',
      description: 'Dive deep into complex PyTeal features, opcodes, and contract optimization.',
      difficulty: 'Expert',
      duration: '150 min',
      unlocked: progress['marketplace-integration']?.completed || false,
      topics: ['ABI Standard', 'Global State Optimization', 'Inner Transactions', 'Box Storage']
    },
    {
      id: 'defi-swap-contract',
      title: 'Building a DeFi Swap Contract',
      description: 'Develop a simplified Automated Market Maker (AMM) style contract using Algorand Standard Assets.',
      difficulty: 'Expert',
      duration: '180 min',
      unlocked: progress['advanced-pyteal-ops']?.completed || false,
      topics: ['Liquidity Pools', 'Exchange Logic', 'Slippage Control', 'Decentralized Finance']
    },
    {
      id: 'smart-contract-security',
      title: 'Algorand Smart Contract Security',
      description: 'Learn best practices for auditing and securing your PyTeal smart contracts against common exploits.',
      difficulty: 'Expert',
      duration: '100 min',
      unlocked: progress['defi-swap-contract']?.completed || false,
      topics: ['Re-entrancy Prevention', 'Logic Auditing', 'State Management Pitfalls', 'Security Best Practices']
    }
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'Intermediate':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'Advanced':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <div className="min-h-screen py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold mb-4">
            Learn <span className="text-primary-500">Algorand</span> Development
          </h1>
          <p className="text-xl text-gray-400">
            Master smart contract development through interactive lessons and projects
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {lessons.map((lesson, index) => {
            const lessonProgress = progress[lesson.id];
            const isCompleted = lessonProgress?.completed || false;
            const score = lessonProgress?.score || 0;

            return (
              <motion.div
                key={lesson.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className={`card-hover relative ${!lesson.unlocked ? 'opacity-60' : ''}`}
              >
                {!lesson.unlocked && (
                  <div className="absolute top-4 right-4 z-10">
                    <Lock className="h-6 w-6 text-gray-500" />
                  </div>
                )}

                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${isCompleted ? 'bg-primary-500/20' : 'bg-dark-700'}`}>
                      {isCompleted ? (
                        <CheckCircle className="h-6 w-6 text-primary-500" />
                      ) : (
                        <BookOpen className="h-6 w-6 text-gray-400" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold">{lesson.title}</h3>
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(lesson.difficulty)}`}>
                        {lesson.difficulty}
                      </span>
                    </div>
                  </div>
                  
                  {isCompleted && score > 0 && (
                    <div className="flex items-center space-x-2">
                      <Trophy className="h-5 w-5 text-yellow-500" />
                      <span className="font-semibold text-yellow-500">{score}</span>
                    </div>
                  )}
                </div>

                <p className="text-gray-400 mb-4">{lesson.description}</p>

                <div className="flex items-center space-x-4 mb-4">
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <Clock className="h-4 w-4" />
                    <span>{lesson.duration}</span>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex flex-wrap gap-2">
                    {lesson.topics.map((topic) => (
                      <span
                        key={topic}
                        className="px-2 py-1 bg-dark-700 text-xs rounded-md text-gray-300"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end">
                  {lesson.unlocked ? (
                    <Link to={`/lessons/${lesson.id}`}>
                      <motion.button
                        className="btn-primary"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {isCompleted ? 'Review' : 'Start Lesson'}
                      </motion.button>
                    </Link>
                  ) : (
                    <button
                      disabled
                      className="btn-secondary opacity-50 cursor-not-allowed"
                    >
                      Locked
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Lessons;
