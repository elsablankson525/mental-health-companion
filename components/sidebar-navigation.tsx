"use client"

import { Button } from "@/components/ui/button"
import { 
  MessageCircle, 
  BookOpen, 
  Heart, 
  BarChart3, 
  Sparkles, 
  Target, 
  Moon, 
  Users, 
  Settings, 
  Bell, 
  HelpCircle, 
  Database, 
  UserCheck, 
  TrendingUp,
  Home,
  X,
  LogOut,
  Shield
} from "lucide-react"
import { signOut, useSession } from "next-auth/react"

type Page = "home" | "chat" | "journal" | "mood" | "wellness" | "goals" | "sleep" | "medications" | "insights" | "community" | "settings" | "notifications" | "help" | "emergency" | "data" | "therapist" | "analytics"

interface SidebarNavigationProps {
  currentPage: Page
  setCurrentPage: (page: Page) => void
  onCrisisClick: () => void
  isCollapsed: boolean
  setIsCollapsed: (collapsed: boolean) => void
}

export default function SidebarNavigation({ 
  currentPage, 
  setCurrentPage, 
  onCrisisClick, 
  isCollapsed, 
  setIsCollapsed 
}: SidebarNavigationProps) {
  const { data: session } = useSession()

  // Primary navigation items - most important features
  const primaryNavItems = [
    { id: "home" as Page, label: "Dashboard", icon: Home },
    { id: "chat" as Page, label: "AI Chat", icon: MessageCircle },
    { id: "journal" as Page, label: "Journal", icon: BookOpen },
    { id: "mood" as Page, label: "Mood", icon: Heart },
  ]

  // Secondary navigation items - health tracking
  const healthNavItems = [
    { id: "wellness" as Page, label: "Wellness", icon: Sparkles },
    { id: "goals" as Page, label: "Goals", icon: Target },
    { id: "sleep" as Page, label: "Sleep", icon: Moon },
    { id: "insights" as Page, label: "Insights", icon: BarChart3 },
  ]

  // Tertiary navigation items - support and utilities
  const supportNavItems = [
    { id: "community" as Page, label: "Community", icon: Users },
    { id: "therapist" as Page, label: "Therapist", icon: UserCheck },
    { id: "notifications" as Page, label: "Reminders", icon: Bell },
    { id: "help" as Page, label: "Help", icon: HelpCircle },
  ]

  // Settings and utilities
  const utilityNavItems = [
    { id: "data" as Page, label: "Data & Privacy", icon: Database },
    { id: "analytics" as Page, label: "Analytics", icon: TrendingUp },
    { id: "settings" as Page, label: "Settings", icon: Settings },
  ]

  const handleSignOut = () => {
    signOut({ callbackUrl: "/auth/signin" })
  }

  const NavItem = ({ item, isActive }: { item: any, isActive: boolean }) => (
    <Button
      variant={isActive ? "default" : "ghost"}
      onClick={() => setCurrentPage(item.id)}
      className={`w-full justify-start h-12 px-4 transition-all duration-200 ${
        isActive 
          ? "bg-primary text-primary-foreground shadow-md" 
          : "hover:bg-accent/50 hover:text-accent-foreground"
      }`}
    >
      <item.icon className={`h-5 w-5 ${isCollapsed ? "" : "mr-3"}`} />
      {!isCollapsed && <span className="font-medium">{item.label}</span>}
    </Button>
  )

  return (
    <>
      {/* Mobile Overlay */}
      {!isCollapsed && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsCollapsed(true)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 z-50 h-full bg-card border-r border-border/50 backdrop-blur-md
        transition-all duration-300 ease-in-out
        ${isCollapsed ? "-translate-x-full lg:translate-x-0 lg:w-16" : "translate-x-0 w-72"}
        lg:relative lg:z-auto
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border/50">
            {!isCollapsed && (
              <div className="flex items-center space-x-3">
                <Heart className="h-8 w-8 text-primary" />
                <span className="font-bold text-xl text-foreground">Mental Health</span>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="lg:hidden"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
            {/* Primary Navigation */}
            <div className="space-y-2">
              {!isCollapsed && (
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  Main
                </h3>
              )}
              {primaryNavItems.map((item) => (
                <NavItem key={item.id} item={item} isActive={currentPage === item.id} />
              ))}
            </div>

            {/* Health Navigation */}
            <div className="space-y-2">
              {!isCollapsed && (
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  Health
                </h3>
              )}
              {healthNavItems.map((item) => (
                <NavItem key={item.id} item={item} isActive={currentPage === item.id} />
              ))}
            </div>

            {/* Support Navigation */}
            <div className="space-y-2">
              {!isCollapsed && (
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  Support
                </h3>
              )}
              {supportNavItems.map((item) => (
                <NavItem key={item.id} item={item} isActive={currentPage === item.id} />
              ))}
            </div>

            {/* Utility Navigation */}
            <div className="space-y-2">
              {!isCollapsed && (
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  Tools
                </h3>
              )}
              {utilityNavItems.map((item) => (
                <NavItem key={item.id} item={item} isActive={currentPage === item.id} />
              ))}
            </div>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-border/50 space-y-3">
            {/* Crisis Support Button */}
            <Button
              variant="destructive"
              onClick={onCrisisClick}
              className="w-full h-12 justify-start"
            >
              <Shield className="h-5 w-5 mr-3" />
              {!isCollapsed && <span className="font-medium">Crisis Support</span>}
            </Button>

            {/* User Info & Sign Out */}
            {!isCollapsed && session?.user?.name && (
              <div className="text-sm text-muted-foreground mb-2">
                Welcome, {session.user.name}
              </div>
            )}
            <Button
              variant="outline"
              onClick={handleSignOut}
              className="w-full h-10 justify-start"
            >
              <LogOut className="h-4 w-4 mr-3" />
              {!isCollapsed && <span>Sign Out</span>}
            </Button>
          </div>
        </div>
      </aside>
    </>
  )
}
