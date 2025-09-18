import { NextResponse } from "next/server"
import { getDatabaseHealth } from "@/lib/optimized-database-service"

export async function GET() {
  try {
    const start = Date.now()
    const dbHealth = await getDatabaseHealth()
    const responseTime = Date.now() - start
    
    if (dbHealth.status === 'healthy') {
      return NextResponse.json({
        status: "healthy",
        timestamp: new Date().toISOString(),
        responseTime,
        services: {
          database: "connected",
          api: "running",
          cache: "active"
        },
        performance: {
          dbResponseTime: dbHealth.responseTime,
          cacheSize: dbHealth.cacheSize
        }
      })
    } else {
      return NextResponse.json(
        {
          status: "unhealthy",
          timestamp: new Date().toISOString(),
          services: {
            database: "disconnected",
            api: "running"
          },
          error: dbHealth.error
        },
        { status: 503 }
      )
    }
  } catch (error) {
    console.error("Health check failed:", error)
    
    return NextResponse.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        services: {
          database: "unknown",
          api: "error"
        },
        error: "Health check failed"
      },
      { status: 500 }
    )
  }
}
