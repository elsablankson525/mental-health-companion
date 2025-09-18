import { NextRequest, NextResponse } from "next/server"

export async function GET(_request: NextRequest) {
  try {
    // For now, return static FAQs. In a real app, these would come from a database
    const faqs = [
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

    return NextResponse.json(faqs)
  } catch (error) {
    console.error("Error fetching FAQs:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
