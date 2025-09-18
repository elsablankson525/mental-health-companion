"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface MoodIndicatorProps {
  mood: 'excellent' | 'good' | 'neutral' | 'poor' | 'terrible'
  size?: 'sm' | 'md' | 'lg'
  animated?: boolean
  className?: string
}

const moodConfig = {
  excellent: {
    emoji: '😊',
    label: 'Excellent',
    color: 'mood-excellent',
    gradient: 'from-chart-2 to-chart-3'
  },
  good: {
    emoji: '🙂',
    label: 'Good',
    color: 'mood-good',
    gradient: 'from-chart-3 to-chart-1'
  },
  neutral: {
    emoji: '😐',
    label: 'Neutral',
    color: 'mood-neutral',
    gradient: 'from-chart-1 to-chart-4'
  },
  poor: {
    emoji: '😔',
    label: 'Poor',
    color: 'mood-poor',
    gradient: 'from-chart-4 to-chart-5'
  },
  terrible: {
    emoji: '😢',
    label: 'Terrible',
    color: 'mood-terrible',
    gradient: 'from-chart-5 to-destructive'
  }
}

const sizeConfig = {
  sm: 'text-lg',
  md: 'text-2xl',
  lg: 'text-4xl'
}

export function MoodIndicator({ 
  mood, 
  size = 'md', 
  animated: _animated = true, 
  className 
}: MoodIndicatorProps) {
  const config = moodConfig[mood]
  
  return (
    <div 
      className={cn(
        "flex flex-col items-center justify-center space-y-2",
        className
      )}
    >
      <div 
        className={cn(
          "rounded-full p-3 bg-gradient-to-br",
          config.gradient,
          sizeConfig[size],
          "shadow-lg hover:shadow-xl"
        )}
      >
        <span className="block">{config.emoji}</span>
      </div>
      <span className="text-sm font-medium text-muted-foreground">
        {config.label}
      </span>
    </div>
  )
}

interface MoodSelectorProps {
  selectedMood?: MoodIndicatorProps['mood']
  onMoodSelect: (mood: MoodIndicatorProps['mood']) => void
  className?: string
}

export function MoodSelector({ 
  selectedMood, 
  onMoodSelect, 
  className 
}: MoodSelectorProps) {
  return (
    <div className={cn("flex justify-center space-x-4", className)}>
      {(Object.keys(moodConfig) as Array<keyof typeof moodConfig>).map((mood) => (
        <button
          key={mood}
          onClick={() => onMoodSelect(mood)}
          className={cn(
            "transition-all duration-300 hover-lift",
            selectedMood === mood && "scale-110 glow-soft"
          )}
        >
          <MoodIndicator 
            mood={mood} 
            size="md" 
            animated={selectedMood === mood}
          />
        </button>
      ))}
    </div>
  )
}
