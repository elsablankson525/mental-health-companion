"use client"

import { useState, useEffect, useCallback, useMemo, memo } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { 
  Heart, 
  Plus, 
  Edit, 
  Trash2,
  BarChart3
} from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface MoodEntry {
  id: string
  mood: number
  emotions: string[]
  note?: string
  date: string
  createdAt: string
}

interface MoodStats {
  totalEntries: number
  averageMood: number
  recentTrend: number[]
  lastEntry: MoodEntry | null
}

const EMOTIONS = [
  "Happy", "Sad", "Anxious", "Excited", "Calm", "Frustrated", 
  "Grateful", "Lonely", "Confident", "Overwhelmed", "Peaceful", "Angry"
]

// Memoized emotion button component
const EmotionButton = memo(({ 
  emotion, 
  isSelected, 
  onToggle 
}: { 
  emotion: string
  isSelected: boolean
  onToggle: (emotion: string) => void 
}) => (
  <Button
    variant={isSelected ? "default" : "outline"}
    size="sm"
    onClick={() => onToggle(emotion)}
    className="text-xs"
  >
    {emotion}
  </Button>
))

EmotionButton.displayName = "EmotionButton"

// Memoized mood entry card component
const MoodEntryCard = memo(({ 
  entry, 
  onEdit, 
  onDelete 
}: { 
  entry: MoodEntry
  onEdit: (entry: MoodEntry) => void
  onDelete: (id: string) => void 
}) => {
  const moodColor = useMemo(() => {
    if (entry.mood >= 8) return "text-green-600"
    if (entry.mood >= 6) return "text-yellow-600"
    if (entry.mood >= 4) return "text-orange-600"
    return "text-red-600"
  }, [entry.mood])

  const moodLabel = useMemo(() => {
    if (entry.mood >= 9) return "Excellent"
    if (entry.mood >= 7) return "Good"
    if (entry.mood >= 5) return "Okay"
    if (entry.mood >= 3) return "Poor"
    return "Very Poor"
  }, [entry.mood])

  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="h-4 w-4" />
            <span className="font-medium">{moodLabel}</span>
            <Badge variant="outline" className={moodColor}>
              {entry.mood}/10
            </Badge>
          </div>
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" onClick={() => onEdit(entry)}>
              <Edit className="h-3 w-3" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onDelete(entry.id)}>
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          {new Date(entry.date).toLocaleDateString()}
        </p>
      </CardHeader>
      <CardContent>
        {entry.emotions.length > 0 && (
          <div className="mb-2">
            <div className="flex flex-wrap gap-1">
              {entry.emotions.map((emotion) => (
                <Badge key={emotion} variant="secondary" className="text-xs">
                  {emotion}
                </Badge>
              ))}
            </div>
          </div>
        )}
        {entry.note && (
          <p className="text-sm text-muted-foreground">{entry.note}</p>
        )}
      </CardContent>
    </Card>
  )
})

MoodEntryCard.displayName = "MoodEntryCard"

export default function OptimizedMoodTracker() {
  const { data: session } = useSession()
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>([])
  const [moodStats, setMoodStats] = useState<MoodStats | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingEntry, setEditingEntry] = useState<MoodEntry | null>(null)
  
  // Form state
  const [currentMood, setCurrentMood] = useState(5)
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([])
  const [note, setNote] = useState("")

  // Memoized data loading function
  const loadMoodData = useCallback(async () => {
    if (!session?.user?.id) return

    try {
      setIsLoading(true)
      const response = await fetch('/api/mood-entries?includeStats=true&limit=50')
      if (response.ok) {
        const data = await response.json()
        setMoodEntries(data.entries || [])
        setMoodStats(data.stats || null)
      } else {
        setMessage({ type: 'error', text: 'Failed to load mood entries' })
      }
    } catch (error) {
      console.error('Failed to load mood entries:', error)
      setMessage({ type: 'error', text: 'Failed to load mood entries' })
    } finally {
      setIsLoading(false)
    }
  }, [session?.user?.id])

  // Load data on mount
  useEffect(() => {
    loadMoodData()
  }, [loadMoodData])

  // Memoized emotion toggle handler
  const handleEmotionToggle = useCallback((emotion: string) => {
    setSelectedEmotions(prev => 
      prev.includes(emotion) 
        ? prev.filter(e => e !== emotion)
        : [...prev, emotion]
    )
  }, [])

  // Memoized form submission handler
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session?.user?.id) return

    try {
      setIsLoading(true)
      const response = await fetch('/api/mood-entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mood: currentMood,
          emotions: selectedEmotions,
          note: note.trim() || undefined
        })
      })

      if (response.ok) {
        setMessage({ type: 'success', text: 'Mood entry saved successfully!' })
        setCurrentMood(5)
        setSelectedEmotions([])
        setNote("")
        setShowForm(false)
        setEditingEntry(null)
        await loadMoodData()
      } else {
        const error = await response.json()
        setMessage({ type: 'error', text: error.error || 'Failed to save mood entry' })
      }
    } catch (error) {
      console.error('Failed to save mood entry:', error)
      setMessage({ type: 'error', text: 'Failed to save mood entry' })
    } finally {
      setIsLoading(false)
    }
  }, [session?.user?.id, currentMood, selectedEmotions, note, loadMoodData])

  // Memoized edit handler
  const handleEdit = useCallback((entry: MoodEntry) => {
    setEditingEntry(entry)
    setCurrentMood(entry.mood)
    setSelectedEmotions(entry.emotions)
    setNote(entry.note || "")
    setShowForm(true)
  }, [])

  // Memoized delete handler
  const handleDelete = useCallback(async (id: string) => {
    if (!confirm('Are you sure you want to delete this mood entry?')) return

    try {
      setIsLoading(true)
      const response = await fetch(`/api/mood-entries/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setMessage({ type: 'success', text: 'Mood entry deleted successfully!' })
        await loadMoodData()
      } else {
        setMessage({ type: 'error', text: 'Failed to delete mood entry' })
      }
    } catch (error) {
      console.error('Failed to delete mood entry:', error)
      setMessage({ type: 'error', text: 'Failed to delete mood entry' })
    } finally {
      setIsLoading(false)
    }
  }, [loadMoodData])

  // Memoized chart data
  const chartData = useMemo(() => {
    return moodEntries.slice(0, 7).reverse().map(entry => ({
      date: new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      mood: entry.mood
    }))
  }, [moodEntries])

  // Memoized recent entries
  const recentEntries = useMemo(() => {
    return moodEntries.slice(0, 5)
  }, [moodEntries])

  // Clear message after 3 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [message])

  if (!session) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p>Please sign in to track your mood.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Mood Tracker</h1>
          <p className="text-muted-foreground">Track your daily mood and emotional patterns</p>
        </div>
        <Button onClick={() => setShowForm(true)} disabled={isLoading}>
          <Plus className="h-4 w-4 mr-2" />
          Add Entry
        </Button>
      </div>

      {/* Message */}
      {message && (
        <div className={`p-4 rounded-lg ${
          message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {message.text}
        </div>
      )}

      {/* Stats Cards */}
      {moodStats && (
        <div className="grid md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Entries</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{moodStats.totalEntries}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Average Mood</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{moodStats.averageMood.toFixed(1)}/10</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Last Entry</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {moodStats.lastEntry ? `${moodStats.lastEntry.mood}/10` : 'None'}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Mood Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingEntry ? 'Edit Mood Entry' : 'Add New Mood Entry'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="mood">How are you feeling? ({currentMood}/10)</Label>
                <Slider
                  id="mood"
                  min={1}
                  max={10}
                  step={1}
                  value={[currentMood]}
                  onValueChange={(value) => setCurrentMood(value[0])}
                  className="mt-2"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>Very Poor</span>
                  <span>Excellent</span>
                </div>
              </div>

              <div>
                <Label>Emotions (select all that apply)</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {EMOTIONS.map((emotion) => (
                    <EmotionButton
                      key={emotion}
                      emotion={emotion}
                      isSelected={selectedEmotions.includes(emotion)}
                      onToggle={handleEmotionToggle}
                    />
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="note">Notes (optional)</Label>
                <Textarea
                  id="note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="How are you feeling? What's on your mind?"
                  className="mt-2"
                  maxLength={1000}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {note.length}/1000 characters
                </p>
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Saving...' : (editingEntry ? 'Update' : 'Save')}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setShowForm(false)
                    setEditingEntry(null)
                    setCurrentMood(5)
                    setSelectedEmotions([])
                    setNote("")
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Chart */}
      {chartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Mood Trend (Last 7 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[1, 10]} />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="mood" 
                  stroke="#8884d8" 
                  strokeWidth={2}
                  dot={{ fill: '#8884d8', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Recent Entries */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Recent Entries</h2>
        {recentEntries.length > 0 ? (
          <div className="space-y-4">
            {recentEntries.map((entry) => (
              <MoodEntryCard
                key={entry.id}
                entry={entry}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-6 text-center">
              <Heart className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No mood entries yet. Start tracking your mood!</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
