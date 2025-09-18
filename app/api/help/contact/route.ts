import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { z } from "zod"

const contactFormSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email().max(100),
  category: z.string().min(1),
  subject: z.string().min(1).max(200),
  message: z.string().min(1).max(2000),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium')
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = contactFormSchema.parse(body)

    // Create a notification for the support team
    const notification = await prisma.notification.create({
      data: {
        userId: session.user.id,
        type: 'SYSTEM',
        title: `Support Request: ${validatedData.subject}`,
        message: `Category: ${validatedData.category}\nPriority: ${validatedData.priority}\n\nFrom: ${validatedData.name} (${validatedData.email})\n\nMessage:\n${validatedData.message}`,
        data: {
          type: 'support_request',
          category: validatedData.category,
          priority: validatedData.priority,
          contactEmail: validatedData.email,
          contactName: validatedData.name
        }
      }
    })

    // In a real app, you would also:
    // 1. Send an email to the support team
    // 2. Create a ticket in a support system
    // 3. Send a confirmation email to the user

    return NextResponse.json({
      success: true,
      message: "Your support request has been submitted successfully.",
      notificationId: notification.id
    })
  } catch (error) {
    console.error("Error submitting contact form:", error)
    
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
