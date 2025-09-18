import { NextRequest, NextResponse } from "next/server"

export async function GET(_request: NextRequest) {
  try {
    // For now, return static tutorials. In a real app, these would come from a database
    const tutorials = [
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
        icon: "Heart"
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
        icon: "BookOpen"
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
        icon: "Brain"
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
        icon: "Sparkles"
      }
    ]

    return NextResponse.json(tutorials)
  } catch (error) {
    console.error("Error fetching tutorials:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
