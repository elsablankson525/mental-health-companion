import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Rate limiting store (in production, use Redis or similar)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 15 * 60 * 1000 // 15 minutes
const RATE_LIMIT_MAX_REQUESTS = 100 // Max requests per window

function rateLimit(ip: string): boolean {
  const now = Date.now()
  const key = `rate_limit_${ip}`
  const current = rateLimitStore.get(key)

  if (!current || now > current.resetTime) {
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW
    })
    return true
  }

  if (current.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false
  }

  current.count++
  return true
}

// Clean up old rate limit entries periodically
setInterval(() => {
  const now = Date.now()
  for (const [key, value] of rateLimitStore.entries()) {
    if (now > value.resetTime) {
      rateLimitStore.delete(key)
    }
  }
}, RATE_LIMIT_WINDOW)

export default withAuth(
  function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl
    const token = (req as any).nextauth?.token
    const ip = (req as any).ip || req.headers.get("x-forwarded-for") || "unknown"

    // Apply rate limiting
    if (!rateLimit(ip)) {
      return new NextResponse("Too Many Requests", { status: 429 })
    }

    // Security headers
    const response = NextResponse.next()
    
    // Security headers
    response.headers.set("X-Frame-Options", "DENY")
    response.headers.set("X-Content-Type-Options", "nosniff")
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
    response.headers.set("X-XSS-Protection", "1; mode=block")
    response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains")
    
    // Content Security Policy
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://accounts.google.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https: blob:",
      "connect-src 'self' https://accounts.google.com https://oauth2.googleapis.com",
      "frame-src 'self' https://accounts.google.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'"
    ].join("; ")
    
    response.headers.set("Content-Security-Policy", csp)

    // Protected routes that require authentication
    const protectedRoutes = ["/dashboard", "/api/chat-messages", "/api/mood-entries", "/api/journal-entries"]
    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))

    // Auth routes that should redirect if already authenticated
    const authRoutes = ["/auth/signin", "/auth/signup"]
    const isAuthRoute = authRoutes.includes(pathname)

    // API routes that need special handling
    const isApiRoute = pathname.startsWith("/api/")
    const isAuthApiRoute = pathname.startsWith("/api/auth/")

    // Allow auth API routes and public API routes
    if (isAuthApiRoute || pathname === "/api/health") {
      return response
    }

    // Redirect authenticated users away from auth pages
    if (isAuthRoute && token) {
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }

    // Protect routes that require authentication
    if (isProtectedRoute && !token) {
      const signInUrl = new URL("/auth/signin", req.url)
      signInUrl.searchParams.set("callbackUrl", pathname)
      return NextResponse.redirect(signInUrl)
    }

    // Protect API routes
    if (isApiRoute && !isAuthApiRoute && !token) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    return response
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl
        
        // Allow auth routes and public routes
        if (pathname.startsWith("/auth/") || 
            pathname === "/" || 
            pathname.startsWith("/api/auth/") ||
            pathname === "/api/health") {
          return true
        }
        
        // Require token for protected routes
        return !!token
      },
    },
  }
)

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
}
