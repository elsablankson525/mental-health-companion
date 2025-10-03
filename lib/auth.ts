import { NextAuthOptions } from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"
import { headers } from "next/headers"

const prisma = new PrismaClient()

// Rate limiting for login attempts
const loginAttempts = new Map<string, { count: number; resetTime: number }>()
const MAX_LOGIN_ATTEMPTS = 5
const LOCKOUT_DURATION = 15 * 60 * 1000 // 15 minutes

async function checkRateLimit(identifier: string): Promise<boolean> {
  const now = Date.now()
  const key = `login_${identifier}`
  const current = loginAttempts.get(key)

  if (!current || now > current.resetTime) {
    loginAttempts.set(key, {
      count: 1,
      resetTime: now + LOCKOUT_DURATION
    })
    return true
  }

  if (current.count >= MAX_LOGIN_ATTEMPTS) {
    return false
  }

  current.count++
  return true
}

async function logLoginAttempt(
  userId: string | null,
  email: string | null,
  phone: string | null,
  ipAddress: string,
  userAgent: string,
  success: boolean,
  reason?: string
) {
  try {
    await prisma.loginLog.create({
      data: {
        userId,
        email,
        phone,
        ipAddress,
        userAgent,
        success,
        reason: reason ?? null
      }
    })
  } catch (error) {
    console.error("Failed to log login attempt:", error)
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  secret: process.env.NEXTAUTH_SECRET || 'fallback-secret-for-development',
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        // Get client info for logging
        const headersList = await headers()
        const ipAddress = headersList.get("x-forwarded-for") || 
                         headersList.get("x-real-ip") || 
                         "unknown"
        const userAgent = headersList.get("user-agent") || "unknown"

        // Check rate limiting
        if (!(await checkRateLimit(credentials.email))) {
          await logLoginAttempt(
            null,
            credentials.email,
            null,
            ipAddress,
            userAgent,
            false,
            "Rate limit exceeded"
          )
          throw new Error("Too many login attempts. Please try again later.")
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email
          }
        })

        if (!user || !user.password) {
          await logLoginAttempt(
            user?.id || null,
            credentials.email,
            null,
            ipAddress,
            userAgent,
            false,
            "User not found or no password"
          )
          return null
        }

        // Check if account is locked
        if (user.lockedUntil && new Date() < user.lockedUntil) {
          await logLoginAttempt(
            user.id,
            credentials.email,
            null,
            ipAddress,
            userAgent,
            false,
            "Account locked"
          )
          throw new Error("Account is temporarily locked. Please try again later.")
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isPasswordValid) {
          // Increment login attempts
          const newAttempts = user.loginAttempts + 1
          const shouldLock = newAttempts >= MAX_LOGIN_ATTEMPTS
          
          await prisma.user.update({
            where: { id: user.id },
            data: {
              loginAttempts: newAttempts,
              lockedUntil: shouldLock ? new Date(Date.now() + LOCKOUT_DURATION) : null
            }
          })

          await logLoginAttempt(
            user.id,
            credentials.email,
            null,
            ipAddress,
            userAgent,
            false,
            "Invalid password"
          )
          return null
        }

        // Reset login attempts on successful login
        await prisma.user.update({
          where: { id: user.id },
          data: {
            loginAttempts: 0,
            lockedUntil: null,
            lastLoginAt: new Date()
          }
        })

        await logLoginAttempt(
          user.id,
          credentials.email,
          null,
          ipAddress,
          userAgent,
          true
        )

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.emailVerified = (user as any).emailVerified
        token.phoneVerified = (user as any).phoneVerified
      }
      
      // Update last activity
      if (token.id) {
        try {
          await prisma.user.update({
            where: { id: token.id as string },
            data: { lastLoginAt: new Date() }
          })
        } catch (error) {
          console.error("Failed to update last login:", error)
        }
      }
      
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.emailVerified = token.emailVerified as Date
        session.user.phoneVerified = token.phoneVerified as Date
      }
      return session
    },
    async signIn() {
      // For credentials, the authorize function handles validation
      return true
    }
  },
  pages: {
    signIn: "/auth/signin",
  },
  events: {
    async signIn({ user, account }) {
      console.log(`User ${user.email} signed in via ${account?.provider}`)
    },
    async signOut({ session }) {
      console.log(`User ${session?.user?.email} signed out`)
    }
  },
  debug: process.env.NODE_ENV === "development"
}
