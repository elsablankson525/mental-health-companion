import { prisma } from './db'
// import { getServerSession } from 'next-auth'
// import { authOptions } from './auth'

// Connection pool configuration
// const CONNECTION_POOL_SIZE = 10
// const QUERY_TIMEOUT = 30000 // 30 seconds

// Cache configuration
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes
const cache = new Map<string, { data: any; timestamp: number }>()

// Cache helper functions
function getCacheKey(prefix: string, params: Record<string, any>): string {
  return `${prefix}:${JSON.stringify(params)}`
}

function getFromCache<T>(key: string): T | null {
  const cached = cache.get(key)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data
  }
  cache.delete(key)
  return null
}

function setCache<T>(key: string, data: T): void {
  cache.set(key, { data, timestamp: Date.now() })
}

// Clean up cache periodically
setInterval(() => {
  const now = Date.now()
  for (const [key, value] of cache.entries()) {
    if (now - value.timestamp > CACHE_TTL) {
      cache.delete(key)
    }
  }
}, CACHE_TTL)

// Optimized Mood Entry Services
export async function createMoodEntry(data: {
  mood: number
  emotions: string[]
  note?: string
  userId: string
}) {
  const result = await prisma.moodEntry.create({
    data: {
      mood: data.mood,
      emotions: data.emotions,
      note: data.note ?? null,
      userId: data.userId,
    },
  })
  
  // Invalidate related caches
  const cacheKeys = [
    `mood_entries:${data.userId}`,
    `mood_stats:${data.userId}`,
    `mood_trends:${data.userId}`
  ]
  cacheKeys.forEach(key => cache.delete(key))
  
  return result
}

export async function getMoodEntries(userId: string, limit?: number) {
  const cacheKey = getCacheKey('mood_entries', { userId, limit })
  const cached = getFromCache(cacheKey)
  if (cached) return cached

  const entries = await prisma.moodEntry.findMany({
    where: { userId },
    orderBy: { date: 'desc' },
    take: limit || 50, // Default limit to prevent large queries
    select: {
      id: true,
      mood: true,
      emotions: true,
      note: true,
      date: true,
      createdAt: true,
    }
  })

  setCache(cacheKey, entries)
  return entries
}

export async function getMoodEntriesByDateRange(userId: string, startDate: Date, endDate: Date) {
  const cacheKey = getCacheKey('mood_entries_range', { userId, startDate, endDate })
  const cached = getFromCache(cacheKey)
  if (cached) return cached

  const entries = await prisma.moodEntry.findMany({
    where: {
      userId,
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    orderBy: { date: 'desc' },
    select: {
      id: true,
      mood: true,
      emotions: true,
      note: true,
      date: true,
    }
  })

  setCache(cacheKey, entries)
  return entries
}

export async function getMoodStats(userId: string) {
  const cacheKey = getCacheKey('mood_stats', { userId })
  const cached = getFromCache(cacheKey)
  if (cached) return cached

  const [totalEntries, avgMood, recentEntries] = await Promise.all([
    prisma.moodEntry.count({ where: { userId } }),
    prisma.moodEntry.aggregate({
      where: { userId },
      _avg: { mood: true }
    }),
    prisma.moodEntry.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      take: 7,
      select: { mood: true, date: true }
    })
  ])

  const stats = {
    totalEntries,
    averageMood: avgMood._avg.mood || 0,
    recentTrend: recentEntries.map((entry: any) => entry.mood),
    lastEntry: recentEntries[0] || null
  }

  setCache(cacheKey, stats)
  return stats
}

// Optimized Journal Entry Services
export async function createJournalEntry(data: {
  title?: string
  content: string
  userId: string
}) {
  const result = await prisma.journalEntry.create({
    data: {
      title: data.title ?? null,
      content: data.content,
      userId: data.userId,
    },
  })
  
  // Invalidate related caches
  const cacheKeys = [
    `journal_entries:${data.userId}`,
    `journal_stats:${data.userId}`
  ]
  cacheKeys.forEach(key => cache.delete(key))
  
  return result
}

export async function getJournalEntries(userId: string, limit?: number) {
  const cacheKey = getCacheKey('journal_entries', { userId, limit })
  const cached = getFromCache(cacheKey)
  if (cached) return cached

  const entries = await prisma.journalEntry.findMany({
    where: { userId },
    orderBy: { date: 'desc' },
    take: limit || 20,
    select: {
      id: true,
      title: true,
      content: true,
      date: true,
      createdAt: true,
    }
  })

  setCache(cacheKey, entries)
  return entries
}

export async function getJournalEntryById(id: string, userId: string) {
  const cacheKey = getCacheKey('journal_entry', { id, userId })
  const cached = getFromCache(cacheKey)
  if (cached) return cached

  const entry = await prisma.journalEntry.findFirst({
    where: { id, userId },
    select: {
      id: true,
      title: true,
      content: true,
      date: true,
      createdAt: true,
      updatedAt: true,
    }
  })

  if (entry) {
    setCache(cacheKey, entry)
  }
  return entry
}

// Optimized Chat Message Services
export async function createChatMessage(data: {
  message: string
  isUser: boolean
  userId: string
}) {
  const result = await prisma.chatMessage.create({
    data: {
      message: data.message,
      isUser: data.isUser,
      userId: data.userId,
    },
  })
  
  // Invalidate related caches
  const cacheKeys = [
    `chat_messages:${data.userId}`,
    `chat_stats:${data.userId}`
  ]
  cacheKeys.forEach(key => cache.delete(key))
  
  return result
}

export async function getChatMessages(userId: string, limit?: number) {
  const cacheKey = getCacheKey('chat_messages', { userId, limit })
  const cached = getFromCache(cacheKey)
  if (cached) return cached

  const messages = await prisma.chatMessage.findMany({
    where: { userId },
    orderBy: { timestamp: 'desc' },
    take: limit || 50,
    select: {
      id: true,
      message: true,
      isUser: true,
      timestamp: true,
      sentiment: true,
    }
  })

  setCache(cacheKey, messages)
  return messages
}

// Optimized User Services
export async function getUserById(id: string) {
  const cacheKey = getCacheKey('user', { id })
  const cached = getFromCache(cacheKey)
  if (cached) return cached

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      preferences: true,
    },
  })

  if (user) {
    setCache(cacheKey, user)
  }
  return user
}

export async function getUserStats(userId: string) {
  const cacheKey = getCacheKey('user_stats', { userId })
  const cached = getFromCache(cacheKey)
  if (cached) return cached

  const [moodCount, journalCount, chatCount] = await Promise.all([
    prisma.moodEntry.count({ where: { userId } }),
    prisma.journalEntry.count({ where: { userId } }),
    prisma.chatMessage.count({ where: { userId } }),
  ])

  const stats = {
    moodEntries: moodCount,
    journalEntries: journalCount,
    chatMessages: chatCount,
  }

  setCache(cacheKey, stats)
  return stats
}

// Batch operations for better performance
export async function getDashboardData(userId: string) {
  const cacheKey = getCacheKey('dashboard_data', { userId })
  const cached = getFromCache(cacheKey)
  if (cached) return cached

  const [
    recentMoods,
    recentJournals,
    recentChats,
    userStats
  ] = await Promise.all([
    getMoodEntries(userId, 7),
    getJournalEntries(userId, 5),
    getChatMessages(userId, 10),
    getUserStats(userId)
  ])

  const dashboardData = {
    recentMoods,
    recentJournals,
    recentChats,
    userStats
  }

  setCache(cacheKey, dashboardData)
  return dashboardData
}

// Health check with connection pool status
export async function getDatabaseHealth() {
  try {
    const start = Date.now()
    await prisma.$queryRaw`SELECT 1`
    const responseTime = Date.now() - start
    
    return {
      status: 'healthy',
      responseTime,
      cacheSize: cache.size,
      timestamp: new Date().toISOString()
    }
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }
  }
}

// Cleanup function for graceful shutdown
export async function cleanup() {
  cache.clear()
  await prisma.$disconnect()
}
