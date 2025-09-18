"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { 
  HelpCircle, 
  Search, 
  BookOpen, 
  MessageCircle, 
  Mail, 
  Phone, 
  Video, 
  FileText, 
  ExternalLink,
  CheckCircle,
  AlertTriangle,
  Info,
  Users,
  Shield,
  Clock,
  Star,
  Play,
  Download,
  Send,
  Heart,
  Brain,
  Zap,
  Target,
  Moon,
  Pill,
  Sparkles
} from "lucide-react"

interface FAQ {
  id: string
  question: string
  answer: string
  category: string
  tags: string[]
  helpful: number
  notHelpful: number
}

interface Tutorial {
  id: string
  title: string
  description: string
  duration: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  category: string
  videoUrl?: string
  steps: string[]
  icon: any
}

// interface SupportTicket {
//   id: string
//   subject: string
//   description: string
//   category: string
//   priority: 'low' | 'medium' | 'high' | 'urgent'
//   status: 'open' | 'in-progress' | 'resolved' | 'closed'
//   createdAt: string
//   updatedAt: string
// }

const faqCategories = [
  { id: 'getting-started', label: 'Getting Started', icon: Play },
  { id: 'features', label: 'Features', icon: Zap },
  { id: 'account', label: 'Account & Settings', icon: Users },
  { id: 'privacy', label: 'Privacy & Security', icon: Shield },
  { id: 'troubleshooting', label: 'Troubleshooting', icon: AlertTriangle },
  { id: 'billing', label: 'Billing & Plans', icon: FileText }
]

const tutorialCategories = [
  { id: 'mood-tracking', label: 'Mood Tracking', icon: Heart, color: 'text-red-600' },
  { id: 'journaling', label: 'Journaling', icon: BookOpen, color: 'text-blue-600' },
  { id: 'ai-companion', label: 'AI Companion', icon: Brain, color: 'text-purple-600' },
  { id: 'wellness', label: 'Wellness Activities', icon: Sparkles, color: 'text-green-600' },
  { id: 'goals', label: 'Goals & Progress', icon: Target, color: 'text-orange-600' },
  { id: 'sleep', label: 'Sleep Tracking', icon: Moon, color: 'text-indigo-600' },
  { id: 'medications', label: 'Medications', icon: Pill, color: 'text-teal-600' }
]

export default function HelpSupport() {
  const [activeTab, setActiveTab] = useState("faq")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  // Database-connected state
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [tutorials, setTutorials] = useState<Tutorial[]>([])

  // Load data from API
  useEffect(() => {
    loadHelpData()
  }, [])

  const loadHelpData = async () => {
    try {
      // Load FAQs
      const faqRes = await fetch('/api/help/faqs')
      if (faqRes.ok) {
        const faqData = await faqRes.json()
        setFaqs(faqData)
      } else {
        // Fallback to default FAQs if API fails
        setFaqs(getDefaultFAQs())
      }

      // Load tutorials
      const tutorialRes = await fetch('/api/help/tutorials')
      if (tutorialRes.ok) {
        const tutorialData = await tutorialRes.json()
        setTutorials(tutorialData)
      } else {
        // Fallback to default tutorials if API fails
        setTutorials(getDefaultTutorials())
      }
    } catch (error) {
      console.error('Error loading help data:', error)
      // Use fallback data
      setFaqs(getDefaultFAQs())
      setTutorials(getDefaultTutorials())
    }
  }

  const getDefaultFAQs = (): FAQ[] => [
    {
      id: "1",
      question: "How do I get started with mood tracking?",
      answer: "To start tracking your mood, go to the Mood tab in your dashboard. You can log your current mood by selecting from the emoji options or using the mood scale. Add notes about what's affecting your mood and any triggers you've noticed. The app will help you identify patterns over time.",
      category: "getting-started",
      tags: ["mood", "tracking", "beginner"],
      helpful: 45,
      notHelpful: 2
    },
    {
      id: "2",
      question: "Is my data secure and private?",
      answer: "Yes, your data is encrypted and stored securely. We follow HIPAA-compliant practices and never share your personal information without your explicit consent. You can control your privacy settings in the Settings tab and export or delete your data at any time.",
      category: "privacy",
      tags: ["privacy", "security", "data"],
      helpful: 38,
      notHelpful: 1
    },
    {
      id: "3",
      question: "How does the AI companion work?",
      answer: "Our AI companion uses advanced natural language processing to provide empathetic responses and support. It's trained on mental health best practices and can help you process emotions, provide coping strategies, and offer encouragement. Remember, it's not a replacement for professional therapy.",
      category: "features",
      tags: ["ai", "companion", "chat"],
      helpful: 52,
      notHelpful: 3
    },
    {
      id: "4",
      question: "Can I use this app without an internet connection?",
      answer: "Some features work offline, including mood tracking and journaling. However, the AI companion and data synchronization require an internet connection. Your offline data will sync when you're back online.",
      category: "troubleshooting",
      tags: ["offline", "sync", "connection"],
      helpful: 29,
      notHelpful: 4
    },
    {
      id: "5",
      question: "How do I set up medication reminders?",
      answer: "Go to the Reminders tab and click 'Add Reminder'. Select 'Medication' as the type, set your preferred time, and choose which days you want to be reminded. You can also add notes about dosage and instructions.",
      category: "features",
      tags: ["medications", "reminders", "health"],
      helpful: 41,
      notHelpful: 2
    },
    {
      id: "6",
      question: "What should I do if I'm having a mental health crisis?",
      answer: "If you're experiencing a mental health crisis, please seek immediate professional help. Call 988 (Suicide & Crisis Lifeline), 911, or go to your nearest emergency room. This app is not a substitute for emergency mental health care.",
      category: "troubleshooting",
      tags: ["crisis", "emergency", "help"],
      helpful: 67,
      notHelpful: 0
    }
  ]

  const getDefaultTutorials = (): Tutorial[] => [
    {
      id: "1",
      title: "Getting Started with Mood Tracking",
      description: "Learn how to effectively track your mood and identify patterns in your emotional well-being.",
      duration: "5 min",
      difficulty: "beginner",
      category: "mood-tracking",
      steps: [
        "Navigate to the Mood tab in your dashboard",
        "Select your current mood from the emoji options",
        "Add notes about what's affecting your mood",
        "Review your mood history to identify patterns",
        "Set up daily mood check-in reminders"
      ],
      icon: Heart
    },
    {
      id: "2",
      title: "Journaling for Mental Health",
      description: "Discover how to use journaling as a tool for self-reflection and emotional processing.",
      duration: "8 min",
      difficulty: "beginner",
      category: "journaling",
      steps: [
        "Open the Journal tab from your dashboard",
        "Create a new journal entry",
        "Write freely about your thoughts and feelings",
        "Use prompts to guide your writing",
        "Review past entries to track your progress"
      ],
      icon: BookOpen
    },
    {
      id: "3",
      title: "Using the AI Companion",
      description: "Learn how to have meaningful conversations with your AI mental health companion.",
      duration: "6 min",
      difficulty: "beginner",
      category: "ai-companion",
      steps: [
        "Go to the Chat tab in your dashboard",
        "Start a conversation with the AI companion",
        "Share your thoughts and feelings openly",
        "Ask for coping strategies and support",
        "Use the companion for daily check-ins"
      ],
      icon: Brain
    },
    {
      id: "4",
      title: "Setting Up Wellness Activities",
      description: "Explore guided meditations, breathing exercises, and mindfulness practices.",
      duration: "10 min",
      difficulty: "intermediate",
      category: "wellness",
      steps: [
        "Navigate to the Wellness tab",
        "Browse available activities and exercises",
        "Start with beginner-friendly meditations",
        "Set up regular wellness reminders",
        "Track your wellness activity progress"
      ],
      icon: Sparkles
    }
  ]

  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    category: '',
    subject: '',
    message: '',
    priority: 'medium'
  })

  const filteredFAQs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      const response = await fetch('/api/help/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contactForm)
      })

      if (response.ok) {
        setMessage({ type: 'success', text: 'Your message has been sent! We\'ll get back to you within 24 hours.' })
        setContactForm({
          name: '',
          email: '',
          category: '',
          subject: '',
          message: '',
          priority: 'medium'
        })
      } else {
        const errorData = await response.json()
        setMessage({ type: 'error', text: errorData.error || 'Failed to send message. Please try again.' })
      }
    } catch (error) {
      console.error('Error submitting contact form:', error)
      setMessage({ type: 'error', text: 'Failed to send message. Please try again.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800 border-green-200'
      case 'intermediate': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'advanced': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }


  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-2">
          <HelpCircle className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">Help & Support</h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Find answers to common questions, learn how to use our features, and get the support you need for your mental health journey.
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

      {/* Search Bar */}
      <Card>
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search for help articles, FAQs, or tutorials..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="faq" className="flex items-center space-x-2">
            <HelpCircle className="h-4 w-4" />
            <span>FAQ</span>
          </TabsTrigger>
          <TabsTrigger value="tutorials" className="flex items-center space-x-2">
            <BookOpen className="h-4 w-4" />
            <span>Tutorials</span>
          </TabsTrigger>
          <TabsTrigger value="contact" className="flex items-center space-x-2">
            <MessageCircle className="h-4 w-4" />
            <span>Contact</span>
          </TabsTrigger>
          <TabsTrigger value="resources" className="flex items-center space-x-2">
            <ExternalLink className="h-4 w-4" />
            <span>Resources</span>
          </TabsTrigger>
        </TabsList>

        {/* FAQ Tab */}
        <TabsContent value="faq" className="space-y-6">
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('all')}
            >
              All Categories
            </Button>
            {faqCategories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                className="flex items-center space-x-2"
              >
                <category.icon className="h-4 w-4" />
                <span>{category.label}</span>
              </Button>
            ))}
          </div>

          {/* FAQ Results */}
          <div className="space-y-4">
            {filteredFAQs.length > 0 ? (
              <Accordion type="single" collapsible className="space-y-4">
                {filteredFAQs.map((faq) => (
                  <AccordionItem key={faq.id} value={faq.id} className="border rounded-lg px-6">
                    <AccordionTrigger className="text-left">
                      <div className="flex items-center space-x-3">
                        <div className="flex-1">
                          <h3 className="font-semibold">{faq.question}</h3>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {faqCategories.find(c => c.id === faq.category)?.label}
                            </Badge>
                            <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                              <Star className="h-3 w-3" />
                              <span>{faq.helpful} helpful</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4">
                        <p className="text-muted-foreground">{faq.answer}</p>
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <Button variant="outline" size="sm">
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Helpful ({faq.helpful})
                            </Button>
                            <Button variant="outline" size="sm">
                              <AlertTriangle className="h-4 w-4 mr-1" />
                              Not Helpful ({faq.notHelpful})
                            </Button>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {faq.tags.map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                #{tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <HelpCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No results found</h3>
                  <p className="text-muted-foreground mb-4">
                    Try adjusting your search terms or browse different categories.
                  </p>
                  <Button onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}>
                    Clear Filters
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Tutorials Tab */}
        <TabsContent value="tutorials" className="space-y-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tutorials.map((tutorial) => {
              const categoryInfo = tutorialCategories.find(c => c.id === tutorial.category)
              const IconComponent = tutorial.icon
              
              return (
                <Card key={tutorial.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-lg bg-gray-100 ${categoryInfo?.color}`}>
                        <IconComponent className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg">{tutorial.title}</CardTitle>
                        <CardDescription className="mt-2">
                          {tutorial.description}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">{tutorial.duration}</span>
                        </div>
                        <Badge className={getDifficultyColor(tutorial.difficulty)}>
                          {tutorial.difficulty}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm">Steps:</h4>
                        <ol className="text-sm text-muted-foreground space-y-1">
                          {tutorial.steps.slice(0, 3).map((step, index) => (
                            <li key={index} className="flex items-start space-x-2">
                              <span className="font-medium text-primary">{index + 1}.</span>
                              <span>{step}</span>
                            </li>
                          ))}
                          {tutorial.steps.length > 3 && (
                            <li className="text-xs text-muted-foreground">
                              +{tutorial.steps.length - 3} more steps
                            </li>
                          )}
                        </ol>
                      </div>

                      <Button className="w-full">
                        <Play className="h-4 w-4 mr-2" />
                        Start Tutorial
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        {/* Contact Tab */}
        <TabsContent value="contact" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MessageCircle className="h-5 w-5" />
                  <span>Get in Touch</span>
                </CardTitle>
                <CardDescription>
                  We're here to help you with any questions or concerns
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-blue-100">
                      <Mail className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">Email Support</h4>
                      <p className="text-sm text-muted-foreground">support@mentalhealthcompanion.com</p>
                      <p className="text-xs text-muted-foreground">Response within 24 hours</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-green-100">
                      <MessageCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">Live Chat</h4>
                      <p className="text-sm text-muted-foreground">Available 9 AM - 6 PM EST</p>
                      <p className="text-xs text-muted-foreground">Monday - Friday</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-purple-100">
                      <Phone className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">Phone Support</h4>
                      <p className="text-sm text-muted-foreground">1-800-MENTAL-1</p>
                      <p className="text-xs text-muted-foreground">24/7 Crisis Support</p>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <h4 className="font-medium">Emergency Resources</h4>
                  <p className="text-sm text-muted-foreground">
                    If you're experiencing a mental health crisis, please contact:
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• 988 Suicide & Crisis Lifeline</li>
                    <li>• 911 for immediate emergency</li>
                    <li>• Your local emergency room</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Contact Form */}
            <Card>
              <CardHeader>
                <CardTitle>Send us a Message</CardTitle>
                <CardDescription>
                  Fill out the form below and we'll get back to you as soon as possible
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name *</Label>
                      <Input
                        id="name"
                        value={contactForm.name}
                        onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={contactForm.email}
                        onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Select value={contactForm.category} onValueChange={(value) => setContactForm({ ...contactForm, category: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="general">General Question</SelectItem>
                          <SelectItem value="technical">Technical Issue</SelectItem>
                          <SelectItem value="billing">Billing & Account</SelectItem>
                          <SelectItem value="feature">Feature Request</SelectItem>
                          <SelectItem value="bug">Bug Report</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="priority">Priority</Label>
                      <Select value={contactForm.priority} onValueChange={(value) => setContactForm({ ...contactForm, priority: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject *</Label>
                    <Input
                      id="subject"
                      value={contactForm.subject}
                      onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message *</Label>
                    <Textarea
                      id="message"
                      value={contactForm.message}
                      onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                      rows={4}
                      required
                    />
                  </div>

                  <Button type="submit" disabled={isSubmitting} className="w-full">
                    <Send className="h-4 w-4 mr-2" />
                    {isSubmitting ? 'Sending...' : 'Send Message'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Resources Tab */}
        <TabsContent value="resources" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Mental Health Resources */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Heart className="h-5 w-5" />
                  <span>Mental Health Resources</span>
                </CardTitle>
                <CardDescription>
                  External resources and organizations that can help
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium">National Suicide Prevention Lifeline</h4>
                      <p className="text-sm text-muted-foreground">988 or 1-800-273-8255</p>
                    </div>
                    <Button variant="outline" size="sm">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Crisis Text Line</h4>
                      <p className="text-sm text-muted-foreground">Text HOME to 741741</p>
                    </div>
                    <Button variant="outline" size="sm">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium">National Alliance on Mental Illness</h4>
                      <p className="text-sm text-muted-foreground">nami.org</p>
                    </div>
                    <Button variant="outline" size="sm">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Mental Health America</h4>
                      <p className="text-sm text-muted-foreground">mhanational.org</p>
                    </div>
                    <Button variant="outline" size="sm">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* App Resources */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Info className="h-5 w-5" />
                  <span>App Resources</span>
                </CardTitle>
                <CardDescription>
                  Documentation and guides for using our app
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium">User Guide</h4>
                      <p className="text-sm text-muted-foreground">Complete guide to all features</p>
                    </div>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Privacy Policy</h4>
                      <p className="text-sm text-muted-foreground">How we protect your data</p>
                    </div>
                    <Button variant="outline" size="sm">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Terms of Service</h4>
                      <p className="text-sm text-muted-foreground">App usage terms and conditions</p>
                    </div>
                    <Button variant="outline" size="sm">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Video Tutorials</h4>
                      <p className="text-sm text-muted-foreground">Step-by-step video guides</p>
                    </div>
                    <Button variant="outline" size="sm">
                      <Video className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
