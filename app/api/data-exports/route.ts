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
    const limit = searchParams.get("limit")

    const where: any = { userId: session.user.id }
    if (status) where.status = status

    const exports = await prisma.dataExport.findMany({
      where,
      orderBy: { requestedAt: "desc" },
      ...(limit && { take: parseInt(limit) })
    })

    return NextResponse.json(exports)
  } catch (error) {
    console.error("Error fetching data exports:", error)
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
      type, 
      format, 
      description 
    } = await request.json()

    if (!type || !format || !description) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Set expiration date (7 days from now)
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7)

    const dataExport = await prisma.dataExport.create({
      data: {
        userId: session.user.id,
        type,
        format,
        description,
        expiresAt
      }
    })

    // In a real implementation, you would trigger the export process here
    // For now, we'll simulate it by updating the status after a delay
    setTimeout(async () => {
      try {
        await prisma.dataExport.update({
          where: { id: dataExport.id },
          data: {
            status: "READY",
            completedAt: new Date(),
            size: "2.3 MB",
            downloadUrl: `/api/data-exports/${dataExport.id}/download`
          }
        })
      } catch (error) {
        console.error("Error updating export status:", error)
      }
    }, 5000) // 5 second delay to simulate processing

    return NextResponse.json(dataExport, { status: 201 })
  } catch (error) {
    console.error("Error creating data export:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
