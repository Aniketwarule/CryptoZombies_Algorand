import React from 'react';

// Performance monitoring utilities
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number[]> = new Map();

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  // Start timing a component or operation
  startTiming(label: string): string {
    const id = `${label}-${Date.now()}-${Math.random()}`;
    performance.mark(`${id}-start`);
    return id;
  }

  // End timing and record the duration
  endTiming(id: string): number {
    const endMark = `${id}-end`;
    performance.mark(endMark);
    
    try {
      performance.measure(id, `${id}-start`, endMark);
      const measure = performance.getEntriesByName(id)[0];
      const duration = measure.duration;
      
      // Store the metric
      const label = id.split('-')[0];
      if (!this.metrics.has(label)) {
        this.metrics.set(label, []);
      }
      this.metrics.get(label)!.push(duration);
      
      // Clean up performance entries
      performance.clearMarks(`${id}-start`);
      performance.clearMarks(endMark);
      performance.clearMeasures(id);
      
      return duration;
    } catch (error) {
      console.warn('Performance measurement failed:', error);
      return 0;
    }
  }

  // Get average performance for a component
  getAverageTime(label: string): number {
    const times = this.metrics.get(label);
    if (!times || times.length === 0) return 0;
    return times.reduce((sum, time) => sum + time, 0) / times.length;
  }

  // Get performance summary
  getSummary(): Record<string, { average: number; count: number; latest: number }> {
    const summary: Record<string, { average: number; count: number; latest: number }> = {};
    
    this.metrics.forEach((times, label) => {
      summary[label] = {
        average: Math.round(this.getAverageTime(label) * 100) / 100,
        count: times.length,
        latest: Math.round((times[times.length - 1] || 0) * 100) / 100
      };
    });
    
    return summary;
  }

  // Monitor React component render time
  monitorComponent<T extends Record<string, any>>(
    componentName: string,
    WrappedComponent: React.ComponentType<T>
  ): React.ComponentType<T> {
    return (props: T) => {
      const renderStart = React.useRef<string>();
      
      // Start timing before render
      React.useLayoutEffect(() => {
        renderStart.current = this.startTiming(`${componentName}-render`);
      });
      
      // End timing after render
      React.useLayoutEffect(() => {
        if (renderStart.current) {
          const duration = this.endTiming(renderStart.current);
          if (duration > 100) { // Log slow renders
            console.warn(`Slow render detected: ${componentName} took ${duration}ms`);
          }
        }
      });
      
      return React.createElement(WrappedComponent, props);
    };
  }
}

// Hook for measuring custom operations
export const usePerformance = () => {
  const monitor = PerformanceMonitor.getInstance();
  
  const measureAsync = async <T>(label: string, operation: () => Promise<T>): Promise<T> => {
    const id = monitor.startTiming(label);
    try {
      const result = await operation();
      return result;
    } finally {
      monitor.endTiming(id);
    }
  };
  
  const measureSync = <T>(label: string, operation: () => T): T => {
    const id = monitor.startTiming(label);
    try {
      return operation();
    } finally {
      monitor.endTiming(id);
    }
  };
  
  return {
    measureAsync,
    measureSync,
    getSummary: () => monitor.getSummary(),
    getAverageTime: (label: string) => monitor.getAverageTime(label)
  };
};

export const performanceMonitor = PerformanceMonitor.getInstance();