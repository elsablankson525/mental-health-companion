"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Bell, 
  Clock, 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  CheckCircle, 
  AlertTriangle,
  Pill,
  Heart,
  Sparkles,
  Moon,
  Target,
  Users,
  Calendar,
  Repeat,
  Play,
  Pause
} from "lucide-react"

interface Reminder {
  id: string
  title: string
  description: string
  type: 'medication' | 'mood' | 'wellness' | 'sleep' | 'goals' | 'community' | 'crisis' | 'cultural' | 'traditional'
  time: string
  days: string[]
  enabled: boolean
  sound: boolean
  vibration: boolean
  repeat: 'daily' | 'weekly' | 'monthly' | 'custom'
  priority: 'low' | 'medium' | 'high'
  createdAt: string
  lastTriggered?: string
  nextTrigger?: string
}

interface NotificationSettings {
  pushNotifications: boolean
  emailNotifications: boolean
  smsNotifications: boolean
  soundEnabled: boolean
  vibrationEnabled: boolean
  quietHours: {
    enabled: boolean
    start: string
    end: string
  }
  doNotDisturb: boolean
}

const reminderTypes = [
  { id: 'medication', label: 'Medication', icon: Pill, color: 'text-green-600' },
  { id: 'mood', label: 'Mood Check-in', icon: Heart, color: 'text-red-600' },
  { id: 'wellness', label: 'Wellness Activity', icon: Sparkles, color: 'text-purple-600' },
  { id: 'sleep', label: 'Sleep Tracking', icon: Moon, color: 'text-blue-600' },
  { id: 'goals', label: 'Goals Review', icon: Target, color: 'text-orange-600' },
  { id: 'community', label: 'Community Check-in', icon: Users, color: 'text-indigo-600' },
  { id: 'crisis', label: 'Crisis Check-in', icon: AlertTriangle, color: 'text-red-700' },
  { id: 'cultural', label: 'Cultural Practice', icon: Calendar, color: 'text-teal-600' },
  { id: 'traditional', label: 'Traditional Healing', icon: Heart, color: 'text-amber-600' }
]

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

export default function NotificationsReminders() {
  const { data: session } = useSession()
  const [activeTab, setActiveTab] = useState("reminders")
  const [isLoading, setIsLoading] = useState(false)
  const [showAddReminder, setShowAddReminder] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  // Database-connected state
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    pushNotifications: true,
    emailNotifications: true,
    smsNotifications: false,
    soundEnabled: true,
    vibrationEnabled: true,
    quietHours: {
      enabled: true,
      start: "22:00",
      end: "07:00"
    },
    doNotDisturb: false
  })

  // Load data from API
  useEffect(() => {
    if (session?.user?.id) {
      loadNotificationData()
    }
  }, [session])

  const loadNotificationData = async () => {
    setIsLoading(true)
    try {
      // Load notifications
      const notificationsRes = await fetch('/api/notifications')
      if (notificationsRes.ok) {
        const notificationsData = await notificationsRes.json()
        // TODO: Handle notifications data
        console.log('Notifications loaded:', notificationsData)
      }

      // For now, we'll use a basic reminder system - in a real app, this would be more sophisticated
      // and would integrate with actual notification scheduling
      const mockReminders: Reminder[] = [
        // Ghana-specific reminders
        {
          id: "gh-1",
          title: "Traditional Herbal Tea",
          description: "Time for your traditional Ghanaian herbal tea for relaxation",
          type: "traditional",
          time: "19:00",
          days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
          enabled: true,
          sound: true,
          vibration: true,
          repeat: "daily",
          priority: "medium",
          createdAt: "2024-01-15T10:00:00Z",
          lastTriggered: "2024-01-20T19:00:00Z",
          nextTrigger: "2024-01-21T19:00:00Z"
        },
        {
          id: "gh-2",
          title: "Community Support Check-in",
          description: "Connect with your Ghanaian mental health community",
          type: "community",
          time: "18:00",
          days: ["Wednesday", "Saturday"],
          enabled: true,
          sound: false,
          vibration: true,
          repeat: "weekly",
          priority: "medium",
          createdAt: "2024-01-15T10:00:00Z",
          lastTriggered: "2024-01-17T18:00:00Z",
          nextTrigger: "2024-01-24T18:00:00Z"
        },
        {
          id: "gh-3",
          title: "Cultural Wellness Practice",
          description: "Practice traditional Ghanaian mindfulness or drumming",
          type: "cultural",
          time: "16:00",
          days: ["Tuesday", "Thursday", "Sunday"],
          enabled: true,
          sound: true,
          vibration: false,
          repeat: "weekly",
          priority: "low",
          createdAt: "2024-01-15T10:00:00Z",
          lastTriggered: "2024-01-18T16:00:00Z",
          nextTrigger: "2024-01-21T16:00:00Z"
        },
        // Global reminders
        {
          id: "gl-1",
          title: "Morning Medication",
          description: "Take your morning anxiety medication",
          type: "medication",
          time: "08:00",
          days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
          enabled: true,
          sound: true,
          vibration: true,
          repeat: "daily",
          priority: "high",
          createdAt: "2024-01-15T10:00:00Z",
          lastTriggered: "2024-01-20T08:00:00Z",
          nextTrigger: "2024-01-21T08:00:00Z"
        },
        {
          id: "gl-2",
          title: "Evening Mood Check",
          description: "How are you feeling today?",
          type: "mood",
          time: "20:00",
          days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
          enabled: true,
          sound: false,
          vibration: true,
          repeat: "daily",
          priority: "medium",
          createdAt: "2024-01-15T10:00:00Z",
          lastTriggered: "2024-01-20T20:00:00Z",
          nextTrigger: "2024-01-21T20:00:00Z"
        },
        {
          id: "gl-3",
          title: "Wellness Activity",
          description: "Time for your daily wellness practice",
          type: "wellness",
          time: "09:00",
          days: ["Monday", "Wednesday", "Friday"],
          enabled: true,
          sound: true,
          vibration: true,
          repeat: "weekly",
          priority: "medium",
          createdAt: "2024-01-15T10:00:00Z",
          lastTriggered: "2024-01-19T09:00:00Z",
          nextTrigger: "2024-01-22T09:00:00Z"
        },
        {
          id: "gl-4",
          title: "Sleep Tracking",
          description: "Log your sleep quality and patterns",
          type: "sleep",
          time: "07:00",
          days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
          enabled: true,
          sound: false,
          vibration: false,
          repeat: "daily",
          priority: "low",
          createdAt: "2024-01-15T10:00:00Z",
          lastTriggered: "2024-01-21T07:00:00Z",
          nextTrigger: "2024-01-22T07:00:00Z"
        },
        {
          id: "gl-5",
          title: "Weekly Goals Review",
          description: "Review your progress on mental health goals",
          type: "goals",
          time: "19:00",
          days: ["Sunday"],
          enabled: true,
          sound: true,
          vibration: true,
          repeat: "weekly",
          priority: "medium",
          createdAt: "2024-01-15T10:00:00Z",
          lastTriggered: "2024-01-21T19:00:00Z",
          nextTrigger: "2024-01-28T19:00:00Z"
        }
      ]
      setReminders(mockReminders)
    } catch (error) {
      console.error('Error loading notification data:', error)
      setMessage({ type: 'error', text: 'Failed to load notification data' })
    } finally {
      setIsLoading(false)
    }
  }

  const [newReminder, setNewReminder] = useState<Partial<Reminder>>({
    title: '',
    description: '',
    type: 'mood',
    time: '09:00',
    days: [],
    enabled: true,
    sound: true,
    vibration: true,
    repeat: 'daily',
    priority: 'medium'
  })

  const handleAddReminder = async () => {
    if (!newReminder.title || !newReminder.time) {
      setMessage({ type: 'error', text: 'Please fill in all required fields' })
      return
    }

    setIsLoading(true)
    try {
      const reminder: Reminder = {
        id: Date.now().toString(),
        title: newReminder.title!,
        description: newReminder.description || '',
        type: newReminder.type!,
        time: newReminder.time!,
        days: newReminder.days || [],
        enabled: newReminder.enabled!,
        sound: newReminder.sound!,
        vibration: newReminder.vibration!,
        repeat: newReminder.repeat!,
        priority: newReminder.priority!,
        createdAt: new Date().toISOString(),
        nextTrigger: calculateNextTrigger(newReminder.time!, newReminder.days!)
      }

      setReminders([...reminders, reminder])
      setNewReminder({
        title: '',
        description: '',
        type: 'mood',
        time: '09:00',
        days: [],
        enabled: true,
        sound: true,
        vibration: true,
        repeat: 'daily',
        priority: 'medium'
      })
      setShowAddReminder(false)
      setMessage({ type: 'success', text: 'Reminder added successfully!' })
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to add reminder' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateReminder = async (id: string, updates: Partial<Reminder>) => {
    setIsLoading(true)
    try {
      setReminders(reminders.map(reminder => 
        reminder.id === id 
          ? { ...reminder, ...updates, nextTrigger: calculateNextTrigger(updates.time || reminder.time, updates.days || reminder.days) }
          : reminder
      ))
      // setEditingReminder(null) // TODO: Implement edit reminder functionality
      setMessage({ type: 'success', text: 'Reminder updated successfully!' })
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update reminder' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteReminder = async (id: string) => {
    setIsLoading(true)
    try {
      setReminders(reminders.filter(reminder => reminder.id !== id))
      setMessage({ type: 'success', text: 'Reminder deleted successfully!' })
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to delete reminder' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleReminder = async (id: string) => {
    const reminder = reminders.find(r => r.id === id)
    if (reminder) {
      await handleUpdateReminder(id, { enabled: !reminder.enabled })
    }
  }

  const handleSaveNotificationSettings = async () => {
    setIsLoading(true)
    try {
      // await fetch('/api/user/notification-settings', { method: 'PUT', body: JSON.stringify(notificationSettings) })
      setMessage({ type: 'success', text: 'Notification settings saved!' })
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save notification settings' })
    } finally {
      setIsLoading(false)
    }
  }

  const calculateNextTrigger = (time: string, _days: string[]): string => {
    const now = new Date()
    const [hours, minutes] = time.split(':').map(Number)
    
    // Simple calculation - in a real app, you'd use a proper scheduling library
    const nextTrigger = new Date(now)
    nextTrigger.setHours(hours, minutes, 0, 0)
    
    if (nextTrigger <= now) {
      nextTrigger.setDate(nextTrigger.getDate() + 1)
    }
    
    return nextTrigger.toISOString()
  }

  const getReminderTypeInfo = (type: string) => {
    return reminderTypes.find(t => t.id === type) || reminderTypes[0]
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-2">
          <Bell className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">Notifications & Reminders</h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Stay on track with your mental health journey. Set up personalized reminders for medications, mood tracking, and wellness activities.
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

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="reminders" className="flex items-center space-x-2">
            <Clock className="h-4 w-4" />
            <span>Reminders</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center space-x-2">
            <Bell className="h-4 w-4" />
            <span>Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center space-x-2">
            <Calendar className="h-4 w-4" />
            <span>History</span>
          </TabsTrigger>
        </TabsList>

        {/* Reminders Tab */}
        <TabsContent value="reminders" className="space-y-6">
          {/* Add Reminder Button */}
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Your Reminders</h2>
            <Button onClick={() => setShowAddReminder(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Reminder
            </Button>
          </div>

          {/* Reminders List */}
          <div className="space-y-4">
            {reminders.map((reminder) => {
              const typeInfo = getReminderTypeInfo(reminder.type)
              const IconComponent = typeInfo.icon
              
              return (
                <Card key={reminder.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className={`p-2 rounded-lg bg-gray-100 ${typeInfo.color}`}>
                          <IconComponent className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="font-semibold text-lg">{reminder.title}</h3>
                            <Badge className={getPriorityColor(reminder.priority)}>
                              {reminder.priority}
                            </Badge>
                            {reminder.enabled ? (
                              <Badge variant="secondary" className="flex items-center space-x-1">
                                <Play className="h-3 w-3" />
                                <span>Active</span>
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="flex items-center space-x-1">
                                <Pause className="h-3 w-3" />
                                <span>Paused</span>
                              </Badge>
                            )}
                          </div>
                          <p className="text-muted-foreground mb-3">{reminder.description}</p>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <div className="flex items-center space-x-1">
                              <Clock className="h-4 w-4" />
                              <span>{reminder.time}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Repeat className="h-4 w-4" />
                              <span>{reminder.repeat}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-4 w-4" />
                              <span>{reminder.days.join(', ')}</span>
                            </div>
                          </div>
                          {reminder.nextTrigger && (
                            <div className="mt-2 text-sm text-muted-foreground">
                              Next: {new Date(reminder.nextTrigger).toLocaleString()}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={reminder.enabled}
                          onCheckedChange={() => handleToggleReminder(reminder.id)}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {/* TODO: Implement edit reminder */}}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteReminder(reminder.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Add Reminder Form */}
          {showAddReminder && (
            <Card>
              <CardHeader>
                <CardTitle>Add New Reminder</CardTitle>
                <CardDescription>Create a new reminder for your mental health routine</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      value={newReminder.title}
                      onChange={(e) => setNewReminder({ ...newReminder, title: e.target.value })}
                      placeholder="e.g., Morning Medication"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type">Type</Label>
                    <Select value={newReminder.type || 'mood'} onValueChange={(value: any) => setNewReminder({ ...newReminder, type: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {reminderTypes.map((type) => (
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

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={newReminder.description}
                    onChange={(e) => setNewReminder({ ...newReminder, description: e.target.value })}
                    placeholder="Optional description"
                  />
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="time">Time *</Label>
                    <Input
                      id="time"
                      type="time"
                      value={newReminder.time}
                      onChange={(e) => setNewReminder({ ...newReminder, time: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="repeat">Repeat</Label>
                    <Select value={newReminder.repeat || 'daily'} onValueChange={(value: any) => setNewReminder({ ...newReminder, repeat: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select value={newReminder.priority || 'medium'} onValueChange={(value: any) => setNewReminder({ ...newReminder, priority: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Days of Week</Label>
                  <div className="flex flex-wrap gap-2">
                    {daysOfWeek.map((day) => (
                      <Button
                        key={day}
                        variant={newReminder.days?.includes(day) ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          const days = newReminder.days || []
                          if (days.includes(day)) {
                            setNewReminder({ ...newReminder, days: days.filter(d => d !== day) })
                          } else {
                            setNewReminder({ ...newReminder, days: [...days, day] })
                          }
                        }}
                      >
                        {day.slice(0, 3)}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={newReminder.sound || false}
                      onCheckedChange={(checked) => setNewReminder({ ...newReminder, sound: checked })}
                    />
                    <Label>Sound</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={newReminder.vibration || false}
                      onCheckedChange={(checked) => setNewReminder({ ...newReminder, vibration: checked })}
                    />
                    <Label>Vibration</Label>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button onClick={handleAddReminder} disabled={isLoading}>
                    <Save className="h-4 w-4 mr-2" />
                    {isLoading ? 'Adding...' : 'Add Reminder'}
                  </Button>
                  <Button variant="outline" onClick={() => setShowAddReminder(false)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="h-5 w-5" />
                <span>Notification Preferences</span>
              </CardTitle>
              <CardDescription>
                Configure how you receive notifications and reminders
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive notifications on your device</p>
                  </div>
                  <Switch
                    checked={notificationSettings.pushNotifications}
                    onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, pushNotifications: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                  </div>
                  <Switch
                    checked={notificationSettings.emailNotifications}
                    onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, emailNotifications: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>SMS Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive notifications via text message</p>
                  </div>
                  <Switch
                    checked={notificationSettings.smsNotifications}
                    onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, smsNotifications: checked })}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Sound</Label>
                    <p className="text-sm text-muted-foreground">Play sound for notifications</p>
                  </div>
                  <Switch
                    checked={notificationSettings.soundEnabled}
                    onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, soundEnabled: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Vibration</Label>
                    <p className="text-sm text-muted-foreground">Vibrate for notifications</p>
                  </div>
                  <Switch
                    checked={notificationSettings.vibrationEnabled}
                    onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, vibrationEnabled: checked })}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Do Not Disturb</Label>
                    <p className="text-sm text-muted-foreground">Pause all notifications</p>
                  </div>
                  <Switch
                    checked={notificationSettings.doNotDisturb}
                    onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, doNotDisturb: checked })}
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Quiet Hours</Label>
                      <p className="text-sm text-muted-foreground">Automatically silence notifications during these hours</p>
                    </div>
                    <Switch
                      checked={notificationSettings.quietHours.enabled}
                      onCheckedChange={(checked) => setNotificationSettings({ 
                        ...notificationSettings, 
                        quietHours: { ...notificationSettings.quietHours, enabled: checked }
                      })}
                    />
                  </div>

                  {notificationSettings.quietHours.enabled && (
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Start Time</Label>
                        <Input
                          type="time"
                          value={notificationSettings.quietHours.start}
                          onChange={(e) => setNotificationSettings({ 
                            ...notificationSettings, 
                            quietHours: { ...notificationSettings.quietHours, start: e.target.value }
                          })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>End Time</Label>
                        <Input
                          type="time"
                          value={notificationSettings.quietHours.end}
                          onChange={(e) => setNotificationSettings({ 
                            ...notificationSettings, 
                            quietHours: { ...notificationSettings.quietHours, end: e.target.value }
                          })}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <Button onClick={handleSaveNotificationSettings} disabled={isLoading} className="w-full">
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? 'Saving...' : 'Save Notification Settings'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Notification History</span>
              </CardTitle>
              <CardDescription>
                View your recent notification activity and reminder triggers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reminders.map((reminder) => (
                  <div key={reminder.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg bg-gray-100 ${getReminderTypeInfo(reminder.type).color}`}>
                        {getReminderTypeInfo(reminder.type).icon({ className: "h-4 w-4" })}
                      </div>
                      <div>
                        <h4 className="font-medium">{reminder.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          Last triggered: {reminder.lastTriggered ? new Date(reminder.lastTriggered).toLocaleString() : 'Never'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {reminder.enabled ? (
                        <Badge variant="secondary" className="flex items-center space-x-1">
                          <CheckCircle className="h-3 w-3" />
                          <span>Active</span>
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="flex items-center space-x-1">
                          <Pause className="h-3 w-3" />
                          <span>Paused</span>
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
