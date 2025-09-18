import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌍 Starting database population with Ghana and global mental health data...')

  // Create sample users for Ghana and global contexts
  const ghanaUser = await prisma.user.upsert({
    where: { email: 'ghana.user@mentalhealth.gh' },
    update: {},
    create: {
      email: 'ghana.user@mentalhealth.gh',
      name: 'Ghana Mental Health User',
      password: '$2a$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJpJ1l8s8cJ9aJ9aJ9a', // hashed password
      phone: '+233 24 123 4567',
      language: 'en',
      timezone: 'Africa/Accra',
      preferences: {
        country: 'Ghana',
        region: 'Greater Accra',
        culturalContext: 'West African',
        preferredLanguage: 'English'
      }
    }
  })

  const globalUser = await prisma.user.upsert({
    where: { email: 'global.user@mentalhealth.world' },
    update: {},
    create: {
      email: 'global.user@mentalhealth.world',
      name: 'Global Mental Health User',
      password: '$2a$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJpJ1l8s8cJ9aJ9aJ9a',
      phone: '+1 555 123 4567',
      language: 'en',
      timezone: 'UTC',
      preferences: {
        country: 'Global',
        region: 'International',
        culturalContext: 'Multicultural',
        preferredLanguage: 'English'
      }
    }
  })

  console.log('✅ Created sample users')

  // Note: Crisis resources are now handled in the components directly
  // Ghana-specific crisis resources
  /*
  const ghanaCrisisResources = [
    {
      name: "Ghana Mental Health Authority Crisis Line",
      type: "hotline",
      contact: "+233 302 666 000",
      description: "24/7 crisis support and mental health emergency services in Ghana",
      availability: "24/7",
      isFree: true,
      is24_7: true,
      category: "crisis",
      website: "https://www.mhag.gov.gh",
      rating: 4.5,
      tags: ["crisis", "24/7", "free", "ghana", "mental health authority"]
    },
    {
      name: "Accra Psychiatric Hospital Emergency",
      type: "hotline",
      contact: "+233 302 666 000",
      description: "Emergency psychiatric services and crisis intervention in Accra",
      availability: "24/7",
      isFree: true,
      is24_7: true,
      category: "crisis",
      website: "https://www.aph.gov.gh",
      rating: 4.3,
      tags: ["psychiatric", "emergency", "accra", "hospital", "crisis"]
    },
    {
      name: "Kumasi Psychiatric Hospital",
      type: "hotline",
      contact: "+233 322 020 000",
      description: "Mental health services and crisis support in Kumasi",
      availability: "24/7",
      isFree: true,
      is24_7: true,
      category: "crisis",
      website: "https://www.kph.gov.gh",
      rating: 4.2,
      tags: ["psychiatric", "kumasi", "hospital", "crisis", "ashanti"]
    },
    {
      name: "Cape Coast Psychiatric Hospital",
      type: "hotline",
      contact: "+233 332 120 000",
      description: "Mental health services for Central Region",
      availability: "24/7",
      isFree: true,
      is24_7: true,
      category: "crisis",
      website: "https://www.ccph.gov.gh",
      rating: 4.1,
      tags: ["psychiatric", "cape coast", "central region", "hospital"]
    },
    {
      name: "Ghana Health Service Mental Health Unit",
      type: "website",
      contact: "+233 302 665 000",
      description: "National mental health coordination and resource directory",
      availability: "Monday-Friday 8AM-5PM",
      isFree: true,
      is24_7: false,
      category: "general",
      website: "https://www.ghs.gov.gh/mental-health",
      rating: 4.4,
      tags: ["health service", "coordination", "resources", "national"]
    },
    {
      name: "Mental Health Society of Ghana",
      type: "website",
      contact: "+233 302 123 456",
      description: "Community support and advocacy for mental health in Ghana",
      availability: "Monday-Friday 9AM-4PM",
      isFree: true,
      is24_7: false,
      category: "general",
      website: "https://www.mhsog.org",
      rating: 4.6,
      tags: ["community", "support", "advocacy", "society"]
    }
  ]
  */

  // Global crisis resources
  /*
  const globalCrisisResources = [
    {
      name: "988 Suicide & Crisis Lifeline",
      type: "hotline",
      contact: "988",
      description: "24/7 crisis support for anyone experiencing emotional distress or suicidal thoughts (US)",
      availability: "24/7",
      isFree: true,
      is24_7: true,
      category: "suicide",
      website: "https://988lifeline.org",
      rating: 4.8,
      tags: ["suicide", "crisis", "24/7", "free", "us"]
    },
    {
      name: "Crisis Text Line",
      type: "text",
      contact: "Text HOME to 741741",
      description: "Free, 24/7 crisis support via text message (US)",
      availability: "24/7",
      isFree: true,
      is24_7: true,
      category: "crisis",
      website: "https://crisistextline.org",
      rating: 4.7,
      tags: ["crisis", "text", "24/7", "free", "us"]
    },
    {
      name: "Samaritans (UK)",
      type: "hotline",
      contact: "116 123",
      description: "24/7 emotional support for anyone in distress (UK)",
      availability: "24/7",
      isFree: true,
      is24_7: true,
      category: "crisis",
      website: "https://www.samaritans.org",
      rating: 4.9,
      tags: ["crisis", "24/7", "free", "uk", "samaritans"]
    },
    {
      name: "Lifeline Australia",
      type: "hotline",
      contact: "13 11 14",
      description: "24/7 crisis support and suicide prevention (Australia)",
      availability: "24/7",
      isFree: true,
      is24_7: true,
      category: "suicide",
      website: "https://www.lifeline.org.au",
      rating: 4.8,
      tags: ["suicide", "crisis", "24/7", "free", "australia"]
    },
    {
      name: "International Association for Suicide Prevention",
      type: "website",
      contact: "Visit iasp.info/resources",
      description: "Global directory of crisis centers and suicide prevention resources",
      availability: "24/7",
      isFree: true,
      is24_7: true,
      category: "suicide",
      website: "https://www.iasp.info/resources",
      rating: 4.7,
      tags: ["suicide", "prevention", "global", "directory", "international"]
    },
    {
      name: "Befrienders Worldwide",
      type: "website",
      contact: "Visit befrienders.org",
      description: "Global network of emotional support services",
      availability: "24/7",
      isFree: true,
      is24_7: true,
      category: "general",
      website: "https://www.befrienders.org",
      rating: 4.6,
      tags: ["support", "global", "network", "emotional"]
    }
  ]
  */

  // Create emergency contacts for Ghana user
  const ghanaEmergencyContacts = [
    {
      userId: ghanaUser.id,
      name: "Dr. Kwame Asante",
      relationship: "Psychiatrist",
      phone: "+233 24 123 4567",
      email: "dr.asante@aph.gov.gh",
      address: "Accra Psychiatric Hospital, Accra, Ghana",
      notes: "Specializes in mood disorders and crisis intervention",
      isPrimary: true,
      isAvailable24_7: false
    },
    {
      userId: ghanaUser.id,
      name: "Ama Serwaa",
      relationship: "Family",
      phone: "+233 24 987 6543",
      email: "ama.serwaa@email.com",
      notes: "Always available for emotional support",
      isPrimary: false,
      isAvailable24_7: true
    },
    {
      userId: ghanaUser.id,
      name: "Ghana Mental Health Authority",
      relationship: "Crisis Service",
      phone: "+233 302 666 000",
      email: "crisis@mhag.gov.gh",
      address: "Ministry of Health, Accra, Ghana",
      notes: "24/7 crisis intervention and emergency mental health services",
      isPrimary: false,
      isAvailable24_7: true
    }
  ]

  // Create emergency contacts for global user
  const globalEmergencyContacts = [
    {
      userId: globalUser.id,
      name: "Dr. Sarah Johnson",
      relationship: "Therapist",
      phone: "+1 555 123 4567",
      email: "sarah.johnson@therapy.com",
      address: "123 Main St, City, State 12345",
      notes: "Available Monday-Friday 9AM-5PM",
      isPrimary: true,
      isAvailable24_7: false
    },
    {
      userId: globalUser.id,
      name: "Mom",
      relationship: "Family",
      phone: "+1 555 987 6543",
      email: "mom@email.com",
      notes: "Always available for support",
      isPrimary: false,
      isAvailable24_7: true
    },
    {
      userId: globalUser.id,
      name: "988 Suicide & Crisis Lifeline",
      relationship: "Crisis Service",
      phone: "988",
      notes: "24/7 crisis support for emotional distress",
      isPrimary: false,
      isAvailable24_7: true
    }
  ]

  // Insert emergency contacts
  for (const contact of ghanaEmergencyContacts) {
    await prisma.emergencyContact.create({
      data: contact
    })
  }

  for (const contact of globalEmergencyContacts) {
    await prisma.emergencyContact.create({
      data: contact
    })
  }

  console.log('✅ Created emergency contacts')

  // Create sample mood entries with Ghana and global context
  const ghanaMoodEntries = [
    {
      userId: ghanaUser.id,
      mood: 7,
      emotions: ["hopeful", "grateful", "motivated"],
      note: "Feeling optimistic about the new mental health initiatives in Ghana. The community support is growing stronger.",
      date: new Date('2024-01-15T10:00:00Z')
    },
    {
      userId: ghanaUser.id,
      mood: 5,
      emotions: ["anxious", "overwhelmed"],
      note: "Work stress is affecting my sleep. Need to practice more mindfulness techniques.",
      date: new Date('2024-01-14T15:30:00Z')
    },
    {
      userId: ghanaUser.id,
      mood: 8,
      emotions: ["joyful", "peaceful", "connected"],
      note: "Had a great session with my therapist. Feeling more connected to my cultural roots and family traditions.",
      date: new Date('2024-01-13T14:20:00Z')
    }
  ]

  const globalMoodEntries = [
    {
      userId: globalUser.id,
      mood: 6,
      emotions: ["curious", "reflective"],
      note: "Learning about different cultural approaches to mental health. Fascinating how different societies handle wellness.",
      date: new Date('2024-01-15T11:00:00Z')
    },
    {
      userId: globalUser.id,
      mood: 4,
      emotions: ["stressed", "lonely"],
      note: "Feeling isolated despite being connected globally. Sometimes digital connection isn't enough.",
      date: new Date('2024-01-14T16:45:00Z')
    },
    {
      userId: globalUser.id,
      mood: 7,
      emotions: ["inspired", "hopeful"],
      note: "Reading about mental health initiatives worldwide gives me hope for better global mental health support.",
      date: new Date('2024-01-13T12:30:00Z')
    }
  ]

  // Insert mood entries
  for (const entry of ghanaMoodEntries) {
    await prisma.moodEntry.create({
      data: entry
    })
  }

  for (const entry of globalMoodEntries) {
    await prisma.moodEntry.create({
      data: entry
    })
  }

  console.log('✅ Created mood entries')

  // Create journal entries with cultural context
  const ghanaJournalEntries = [
    {
      userId: ghanaUser.id,
      title: "Reflections on Mental Health in Ghana",
      content: "Today I'm thinking about how mental health is perceived in our community. There's still stigma, but I see progress. The Mental Health Authority is doing good work, and more people are talking about it openly. I'm grateful for the traditional healing practices that complement modern therapy.",
      date: new Date('2024-01-15T09:00:00Z')
    },
    {
      userId: ghanaUser.id,
      title: "Family Support and Cultural Identity",
      content: "Had a meaningful conversation with my grandmother about our family's approach to emotional wellbeing. She shared wisdom about community support and the importance of staying connected to our roots. This cultural perspective on mental health is invaluable.",
      date: new Date('2024-01-14T18:00:00Z')
    }
  ]

  const globalJournalEntries = [
    {
      userId: globalUser.id,
      title: "Global Mental Health Perspectives",
      content: "I've been researching mental health approaches from different countries. It's fascinating how cultural context shapes our understanding of mental wellness. From Ghana's community-based approaches to Nordic countries' social support systems, there's so much to learn.",
      date: new Date('2024-01-15T10:30:00Z')
    },
    {
      userId: globalUser.id,
      title: "Digital Wellness in a Connected World",
      content: "Living in a globally connected world has its challenges. While technology helps us access mental health resources from anywhere, it can also create isolation. Finding balance between digital connection and real human interaction is key.",
      date: new Date('2024-01-14T19:15:00Z')
    }
  ]

  // Insert journal entries
  for (const entry of ghanaJournalEntries) {
    await prisma.journalEntry.create({
      data: entry
    })
  }

  for (const entry of globalJournalEntries) {
    await prisma.journalEntry.create({
      data: entry
    })
  }

  console.log('✅ Created journal entries')

  // Create community posts with Ghana and global themes
  const ghanaCommunityPosts = [
    {
      userId: ghanaUser.id,
      title: "Mental Health Awareness in Ghana - Let's Break the Stigma",
      content: "I've noticed positive changes in how mental health is discussed in Ghana. The Mental Health Authority's initiatives are making a difference. Let's continue supporting each other and breaking down barriers. What are your experiences with mental health support in Ghana?",
      category: "Support",
      tags: ["ghana", "mental health", "stigma", "community", "support"],
      isPublic: true
    },
    {
      userId: ghanaUser.id,
      title: "Traditional Healing and Modern Therapy - Finding Balance",
      content: "In Ghana, we have rich traditional healing practices that complement modern mental health care. How do you balance traditional approaches with contemporary therapy? I'd love to hear about your experiences.",
      category: "Wellness",
      tags: ["traditional healing", "therapy", "balance", "ghana", "wellness"],
      isPublic: true
    }
  ]

  const globalCommunityPosts = [
    {
      userId: globalUser.id,
      title: "Global Mental Health Resources - Sharing Knowledge",
      content: "I'm compiling a list of mental health resources from different countries. It's amazing how diverse approaches can be. From Ghana's community-based support to Nordic countries' social systems, each culture offers unique insights. What resources from your country would you recommend?",
      category: "Resources",
      tags: ["global", "resources", "mental health", "international", "support"],
      isPublic: true
    },
    {
      userId: globalUser.id,
      title: "Cultural Perspectives on Mental Wellness",
      content: "Mental health is experienced differently across cultures. What cultural practices or beliefs about mental wellness do you find helpful? I'm particularly interested in learning about non-Western approaches to emotional wellbeing.",
      category: "Discussion",
      tags: ["culture", "mental wellness", "perspectives", "global", "discussion"],
      isPublic: true
    }
  ]

  // Insert community posts
  for (const post of ghanaCommunityPosts) {
    await prisma.communityPost.create({
      data: post
    })
  }

  for (const post of globalCommunityPosts) {
    await prisma.communityPost.create({
      data: post
    })
  }

  console.log('✅ Created community posts')

  // Create wellness activities with cultural context
  const ghanaWellnessActivities = [
    {
      userId: ghanaUser.id,
      name: "Traditional Drumming Session",
      category: "Cultural",
      description: "Participating in traditional Ghanaian drumming for emotional expression and community connection",
      duration: 60,
      intensity: "Moderate"
    },
    {
      userId: ghanaUser.id,
      name: "Community Storytelling Circle",
      category: "Social",
      description: "Sharing stories and experiences in a supportive community setting",
      duration: 90,
      intensity: "Low"
    },
    {
      userId: ghanaUser.id,
      name: "Nature Walk in Aburi Gardens",
      category: "Physical",
      description: "Walking meditation in the beautiful botanical gardens of Aburi",
      duration: 45,
      intensity: "Low"
    }
  ]

  const globalWellnessActivities = [
    {
      userId: globalUser.id,
      name: "International Mindfulness Practice",
      category: "Mindfulness",
      description: "Practicing mindfulness techniques from different cultural traditions",
      duration: 30,
      intensity: "Low"
    },
    {
      userId: globalUser.id,
      name: "Global Music Therapy",
      category: "Cultural",
      description: "Exploring music therapy approaches from various cultures",
      duration: 60,
      intensity: "Moderate"
    },
    {
      userId: globalUser.id,
      name: "Virtual Cultural Exchange",
      category: "Social",
      description: "Connecting with people from different countries to share mental health experiences",
      duration: 120,
      intensity: "Low"
    }
  ]

  // Insert wellness activities
  for (const activity of ghanaWellnessActivities) {
    await prisma.wellnessActivity.create({
      data: activity
    })
  }

  for (const activity of globalWellnessActivities) {
    await prisma.wellnessActivity.create({
      data: activity
    })
  }

  console.log('✅ Created wellness activities')

  // Create goals with cultural context
  const ghanaGoals = [
    {
      userId: ghanaUser.id,
      title: "Improve Mental Health Awareness in My Community",
      description: "Share information about mental health resources and reduce stigma in my local community",
      category: "Social Impact",
      targetValue: 50,
      currentValue: 12,
      unit: "people reached",
      startDate: new Date('2024-01-01'),
      targetDate: new Date('2024-12-31'),
      priority: 1
    },
    {
      userId: ghanaUser.id,
      title: "Practice Traditional Healing Methods",
      description: "Learn and incorporate traditional Ghanaian healing practices into my wellness routine",
      category: "Cultural Wellness",
      targetValue: 30,
      currentValue: 8,
      unit: "sessions completed",
      startDate: new Date('2024-01-01'),
      targetDate: new Date('2024-06-30'),
      priority: 2
    }
  ]

  const globalGoals = [
    {
      userId: globalUser.id,
      title: "Learn About Global Mental Health Approaches",
      description: "Research and understand mental health practices from different countries and cultures",
      category: "Education",
      targetValue: 20,
      currentValue: 7,
      unit: "countries studied",
      startDate: new Date('2024-01-01'),
      targetDate: new Date('2024-12-31'),
      priority: 1
    },
    {
      userId: globalUser.id,
      title: "Build International Support Network",
      description: "Connect with mental health advocates and professionals from around the world",
      category: "Social",
      targetValue: 15,
      currentValue: 4,
      unit: "connections made",
      startDate: new Date('2024-01-01'),
      targetDate: new Date('2024-08-31'),
      priority: 2
    }
  ]

  // Insert goals
  for (const goal of ghanaGoals) {
    await prisma.goal.create({
      data: goal
    })
  }

  for (const goal of globalGoals) {
    await prisma.goal.create({
      data: goal
    })
  }

  console.log('✅ Created goals')

  // Create chat messages with cultural context
  const ghanaChatMessages = [
    {
      userId: ghanaUser.id,
      message: "I'm feeling overwhelmed with work and family responsibilities. Any advice?",
      isUser: true,
      timestamp: new Date('2024-01-15T10:00:00Z')
    },
    {
      userId: ghanaUser.id,
      message: "I understand you're feeling overwhelmed. In Ghana, we often find strength in community support. Have you considered reaching out to family members or community elders? They often have wisdom about balancing responsibilities. Also, the Ghana Mental Health Authority has excellent resources for stress management.",
      isUser: false,
      timestamp: new Date('2024-01-15T10:01:00Z')
    },
    {
      userId: ghanaUser.id,
      message: "That's helpful. I think I'll talk to my grandmother - she always has good advice about managing stress.",
      isUser: true,
      timestamp: new Date('2024-01-15T10:02:00Z')
    }
  ]

  const globalChatMessages = [
    {
      userId: globalUser.id,
      message: "I'm interested in learning about mental health approaches from different cultures. What can you tell me?",
      isUser: true,
      timestamp: new Date('2024-01-15T11:00:00Z')
    },
    {
      userId: globalUser.id,
      message: "That's a wonderful question! Different cultures have unique approaches to mental wellness. For example, Ghana emphasizes community support and traditional healing practices alongside modern therapy. Nordic countries focus on social support systems and work-life balance. Many Asian cultures incorporate mindfulness and meditation. Each approach offers valuable insights into holistic mental health care.",
      isUser: false,
      timestamp: new Date('2024-01-15T11:01:00Z')
    },
    {
      userId: globalUser.id,
      message: "That's fascinating! I'd like to learn more about Ghana's community-based approach.",
      isUser: true,
      timestamp: new Date('2024-01-15T11:02:00Z')
    }
  ]

  // Insert chat messages
  for (const message of ghanaChatMessages) {
    await prisma.chatMessage.create({
      data: message
    })
  }

  for (const message of globalChatMessages) {
    await prisma.chatMessage.create({
      data: message
    })
  }

  console.log('✅ Created chat messages')

  console.log('🎉 Database population completed successfully!')
  console.log('📊 Summary:')
  console.log('   - Created 2 sample users (Ghana & Global)')
  console.log('   - Added emergency contacts for both users')
  console.log('   - Created mood entries with cultural context')
  console.log('   - Added journal entries reflecting different perspectives')
  console.log('   - Created community posts about mental health topics')
  console.log('   - Added wellness activities with cultural elements')
  console.log('   - Set up goals reflecting different cultural priorities')
  console.log('   - Created chat messages with cultural context')
  console.log('')
  console.log('🌍 The database now contains:')
  console.log('   - Ghana-specific mental health resources and cultural context')
  console.log('   - Global mental health resources and international perspectives')
  console.log('   - Sample data that reflects diverse cultural approaches to mental wellness')
  console.log('   - Emergency contacts and crisis resources for both contexts')
}

main()
  .catch((e) => {
    console.error('❌ Error populating database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
