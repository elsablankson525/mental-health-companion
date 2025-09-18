"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts"
import { TrendingUp, Calendar, Heart, BookOpen, Brain, AlertCircle, RefreshCw } from "lucide-react"
import { mlService, PatternAnalysis } from "@/lib/ml-service"

interface MoodEntry {
  id: string
  mood: number
  emotions: string[]
  date: Date
  note?: string
}

interface JournalEntry {
  id: string
  content: string
  date: Date
  mood?: string
}

export default function InsightsDashboard() {
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>([])
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([])
  const [mlConnected, setMlConnected] = useState(false)
  const [patternAnalysis, setPatternAnalysis] = useState<PatternAnalysis | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  useEffect(() => {
    // Load data from database
    const loadData = async () => {
      try {
        // Load mood entries
        const moodResponse = await fetch('/api/mood-entries')
        if (moodResponse.ok) {
          const moodEntries = await moodResponse.json()
          setMoodEntries(moodEntries)
        }

        // Load journal entries
        const journalResponse = await fetch('/api/journal-entries')
        if (journalResponse.ok) {
          const journalEntries = await journalResponse.json()
          setJournalEntries(journalEntries)
        }
      } catch (error) {
        console.error('Failed to load data:', error)
      }
    }

    loadData()

    // Check ML service connection
    mlService.healthCheck()
      .then((health) => {
        setMlConnected(health.status === 'healthy')
      })
      .catch(() => {
        setMlConnected(false)
      })
  }, [])

  const analyzePatterns = async () => {
    if (!mlConnected || moodEntries.length === 0) return

    setIsAnalyzing(true)
    try {
      const analysis = await mlService.analyzePatterns(moodEntries, journalEntries)
      setPatternAnalysis(analysis)
    } catch (error) {
      console.error('Pattern analysis failed:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  // Prepare mood trend data (last 7 days)
  const getMoodTrendData = () => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (6 - i))
      return date
    })

    return last7Days.map((date) => {
      const dayEntries = moodEntries.filter((entry) => entry.date.toDateString() === date.toDateString())
      const avgMood =
        dayEntries.length > 0 ? dayEntries.reduce((sum, entry) => sum + entry.mood, 0) / dayEntries.length : 0

      return {
        date: date.toLocaleDateString("en-US", { weekday: "short" }),
        mood: Math.round(avgMood * 10) / 10,
      }
    })
  }

  // Prepare emotion distribution data
  const getEmotionData = () => {
    const emotionCounts: { [key: string]: number } = {}

    moodEntries.forEach((entry) => {
      entry.emotions.forEach((emotion) => {
        emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1
      })
    })

    return Object.entries(emotionCounts)
      .map(([emotion, count]) => ({ emotion, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6)
  }

  // Get statistics
  const getStats = () => {
    const totalMoodEntries = moodEntries.length
    const totalJournalEntries = journalEntries.length
    const avgMood =
      moodEntries.length > 0
        ? (moodEntries.reduce((sum, entry) => sum + entry.mood, 0) / moodEntries.length).toFixed(1)
        : "0"

    const last7DaysMood = moodEntries.filter((entry) => {
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      return entry.date >= weekAgo
    })

    const weeklyAvg =
      last7DaysMood.length > 0
        ? (last7DaysMood.reduce((sum, entry) => sum + entry.mood, 0) / last7DaysMood.length).toFixed(1)
        : "0"

    return { totalMoodEntries, totalJournalEntries, avgMood, weeklyAvg }
  }

  const moodTrendData = getMoodTrendData()
  const emotionData = getEmotionData()
  const stats = getStats()

  // const COLORS = ["#0891b2", "#6ee7b7", "#60a5fa", "#34d399", "#fbbf24", "#f87171"]

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Insights Dashboard</h1>
            <p className="text-muted-foreground">Track your mental health patterns and progress over time</p>
          </div>
          <div className="flex items-center space-x-2">
            {mlConnected ? (
              <Badge variant="default" className="flex items-center space-x-1">
                <Brain className="h-3 w-3" />
                <span>ML Enhanced</span>
              </Badge>
            ) : (
              <Badge variant="outline" className="flex items-center space-x-1">
                <AlertCircle className="h-3 w-3" />
                <span>Basic Mode</span>
              </Badge>
            )}
            {mlConnected && moodEntries.length > 0 && (
              <Button 
                onClick={analyzePatterns} 
                variant="outline" 
                size="sm"
                disabled={isAnalyzing}
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Brain className="h-4 w-4 mr-2" />
                    Analyze Patterns
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Mood Entries</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMoodEntries}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Journal Entries</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalJournalEntries}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Mood</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgMood}/10</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.weeklyAvg}/10</div>
          </CardContent>
        </Card>
      </div>

      {/* ML Pattern Analysis */}
      {patternAnalysis && patternAnalysis.success && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Brain className="h-5 w-5" />
                <span>Pattern Insights</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Trend Direction:</span>
                  <Badge 
                    variant={
                      patternAnalysis.patterns?.trend_direction === 'improving' ? 'default' :
                      patternAnalysis.patterns?.trend_direction === 'declining' ? 'destructive' :
                      'secondary'
                    }
                  >
                    {patternAnalysis.patterns?.trend_direction}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Weekend vs Weekday:</span>
                  <span className="text-sm">
                    Weekend: {patternAnalysis.patterns?.weekend_vs_weekday.weekend_avg || 'N/A'} | 
                    Weekday: {patternAnalysis.patterns?.weekend_vs_weekday.weekday_avg || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Average Mood:</span>
                  <span className="text-sm font-semibold">
                    {patternAnalysis.patterns?.average_mood}/10
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top Emotions</CardTitle>
            </CardHeader>
            <CardContent>
              {patternAnalysis.patterns?.emotion_frequency && Object.keys(patternAnalysis.patterns.emotion_frequency).length > 0 ? (
                <div className="space-y-2">
                  {Object.entries(patternAnalysis.patterns.emotion_frequency)
                    .slice(0, 5)
                    .map(([emotion, count]) => (
                      <div key={emotion} className="flex justify-between items-center">
                        <span className="text-sm">{emotion}</span>
                        <Badge variant="outline">{count}</Badge>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">No emotion data available</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mood Trend Chart */}
        <Card>
          <CardHeader>
            <CardTitle>7-Day Mood Trend</CardTitle>
          </CardHeader>
          <CardContent>
            {moodTrendData.some((d) => d.mood > 0) ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={moodTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 10]} />
                  <Tooltip />
                  <Line type="monotone" dataKey="mood" stroke="#0891b2" strokeWidth={2} dot={{ fill: "#0891b2" }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No mood data available. Start tracking your mood to see trends!
              </div>
            )}
          </CardContent>
        </Card>

        {/* Emotion Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Most Common Emotions</CardTitle>
          </CardHeader>
          <CardContent>
            {emotionData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={emotionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="emotion" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#6ee7b7" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No emotion data available. Start tracking your emotions to see patterns!
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {moodEntries.length === 0 && journalEntries.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No activity yet. Start using the mood tracker and journal to see your progress here!
            </p>
          ) : (
            <div className="space-y-4">
              {/* Combine and sort recent entries */}
              {[...moodEntries.slice(0, 3), ...journalEntries.slice(0, 3)]
                .sort((a, b) => b.date.getTime() - a.date.getTime())
                .slice(0, 5)
                .map((entry, index) => (
                  <div key={index} className="flex items-center space-x-4 p-3 bg-muted rounded-lg">
                    {"mood" in entry ? (
                      <>
                        <Heart className="h-5 w-5 text-primary" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">Mood Entry: {entry.mood}/10</p>
                          <p className="text-xs text-muted-foreground">
                            {entry.date.toLocaleDateString()} • {(entry as any).emotions?.join(", ") || "No emotions"}
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <BookOpen className="h-5 w-5 text-secondary" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">Journal Entry</p>
                          <p className="text-xs text-muted-foreground">
                            {entry.date.toLocaleDateString()} • {entry.content.slice(0, 50)}...
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
