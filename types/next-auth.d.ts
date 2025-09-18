import NextAuth from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      emailVerified?: Date
      phoneVerified?: Date
    }
  }

  interface User {
    id: string
    name?: string | null
    email?: string | null
    image?: string | null
    emailVerified?: Date
    phoneVerified?: Date
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    emailVerified?: Date
    phoneVerified?: Date
  }
}
