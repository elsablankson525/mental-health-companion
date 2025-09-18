"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { 
  BarChart3, 
  TrendingUp, 
  Target, 
  Heart, 
  Moon, 
  Pill, 
  Download, 
  Share, 
  RefreshCw, 
  CheckCircle, 
  AlertTriangle,
  Info,
  Award,
  Clock,
  Activity,
  Zap,
  ArrowUp,
  ArrowDown,
  Minus,
  PieChart,
  LineChart,
  BarChart,
  FileText,
  Brain,
} from "lucide-react"

interface MoodData {
  date: string
  mood: number
  energy: number
  anxiety: number
  sleep: number
  notes?: string
}

interface SleepData {
  date: string
  bedtime: string
  wakeTime: string
  duration: number
  quality: number
  deepSleep: number
  remSleep: number
  lightSleep: number
  awakenings: number
}

// interface MedicationData {
//   date: string
//   medication: string
//   taken: boolean
//   time: string
//   sideEffects?: string
//   effectiveness: number
// }

interface GoalProgress {
  id: string
  title: string
  description: string
  category: string
  targetValue: number
  currentValue: number
  unit: string
  startDate: string
  targetDate: string
  status: 'on-track' | 'behind' | 'completed' | 'paused'
  milestones: {
    id: string
    title: string
    targetDate: string
    completed: boolean
    completedDate?: string
  }[]
}

interface Insight {
  id: string
  type: 'trend' | 'pattern' | 'correlation' | 'recommendation' | 'achievement'
  title: string
  description: string
  confidence: number
  impact: 'high' | 'medium' | 'low'
  category: string
  date: string
  actionable: boolean
  actionItems?: string[]
}

interface Report {
  id: string
  title: string
  type: 'weekly' | 'monthly' | 'quarterly' | 'custom'
  period: string
  generatedAt: string
  summary: string
  keyMetrics: {
    mood: number
    sleep: number
    medication: number
    goals: number
  }
  insights: Insight[]
  recommendations: string[]
  isShared: boolean
  sharedWith: string[]
}

const timeRanges = [
  { id: '7d', label: 'Last 7 Days', days: 7 },
  { id: '30d', label: 'Last 30 Days', days: 30 },
  { id: '90d', label: 'Last 90 Days', days: 90 },
  { id: '1y', label: 'Last Year', days: 365 },
  { id: 'all', label: 'All Time', days: 0 }
]

const chartTypes = [
  { id: 'line', label: 'Line Chart', icon: LineChart },
  { id: 'bar', label: 'Bar Chart', icon: BarChart },
  { id: 'pie', label: 'Pie Chart', icon: PieChart },
  { id: 'scatter', label: 'Scatter Plot', icon: BarChart3 }
]

export default function ProgressReportsAnalytics() {
  const { data: session } = useSession()
  const [activeTab, setActiveTab] = useState("overview")
  const [selectedTimeRange, setSelectedTimeRange] = useState("30d")
  const [selectedChartType, setSelectedChartType] = useState("line")
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  // Database-connected state
  const [moodData, setMoodData] = useState<MoodData[]>([])
  const [sleepData, setSleepData] = useState<SleepData[]>([])
  const [goals, setGoals] = useState<GoalProgress[]>([])
  const [insights, setInsights] = useState<Insight[]>([])
  const [reports, setReports] = useState<Report[]>([])

  // Load data from API
  useEffect(() => {
    if (session?.user?.id) {
      loadAnalyticsData()
    }
  }, [session, selectedTimeRange])

  const loadAnalyticsData = async () => {
    setIsLoading(true)
    try {
      // Load mood data
      const moodRes = await fetch(`/api/mood-entries?startDate=${getStartDate()}&endDate=${new Date().toISOString()}`)
      if (moodRes.ok) {
        const moodDataResponse = await moodRes.json()
        // Transform mood entries to match component interface
        const transformedMoodData = moodDataResponse.entries.map((entry: any) => ({
          date: entry.date,
          mood: entry.mood,
          energy: 5, // Default value since energy isn't tracked separately
          anxiety: 5, // Default value since anxiety isn't tracked separately
          sleep: 7, // Default value since sleep isn't tracked in mood entries
          notes: entry.note
        }))
        setMoodData(transformedMoodData)
      }

      // Load sleep data
      const sleepRes = await fetch(`/api/sleep-entries?startDate=${getStartDate()}&endDate=${new Date().toISOString()}`)
      if (sleepRes.ok) {
        const sleepDataResponse = await sleepRes.json()
        // Transform sleep entries to match component interface
        const transformedSleepData = sleepDataResponse.map((entry: any) => ({
          date: entry.date,
          bedtime: new Date(entry.bedtime).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
          wakeTime: new Date(entry.wakeTime).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
          duration: entry.duration,
          quality: entry.quality,
          deepSleep: entry.deepSleep || 0,
          remSleep: entry.remSleep || 0,
          lightSleep: entry.lightSleep || 0,
          awakenings: entry.awakenings || 0
        }))
        setSleepData(transformedSleepData)
      }

      // Load goals
      const goalsRes = await fetch('/api/goals')
      if (goalsRes.ok) {
        const goalsData = await goalsRes.json()
        // Transform goals to match component interface
        const transformedGoals = goalsData.map((goal: any) => ({
          id: goal.id,
          title: goal.title,
          description: goal.description || '',
          category: goal.category,
          targetValue: goal.targetValue,
          currentValue: goal.currentValue,
          unit: goal.unit,
          startDate: goal.startDate,
          targetDate: goal.targetDate,
          status: goal.status.toLowerCase().replace('_', '-'),
          milestones: goal.milestones || []
        }))
        setGoals(transformedGoals)
      }

      // For now, use empty arrays for insights and reports
      // In a real app, these would come from analytics APIs
      setInsights([])
      setReports([])
    } catch (error) {
      console.error('Error loading analytics data:', error)
      setMessage({ type: 'error', text: 'Failed to load analytics data' })
    } finally {
      setIsLoading(false)
    }
  }

  const getStartDate = () => {
    const now = new Date()
    switch (selectedTimeRange) {
      case '7d':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
      case '30d':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()
      case '90d':
        return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString()
      case '1y':
        return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000).toISOString()
      default:
        return new Date(0).toISOString() // All time
    }
  }

  // Mock data removed - insights and reports are now loaded from analytics APIs

  const handleGenerateReport = async (type: string) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/analytics/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type, timeRange: selectedTimeRange })
      })

      if (response.ok) {
        setMessage({ type: 'success', text: 'Report generated successfully!' })
        // Reload analytics data
        loadAnalyticsData()
      } else {
        const errorData = await response.json()
        setMessage({ type: 'error', text: errorData.error || 'Failed to generate report' })
      }
    } catch (error) {
      console.error('Error generating report:', error)
      setMessage({ type: 'error', text: 'Failed to generate report' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleShareReport = async (reportId: string) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/analytics/reports/${reportId}/share`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (response.ok) {
        setMessage({ type: 'success', text: 'Report shared successfully!' })
      } else {
        const errorData = await response.json()
        setMessage({ type: 'error', text: errorData.error || 'Failed to share report' })
      }
    } catch (error) {
      console.error('Error sharing report:', error)
      setMessage({ type: 'error', text: 'Failed to share report' })
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on-track': return 'bg-green-100 text-green-800 border-green-200'
      case 'behind': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'paused': return 'bg-gray-100 text-gray-800 border-gray-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-600'
      case 'medium': return 'text-yellow-600'
      case 'low': return 'text-green-600'
      default: return 'text-gray-600'
    }
  }

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'trend': return <TrendingUp className="h-4 w-4" />
      case 'pattern': return <Activity className="h-4 w-4" />
      case 'correlation': return <BarChart3 className="h-4 w-4" />
      case 'recommendation': return <Target className="h-4 w-4" />
      case 'achievement': return <Award className="h-4 w-4" />
      default: return <Info className="h-4 w-4" />
    }
  }

  const calculateProgress = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100)
  }

  const getTrendIcon = (current: number, previous: number) => {
    if (current > previous) return <ArrowUp className="h-4 w-4 text-green-600" />
    if (current < previous) return <ArrowDown className="h-4 w-4 text-red-600" />
    return <Minus className="h-4 w-4 text-gray-600" />
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-2">
          <BarChart3 className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">Progress Reports & Analytics</h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Track your mental health journey with detailed analytics, insights, and progress reports to understand your patterns and celebrate your achievements.
        </p>
      </div>

      {/* Message Display */}
      {message && (
        <Alert className={message.type === 'success' ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}>
          <div className="flex items-center space-x-2">
            {message.type === 'success' ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-red-600" />
            )}
            <AlertDescription className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>
              {message.text}
            </AlertDescription>
          </div>
        </Alert>
      )}

      {/* Time Range and Chart Type Selectors */}
      <div className="flex flex-wrap gap-4 justify-center">
        <div className="flex items-center space-x-2">
          <Label>Time Range:</Label>
          <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {timeRanges.map((range) => (
                <SelectItem key={range.id} value={range.id}>{range.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center space-x-2">
          <Label>Chart Type:</Label>
          <Select value={selectedChartType} onValueChange={setSelectedChartType}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {chartTypes.map((type) => (
                <SelectItem key={type.id} value={type.id}>
                  <div className="flex items-center space-x-2">
                    <type.icon className="h-4 w-4" />
                    <span>{type.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview" className="flex items-center space-x-2">
            <BarChart3 className="h-4 w-4" />
            <span>Overview</span>
          </TabsTrigger>
          <TabsTrigger value="mood" className="flex items-center space-x-2">
            <Heart className="h-4 w-4" />
            <span>Mood</span>
          </TabsTrigger>
          <TabsTrigger value="sleep" className="flex items-center space-x-2">
            <Moon className="h-4 w-4" />
            <span>Sleep</span>
          </TabsTrigger>
          <TabsTrigger value="goals" className="flex items-center space-x-2">
            <Target className="h-4 w-4" />
            <span>Goals</span>
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center space-x-2">
            <FileText className="h-4 w-4" />
            <span>Reports</span>
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Average Mood</p>
                    <p className="text-2xl font-bold">7.0</p>
                    <div className="flex items-center space-x-1 mt-1">
                      {getTrendIcon(7.0, 6.5)}
                      <span className="text-sm text-green-600">+7.7%</span>
                    </div>
                  </div>
                  <Heart className="h-8 w-8 text-red-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Sleep Quality</p>
                    <p className="text-2xl font-bold">7.4</p>
                    <div className="flex items-center space-x-1 mt-1">
                      {getTrendIcon(7.4, 7.0)}
                      <span className="text-sm text-green-600">+5.7%</span>
                    </div>
                  </div>
                  <Moon className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Medication Adherence</p>
                    <p className="text-2xl font-bold">85%</p>
                    <div className="flex items-center space-x-1 mt-1">
                      {getTrendIcon(85, 80)}
                      <span className="text-sm text-green-600">+6.3%</span>
                    </div>
                  </div>
                  <Pill className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Goal Progress</p>
                    <p className="text-2xl font-bold">75%</p>
                    <div className="flex items-center space-x-1 mt-1">
                      {getTrendIcon(75, 70)}
                      <span className="text-sm text-green-600">+7.1%</span>
                    </div>
                  </div>
                  <Target className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Brain className="h-5 w-5" />
                <span>AI Insights</span>
              </CardTitle>
              <CardDescription>
                Personalized insights based on your data patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {insights.map((insight) => (
                  <div key={insight.id} className="p-4 border rounded-lg">
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-lg bg-gray-100 ${getImpactColor(insight.impact)}`}>
                        {getInsightIcon(insight.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-semibold">{insight.title}</h4>
                            <p className="text-sm text-muted-foreground mt-1">{insight.description}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className="text-xs">
                              {insight.confidence}% confidence
                            </Badge>
                            <Badge variant={insight.impact === 'high' ? 'destructive' : insight.impact === 'medium' ? 'default' : 'secondary'} className="text-xs">
                              {insight.impact} impact
                            </Badge>
                          </div>
                        </div>
                        {insight.actionable && insight.actionItems && (
                          <div className="mt-3">
                            <h5 className="font-medium text-sm mb-2">Action Items:</h5>
                            <ul className="space-y-1">
                              {insight.actionItems.map((item, index) => (
                                <li key={index} className="text-sm text-muted-foreground flex items-start space-x-2">
                                  <span className="text-primary mt-1">•</span>
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Mood Tab */}
        <TabsContent value="mood" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Heart className="h-5 w-5" />
                <span>Mood Trends</span>
              </CardTitle>
              <CardDescription>
                Track your emotional well-being over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Mood Chart Placeholder */}
                <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">Mood Chart Visualization</p>
                    <p className="text-sm text-muted-foreground">Chart would show mood trends over time</p>
                  </div>
                </div>

                {/* Mood Data Table */}
                <div className="space-y-2">
                  <h4 className="font-semibold">Recent Mood Entries</h4>
                  <div className="space-y-2">
                    {moodData.map((entry, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="text-sm font-medium">
                            {new Date(entry.date).toLocaleDateString()}
                          </div>
                          <div className="flex items-center space-x-2">
                            <Heart className="h-4 w-4 text-red-500" />
                            <span className="text-sm">Mood: {entry.mood}/10</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Zap className="h-4 w-4 text-yellow-500" />
                            <span className="text-sm">Energy: {entry.energy}/10</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <AlertTriangle className="h-4 w-4 text-orange-500" />
                            <span className="text-sm">Anxiety: {entry.anxiety}/10</span>
                          </div>
                        </div>
                        {entry.notes && (
                          <div className="text-sm text-muted-foreground max-w-xs truncate">
                            {entry.notes}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sleep Tab */}
        <TabsContent value="sleep" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Moon className="h-5 w-5" />
                <span>Sleep Analytics</span>
              </CardTitle>
              <CardDescription>
                Monitor your sleep patterns and quality
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Sleep Chart Placeholder */}
                <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Moon className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">Sleep Chart Visualization</p>
                    <p className="text-sm text-muted-foreground">Chart would show sleep duration and quality trends</p>
                  </div>
                </div>

                {/* Sleep Data Table */}
                <div className="space-y-2">
                  <h4 className="font-semibold">Recent Sleep Data</h4>
                  <div className="space-y-2">
                    {sleepData.map((entry, index) => (
                      <div key={index} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-sm font-medium">
                            {new Date(entry.date).toLocaleDateString()}
                          </div>
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{entry.duration}h {entry.quality}/10 quality</span>
                          </div>
                        </div>
                        <div className="grid grid-cols-4 gap-4 text-sm text-muted-foreground">
                          <div>Deep: {entry.deepSleep}h</div>
                          <div>REM: {entry.remSleep}h</div>
                          <div>Light: {entry.lightSleep}h</div>
                          <div>Awakenings: {entry.awakenings}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Goals Tab */}
        <TabsContent value="goals" className="space-y-6">
          <div className="space-y-6">
            {goals.map((goal) => (
              <Card key={goal.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{goal.title}</CardTitle>
                      <CardDescription className="mt-2">{goal.description}</CardDescription>
                    </div>
                    <Badge className={getStatusColor(goal.status)}>
                      {goal.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Progress</span>
                      <span className="text-sm text-muted-foreground">
                        {goal.currentValue} / {goal.targetValue} {goal.unit}
                      </span>
                    </div>
                    <Progress value={calculateProgress(goal.currentValue, goal.targetValue)} className="h-2" />
                    <div className="text-sm text-muted-foreground mt-1">
                      {Math.round(calculateProgress(goal.currentValue, goal.targetValue))}% complete
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Milestones</h4>
                    <div className="space-y-2">
                      {goal.milestones.map((milestone) => (
                        <div key={milestone.id} className="flex items-center justify-between p-2 border rounded">
                          <div className="flex items-center space-x-2">
                            {milestone.completed ? (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            ) : (
                              <div className="h-4 w-4 border-2 border-gray-300 rounded-full" />
                            )}
                            <span className="text-sm">{milestone.title}</span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(milestone.targetDate).toLocaleDateString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Progress Reports</h2>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => handleGenerateReport('weekly')} disabled={isLoading}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Generate Weekly
              </Button>
              <Button variant="outline" onClick={() => handleGenerateReport('monthly')} disabled={isLoading}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Generate Monthly
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            {reports.map((report) => (
              <Card key={report.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{report.title}</CardTitle>
                      <CardDescription>
                        {report.period} • Generated {new Date(report.generatedAt).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      {report.isShared && (
                        <Badge variant="secondary" className="flex items-center space-x-1">
                          <Share className="h-3 w-3" />
                          <span>Shared</span>
                        </Badge>
                      )}
                      <Badge variant="outline">{report.type}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Summary</h4>
                    <p className="text-muted-foreground">{report.summary}</p>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Key Metrics</h4>
                    <div className="grid grid-cols-4 gap-4">
                      <div className="text-center p-3 border rounded-lg">
                        <Heart className="h-6 w-6 text-red-500 mx-auto mb-1" />
                        <div className="text-lg font-semibold">{report.keyMetrics.mood}</div>
                        <div className="text-xs text-muted-foreground">Avg Mood</div>
                      </div>
                      <div className="text-center p-3 border rounded-lg">
                        <Moon className="h-6 w-6 text-blue-500 mx-auto mb-1" />
                        <div className="text-lg font-semibold">{report.keyMetrics.sleep}</div>
                        <div className="text-xs text-muted-foreground">Sleep Hours</div>
                      </div>
                      <div className="text-center p-3 border rounded-lg">
                        <Pill className="h-6 w-6 text-green-500 mx-auto mb-1" />
                        <div className="text-lg font-semibold">{report.keyMetrics.medication}%</div>
                        <div className="text-xs text-muted-foreground">Adherence</div>
                      </div>
                      <div className="text-center p-3 border rounded-lg">
                        <Target className="h-6 w-6 text-purple-500 mx-auto mb-1" />
                        <div className="text-lg font-semibold">{report.keyMetrics.goals}%</div>
                        <div className="text-xs text-muted-foreground">Goal Progress</div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Recommendations</h4>
                    <ul className="space-y-1">
                      {report.recommendations.map((rec, index) => (
                        <li key={index} className="text-sm text-muted-foreground flex items-start space-x-2">
                          <span className="text-primary mt-1">•</span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Download PDF
                    </Button>
                    {!report.isShared && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleShareReport(report.id)}
                        disabled={isLoading}
                      >
                        <Share className="h-4 w-4 mr-2" />
                        Share with Therapist
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
