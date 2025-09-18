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
    const isActive = searchParams.get("isActive")
    const limit = searchParams.get("limit")

    const where: any = { userId: session.user.id }
    if (isActive !== null) where.isActive = isActive === "true"

    const medications = await prisma.medication.findMany({
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

    return NextResponse.json(medications)
  } catch (error) {
    console.error("Error fetching medications:", error)
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
      dosage, 
      frequency, 
      instructions, 
      startDate, 
      endDate, 
      reminders 
    } = await request.json()

    if (!name || !dosage || !frequency || !startDate) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const medication = await prisma.medication.create({
      data: {
        userId: session.user.id,
        name,
        dosage,
        frequency,
        instructions,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        reminders: reminders ? JSON.parse(JSON.stringify(reminders)) : null
      }
    })

    return NextResponse.json(medication, { status: 201 })
  } catch (error) {
    console.error("Error creating medication:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
