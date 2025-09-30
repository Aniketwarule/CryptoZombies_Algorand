// Main App component - routing and layout setup
import React, { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { NotificationProvider } from './components/NotificationSystem';
import { PageLoading } from './components/Loading';
import Dashboard from './pages/Dashboard';
import Lessons from './pages/Lessons';
import LessonDetail from './pages/LessonDetail';
import About from './pages/About';
import Settings from './pages/Settings';
import { ProgressProvider } from './context/ProgressContext';

// Error boundary component
class AppErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('App Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-dark-900 text-white">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Oops! Something went wrong</h1>
            <p className="text-gray-400 mb-6">We're sorry for the inconvenience</p>
            <button
              onClick={() => window.location.reload()}
              className="btn-primary"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// Loading component
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-dark-900">
    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
  </div>
);

function App() {
  return (
    <AppErrorBoundary>
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
    </AppErrorBoundary>
  );
}

export default App;