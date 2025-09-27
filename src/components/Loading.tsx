import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: string;
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'text-primary-500',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16',
  };

  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      className={className}
    >
      <Loader2 className={`${sizeClasses[size]} ${color}`} />
    </motion.div>
  );
};

interface LoadingDotsProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  className?: string;
}

export const LoadingDots: React.FC<LoadingDotsProps> = ({
  size = 'md',
  color = 'bg-primary-500',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'h-2 w-2',
    md: 'h-3 w-3',
    lg: 'h-4 w-4',
  };

  const dotVariants = {
    initial: { y: 0 },
    animate: { y: -10 },
  };

  return (
    <div className={`flex space-x-1 ${className}`}>
      {[0, 1, 2].map((index) => (
        <motion.div
          key={index}
          className={`rounded-full ${sizeClasses[size]} ${color}`}
          variants={dotVariants}
          initial="initial"
          animate="animate"
          transition={{
            duration: 0.6,
            repeat: Infinity,
            repeatType: 'reverse',
            delay: index * 0.1,
          }}
        />
      ))}
    </div>
  );
};

interface LoadingPulseProps {
  children?: React.ReactNode;
  className?: string;
}

export const LoadingPulse: React.FC<LoadingPulseProps> = ({
  children,
  className = '',
}) => {
  return (
    <motion.div
      animate={{ opacity: [0.4, 1, 0.4] }}
      transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
      className={className}
    >
      {children || <div className="bg-dark-700 rounded animate-pulse h-4 w-full" />}
    </motion.div>
  );
};

interface LoadingSkeletonProps {
  lines?: number;
  className?: string;
  showAvatar?: boolean;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  lines = 3,
  className = '',
  showAvatar = false,
}) => {
  return (
    <div className={`animate-pulse ${className}`}>
      {showAvatar && (
        <div className="flex items-center space-x-4 mb-4">
          <div className="rounded-full bg-dark-700 h-10 w-10" />
          <div className="flex-1">
            <div className="h-4 bg-dark-700 rounded w-1/4 mb-2" />
            <div className="h-3 bg-dark-700 rounded w-1/2" />
          </div>
        </div>
      )}
      <div className="space-y-2">
        {Array.from({ length: lines }, (_, index) => (
          <div
            key={index}
            className={`h-4 bg-dark-700 rounded ${
              index === lines - 1 ? 'w-3/4' : 'w-full'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

interface LoadingCardProps {
  count?: number;
  className?: string;
}

export const LoadingCard: React.FC<LoadingCardProps> = ({
  count = 1,
  className = '',
}) => {
  return (
    <div className={className}>
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="card animate-pulse mb-6">
          <div className="h-6 bg-dark-700 rounded w-1/3 mb-4" />
          <div className="space-y-2">
            <div className="h-4 bg-dark-700 rounded w-full" />
            <div className="h-4 bg-dark-700 rounded w-5/6" />
            <div className="h-4 bg-dark-700 rounded w-4/6" />
          </div>
          <div className="flex space-x-2 mt-4">
            <div className="h-8 bg-dark-700 rounded w-20" />
            <div className="h-8 bg-dark-700 rounded w-16" />
          </div>
        </div>
      ))}
    </div>
  );
};

interface PageLoadingProps {
  message?: string;
  showLogo?: boolean;
}

export const PageLoading: React.FC<PageLoadingProps> = ({
  message = 'Loading...',
  showLogo = true,
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-900">
      <div className="text-center">
        {showLogo && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <div className="w-20 h-20 bg-primary-500 rounded-full flex items-center justify-center mx-auto">
              <span className="text-2xl font-bold text-white">AZ</span>
            </div>
          </motion.div>
        )}
        <LoadingSpinner size="lg" className="mx-auto mb-4" />
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-gray-400 text-lg"
        >
          {message}
        </motion.p>
      </div>
    </div>
  );
};

// Hook for managing loading states
export const useLoading = (initialState = false) => {
  const [isLoading, setIsLoading] = React.useState(initialState);

  const startLoading = React.useCallback(() => setIsLoading(true), []);
  const stopLoading = React.useCallback(() => setIsLoading(false), []);
  const toggleLoading = React.useCallback(() => setIsLoading(prev => !prev), []);

  return {
    isLoading,
    startLoading,
    stopLoading,
    toggleLoading,
  };
};