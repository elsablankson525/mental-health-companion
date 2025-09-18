// Performance monitoring utilities for the mental health companion app
import React, { useEffect, createElement } from 'react'

interface PerformanceMetric {
  name: string
  value: number
  timestamp: number
  metadata?: Record<string, any>
}

// interface WebVitalsMetric {
//   name: 'CLS' | 'FID' | 'FCP' | 'LCP' | 'TTFB'
//   value: number
//   delta: number
//   id: string
//   navigationType: string
// }

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = []
  private maxMetrics = 1000
  private isEnabled = true

  constructor() {
    this.initializeWebVitals()
    this.initializePerformanceObserver()
  }

  // Initialize Web Vitals monitoring
  private initializeWebVitals() {
    if (typeof window === 'undefined') return

    // Core Web Vitals
    this.measureWebVital('CLS', this.getCLS)
    this.measureWebVital('FID', this.getFID)
    this.measureWebVital('FCP', this.getFCP)
    this.measureWebVital('LCP', this.getLCP)
    this.measureWebVital('TTFB', this.getTTFB)
  }

  // Initialize Performance Observer for custom metrics
  private initializePerformanceObserver() {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) return

    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.recordMetric({
            name: entry.name,
            value: entry.duration,
            timestamp: Date.now(),
            metadata: {
              entryType: entry.entryType,
              startTime: entry.startTime
            }
          })
        }
      })

      observer.observe({ entryTypes: ['measure', 'navigation', 'resource'] })
    } catch (error) {
      console.warn('Performance Observer not supported:', error)
    }
  }

  // Measure Web Vital
  private async measureWebVital(name: string, getMetric: () => Promise<number>) {
    try {
      const value = await getMetric()
      this.recordMetric({
        name,
        value,
        timestamp: Date.now(),
        metadata: { type: 'web-vital' }
      })
    } catch (error) {
      console.warn(`Failed to measure ${name}:`, error)
    }
  }

  // Get Cumulative Layout Shift (CLS)
  private async getCLS(): Promise<number> {
    return new Promise((resolve) => {
      let clsValue = 0
      let sessionValue = 0
      let sessionEntries: PerformanceEntry[] = []
      // let lastSessionTime = 0

      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            const firstSessionEntry = sessionEntries[0]
            const lastSessionEntry = sessionEntries[sessionEntries.length - 1]

            if (sessionValue && 
                entry.startTime - lastSessionEntry.startTime < 1000 &&
                entry.startTime - firstSessionEntry.startTime < 5000) {
              sessionValue += (entry as any).value
              sessionEntries.push(entry)
            } else {
              sessionValue = (entry as any).value
              sessionEntries = [entry]
            }

            if (sessionValue > clsValue) {
              clsValue = sessionValue
            }
          }
        }
        resolve(clsValue)
      })

      observer.observe({ entryTypes: ['layout-shift'] })
    })
  }

  // Get First Input Delay (FID)
  private async getFID(): Promise<number> {
    return new Promise((resolve) => {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          resolve((entry as any).processingStart - entry.startTime)
        }
      })

      observer.observe({ entryTypes: ['first-input'] })
    })
  }

  // Get First Contentful Paint (FCP)
  private async getFCP(): Promise<number> {
    return new Promise((resolve) => {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name === 'first-contentful-paint') {
            resolve(entry.startTime)
          }
        }
      })

      observer.observe({ entryTypes: ['paint'] })
    })
  }

  // Get Largest Contentful Paint (LCP)
  private async getLCP(): Promise<number> {
    return new Promise((resolve) => {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const lastEntry = entries[entries.length - 1]
        resolve(lastEntry.startTime)
      })

      observer.observe({ entryTypes: ['largest-contentful-paint'] })
    })
  }

  // Get Time to First Byte (TTFB)
  private async getTTFB(): Promise<number> {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
    return navigation.responseStart - navigation.requestStart
  }

  // Record a custom metric
  recordMetric(metric: PerformanceMetric) {
    if (!this.isEnabled) return

    this.metrics.push(metric)

    // Keep only the most recent metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics)
    }

    // Send to analytics if in production
    if (process.env.NODE_ENV === 'production') {
      this.sendToAnalytics(metric)
    }
  }

  // Measure function execution time
  measureFunction<T>(name: string, fn: () => T): T {
    const start = performance.now()
    const result = fn()
    const end = performance.now()

    this.recordMetric({
      name: `function:${name}`,
      value: end - start,
      timestamp: Date.now()
    })

    return result
  }

  // Measure async function execution time
  async measureAsyncFunction<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const start = performance.now()
    const result = await fn()
    const end = performance.now()

    this.recordMetric({
      name: `async-function:${name}`,
      value: end - start,
      timestamp: Date.now()
    })

    return result
  }

  // Measure API call performance
  measureApiCall(url: string, method: string, duration: number, status: number) {
    this.recordMetric({
      name: 'api-call',
      value: duration,
      timestamp: Date.now(),
      metadata: {
        url,
        method,
        status,
        success: status >= 200 && status < 400
      }
    })
  }

  // Measure component render time
  measureComponentRender(componentName: string, renderTime: number) {
    this.recordMetric({
      name: `component-render:${componentName}`,
      value: renderTime,
      timestamp: Date.now()
    })
  }

  // Measure database query performance
  measureDatabaseQuery(queryName: string, duration: number, rowCount?: number) {
    this.recordMetric({
      name: 'database-query',
      value: duration,
      timestamp: Date.now(),
      metadata: {
        queryName,
        rowCount
      }
    })
  }

  // Get performance summary
  getPerformanceSummary() {
    const now = Date.now()
    const lastHour = now - (60 * 60 * 1000)
    const recentMetrics = this.metrics.filter(m => m.timestamp > lastHour)

    const summary = {
      totalMetrics: this.metrics.length,
      recentMetrics: recentMetrics.length,
      webVitals: this.getWebVitalsSummary(),
      apiPerformance: this.getApiPerformanceSummary(),
      componentPerformance: this.getComponentPerformanceSummary(),
      timestamp: now
    }

    return summary
  }

  // Get Web Vitals summary
  private getWebVitalsSummary() {
    const webVitals = this.metrics.filter(m => m.metadata?.type === 'web-vital')
    const summary: Record<string, { latest: number; average: number }> = {}

    webVitals.forEach(metric => {
      if (!summary[metric.name]) {
        summary[metric.name] = { latest: 0, average: 0 }
      }
      summary[metric.name].latest = metric.value
    })

    // Calculate averages
    Object.keys(summary).forEach(name => {
      const values = webVitals.filter(m => m.name === name).map(m => m.value)
      summary[name].average = values.reduce((a, b) => a + b, 0) / values.length
    })

    return summary
  }

  // Get API performance summary
  private getApiPerformanceSummary() {
    const apiCalls = this.metrics.filter(m => m.name === 'api-call')
    const successful = apiCalls.filter(m => m.metadata?.success)
    const failed = apiCalls.filter(m => !m.metadata?.success)

    return {
      total: apiCalls.length,
      successful: successful.length,
      failed: failed.length,
      averageResponseTime: apiCalls.reduce((sum, m) => sum + m.value, 0) / apiCalls.length,
      successRate: successful.length / apiCalls.length * 100
    }
  }

  // Get component performance summary
  private getComponentPerformanceSummary() {
    const componentMetrics = this.metrics.filter(m => m.name.startsWith('component-render:'))
    const summary: Record<string, { count: number; averageTime: number }> = {}

    componentMetrics.forEach(metric => {
      const componentName = metric.name.replace('component-render:', '')
      if (!summary[componentName]) {
        summary[componentName] = { count: 0, averageTime: 0 }
      }
      summary[componentName].count++
    })

    // Calculate average render times
    Object.keys(summary).forEach(componentName => {
      const times = componentMetrics
        .filter(m => m.name === `component-render:${componentName}`)
        .map(m => m.value)
      summary[componentName].averageTime = times.reduce((a, b) => a + b, 0) / times.length
    })

    return summary
  }

  // Send metrics to analytics service
  private sendToAnalytics(metric: PerformanceMetric) {
    // Send to your analytics service (e.g., Google Analytics, Mixpanel, etc.)
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'performance_metric', {
        metric_name: metric.name,
        metric_value: metric.value,
        custom_map: metric.metadata
      })
    }
  }

  // Clear all metrics
  clearMetrics() {
    this.metrics = []
  }

  // Enable/disable monitoring
  setEnabled(enabled: boolean) {
    this.isEnabled = enabled
  }

  // Export metrics for analysis
  exportMetrics() {
    return {
      metrics: this.metrics,
      summary: this.getPerformanceSummary(),
      timestamp: Date.now()
    }
  }
}

// Create singleton instance
export const performanceMonitor = new PerformanceMonitor()

// React hook for measuring component performance
export function usePerformanceMonitor(componentName: string) {
  const startTime = performance.now()

  return {
    endMeasure: () => {
      const endTime = performance.now()
      performanceMonitor.measureComponentRender(componentName, endTime - startTime)
    }
  }
}

// Higher-order component for automatic performance monitoring
export function withPerformanceMonitoring<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  componentName: string
) {
  return function PerformanceMonitoredComponent(props: P) {
    const { endMeasure } = usePerformanceMonitor(componentName)

    useEffect(() => {
      endMeasure()
    })

    return createElement(WrappedComponent, props)
  }
}

// Utility function for measuring API calls
export async function measureApiCall<T>(
  apiCall: () => Promise<T>,
  url: string,
  method: string = 'GET'
): Promise<T> {
  const start = performance.now()
  try {
    const response = await apiCall()
    const end = performance.now()
    performanceMonitor.measureApiCall(url, method, end - start, 200)
    return response
  } catch (error: any) {
    const end = performance.now()
    performanceMonitor.measureApiCall(url, method, end - start, error.status || 500)
    throw error
  }
}

export default performanceMonitor
