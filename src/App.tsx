// Main App component - routing and layout setup
import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ErrorBoundary from './components/ErrorBoundary';
import { NotificationProvider } from './components/NotificationSystem';
import { PageLoading } from './components/Loading';
import { ProgressProvider } from './context/ProgressContext';

// Lazy load pages for better performance
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Lessons = lazy(() => import('./pages/Lessons'));
const LessonDetail = lazy(() => import('./pages/LessonDetail'));
const About = lazy(() => import('./pages/About'));
const Settings = lazy(() => import('./pages/Settings'));





function App() {
  return (
    <ErrorBoundary>
      <NotificationProvider>
        <ProgressProvider>
          <div className="min-h-screen flex flex-col bg-dark-900">
            <Navbar />
            <main className="flex-1">
              <Suspense fallback={<PageLoading message="Loading AlgoZombies..." />}>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/lessons" element={<Lessons />} />
                  <Route path="/lessons/:lessonId" element={<LessonDetail />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Suspense>
            </main>
            <Footer />
          </div>
        </ProgressProvider>
      </NotificationProvider>
    </ErrorBoundary>
  );
}

export default App;