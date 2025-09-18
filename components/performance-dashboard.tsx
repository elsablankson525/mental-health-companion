"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Activity, 
  Clock, 
  Database, 
  Globe, 
  Zap, 
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Download,
  Trash2
} from "lucide-react"
import performanceMonitor from "@/lib/performance-monitor"

interface PerformanceSummary {
  totalMetrics: number
  recentMetrics: number
  webVitals: Record<string, { latest: number; average: number }>
  apiPerformance: {
    total: number
    successful: number
    failed: number
    averageResponseTime: number
    successRate: number
  }
  componentPerformance: Record<string, { count: number; averageTime: number }>
  timestamp: number
}

export default function PerformanceDashboard() {
  const [summary, setSummary] = useState<PerformanceSummary | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const loadPerformanceData = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = performanceMonitor.getPerformanceSummary()
      setSummary(data)
      setLastUpdated(new Date())
    } catch (error) {
      console.error('Failed to load performance data:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadPerformanceData()
    
    // Refresh data every 30 seconds
    const interval = setInterval(loadPerformanceData, 30000)
    return () => clearInterval(interval)
  }, [loadPerformanceData])

  const handleRefresh = () => {
    loadPerformanceData()
  }

  const handleClearMetrics = () => {
    if (confirm('Are you sure you want to clear all performance metrics?')) {
      performanceMonitor.clearMetrics()
      loadPerformanceData()
    }
  }

  const handleExportMetrics = () => {
    const data = performanceMonitor.exportMetrics()
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `performance-metrics-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const getWebVitalStatus = (value: number, metric: string) => {
    const thresholds: Record<string, { good: number; needsImprovement: number }> = {
      CLS: { good: 0.1, needsImprovement: 0.25 },
      FID: { good: 100, needsImprovement: 300 },
      FCP: { good: 1800, needsImprovement: 3000 },
      LCP: { good: 2500, needsImprovement: 4000 },
      TTFB: { good: 800, needsImprovement: 1800 }
    }

    const threshold = thresholds[metric]
    if (!threshold) return 'unknown'

    if (value <= threshold.good) return 'good'
    if (value <= threshold.needsImprovement) return 'needs-improvement'
    return 'poor'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-600 bg-green-100'
      case 'needs-improvement': return 'text-yellow-600 bg-yellow-100'
      case 'poor': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good': return <CheckCircle className="h-4 w-4" />
      case 'needs-improvement': return <AlertTriangle className="h-4 w-4" />
      case 'poor': return <AlertTriangle className="h-4 w-4" />
      default: return <Activity className="h-4 w-4" />
    }
  }

  if (!summary) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <Card>
          <CardContent className="p-6 text-center">
            <RefreshCw className="h-8 w-8 mx-auto mb-4 animate-spin" />
            <p>Loading performance data...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Performance Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor application performance and user experience metrics
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" onClick={handleExportMetrics}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" onClick={handleClearMetrics}>
            <Trash2 className="h-4 w-4 mr-2" />
            Clear
          </Button>
        </div>
      </div>

      {/* Last Updated */}
      {lastUpdated && (
        <p className="text-sm text-muted-foreground">
          Last updated: {lastUpdated.toLocaleString()}
        </p>
      )}

      {/* Overview Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Total Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalMetrics}</div>
            <p className="text-xs text-muted-foreground">
              {summary.recentMetrics} in last hour
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Globe className="h-4 w-4" />
              API Success Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary.apiPerformance.successRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {summary.apiPerformance.successful}/{summary.apiPerformance.total} calls
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Avg Response Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary.apiPerformance.averageResponseTime.toFixed(0)}ms
            </div>
            <p className="text-xs text-muted-foreground">
              API calls
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Components
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Object.keys(summary.componentPerformance).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Monitored components
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Metrics */}
      <Tabs defaultValue="web-vitals" className="space-y-4">
        <TabsList>
          <TabsTrigger value="web-vitals">Web Vitals</TabsTrigger>
          <TabsTrigger value="api-performance">API Performance</TabsTrigger>
          <TabsTrigger value="component-performance">Component Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="web-vitals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Core Web Vitals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(summary.webVitals).map(([metric, data]) => {
                  const status = getWebVitalStatus(data.latest, metric)
                  return (
                    <div key={metric} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{metric}</span>
                        <Badge className={getStatusColor(status)}>
                          {getStatusIcon(status)}
                          <span className="ml-1 capitalize">
                            {status.replace('-', ' ')}
                          </span>
                        </Badge>
                      </div>
                      <div className="text-2xl font-bold">
                        {data.latest.toFixed(2)}
                        {metric === 'CLS' ? '' : 'ms'}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Avg: {data.average.toFixed(2)}
                        {metric === 'CLS' ? '' : 'ms'}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api-performance" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>API Call Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Success Rate</span>
                  <div className="flex items-center gap-2">
                    <Progress 
                      value={summary.apiPerformance.successRate} 
                      className="w-20" 
                    />
                    <span className="text-sm font-medium">
                      {summary.apiPerformance.successRate.toFixed(1)}%
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span>Total Calls</span>
                  <span className="font-medium">{summary.apiPerformance.total}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Successful</span>
                  <span className="font-medium text-green-600">
                    {summary.apiPerformance.successful}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Failed</span>
                  <span className="font-medium text-red-600">
                    {summary.apiPerformance.failed}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Avg Response Time</span>
                  <span className="font-medium">
                    {summary.apiPerformance.averageResponseTime.toFixed(0)}ms
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Response Time Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center text-muted-foreground">
                  <Database className="h-12 w-12 mx-auto mb-2" />
                  <p>Response time distribution chart would go here</p>
                  <p className="text-sm">(Requires additional data collection)</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="component-performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Component Render Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(summary.componentPerformance).map(([component, data]) => (
                  <div key={component} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{component}</div>
                      <div className="text-sm text-muted-foreground">
                        {data.count} renders
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">
                        {data.averageTime.toFixed(2)}ms
                      </div>
                      <div className="text-sm text-muted-foreground">
                        avg render time
                      </div>
                    </div>
                  </div>
                ))}
                {Object.keys(summary.componentPerformance).length === 0 && (
                  <div className="text-center text-muted-foreground py-8">
                    <Zap className="h-12 w-12 mx-auto mb-2" />
                    <p>No component performance data available</p>
                    <p className="text-sm">Components will be monitored as they render</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
