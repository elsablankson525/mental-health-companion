"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Target, 
  Plus, 
  CheckCircle, 
  TrendingUp, 
  Calendar,
  Award,
  Edit,
  Trash2,
  PlusCircle,
  MinusCircle,
  BarChart3,
  Trophy,
  Flame,
  Brain,
  Wifi,
  WifiOff,
  Lightbulb
} from "lucide-react"
import { enhancedMLService } from "@/lib/enhanced-ml-service"
import { useSession } from "next-auth/react"

interface Milestone {
  id: string
  title: string
  description?: string
  targetDate: string
  completed: boolean
  completedAt?: string
  createdAt: string
}

interface Goal {
  id: string
  title: string
  description?: string
  category: string
  targetValue: number
  currentValue: number
  unit: string
  startDate: string
  targetDate: string
  status: 'ACTIVE' | 'COMPLETED' | 'PAUSED' | 'CANCELLED'
  priority: number
  createdAt: string
  updatedAt: string
  milestones: Milestone[]
}

const goalCategories = {
  mood: { label: 'Mood & Emotions', icon: '😊', color: 'bg-blue-100 text-blue-800' },
  habits: { label: 'Healthy Habits', icon: '🌱', color: 'bg-green-100 text-green-800' },
  therapy: { label: 'Therapy & Treatment', icon: '🛋️', color: 'bg-purple-100 text-purple-800' },
  wellness: { label: 'Wellness Activities', icon: '🧘', color: 'bg-pink-100 text-pink-800' },
  social: { label: 'Social Connections', icon: '👥', color: 'bg-orange-100 text-orange-800' },
  personal: { label: 'Personal Growth', icon: '🌟', color: 'bg-yellow-100 text-yellow-800' },
  sleep: { label: 'Sleep Quality', icon: '😴', color: 'bg-indigo-100 text-indigo-800' },
  exercise: { label: 'Physical Activity', icon: '🏃', color: 'bg-emerald-100 text-emerald-800' },
  nutrition: { label: 'Nutrition', icon: '🥗', color: 'bg-lime-100 text-lime-800' },
  cultural: { label: 'Cultural Connection', icon: '🌍', color: 'bg-teal-100 text-teal-800' },
  community: { label: 'Community Impact', icon: '🤝', color: 'bg-cyan-100 text-cyan-800' },
  traditional: { label: 'Traditional Practices', icon: '🏛️', color: 'bg-amber-100 text-amber-800' }
}

const priorityColors = {
  1: 'bg-red-100 text-red-800',
  2: 'bg-yellow-100 text-yellow-800',
  3: 'bg-gray-100 text-gray-800'
}

export default function GoalsTracker() {
  const { data: session } = useSession()
  const [goals, setGoals] = useState<Goal[]>([])
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isRealtimeConnected, setIsRealtimeConnected] = useState(false)
  const [mlConnected, setMlConnected] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [mlRecommendations, setMlRecommendations] = useState<any[]>([])
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false)
  const eventSourceRef = useRef<EventSource | null>(null)
  
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    category: 'mood',
    targetValue: 1,
    unit: 'times',
    startDate: new Date().toISOString().split('T')[0],
    targetDate: '',
    priority: 2,
    milestones: [] as Milestone[]
  })

  const getSampleGoals = (): Goal[] => [
    // Ghana-specific goals
    {
      id: "gh-1",
      title: "Improve Mental Health Awareness in My Community",
      description: "Share information about mental health resources and reduce stigma in my local community in Ghana",
      category: "community",
      targetValue: 50,
      currentValue: 12,
      unit: "people reached",
      startDate: "2024-01-01",
      targetDate: "2024-12-31",
      status: "ACTIVE",
      priority: 1,
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-15T00:00:00Z",
      milestones: [
        {
          id: "gh-1-m1",
          title: "Complete mental health training",
          description: "Attend Ghana Mental Health Authority training program",
          targetDate: "2024-03-31",
          completed: true,
          completedAt: "2024-02-15T00:00:00Z",
          createdAt: "2024-01-01T00:00:00Z"
        },
        {
          id: "gh-1-m2",
          title: "Organize community workshop",
          description: "Host first community mental health awareness workshop",
          targetDate: "2024-06-30",
          completed: false,
          createdAt: "2024-01-01T00:00:00Z"
        }
      ]
    },
    {
      id: "gh-2",
      title: "Practice Traditional Healing Methods",
      description: "Learn and incorporate traditional Ghanaian healing practices into my wellness routine",
      category: "traditional",
      targetValue: 30,
      currentValue: 8,
      unit: "sessions completed",
      startDate: "2024-01-01",
      targetDate: "2024-06-30",
      status: "ACTIVE",
      priority: 2,
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-15T00:00:00Z",
      milestones: [
        {
          id: "gh-2-m1",
          title: "Learn herbal medicine basics",
          description: "Study traditional Ghanaian herbal medicine practices",
          targetDate: "2024-02-28",
          completed: true,
          completedAt: "2024-02-20T00:00:00Z",
          createdAt: "2024-01-01T00:00:00Z"
        },
        {
          id: "gh-2-m2",
          title: "Practice meditation with traditional elements",
          description: "Incorporate traditional spiritual practices into meditation",
          targetDate: "2024-04-30",
          completed: false,
          createdAt: "2024-01-01T00:00:00Z"
        }
      ]
    },
    // Global goals
    {
      id: "gl-1",
      title: "Learn About Global Mental Health Approaches",
      description: "Research and understand mental health practices from different countries and cultures",
      category: "cultural",
      targetValue: 20,
      currentValue: 7,
      unit: "countries studied",
      startDate: "2024-01-01",
      targetDate: "2024-12-31",
      status: "ACTIVE",
      priority: 1,
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-15T00:00:00Z",
      milestones: [
        {
          id: "gl-1-m1",
          title: "Research Nordic mental health systems",
          description: "Study mental health approaches in Nordic countries",
          targetDate: "2024-03-31",
          completed: true,
          completedAt: "2024-03-15T00:00:00Z",
          createdAt: "2024-01-01T00:00:00Z"
        },
        {
          id: "gl-1-m2",
          title: "Study Asian mindfulness practices",
          description: "Learn about mindfulness and meditation traditions from Asia",
          targetDate: "2024-06-30",
          completed: false,
          createdAt: "2024-01-01T00:00:00Z"
        }
      ]
    },
    {
      id: "gl-2",
      title: "Build International Support Network",
      description: "Connect with mental health advocates and professionals from around the world",
      category: "social",
      targetValue: 15,
      currentValue: 4,
      unit: "connections made",
      startDate: "2024-01-01",
      targetDate: "2024-08-31",
      status: "ACTIVE",
      priority: 2,
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-15T00:00:00Z",
      milestones: [
        {
          id: "gl-2-m1",
          title: "Join international mental health forums",
          description: "Participate in global mental health online communities",
          targetDate: "2024-02-28",
          completed: true,
          completedAt: "2024-02-10T00:00:00Z",
          createdAt: "2024-01-01T00:00:00Z"
        },
        {
          id: "gl-2-m2",
          title: "Attend virtual international conference",
          description: "Participate in global mental health conference",
          targetDate: "2024-05-31",
          completed: false,
          createdAt: "2024-01-01T00:00:00Z"
        }
      ]
    }
  ]

  useEffect(() => {
    if (!session?.user?.id) return

    // Load goals from database
    const loadGoals = async () => {
      try {
        setIsLoading(true)
        const response = await fetch('/api/goals')
        if (response.ok) {
          const goals = await response.json()
          setGoals(goals)
        } else {
          // Load sample goals with Ghana and global context if API fails
          setGoals(getSampleGoals())
        }
      } catch (error) {
        console.error('Failed to load goals:', error)
        // Load sample goals with Ghana and global context if API fails
        setGoals(getSampleGoals())
      } finally {
        setIsLoading(false)
      }
    }

    loadGoals()

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

      eventSource.onopen = () => {
        setIsRealtimeConnected(true)
      }

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          
          if (data.type === 'goal_progress') {
            // Refresh goals when progress is updated
            loadGoals()
          } else if (data.type === 'notification') {
            setMessage({ type: 'success', text: data.data.message })
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

  const calculateProgress = (goal: Goal): number => {
    if (goal.targetValue === 0) return 0
    return Math.round((goal.currentValue / goal.targetValue) * 100)
  }


  const createGoal = async () => {
    if (!newGoal.title.trim() || !session?.user?.id) return

    try {
      setIsLoading(true)
      const response = await fetch('/api/goals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: newGoal.title,
          description: newGoal.description,
          category: newGoal.category,
          targetValue: newGoal.targetValue,
          unit: newGoal.unit,
          startDate: newGoal.startDate,
          targetDate: newGoal.targetDate,
          priority: newGoal.priority,
          milestones: newGoal.milestones
        }),
      })

      if (response.ok) {
        const newGoalData = await response.json()
        setGoals(prev => [...prev, newGoalData])
        setMessage({ type: 'success', text: 'Goal created successfully!' })
        
        setNewGoal({
          title: '',
          description: '',
          category: 'mood',
          targetValue: 1,
          unit: 'times',
          startDate: new Date().toISOString().split('T')[0],
          targetDate: '',
          priority: 2,
          milestones: []
        })
        setShowCreateDialog(false)
      } else {
        const error = await response.json()
        setMessage({ type: 'error', text: error.error || 'Failed to create goal' })
      }
    } catch (error) {
      console.error('Error creating goal:', error)
      setMessage({ type: 'error', text: 'Failed to create goal' })
    } finally {
      setIsLoading(false)
    }
  }

  const updateGoal = async () => {
    if (!editingGoal || !editingGoal.title.trim()) return

    try {
      setIsLoading(true)
      const response = await fetch(`/api/goals/${editingGoal.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: editingGoal.title,
          description: editingGoal.description,
          category: editingGoal.category,
          targetValue: editingGoal.targetValue,
          unit: editingGoal.unit,
          targetDate: editingGoal.targetDate,
          priority: editingGoal.priority,
          status: editingGoal.status
        }),
      })

      if (response.ok) {
        const updatedGoal = await response.json()
        setGoals(prev => prev.map(goal => 
          goal.id === editingGoal.id ? updatedGoal : goal
        ))
        setMessage({ type: 'success', text: 'Goal updated successfully!' })
        setEditingGoal(null)
      } else {
        setMessage({ type: 'error', text: 'Failed to update goal' })
      }
    } catch (error) {
      console.error('Error updating goal:', error)
      setMessage({ type: 'error', text: 'Failed to update goal' })
    } finally {
      setIsLoading(false)
    }
  }

  const deleteGoal = async (goalId: string) => {
    try {
      const response = await fetch(`/api/goals/${goalId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setGoals(prev => prev.filter(goal => goal.id !== goalId))
        setMessage({ type: 'success', text: 'Goal deleted successfully!' })
      } else {
        setMessage({ type: 'error', text: 'Failed to delete goal' })
      }
    } catch (error) {
      console.error('Error deleting goal:', error)
      setMessage({ type: 'error', text: 'Failed to delete goal' })
    }
  }

  const getMLRecommendations = async () => {
    if (!mlConnected) return

    try {
      setIsLoadingRecommendations(true)
      const response = await enhancedMLService.getGoalRecommendations({
        currentGoals: goals,
        moodHistory: [], // TODO: Get from mood API
        activityHistory: [], // TODO: Get from activity API
        preferences: [], // TODO: Get from user preferences
        timeAvailability: 60 // TODO: Get from user settings
      })
      setMlRecommendations(response || [])
    } catch (error) {
      console.error('Error getting ML recommendations:', error)
    } finally {
      setIsLoadingRecommendations(false)
    }
  }

  const getStatusColor = (status: Goal['status']) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800'
      case 'COMPLETED': return 'bg-blue-100 text-blue-800'
      case 'PAUSED': return 'bg-yellow-100 text-yellow-800'
      case 'CANCELLED': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getDaysUntilTarget = (targetDate: string) => {
    const today = new Date()
    const target = new Date(targetDate)
    const diffTime = target.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const activeGoals = goals.filter(goal => goal.status === 'ACTIVE')
  const completedGoals = goals.filter(goal => goal.status === 'COMPLETED')
  const totalProgress = goals.length > 0 ? Math.round(goals.reduce((sum, goal) => sum + calculateProgress(goal), 0) / goals.length) : 0

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Message Display */}
      {message && (
        <Alert className={message.type === 'success' ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}>
          <AlertDescription className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>
            {message.text}
          </AlertDescription>
        </Alert>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Goals & Progress Tracker</h1>
          <p className="text-muted-foreground">Set and track your mental health goals with ML-powered insights</p>
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
          {mlConnected && (
            <Badge variant="default" className="flex items-center space-x-1">
              <Brain className="h-3 w-3" />
              <span>ML Enhanced</span>
            </Badge>
          )}
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Goal
              </Button>
            </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Goal</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Goal Title</Label>
                <Input
                  id="title"
                  value={newGoal.title}
                  onChange={(e) => setNewGoal(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Practice daily meditation"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newGoal.description}
                  onChange={(e) => setNewGoal(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe your goal and why it's important to you..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select value={newGoal.category} onValueChange={(value) => setNewGoal(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(goalCategories).map(([key, category]) => (
                        <SelectItem key={key} value={key}>
                          {category.icon} {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={newGoal.priority.toString()} onValueChange={(value) => setNewGoal(prev => ({ ...prev, priority: parseInt(value) }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">High Priority</SelectItem>
                      <SelectItem value="2">Medium Priority</SelectItem>
                      <SelectItem value="3">Low Priority</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="targetValue">Target Value</Label>
                  <Input
                    id="targetValue"
                    type="number"
                    value={newGoal.targetValue}
                    onChange={(e) => setNewGoal(prev => ({ ...prev, targetValue: parseInt(e.target.value) || 1 }))}
                    placeholder="e.g., 30"
                  />
                </div>
                <div>
                  <Label htmlFor="unit">Unit</Label>
                  <Input
                    id="unit"
                    value={newGoal.unit}
                    onChange={(e) => setNewGoal(prev => ({ ...prev, unit: e.target.value }))}
                    placeholder="e.g., days, times, hours"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={newGoal.startDate}
                    onChange={(e) => setNewGoal(prev => ({ ...prev, startDate: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="targetDate">Target Date</Label>
                  <Input
                    id="targetDate"
                    type="date"
                    value={newGoal.targetDate}
                    onChange={(e) => setNewGoal(prev => ({ ...prev, targetDate: e.target.value }))}
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={createGoal} disabled={isLoading}>
                  {isLoading ? 'Creating...' : 'Create Goal'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      {/* ML Recommendations */}
      {mlConnected && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <Brain className="h-5 w-5" />
                <span>AI-Powered Goal Recommendations</span>
              </CardTitle>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={getMLRecommendations}
                disabled={isLoadingRecommendations}
              >
                {isLoadingRecommendations ? 'Analyzing...' : 'Get Recommendations'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {mlRecommendations.length > 0 ? (
              <div className="space-y-3">
                {mlRecommendations.map((rec, index) => (
                  <div key={index} className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-start space-x-2">
                      <Lightbulb className="h-4 w-4 text-blue-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-blue-900">{rec.title}</p>
                        <p className="text-sm text-blue-700">{rec.description}</p>
                        {rec.reason && (
                          <p className="text-xs text-blue-600 mt-1">Why: {rec.reason}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">
                Click "Get Recommendations" to receive AI-powered suggestions based on your current goals and progress.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Goals</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{goals.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Goals</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeGoals.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedGoals.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Progress</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProgress}%</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList>
          <TabsTrigger value="active">Active Goals</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="all">All Goals</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {activeGoals.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Active Goals</h3>
                <p className="text-muted-foreground mb-4">Create your first goal to start tracking your mental health journey</p>
                <Button onClick={() => setShowCreateDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Goal
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {activeGoals.map((goal) => {
                const category = goalCategories[goal.category as keyof typeof goalCategories]
                const daysLeft = getDaysUntilTarget(goal.targetDate)
                
                return (
                  <Card key={goal.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <h3 className="text-lg font-semibold">{goal.title}</h3>
                            <Badge className={category.color}>
                              {category.icon} {category.label}
                            </Badge>
                            <Badge className={priorityColors[goal.priority as keyof typeof priorityColors]}>
                              {goal.priority === 1 ? 'High' : goal.priority === 2 ? 'Medium' : 'Low'} priority
                            </Badge>
                          </div>
                          <p className="text-muted-foreground">{goal.description}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingGoal(goal)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteGoal(goal.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">
                                {daysLeft > 0 ? `${daysLeft} days left` : 'Overdue'}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Flame className="h-4 w-4 text-orange-500" />
                              <span className="text-sm">0 day streak</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium">{calculateProgress(goal)}% Complete</div>
                            <Progress value={calculateProgress(goal)} className="w-32" />
                            <div className="text-xs text-muted-foreground mt-1">
                              {goal.currentValue} / {goal.targetValue} {goal.unit}
                            </div>
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">Milestones</h4>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {/* addMilestone(goal.id) */}}
                            >
                              <PlusCircle className="h-4 w-4 mr-1" />
                              Add Milestone
                            </Button>
                          </div>
                          <div className="space-y-2">
                            {goal.milestones.map((milestone) => (
                              <div key={milestone.id} className="flex items-center space-x-3 p-3 bg-muted rounded-lg">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {/* toggleMilestone(goal.id, milestone.id) */}}
                                  className="p-1"
                                >
                                  {milestone.completed ? (
                                    <CheckCircle className="h-5 w-5 text-green-500" />
                                  ) : (
                                    <div className="h-5 w-5 border-2 border-muted-foreground rounded-full" />
                                  )}
                                </Button>
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2">
                                    <span className={`font-medium ${milestone.completed ? 'line-through text-muted-foreground' : ''}`}>
                                      {milestone.title}
                                    </span>
                                    {milestone.completed && (
                                      <Badge variant="outline" className="text-xs">
                                        Completed {milestone.completedAt}
                                      </Badge>
                                    )}
                                  </div>
                                  {milestone.description && (
                                    <p className="text-sm text-muted-foreground">{milestone.description}</p>
                                  )}
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {/* removeMilestone(goal.id, milestone.id) */}}
                                >
                                  <MinusCircle className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                            {goal.milestones.length === 0 && (
                              <p className="text-muted-foreground text-sm text-center py-4">
                                No milestones yet. Add some to break down your goal into manageable steps.
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {completedGoals.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Completed Goals Yet</h3>
                <p className="text-muted-foreground">Complete your first goal to see it here!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {completedGoals.map((goal) => {
                const category = goalCategories[goal.category as keyof typeof goalCategories]
                
                return (
                  <Card key={goal.id} className="border-green-200 bg-green-50/50">
                    <CardHeader>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <h3 className="text-lg font-semibold">{goal.title}</h3>
                        <Badge className={category.color}>
                          {category.icon} {category.label}
                        </Badge>
                        <Badge className="bg-green-100 text-green-800">
                          Completed
                        </Badge>
                      </div>
                      <p className="text-muted-foreground">{goal.description}</p>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <Award className="h-4 w-4 text-yellow-500" />
                            <span className="text-sm">Best streak: 0 days</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">Completed {formatDate(goal.targetDate)}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-green-600">100% Complete</div>
                          <Progress value={100} className="w-32" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          {goals.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Goals Yet</h3>
                <p className="text-muted-foreground mb-4">Start your mental health journey by creating your first goal</p>
                <Button onClick={() => setShowCreateDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Goal
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {goals.map((goal) => {
                const category = goalCategories[goal.category as keyof typeof goalCategories]
                const daysLeft = getDaysUntilTarget(goal.targetDate)
                
                return (
                  <Card key={goal.id} className={goal.status === 'COMPLETED' ? 'border-green-200 bg-green-50/50' : ''}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            {goal.status === 'COMPLETED' && <CheckCircle className="h-5 w-5 text-green-500" />}
                            <h3 className="text-lg font-semibold">{goal.title}</h3>
                            <Badge className={category.color}>
                              {category.icon} {category.label}
                            </Badge>
                            <Badge className={priorityColors[goal.priority as keyof typeof priorityColors]}>
                              {goal.priority === 1 ? 'High' : goal.priority === 2 ? 'Medium' : 'Low'} priority
                            </Badge>
                            <Badge className={getStatusColor(goal.status)}>
                              {goal.status}
                            </Badge>
                          </div>
                          <p className="text-muted-foreground">{goal.description}</p>
                        </div>
                        {goal.status !== 'COMPLETED' && (
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setEditingGoal(goal)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => deleteGoal(goal.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">
                              {daysLeft > 0 ? `${daysLeft} days left` : 'Overdue'}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Flame className="h-4 w-4 text-orange-500" />
                            <span className="text-sm">0 day streak</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">{Math.round((goal.currentValue / goal.targetValue) * 100)}% Complete</div>
                          <Progress value={(goal.currentValue / goal.targetValue) * 100} className="w-32" />
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

      {/* Edit Goal Dialog */}
      {editingGoal && (
        <Dialog open={!!editingGoal} onOpenChange={() => setEditingGoal(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Goal</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-title">Goal Title</Label>
                <Input
                  id="edit-title"
                  value={editingGoal.title}
                  onChange={(e) => setEditingGoal(prev => prev ? { ...prev, title: e.target.value } : null)}
                />
              </div>
              <div>
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={editingGoal.description}
                  onChange={(e) => setEditingGoal(prev => prev ? { ...prev, description: e.target.value } : null)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-category">Category</Label>
                  <Select 
                    value={editingGoal.category} 
                    onValueChange={(value: Goal['category']) => setEditingGoal(prev => prev ? { ...prev, category: value } : null)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(goalCategories).map(([key, category]) => (
                        <SelectItem key={key} value={key}>
                          {category.icon} {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit-priority">Priority</Label>
                  <Select 
                    value={editingGoal.priority.toString()} 
                    onValueChange={(value: string) => setEditingGoal(prev => prev ? { ...prev, priority: parseInt(value) } : null)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low Priority</SelectItem>
                      <SelectItem value="medium">Medium Priority</SelectItem>
                      <SelectItem value="high">High Priority</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="edit-targetDate">Target Date</Label>
                <Input
                  id="edit-targetDate"
                  type="date"
                  value={editingGoal.targetDate}
                  onChange={(e) => setEditingGoal(prev => prev ? { ...prev, targetDate: e.target.value } : null)}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setEditingGoal(null)}>
                  Cancel
                </Button>
                <Button onClick={updateGoal}>
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
