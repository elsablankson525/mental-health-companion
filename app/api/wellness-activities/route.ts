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
    const category = searchParams.get("category")
    const isActive = searchParams.get("isActive")
    const limit = searchParams.get("limit")

    const where: any = { userId: session.user.id }
    if (category) where.category = category
    if (isActive !== null) where.isActive = isActive === "true"

    const activities = await prisma.wellnessActivity.findMany({
      where,
      include: {
        logs: {
          orderBy: { date: "desc" },
          take: 7 // Last 7 days of logs
        }
      },
      orderBy: { createdAt: "desc" },
      ...(limit && { take: parseInt(limit) })
    })

    return NextResponse.json(activities)
  } catch (error) {
    console.error("Error fetching wellness activities:", error)
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
      name, 
      category, 
      description, 
      duration, 
      intensity 
    } = await request.json()

    if (!name || !category) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const activity = await prisma.wellnessActivity.create({
      data: {
        userId: session.user.id,
        name,
        category,
        description,
        duration: duration ? parseInt(duration) : null,
        intensity
      }
    })

    return NextResponse.json(activity, { status: 201 })
  } catch (error) {
    console.error("Error creating wellness activity:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
