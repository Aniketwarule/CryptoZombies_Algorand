// AlgoZombies - Educational platform for Algorand development
import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, BookOpen, Home, Info, User, Settings, LogOut, ChevronDown, Trophy, Heart } from 'lucide-react';
import WalletConnect from './WalletConnect';
import { useWallet } from '../hooks/useWallet';

/**
 * Navigation bar component for the AlgoZombies application
 * Features responsive design with wallet connection integration and user profile menu
 */
const Navbar = () => {
  const location = useLocation();
  const { isConnected, disconnect } = useWallet();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Mock user data - in real app this would come from context or API
  const userData = {
    username: 'AlgoLearner',
    level: 5,
    xp: 1250,
    nextLevelXp: 1500,
    streak: 7,
    completedLessons: 12,
    avatar: null, // Would be avatar URL in real app
  };

  // Navigation menu items configuration
  const navItems = [
    { path: '/', icon: Home, label: 'Dashboard' },
    { path: '/lessons', icon: BookOpen, label: 'Lessons' },
    { path: '/about', icon: Info, label: 'About' },
  ];

  return (
    <nav className="bg-dark-800 border-b border-dark-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <motion.div
              whileHover={{ rotate: 15 }}
              transition={{ type: "spring", stiffness: 300, damping: 10 }}
            >
              <Zap className="h-8 w-8 text-primary-500" />
            </motion.div>
            <span className="font-bold text-xl bg-gradient-to-r from-primary-500 to-purple-500 bg-clip-text text-transparent">
              AlgoZombies
            </span>
          </Link>

                    {/* Navigation Menu */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-primary-400 bg-primary-900/20'
                      : 'text-gray-300 hover:text-white hover:bg-dark-700'
                  }`}
                >
                  <Icon size={16} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Right side - Profile and Wallet */}
          <div className="flex items-center space-x-4">
            {isConnected ? (
              <div className="flex items-center space-x-4">
                {/* User Stats Quick View */}
                <div className="hidden lg:flex items-center space-x-4 text-sm">
                  <div className="flex items-center space-x-1">
                    <Trophy className="h-4 w-4 text-yellow-500" />
                    <span className="text-gray-300">Level {userData.level}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Heart className="h-4 w-4 text-red-500" />
                    <span className="text-gray-300">{userData.streak} day streak</span>
                  </div>
                </div>

                {/* Profile Dropdown */}
                <div className="relative" ref={profileMenuRef}>
                  <button
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    className="flex items-center space-x-2 bg-dark-700 rounded-full p-2 hover:bg-dark-600 transition-colors"
                  >
                    <div className="h-8 w-8 bg-gradient-to-r from-primary-500 to-purple-500 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-white" />
                    </div>
                    <span className="hidden md:block text-sm font-medium text-gray-300">
                      {userData.username}
                    </span>
                    <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Profile Dropdown Menu */}
                  <AnimatePresence>
                    {isProfileMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-2 w-72 bg-dark-800 rounded-lg shadow-xl border border-dark-600 z-50"
                      >
                        {/* Profile Header */}
                        <div className="p-4 border-b border-dark-600">
                          <div className="flex items-center space-x-3">
                            <div className="h-12 w-12 bg-gradient-to-r from-primary-500 to-purple-500 rounded-full flex items-center justify-center">
                              <User className="h-6 w-6 text-white" />
                            </div>
                            <div>
                              <h3 className="font-medium text-white">{userData.username}</h3>
                              <p className="text-sm text-gray-400">Level {userData.level} • {userData.completedLessons} lessons completed</p>
                            </div>
                          </div>
                          
                          {/* XP Progress Bar */}
                          <div className="mt-3">
                            <div className="flex justify-between text-xs text-gray-400 mb-1">
                              <span>{userData.xp} XP</span>
                              <span>{userData.nextLevelXp} XP</span>
                            </div>
                            <div className="w-full bg-dark-700 rounded-full h-2">
                              <div 
                                className="bg-gradient-to-r from-primary-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${(userData.xp / userData.nextLevelXp) * 100}%` }}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Profile Menu Items */}
                        <div className="py-2">
                          <Link
                            to="/profile"
                            className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-300 hover:bg-dark-700 hover:text-white transition-colors"
                            onClick={() => setIsProfileMenuOpen(false)}
                          >
                            <User className="h-4 w-4" />
                            <span>View Profile</span>
                          </Link>
                          <Link
                            to="/settings"
                            className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-300 hover:bg-dark-700 hover:text-white transition-colors"
                            onClick={() => setIsProfileMenuOpen(false)}
                          >
                            <Settings className="h-4 w-4" />
                            <span>Settings</span>
                          </Link>
                          <div className="border-t border-dark-600 my-2" />
                          <button
                            onClick={() => {
                              disconnect();
                              setIsProfileMenuOpen(false);
                            }}
                            className="flex items-center space-x-3 px-4 py-2 text-sm text-red-400 hover:bg-dark-700 transition-colors w-full text-left"
                          >
                            <LogOut className="h-4 w-4" />
                            <span>Disconnect Wallet</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            ) : (
              <WalletConnect />
            )}
          </div>

          <WalletConnect />
        </div>
      </div>

      {/* Mobile menu */}
      <div className="md:hidden">
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-dark-800 border-t border-dark-700">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 flex items-center space-x-2 ${
                  isActive
                    ? 'bg-primary-500 text-white'
                    : 'text-gray-300 hover:bg-dark-700 hover:text-white'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;