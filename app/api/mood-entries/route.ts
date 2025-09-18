import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { 
  createMoodEntry, 
  getMoodEntries, 
  getMoodEntriesByDateRange,
  getMoodStats 
} from "@/lib/optimized-database-service"
import { z } from "zod"

const moodEntrySchema = z.object({
  mood: z.number().min(1).max(10),
  emotions: z.array(z.string()).max(10), // Limit emotions array size
  note: z.string().max(1000).optional(), // Limit note length
})

// Rate limiting for mood entries (max 10 per hour per user)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT_WINDOW = 60 * 60 * 1000 // 1 hour
const RATE_LIMIT_MAX = 10

function checkRateLimit(userId: string): boolean {
  const now = Date.now()
  const key = `mood_${userId}`
  const current = rateLimitMap.get(key)

  if (!current || now > current.resetTime) {
    rateLimitMap.set(key, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW
    })
    return true
  }

  if (current.count >= RATE_LIMIT_MAX) {
    return false
  }

  current.count++
  return true
}

export async function GET(request: NextRequest) {
  const start = Date.now()
  
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = searchParams.get("limit")
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
    const includeStats = searchParams.get("includeStats") === "true"

    // Validate limit parameter
    const parsedLimit = limit ? Math.min(parseInt(limit), 100) : 50 // Max 100 entries

    let entries
    if (startDate && endDate) {
      const start = new Date(startDate)
      const end = new Date(endDate)
      
      // Validate date range (max 1 year)
      const maxRange = 365 * 24 * 60 * 60 * 1000
      if (end.getTime() - start.getTime() > maxRange) {
        return NextResponse.json(
          { error: "Date range too large. Maximum 1 year allowed." },
          { status: 400 }
        )
      }
      
      entries = await getMoodEntriesByDateRange(session.user.id, start, end)
    } else {
      entries = await getMoodEntries(session.user.id, parsedLimit)
    }

    const response: any = { entries }
    
    if (includeStats) {
      const stats = await getMoodStats(session.user.id)
      response.stats = stats
    }

    response.meta = {
      count: Array.isArray(entries) ? entries.length : 0,
      responseTime: Date.now() - start
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Error fetching mood entries:", error)
    return NextResponse.json(
      { 
        error: "Internal server error",
        responseTime: Date.now() - start
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  const start = Date.now()
  
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check rate limit
    if (!checkRateLimit(session.user.id)) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Maximum 10 mood entries per hour." },
        { status: 429 }
      )
    }

    const body = await request.json()
    const validatedData = moodEntrySchema.parse(body)

    const entry = await createMoodEntry({
      mood: validatedData.mood,
      emotions: validatedData.emotions,
      userId: session.user.id,
      ...(validatedData.note && { note: validatedData.note }),
    })

    return NextResponse.json({
      ...entry,
      meta: {
        responseTime: Date.now() - start
      }
    }, { status: 201 })
  } catch (error) {
    console.error("Error creating mood entry:", error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: "Invalid data", 
          details: error.errors,
          responseTime: Date.now() - start
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { 
        error: "Internal server error",
        responseTime: Date.now() - start
      },
      { status: 500 }
    )
  }
}
