"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface ProgressIndicatorProps {
  value: number
  max?: number
  variant?: 'calm' | 'hope' | 'support' | 'default'
  size?: 'sm' | 'md' | 'lg'
  animated?: boolean
  showLabel?: boolean
  label?: string
  className?: string
}

const variantConfig = {
  calm: {
    gradient: 'progress-calm',
    bgColor: 'bg-calm/20',
    textColor: 'text-calm'
  },
  hope: {
    gradient: 'progress-hope',
    bgColor: 'bg-hope/20',
    textColor: 'text-hope'
  },
  support: {
    gradient: 'progress-support',
    bgColor: 'bg-support/20',
    textColor: 'text-support'
  },
  default: {
    gradient: 'bg-primary',
    bgColor: 'bg-primary/20',
    textColor: 'text-primary'
  }
}

const sizeConfig = {
  sm: 'h-2',
  md: 'h-3',
  lg: 'h-4'
}

export function ProgressIndicator({
  value,
  max = 100,
  variant = 'default',
  size = 'md',
  animated = true,
  showLabel = true,
  label,
  className
}: ProgressIndicatorProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100)
  const config = variantConfig[variant]
  
  return (
    <div className={cn("w-full space-y-2", className)}>
      {showLabel && (
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-foreground">
            {label || 'Progress'}
          </span>
          <span className={cn("text-sm font-semibold", config.textColor)}>
            {Math.round(percentage)}%
          </span>
        </div>
      )}
      <div className={cn(
        "w-full rounded-full overflow-hidden",
        config.bgColor,
        sizeConfig[size]
      )}>
        <div
          className={cn(
            "h-full rounded-full transition-all duration-1000 ease-out",
            config.gradient,
            animated && "animate-pulse"
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

interface CircularProgressProps {
  value: number
  max?: number
  variant?: 'calm' | 'hope' | 'support' | 'default'
  size?: number
  strokeWidth?: number
  animated?: boolean
  showLabel?: boolean
  label?: string
  className?: string
}

export function CircularProgress({
  value,
  max = 100,
  variant = 'default',
  size = 120,
  strokeWidth = 8,
  animated = true,
  showLabel = true,
  label,
  className
}: CircularProgressProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100)
  const config = variantConfig[variant]
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const strokeDasharray = circumference
  const strokeDashoffset = circumference - (percentage / 100) * circumference
  
  return (
    <div className={cn("flex flex-col items-center space-y-4", className)}>
      <div className="relative">
        <svg
          width={size}
          height={size}
          className={cn(
            "transform -rotate-90",
            animated && "animate-spin-slow"
          )}
        >
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="none"
            className="text-muted/30"
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className={cn(
              "transition-all duration-1000 ease-out",
              config.textColor
            )}
          />
        </svg>
        {showLabel && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className={cn("text-2xl font-bold", config.textColor)}>
                {Math.round(percentage)}%
              </div>
              {label && (
                <div className="text-xs text-muted-foreground">
                  {label}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

interface WellnessScoreProps {
  score: number
  max?: number
  category: 'mood' | 'sleep' | 'stress' | 'energy' | 'overall'
  className?: string
}

const categoryConfig = {
  mood: {
    label: 'Mood',
    icon: '😊',
    variant: 'hope' as const
  },
  sleep: {
    label: 'Sleep',
    icon: '😴',
    variant: 'calm' as const
  },
  stress: {
    label: 'Stress',
    icon: '🧘',
    variant: 'support' as const
  },
  energy: {
    label: 'Energy',
    icon: '⚡',
    variant: 'hope' as const
  },
  overall: {
    label: 'Overall',
    icon: '💚',
    variant: 'support' as const
  }
}

export function WellnessScore({
  score,
  max = 100,
  category,
  className
}: WellnessScoreProps) {
  const config = categoryConfig[category]
  
  return (
    <div className={cn("text-center space-y-3", className)}>
      <div className="text-2xl animate-breathe">{config.icon}</div>
      <CircularProgress
        value={score}
        max={max}
        variant={config.variant}
        size={100}
        strokeWidth={6}
        showLabel={true}
        label={config.label}
      />
    </div>
  )
}
