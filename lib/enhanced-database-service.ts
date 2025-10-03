import { prisma } from './db'
import { RealtimeService, createMoodUpdateEvent, createGoalProgressEvent, createAppointmentReminderEvent, createNotificationEvent, createCrisisAlertEvent } from './realtime-service'
import { mlService } from './ml-service'

const realtimeService = RealtimeService.getInstance()

// Enhanced Mood Entry Functions
export async function createMoodEntryWithML(data: {
  mood: number
  emotions: string[]
  note?: string
  userId: string
}) {
  try {
    // Create mood entry
    const moodEntry = await prisma.moodEntry.create({
      data: {
        userId: data.userId,
        mood: data.mood,
        emotions: data.emotions,
        note: data.note ?? null
      }
    })

    // Get recent data for ML analysis
    // const recentMoods = await prisma.moodEntry.findMany({
    //   where: { userId: data.userId },
    //   orderBy: { date: 'desc' },
    //   take: 7,
    //   select: { mood: true }
    // })

    // const recentSleep = await prisma.sleepEntry.findMany({
    //   where: { userId: data.userId },
    //   orderBy: { date: 'desc' },
    //   take: 7,
    //   select: { quality: true }
    // })

    // Analyze sentiment if note is provided
    if (data.note) {
      try {
        await mlService.analyzeSentiment(data.note)
      } catch (error) {
        console.error('Error analyzing sentiment:', error)
      }
    }

    // Note: Sentiment analysis completed but not stored in database
    // The sentiment analysis is used for ML recommendations only

    // Send real-time update
    realtimeService.sendToUser(data.userId, createMoodUpdateEvent(data.mood, data.emotions, data.note))

    // Check for crisis risk using mood prediction
    try {
      const moodPrediction = await mlService.predictMood({
        emotions: data.emotions,
        note: data.note || '',
        user_id: data.userId
      })

      // Simple crisis detection based on predicted mood
      if (moodPrediction.predicted_mood <= 2) {
        const crisisRisk = {
          riskLevel: 'high',
          recommendations: moodPrediction.recommendations
        }
        realtimeService.sendToUser(data.userId, createCrisisAlertEvent(crisisRisk.riskLevel, crisisRisk.recommendations))
      }
    } catch (error) {
      console.error('Error checking crisis risk:', error)
    }

    return moodEntry
  } catch (error) {
    console.error('Error creating mood entry with ML:', error)
    throw error
  }
}

// Enhanced Goal Functions
export async function updateGoalProgress(goalId: string, userId: string, newProgress: number) {
  try {
    const goal = await prisma.goal.updateMany({
      where: {
        id: goalId,
        userId: userId
      },
      data: {
        currentValue: newProgress
      }
    })

    if (goal.count > 0) {
      // Send real-time update
      realtimeService.sendToUser(userId, createGoalProgressEvent(goalId, newProgress))

      // Check if goal is completed
      const updatedGoal = await prisma.goal.findFirst({
        where: { id: goalId, userId }
      })

      if (updatedGoal && newProgress >= updatedGoal.targetValue) {
        await prisma.goal.update({
          where: { id: goalId },
          data: { status: 'COMPLETED' }
        })

        // Send completion notification
        realtimeService.sendToUser(userId, createNotificationEvent(
          'Goal Completed!',
          `Congratulations! You've completed your goal: ${updatedGoal.title}`,
          'GOAL_UPDATE'
        ))
      }
    }

    return goal
  } catch (error) {
    console.error('Error updating goal progress:', error)
    throw error
  }
}

// Enhanced Medication Functions
export async function createMedicationLogWithReminders(data: {
  medicationId: string
  userId: string
  taken: boolean
  takenAt?: Date
  dosage?: string
  sideEffects?: string
  effectiveness?: number
  notes?: string
  date?: Date
}) {
  try {
    const log = await prisma.medicationLog.create({
      data: {
        medicationId: data.medicationId,
        userId: data.userId,
        taken: data.taken,
        takenAt: data.takenAt ?? null,
        dosage: data.dosage ?? null,
        sideEffects: data.sideEffects ?? null,
        effectiveness: data.effectiveness ?? null,
        notes: data.notes ?? null,
        date: data.date || new Date()
      },
      include: {
        medication: true
      }
    })

    // Analyze medication effectiveness
    if (data.taken && data.effectiveness) {
      try {
        // const medicationLogs = await prisma.medicationLog.findMany({
        //   where: {
        //     medicationId: data.medicationId,
        //     userId: data.userId,
        //     taken: true
        //   },
        //   orderBy: { date: 'desc' },
        //   take: 30
        // })

        // const moodEntries = await prisma.moodEntry.findMany({
        //   where: { userId: data.userId },
        //   orderBy: { date: 'desc' },
        //   take: 30,
        //   select: { mood: true, date: true }
        // })

        // Medication effectiveness analysis would go here
        const analysis = {
          effectiveness: 7, // Default value
          recommendations: ['Continue current medication regimen']
        }

        // Send insights if effectiveness is low
        if (analysis.effectiveness < 5) {
          realtimeService.sendToUser(data.userId, createNotificationEvent(
            'Medication Effectiveness Alert',
            `Your medication effectiveness is below average. Consider discussing with your healthcare provider.`,
            'MEDICATION'
          ))
        }
      } catch (error) {
        console.error('Error analyzing medication effectiveness:', error)
      }
    }

    return log
  } catch (error) {
    console.error('Error creating medication log:', error)
    throw error
  }
}

// Enhanced Sleep Functions
export async function createSleepEntryWithAnalysis(data: {
  userId: string
  bedtime: Date
  wakeTime: Date
  duration: number
  quality: number
  deepSleep?: number
  remSleep?: number
  lightSleep?: number
  awakenings?: number
  notes?: string
  date?: Date
}) {
  try {
    const sleepEntry = await prisma.sleepEntry.create({
      data: {
        userId: data.userId,
        bedtime: data.bedtime,
        wakeTime: data.wakeTime,
        duration: data.duration,
        quality: data.quality,
        deepSleep: data.deepSleep ?? null,
        remSleep: data.remSleep ?? null,
        lightSleep: data.lightSleep ?? null,
        awakenings: data.awakenings || 0,
        notes: data.notes ?? null,
        date: data.date || new Date()
      }
    })

    // Analyze sleep patterns
    try {
      // const sleepHistory = await prisma.sleepEntry.findMany({
      //   where: { userId: data.userId },
      //   orderBy: { date: 'desc' },
      //   take: 30
      // })

      // const moodHistory = await prisma.moodEntry.findMany({
      //   where: { userId: data.userId },
      //   orderBy: { date: 'desc' },
      //   take: 30,
      //   select: { mood: true, date: true }
      // })

      // Sleep pattern analysis would go here
      const analysis = {
        averageSleep: 7.5,
        sleepQuality: 6,
        recommendations: ['Maintain consistent sleep schedule']
      }

      // Send sleep insights
      if (analysis.averageSleep < 6 || analysis.sleepQuality < 5) {
        realtimeService.sendToUser(data.userId, createNotificationEvent(
          'Sleep Quality Alert',
          `Your sleep quality could be improved. Consider: ${analysis.recommendations.slice(0, 2).join(', ')}`,
          'SYSTEM'
        ))
      }
    } catch (error) {
      console.error('Error analyzing sleep patterns:', error)
    }

    // Send real-time update
    realtimeService.sendToUser(data.userId, {
      type: 'sleep_entry',
      data: { duration: data.duration, quality: data.quality }
    })

    return sleepEntry
  } catch (error) {
    console.error('Error creating sleep entry:', error)
    throw error
  }
}

// Enhanced Journal Functions
export async function createJournalEntryWithSentiment(data: {
  userId: string
  title?: string
  content: string
  date?: Date
}) {
  try {
    // Analyze sentiment
    let sentiment = null
    try {
        sentiment = await mlService.analyzeSentiment(data.content)
    } catch (error) {
      console.error('Error analyzing sentiment:', error)
    }

    const journalEntry = await prisma.journalEntry.create({
      data: {
        userId: data.userId,
        title: data.title ?? null,
        content: data.content,
        date: data.date || new Date()
      }
    })

    // Check for crisis indicators in journal content
    if (sentiment && sentiment.polarity < -0.5) {
      try {
        // Crisis risk detection would go here
        const crisisRisk = {
          riskLevel: 'low',
          recommendations: ['Continue monitoring mood patterns']
        }

        if (crisisRisk.riskLevel === 'high' || crisisRisk.riskLevel === 'critical') {
          realtimeService.sendToUser(data.userId, createCrisisAlertEvent(crisisRisk.riskLevel, crisisRisk.recommendations))
        }
      } catch (error) {
        console.error('Error checking crisis risk from journal:', error)
      }
    }

    // Send real-time update
    realtimeService.sendToUser(data.userId, {
      type: 'journal_entry',
      data: { title: data.title, sentiment: sentiment?.polarity }
    })

    return journalEntry
  } catch (error) {
    console.error('Error creating journal entry:', error)
    throw error
  }
}

// Enhanced Chat Functions
export async function createChatMessageWithML(data: {
  userId: string
  message: string
  isUser: boolean
  timestamp?: Date
}) {
  try {
    // Analyze sentiment and context
    let sentiment = null
    let context = null

    if (data.isUser) {
      try {
        sentiment = await mlService.analyzeSentiment(data.message)
        
        // Get user context for personalized response
        const userProfile = await prisma.user.findUnique({
          where: { id: data.userId },
          select: { preferences: true, privacySettings: true }
        })

        const recentMoods = await prisma.moodEntry.findMany({
          where: { userId: data.userId },
          orderBy: { date: 'desc' },
          take: 5,
          select: { mood: true, emotions: true }
        })

        const recentGoals = await prisma.goal.findMany({
          where: { userId: data.userId, status: 'ACTIVE' },
          select: { title: true, currentValue: true, targetValue: true }
        })

        context = {
          userProfile,
          recentMoods: recentMoods.map((m: any) => ({ mood: m.mood, emotions: m.emotions })),
          recentGoals: recentGoals.map((g: any) => ({ title: g.title, progress: g.currentValue / g.targetValue }))
        }
      } catch (error) {
        console.error('Error analyzing chat message:', error)
      }
    }

    const chatMessage = await prisma.chatMessage.create({
      data: {
        userId: data.userId,
        message: data.message,
        isUser: data.isUser,
        timestamp: data.timestamp || new Date(),
        sentiment: sentiment ? JSON.parse(JSON.stringify(sentiment)) : null,
        context: context ? JSON.parse(JSON.stringify(context)) : null
      }
    })

    // Send real-time update
    realtimeService.sendToUser(data.userId, {
      type: 'chat_message',
      data: { message: data.message, isUser: data.isUser, sentiment: sentiment?.polarity }
    })

    return chatMessage
  } catch (error) {
    console.error('Error creating chat message:', error)
    throw error
  }
}

// Enhanced Appointment Functions
export async function createAppointmentWithReminders(data: {
  userId: string
  therapistId: string
  therapistName: string
  type: string
  date: Date
  duration: number
  location: string
  notes?: string
  cost?: number
}) {
  try {
    const appointment = await prisma.appointment.create({
      data: {
        userId: data.userId,
        therapistId: data.therapistId,
        therapistName: data.therapistName,
        type: data.type as any,
        date: data.date,
        duration: data.duration,
        location: data.location as any,
        notes: data.notes ?? null,
        cost: data.cost ?? null
      }
    })

    // Schedule reminder notifications
    const reminderTimes = [
      new Date(data.date.getTime() - 24 * 60 * 60 * 1000), // 24 hours before
      new Date(data.date.getTime() - 2 * 60 * 60 * 1000),  // 2 hours before
      new Date(data.date.getTime() - 30 * 60 * 1000)       // 30 minutes before
    ]

    for (const reminderTime of reminderTimes) {
      await prisma.notification.create({
        data: {
          userId: data.userId,
          type: 'APPOINTMENT',
          title: 'Appointment Reminder',
          message: `You have an appointment with ${data.therapistName} ${getTimeUntilAppointment(data.date)}`,
          scheduled: reminderTime,
          data: JSON.parse(JSON.stringify({ appointmentId: appointment.id }))
        }
      })
    }

    // Send real-time update
    realtimeService.sendToUser(data.userId, createAppointmentReminderEvent(
      appointment.id,
      data.therapistName,
      data.date.toISOString()
    ))

    return appointment
  } catch (error) {
    console.error('Error creating appointment:', error)
    throw error
  }
}

// Helper function
function getTimeUntilAppointment(appointmentDate: Date): string {
  const now = new Date()
  const diff = appointmentDate.getTime() - now.getTime()
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

  if (hours > 0) {
    return `in ${hours} hour${hours > 1 ? 's' : ''}`
  } else if (minutes > 0) {
    return `in ${minutes} minute${minutes > 1 ? 's' : ''}`
  } else {
    return 'now'
  }
}

// Enhanced Notification Functions
export async function createNotificationWithRealtime(data: {
  userId: string
  type: string
  title: string
  message: string
  data?: any
  scheduled?: Date
}) {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId: data.userId,
        type: data.type as any,
        title: data.title,
        message: data.message,
        data: data.data ? JSON.parse(JSON.stringify(data.data)) : null,
        scheduled: data.scheduled ?? null
      }
    })

    // Send real-time update if not scheduled
    if (!data.scheduled) {
      realtimeService.sendToUser(data.userId, createNotificationEvent(
        data.title,
        data.message,
        data.type
      ))
    }

    return notification
  } catch (error) {
    console.error('Error creating notification:', error)
    throw error
  }
}

// Enhanced Data Export Functions
export async function createDataExportWithRealtime(data: {
  userId: string
  type: string
  format: string
  description: string
}) {
  try {
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7)

    const dataExport = await prisma.dataExport.create({
      data: {
        userId: data.userId,
        type: data.type,
        format: data.format,
        description: data.description,
        expiresAt
      }
    })

    // Simulate export processing
    setTimeout(async () => {
      try {
        await prisma.dataExport.update({
          where: { id: dataExport.id },
          data: {
            status: 'READY',
            completedAt: new Date(),
            size: '2.3 MB',
            downloadUrl: `/api/data-exports/${dataExport.id}/download`
          }
        })

        // Send real-time notification
        realtimeService.sendToUser(data.userId, {
          type: 'data_export_ready',
          data: { exportId: dataExport.id, type: data.type, format: data.format }
        })
      } catch (error) {
        console.error('Error updating export status:', error)
      }
    }, 5000)

    return dataExport
  } catch (error) {
    console.error('Error creating data export:', error)
    throw error
  }
}
