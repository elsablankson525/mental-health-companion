import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { createChatMessageWithML } from "@/lib/enhanced-database-service"
import { prisma } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = searchParams.get("limit")
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
    
    const where: any = { userId: session.user.id }
    if (startDate && endDate) {
      where.timestamp = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    }

    const messages = await prisma.chatMessage.findMany({
      where,
      orderBy: { timestamp: "desc" },
      ...(limit && { take: parseInt(limit) })
    })

    return NextResponse.json(messages)
  } catch (error) {
    console.error("Error fetching chat messages:", error)
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

    const { message, isUser } = await request.json()

    if (!message || typeof isUser !== "boolean") {
      return NextResponse.json(
        { error: "Message and isUser flag are required" },
        { status: 400 }
      )
    }

    const chatMessage = await createChatMessageWithML({
      userId: session.user.id,
      message,
      isUser,
    })

    return NextResponse.json(chatMessage, { status: 201 })
  } catch (error) {
    console.error("Error creating chat message:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
