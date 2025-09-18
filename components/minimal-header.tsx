"use client"

import { Button } from "@/components/ui/button"
import { Menu, Bell, Search } from "lucide-react"

interface MinimalHeaderProps {
  onMenuClick: () => void
  currentPage: string
}

export default function MinimalHeader({ onMenuClick, currentPage }: MinimalHeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border/50">
      <div className="flex items-center justify-between h-16 px-6">
        {/* Left side - Menu button and page title */}
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onMenuClick}
            className="lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <div className="hidden sm:block">
            <h1 className="text-xl font-semibold text-foreground capitalize">
              {currentPage === "home" ? "Dashboard" : currentPage.replace("-", " ")}
            </h1>
          </div>
        </div>

        {/* Right side - Search and notifications */}
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="sm" className="hidden sm:flex">
            <Search className="h-4 w-4" />
          </Button>
          
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="h-4 w-4" />
            <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full text-xs flex items-center justify-center text-white">
              3
            </span>
          </Button>
        </div>
      </div>
    </header>
  )
}
