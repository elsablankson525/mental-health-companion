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
    const status = searchParams.get("status")
    const category = searchParams.get("category")
    const limit = searchParams.get("limit")

    const where: any = { userId: session.user.id }
    if (status) where.status = status
    if (category) where.category = category

    const goals = await prisma.goal.findMany({
      where,
      include: {
        milestones: true
      },
      orderBy: { createdAt: "desc" },
      ...(limit && { take: parseInt(limit) })
    })

    return NextResponse.json(goals)
  } catch (error) {
    console.error("Error fetching goals:", error)
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

    const { title, description, category, targetValue, unit, startDate, targetDate, priority, milestones } = await request.json()

    if (!title || !category || !targetValue || !unit || !startDate || !targetDate) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const goal = await prisma.goal.create({
      data: {
        userId: session.user.id,
        title,
        description,
        category,
        targetValue: parseFloat(targetValue),
        unit,
        startDate: new Date(startDate),
        targetDate: new Date(targetDate),
        priority: priority || 1,
        milestones: {
          create: milestones?.map((milestone: any) => ({
            title: milestone.title,
            description: milestone.description,
            targetDate: new Date(milestone.targetDate)
          })) || []
        }
      },
      include: {
        milestones: true
      }
    })

    return NextResponse.json(goal, { status: 201 })
  } catch (error) {
    console.error("Error creating goal:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
