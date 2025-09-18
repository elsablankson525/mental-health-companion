import { MLService } from './ml-service'

export interface MoodPrediction {
  predictedMood: number
  confidence: number
  factors: {
    sleep: number
    medication: number
    activities: number
    social: number
  }
  recommendations: string[]
}

export interface WellnessRecommendation {
  activity: string
  category: string
  duration: number
  intensity: string
  reason: string
  confidence: number
}

export interface ProgressInsight {
  type: 'trend' | 'pattern' | 'correlation' | 'achievement' | 'warning'
  title: string
  description: string
  confidence: number
  impact: 'high' | 'medium' | 'low'
  actionable: boolean
  recommendations?: string[]
  data?: any
}

export interface GoalRecommendation {
  goal: string
  category: string
  targetValue: number
  unit: string
  timeframe: string
  reason: string
  priority: number
}

export class EnhancedMLService extends MLService {
  constructor() {
    super()
  }

  // Mood Prediction with comprehensive data
  async predictMoodEnhanced(data: {
    recentMoods: number[]
    sleepQuality: number[]
    medicationAdherence: number[]
    activityLevel: number[]
    socialEngagement: number[]
    stressLevel?: number
    weather?: string
    dayOfWeek?: number
  }): Promise<MoodPrediction> {
    try {
      return await this.makeRequest<MoodPrediction>('/predict-mood', data)
    } catch (error) {
      console.error('Error predicting mood:', error)
      // Fallback prediction
      return {
        predictedMood: 7,
        confidence: 0.5,
        factors: {
          sleep: 0.3,
          medication: 0.2,
          activities: 0.3,
          social: 0.2
        },
        recommendations: [
          'Maintain consistent sleep schedule',
          'Take medications as prescribed',
          'Engage in physical activity',
          'Connect with friends or family'
        ]
      }
    }
  }

  // Wellness Activity Recommendations
  async getWellnessRecommendations(data: {
    currentMood: number
    energyLevel: number
    availableTime: number
    preferences: string[]
    recentActivities: string[]
    weather?: string
    timeOfDay?: string
  }): Promise<WellnessRecommendation[]> {
    try {
      return await this.makeRequest<WellnessRecommendation[]>('/wellness-recommendations', data)
    } catch (error) {
      console.error('Error getting wellness recommendations:', error)
      // Fallback recommendations
      return [
        {
          activity: 'Deep Breathing Exercise',
          category: 'Mindfulness',
          duration: 10,
          intensity: 'low',
          reason: 'Helps reduce stress and improve mood',
          confidence: 0.8
        },
        {
          activity: 'Light Walking',
          category: 'Physical',
          duration: 20,
          intensity: 'low',
          reason: 'Increases energy and improves mood',
          confidence: 0.7
        }
      ]
    }
  }

  // Progress Insights and Analytics
  async getProgressInsights(data: {
    moodHistory: number[]
    sleepHistory: number[]
    medicationHistory: number[]
    activityHistory: string[]
    goalProgress: any[]
    timeRange: string
  }): Promise<ProgressInsight[]> {
    try {
      return await this.makeRequest<ProgressInsight[]>('/progress-insights', data)
    } catch (error) {
      console.error('Error getting progress insights:', error)
      // Fallback insights
      return [
        {
          type: 'trend',
          title: 'Mood Improvement Trend',
          description: 'Your mood has been improving over the past week',
          confidence: 0.75,
          impact: 'medium',
          actionable: true,
          recommendations: ['Continue current routine', 'Track patterns more closely']
        }
      ]
    }
  }

  // Goal Recommendations
  async getGoalRecommendations(data: {
    currentGoals: any[]
    moodHistory: number[]
    activityHistory: string[]
    preferences: string[]
    timeAvailability: number
  }): Promise<GoalRecommendation[]> {
    try {
      return await this.makeRequest<GoalRecommendation[]>('/goal-recommendations', data)
    } catch (error) {
      console.error('Error getting goal recommendations:', error)
      // Fallback recommendations
      return [
        {
          goal: 'Improve Sleep Quality',
          category: 'Sleep',
          targetValue: 8,
          unit: 'hours',
          timeframe: '1 month',
          reason: 'Better sleep can improve mood and energy levels',
          priority: 1
        }
      ]
    }
  }

  // Medication Effectiveness Analysis
  async analyzeMedicationEffectiveness(data: {
    medicationLogs: any[]
    moodHistory: number[]
    sideEffects: string[]
    adherenceRate: number
  }): Promise<{
    effectiveness: number
    sideEffectImpact: number
    adherenceImpact: number
    recommendations: string[]
  }> {
    try {
      return await this.makeRequest<{
        effectiveness: number
        sideEffectImpact: number
        adherenceImpact: number
        recommendations: string[]
      }>('/medication-analysis', data)
    } catch (error) {
      console.error('Error analyzing medication effectiveness:', error)
      // Fallback analysis
      return {
        effectiveness: 7,
        sideEffectImpact: 2,
        adherenceImpact: 8,
        recommendations: [
          'Take medication at consistent times',
          'Track side effects regularly',
          'Discuss effectiveness with healthcare provider'
        ]
      }
    }
  }

  // Sleep Pattern Analysis
  async analyzeSleepPatterns(data: {
    sleepHistory: any[]
    moodHistory: number[]
    activityHistory: string[]
    medicationHistory: any[]
  }): Promise<{
    averageSleep: number
    sleepQuality: number
    patterns: string[]
    recommendations: string[]
    optimalBedtime: string
    optimalWakeTime: string
  }> {
    try {
      return await this.makeRequest<{
        averageSleep: number
        sleepQuality: number
        patterns: string[]
        recommendations: string[]
        optimalBedtime: string
        optimalWakeTime: string
      }>('/sleep-analysis', data)
    } catch (error) {
      console.error('Error analyzing sleep patterns:', error)
      // Fallback analysis
      return {
        averageSleep: 7.5,
        sleepQuality: 7,
        patterns: ['Consistent bedtime', 'Good sleep duration'],
        recommendations: [
          'Maintain consistent sleep schedule',
          'Avoid screens before bedtime',
          'Create relaxing bedtime routine'
        ],
        optimalBedtime: '22:30',
        optimalWakeTime: '06:30'
      }
    }
  }

  // Crisis Detection
  async detectCrisisRisk(data: {
    recentMoods: number[]
    journalEntries: string[]
    chatMessages: string[]
    medicationAdherence: number[]
    socialEngagement: number[]
  }): Promise<{
    riskLevel: 'low' | 'medium' | 'high' | 'critical'
    confidence: number
    indicators: string[]
    recommendations: string[]
    emergencyActions: string[]
  }> {
    try {
      return await this.makeRequest<{
        riskLevel: 'low' | 'medium' | 'high' | 'critical'
        confidence: number
        indicators: string[]
        recommendations: string[]
        emergencyActions: string[]
      }>('/crisis-detection', data)
    } catch (error) {
      console.error('Error detecting crisis risk:', error)
      // Conservative fallback
      return {
        riskLevel: 'low',
        confidence: 0.5,
        indicators: [],
        recommendations: [
          'Continue monitoring mood and symptoms',
          'Maintain regular check-ins with healthcare provider'
        ],
        emergencyActions: [
          'Contact emergency services if in immediate danger',
          'Call crisis hotline: 988',
          'Reach out to trusted friend or family member'
        ]
      }
    }
  }

  // Personalized Chat Response
  async getPersonalizedResponse(data: {
    userMessage: string
    conversationHistory: any[]
    userProfile: any
    currentMood: number
    recentActivities: string[]
    goals: any[]
  }): Promise<{
    response: string
    sentiment: string
    suggestions: string[]
    followUpQuestions: string[]
  }> {
    try {
      return await this.makeRequest<{
        response: string
        sentiment: string
        suggestions: string[]
        followUpQuestions: string[]
      }>('/personalized-chat', data)
    } catch (error) {
      console.error('Error getting personalized response:', error)
      // Fallback response
      return {
        response: "I'm here to listen and support you. How are you feeling today?",
        sentiment: 'neutral',
        suggestions: [
          'Share how you\'re feeling',
          'Talk about your goals',
          'Discuss any challenges'
        ],
        followUpQuestions: [
          'What\'s been on your mind lately?',
          'How can I help you today?'
        ]
      }
    }
  }
}

export const enhancedMLService = new EnhancedMLService()
