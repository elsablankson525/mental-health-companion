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

    const { mood, emotions, sentiment_data } = await request.json()

    if (!mood || !emotions) {
      return NextResponse.json(
        { error: "Mood and emotions are required" },
        { status: 400 }
      )
    }

    const recommendations = await mlService.getRecommendations({
      mood,
      emotions,
      sentiment_data,
      user_id: session.user.id
    })

    return NextResponse.json(recommendations)
  } catch (error) {
    console.error("Error getting ML recommendations:", error)
    return NextResponse.json(
      { error: "Failed to get recommendations" },
      { status: 500 }
    )
  }
}
