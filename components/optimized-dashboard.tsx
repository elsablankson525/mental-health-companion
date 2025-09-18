"use client"

import { useState, useCallback, memo, Suspense, lazy } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  MessageCircle, 
  BookOpen, 
  Heart, 
  BarChart3, 
  Sparkles, 
  Target, 
  Moon, 
  Pill, 
  Users, 
  Settings, 
  Bell, 
  HelpCircle, 
  Shield, 
  Database, 
  UserCheck, 
  TrendingUp 
} from "lucide-react"
import AuthGuard from "@/components/auth-guard"
import Navigation from "@/components/navigation"
import CrisisModal from "@/components/crisis-modal"

// Lazy load components for better performance
const ChatInterface = lazy(() => import("@/components/chat-interface"))
const JournalPage = lazy(() => import("@/components/journal-page"))
const MoodTracker = lazy(() => import("@/components/optimized-mood-tracker"))
const InsightsDashboard = lazy(() => import("@/components/insights-dashboard"))
const WellnessActivities = lazy(() => import("@/components/wellness-activities"))
const GoalsTracker = lazy(() => import("@/components/goals-tracker"))
const SleepTracker = lazy(() => import("@/components/sleep-tracker"))
const MedicationReminder = lazy(() => import("@/components/medication-reminder"))
const CommunitySupport = lazy(() => import("@/components/community-support"))
const NotificationsReminders = lazy(() => import("@/components/notifications-reminders"))
const HelpSupport = lazy(() => import("@/components/help-support"))
const EmergencyCrisisResources = lazy(() => import("@/components/emergency-crisis-resources"))
const DataExportPrivacy = lazy(() => import("@/components/data-export-privacy"))
const TherapistProfessionalIntegration = lazy(() => import("@/components/therapist-professional-integration"))
const ProgressReportsAnalytics = lazy(() => import("@/components/progress-reports-analytics"))
const UserProfileSettings = lazy(() => import("@/components/user-profile-settings"))

type Page = "home" | "chat" | "journal" | "mood" | "wellness" | "goals" | "sleep" | "medications" | "community" | "insights" | "notifications" | "help" | "emergency" | "data" | "therapist" | "analytics" | "settings"

// Loading skeleton component
const PageSkeleton = memo(() => (
  <div className="max-w-4xl mx-auto space-y-6">
    <div className="space-y-4">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-4 w-96" />
    </div>
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
))

PageSkeleton.displayName = "PageSkeleton"

// Memoized feature card component
const FeatureCard = memo(({ 
  icon: Icon, 
  title, 
  description, 
  onClick, 
  color 
}: { 
  icon: any
  title: string
  description: string
  onClick: () => void
  color: string 
}) => (
  <Card 
    className="cursor-pointer hover:shadow-lg" 
    onClick={onClick}
  >
    <CardHeader className="text-center">
      <Icon className={`h-12 w-12 ${color} mx-auto mb-2`} />
      <CardTitle className="text-lg">{title}</CardTitle>
      <CardDescription className="text-sm">{description}</CardDescription>
    </CardHeader>
  </Card>
))

FeatureCard.displayName = "FeatureCard"

// Memoized quick action button
const QuickActionButton = memo(({ 
  mood, 
  onClick 
}: { 
  mood: string
  onClick: () => void 
}) => (
  <Button 
    variant="outline" 
    onClick={onClick} 
    className="text-sm hover:bg-primary hover:text-primary-foreground"
  >
    {mood}
  </Button>
))

QuickActionButton.displayName = "QuickActionButton"

// Main dashboard component
export default function OptimizedDashboard() {
  const [currentPage, setCurrentPage] = useState<Page>("home")
  const [showCrisisModal, setShowCrisisModal] = useState(false)

  // Memoized page change handler
  const handlePageChange = useCallback((page: Page) => {
    setCurrentPage(page)
  }, [])

  // Memoized crisis modal handlers
  const handleCrisisClick = useCallback(() => {
    setShowCrisisModal(true)
  }, [])

  const handleCrisisClose = useCallback(() => {
    setShowCrisisModal(false)
  }, [])



  // Render page content with lazy loading
  const renderPage = useCallback(() => {
    
    switch (currentPage) {
      case "chat":
        return <ChatInterface />
      case "journal":
        return <JournalPage />
      case "mood":
        return <MoodTracker />
      case "wellness":
        return <WellnessActivities />
      case "goals":
        return <GoalsTracker />
      case "sleep":
        return <SleepTracker />
      case "medications":
        return <MedicationReminder />
      case "community":
        return <CommunitySupport />
      case "insights":
        return <InsightsDashboard />
      case "notifications":
        return <NotificationsReminders />
      case "help":
        return <HelpSupport />
      case "emergency":
        return <EmergencyCrisisResources />
      case "data":
        return <DataExportPrivacy />
      case "therapist":
        return <TherapistProfessionalIntegration />
      case "analytics":
        return <ProgressReportsAnalytics />
      case "settings":
        return <UserProfileSettings />
      default:
        return <DashboardHome setCurrentPage={handlePageChange} />
    }
  }, [currentPage, handlePageChange])

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <Navigation
          currentPage={currentPage}
          setCurrentPage={handlePageChange}
          onCrisisClick={handleCrisisClick}
        />

        <main className="container mx-auto px-4 py-8">
          <Suspense fallback={<PageSkeleton />}>
            {renderPage()}
          </Suspense>
        </main>

        <CrisisModal isOpen={showCrisisModal} onClose={handleCrisisClose} />
      </div>
    </AuthGuard>
  )
}

// Memoized dashboard home component
const DashboardHome = memo(({ setCurrentPage }: { setCurrentPage: (page: Page) => void }) => {
  const handleFeatureClick = useCallback((page: Page) => {
    setCurrentPage(page)
  }, [setCurrentPage])

  const handleQuickMood = useCallback(() => {
    setCurrentPage("mood")
  }, [setCurrentPage])

  const featureCards = [
    {
      icon: MessageCircle,
      title: "AI Companion",
      description: "Chat with our empathetic AI for support and guidance",
      color: "text-primary",
      page: "chat" as Page
    },
    {
      icon: BookOpen,
      title: "Journal",
      description: "Write down your thoughts and feelings in a safe space",
      color: "text-secondary",
      page: "journal" as Page
    },
    {
      icon: Heart,
      title: "Mood Tracker",
      description: "Track your daily mood and emotional patterns",
      color: "text-accent",
      page: "mood" as Page
    },
    {
      icon: Sparkles,
      title: "Wellness Activities",
      description: "Guided meditations, breathing exercises, and mindfulness practices",
      color: "text-purple-500",
      page: "wellness" as Page
    },
    {
      icon: Target,
      title: "Goals & Progress",
      description: "Set and track your mental health goals with milestones",
      color: "text-orange-500",
      page: "goals" as Page
    },
    {
      icon: Moon,
      title: "Sleep Tracker",
      description: "Monitor your sleep patterns and improve sleep quality",
      color: "text-blue-500",
      page: "sleep" as Page
    },
    {
      icon: Pill,
      title: "Medications",
      description: "Track medications and manage healthcare appointments",
      color: "text-green-500",
      page: "medications" as Page
    },
    {
      icon: Users,
      title: "Community Support",
      description: "Connect with others, join support groups, and share experiences",
      color: "text-blue-600",
      page: "community" as Page
    },
    {
      icon: BarChart3,
      title: "Insights",
      description: "View your mental health trends and progress",
      color: "text-chart-1",
      page: "insights" as Page
    },
    {
      icon: Bell,
      title: "Reminders",
      description: "Set up medication, mood, and wellness reminders",
      color: "text-yellow-600",
      page: "notifications" as Page
    },
    {
      icon: HelpCircle,
      title: "Help & Support",
      description: "FAQs, tutorials, and contact support",
      color: "text-indigo-600",
      page: "help" as Page
    },
    {
      icon: Shield,
      title: "Emergency Resources",
      description: "Emergency contacts, crisis resources, and safety planning",
      color: "text-red-600",
      page: "emergency" as Page
    },
    {
      icon: Database,
      title: "Data & Privacy",
      description: "Export your data and manage privacy settings",
      color: "text-blue-600",
      page: "data" as Page
    },
    {
      icon: UserCheck,
      title: "Therapist Integration",
      description: "Connect with mental health professionals",
      color: "text-green-600",
      page: "therapist" as Page
    },
    {
      icon: TrendingUp,
      title: "Progress Analytics",
      description: "Detailed insights and progress reports",
      color: "text-purple-600",
      page: "analytics" as Page
    },
    {
      icon: Settings,
      title: "Settings",
      description: "Manage your profile, privacy, and preferences",
      color: "text-gray-600",
      page: "settings" as Page
    }
  ]

  const quickMoods = ["😊 Great", "😌 Good", "😐 Okay", "😔 Not great", "😢 Struggling"]

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-foreground">Welcome to Your Dashboard</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          A safe, empathetic space for mental health support. Track your mood, journal your thoughts, and chat with our
          AI companion. Remember, this is not a substitute for professional therapy.
        </p>
        <Badge variant="outline" className="text-sm">
          Not a medical professional • Seek professional help when needed
        </Badge>
      </div>

      {/* Feature Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {featureCards.map((feature) => (
          <FeatureCard
            key={feature.page}
            icon={feature.icon}
            title={feature.title}
            description={feature.description}
            color={feature.color}
            onClick={() => handleFeatureClick(feature.page)}
          />
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-card rounded-lg p-6 space-y-4">
        <h2 className="text-2xl font-semibold text-card-foreground">Quick Check-in</h2>
        <p className="text-muted-foreground">How are you feeling today?</p>
        <div className="flex flex-wrap gap-2">
          {quickMoods.map((mood) => (
            <QuickActionButton
              key={mood}
              mood={mood}
              onClick={handleQuickMood}
            />
          ))}
        </div>
      </div>
    </div>
  )
})

DashboardHome.displayName = "DashboardHome"
