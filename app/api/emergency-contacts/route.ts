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
    const isPrimary = searchParams.get("isPrimary")
    const limit = searchParams.get("limit")

    const where: any = { userId: session.user.id }
    if (isPrimary !== null) where.isPrimary = isPrimary === "true"

    const contacts = await prisma.emergencyContact.findMany({
      where,
      orderBy: [
        { isPrimary: "desc" },
        { createdAt: "desc" }
      ],
      ...(limit && { take: parseInt(limit) })
    })

    return NextResponse.json(contacts)
  } catch (error) {
    console.error("Error fetching emergency contacts:", error)
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
      relationship, 
      phone, 
      email, 
      address, 
      notes, 
      isPrimary, 
      isAvailable24_7 
    } = await request.json()

    if (!name || !relationship || !phone) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // If setting as primary, unset other primary contacts
    if (isPrimary) {
      await prisma.emergencyContact.updateMany({
        where: {
          userId: session.user.id,
          isPrimary: true
        },
        data: {
          isPrimary: false
        }
      })
    }

    const contact = await prisma.emergencyContact.create({
      data: {
        userId: session.user.id,
        name,
        relationship,
        phone,
        email,
        address,
        notes,
        isPrimary: isPrimary || false,
        isAvailable24_7: isAvailable24_7 || false
      }
    })

    return NextResponse.json(contact, { status: 201 })
  } catch (error) {
    console.error("Error creating emergency contact:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
