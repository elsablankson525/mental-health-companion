import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const activityId = searchParams.get("activityId")
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
    const limit = searchParams.get("limit")

    const where: any = { userId: session.user.id }
    if (activityId) where.activityId = activityId
    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    }

    const logs = await prisma.wellnessLog.findMany({
      where,
      include: {
        activity: true
      },
      orderBy: { date: "desc" },
      ...(limit && { take: parseInt(limit) })
    })

    return NextResponse.json(logs)
  } catch (error) {
    console.error("Error fetching wellness logs:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { 
      activityId, 
      duration, 
      intensity, 
      moodBefore, 
      moodAfter, 
      notes, 
      date 
    } = await request.json()

    if (!activityId || !duration) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Verify activity belongs to user
    const activity = await prisma.wellnessActivity.findFirst({
      where: {
        id: activityId,
        userId: session.user.id
      }
    })

    if (!activity) {
      return NextResponse.json(
        { error: "Activity not found" },
        { status: 404 }
      )
    }

    const log = await prisma.wellnessLog.create({
      data: {
        activityId,
        userId: session.user.id,
        duration: parseInt(duration),
        intensity,
        moodBefore: moodBefore ? parseInt(moodBefore) : null,
        moodAfter: moodAfter ? parseInt(moodAfter) : null,
        notes,
        date: date ? new Date(date) : new Date()
      },
      include: {
        activity: true
      }
    })

    return NextResponse.json(log, { status: 201 })
  } catch (error) {
    console.error("Error creating wellness log:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
