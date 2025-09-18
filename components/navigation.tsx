"use client"

import { Button } from "@/components/ui/button"
import { MessageCircle, BookOpen, Heart, BarChart3, AlertTriangle, Home, LogOut, Sparkles, Target, Moon, Pill, Users, Settings, Bell, HelpCircle, Database, UserCheck, TrendingUp } from "lucide-react"
import { signOut, useSession } from "next-auth/react"

type Page = "home" | "chat" | "journal" | "mood" | "wellness" | "goals" | "sleep" | "medications" | "insights" | "community" | "settings" | "notifications" | "help" | "emergency" | "data" | "therapist" | "analytics"

interface NavigationProps {
  currentPage: Page
  setCurrentPage: (page: Page) => void
  onCrisisClick: () => void
}

export default function Navigation({ currentPage, setCurrentPage, onCrisisClick }: NavigationProps) {
  const { data: session } = useSession()
  
  // Group navigation items by category for better organization
  const primaryNavItems = [
    { id: "home" as Page, label: "Home", icon: Home },
    { id: "chat" as Page, label: "Chat", icon: MessageCircle },
    { id: "journal" as Page, label: "Journal", icon: BookOpen },
    { id: "mood" as Page, label: "Mood", icon: Heart },
  ]

  const healthNavItems = [
    { id: "wellness" as Page, label: "Wellness", icon: Sparkles },
    { id: "goals" as Page, label: "Goals", icon: Target },
    { id: "sleep" as Page, label: "Sleep", icon: Moon },
    { id: "medications" as Page, label: "Medications", icon: Pill },
    { id: "insights" as Page, label: "Insights", icon: BarChart3 },
  ]

  const supportNavItems = [
    { id: "community" as Page, label: "Community", icon: Users },
    { id: "therapist" as Page, label: "Therapist", icon: UserCheck },
    { id: "help" as Page, label: "Help", icon: HelpCircle },
  ]

  const utilityNavItems = [
    { id: "notifications" as Page, label: "Reminders", icon: Bell },
    { id: "analytics" as Page, label: "Analytics", icon: TrendingUp },
    { id: "data" as Page, label: "Data", icon: Database },
    { id: "settings" as Page, label: "Settings", icon: Settings },
  ]

  const handleSignOut = () => {
    signOut({ callbackUrl: "/auth/signin" })
  }

  return (
    <nav className="glass border-b border-border/50 backdrop-blur-md sticky top-0 z-50">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          {/* Logo/Brand */}
          <div className="flex items-center space-x-3">
            <Heart className="h-8 w-8 text-primary" />
            <span className="font-bold text-xl text-foreground hidden sm:inline">Mental Health Companion</span>
          </div>

          {/* Main Navigation - Grouped by category */}
          <div className="hidden lg:flex items-center space-x-8">
            {/* Primary Features */}
            <div className="flex items-center space-x-2">
              {primaryNavItems.map(({ id, label, icon: Icon }) => (
                <Button
                  key={id}
                  variant={currentPage === id ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setCurrentPage(id)}
                  className={`flex items-center space-x-2 transition-all duration-300 hover-lift ${
                    currentPage === id 
                      ? "btn-support glow-soft" 
                      : "hover:bg-accent/20 hover:text-accent-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{label}</span>
                </Button>
              ))}
            </div>

            {/* Health Features */}
            <div className="flex items-center space-x-2">
              {healthNavItems.map(({ id, label, icon: Icon }) => (
                <Button
                  key={id}
                  variant={currentPage === id ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setCurrentPage(id)}
                  className={`flex items-center space-x-2 transition-all duration-300 hover-lift ${
                    currentPage === id 
                      ? "btn-support glow-soft" 
                      : "hover:bg-accent/20 hover:text-accent-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{label}</span>
                </Button>
              ))}
            </div>

            {/* Support Features */}
            <div className="flex items-center space-x-2">
              {supportNavItems.map(({ id, label, icon: Icon }) => (
                <Button
                  key={id}
                  variant={currentPage === id ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setCurrentPage(id)}
                  className={`flex items-center space-x-2 transition-all duration-300 hover-lift ${
                    currentPage === id 
                      ? "btn-support glow-soft" 
                      : "hover:bg-accent/20 hover:text-accent-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{label}</span>
                </Button>
              ))}
            </div>

            {/* Utility Features */}
            <div className="flex items-center space-x-2">
              {utilityNavItems.map(({ id, label, icon: Icon }) => (
                <Button
                  key={id}
                  variant={currentPage === id ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setCurrentPage(id)}
                  className={`flex items-center space-x-2 transition-all duration-300 hover-lift ${
                    currentPage === id 
                      ? "btn-support glow-soft" 
                      : "hover:bg-accent/20 hover:text-accent-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{label}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Mobile Navigation - Simplified */}
          <div className="flex lg:hidden items-center space-x-2 overflow-x-auto scrollbar-hide">
            {primaryNavItems.map(({ id, label, icon: Icon }) => (
              <Button
                key={id}
                variant={currentPage === id ? "default" : "ghost"}
                size="sm"
                onClick={() => setCurrentPage(id)}
                className={`flex items-center space-x-1 transition-all duration-300 hover-lift ${
                  currentPage === id 
                    ? "btn-support glow-soft" 
                    : "hover:bg-accent/20 hover:text-accent-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline text-xs">{label}</span>
              </Button>
            ))}
            {/* More button for mobile */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentPage("settings")}
              className="flex items-center space-x-1 hover:bg-accent/20 hover:text-accent-foreground"
            >
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline text-xs">More</span>
            </Button>
          </div>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            {session?.user?.name && (
              <span className="text-sm text-muted-foreground hidden xl:inline animate-soft-pulse">
                Welcome, {session.user.name}
              </span>
            )}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleSignOut} 
              className="flex items-center space-x-2 hover-lift glass"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={onCrisisClick} 
              className="flex items-center space-x-2 btn-crisis hover-lift"
            >
              <AlertTriangle className="h-4 w-4" />
              <span className="hidden sm:inline">Crisis</span>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}
