"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface CalmingBackgroundProps {
  children: React.ReactNode
  variant?: 'gradient' | 'particles' | 'waves' | 'minimal'
  intensity?: 'low' | 'medium' | 'high'
  className?: string
}

export function CalmingBackground({
  children,
  variant = 'gradient',
  intensity = 'medium',
  className
}: CalmingBackgroundProps) {
  const intensityConfig = {
    low: 'opacity-30',
    medium: 'opacity-50',
    high: 'opacity-70'
  }

  const renderBackground = () => {
    switch (variant) {
      case 'gradient':
        return (
          <div className={cn(
            "absolute inset-0 bg-gradient-to-br from-calm/20 via-peace/10 to-hope/20",
            intensityConfig[intensity]
          )} />
        )
      
      case 'particles':
        return (
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className={cn(
                  "absolute rounded-full bg-primary/20 animate-float",
                  intensityConfig[intensity]
                )}
                style={{
                  width: Math.random() * 4 + 2 + 'px',
                  height: Math.random() * 4 + 2 + 'px',
                  left: Math.random() * 100 + '%',
                  top: Math.random() * 100 + '%',
                  animationDelay: Math.random() * 6 + 's',
                  animationDuration: (Math.random() * 4 + 4) + 's'
                }}
              />
            ))}
          </div>
        )
      
      case 'waves':
        return (
          <div className="absolute inset-0 overflow-hidden">
            <svg
              className="absolute bottom-0 w-full h-32"
              viewBox="0 0 1200 120"
              preserveAspectRatio="none"
            >
              <path
                d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z"
                fill="currentColor"
                className={cn("text-primary/10 animate-pulse", intensityConfig[intensity])}
              />
              <path
                d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z"
                fill="currentColor"
                className={cn("text-secondary/10 animate-pulse", intensityConfig[intensity])}
                style={{ animationDelay: '1s' }}
              />
            </svg>
          </div>
        )
      
      case 'minimal':
        return (
          <div className={cn(
            "absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent",
            intensityConfig[intensity]
          )} />
        )
      
      default:
        return null
    }
  }

  return (
    <div className={cn("relative min-h-screen", className)}>
      {renderBackground()}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}

interface FloatingElementProps {
  children: React.ReactNode
  delay?: number
  duration?: number
  className?: string
}

export function FloatingElement({
  children,
  delay = 0,
  duration = 6,
  className
}: FloatingElementProps) {
  return (
    <div
      className={cn("animate-float", className)}
      style={{
        animationDelay: `${delay}s`,
        animationDuration: `${duration}s`
      }}
    >
      {children}
    </div>
  )
}

interface BreathingElementProps {
  children: React.ReactNode
  delay?: number
  duration?: number
  className?: string
}

export function BreathingElement({
  children,
  delay = 0,
  duration = 4,
  className
}: BreathingElementProps) {
  return (
    <div
      className={cn("animate-breathe", className)}
      style={{
        animationDelay: `${delay}s`,
        animationDuration: `${duration}s`
      }}
    >
      {children}
    </div>
  )
}

interface PulseElementProps {
  children: React.ReactNode
  delay?: number
  duration?: number
  className?: string
}

export function PulseElement({
  children,
  delay = 0,
  duration = 3,
  className
}: PulseElementProps) {
  return (
    <div
      className={cn("animate-soft-pulse", className)}
      style={{
        animationDelay: `${delay}s`,
        animationDuration: `${duration}s`
      }}
    >
      {children}
    </div>
  )
}
