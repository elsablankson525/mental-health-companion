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
    const medicationId = searchParams.get("medicationId")
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
    const limit = searchParams.get("limit")

    const where: any = { userId: session.user.id }
    if (medicationId) where.medicationId = medicationId
    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    }

    const logs = await prisma.medicationLog.findMany({
      where,
      include: {
        medication: true
      },
      orderBy: { date: "desc" },
      ...(limit && { take: parseInt(limit) })
    })

    return NextResponse.json(logs)
  } catch (error) {
    console.error("Error fetching medication logs:", error)
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
      medicationId, 
      taken, 
      takenAt, 
      dosage, 
      sideEffects, 
      effectiveness, 
      notes, 
      date 
    } = await request.json()

    if (!medicationId || taken === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Verify medication belongs to user
    const medication = await prisma.medication.findFirst({
      where: {
        id: medicationId,
        userId: session.user.id
      }
    })

    if (!medication) {
      return NextResponse.json(
        { error: "Medication not found" },
        { status: 404 }
      )
    }

    const log = await prisma.medicationLog.create({
      data: {
        medicationId,
        userId: session.user.id,
        taken,
        takenAt: takenAt ? new Date(takenAt) : null,
        dosage,
        sideEffects,
        effectiveness: effectiveness ? parseInt(effectiveness) : null,
        notes,
        date: date ? new Date(date) : new Date()
      },
      include: {
        medication: true
      }
    })

    return NextResponse.json(log, { status: 201 })
  } catch (error) {
    console.error("Error creating medication log:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
