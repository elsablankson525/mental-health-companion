import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const entry = await prisma.journalEntry.deleteMany({
      where: {
        id,
        userId: session.user.id
      }
    })

    if (entry.count === 0) {
      return NextResponse.json({ error: "Journal entry not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Journal entry deleted successfully" })
  } catch (error) {
    console.error("Error deleting journal entry:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { title, content } = await request.json()
    const { id } = await params

    const entry = await prisma.journalEntry.updateMany({
      where: {
        id,
        userId: session.user.id
      },
      data: {
        ...(title !== undefined && { title }),
        ...(content !== undefined && { content })
      }
    })

    if (entry.count === 0) {
      return NextResponse.json({ error: "Journal entry not found" }, { status: 404 })
    }

    const updatedEntry = await prisma.journalEntry.findFirst({
      where: {
        id,
        userId: session.user.id
      }
    })

    return NextResponse.json(updatedEntry)
  } catch (error) {
    console.error("Error updating journal entry:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
