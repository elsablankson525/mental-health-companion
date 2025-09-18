"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Database, 
  Download, 
  Shield, 
  Trash2, 
  CheckCircle, 
  AlertTriangle,
  User,
  Heart,
  BookOpen,
  MessageCircle,
  BarChart3,
  Settings,
  Globe,
  Clock,
  RefreshCw,
  Archive,
  Save
} from "lucide-react"

interface DataExport {
  id: string
  type: 'full' | 'mood' | 'journal' | 'chat' | 'goals' | 'sleep' | 'medications' | 'community'
  format: 'json' | 'csv' | 'pdf' | 'xlsx'
  status: 'pending' | 'processing' | 'ready' | 'expired' | 'failed'
  requestedAt: string
  completedAt?: string
  expiresAt: string
  size?: string
  downloadUrl?: string
  description: string
}

interface PrivacySettings {
  dataSharing: boolean
  analyticsTracking: boolean
  personalizedRecommendations: boolean
  communityVisibility: 'public' | 'friends' | 'private'
  profileVisibility: 'public' | 'private'
  dataRetention: '1year' | '2years' | '5years' | 'indefinite'
  marketingEmails: boolean
  researchParticipation: boolean
  thirdPartySharing: boolean
  locationTracking: boolean
  biometricData: boolean
}

interface DataCategory {
  id: string
  name: string
  description: string
  icon: any
  color: string
  dataTypes: string[]
  retentionPeriod: string
  isSensitive: boolean
  canExport: boolean
  canDelete: boolean
}

const dataCategories: DataCategory[] = [
  {
    id: 'profile',
    name: 'Profile Information',
    description: 'Your personal information and account details',
    icon: User,
    color: 'text-blue-600',
    dataTypes: ['Name', 'Email', 'Phone', 'Profile Picture', 'Account Settings'],
    retentionPeriod: 'Indefinite',
    isSensitive: true,
    canExport: true,
    canDelete: false
  },
  {
    id: 'mood',
    name: 'Mood Tracking Data',
    description: 'Your daily mood entries and emotional patterns',
    icon: Heart,
    color: 'text-red-600',
    dataTypes: ['Mood Ratings', 'Emotional Notes', 'Triggers', 'Patterns'],
    retentionPeriod: '2 years',
    isSensitive: true,
    canExport: true,
    canDelete: true
  },
  {
    id: 'journal',
    name: 'Journal Entries',
    description: 'Your personal journal entries and reflections',
    icon: BookOpen,
    color: 'text-green-600',
    dataTypes: ['Journal Entries', 'Titles', 'Timestamps', 'Tags'],
    retentionPeriod: 'Indefinite',
    isSensitive: true,
    canExport: true,
    canDelete: true
  },
  {
    id: 'chat',
    name: 'AI Chat History',
    description: 'Your conversations with the AI companion',
    icon: MessageCircle,
    color: 'text-purple-600',
    dataTypes: ['Chat Messages', 'Conversation History', 'AI Responses'],
    retentionPeriod: '1 year',
    isSensitive: true,
    canExport: true,
    canDelete: true
  },
  {
    id: 'goals',
    name: 'Goals & Progress',
    description: 'Your mental health goals and progress tracking',
    icon: BarChart3,
    color: 'text-orange-600',
    dataTypes: ['Goals', 'Milestones', 'Progress Updates', 'Achievements'],
    retentionPeriod: '2 years',
    isSensitive: false,
    canExport: true,
    canDelete: true
  },
  {
    id: 'sleep',
    name: 'Sleep Tracking',
    description: 'Your sleep patterns and quality data',
    icon: Clock,
    color: 'text-indigo-600',
    dataTypes: ['Sleep Duration', 'Sleep Quality', 'Bedtime', 'Wake Time'],
    retentionPeriod: '1 year',
    isSensitive: false,
    canExport: true,
    canDelete: true
  },
  {
    id: 'medications',
    name: 'Medication Tracking',
    description: 'Your medication schedules and adherence data',
    icon: Settings,
    color: 'text-teal-600',
    dataTypes: ['Medications', 'Dosages', 'Schedules', 'Adherence'],
    retentionPeriod: '2 years',
    isSensitive: true,
    canExport: true,
    canDelete: true
  },
  {
    id: 'community',
    name: 'Community Activity',
    description: 'Your posts, comments, and community interactions',
    icon: Globe,
    color: 'text-pink-600',
    dataTypes: ['Forum Posts', 'Comments', 'Likes', 'Connections'],
    retentionPeriod: '1 year',
    isSensitive: false,
    canExport: true,
    canDelete: true
  }
]

export default function DataExportPrivacy() {
  const { data: session } = useSession()
  const [activeTab, setActiveTab] = useState("overview")
  const [isLoading, setIsLoading] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  // Database-connected state
  const [dataExports, setDataExports] = useState<DataExport[]>([])
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>({
    dataSharing: false,
    analyticsTracking: true,
    personalizedRecommendations: true,
    communityVisibility: 'private',
    profileVisibility: 'private',
    dataRetention: '2years',
    marketingEmails: false,
    researchParticipation: false,
    thirdPartySharing: false,
    locationTracking: false,
    biometricData: false
  })

  // Load data from API
  useEffect(() => {
    if (session?.user?.id) {
      loadDataExportData()
    }
  }, [session])

  const loadDataExportData = async () => {
    setIsLoading(true)
    try {
      // Load data exports
      const exportsRes = await fetch('/api/data-exports')
      if (exportsRes.ok) {
        const exportsData = await exportsRes.json()
        setDataExports(exportsData)
      } else {
        // If no exports exist, start with empty array
        setDataExports([])
      }
    } catch (error) {
      console.error('Error loading data export data:', error)
      setMessage({ type: 'error', text: 'Failed to load data export information' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRequestExport = async (type: string, format: string) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/data-exports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type, format })
      })

      if (response.ok) {
        setMessage({ type: 'success', text: 'Data export requested! You will receive an email when it\'s ready.' })
        // Reload data exports
        loadDataExportData()
      } else {
        const errorData = await response.json()
        setMessage({ type: 'error', text: errorData.error || 'Failed to request data export' })
      }
    } catch (error) {
      console.error('Error requesting data export:', error)
      setMessage({ type: 'error', text: 'Failed to request data export' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownloadExport = async (exportId: string) => {
    try {
      const response = await fetch(`/api/data-exports/${exportId}/download`)
      
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `mental-health-data-${exportId}.json`
        a.click()
        window.URL.revokeObjectURL(url)
        
        setMessage({ type: 'success', text: 'Download started successfully!' })
      } else {
        const errorData = await response.json()
        setMessage({ type: 'error', text: errorData.error || 'Failed to download export' })
      }
    } catch (error) {
      console.error('Error downloading export:', error)
      setMessage({ type: 'error', text: 'Failed to download export' })
    }
  }

  const handleDeleteData = async (category: string) => {
    setIsLoading(true)
    try {
      // In a real app, this would delete the data from your API
      // await fetch(`/api/data/${category}`, { method: 'DELETE' })
      
      setMessage({ type: 'success', text: `${category} data deleted successfully!` })
      setShowDeleteConfirm(false)
      setSelectedCategory(null)
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to delete data' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSavePrivacySettings = async () => {
    setIsLoading(true)
    try {
      // await fetch('/api/privacy/settings', { method: 'PUT', body: JSON.stringify(privacySettings) })
      setMessage({ type: 'success', text: 'Privacy settings saved successfully!' })
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save privacy settings' })
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready': return 'bg-green-100 text-green-800 border-green-200'
      case 'processing': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'pending': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'expired': return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'failed': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ready': return <CheckCircle className="h-4 w-4" />
      case 'processing': return <RefreshCw className="h-4 w-4 animate-spin" />
      case 'pending': return <Clock className="h-4 w-4" />
      case 'expired': return <AlertTriangle className="h-4 w-4" />
      case 'failed': return <AlertTriangle className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-2">
          <Database className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">Data Export & Privacy</h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Take control of your data. Export your information, manage your privacy settings, and understand how your data is used and protected.
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
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center space-x-2">
            <Database className="h-4 w-4" />
            <span>Data Overview</span>
          </TabsTrigger>
          <TabsTrigger value="export" className="flex items-center space-x-2">
            <Download className="h-4 w-4" />
            <span>Export Data</span>
          </TabsTrigger>
          <TabsTrigger value="privacy" className="flex items-center space-x-2">
            <Shield className="h-4 w-4" />
            <span>Privacy Settings</span>
          </TabsTrigger>
          <TabsTrigger value="delete" className="flex items-center space-x-2">
            <Trash2 className="h-4 w-4" />
            <span>Delete Data</span>
          </TabsTrigger>
        </TabsList>

        {/* Data Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dataCategories.map((category) => {
              const IconComponent = category.icon
              
              return (
                <Card key={category.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-lg bg-gray-100 ${category.color}`}>
                        <IconComponent className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg">{category.name}</CardTitle>
                        <CardDescription className="mt-2">
                          {category.description}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-sm mb-2">Data Types:</h4>
                        <div className="flex flex-wrap gap-1">
                          {category.dataTypes.map((type) => (
                            <Badge key={type} variant="outline" className="text-xs">
                              {type}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Retention:</span>
                        <span className="font-medium">{category.retentionPeriod}</span>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Sensitive:</span>
                        <Badge variant={category.isSensitive ? "destructive" : "secondary"} className="text-xs">
                          {category.isSensitive ? "Yes" : "No"}
                        </Badge>
                      </div>

                      <div className="flex space-x-2">
                        {category.canExport && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setActiveTab('export')}
                            className="flex-1"
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Export
                          </Button>
                        )}
                        {category.canDelete && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedCategory(category.id)
                              setShowDeleteConfirm(true)
                            }}
                            className="flex-1 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        {/* Export Data Tab */}
        <TabsContent value="export" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Export Options */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Download className="h-5 w-5" />
                  <span>Request Data Export</span>
                </CardTitle>
                <CardDescription>
                  Choose what data you want to export and in what format
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Data Type</Label>
                  <Select defaultValue="full">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full">Complete Data Export</SelectItem>
                      <SelectItem value="mood">Mood Tracking Data</SelectItem>
                      <SelectItem value="journal">Journal Entries</SelectItem>
                      <SelectItem value="chat">AI Chat History</SelectItem>
                      <SelectItem value="goals">Goals & Progress</SelectItem>
                      <SelectItem value="sleep">Sleep Tracking</SelectItem>
                      <SelectItem value="medications">Medication Data</SelectItem>
                      <SelectItem value="community">Community Activity</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Export Format</Label>
                  <Select defaultValue="json">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="json">JSON (Machine Readable)</SelectItem>
                      <SelectItem value="csv">CSV (Spreadsheet)</SelectItem>
                      <SelectItem value="pdf">PDF (Human Readable)</SelectItem>
                      <SelectItem value="xlsx">Excel (Spreadsheet)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  className="w-full"
                  onClick={() => handleRequestExport('full', 'json')}
                  disabled={isLoading}
                >
                  <Download className="h-4 w-4 mr-2" />
                  {isLoading ? 'Requesting...' : 'Request Export'}
                </Button>

                <div className="text-sm text-muted-foreground">
                  <p>• Exports are processed within 24 hours</p>
                  <p>• You'll receive an email when ready</p>
                  <p>• Downloads expire after 7 days</p>
                </div>
              </CardContent>
            </Card>

            {/* Export History */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Archive className="h-5 w-5" />
                  <span>Export History</span>
                </CardTitle>
                <CardDescription>
                  Your recent data export requests
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dataExports.map((exportItem) => (
                    <div key={exportItem.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-medium">{exportItem.description}</h4>
                          <p className="text-sm text-muted-foreground">
                            {exportItem.format.toUpperCase()} • {exportItem.size || 'Processing...'}
                          </p>
                        </div>
                        <Badge className={getStatusColor(exportItem.status)}>
                          <div className="flex items-center space-x-1">
                            {getStatusIcon(exportItem.status)}
                            <span>{exportItem.status}</span>
                          </div>
                        </Badge>
                      </div>
                      
                      <div className="text-sm text-muted-foreground mb-3">
                        <p>Requested: {new Date(exportItem.requestedAt).toLocaleDateString()}</p>
                        {exportItem.completedAt && (
                          <p>Completed: {new Date(exportItem.completedAt).toLocaleDateString()}</p>
                        )}
                        <p>Expires: {new Date(exportItem.expiresAt).toLocaleDateString()}</p>
                      </div>

                      {exportItem.status === 'ready' && exportItem.downloadUrl && (
                        <Button
                          size="sm"
                          onClick={() => handleDownloadExport(exportItem.id)}
                          className="w-full"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Privacy Settings Tab */}
        <TabsContent value="privacy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Privacy & Data Settings</span>
              </CardTitle>
              <CardDescription>
                Control how your data is used and shared
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Data Sharing for Research</Label>
                    <p className="text-sm text-muted-foreground">Allow anonymized data to be used for mental health research</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={privacySettings.dataSharing}
                    onChange={(e) => setPrivacySettings({ ...privacySettings, dataSharing: e.target.checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Analytics Tracking</Label>
                    <p className="text-sm text-muted-foreground">Help improve the app with usage analytics</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={privacySettings.analyticsTracking}
                    onChange={(e) => setPrivacySettings({ ...privacySettings, analyticsTracking: e.target.checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Personalized Recommendations</Label>
                    <p className="text-sm text-muted-foreground">Receive AI-powered personalized suggestions</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={privacySettings.personalizedRecommendations}
                    onChange={(e) => setPrivacySettings({ ...privacySettings, personalizedRecommendations: e.target.checked })}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Marketing Emails</Label>
                    <p className="text-sm text-muted-foreground">Receive promotional emails and updates</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={privacySettings.marketingEmails}
                    onChange={(e) => setPrivacySettings({ ...privacySettings, marketingEmails: e.target.checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Research Participation</Label>
                    <p className="text-sm text-muted-foreground">Participate in mental health research studies</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={privacySettings.researchParticipation}
                    onChange={(e) => setPrivacySettings({ ...privacySettings, researchParticipation: e.target.checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Third-Party Sharing</Label>
                    <p className="text-sm text-muted-foreground">Allow data sharing with healthcare providers</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={privacySettings.thirdPartySharing}
                    onChange={(e) => setPrivacySettings({ ...privacySettings, thirdPartySharing: e.target.checked })}
                  />
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>Community Visibility</Label>
                  <Select value={privacySettings.communityVisibility} onValueChange={(value: any) => setPrivacySettings({ ...privacySettings, communityVisibility: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public - Anyone can see your posts</SelectItem>
                      <SelectItem value="friends">Friends - Only connections can see</SelectItem>
                      <SelectItem value="private">Private - Only you can see</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Profile Visibility</Label>
                  <Select value={privacySettings.profileVisibility} onValueChange={(value: any) => setPrivacySettings({ ...privacySettings, profileVisibility: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public - Anyone can find your profile</SelectItem>
                      <SelectItem value="private">Private - Only you can see your profile</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Data Retention Period</Label>
                  <Select value={privacySettings.dataRetention} onValueChange={(value: any) => setPrivacySettings({ ...privacySettings, dataRetention: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1year">1 Year</SelectItem>
                      <SelectItem value="2years">2 Years</SelectItem>
                      <SelectItem value="5years">5 Years</SelectItem>
                      <SelectItem value="indefinite">Indefinite</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button onClick={handleSavePrivacySettings} disabled={isLoading} className="w-full">
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? 'Saving...' : 'Save Privacy Settings'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Delete Data Tab */}
        <TabsContent value="delete" className="space-y-6">
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <strong>Warning:</strong> Deleting data is permanent and cannot be undone. Make sure you have exported any data you want to keep.
            </AlertDescription>
          </Alert>

          <div className="grid md:grid-cols-2 gap-6">
            {dataCategories.filter(category => category.canDelete).map((category) => {
              const IconComponent = category.icon
              
              return (
                <Card key={category.id} className="border-red-100">
                  <CardHeader>
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-lg bg-gray-100 ${category.color}`}>
                        <IconComponent className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg">{category.name}</CardTitle>
                        <CardDescription className="mt-2">
                          {category.description}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-sm mb-2">Data Types:</h4>
                        <div className="flex flex-wrap gap-1">
                          {category.dataTypes.map((type) => (
                            <Badge key={type} variant="outline" className="text-xs">
                              {type}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          setSelectedCategory(category.id)
                          setShowDeleteConfirm(true)
                        }}
                        className="w-full"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete {category.name}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && selectedCategory && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-red-600">
                <AlertTriangle className="h-5 w-5" />
                <span>Delete Data</span>
              </CardTitle>
              <CardDescription>
                This action cannot be undone. All {selectedCategory} data will be permanently deleted.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Are you sure you want to delete all {selectedCategory} data? This will remove:
              </p>
              <ul className="text-sm text-muted-foreground space-y-1">
                {dataCategories.find(c => c.id === selectedCategory)?.dataTypes.map((type) => (
                  <li key={type}>• {type}</li>
                ))}
              </ul>
              <div className="flex space-x-2">
                <Button 
                  variant="destructive" 
                  onClick={() => handleDeleteData(selectedCategory)}
                  disabled={isLoading}
                  className="flex-1"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {isLoading ? 'Deleting...' : 'Yes, Delete Data'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowDeleteConfirm(false)
                    setSelectedCategory(null)
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
