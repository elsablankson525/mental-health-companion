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
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
    const limit = searchParams.get("limit")

    const where: any = { userId: session.user.id }
    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    }

    const sleepEntries = await prisma.sleepEntry.findMany({
      where,
      orderBy: { date: "desc" },
      ...(limit && { take: parseInt(limit) })
    })

    return NextResponse.json(sleepEntries)
  } catch (error) {
    console.error("Error fetching sleep entries:", error)
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
      bedtime, 
      wakeTime, 
      duration, 
      quality, 
      deepSleep, 
      remSleep, 
      lightSleep, 
      awakenings, 
      notes, 
      date 
    } = await request.json()

    if (!bedtime || !wakeTime || !duration || !quality) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const sleepEntry = await prisma.sleepEntry.create({
      data: {
        userId: session.user.id,
        bedtime: new Date(bedtime),
        wakeTime: new Date(wakeTime),
        duration: parseFloat(duration),
        quality: parseInt(quality),
        deepSleep: deepSleep ? parseFloat(deepSleep) : null,
        remSleep: remSleep ? parseFloat(remSleep) : null,
        lightSleep: lightSleep ? parseFloat(lightSleep) : null,
        awakenings: awakenings || 0,
        notes,
        date: date ? new Date(date) : new Date()
      }
    })

    return NextResponse.json(sleepEntry, { status: 201 })
  } catch (error) {
    console.error("Error creating sleep entry:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
