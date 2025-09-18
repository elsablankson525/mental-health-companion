"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Calendar, Save, BookOpen, Brain, Wifi, WifiOff, Trash2, Search } from "lucide-react"
import { enhancedMLService } from "@/lib/enhanced-ml-service"
import { useSession } from "next-auth/react"

interface JournalEntry {
  id: string
  title?: string
  content: string
  date: string
  createdAt: string
  updatedAt: string
  sentiment?: any
}

export default function JournalPage() {
  const { data: session } = useSession()
  const [currentEntry, setCurrentEntry] = useState("")
  const [currentTitle, setCurrentTitle] = useState("")
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isRealtimeConnected, setIsRealtimeConnected] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [sentimentAnalysis, setSentimentAnalysis] = useState<any>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const eventSourceRef = useRef<EventSource | null>(null)

  useEffect(() => {
    if (!session?.user?.id) return

    // Load entries from database
    const loadJournalEntries = async () => {
      try {
        setIsLoading(true)
        const response = await fetch('/api/journal-entries')
        if (response.ok) {
          const entries = await response.json()
          setEntries(entries)
        } else {
          setMessage({ type: 'error', text: 'Failed to load journal entries' })
        }
      } catch (error) {
        console.error('Failed to load journal entries:', error)
        setMessage({ type: 'error', text: 'Failed to load journal entries' })
      } finally {
        setIsLoading(false)
      }
    }

    loadJournalEntries()

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
          
          if (data.type === 'journal_entry') {
            // Refresh journal entries when a new one is added
            loadJournalEntries()
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

  const saveEntry = async () => {
    if (!currentEntry.trim() || !session?.user?.id) return

    try {
      setIsLoading(true)
      const response = await fetch('/api/journal-entries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: currentEntry,
          title: currentTitle.trim() || undefined,
        }),
      })

      if (response.ok) {
        const newEntry = await response.json()
        setEntries([newEntry, ...entries])
        setMessage({ type: 'success', text: 'Journal entry saved successfully!' })

        setCurrentEntry("")
        setCurrentTitle("")
        setSentimentAnalysis(null)
      } else {
        const error = await response.json()
        setMessage({ type: 'error', text: error.error || 'Failed to save journal entry' })
      }
    } catch (error) {
      console.error('Error saving journal entry:', error)
      setMessage({ type: 'error', text: 'Failed to save journal entry' })
    } finally {
      setIsLoading(false)
    }
  }

  const analyzeSentiment = async () => {
    if (!currentEntry.trim()) return

    try {
      setIsAnalyzing(true)
      const analysis = await enhancedMLService.analyzeSentiment(currentEntry)
      setSentimentAnalysis(analysis)
    } catch (error) {
      console.error('Error analyzing sentiment:', error)
      setMessage({ type: 'error', text: 'Failed to analyze sentiment' })
    } finally {
      setIsAnalyzing(false)
    }
  }

  const deleteEntry = async (entryId: string) => {
    if (!confirm('Are you sure you want to delete this entry?')) return

    try {
      const response = await fetch(`/api/journal-entries/${entryId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setEntries(entries.filter(entry => entry.id !== entryId))
        setMessage({ type: 'success', text: 'Journal entry deleted successfully!' })
      } else {
        setMessage({ type: 'error', text: 'Failed to delete journal entry' })
      }
    } catch (error) {
      console.error('Error deleting journal entry:', error)
      setMessage({ type: 'error', text: 'Failed to delete journal entry' })
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const getSentimentColor = (polarity: number) => {
    if (polarity > 0.1) return "text-green-600"
    if (polarity < -0.1) return "text-red-600"
    return "text-gray-600"
  }

  const getSentimentLabel = (polarity: number) => {
    if (polarity > 0.1) return "Positive"
    if (polarity < -0.1) return "Negative"
    return "Neutral"
  }

  const filteredEntries = entries.filter(entry =>
    entry.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (entry.title && entry.title.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  // const moods = [
  //   { emoji: "😊", label: "Happy" },
  //   { emoji: "😌", label: "Calm" },
  //   { emoji: "😐", label: "Neutral" },
  //   { emoji: "😔", label: "Sad" },
  //   { emoji: "😰", label: "Anxious" },
  //   { emoji: "😡", label: "Angry" },
  // ]

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
            <h1 className="text-3xl font-bold text-foreground">Journal</h1>
            <p className="text-muted-foreground">Write down your thoughts and feelings in a safe, private space</p>
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
          </div>
        </div>
      </div>

      {/* New Entry Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BookOpen className="h-5 w-5" />
            <span>New Entry</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Entry Title (Optional)</label>
            <Input
              value={currentTitle}
              onChange={(e) => setCurrentTitle(e.target.value)}
              placeholder="Give your entry a title..."
              className="w-full"
            />
          </div>

          <div>
            <Textarea
              value={currentEntry}
              onChange={(e) => setCurrentEntry(e.target.value)}
              placeholder="What's on your mind today? How are you feeling? What happened that was significant?"
              className="min-h-[200px] resize-none"
            />
          </div>

          {/* Sentiment Analysis */}
          {sentimentAnalysis && (
            <div className="p-3 bg-muted rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-sm">Sentiment Analysis</h4>
                  <p className={`text-sm ${getSentimentColor(sentimentAnalysis.polarity)}`}>
                    {getSentimentLabel(sentimentAnalysis.polarity)} 
                    ({(sentimentAnalysis.polarity * 100).toFixed(1)}%)
                  </p>
                </div>
                <div className="text-xs text-muted-foreground">
                  Subjectivity: {(sentimentAnalysis.subjectivity * 100).toFixed(1)}%
                </div>
              </div>
            </div>
          )}

          <div className="flex space-x-2">
            <Button 
              onClick={analyzeSentiment} 
              variant="outline" 
              disabled={!currentEntry.trim() || isAnalyzing}
              className="flex-1"
            >
              <Brain className="h-4 w-4 mr-2" />
              {isAnalyzing ? 'Analyzing...' : 'Analyze Sentiment'}
            </Button>
            <Button onClick={saveEntry} disabled={!currentEntry.trim() || isLoading} className="flex-1">
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? 'Saving...' : 'Save Entry'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Previous Entries */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-foreground">Previous Entries</h2>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search entries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
          </div>
        </div>

        {filteredEntries.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">
                {searchTerm ? 'No entries match your search.' : 'No journal entries yet. Start writing your first entry above!'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredEntries.map((entry) => (
            <Card key={entry.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {formatDate(entry.date)} at {formatTime(entry.date)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {entry.sentiment && (
                      <Badge variant="outline" className={getSentimentColor(entry.sentiment.polarity)}>
                        {getSentimentLabel(entry.sentiment.polarity)}
                      </Badge>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteEntry(entry.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                {entry.title && (
                  <h3 className="text-lg font-semibold text-foreground mt-2">{entry.title}</h3>
                )}
              </CardHeader>
              <CardContent>
                <p className="text-foreground whitespace-pre-wrap">{entry.content}</p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
