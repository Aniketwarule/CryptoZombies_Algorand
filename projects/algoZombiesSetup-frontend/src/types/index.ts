import React from 'react';

// Type definitions for AlgoZombies app
export interface Lesson {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number; // in minutes
  topics: string[];
  completed: boolean;
  code?: string;
}

export interface User {
  id: string;
  walletAddress?: string;
  username: string;
  completedLessons: string[];
  progress: number; // percentage
  joinDate: Date;
}

export interface WalletState {
  isConnected: boolean;
  address: string | null;
  balance: number;
  loading: boolean;
  error: string | null;
}

export interface NavItem {
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}