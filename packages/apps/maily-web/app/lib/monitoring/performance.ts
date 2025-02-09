import * as Sentry from '@sentry/nextjs';
import { webVitals } from '@vercel/analytics';
import { env } from '@/config/env';

interface PerformanceMetric {
  name: string;
  value: number;
  tags?: Record<string, string>;
}

class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private isEnabled: boolean;

  private constructor() {
    this.isEnabled = process.env.NODE_ENV === 'production';
    this.initializeObservers();
  }

  public static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  private initializeObservers() {
    if (typeof window === 'undefined') return;

    // Core Web Vitals with Vercel Analytics
    webVitals.track({
      analyticsId: env.NEXT_PUBLIC_VERCEL_ANALYTICS_ID,
      debug: process.env.NODE_ENV === 'development',
    });

    // Performance Observer
    if ('PerformanceObserver' in window) {
      // Long Tasks
      const longTaskObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          this.reportMetric({
            name: 'long-task',
            value: entry.duration,
            tags: {
              entryType: entry.entryType,
              startTime: entry.startTime.toString(),
            },
          });
        });
      });

      longTaskObserver.observe({ entryTypes: ['longtask'] });

      // Resource Timing
      const resourceObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.initiatorType === 'fetch' || entry.initiatorType === 'xmlhttprequest') {
            this.reportMetric({
              name: 'resource-timing',
              value: entry.duration,
              tags: {
                initiatorType: entry.initiatorType,
                name: entry.name,
              },
            });
          }
        });
      });

      resourceObserver.observe({ entryTypes: ['resource'] });

      // Navigation Timing
      const navigationObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.entryType === 'navigation') {
            const navEntry = entry as PerformanceNavigationTiming;
            this.reportMetric({
              name: 'navigation-timing',
              value: navEntry.duration,
              tags: {
                type: navEntry.type,
                redirectCount: navEntry.redirectCount.toString(),
              },
            });
          }
        });
      });

      navigationObserver.observe({ entryTypes: ['navigation'] });

      // First Input Delay
      const fidObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.entryType === 'first-input') {
            this.reportMetric({
              name: 'first-input-delay',
              value: entry.processingStart - entry.startTime,
              tags: {
                type: entry.name,
              },
            });
          }
        });
      });

      fidObserver.observe({ entryTypes: ['first-input'] });

      // Layout Shifts
      const clsObserver = new PerformanceObserver((list) => {
        let clsValue = 0;
        list.getEntries().forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });

        this.reportMetric({
          name: 'cumulative-layout-shift',
          value: clsValue,
        });
      });

      clsObserver.observe({ entryTypes: ['layout-shift'] });
    }
  }

  private reportMetric(metric: PerformanceMetric) {
    // Report to Vercel Analytics
    webVitals.report({
      name: metric.name,
      value: metric.value,
      label: metric.tags?.type || 'custom',
    });

    // Report to Sentry
    if (env.NEXT_PUBLIC_SENTRY_DSN) {
      Sentry.captureMessage('Performance Metric', {
        level: 'info',
        extra: {
          metricName: metric.name,
          value: metric.value,
          tags: metric.tags,
        },
      });
    }

    // Report to console in development
    if (process.env.NODE_ENV === 'development') {
        name: metric.name,
        value: metric.value,
        tags: metric.tags,
      });
    }
  }

  public trackCustomMetric(name: string, value: number, tags?: Record<string, string>) {
    if (!this.isEnabled) return;

    const metric: PerformanceMetric = {
      name,
      value,
      tags,
    };

    // Send to Sentry
    Sentry.metrics.distribution('custom_metric', value, {
      unit: 'millisecond',
      tags: {
        metric_name: name,
        ...tags,
      },
    });

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
    }
  }

  public markAndMeasure(markName: string, measureName: string) {
    if (typeof performance === 'undefined') return;

    performance.mark(markName);
    
    try {
      performance.measure(measureName, markName);
      const entries = performance.getEntriesByName(measureName);
      const lastEntry = entries[entries.length - 1];
      
      this.reportMetric({
        name: measureName,
        value: lastEntry.duration,
        tags: { markName },
      });
    } catch (error) {
      console.error('Error measuring performance:', error);
    }
  }

  // AI Operation Metrics
  public trackAIOperation(operation: string, duration: number, success: boolean) {
    this.reportMetric({
      name: 'ai-operation',
      value: duration,
      tags: {
        operation,
        success: success.toString(),
      },
    });
  }

  trackPageLoad() {
    if (typeof window === 'undefined' || !this.isEnabled) return;

    // Track navigation timing
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navigation) {
      this.trackCustomMetric('page_load', navigation.loadEventEnd - navigation.startTime);
      this.trackCustomMetric('dom_interactive', navigation.domInteractive - navigation.startTime);
      this.trackCustomMetric('dom_complete', navigation.domComplete - navigation.startTime);
    }

    // Track largest contentful paint
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const lastEntry = entries[entries.length - 1];
      this.trackCustomMetric('largest_contentful_paint', lastEntry.startTime);
    }).observe({ type: 'largest-contentful-paint', buffered: true });

    // Track first input delay
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      entries.forEach((entry) => {
        const fid = entry as PerformanceEventTiming;
        this.trackCustomMetric('first_input_delay', fid.processingStart - fid.startTime);
      });
    }).observe({ type: 'first-input', buffered: true });

    // Track cumulative layout shift
    new PerformanceObserver((entryList) => {
      let cumulativeScore = 0;
      entryList.getEntries().forEach((entry: any) => {
        cumulativeScore += entry.value;
      });
      this.trackCustomMetric('cumulative_layout_shift', cumulativeScore);
    }).observe({ type: 'layout-shift', buffered: true });
  }

  trackApiCall(endpoint: string, duration: number, status: number) {
    this.trackCustomMetric('api_call_duration', duration, {
      endpoint,
      status: status.toString(),
    });
  }

  trackResourceLoad(resourceType: string, duration: number) {
    this.trackCustomMetric('resource_load_duration', duration, {
      resource_type: resourceType,
    });
  }

  trackInteraction(name: string, duration: number) {
    this.trackCustomMetric('interaction_duration', duration, {
      interaction_name: name,
    });
  }
}

export const performanceMonitor = PerformanceMonitor.getInstance(); 