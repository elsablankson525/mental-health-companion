// import { NextRequest } from 'next/server'

export interface RealtimeEvent {
  type: string
  data: any
  timestamp: string
  userId: string
}

export class RealtimeService {
  private static instance: RealtimeService
  private connections: Map<string, ReadableStreamDefaultController[]> = new Map()

  static getInstance(): RealtimeService {
    if (!RealtimeService.instance) {
      RealtimeService.instance = new RealtimeService()
    }
    return RealtimeService.instance
  }

  // Add a new SSE connection
  addConnection(userId: string, controller: ReadableStreamDefaultController) {
    if (!this.connections.has(userId)) {
      this.connections.set(userId, [])
    }
    this.connections.get(userId)!.push(controller)
  }

  // Remove a connection
  removeConnection(userId: string, controller: ReadableStreamDefaultController) {
    const userConnections = this.connections.get(userId)
    if (userConnections) {
      const index = userConnections.indexOf(controller)
      if (index > -1) {
        userConnections.splice(index, 1)
      }
      if (userConnections.length === 0) {
        this.connections.delete(userId)
      }
    }
  }

  // Send event to specific user
  sendToUser(userId: string, event: Omit<RealtimeEvent, 'userId' | 'timestamp'>) {
    const userConnections = this.connections.get(userId)
    if (userConnections) {
      const fullEvent: RealtimeEvent = {
        ...event,
        userId,
        timestamp: new Date().toISOString()
      }

      const message = `data: ${JSON.stringify(fullEvent)}\n\n`
      
      userConnections.forEach(controller => {
        try {
          controller.enqueue(new TextEncoder().encode(message))
        } catch (error) {
          console.error('Error sending SSE message:', error)
          // Remove failed connection
          this.removeConnection(userId, controller)
        }
      })
    }
  }

  // Send event to all connected users
  broadcast(event: Omit<RealtimeEvent, 'userId' | 'timestamp'>) {
    this.connections.forEach((_, userId) => {
      this.sendToUser(userId, event)
    })
  }

  // Get connection count for a user
  getConnectionCount(userId: string): number {
    return this.connections.get(userId)?.length || 0
  }

  // Get total connection count
  getTotalConnections(): number {
    let total = 0
    this.connections.forEach(connections => {
      total += connections.length
    })
    return total
  }
}

// Event types
export const REALTIME_EVENTS = {
  MOOD_UPDATE: 'mood_update',
  JOURNAL_ENTRY: 'journal_entry',
  GOAL_PROGRESS: 'goal_progress',
  MEDICATION_REMINDER: 'medication_reminder',
  APPOINTMENT_REMINDER: 'appointment_reminder',
  WELLNESS_ACTIVITY: 'wellness_activity',
  SLEEP_ENTRY: 'sleep_entry',
  CHAT_MESSAGE: 'chat_message',
  NOTIFICATION: 'notification',
  CRISIS_ALERT: 'crisis_alert',
  DATA_EXPORT_READY: 'data_export_ready',
  COMMUNITY_POST: 'community_post',
  TREATMENT_UPDATE: 'treatment_update'
} as const

// Helper functions for common events
export const createMoodUpdateEvent = (mood: number, emotions: string[], note?: string) => ({
  type: REALTIME_EVENTS.MOOD_UPDATE,
  data: { mood, emotions, note }
})

export const createGoalProgressEvent = (goalId: string, progress: number, milestone?: string) => ({
  type: REALTIME_EVENTS.GOAL_PROGRESS,
  data: { goalId, progress, milestone }
})

export const createMedicationReminderEvent = (medicationId: string, medicationName: string, time: string) => ({
  type: REALTIME_EVENTS.MEDICATION_REMINDER,
  data: { medicationId, medicationName, time }
})

export const createAppointmentReminderEvent = (appointmentId: string, therapistName: string, time: string) => ({
  type: REALTIME_EVENTS.APPOINTMENT_REMINDER,
  data: { appointmentId, therapistName, time }
})

export const createNotificationEvent = (title: string, message: string, type: string) => ({
  type: REALTIME_EVENTS.NOTIFICATION,
  data: { title, message, type }
})

export const createCrisisAlertEvent = (riskLevel: string, recommendations: string[]) => ({
  type: REALTIME_EVENTS.CRISIS_ALERT,
  data: { riskLevel, recommendations }
})

// SSE endpoint handler
export function createSSEHandler(userId: string) {
  let streamController: ReadableStreamDefaultController<any> | null = null
  
  return new ReadableStream({
    start(controller) {
      streamController = controller
      const realtimeService = RealtimeService.getInstance()
      
      // Add connection
      realtimeService.addConnection(userId, controller)
      
      // Send initial connection message
      const welcomeMessage = `data: ${JSON.stringify({
        type: 'connection_established',
        data: { message: 'Connected to real-time updates' },
        timestamp: new Date().toISOString(),
        userId
      })}\n\n`
      
      controller.enqueue(new TextEncoder().encode(welcomeMessage))
      
      // Keep connection alive with periodic ping
      const pingInterval = setInterval(() => {
        try {
          const pingMessage = `data: ${JSON.stringify({
            type: 'ping',
            data: { timestamp: new Date().toISOString() },
            timestamp: new Date().toISOString(),
            userId
          })}\n\n`
          controller.enqueue(new TextEncoder().encode(pingMessage))
        } catch (error) {
          clearInterval(pingInterval)
          realtimeService.removeConnection(userId, controller as any)
        }
      }, 30000) // Ping every 30 seconds
      
      // Cleanup on close
      // controller.signal?.addEventListener('abort', () => {
      //   clearInterval(pingInterval)
      //   realtimeService.removeConnection(userId, controller as any)
      // })
    },
    
    cancel() {
      const realtimeService = RealtimeService.getInstance()
      if (streamController) {
        realtimeService.removeConnection(userId, streamController as any)
      }
    }
  })
}
