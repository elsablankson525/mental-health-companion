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

    const { emotions, note } = await request.json()

    if (!emotions || !Array.isArray(emotions)) {
      return NextResponse.json(
        { error: "Emotions array is required" },
        { status: 400 }
      )
    }

    const prediction = await mlService.predictMood({
      emotions,
      note,
      user_id: session.user.id
    })

    return NextResponse.json(prediction)
  } catch (error) {
    console.error("Error predicting mood:", error)
    return NextResponse.json(
      { error: "Failed to predict mood" },
      { status: 500 }
    )
  }
}
