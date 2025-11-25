// Performance monitoring and analytics utilities
import { onCLS, onFCP, onLCP, onTTFB, type Metric } from 'web-vitals';

interface PerformanceMetrics {
  // Core Web Vitals
  cls?: number;
  fcp?: number;
  fid?: number;
  lcp?: number;
  ttfb?: number;

  // Custom metrics
  interactionLatency?: number;
  customMetrics?: Record<string, number>;

  // Page info
  url: string;
  timestamp: number;
  userAgent: string;
  connectionType?: string;
}

interface AnalyticsEvent {
  event: string;
  category: string;
  action: string;
  label?: string;
  value?: number;
  custom_parameters?: Record<string, any>;
  timestamp: number;
}

class AlgoZombiesAnalytics {
  private metrics: PerformanceMetrics[] = [];
  private events: AnalyticsEvent[] = [];
  private sessionId: string;
  private userId?: string;
  private isEnabled: boolean = true;
  private batchSize: number = 10;
  private batchTimeout: number = 30000; // 30 seconds
  private pendingBatch: (PerformanceMetrics | AnalyticsEvent)[] = [];
  private batchTimer?: NodeJS.Timeout;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.initializeWebVitals();
    this.initializeCustomMetrics();
    this.initializeErrorTracking();

    // Start batch processing
    this.startBatchProcessing();

    // Send data before page unload
    window.addEventListener('beforeunload', () => {
      this.flush();
    });

    // Send data when page becomes hidden
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        this.flush();
      }
    });

    console.log('[Analytics] Initialized with session ID:', this.sessionId);
  }

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private initializeWebVitals(): void {
    const onMetric = (metric: Metric) => {
      const performanceData: PerformanceMetrics = {
        [metric.name.toLowerCase()]: metric.value,
        url: window.location.href,
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
        connectionType: this.getConnectionType(),
      };

      this.metrics.push(performanceData);
      this.addToBatch(performanceData);

      console.log(`[Analytics] ${metric.name}:`, metric.value);
    };

    // Collect Core Web Vitals
    onCLS(onMetric);
    onFCP(onMetric);
    // onFID is deprecated in web-vitals v3, use INP instead
    onLCP(onMetric);
    onTTFB(onMetric);
  }

  private initializeCustomMetrics(): void {
    // Monitor React rendering performance
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      try {
        // Monitor long tasks
        const longTaskObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.duration > 50) { // Tasks longer than 50ms
              this.trackEvent('performance', 'long_task', 'duration', entry.duration);
            }
          }
        });
        longTaskObserver.observe({ entryTypes: ['longtask'] });

        // Monitor navigation timing
        const navigationObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            const navEntry = entry as PerformanceNavigationTiming;
            this.trackCustomMetric('dom_content_loaded', navEntry.domContentLoadedEventEnd - navEntry.fetchStart);
            this.trackCustomMetric('page_load_time', navEntry.loadEventEnd - navEntry.fetchStart);
          }
        });
        navigationObserver.observe({ entryTypes: ['navigation'] });

        // Monitor resource timing
        const resourceObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            const resourceEntry = entry as PerformanceResourceTiming;
            if (resourceEntry.transferSize > 1000000) { // Resources larger than 1MB
              this.trackEvent('performance', 'large_resource', resourceEntry.name, resourceEntry.transferSize);
            }
          }
        });
        resourceObserver.observe({ entryTypes: ['resource'] });

      } catch (error) {
        console.warn('[Analytics] Performance Observer not fully supported:', error);
      }
    }

    // Monitor JavaScript errors
    window.addEventListener('error', (event) => {
      this.trackEvent('error', 'javascript', event.error?.message || 'Unknown error', 1, {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack
      });
    });

    // Monitor unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.trackEvent('error', 'promise_rejection', event.reason?.message || 'Unhandled promise rejection', 1, {
        stack: event.reason?.stack
      });
    });
  }

  private initializeErrorTracking(): void {
    // React Error Boundary integration
    window.addEventListener('react-error', ((event: CustomEvent) => {
      this.trackEvent('error', 'react', event.detail.message, 1, {
        component: event.detail.component,
        stack: event.detail.stack
      });
    }) as EventListener);
  }

  private getConnectionType(): string {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      return connection.effectiveType || 'unknown';
    }
    return 'unknown';
  }

  // Public methods for tracking events
  trackEvent(category: string, action: string, label?: string, value?: number, customParams?: Record<string, any>): void {
    if (!this.isEnabled) return;

    const event: AnalyticsEvent = {
      event: 'custom_event',
      category,
      action,
      label,
      value,
      custom_parameters: {
        session_id: this.sessionId,
        user_id: this.userId,
        page_url: window.location.href,
        page_title: document.title,
        ...customParams
      },
      timestamp: Date.now()
    };

    this.events.push(event);
    this.addToBatch(event);

    console.log('[Analytics] Event tracked:', { category, action, label, value });
  }

  trackPageView(page: string, title?: string): void {
    this.trackEvent('navigation', 'page_view', page, undefined, {
      page_title: title || document.title,
      referrer: document.referrer
    });
  }

  trackLessonStart(lessonId: string, lessonTitle: string): void {
    this.trackEvent('lesson', 'start', lessonId, undefined, {
      lesson_title: lessonTitle,
      lesson_id: lessonId
    });
  }

  trackLessonComplete(lessonId: string, duration: number, score?: number): void {
    this.trackEvent('lesson', 'complete', lessonId, score, {
      duration_ms: duration,
      lesson_id: lessonId
    });
  }

  trackCodeExecution(language: string, success: boolean, executionTime: number): void {
    this.trackEvent('code', 'execute', language, executionTime, {
      success,
      execution_time_ms: executionTime
    });
  }

  trackWalletConnection(provider: string, success: boolean): void {
    this.trackEvent('wallet', 'connect', provider, success ? 1 : 0, {
      provider,
      success
    });
  }

  trackCustomMetric(name: string, value: number, unit?: string): void {
    const performanceData: PerformanceMetrics = {
      customMetrics: { [name]: value },
      url: window.location.href,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      connectionType: this.getConnectionType(),
    };

    this.metrics.push(performanceData);
    this.addToBatch(performanceData);

    console.log(`[Analytics] Custom metric ${name}:`, value, unit);
  }

  // User identification
  setUserId(userId: string): void {
    this.userId = userId;
    this.trackEvent('user', 'identify', userId);
  }

  // Batch processing
  private addToBatch(data: PerformanceMetrics | AnalyticsEvent): void {
    this.pendingBatch.push(data);

    if (this.pendingBatch.length >= this.batchSize) {
      this.flush();
    }
  }

  private startBatchProcessing(): void {
    this.batchTimer = setInterval(() => {
      if (this.pendingBatch.length > 0) {
        this.flush();
      }
    }, this.batchTimeout);
  }

  private async flush(): Promise<void> {
    if (this.pendingBatch.length === 0) return;

    const batch = [...this.pendingBatch];
    this.pendingBatch = [];

    try {
      // In a real implementation, you would send this to your analytics service
      // For now, we'll store it in localStorage as a demo
      await this.sendBatch(batch);
      console.log('[Analytics] Batch sent successfully:', batch.length, 'items');
    } catch (error) {
      console.error('[Analytics] Failed to send batch:', error);
      // Re-add to batch for retry (with limit to prevent infinite growth)
      if (this.pendingBatch.length < 100) {
        this.pendingBatch.unshift(...batch);
      }
    }
  }

  private async sendBatch(batch: (PerformanceMetrics | AnalyticsEvent)[]): Promise<void> {
    // Demo implementation - store in localStorage
    const existingData = localStorage.getItem('algozombies_analytics') || '[]';
    const analyticsData = JSON.parse(existingData);
    analyticsData.push(...batch);

    // Keep only last 1000 entries to prevent storage overflow
    const trimmedData = analyticsData.slice(-1000);
    localStorage.setItem('algozombies_analytics', JSON.stringify(trimmedData));

    // In production, you would send to your analytics service:
    /*
    const response = await fetch('/api/analytics', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        session_id: this.sessionId,
        user_id: this.userId,
        batch: batch
      })
    });

    if (!response.ok) {
      throw new Error(`Analytics API error: ${response.status}`);
    }
    */
  }

  // Performance timing utilities
  startTiming(name: string): () => void {
    const start = performance.now();
    return () => {
      const duration = performance.now() - start;
      this.trackCustomMetric(`timing_${name}`, duration, 'ms');
    };
  }

  // Memory usage monitoring
  measureMemoryUsage(): void {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      this.trackCustomMetric('memory_used', memory.usedJSHeapSize, 'bytes');
      this.trackCustomMetric('memory_total', memory.totalJSHeapSize, 'bytes');
      this.trackCustomMetric('memory_limit', memory.jsHeapSizeLimit, 'bytes');
    }
  }

  // Network monitoring
  measureNetworkLatency(): Promise<number> {
    return new Promise((resolve) => {
      const start = performance.now();
      fetch('/?_ping=1', { method: 'HEAD', cache: 'no-cache' })
        .then(() => {
          const latency = performance.now() - start;
          this.trackCustomMetric('network_latency', latency, 'ms');
          resolve(latency);
        })
        .catch(() => {
          resolve(-1); // Indicate network error
        });
    });
  }

  // Enable/disable analytics
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    console.log('[Analytics] Analytics', enabled ? 'enabled' : 'disabled');
  }

  // Get analytics data for debugging
  getAnalyticsData(): { metrics: PerformanceMetrics[]; events: AnalyticsEvent[] } {
    return {
      metrics: [...this.metrics],
      events: [...this.events]
    };
  }

  // Clear stored analytics data
  clearData(): void {
    this.metrics = [];
    this.events = [];
    this.pendingBatch = [];
    localStorage.removeItem('algozombies_analytics');
    console.log('[Analytics] Data cleared');
  }

  // Cleanup
  destroy(): void {
    if (this.batchTimer) {
      clearInterval(this.batchTimer);
    }
    this.flush();
    console.log('[Analytics] Analytics instance destroyed');
  }
}

// Create singleton instance
export const analytics = new AlgoZombiesAnalytics();

// React hook for easy component integration
export const useAnalytics = () => {
  return {
    trackEvent: analytics.trackEvent.bind(analytics),
    trackPageView: analytics.trackPageView.bind(analytics),
    trackLessonStart: analytics.trackLessonStart.bind(analytics),
    trackLessonComplete: analytics.trackLessonComplete.bind(analytics),
    trackCodeExecution: analytics.trackCodeExecution.bind(analytics),
    trackWalletConnection: analytics.trackWalletConnection.bind(analytics),
    trackCustomMetric: analytics.trackCustomMetric.bind(analytics),
    setUserId: analytics.setUserId.bind(analytics),
    startTiming: analytics.startTiming.bind(analytics),
    measureMemoryUsage: analytics.measureMemoryUsage.bind(analytics),
    measureNetworkLatency: analytics.measureNetworkLatency.bind(analytics)
  };
};

export default AlgoZombiesAnalytics;
