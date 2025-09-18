import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { z } from "zod"

const progressReportSchema = z.object({
  therapistId: z.string().min(1),
  therapistName: z.string().min(1),
  date: z.string(),
  sessionNotes: z.string().min(1).max(2000),
  moodRating: z.number().min(1).max(10).optional(),
  progressAreas: z.array(z.string()).max(20),
  challenges: z.array(z.string()).max(20),
  homework: z.array(z.string()).max(20),
  nextSessionFocus: z.string().max(500).optional(),
  recommendations: z.array(z.string()).max(20),
  isShared: z.boolean().default(false)
})

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const therapistId = searchParams.get("therapistId")
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    const where: any = { userId: session.user.id }
    if (therapistId) where.therapistId = therapistId
    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    }

    const progressReports = await prisma.progressReport.findMany({
      where,
      orderBy: { date: "desc" }
    })

    // Transform the data to match the component interface
    const transformedReports = progressReports.map(report => ({
      id: report.id,
      therapistId: report.therapistId,
      therapistName: report.therapistName,
      date: report.date.toISOString(),
      sessionNotes: report.sessionNotes,
      moodRating: report.moodRating,
      progressAreas: report.progressAreas as string[],
      challenges: report.challenges as string[],
      homework: report.homework as string[],
      nextSessionFocus: report.nextSessionFocus,
      recommendations: report.recommendations as string[],
      isShared: report.isShared
    }))

    return NextResponse.json(transformedReports)
  } catch (error) {
    console.error("Error fetching progress reports:", error)
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
    const validatedData = progressReportSchema.parse(body)

    const progressReport = await prisma.progressReport.create({
      data: {
        userId: session.user.id,
        therapistId: validatedData.therapistId,
        therapistName: validatedData.therapistName,
        date: new Date(validatedData.date),
        sessionNotes: validatedData.sessionNotes,
        moodRating: validatedData.moodRating ?? null,
        progressAreas: validatedData.progressAreas,
        challenges: validatedData.challenges,
        homework: validatedData.homework,
        nextSessionFocus: validatedData.nextSessionFocus ?? null,
        recommendations: validatedData.recommendations,
        isShared: validatedData.isShared
      }
    })

    return NextResponse.json(progressReport, { status: 201 })
  } catch (error) {
    console.error("Error creating progress report:", error)
    
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
