// Main App component - routing and layout setup
import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ErrorBoundary from './components/ErrorBoundary';
import { NotificationProvider } from './components/NotificationSystem';
import { PageLoading } from './components/Loading';
import Dashboard from './pages/Dashboard';
import Lessons from './pages/Lessons';
import LessonDetail from './pages/LessonDetail';
import About from './pages/About';
import Settings from './pages/Settings';
import { ProgressProvider } from './context/ProgressContext';



// Loading component
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-dark-900">
    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
  </div>
);

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