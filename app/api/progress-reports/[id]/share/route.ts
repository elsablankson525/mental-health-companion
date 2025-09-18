import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function POST(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const reportId = params.id

    // Verify the report belongs to the user
    const existingReport = await prisma.progressReport.findFirst({
      where: {
        id: reportId,
        userId: session.user.id
      }
    })

    if (!existingReport) {
      return NextResponse.json(
        { error: "Progress report not found" },
        { status: 404 }
      )
    }

    // Update the report to mark it as shared
    const updatedReport = await prisma.progressReport.update({
      where: { id: reportId },
      data: { isShared: true }
    })

    return NextResponse.json({
      success: true,
      report: updatedReport
    })
  } catch (error) {
    console.error("Error sharing progress report:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
