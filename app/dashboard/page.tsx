"use client"

import { useState } from "react"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MessageCircle, BookOpen, Heart, Sparkles, Target, Moon, Users, Settings, ArrowRight } from "lucide-react"
import ChatInterface from "@/components/chat-interface"
import JournalPage from "@/components/journal-page"
import MoodTracker from "@/components/mood-tracker"
import InsightsDashboard from "@/components/insights-dashboard"
import WellnessActivities from "@/components/wellness-activities"
import GoalsTracker from "@/components/goals-tracker"
import SleepTracker from "@/components/sleep-tracker"
import MedicationReminder from "@/components/medication-reminder"
import CommunitySupport from "@/components/community-support"
import NotificationsReminders from "@/components/notifications-reminders"
import HelpSupport from "@/components/help-support"
import EmergencyCrisisResources from "@/components/emergency-crisis-resources"
import DataExportPrivacy from "@/components/data-export-privacy"
import TherapistProfessionalIntegration from "@/components/therapist-professional-integration"
import ProgressReportsAnalytics from "@/components/progress-reports-analytics"
import UserProfileSettings from "@/components/user-profile-settings"
import CrisisModal from "@/components/crisis-modal"
import SidebarNavigation from "@/components/sidebar-navigation"
import MinimalHeader from "@/components/minimal-header"
import AuthGuard from "@/components/auth-guard"

type Page = "home" | "chat" | "journal" | "mood" | "wellness" | "goals" | "sleep" | "medications" | "community" | "insights" | "notifications" | "help" | "emergency" | "data" | "therapist" | "analytics" | "settings"

export default function Dashboard() {
  const [currentPage, setCurrentPage] = useState<Page>("home")
  const [showCrisisModal, setShowCrisisModal] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const renderPage = () => {
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
        return <DashboardHome setCurrentPage={setCurrentPage} />
    }
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background flex">
        <SidebarNavigation
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          onCrisisClick={() => setShowCrisisModal(true)}
          isCollapsed={sidebarCollapsed}
          setIsCollapsed={setSidebarCollapsed}
        />

        <div className="flex-1 flex flex-col">
          <MinimalHeader
            onMenuClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            currentPage={currentPage}
          />

          <main className="flex-1 p-6">
            {renderPage()}
          </main>
        </div>

        <CrisisModal isOpen={showCrisisModal} onClose={() => setShowCrisisModal(false)} />
      </div>
    </AuthGuard>
  )
}

function DashboardHome({ setCurrentPage }: { setCurrentPage: (page: Page) => void }) {
  // Only show the most essential features on the main dashboard
  const quickActions = [
    { id: "chat" as Page, icon: MessageCircle, title: "AI Chat", description: "Talk to your AI companion", color: "text-primary", bgColor: "bg-primary/10" },
    { id: "journal" as Page, icon: BookOpen, title: "Journal", description: "Write your thoughts", color: "text-secondary", bgColor: "bg-secondary/10" },
    { id: "mood" as Page, icon: Heart, title: "Mood Check", description: "Track how you feel", color: "text-accent", bgColor: "bg-accent/10" },
    { id: "wellness" as Page, icon: Sparkles, title: "Wellness", description: "Guided activities", color: "text-purple-500", bgColor: "bg-purple-500/10" },
  ]

  const recentActivities = [
    { title: "Morning mood check", time: "2 hours ago", type: "mood" },
    { title: "Journal entry", time: "Yesterday", type: "journal" },
    { title: "Meditation session", time: "2 days ago", type: "wellness" },
  ]

  const moodOptions = ["😊 Great", "😌 Good", "😐 Okay", "😔 Not great", "😢 Struggling"]

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Welcome Section */}
      <div className="text-center space-y-4 py-6">
        <h1 className="text-4xl font-bold text-foreground">
          Welcome back! 👋
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          How are you feeling today? Let's take a moment to check in with yourself.
        </p>
      </div>

      {/* Quick Mood Check */}
      <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-2xl">Quick Check-in</CardTitle>
          <CardDescription className="text-base">How are you feeling right now?</CardDescription>
        </CardHeader>
        <div className="px-6 pb-6">
          <div className="flex flex-wrap justify-center gap-3">
            {moodOptions.map((mood) => (
              <Button 
                key={mood} 
                variant="outline" 
                onClick={() => setCurrentPage("mood")} 
                className="text-base px-4 py-2 hover:bg-primary hover:text-primary-foreground transition-all duration-200"
              >
                {mood}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      {/* Quick Actions */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-foreground">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <Card 
              key={action.id} 
              className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105 group"
              onClick={() => setCurrentPage(action.id)}
            >
              <CardHeader className="text-center p-6">
                <div className={`w-12 h-12 ${action.bgColor} rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-200`}>
                  <action.icon className={`h-6 w-6 ${action.color}`} />
                </div>
                <CardTitle className="text-lg">{action.title}</CardTitle>
                <CardDescription className="text-sm">{action.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent Activity & Insights */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Recent Activity
              <Button variant="ghost" size="sm" onClick={() => setCurrentPage("insights")}>
                View All
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </CardTitle>
          </CardHeader>
          <div className="px-6 pb-6 space-y-3">
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div>
                  <p className="font-medium text-sm">{activity.title}</p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
                <Badge variant="outline" className="text-xs">
                  {activity.type}
                </Badge>
              </div>
            ))}
          </div>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle>This Week</CardTitle>
            <CardDescription>Your mental health progress</CardDescription>
          </CardHeader>
          <div className="px-6 pb-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Mood entries</span>
              <span className="font-semibold">5/7 days</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Journal entries</span>
              <span className="font-semibold">3 this week</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Wellness activities</span>
              <span className="font-semibold">2 completed</span>
            </div>
            <div className="pt-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setCurrentPage("insights")}
                className="w-full"
              >
                View Detailed Insights
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* More Features */}
      <Card className="bg-muted/30">
        <CardHeader className="text-center">
          <CardTitle>Explore More Features</CardTitle>
          <CardDescription>Discover additional tools to support your mental health journey</CardDescription>
        </CardHeader>
        <div className="px-6 pb-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setCurrentPage("goals")}
              className="h-auto p-3 flex flex-col items-center space-y-1"
            >
              <Target className="h-5 w-5" />
              <span className="text-xs">Goals</span>
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setCurrentPage("sleep")}
              className="h-auto p-3 flex flex-col items-center space-y-1"
            >
              <Moon className="h-5 w-5" />
              <span className="text-xs">Sleep</span>
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setCurrentPage("community")}
              className="h-auto p-3 flex flex-col items-center space-y-1"
            >
              <Users className="h-5 w-5" />
              <span className="text-xs">Community</span>
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setCurrentPage("settings")}
              className="h-auto p-3 flex flex-col items-center space-y-1"
            >
              <Settings className="h-5 w-5" />
              <span className="text-xs">Settings</span>
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
