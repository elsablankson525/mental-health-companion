import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { z } from "zod"

const treatmentPlanSchema = z.object({
  therapistId: z.string().min(1),
  therapistName: z.string().min(1),
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(1000),
  goals: z.array(z.string()).max(20),
  milestones: z.array(z.object({
    title: z.string().min(1).max(100),
    description: z.string().max(500),
    targetDate: z.string(),
    status: z.enum(['pending', 'in-progress', 'completed']).default('pending'),
    completedDate: z.string().optional()
  })).max(50),
  startDate: z.string(),
  endDate: z.string(),
  status: z.enum(['active', 'completed', 'paused']).default('active')
})

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const therapistId = searchParams.get("therapistId")

    const where: any = { userId: session.user.id }
    if (status) where.status = status
    if (therapistId) where.therapistId = therapistId

    const treatmentPlans = await prisma.treatmentPlan.findMany({
      where,
      orderBy: { createdAt: "desc" }
    })

    // Transform the data to match the component interface
    const transformedPlans = treatmentPlans.map(plan => ({
      id: plan.id,
      therapistId: plan.therapistId,
      therapistName: plan.therapistName,
      title: plan.title,
      description: plan.description,
      goals: plan.goals as string[],
      milestones: (plan.milestones as any[]).map(milestone => ({
        id: milestone.id || Math.random().toString(),
        title: milestone.title,
        description: milestone.description,
        targetDate: milestone.targetDate,
        status: milestone.status,
        completedDate: milestone.completedDate
      })),
      startDate: plan.startDate.toISOString(),
      endDate: plan.endDate.toISOString(),
      status: plan.status.toLowerCase(),
      lastUpdated: plan.lastUpdated.toISOString()
    }))

    return NextResponse.json(transformedPlans)
  } catch (error) {
    console.error("Error fetching treatment plans:", error)
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

    const body = await request.json()
    const validatedData = treatmentPlanSchema.parse(body)

    const treatmentPlan = await prisma.treatmentPlan.create({
      data: {
        userId: session.user.id,
        therapistId: validatedData.therapistId,
        therapistName: validatedData.therapistName,
        title: validatedData.title,
        description: validatedData.description,
        goals: validatedData.goals,
        milestones: validatedData.milestones,
        startDate: new Date(validatedData.startDate),
        endDate: new Date(validatedData.endDate),
        status: validatedData.status.toUpperCase() as any
      }
    })

    return NextResponse.json(treatmentPlan, { status: 201 })
  } catch (error) {
    console.error("Error creating treatment plan:", error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid data", details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
