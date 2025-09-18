import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const { name, email, phone, password } = await request.json()

    // Validate input - either email or phone must be provided
    if (!name || (!email && !phone) || !password) {
      return NextResponse.json(
        { error: "Name, email or phone, and password are required" },
        { status: 400 }
      )
    }

    // For OTP users, allow special password
    if (password !== "otp_verified" && password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long" },
        { status: 400 }
      )
    }

    // Check if user already exists by email
    if (email) {
      const existingUserByEmail = await prisma.user.findUnique({
        where: { email }
      })

      if (existingUserByEmail) {
        return NextResponse.json(
          { error: "User with this email already exists" },
          { status: 400 }
        )
      }
    }

    // Check if user already exists by phone
    if (phone) {
      const existingUserByPhone = await prisma.user.findUnique({
        where: { phone }
      })

      if (existingUserByPhone) {
        return NextResponse.json(
          { error: "User with this phone number already exists" },
          { status: 400 }
        )
      }
    }

    // Hash password (skip for OTP users)
    const hashedPassword = password === "otp_verified" ? password : await bcrypt.hash(password, 12)

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        password: hashedPassword,
        phoneVerified: phone ? new Date() : null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        createdAt: true,
      }
    })

    return NextResponse.json(
      { message: "User created successfully", user },
      { status: 201 }
    )
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
