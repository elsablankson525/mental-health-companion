import { prisma } from './db'
// import { getServerSession } from 'next-auth'
// import { authOptions } from './auth'

// Mood Entry Services
export async function createMoodEntry(data: {
  mood: number
  emotions: string[]
  note?: string
  userId: string
}) {
  return await prisma.moodEntry.create({
    data: {
      mood: data.mood,
      emotions: data.emotions,
      note: data.note ?? null,
      userId: data.userId,
    },
  })
}

export async function getMoodEntries(userId: string, limit?: number) {
  return await prisma.moodEntry.findMany({
    where: { userId },
    orderBy: { date: 'desc' },
    ...(limit && { take: limit }),
  })
}

export async function getMoodEntriesByDateRange(userId: string, startDate: Date, endDate: Date) {
  return await prisma.moodEntry.findMany({
    where: {
      userId,
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    orderBy: { date: 'desc' },
  })
}

// Journal Entry Services
export async function createJournalEntry(data: {
  title?: string
  content: string
  userId: string
}) {
  return await prisma.journalEntry.create({
    data: {
      title: data.title ?? null,
      content: data.content,
      userId: data.userId,
    },
  })
}

export async function getJournalEntries(userId: string, limit?: number) {
  return await prisma.journalEntry.findMany({
    where: { userId },
    orderBy: { date: 'desc' },
    ...(limit && { take: limit }),
  })
}

export async function getJournalEntryById(id: string, userId: string) {
  return await prisma.journalEntry.findFirst({
    where: { id, userId },
  })
}

export async function updateJournalEntry(id: string, userId: string, data: {
  title?: string
  content: string
}) {
  return await prisma.journalEntry.updateMany({
    where: { id, userId },
    data,
  })
}

export async function deleteJournalEntry(id: string, userId: string) {
  return await prisma.journalEntry.deleteMany({
    where: { id, userId },
  })
}

// Chat Message Services
export async function createChatMessage(data: {
  message: string
  isUser: boolean
  userId: string
}) {
  return await prisma.chatMessage.create({
    data: {
      message: data.message,
      isUser: data.isUser,
      userId: data.userId,
    },
  })
}

export async function getChatMessages(userId: string, limit?: number) {
  return await prisma.chatMessage.findMany({
    where: { userId },
    orderBy: { timestamp: 'desc' },
    ...(limit && { take: limit }),
  })
}

export async function getChatMessagesByDateRange(userId: string, startDate: Date, endDate: Date) {
  return await prisma.chatMessage.findMany({
    where: {
      userId,
      timestamp: {
        gte: startDate,
        lte: endDate,
      },
    },
    orderBy: { timestamp: 'desc' },
  })
}

// User Services
export async function getUserById(id: string) {
  return await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
    },
  })
}

export async function getUserStats(userId: string) {
  const [moodCount, journalCount, chatCount] = await Promise.all([
    prisma.moodEntry.count({ where: { userId } }),
    prisma.journalEntry.count({ where: { userId } }),
    prisma.chatMessage.count({ where: { userId } }),
  ])

  return {
    moodEntries: moodCount,
    journalEntries: journalCount,
    chatMessages: chatCount,
  }
}
