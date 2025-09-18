"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { 
  Moon, 
  Sun, 
  Clock, 
  TrendingUp, 
  Calendar,
  Plus,
  Edit,
  Trash2,
  Coffee,
  Smartphone,
  Lightbulb,
  Volume2,
  Thermometer,
  Bed,
  Activity,
  Heart
} from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts"

interface SleepEntry {
  id: string
  date: Date
  bedtime: string
  wakeTime: string
  sleepDuration: number // in hours
  sleepQuality: number // 1-10 scale
  sleepLatency: number // minutes to fall asleep
  awakenings: number
  mood: number // 1-10 scale
  energy: number // 1-10 scale
  factors: {
    caffeine: number // hours before bed
    exercise: number // hours before bed
    screenTime: number // hours before bed
    stress: number // 1-10 scale
    roomTemp: number // celsius
    noise: number // 1-10 scale
    light: number // 1-10 scale
  }
  notes?: string
}

const sleepQualityLabels = {
  1: "Very Poor",
  2: "Poor", 
  3: "Fair",
  4: "Good",
  5: "Very Good",
  6: "Excellent",
  7: "Outstanding",
  8: "Exceptional",
  9: "Perfect",
  10: "Ideal"
}

const sleepQualityColors = {
  1: "bg-red-100 text-red-800",
  2: "bg-red-100 text-red-800",
  3: "bg-orange-100 text-orange-800",
  4: "bg-yellow-100 text-yellow-800",
  5: "bg-yellow-100 text-yellow-800",
  6: "bg-green-100 text-green-800",
  7: "bg-green-100 text-green-800",
  8: "bg-blue-100 text-blue-800",
  9: "bg-blue-100 text-blue-800",
  10: "bg-purple-100 text-purple-800"
}

export default function SleepTracker() {
  const [sleepEntries, setSleepEntries] = useState<SleepEntry[]>([])
  const [showLogDialog, setShowLogDialog] = useState(false)
  const [editingEntry, setEditingEntry] = useState<SleepEntry | null>(null)
  const [newEntry, setNewEntry] = useState({
    date: new Date().toISOString().split('T')[0],
    bedtime: "22:00",
    wakeTime: "07:00",
    sleepQuality: 5,
    sleepLatency: 15,
    awakenings: 0,
    mood: 5,
    energy: 5,
    factors: {
      caffeine: 6,
      exercise: 2,
      screenTime: 1,
      stress: 5,
      roomTemp: 20,
      noise: 3,
      light: 2
    },
    notes: ""
  })

  useEffect(() => {
    // Load sleep entries from localStorage
    const savedEntries = localStorage.getItem('sleepEntries')
    if (savedEntries) {
      const parsedEntries = JSON.parse(savedEntries).map((entry: any) => ({
        ...entry,
        date: new Date(entry.date)
      }))
      setSleepEntries(parsedEntries)
    } else {
      // Load sample sleep entries with cultural context
      setSleepEntries(getSampleSleepEntries())
    }
  }, [])

  const getSampleSleepEntries = (): SleepEntry[] => [
    {
      id: "gh-1",
      date: new Date('2024-01-15'),
      bedtime: "22:30",
      wakeTime: "06:30",
      sleepDuration: 8,
      sleepQuality: 7,
      sleepLatency: 20,
      awakenings: 1,
      mood: 7,
      energy: 6,
      factors: {
        caffeine: 8,
        exercise: 3,
        screenTime: 2,
        stress: 4,
        roomTemp: 25, // Warmer climate in Ghana
        noise: 4,
        light: 2
      },
      notes: "Good sleep despite neighborhood noise. Traditional evening routines helped with relaxation."
    },
    {
      id: "gh-2",
      date: new Date('2024-01-14'),
      bedtime: "23:00",
      wakeTime: "07:00",
      sleepDuration: 8,
      sleepQuality: 6,
      sleepLatency: 30,
      awakenings: 2,
      mood: 6,
      energy: 5,
      factors: {
        caffeine: 6,
        exercise: 1,
        screenTime: 3,
        stress: 6,
        roomTemp: 26,
        noise: 5,
        light: 3
      },
      notes: "Had trouble falling asleep due to work stress. Used traditional herbal tea before bed."
    },
    {
      id: "gl-1",
      date: new Date('2024-01-13'),
      bedtime: "23:30",
      wakeTime: "07:30",
      sleepDuration: 8,
      sleepQuality: 8,
      sleepLatency: 15,
      awakenings: 0,
      mood: 8,
      energy: 7,
      factors: {
        caffeine: 8,
        exercise: 2,
        screenTime: 1,
        stress: 3,
        roomTemp: 20,
        noise: 2,
        light: 1
      },
      notes: "Excellent sleep quality. Used meditation app and blackout curtains. Cool room temperature helped."
    },
    {
      id: "gl-2",
      date: new Date('2024-01-12'),
      bedtime: "22:45",
      wakeTime: "06:45",
      sleepDuration: 8,
      sleepQuality: 5,
      sleepLatency: 45,
      awakenings: 3,
      mood: 5,
      energy: 4,
      factors: {
        caffeine: 4,
        exercise: 4,
        screenTime: 4,
        stress: 7,
        roomTemp: 22,
        noise: 6,
        light: 4
      },
      notes: "Poor sleep due to stress and late screen time. Need to improve sleep hygiene."
    }
  ]

  useEffect(() => {
    // Save sleep entries to localStorage whenever entries change
    localStorage.setItem('sleepEntries', JSON.stringify(sleepEntries))
  }, [sleepEntries])

  const calculateSleepDuration = (bedtime: string, wakeTime: string): number => {
    const [bedHour, bedMin] = bedtime.split(':').map(Number)
    const [wakeHour, wakeMin] = wakeTime.split(':').map(Number)
    
    let bedMinutes = bedHour * 60 + bedMin
    let wakeMinutes = wakeHour * 60 + wakeMin
    
    // Handle overnight sleep (bedtime after midnight)
    if (bedMinutes > wakeMinutes) {
      wakeMinutes += 24 * 60 // Add 24 hours
    }
    
    const durationMinutes = wakeMinutes - bedMinutes
    return Math.round((durationMinutes / 60) * 10) / 10 // Round to 1 decimal
  }

  const logSleepEntry = () => {
    if (!newEntry.date || !newEntry.bedtime || !newEntry.wakeTime) return

    const sleepDuration = calculateSleepDuration(newEntry.bedtime, newEntry.wakeTime)
    
    const entry: SleepEntry = {
      id: Date.now().toString(),
      date: new Date(newEntry.date),
      bedtime: newEntry.bedtime,
      wakeTime: newEntry.wakeTime,
      sleepDuration,
      sleepQuality: newEntry.sleepQuality,
      sleepLatency: newEntry.sleepLatency,
      awakenings: newEntry.awakenings,
      mood: newEntry.mood,
      energy: newEntry.energy,
      factors: { ...newEntry.factors },
      notes: newEntry.notes
    }

    setSleepEntries(prev => [...prev, entry])
    resetNewEntry()
    setShowLogDialog(false)
  }

  const updateSleepEntry = () => {
    if (!editingEntry) return

    const sleepDuration = calculateSleepDuration(editingEntry.bedtime, editingEntry.wakeTime)
    const updatedEntry = { ...editingEntry, sleepDuration }

    setSleepEntries(prev => prev.map(entry => 
      entry.id === editingEntry.id ? updatedEntry : entry
    ))
    setEditingEntry(null)
  }

  const deleteSleepEntry = (entryId: string) => {
    setSleepEntries(prev => prev.filter(entry => entry.id !== entryId))
  }

  const resetNewEntry = () => {
    setNewEntry({
      date: new Date().toISOString().split('T')[0],
      bedtime: "22:00",
      wakeTime: "07:00",
      sleepQuality: 5,
      sleepLatency: 15,
      awakenings: 0,
      mood: 5,
      energy: 5,
      factors: {
        caffeine: 6,
        exercise: 2,
        screenTime: 1,
        stress: 5,
        roomTemp: 20,
        noise: 3,
        light: 2
      },
      notes: ""
    })
  }

  const getSleepScore = (entry: SleepEntry): number => {
    // Calculate sleep score based on multiple factors
    let score = 0
    
    // Sleep duration (optimal: 7-9 hours)
    if (entry.sleepDuration >= 7 && entry.sleepDuration <= 9) {
      score += 30
    } else if (entry.sleepDuration >= 6 && entry.sleepDuration <= 10) {
      score += 20
    } else {
      score += 10
    }
    
    // Sleep quality
    score += entry.sleepQuality * 3
    
    // Sleep latency (optimal: <20 minutes)
    if (entry.sleepLatency <= 20) {
      score += 20
    } else if (entry.sleepLatency <= 30) {
      score += 15
    } else {
      score += 10
    }
    
    // Awakenings (optimal: 0-1)
    if (entry.awakenings <= 1) {
      score += 20
    } else if (entry.awakenings <= 3) {
      score += 10
    }
    
    return Math.min(100, Math.max(0, score))
  }

  const getSleepScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    if (score >= 40) return "text-orange-600"
    return "text-red-600"
  }

  const getSleepScoreLabel = (score: number) => {
    if (score >= 80) return "Excellent"
    if (score >= 60) return "Good"
    if (score >= 40) return "Fair"
    return "Poor"
  }

  const getSleepTrends = () => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (6 - i))
      return date
    })

    return last7Days.map(date => {
      const entry = sleepEntries.find(e => e.date.toDateString() === date.toDateString())
      return {
        date: date.toLocaleDateString("en-US", { weekday: "short" }),
        sleepDuration: entry?.sleepDuration || 0,
        sleepQuality: entry?.sleepQuality || 0,
        sleepScore: entry ? getSleepScore(entry) : 0
      }
    })
  }

  const getSleepStats = () => {
    if (sleepEntries.length === 0) {
      return {
        avgDuration: 0,
        avgQuality: 0,
        avgScore: 0,
        totalEntries: 0,
        bestStreak: 0
      }
    }

    const avgDuration = sleepEntries.reduce((sum, entry) => sum + entry.sleepDuration, 0) / sleepEntries.length
    const avgQuality = sleepEntries.reduce((sum, entry) => sum + entry.sleepQuality, 0) / sleepEntries.length
    const avgScore = sleepEntries.reduce((sum, entry) => sum + getSleepScore(entry), 0) / sleepEntries.length

    return {
      avgDuration: Math.round(avgDuration * 10) / 10,
      avgQuality: Math.round(avgQuality * 10) / 10,
      avgScore: Math.round(avgScore),
      totalEntries: sleepEntries.length,
      bestStreak: 0 // TODO: Calculate actual streak
    }
  }

  const getSleepHygieneTips = (entry: SleepEntry) => {
    const tips = []
    
    if (entry.factors.caffeine < 6) {
      tips.push("Avoid caffeine within 6 hours of bedtime")
    }
    
    if (entry.factors.screenTime > 1) {
      tips.push("Reduce screen time 1 hour before bed")
    }
    
    if (entry.factors.stress > 7) {
      tips.push("Try relaxation techniques before bed")
    }
    
    if (entry.factors.roomTemp > 22 || entry.factors.roomTemp < 18) {
      tips.push("Keep bedroom temperature between 18-22°C")
    }
    
    if (entry.factors.light > 5) {
      tips.push("Use blackout curtains or eye mask")
    }
    
    if (entry.factors.noise > 5) {
      tips.push("Use earplugs or white noise machine")
    }
    
    if (entry.sleepLatency > 30) {
      tips.push("Try a consistent bedtime routine")
    }
    
    if (entry.awakenings > 3) {
      tips.push("Limit fluids before bedtime")
    }
    
    return tips.length > 0 ? tips : ["Great sleep hygiene! Keep it up!"]
  }

  const sleepTrends = getSleepTrends()
  const stats = getSleepStats()

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Sleep Tracker</h1>
          <p className="text-muted-foreground">Monitor your sleep patterns and improve your sleep quality</p>
        </div>
        <Dialog open={showLogDialog} onOpenChange={setShowLogDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Log Sleep
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Log Sleep Entry</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={newEntry.date}
                    onChange={(e) => setNewEntry(prev => ({ ...prev, date: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="bedtime">Bedtime</Label>
                  <Input
                    id="bedtime"
                    type="time"
                    value={newEntry.bedtime}
                    onChange={(e) => setNewEntry(prev => ({ ...prev, bedtime: e.target.value }))}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="wakeTime">Wake Time</Label>
                  <Input
                    id="wakeTime"
                    type="time"
                    value={newEntry.wakeTime}
                    onChange={(e) => setNewEntry(prev => ({ ...prev, wakeTime: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Sleep Duration</Label>
                  <div className="text-lg font-semibold text-primary">
                    {calculateSleepDuration(newEntry.bedtime, newEntry.wakeTime)} hours
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label>Sleep Quality (1-10)</Label>
                  <div className="space-y-2">
                    <Slider
                      value={[newEntry.sleepQuality]}
                      onValueChange={(value) => setNewEntry(prev => ({ ...prev, sleepQuality: value[0] }))}
                      max={10}
                      min={1}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Very Poor</span>
                      <span className="font-medium">{sleepQualityLabels[newEntry.sleepQuality as keyof typeof sleepQualityLabels]}</span>
                      <span>Ideal</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="sleepLatency">Time to Fall Asleep (minutes)</Label>
                    <Input
                      id="sleepLatency"
                      type="number"
                      value={newEntry.sleepLatency}
                      onChange={(e) => setNewEntry(prev => ({ ...prev, sleepLatency: parseInt(e.target.value) || 0 }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="awakenings">Number of Awakenings</Label>
                    <Input
                      id="awakenings"
                      type="number"
                      value={newEntry.awakenings}
                      onChange={(e) => setNewEntry(prev => ({ ...prev, awakenings: parseInt(e.target.value) || 0 }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Morning Mood (1-10)</Label>
                    <Slider
                      value={[newEntry.mood]}
                      onValueChange={(value) => setNewEntry(prev => ({ ...prev, mood: value[0] }))}
                      max={10}
                      min={1}
                      step={1}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <Label>Morning Energy (1-10)</Label>
                    <Slider
                      value={[newEntry.energy]}
                      onValueChange={(value) => setNewEntry(prev => ({ ...prev, energy: value[0] }))}
                      max={10}
                      min={1}
                      step={1}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold">Sleep Environment Factors</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="flex items-center space-x-2">
                      <Coffee className="h-4 w-4" />
                      <span>Caffeine (hours before bed)</span>
                    </Label>
                    <Slider
                      value={[newEntry.factors.caffeine]}
                      onValueChange={(value) => setNewEntry(prev => ({ 
                        ...prev, 
                        factors: { ...prev.factors, caffeine: value[0] }
                      }))}
                      max={12}
                      min={0}
                      step={1}
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <Label className="flex items-center space-x-2">
                      <Activity className="h-4 w-4" />
                      <span>Exercise (hours before bed)</span>
                    </Label>
                    <Slider
                      value={[newEntry.factors.exercise]}
                      onValueChange={(value) => setNewEntry(prev => ({ 
                        ...prev, 
                        factors: { ...prev.factors, exercise: value[0] }
                      }))}
                      max={12}
                      min={0}
                      step={1}
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="flex items-center space-x-2">
                      <Smartphone className="h-4 w-4" />
                      <span>Screen Time (hours before bed)</span>
                    </Label>
                    <Slider
                      value={[newEntry.factors.screenTime]}
                      onValueChange={(value) => setNewEntry(prev => ({ 
                        ...prev, 
                        factors: { ...prev.factors, screenTime: value[0] }
                      }))}
                      max={6}
                      min={0}
                      step={0.5}
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <Label className="flex items-center space-x-2">
                      <Heart className="h-4 w-4" />
                      <span>Stress Level (1-10)</span>
                    </Label>
                    <Slider
                      value={[newEntry.factors.stress]}
                      onValueChange={(value) => setNewEntry(prev => ({ 
                        ...prev, 
                        factors: { ...prev.factors, stress: value[0] }
                      }))}
                      max={10}
                      min={1}
                      step={1}
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label className="flex items-center space-x-2">
                      <Thermometer className="h-4 w-4" />
                      <span>Room Temp (°C)</span>
                    </Label>
                    <Slider
                      value={[newEntry.factors.roomTemp]}
                      onValueChange={(value) => setNewEntry(prev => ({ 
                        ...prev, 
                        factors: { ...prev.factors, roomTemp: value[0] }
                      }))}
                      max={30}
                      min={15}
                      step={1}
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <Label className="flex items-center space-x-2">
                      <Volume2 className="h-4 w-4" />
                      <span>Noise Level (1-10)</span>
                    </Label>
                    <Slider
                      value={[newEntry.factors.noise]}
                      onValueChange={(value) => setNewEntry(prev => ({ 
                        ...prev, 
                        factors: { ...prev.factors, noise: value[0] }
                      }))}
                      max={10}
                      min={1}
                      step={1}
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <Label className="flex items-center space-x-2">
                      <Lightbulb className="h-4 w-4" />
                      <span>Light Level (1-10)</span>
                    </Label>
                    <Slider
                      value={[newEntry.factors.light]}
                      onValueChange={(value) => setNewEntry(prev => ({ 
                        ...prev, 
                        factors: { ...prev.factors, light: value[0] }
                      }))}
                      max={10}
                      min={1}
                      step={1}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Notes (optional)</Label>
                <Input
                  id="notes"
                  value={newEntry.notes}
                  onChange={(e) => setNewEntry(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Any additional notes about your sleep..."
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowLogDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={logSleepEntry}>
                  Log Sleep Entry
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Sleep Duration</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgDuration}h</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Sleep Quality</CardTitle>
            <Moon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgQuality}/10</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sleep Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getSleepScoreColor(stats.avgScore)}`}>
              {stats.avgScore}
            </div>
            <p className="text-xs text-muted-foreground">{getSleepScoreLabel(stats.avgScore)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Entries</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEntries}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="entries">Sleep Log</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sleep Duration Trend */}
            <Card>
              <CardHeader>
                <CardTitle>7-Day Sleep Duration</CardTitle>
              </CardHeader>
              <CardContent>
                {sleepTrends.some(d => d.sleepDuration > 0) ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={sleepTrends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis domain={[0, 12]} />
                      <Tooltip />
                      <Line type="monotone" dataKey="sleepDuration" stroke="#0891b2" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                    No sleep data available. Start logging your sleep to see trends!
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Sleep Quality Trend */}
            <Card>
              <CardHeader>
                <CardTitle>7-Day Sleep Quality</CardTitle>
              </CardHeader>
              <CardContent>
                {sleepTrends.some(d => d.sleepQuality > 0) ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={sleepTrends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis domain={[0, 10]} />
                      <Tooltip />
                      <Bar dataKey="sleepQuality" fill="#6ee7b7" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                    No sleep data available. Start logging your sleep to see trends!
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sleep Score Trend</CardTitle>
            </CardHeader>
            <CardContent>
              {sleepTrends.some(d => d.sleepScore > 0) ? (
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={sleepTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Line type="monotone" dataKey="sleepScore" stroke="#8b5cf6" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[400px] flex items-center justify-center text-muted-foreground">
                  No sleep data available. Start logging your sleep to see trends!
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="entries" className="space-y-4">
          {sleepEntries.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Bed className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Sleep Entries Yet</h3>
                <p className="text-muted-foreground mb-4">Start tracking your sleep to monitor patterns and improve your sleep quality</p>
                <Button onClick={() => setShowLogDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Log Your First Sleep Entry
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {sleepEntries
                .sort((a, b) => b.date.getTime() - a.date.getTime())
                .map((entry) => {
                  const sleepScore = getSleepScore(entry)
                  const tips = getSleepHygieneTips(entry)
                  
                  return (
                    <Card key={entry.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <h3 className="text-lg font-semibold">
                                {entry.date.toLocaleDateString()}
                              </h3>
                              <Badge className={sleepQualityColors[entry.sleepQuality as keyof typeof sleepQualityColors]}>
                                {sleepQualityLabels[entry.sleepQuality as keyof typeof sleepQualityLabels]}
                              </Badge>
                              <Badge className={`${getSleepScoreColor(sleepScore)} bg-opacity-20`}>
                                Score: {sleepScore}
                              </Badge>
                            </div>
                            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                              <div className="flex items-center space-x-1">
                                <Moon className="h-4 w-4" />
                                <span>{entry.bedtime}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Sun className="h-4 w-4" />
                                <span>{entry.wakeTime}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Clock className="h-4 w-4" />
                                <span>{entry.sleepDuration}h</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setEditingEntry(entry)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => deleteSleepEntry(entry.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div className="text-center">
                            <div className="text-sm text-muted-foreground">Sleep Latency</div>
                            <div className="font-semibold">{entry.sleepLatency} min</div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm text-muted-foreground">Awakenings</div>
                            <div className="font-semibold">{entry.awakenings}</div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm text-muted-foreground">Morning Mood</div>
                            <div className="font-semibold">{entry.mood}/10</div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm text-muted-foreground">Morning Energy</div>
                            <div className="font-semibold">{entry.energy}/10</div>
                          </div>
                        </div>
                        
                        {entry.notes && (
                          <div className="mb-4 p-3 bg-muted rounded-lg">
                            <p className="text-sm">{entry.notes}</p>
                          </div>
                        )}

                        <div>
                          <h4 className="font-medium mb-2">Sleep Hygiene Tips</h4>
                          <div className="space-y-1">
                            {tips.map((tip, index) => (
                              <div key={index} className="text-sm text-muted-foreground flex items-start space-x-2">
                                <Lightbulb className="h-4 w-4 mt-0.5 text-yellow-500" />
                                <span>{tip}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Edit Entry Dialog */}
      {editingEntry && (
        <Dialog open={!!editingEntry} onOpenChange={() => setEditingEntry(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Sleep Entry</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-bedtime">Bedtime</Label>
                  <Input
                    id="edit-bedtime"
                    type="time"
                    value={editingEntry.bedtime}
                    onChange={(e) => setEditingEntry(prev => prev ? { ...prev, bedtime: e.target.value } : null)}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-wakeTime">Wake Time</Label>
                  <Input
                    id="edit-wakeTime"
                    type="time"
                    value={editingEntry.wakeTime}
                    onChange={(e) => setEditingEntry(prev => prev ? { ...prev, wakeTime: e.target.value } : null)}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-sleepLatency">Sleep Latency (minutes)</Label>
                  <Input
                    id="edit-sleepLatency"
                    type="number"
                    value={editingEntry.sleepLatency}
                    onChange={(e) => setEditingEntry(prev => prev ? { ...prev, sleepLatency: parseInt(e.target.value) || 0 } : null)}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-awakenings">Awakenings</Label>
                  <Input
                    id="edit-awakenings"
                    type="number"
                    value={editingEntry.awakenings}
                    onChange={(e) => setEditingEntry(prev => prev ? { ...prev, awakenings: parseInt(e.target.value) || 0 } : null)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="edit-notes">Notes</Label>
                <Input
                  id="edit-notes"
                  value={editingEntry.notes || ""}
                  onChange={(e) => setEditingEntry(prev => prev ? { ...prev, notes: e.target.value } : null)}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setEditingEntry(null)}>
                  Cancel
                </Button>
                <Button onClick={updateSleepEntry}>
                  Save Changes
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
