import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // Create a demo user
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@mentalhealth.com' },
    update: {},
    create: {
      email: 'demo@mentalhealth.com',
      name: 'Demo User',
      password: await hash('demo123', 12),
    },
  })

  console.log('✅ Created demo user:', demoUser.email)

  // Create sample mood entries
  const moodEntries = [
    {
      mood: 8,
      emotions: ['Happy', 'Grateful', 'Confident'],
      note: 'Had a great day at work! Completed my project and received positive feedback.',
      date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    },
    {
      mood: 6,
      emotions: ['Calm', 'Peaceful'],
      note: 'Spent the evening reading and relaxing. Feeling content.',
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    },
    {
      mood: 4,
      emotions: ['Anxious', 'Overwhelmed'],
      note: 'Feeling stressed about upcoming deadlines. Need to organize my tasks better.',
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    },
    {
      mood: 7,
      emotions: ['Excited', 'Happy'],
      note: 'Had a wonderful time with friends. Laughter is truly the best medicine.',
      date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
    },
    {
      mood: 5,
      emotions: ['Neutral'],
      note: 'Average day. Nothing particularly exciting or challenging.',
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    },
    {
      mood: 3,
      emotions: ['Sad', 'Lonely'],
      note: 'Feeling down today. Missing family and feeling isolated.',
      date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), // 6 days ago
    },
    {
      mood: 9,
      emotions: ['Happy', 'Excited', 'Grateful'],
      note: 'Amazing day! Got promoted at work and celebrated with loved ones.',
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    },
  ]

  for (const entry of moodEntries) {
    await prisma.moodEntry.create({
      data: {
        ...entry,
        userId: demoUser.id,
      },
    })
  }

  console.log('✅ Created', moodEntries.length, 'mood entries')

  // Create sample journal entries
  const journalEntries = [
    {
      title: 'Reflecting on Growth',
      content: `Today I realized how much I've grown over the past year. 
      
There were times when I felt like giving up, but I kept pushing forward. The challenges I faced taught me resilience and helped me discover strengths I didn't know I had.

I'm grateful for the support system around me and the opportunities that have come my way. Looking forward to what the future holds.`,
      date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    },
    {
      title: 'Mindful Morning',
      content: `Started my day with meditation and it made such a difference. 
      
I've been trying to establish a morning routine that includes mindfulness practices. Today I spent 10 minutes in meditation, focusing on my breathing and setting positive intentions for the day.

The rest of the day felt more centered and peaceful. I want to make this a daily habit.`,
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    },
    {
      title: 'Overcoming Anxiety',
      content: `Had a panic attack today, but I used the coping strategies I've learned.
      
I felt the familiar tightness in my chest and racing thoughts. Instead of fighting it, I acknowledged what was happening and used the 5-4-3-2-1 grounding technique.

It took about 15 minutes, but I was able to calm down. I'm proud of myself for handling it better than I used to.`,
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    },
    {
      title: 'Gratitude Practice',
      content: `Three things I'm grateful for today:
      
1. The beautiful sunset I witnessed during my evening walk
2. A heartfelt conversation with my best friend
3. The delicious homemade meal I prepared

Practicing gratitude has been helping me shift my perspective. Even on difficult days, there are always small moments of joy to appreciate.`,
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    },
  ]

  for (const entry of journalEntries) {
    await prisma.journalEntry.create({
      data: {
        ...entry,
        userId: demoUser.id,
      },
    })
  }

  console.log('✅ Created', journalEntries.length, 'journal entries')

  // Create sample chat messages
  const chatMessages = [
    {
      message: "Hello! I'm here to listen and support you. How are you feeling today?",
      isUser: false,
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    },
    {
      message: "I'm feeling a bit overwhelmed with work lately. There's so much to do and I don't know where to start.",
      isUser: true,
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 5 * 60 * 1000), // 5 minutes later
    },
    {
      message: "I understand that feeling of being overwhelmed. It's completely normal to feel that way when facing multiple responsibilities. Let's break this down together. What's one small task you could tackle first?",
      isUser: false,
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 10 * 60 * 1000), // 10 minutes later
    },
    {
      message: "I think I could start by organizing my email inbox. That seems manageable.",
      isUser: true,
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 15 * 60 * 1000), // 15 minutes later
    },
    {
      message: "That's a great starting point! Organizing your inbox can help create a sense of control and accomplishment. Remember, you don't have to do everything at once. Taking small steps is perfectly okay.",
      isUser: false,
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 20 * 60 * 1000), // 20 minutes later
    },
    {
      message: "Thank you for the encouragement. I feel a bit better about tackling this step by step.",
      isUser: true,
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 25 * 60 * 1000), // 25 minutes later
    },
    {
      message: "You're very welcome! I'm glad I could help. Remember, progress is progress, no matter how small. You've got this!",
      isUser: false,
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000), // 30 minutes later
    },
  ]

  for (const message of chatMessages) {
    await prisma.chatMessage.create({
      data: {
        ...message,
        userId: demoUser.id,
      },
    })
  }

  console.log('✅ Created', chatMessages.length, 'chat messages')

  console.log('🎉 Database seeding completed successfully!')
  console.log('📧 Demo user email: demo@mentalhealth.com')
  console.log('🔑 Demo user password: demo123')
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
