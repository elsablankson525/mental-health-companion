import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { mlService } from "@/lib/ml-service"
import { prisma } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { startDate, endDate } = await request.json()

    // Get mood entries for the user
    const where: any = { userId: session.user.id }
    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    }

    const moodEntries = await prisma.moodEntry.findMany({
      where,
      orderBy: { date: 'desc' },
      take: 100, // Limit to last 100 entries
      select: {
        mood: true,
        emotions: true,
        date: true
      }
    })

    if (moodEntries.length === 0) {
      return NextResponse.json({
        success: false,
        message: "No mood entries found for analysis"
      })
    }

    // Get journal entries for additional context
    const journalEntries = await prisma.journalEntry.findMany({
      where: {
        userId: session.user.id,
        ...(startDate && endDate && {
          date: {
            gte: new Date(startDate),
            lte: new Date(endDate)
          }
        })
      },
      orderBy: { date: 'desc' },
      take: 50,
      select: {
        content: true,
        date: true
      }
    })

    const patterns = await mlService.analyzePatterns({
      mood_entries: moodEntries,
      journal_entries: journalEntries
    })

    return NextResponse.json(patterns)
  } catch (error) {
    console.error("Error analyzing patterns:", error)
    return NextResponse.json(
      { error: "Failed to analyze patterns" },
      { status: 500 }
    )
  }
}
