"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  UserCheck, 
  Calendar, 
  MessageCircle, 
  Phone, 
  MapPin, 
  Star, 
  Clock, 
  DollarSign, 
  Shield, 
  Video, 
  Users, 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  CheckCircle, 
  AlertTriangle,
  Heart,
  Target,
  BarChart3,
  Download,
  Upload,
  Eye,
  Globe,
  CreditCard
} from "lucide-react"

interface Therapist {
  id: string
  name: string
  title: string
  specialization: string[]
  credentials: string[]
  experience: number
  rating: number
  reviewCount: number
  avatar: string
  bio: string
  location: string
  isOnline: boolean
  isAvailable: boolean
  nextAvailable: string
  sessionTypes: string[]
  pricing: {
    individual: number
    group: number
    sliding: boolean
  }
  insurance: string[]
  languages: string[]
  approach: string[]
  availability: {
    monday: string[]
    tuesday: string[]
    wednesday: string[]
    thursday: string[]
    friday: string[]
    saturday: string[]
    sunday: string[]
  }
  isVerified: boolean
  isPreferred: boolean
}

interface Appointment {
  id: string
  therapistId: string
  therapistName: string
  type: 'individual' | 'group' | 'couples' | 'family'
  date: string
  time: string
  duration: number
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'rescheduled'
  location: 'in-person' | 'video' | 'phone'
  notes?: string
  reminderSent: boolean
  paymentStatus: 'pending' | 'paid' | 'refunded'
  cost: number
}

interface TreatmentPlan {
  id: string
  therapistId: string
  therapistName: string
  title: string
  description: string
  goals: string[]
  milestones: {
    id: string
    title: string
    description: string
    targetDate: string
    status: 'pending' | 'in-progress' | 'completed'
    completedDate?: string
  }[]
  startDate: string
  endDate: string
  status: 'active' | 'completed' | 'paused'
  lastUpdated: string
}

interface ProgressReport {
  id: string
  therapistId: string
  therapistName: string
  date: string
  sessionNotes: string
  moodRating: number
  progressAreas: string[]
  challenges: string[]
  homework: string[]
  nextSessionFocus: string
  recommendations: string[]
  isShared: boolean
}

const specializations = [
  'Anxiety', 'Depression', 'PTSD', 'Trauma', 'Grief', 'Addiction', 'Eating Disorders',
  'OCD', 'Bipolar Disorder', 'ADHD', 'Autism', 'Relationship Issues', 'Family Therapy',
  'Couples Therapy', 'Child Therapy', 'Adolescent Therapy', 'LGBTQ+', 'Veterans',
  'Substance Abuse', 'Anger Management', 'Stress Management', 'Mindfulness', 'CBT',
  'DBT', 'EMDR', 'Psychodynamic', 'Humanistic', 'Gestalt'
]



export default function TherapistProfessionalIntegration() {
  const { data: session } = useSession()
  const [activeTab, setActiveTab] = useState("find")
  const [isLoading, setIsLoading] = useState(false)
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [selectedTherapist, setSelectedTherapist] = useState<Therapist | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  // Database-connected state
  const [therapists, setTherapists] = useState<Therapist[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [treatmentPlans, setTreatmentPlans] = useState<TreatmentPlan[]>([])
  const [progressReports, setProgressReports] = useState<ProgressReport[]>([])

  // Load data from API
  useEffect(() => {
    if (session?.user?.id) {
      loadTherapistData()
    }
  }, [session])

  const loadTherapistData = async () => {
    setIsLoading(true)
    try {
      // Load appointments
      const appointmentsRes = await fetch('/api/appointments')
      if (appointmentsRes.ok) {
        const appointmentsData = await appointmentsRes.json()
        setAppointments(appointmentsData)
      }

      // Load treatment plans
      const treatmentRes = await fetch('/api/treatment-plans')
      if (treatmentRes.ok) {
        const treatmentData = await treatmentRes.json()
        setTreatmentPlans(treatmentData)
      }

      // Load progress reports
      const progressRes = await fetch('/api/progress-reports')
      if (progressRes.ok) {
        const progressData = await progressRes.json()
        setProgressReports(progressData)
      }

      // For now, we'll use a basic therapist list - in a real app, this would come from a therapist directory API
      const mockTherapists: Therapist[] = [
        // Ghana-based therapists
        {
          id: "gh-1",
          name: "Dr. Kwame Asante",
          title: "Clinical Psychologist",
          specialization: ["Anxiety", "Depression", "Cultural Psychology", "Trauma"],
          credentials: ["PhD", "Clinical Psychologist", "Cultural Therapy Certified"],
          experience: 15,
          rating: 4.8,
          reviewCount: 89,
          avatar: "/avatars/kwame.jpg",
          bio: "Dr. Asante specializes in integrating traditional Ghanaian healing practices with modern psychology. He has extensive experience working with cultural trauma and community-based mental health approaches.",
          location: "Accra, Ghana",
          isOnline: true,
          isAvailable: true,
          nextAvailable: "2024-01-22T10:00:00Z",
          sessionTypes: ["Individual Therapy", "Group Therapy", "Community Sessions"],
          pricing: {
            individual: 200, // GHS
            group: 100,
            sliding: true
          },
          insurance: ["National Health Insurance", "Private Insurance"],
          languages: ["English", "Twi", "Ga"],
          approach: ["Cultural Psychology", "Cognitive Behavioral Therapy", "Traditional Healing Integration"],
          availability: {
            monday: ["09:00", "10:00", "14:00", "15:00"],
            tuesday: ["09:00", "10:00", "14:00", "15:00"],
            wednesday: ["09:00", "10:00", "14:00", "15:00"],
            thursday: ["09:00", "10:00", "14:00", "15:00"],
            friday: ["09:00", "10:00", "14:00", "15:00"],
            saturday: ["09:00", "10:00"],
            sunday: []
          },
          isVerified: true,
          isPreferred: true
        },
        {
          id: "gh-2",
          name: "Dr. Ama Serwaa",
          title: "Psychiatrist",
          specialization: ["Mood Disorders", "Psychiatric Medication", "Crisis Intervention"],
          credentials: ["MD", "Psychiatry", "Crisis Intervention Certified"],
          experience: 12,
          rating: 4.7,
          reviewCount: 67,
          avatar: "/avatars/ama.jpg",
          bio: "Dr. Serwaa is a psychiatrist specializing in mood disorders and psychiatric medication management. She works closely with traditional healers to provide comprehensive care.",
          location: "Kumasi, Ghana",
          isOnline: false,
          isAvailable: true,
          nextAvailable: "2024-01-23T14:00:00Z",
          sessionTypes: ["Psychiatric Consultation", "Medication Management", "Crisis Intervention"],
          pricing: {
            individual: 250,
            group: 120,
            sliding: true
          },
          insurance: ["National Health Insurance", "Private Insurance"],
          languages: ["English", "Twi", "Akan"],
          approach: ["Psychiatric Medicine", "Crisis Intervention", "Traditional Medicine Integration"],
          availability: {
            monday: ["08:00", "09:00", "13:00", "14:00"],
            tuesday: ["08:00", "09:00", "13:00", "14:00"],
            wednesday: ["08:00", "09:00", "13:00", "14:00"],
            thursday: ["08:00", "09:00", "13:00", "14:00"],
            friday: ["08:00", "09:00", "13:00", "14:00"],
            saturday: [],
            sunday: []
          },
          isVerified: true,
          isPreferred: false
        },
        // Global therapists
        {
          id: "gl-1",
          name: "Dr. Sarah Johnson",
          title: "Licensed Clinical Psychologist",
          specialization: ["Anxiety", "Depression", "CBT", "Trauma"],
          credentials: ["PhD", "LCP", "CBT-Certified"],
          experience: 12,
          rating: 4.9,
          reviewCount: 127,
          avatar: "/avatars/sarah.jpg",
          bio: "Dr. Johnson specializes in treating anxiety and depression using evidence-based approaches. She has over 12 years of experience helping clients develop coping strategies and improve their mental health.",
          location: "New York, NY",
          isOnline: true,
          isAvailable: true,
          nextAvailable: "2024-01-22T10:00:00Z",
          sessionTypes: ["Individual Therapy", "Online Therapy"],
          pricing: {
            individual: 150,
            group: 75,
            sliding: true
          },
          insurance: ["Aetna", "Blue Cross", "Cigna", "UnitedHealth"],
          languages: ["English", "Spanish"],
          approach: ["Cognitive Behavioral Therapy (CBT)", "Mindfulness-Based Therapy"],
          availability: {
            monday: ["09:00", "10:00", "14:00", "15:00"],
            tuesday: ["09:00", "10:00", "14:00", "15:00"],
            wednesday: ["09:00", "10:00", "14:00", "15:00"],
            thursday: ["09:00", "10:00", "14:00", "15:00"],
            friday: ["09:00", "10:00", "14:00", "15:00"],
            saturday: [],
            sunday: []
          },
          isVerified: true,
          isPreferred: true
        },
        {
          id: "gl-2",
          name: "Dr. Maria Rodriguez",
          title: "Cross-Cultural Psychologist",
          specialization: ["Cultural Psychology", "Immigration Trauma", "Bilingual Therapy"],
          credentials: ["PhD", "Cross-Cultural Psychology", "Trauma Certified"],
          experience: 10,
          rating: 4.8,
          reviewCount: 94,
          avatar: "/avatars/maria.jpg",
          bio: "Dr. Rodriguez specializes in cross-cultural psychology and immigration-related trauma. She provides therapy in both English and Spanish, with expertise in Latin American cultural contexts.",
          location: "Los Angeles, CA",
          isOnline: false,
          isAvailable: true,
          nextAvailable: "2024-01-23T14:00:00Z",
          sessionTypes: ["Individual Therapy", "Family Therapy", "Online Therapy"],
          pricing: {
            individual: 140,
            group: 70,
            sliding: true
          },
          insurance: ["Aetna", "Blue Cross", "Kaiser", "Medicaid"],
          languages: ["English", "Spanish", "Portuguese"],
          approach: ["Cross-Cultural Psychology", "Trauma-Informed Care", "Family Systems Therapy"],
          availability: {
            monday: ["10:00", "11:00", "15:00", "16:00"],
            tuesday: ["10:00", "11:00", "15:00", "16:00"],
            wednesday: ["10:00", "11:00", "15:00", "16:00"],
            thursday: ["10:00", "11:00", "15:00", "16:00"],
            friday: ["10:00", "11:00", "15:00", "16:00"],
            saturday: ["09:00", "10:00"],
            sunday: []
          },
          isVerified: true,
          isPreferred: false
        }
      ]
      setTherapists(mockTherapists)
    } catch (error) {
      console.error('Error loading therapist data:', error)
      setMessage({ type: 'error', text: 'Failed to load therapist data' })
    } finally {
      setIsLoading(false)
    }
  }

  const [searchFilters, setSearchFilters] = useState({
    specialization: '',
    location: '',
    priceRange: '',
    availability: '',
    insurance: '',
    language: ''
  })

  const [bookingForm, setBookingForm] = useState({
    therapistId: '',
    type: 'individual',
    date: '',
    time: '',
    duration: 50,
    location: 'video',
    notes: ''
  })

  const handleBookAppointment = async () => {
    if (!bookingForm.date || !bookingForm.time) {
      setMessage({ type: 'error', text: 'Please select date and time' })
      return
    }

    setIsLoading(true)
    try {
      const appointmentData = {
        therapistId: bookingForm.therapistId,
        therapistName: selectedTherapist?.name || '',
        type: bookingForm.type.toUpperCase(),
        date: new Date(`${bookingForm.date}T${bookingForm.time}`).toISOString(),
        duration: bookingForm.duration,
        location: bookingForm.location.toUpperCase(),
        notes: bookingForm.notes,
        cost: selectedTherapist?.pricing.individual || 0
      }

      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(appointmentData)
      })

      if (response.ok) {
        setMessage({ type: 'success', text: 'Appointment booked successfully!' })
        setShowBookingModal(false)
        setBookingForm({
          therapistId: '',
          type: 'individual',
          date: '',
          time: '',
          duration: 50,
          location: 'video',
          notes: ''
        })
        // Reload appointments
        loadTherapistData()
      } else {
        const errorData = await response.json()
        setMessage({ type: 'error', text: errorData.error || 'Failed to book appointment' })
      }
    } catch (error) {
      console.error('Error booking appointment:', error)
      setMessage({ type: 'error', text: 'Failed to book appointment' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleShareProgress = async (reportId: string) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/progress-reports/${reportId}/share`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (response.ok) {
        setMessage({ type: 'success', text: 'Progress report shared with therapist!' })
        // Reload progress reports
        loadTherapistData()
      } else {
        const errorData = await response.json()
        setMessage({ type: 'error', text: errorData.error || 'Failed to share progress report' })
      }
    } catch (error) {
      console.error('Error sharing progress report:', error)
      setMessage({ type: 'error', text: 'Failed to share progress report' })
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'confirmed': return 'bg-green-100 text-green-800 border-green-200'
      case 'completed': return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200'
      case 'rescheduled': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ))
  }

  const filteredTherapists = therapists.filter(therapist => {
    const matchesSpecialization = !searchFilters.specialization || 
      therapist.specialization.some(spec => spec.toLowerCase().includes(searchFilters.specialization.toLowerCase()))
    const matchesLocation = !searchFilters.location || 
      therapist.location.toLowerCase().includes(searchFilters.location.toLowerCase())
    const matchesAvailability = !searchFilters.availability || therapist.isAvailable
    return matchesSpecialization && matchesLocation && matchesAvailability
  })

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-2">
          <UserCheck className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">Therapist & Professional Integration</h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Connect with licensed mental health professionals, manage appointments, and collaborate on your treatment plan.
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
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="find" className="flex items-center space-x-2">
            <Search className="h-4 w-4" />
            <span>Find Therapists</span>
          </TabsTrigger>
          <TabsTrigger value="appointments" className="flex items-center space-x-2">
            <Calendar className="h-4 w-4" />
            <span>Appointments</span>
          </TabsTrigger>
          <TabsTrigger value="treatment" className="flex items-center space-x-2">
            <Target className="h-4 w-4" />
            <span>Treatment Plans</span>
          </TabsTrigger>
          <TabsTrigger value="progress" className="flex items-center space-x-2">
            <BarChart3 className="h-4 w-4" />
            <span>Progress Reports</span>
          </TabsTrigger>
          <TabsTrigger value="communication" className="flex items-center space-x-2">
            <MessageCircle className="h-4 w-4" />
            <span>Communication</span>
          </TabsTrigger>
        </TabsList>

        {/* Find Therapists Tab */}
        <TabsContent value="find" className="space-y-6">
          {/* Search Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Filter className="h-5 w-5" />
                <span>Search Filters</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Specialization</Label>
                  <Select value={searchFilters.specialization} onValueChange={(value) => setSearchFilters({ ...searchFilters, specialization: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select specialization" />
                    </SelectTrigger>
                    <SelectContent>
                      {specializations.map((spec) => (
                        <SelectItem key={spec} value={spec}>{spec}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Location</Label>
                  <Input
                    placeholder="City, State"
                    value={searchFilters.location}
                    onChange={(e) => setSearchFilters({ ...searchFilters, location: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Availability</Label>
                  <Select value={searchFilters.availability} onValueChange={(value) => setSearchFilters({ ...searchFilters, availability: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select availability" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">Available Now</SelectItem>
                      <SelectItem value="this-week">This Week</SelectItem>
                      <SelectItem value="next-week">Next Week</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Therapists List */}
          <div className="grid md:grid-cols-2 gap-6">
            {filteredTherapists.map((therapist) => (
              <Card key={therapist.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start space-x-4">
                    <div className="relative">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={therapist.avatar} />
                        <AvatarFallback>{therapist.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      {therapist.isOnline && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{therapist.name}</CardTitle>
                          <CardDescription>{therapist.title}</CardDescription>
                          <div className="flex items-center space-x-2 mt-1">
                            <div className="flex items-center space-x-1">
                              {getRatingStars(Math.floor(therapist.rating))}
                              <span className="text-sm text-muted-foreground">
                                {therapist.rating} ({therapist.reviewCount} reviews)
                              </span>
                            </div>
                            {therapist.isVerified && (
                              <Badge variant="secondary" className="text-xs">
                                <Shield className="h-3 w-3 mr-1" />
                                Verified
                              </Badge>
                            )}
                          </div>
                        </div>
                        {therapist.isPreferred && (
                          <Badge variant="default" className="text-xs">
                            <Heart className="h-3 w-3 mr-1" />
                            Preferred
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">{therapist.bio}</p>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Specializations:</h4>
                    <div className="flex flex-wrap gap-1">
                      {therapist.specialization.map((spec) => (
                        <Badge key={spec} variant="outline" className="text-xs">
                          {spec}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{therapist.location}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span>${therapist.pricing.individual}/session</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{therapist.experience} years experience</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <span>{therapist.languages.join(', ')}</span>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      onClick={() => {
                        setSelectedTherapist(therapist)
                        setBookingForm({ ...bookingForm, therapistId: therapist.id })
                        setShowBookingModal(true)
                      }}
                      className="flex-1"
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Book Session
                    </Button>
                    <Button variant="outline" size="sm">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Message
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Appointments Tab */}
        <TabsContent value="appointments" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Your Appointments</h2>
            <Button onClick={() => setActiveTab('find')}>
              <Plus className="h-4 w-4 mr-2" />
              Book New Appointment
            </Button>
          </div>

          <div className="space-y-4">
            {appointments.map((appointment) => (
              <Card key={appointment.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="p-2 rounded-lg bg-blue-100">
                        <Calendar className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-semibold text-lg">{appointment.therapistName}</h3>
                          <Badge className={getStatusColor(appointment.status)}>
                            {appointment.status}
                          </Badge>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <Calendar className="h-4 w-4" />
                              <span>{new Date(appointment.date).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Clock className="h-4 w-4" />
                              <span>{appointment.time} ({appointment.duration} min)</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              {appointment.location === 'video' ? (
                                <Video className="h-4 w-4" />
                              ) : appointment.location === 'phone' ? (
                                <Phone className="h-4 w-4" />
                              ) : (
                                <MapPin className="h-4 w-4" />
                              )}
                              <span className="capitalize">{appointment.location}</span>
                            </div>
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <DollarSign className="h-4 w-4" />
                              <span>${appointment.cost}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Users className="h-4 w-4" />
                              <span className="capitalize">{appointment.type} Session</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <CreditCard className="h-4 w-4" />
                              <span className="capitalize">{appointment.paymentStatus}</span>
                            </div>
                          </div>
                        </div>
                        {appointment.notes && (
                          <div className="mt-3 p-3 bg-muted rounded-lg">
                            <p className="text-sm text-muted-foreground">{appointment.notes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      {appointment.status === 'scheduled' && (
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-1" />
                          Reschedule
                        </Button>
                      )}
                      {appointment.status === 'scheduled' && (
                        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                          <Trash2 className="h-4 w-4 mr-1" />
                          Cancel
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Treatment Plans Tab */}
        <TabsContent value="treatment" className="space-y-6">
          <div className="space-y-6">
            {treatmentPlans.map((plan) => (
              <Card key={plan.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl">{plan.title}</CardTitle>
                      <CardDescription className="mt-2">
                        With {plan.therapistName} • {plan.status}
                      </CardDescription>
                    </div>
                    <Badge variant={plan.status === 'active' ? 'default' : 'secondary'}>
                      {plan.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h4 className="font-semibold mb-2">Description</h4>
                    <p className="text-muted-foreground">{plan.description}</p>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Goals</h4>
                    <ul className="space-y-1">
                      {plan.goals.map((goal, index) => (
                        <li key={index} className="text-sm text-muted-foreground flex items-start space-x-2">
                          <span className="text-primary mt-1">•</span>
                          <span>{goal}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Milestones</h4>
                    <div className="space-y-3">
                      {plan.milestones.map((milestone) => (
                        <div key={milestone.id} className="p-3 border rounded-lg">
                          <div className="flex items-start justify-between">
                            <div>
                              <h5 className="font-medium">{milestone.title}</h5>
                              <p className="text-sm text-muted-foreground mt-1">{milestone.description}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                Target: {new Date(milestone.targetDate).toLocaleDateString()}
                              </p>
                            </div>
                            <Badge variant={
                              milestone.status === 'completed' ? 'default' :
                              milestone.status === 'in-progress' ? 'secondary' : 'outline'
                            }>
                              {milestone.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Download Plan
                    </Button>
                    <Button variant="outline">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Discuss with Therapist
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Progress Reports Tab */}
        <TabsContent value="progress" className="space-y-6">
          <div className="space-y-6">
            {progressReports.map((report) => (
              <Card key={report.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">Session Report</CardTitle>
                      <CardDescription>
                        {report.therapistName} • {new Date(report.date).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="flex items-center space-x-1">
                        <Heart className="h-3 w-3" />
                        <span>Mood: {report.moodRating}/10</span>
                      </Badge>
                      {report.isShared && (
                        <Badge variant="secondary" className="flex items-center space-x-1">
                          <Eye className="h-3 w-3" />
                          <span>Shared</span>
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Session Notes</h4>
                    <p className="text-muted-foreground">{report.sessionNotes}</p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold mb-2">Progress Areas</h4>
                      <ul className="space-y-1">
                        {report.progressAreas.map((area, index) => (
                          <li key={index} className="text-sm text-muted-foreground flex items-start space-x-2">
                            <span className="text-green-600 mt-1">•</span>
                            <span>{area}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Challenges</h4>
                      <ul className="space-y-1">
                        {report.challenges.map((challenge, index) => (
                          <li key={index} className="text-sm text-muted-foreground flex items-start space-x-2">
                            <span className="text-orange-600 mt-1">•</span>
                            <span>{challenge}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Homework</h4>
                    <ul className="space-y-1">
                      {report.homework.map((task, index) => (
                        <li key={index} className="text-sm text-muted-foreground flex items-start space-x-2">
                          <span className="text-blue-600 mt-1">•</span>
                          <span>{task}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Recommendations</h4>
                    <ul className="space-y-1">
                      {report.recommendations.map((rec, index) => (
                        <li key={index} className="text-sm text-muted-foreground flex items-start space-x-2">
                          <span className="text-purple-600 mt-1">•</span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex space-x-2">
                    {!report.isShared && (
                      <Button
                        size="sm"
                        onClick={() => handleShareProgress(report.id)}
                        disabled={isLoading}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Share with Therapist
                      </Button>
                    )}
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Download Report
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Communication Tab */}
        <TabsContent value="communication" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MessageCircle className="h-5 w-5" />
                  <span>Secure Messaging</span>
                </CardTitle>
                <CardDescription>
                  Send secure messages to your therapist
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Select Therapist</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a therapist" />
                    </SelectTrigger>
                    <SelectContent>
                      {therapists.map((therapist) => (
                        <SelectItem key={therapist.id} value={therapist.id}>
                          {therapist.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Message</Label>
                  <Textarea
                    placeholder="Type your message here..."
                    rows={4}
                  />
                </div>
                <Button className="w-full">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Send Message
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Video className="h-5 w-5" />
                  <span>Video Sessions</span>
                </CardTitle>
                <CardDescription>
                  Join your scheduled video sessions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {appointments.filter(apt => apt.location === 'video' && apt.status === 'scheduled').map((appointment) => (
                    <div key={appointment.id} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{appointment.therapistName}</h4>
                          <p className="text-sm text-muted-foreground">
                            {new Date(appointment.date).toLocaleDateString()} at {appointment.time}
                          </p>
                        </div>
                        <Button size="sm">
                          <Video className="h-4 w-4 mr-2" />
                          Join
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="text-center text-sm text-muted-foreground">
                  No upcoming video sessions
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Booking Modal */}
      {showBookingModal && selectedTherapist && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Book Appointment</CardTitle>
              <CardDescription>
                Schedule a session with {selectedTherapist.name}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Session Type</Label>
                <Select value={bookingForm.type} onValueChange={(value: any) => setBookingForm({ ...bookingForm, type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="individual">Individual Therapy</SelectItem>
                    <SelectItem value="group">Group Therapy</SelectItem>
                    <SelectItem value="couples">Couples Therapy</SelectItem>
                    <SelectItem value="family">Family Therapy</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Date</Label>
                <Input
                  type="date"
                  value={bookingForm.date}
                  onChange={(e) => setBookingForm({ ...bookingForm, date: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Time</Label>
                <Select value={bookingForm.time} onValueChange={(value) => setBookingForm({ ...bookingForm, time: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="09:00">9:00 AM</SelectItem>
                    <SelectItem value="10:00">10:00 AM</SelectItem>
                    <SelectItem value="14:00">2:00 PM</SelectItem>
                    <SelectItem value="15:00">3:00 PM</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Session Location</Label>
                <Select value={bookingForm.location} onValueChange={(value: any) => setBookingForm({ ...bookingForm, location: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="video">Video Call</SelectItem>
                    <SelectItem value="phone">Phone Call</SelectItem>
                    <SelectItem value="in-person">In-Person</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Notes (Optional)</Label>
                <Textarea
                  value={bookingForm.notes}
                  onChange={(e) => setBookingForm({ ...bookingForm, notes: e.target.value })}
                  placeholder="Any specific topics or concerns you'd like to discuss..."
                  rows={3}
                />
              </div>

              <div className="flex space-x-2">
                <Button onClick={handleBookAppointment} disabled={isLoading} className="flex-1">
                  <Calendar className="h-4 w-4 mr-2" />
                  {isLoading ? 'Booking...' : 'Book Appointment'}
                </Button>
                <Button variant="outline" onClick={() => setShowBookingModal(false)} className="flex-1">
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
