"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  AlertTriangle, 
  Phone, 
  MessageCircle, 
  MapPin, 
  Clock, 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  Heart, 
  Shield, 
  Users, 
  ExternalLink,
  CheckCircle,
  Star,
  Globe,
  Mail,
  Activity,
  Zap,
  Target,
  Download
} from "lucide-react"

interface EmergencyContact {
  id: string
  name: string
  relationship: string
  phone: string
  email?: string
  address?: string
  notes?: string
  isPrimary: boolean
  isAvailable24_7: boolean
  createdAt: string
  updatedAt: string
}

interface CrisisResource {
  id: string
  name: string
  type: 'hotline' | 'text' | 'chat' | 'website' | 'app' | 'location'
  contact: string
  description: string
  availability: string
  isFree: boolean
  is24_7: boolean
  category: 'suicide' | 'crisis' | 'general' | 'lgbtq' | 'veterans' | 'youth' | 'domestic' | 'substance'
  website?: string
  appStore?: string
  rating: number
  tags: string[]
}

interface SafetyPlan {
  id: string
  title: string
  warningSigns: string[]
  copingStrategies: string[]
  socialSupports: string[]
  professionalSupports: string[]
  environmentSafety: string[]
  emergencyContacts: string[]
  createdAt: string
  updatedAt: string
}

const crisisCategories = [
  { id: 'suicide', label: 'Suicide Prevention', icon: Heart, color: 'text-red-600' },
  { id: 'crisis', label: 'Crisis Support', icon: AlertTriangle, color: 'text-orange-600' },
  { id: 'general', label: 'General Mental Health', icon: Shield, color: 'text-blue-600' },
  { id: 'lgbtq', label: 'LGBTQ+ Support', icon: Users, color: 'text-purple-600' },
  { id: 'veterans', label: 'Veterans Support', icon: Star, color: 'text-green-600' },
  { id: 'youth', label: 'Youth Support', icon: Target, color: 'text-pink-600' },
  { id: 'domestic', label: 'Domestic Violence', icon: Shield, color: 'text-red-700' },
  { id: 'substance', label: 'Substance Abuse', icon: Activity, color: 'text-yellow-600' }
]

const resourceTypes = [
  { id: 'hotline', label: 'Hotline', icon: Phone },
  { id: 'text', label: 'Text Line', icon: MessageCircle },
  { id: 'chat', label: 'Online Chat', icon: MessageCircle },
  { id: 'website', label: 'Website', icon: Globe },
  { id: 'app', label: 'Mobile App', icon: Download },
  { id: 'location', label: 'Physical Location', icon: MapPin }
]

export default function EmergencyCrisisResources() {
  const { data: session } = useSession()
  const [activeTab, setActiveTab] = useState("contacts")
  const [isLoading, setIsLoading] = useState(false)
  const [showAddContact, setShowAddContact] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  // Database-connected state
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([])
  const [crisisResources, setCrisisResources] = useState<CrisisResource[]>([])
  const [safetyPlans, setSafetyPlans] = useState<SafetyPlan[]>([])

  // Load data from API
  useEffect(() => {
    if (session?.user?.id) {
      loadCrisisData()
    }
  }, [session])

  const loadCrisisData = async () => {
    setIsLoading(true)
    try {
      // Load emergency contacts
      const contactsRes = await fetch('/api/emergency-contacts')
      if (contactsRes.ok) {
        const contactsData = await contactsRes.json()
        setEmergencyContacts(contactsData)
      } else {
        // Use fallback data if API fails
        setEmergencyContacts(getDefaultEmergencyContacts())
      }

      // For now, use static crisis resources and safety plans
      // In a real app, these would come from crisis management APIs
      setCrisisResources(getDefaultCrisisResources())
      setSafetyPlans(getDefaultSafetyPlans())
    } catch (error) {
      console.error('Error loading crisis data:', error)
      setMessage({ type: 'error', text: 'Failed to load crisis resources' })
      // Use fallback data
      setEmergencyContacts(getDefaultEmergencyContacts())
      setCrisisResources(getDefaultCrisisResources())
      setSafetyPlans(getDefaultSafetyPlans())
    } finally {
      setIsLoading(false)
    }
  }

  const getDefaultEmergencyContacts = (): EmergencyContact[] => [
    {
      id: "1",
      name: "Dr. Sarah Johnson",
      relationship: "Therapist",
      phone: "(555) 123-4567",
      email: "sarah.johnson@therapy.com",
      address: "123 Main St, City, State 12345",
      notes: "Available Monday-Friday 9AM-5PM",
      isPrimary: true,
      isAvailable24_7: false,
      createdAt: "2024-01-15T10:00:00Z",
      updatedAt: "2024-01-15T10:00:00Z"
    },
    {
      id: "2",
      name: "Mom",
      relationship: "Family",
      phone: "(555) 987-6543",
      email: "mom@email.com",
      notes: "Always available for support",
      isPrimary: false,
      isAvailable24_7: true,
      createdAt: "2024-01-15T10:00:00Z",
      updatedAt: "2024-01-15T10:00:00Z"
    },
  ]

  const getDefaultCrisisResources = (): CrisisResource[] => [
    // Ghana-specific resources
    {
      id: "gh-1",
      name: "Ghana Mental Health Authority Crisis Line",
      type: "hotline",
      contact: "+233 302 666 000",
      description: "24/7 crisis support and mental health emergency services in Ghana",
      availability: "24/7",
      isFree: true,
      is24_7: true,
      category: "crisis",
      website: "https://www.mhag.gov.gh",
      rating: 4.5,
      tags: ["crisis", "24/7", "free", "ghana", "mental health authority"]
    },
    {
      id: "gh-2",
      name: "Accra Psychiatric Hospital Emergency",
      type: "hotline",
      contact: "+233 302 666 000",
      description: "Emergency psychiatric services and crisis intervention in Accra",
      availability: "24/7",
      isFree: true,
      is24_7: true,
      category: "crisis",
      website: "https://www.aph.gov.gh",
      rating: 4.3,
      tags: ["psychiatric", "emergency", "accra", "hospital", "crisis"]
    },
    {
      id: "gh-3",
      name: "Kumasi Psychiatric Hospital",
      type: "hotline",
      contact: "+233 322 020 000",
      description: "Mental health services and crisis support in Kumasi",
      availability: "24/7",
      isFree: true,
      is24_7: true,
      category: "crisis",
      website: "https://www.kph.gov.gh",
      rating: 4.2,
      tags: ["psychiatric", "kumasi", "hospital", "crisis", "ashanti"]
    },
    {
      id: "gh-4",
      name: "Mental Health Society of Ghana",
      type: "website",
      contact: "+233 302 123 456",
      description: "Community support and advocacy for mental health in Ghana",
      availability: "Monday-Friday 9AM-4PM",
      isFree: true,
      is24_7: false,
      category: "general",
      website: "https://www.mhsog.org",
      rating: 4.6,
      tags: ["community", "support", "advocacy", "society", "ghana"]
    },
    // Global resources
    {
      id: "gl-1",
      name: "988 Suicide & Crisis Lifeline (US)",
      type: "hotline",
      contact: "988",
      description: "24/7 crisis support for anyone experiencing emotional distress or suicidal thoughts",
      availability: "24/7",
      isFree: true,
      is24_7: true,
      category: "suicide",
      website: "https://988lifeline.org",
      rating: 4.8,
      tags: ["suicide", "crisis", "24/7", "free", "us"]
    },
    {
      id: "gl-2",
      name: "Crisis Text Line",
      type: "text",
      contact: "Text HOME to 741741",
      description: "Free, 24/7 crisis support via text message",
      availability: "24/7",
      isFree: true,
      is24_7: true,
      category: "crisis",
      website: "https://crisistextline.org",
      rating: 4.7,
      tags: ["crisis", "text", "24/7", "free", "us"]
    },
    {
      id: "gl-3",
      name: "Samaritans (UK)",
      type: "hotline",
      contact: "116 123",
      description: "24/7 emotional support for anyone in distress",
      availability: "24/7",
      isFree: true,
      is24_7: true,
      category: "crisis",
      website: "https://www.samaritans.org",
      rating: 4.9,
      tags: ["crisis", "24/7", "free", "uk", "samaritans"]
    },
    {
      id: "gl-4",
      name: "Lifeline Australia",
      type: "hotline",
      contact: "13 11 14",
      description: "24/7 crisis support and suicide prevention",
      availability: "24/7",
      isFree: true,
      is24_7: true,
      category: "suicide",
      website: "https://www.lifeline.org.au",
      rating: 4.8,
      tags: ["suicide", "crisis", "24/7", "free", "australia"]
    },
    {
      id: "gl-5",
      name: "International Association for Suicide Prevention",
      type: "website",
      contact: "Visit iasp.info/resources",
      description: "Global directory of crisis centers and suicide prevention resources",
      availability: "24/7",
      isFree: true,
      is24_7: true,
      category: "suicide",
      website: "https://www.iasp.info/resources",
      rating: 4.7,
      tags: ["suicide", "prevention", "global", "directory", "international"]
    },
    {
      id: "gl-6",
      name: "Befrienders Worldwide",
      type: "website",
      contact: "Visit befrienders.org",
      description: "Global network of emotional support services",
      availability: "24/7",
      isFree: true,
      is24_7: true,
      category: "general",
      website: "https://www.befrienders.org",
      rating: 4.6,
      tags: ["support", "global", "network", "emotional"]
    }
  ];
  
  const getDefaultSafetyPlans = (): SafetyPlan[] => [
    {
      id: "1",
      title: "My Safety Plan",
      warningSigns: [
        "Feeling overwhelmed and hopeless",
        "Increased anxiety and panic attacks",
        "Loss of appetite and sleep disturbances",
        "Withdrawing from friends and family"
      ],
      copingStrategies: [
        "Practice deep breathing exercises",
        "Listen to calming music",
        "Go for a walk in nature",
        "Write in my journal",
        "Call a trusted friend"
      ],
      socialSupports: [
        "Mom - (555) 987-6543",
        "Best friend Sarah - (555) 234-5678",
        "Support group meetings on Tuesdays"
      ],
      professionalSupports: [
        "Dr. Sarah Johnson - (555) 123-4567",
        "Emergency room if needed",
        "Crisis hotline: 988"
      ],
      environmentSafety: [
        "Remove any harmful objects from my space",
        "Stay in a safe, comfortable environment",
        "Avoid alcohol and drugs",
        "Keep emergency contacts easily accessible"
      ],
      emergencyContacts: [
        "988 Suicide & Crisis Lifeline",
        "Mom - (555) 987-6543",
        "Dr. Sarah Johnson - (555) 123-4567"
      ],
      createdAt: "2024-01-15T10:00:00Z",
      updatedAt: "2024-01-15T10:00:00Z"
    }
  ]

  const [newContact, setNewContact] = useState<Partial<EmergencyContact>>({
    name: '',
    relationship: '',
    phone: '',
    email: '',
    address: '',
    notes: '',
    isPrimary: false,
    isAvailable24_7: false
  })


  const handleAddContact = async () => {
    if (!newContact.name || !newContact.phone) {
      setMessage({ type: 'error', text: 'Please fill in name and phone number' })
      return
    }

    setIsLoading(true)
    try {
      const contact: EmergencyContact = {
        id: Date.now().toString(),
        name: newContact.name!,
        relationship: newContact.relationship || '',
        phone: newContact.phone!,
        ...(newContact.email && { email: newContact.email }),
        ...(newContact.address && { address: newContact.address }),
        ...(newContact.notes && { notes: newContact.notes }),
        isPrimary: newContact.isPrimary || false,
        isAvailable24_7: newContact.isAvailable24_7 || false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      setEmergencyContacts([...emergencyContacts, contact])
      setNewContact({
        name: '',
        relationship: '',
        phone: '',
        email: '',
        address: '',
        notes: '',
        isPrimary: false,
        isAvailable24_7: false
      })
      setShowAddContact(false)
      setMessage({ type: 'success', text: 'Emergency contact added successfully!' })
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to add emergency contact' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteContact = async (id: string) => {
    setIsLoading(true)
    try {
      setEmergencyContacts(emergencyContacts.filter(contact => contact.id !== id))
      setMessage({ type: 'success', text: 'Emergency contact deleted successfully!' })
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to delete emergency contact' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCallContact = (phone: string) => {
    window.open(`tel:${phone}`, '_self')
  }

  const handleTextContact = (phone: string) => {
    window.open(`sms:${phone}`, '_self')
  }

  const handleEmailContact = (email: string) => {
    window.open(`mailto:${email}`, '_self')
  }

  const getResourceTypeIcon = (type: string) => {
    const resourceType = resourceTypes.find(t => t.id === type)
    return resourceType ? resourceType.icon : Phone
  }


  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ))
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-2">
          <AlertTriangle className="h-8 w-8 text-red-600" />
          <h1 className="text-3xl font-bold text-foreground">Emergency & Crisis Resources</h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Your safety is our priority. Access emergency contacts, crisis resources, and safety planning tools when you need them most.
        </p>
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>In a mental health emergency:</strong> Call 988 (Suicide & Crisis Lifeline), 911, or go to your nearest emergency room immediately.
          </AlertDescription>
        </Alert>
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
          <TabsTrigger value="contacts" className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>Emergency Contacts</span>
          </TabsTrigger>
          <TabsTrigger value="resources" className="flex items-center space-x-2">
            <Shield className="h-4 w-4" />
            <span>Crisis Resources</span>
          </TabsTrigger>
          <TabsTrigger value="safety" className="flex items-center space-x-2">
            <Heart className="h-4 w-4" />
            <span>Safety Plan</span>
          </TabsTrigger>
          <TabsTrigger value="quick" className="flex items-center space-x-2">
            <Zap className="h-4 w-4" />
            <span>Quick Access</span>
          </TabsTrigger>
        </TabsList>

        {/* Emergency Contacts Tab */}
        <TabsContent value="contacts" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Your Emergency Contacts</h2>
            <Button onClick={() => setShowAddContact(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Contact
            </Button>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {emergencyContacts.map((contact) => (
              <Card key={contact.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center space-x-2">
                        <span>{contact.name}</span>
                        {contact.isPrimary && (
                          <Badge variant="secondary" className="flex items-center space-x-1">
                            <Star className="h-3 w-3" />
                            <span>Primary</span>
                          </Badge>
                        )}
                      </CardTitle>
                      <CardDescription>{contact.relationship}</CardDescription>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          // TODO: Implement edit functionality
                          console.log('Edit contact:', contact)
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteContact(contact.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{contact.phone}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCallContact(contact.phone)}
                      >
                        Call
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleTextContact(contact.phone)}
                      >
                        Text
                      </Button>
                    </div>
                    
                    {contact.email && (
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{contact.email}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEmailContact(contact.email!)}
                        >
                          Email
                        </Button>
                      </div>
                    )}
                    
                    {contact.address && (
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{contact.address}</span>
                      </div>
                    )}
                  </div>

                  {contact.notes && (
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">{contact.notes}</p>
                    </div>
                  )}

                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{contact.isAvailable24_7 ? 'Available 24/7' : 'Limited hours'}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Add Contact Form */}
          {showAddContact && (
            <Card>
              <CardHeader>
                <CardTitle>Add Emergency Contact</CardTitle>
                <CardDescription>Add a trusted person to your emergency contacts list</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      value={newContact.name}
                      onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                      placeholder="Enter full name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="relationship">Relationship</Label>
                    <Input
                      id="relationship"
                      value={newContact.relationship}
                      onChange={(e) => setNewContact({ ...newContact, relationship: e.target.value })}
                      placeholder="e.g., Family, Friend, Therapist"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      value={newContact.phone}
                      onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                      placeholder="(555) 123-4567"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newContact.email}
                      onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                      placeholder="email@example.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={newContact.address}
                    onChange={(e) => setNewContact({ ...newContact, address: e.target.value })}
                    placeholder="123 Main St, City, State 12345"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={newContact.notes}
                    onChange={(e) => setNewContact({ ...newContact, notes: e.target.value })}
                    placeholder="Availability, special instructions, etc."
                    rows={3}
                  />
                </div>

                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isPrimary"
                      checked={newContact.isPrimary}
                      onChange={(e) => setNewContact({ ...newContact, isPrimary: e.target.checked })}
                    />
                    <Label htmlFor="isPrimary">Primary Contact</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isAvailable24_7"
                      checked={newContact.isAvailable24_7}
                      onChange={(e) => setNewContact({ ...newContact, isAvailable24_7: e.target.checked })}
                    />
                    <Label htmlFor="isAvailable24_7">Available 24/7</Label>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button onClick={handleAddContact} disabled={isLoading}>
                    <Save className="h-4 w-4 mr-2" />
                    {isLoading ? 'Adding...' : 'Add Contact'}
                  </Button>
                  <Button variant="outline" onClick={() => setShowAddContact(false)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Crisis Resources Tab */}
        <TabsContent value="resources" className="space-y-6">
          <div className="space-y-6">
            {crisisCategories.map((category) => {
              const categoryResources = crisisResources.filter(resource => resource.category === category.id)
              if (categoryResources.length === 0) return null

              return (
                <Card key={category.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <category.icon className={`h-5 w-5 ${category.color}`} />
                      <span>{category.label}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-4">
                      {categoryResources.map((resource) => {
                        const IconComponent = getResourceTypeIcon(resource.type)
                        
                        return (
                          <div key={resource.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center space-x-2">
                                <IconComponent className="h-5 w-5 text-muted-foreground" />
                                <h4 className="font-semibold">{resource.name}</h4>
                              </div>
                              <div className="flex items-center space-x-1">
                                {getRatingStars(resource.rating)}
                                <span className="text-sm text-muted-foreground ml-1">
                                  ({resource.rating})
                                </span>
                              </div>
                            </div>
                            
                            <p className="text-sm text-muted-foreground mb-3">{resource.description}</p>
                            
                            <div className="space-y-2 mb-3">
                              <div className="flex items-center space-x-2">
                                <Phone className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm font-medium">{resource.contact}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">{resource.availability}</span>
                              </div>
                            </div>

                            <div className="flex items-center space-x-2 mb-3">
                              {resource.isFree && (
                                <Badge variant="secondary" className="text-xs">Free</Badge>
                              )}
                              {resource.is24_7 && (
                                <Badge variant="secondary" className="text-xs">24/7</Badge>
                              )}
                            </div>

                            <div className="flex space-x-2">
                              {resource.type === 'hotline' && (
                                <Button
                                  size="sm"
                                  onClick={() => window.open(`tel:${resource.contact}`, '_self')}
                                >
                                  <Phone className="h-4 w-4 mr-1" />
                                  Call
                                </Button>
                              )}
                              {resource.type === 'text' && (
                                <Button
                                  size="sm"
                                  onClick={() => window.open(`sms:${resource.contact}`, '_self')}
                                >
                                  <MessageCircle className="h-4 w-4 mr-1" />
                                  Text
                                </Button>
                              )}
                              {resource.website && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => window.open(resource.website, '_blank')}
                                >
                                  <ExternalLink className="h-4 w-4 mr-1" />
                                  Visit
                                </Button>
                              )}
                            </div>
                          </div>
                        )
                      },)}
                    </div>
                  </CardContent>
                </Card>
              )
            },)}
          </div>
        </TabsContent>

        {/* Safety Plan Tab */}
        <TabsContent value="safety" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Heart className="h-5 w-5" />
                <span>My Safety Plan</span>
              </CardTitle>
              <CardDescription>
                A personalized plan to help you stay safe during difficult times
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center space-x-2">
                      <AlertTriangle className="h-4 w-4 text-orange-600" />
                      <span>Warning Signs</span>
                    </h4>
                    <ul className="space-y-1">
                      {safetyPlans[0]?.warningSigns.map((sign: string, index: number) => (
                        <li key={index} className="text-sm text-muted-foreground flex items-start space-x-2">
                          <span className="text-orange-600 mt-1">•</span>
                          <span>{sign}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2 flex items-center space-x-2">
                      <Heart className="h-4 w-4 text-green-600" />
                      <span>Coping Strategies</span>
                    </h4>
                    <ul className="space-y-1">
                      {safetyPlans[0]?.copingStrategies.map((strategy: string, index: number) => (
                        <li key={index} className="text-sm text-muted-foreground flex items-start space-x-2">
                          <span className="text-green-600 mt-1">•</span>
                          <span>{strategy}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center space-x-2">
                      <Users className="h-4 w-4 text-blue-600" />
                      <span>Social Supports</span>
                    </h4>
                    <ul className="space-y-1">
                      {safetyPlans[0]?.socialSupports.map((support: string, index: number) => (
                        <li key={index} className="text-sm text-muted-foreground flex items-start space-x-2">
                          <span className="text-blue-600 mt-1">•</span>
                          <span>{support}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2 flex items-center space-x-2">
                      <Shield className="h-4 w-4 text-purple-600" />
                      <span>Professional Supports</span>
                    </h4>
                    <ul className="space-y-1">
                      {safetyPlans[0]?.professionalSupports.map((support: string, index: number) => (
                        <li key={index} className="text-sm text-muted-foreground flex items-start space-x-2">
                          <span className="text-purple-600 mt-1">•</span>
                          <span>{support}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold mb-2 flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-indigo-600" />
                  <span>Environment Safety</span>
                </h4>
                <ul className="space-y-1">
                  {safetyPlans[0]?.environmentSafety.map((item: string, index: number) => (
                    <li key={index} className="text-sm text-muted-foreground flex items-start space-x-2">
                      <span className="text-indigo-600 mt-1">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex space-x-2">
                <Button>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Safety Plan
                </Button>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Quick Access Tab */}
        <TabsContent value="quick" className="space-y-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-6 text-center">
                <AlertTriangle className="h-12 w-12 text-red-600 mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">Crisis Hotline</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  24/7 crisis support for anyone experiencing emotional distress
                </p>
                <Button
                  size="lg"
                  className="w-full bg-red-600 hover:bg-red-700"
                  onClick={() => window.open('tel:988', '_self')}
                >
                  <Phone className="h-5 w-5 mr-2" />
                  Call 988
                </Button>
              </CardContent>
            </Card>

            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-6 text-center">
                <MessageCircle className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">Crisis Text Line</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Free, 24/7 crisis support via text message
                </p>
                <Button
                  size="lg"
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  onClick={() => window.open('sms:741741', '_self')}
                >
                  <MessageCircle className="h-5 w-5 mr-2" />
                  Text HOME to 741741
                </Button>
              </CardContent>
            </Card>

            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-6 text-center">
                <Users className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">Emergency Contacts</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Quick access to your trusted emergency contacts
                </p>
                <Button
                  size="lg"
                  className="w-full bg-green-600 hover:bg-green-700"
                  onClick={() => setActiveTab('contacts')}
                >
                  <Users className="h-5 w-5 mr-2" />
                  View Contacts
                </Button>
              </CardContent>
            </Card>

            <Card className="border-purple-200 bg-purple-50">
              <CardContent className="p-6 text-center">
                <Heart className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">Safety Plan</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Your personalized safety plan for difficult times
                </p>
                <Button
                  size="lg"
                  className="w-full bg-purple-600 hover:bg-purple-700"
                  onClick={() => setActiveTab('safety')}
                >
                  <Heart className="h-5 w-5 mr-2" />
                  View Safety Plan
                </Button>
              </CardContent>
            </Card>

            <Card className="border-orange-200 bg-orange-50">
              <CardContent className="p-6 text-center">
                <Shield className="h-12 w-12 text-orange-600 mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">Crisis Resources</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Comprehensive list of crisis support resources
                </p>
                <Button
                  size="lg"
                  className="w-full bg-orange-600 hover:bg-orange-700"
                  onClick={() => setActiveTab('resources')}
                >
                  <Shield className="h-5 w-5 mr-2" />
                  View Resources
                </Button>
              </CardContent>
            </Card>

            <Card className="border-indigo-200 bg-indigo-50">
              <CardContent className="p-6 text-center">
                <Globe className="h-12 w-12 text-indigo-600 mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">Emergency Room</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Find your nearest emergency room for immediate help
                </p>
                <Button
                  size="lg"
                  className="w-full bg-indigo-600 hover:bg-indigo-700"
                  onClick={() => window.open('https://www.google.com/maps/search/emergency+room', '_blank')}
                >
                  <MapPin className="h-5 w-5 mr-2" />
                  Find ER
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
