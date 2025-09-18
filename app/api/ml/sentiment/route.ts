import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { mlService } from "@/lib/ml-service"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { text } = await request.json()

    if (!text) {
      return NextResponse.json(
        { error: "Text is required" },
        { status: 400 }
      )
    }

    const sentiment = await mlService.analyzeSentiment(text)

    return NextResponse.json(sentiment)
  } catch (error) {
    console.error("Error analyzing sentiment:", error)
    return NextResponse.json(
      { error: "Failed to analyze sentiment" },
      { status: 500 }
    )
  }
}
