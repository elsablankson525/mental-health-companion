"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Heart, TrendingUp, Brain, AlertCircle, Lightbulb, Wifi, WifiOff } from "lucide-react"
import { enhancedMLService, MoodPrediction } from "@/lib/enhanced-ml-service"
import { useSession } from "next-auth/react"

interface MoodEntry {
  id: string
  mood: number
  emotions: string[]
  date: string
  note?: string
  sentiment?: any
  createdAt: string
  updatedAt: string
}

export default function MoodTracker() {
  const { data: session } = useSession()
  const [currentMood, setCurrentMood] = useState([5])
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([])
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>([])
  const [note, setNote] = useState("")
  const [mlConnected, setMlConnected] = useState(false)
  const [moodPrediction, setMoodPrediction] = useState<MoodPrediction | null>(null)
  const [recommendations, setRecommendations] = useState<string[]>([])
  const [isPredicting, setIsPredicting] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isRealtimeConnected, setIsRealtimeConnected] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const eventSourceRef = useRef<EventSource | null>(null)

  useEffect(() => {
    if (!session?.user?.id) return

    // Load mood entries from database
    const loadMoodEntries = async () => {
      try {
        setIsLoading(true)
        const response = await fetch('/api/mood-entries')
        if (response.ok) {
          const entries = await response.json()
          setMoodEntries(entries)
        } else {
          setMessage({ type: 'error', text: 'Failed to load mood entries' })
        }
      } catch (error) {
        console.error('Failed to load mood entries:', error)
        setMessage({ type: 'error', text: 'Failed to load mood entries' })
      } finally {
        setIsLoading(false)
      }
    }

    loadMoodEntries()

    // Check ML service connection
    enhancedMLService.healthCheck()
      .then((health) => {
        setMlConnected(health.status === 'healthy')
      })
      .catch(() => {
        setMlConnected(false)
      })

    // Setup real-time connection
    const setupRealtimeConnection = () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
      }

      const eventSource = new EventSource('/api/realtime')
      eventSourceRef.current = eventSource

      eventSource.onopen = () => {
        setIsRealtimeConnected(true)
      }

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          
          if (data.type === 'mood_update') {
            // Refresh mood entries when a new one is added
            loadMoodEntries()
          } else if (data.type === 'crisis_alert') {
            setMessage({ 
              type: 'error', 
              text: `Crisis Alert: ${data.data.recommendations.join(', ')}` 
            })
          }
        } catch (error) {
          console.error('Error parsing real-time message:', error)
        }
      }

      eventSource.onerror = () => {
        setIsRealtimeConnected(false)
        // Attempt to reconnect after 5 seconds
        setTimeout(setupRealtimeConnection, 5000)
      }
    }

    setupRealtimeConnection()

    // Cleanup on unmount
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
      }
    }
  }, [session?.user?.id])

  const emotions = [
    "Happy",
    "Sad",
    "Anxious",
    "Calm",
    "Excited",
    "Frustrated",
    "Grateful",
    "Lonely",
    "Confident",
    "Overwhelmed",
    "Peaceful",
    "Angry",
  ]

  const moodLabels = [
    "Terrible",
    "Very Bad",
    "Bad",
    "Poor",
    "Below Average",
    "Average",
    "Above Average",
    "Good",
    "Very Good",
    "Excellent",
  ]

  const saveMoodEntry = async () => {
    if (!session?.user?.id) return

    try {
      setIsLoading(true)
      const response = await fetch('/api/mood-entries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mood: currentMood[0],
          emotions: selectedEmotions,
          note: note.trim() || undefined,
        }),
      })

      if (response.ok) {
        const newEntry = await response.json()
        setMoodEntries([newEntry, ...moodEntries])
        setMessage({ type: 'success', text: 'Mood entry saved successfully!' })

        // Reset form
        setCurrentMood([5])
        setSelectedEmotions([])
        setNote("")
        setMoodPrediction(null)
        setRecommendations([])
      } else {
        const error = await response.json()
        setMessage({ type: 'error', text: error.error || 'Failed to save mood entry' })
      }
    } catch (error) {
      console.error('Error saving mood entry:', error)
      setMessage({ type: 'error', text: 'Failed to save mood entry' })
    } finally {
      setIsLoading(false)
    }
  }

  const toggleEmotion = (emotion: string) => {
    setSelectedEmotions((prev) => (prev.includes(emotion) ? prev.filter((e) => e !== emotion) : [...prev, emotion]))
  }

  const predictMood = async () => {
    if (!mlConnected || moodEntries.length < 5) return

    setIsPredicting(true)
    try {
      // Get recent data for comprehensive prediction
      const recentMoods = moodEntries.slice(0, 7).map(entry => entry.mood)
      const recentSleep: number[] = [] // Would be fetched from sleep API
      const recentMedication: number[] = [] // Would be fetched from medication API
      const recentActivities: number[] = [] // Would be fetched from wellness API
      const recentSocial: number[] = [] // Would be fetched from community API

      const prediction = await enhancedMLService.predictMoodEnhanced({
        recentMoods,
        sleepQuality: recentSleep,
        medicationAdherence: recentMedication,
        activityLevel: recentActivities,
        socialEngagement: recentSocial,
        stressLevel: selectedEmotions.includes('Anxious') || selectedEmotions.includes('Overwhelmed') ? 7 : 3,
        dayOfWeek: new Date().getDay()
      })

      setMoodPrediction(prediction)
      setRecommendations(prediction.recommendations)
    } catch (error) {
      console.error('Mood prediction failed:', error)
      setMessage({ type: 'error', text: 'Mood prediction failed. Please try again.' })
    } finally {
      setIsPredicting(false)
    }
  }

  const getMoodColor = (mood: number) => {
    if (mood <= 2) return "text-red-500"
    if (mood <= 4) return "text-orange-500"
    if (mood <= 6) return "text-yellow-500"
    if (mood <= 8) return "text-green-500"
    return "text-emerald-500"
  }

  const getAverageMood = () => {
    if (moodEntries.length === 0) return 0
    const sum = moodEntries.reduce((acc, entry) => acc + entry.mood, 0)
    return (sum / moodEntries.length).toFixed(1)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Message Display */}
      {message && (
        <Alert className={message.type === 'success' ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}>
          <AlertDescription className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>
            {message.text}
          </AlertDescription>
        </Alert>
      )}

      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Mood Tracker</h1>
            <p className="text-muted-foreground">
              Track your daily mood and emotional patterns to better understand your mental health
            </p>
          </div>
          <div className="flex items-center space-x-2">
            {isRealtimeConnected ? (
              <Badge variant="default" className="flex items-center space-x-1">
                <Wifi className="h-3 w-3" />
                <span>Live</span>
              </Badge>
            ) : (
              <Badge variant="outline" className="flex items-center space-x-1">
                <WifiOff className="h-3 w-3" />
                <span>Offline</span>
              </Badge>
            )}
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
          </div>
        </div>
      </div>

      {/* Current Mood Entry */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Heart className="h-5 w-5" />
            <span>How are you feeling right now?</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium">Mood Level</span>
              <span className={`text-lg font-semibold ${getMoodColor(currentMood[0])}`}>
                {currentMood[0]}/10 - {moodLabels[currentMood[0] - 1]}
              </span>
            </div>
            <Slider value={currentMood} onValueChange={setCurrentMood} max={10} min={1} step={1} className="w-full" />
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
              <span>Terrible</span>
              <span>Average</span>
              <span>Excellent</span>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-3 block">
              What emotions are you experiencing? (Select all that apply)
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {emotions.map((emotion) => (
                <Button
                  key={emotion}
                  variant={selectedEmotions.includes(emotion) ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleEmotion(emotion)}
                  className="text-sm"
                >
                  {emotion}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Additional notes (optional)</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="What contributed to this mood? Any specific events or thoughts?"
              className="w-full p-3 border border-input rounded-md bg-background text-foreground resize-none"
              rows={3}
            />
          </div>

          <div className="flex space-x-2">
            {mlConnected && moodEntries.length >= 5 && (
              <Button 
                onClick={predictMood} 
                variant="outline" 
                disabled={isPredicting}
                className="flex-1"
              >
                {isPredicting ? (
                  <>
                    <Brain className="h-4 w-4 mr-2 animate-spin" />
                    Predicting...
                  </>
                ) : (
                  <>
                    <Brain className="h-4 w-4 mr-2" />
                    Predict Mood
                  </>
                )}
              </Button>
            )}
            <Button onClick={saveMoodEntry} className="flex-1" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Mood Entry'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ML Predictions and Recommendations */}
      {(moodPrediction || recommendations.length > 0) && (
        <div className="grid md:grid-cols-2 gap-6">
          {moodPrediction && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Brain className="h-5 w-5" />
                  <span>Mood Prediction</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className={`text-3xl font-bold ${getMoodColor(moodPrediction.predictedMood)}`}>
                      {moodPrediction.predictedMood}/10
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Predicted mood based on your patterns
                    </p>
                    <Badge variant="outline" className="mt-2">
                      Confidence: {Math.round(moodPrediction.confidence * 100)}%
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Contributing Factors:</h4>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>Sleep: {Math.round(moodPrediction.factors.sleep * 100)}%</div>
                      <div>Medication: {Math.round(moodPrediction.factors.medication * 100)}%</div>
                      <div>Activities: {Math.round(moodPrediction.factors.activities * 100)}%</div>
                      <div>Social: {Math.round(moodPrediction.factors.social * 100)}%</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {recommendations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Lightbulb className="h-5 w-5" />
                  <span>Personalized Recommendations</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {recommendations.slice(0, 5).map((rec, index) => (
                    <div key={index} className="flex items-start space-x-2 p-2 bg-muted rounded-lg">
                      <span className="text-primary font-bold">•</span>
                      <span className="text-sm">{rec}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Mood History */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Mood Summary</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Entries:</span>
                <span className="font-semibold">{moodEntries.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Average Mood:</span>
                <span className={`font-semibold ${getMoodColor(Number(getAverageMood()))}`}>{getAverageMood()}/10</span>
              </div>
              {moodEntries.length > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Last Entry:</span>
                  <span className="font-semibold">{formatDate(moodEntries[0].date)}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Entries</CardTitle>
          </CardHeader>
          <CardContent>
            {moodEntries.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No mood entries yet. Start tracking above!</p>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {moodEntries.slice(0, 5).map((entry) => (
                  <div key={entry.id} className="border-b border-border pb-2 last:border-b-0">
                    <div className="flex justify-between items-center">
                      <span className={`font-semibold ${getMoodColor(entry.mood)}`}>{entry.mood}/10</span>
                      <span className="text-xs text-muted-foreground">{formatDate(entry.date)}</span>
                    </div>
                    {entry.emotions.length > 0 && (
                      <div className="text-xs text-muted-foreground mt-1">{entry.emotions.join(", ")}</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
