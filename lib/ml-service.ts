/**
 * ML Service for Mental Health Companion
 * Handles communication with the ML backend
 */

const ML_API_URL = process.env.NEXT_PUBLIC_ML_API_URL || 'http://localhost:5000/api'

export interface SentimentAnalysis {
  sentiment: 'positive' | 'negative' | 'neutral'
  confidence: number
  polarity: number
  subjectivity: number
  method: string
}

export interface MoodPrediction {
  predicted_mood: number
  confidence: number
  recommendations: string[]
  emotions_analyzed: string[]
  note_analyzed: boolean
}

export interface Recommendation {
  type: string
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
}

export interface PatternAnalysis {
  success: boolean
  patterns: {
    average_mood: number
    mood_trend: 'improving' | 'declining' | 'stable'
    total_entries: number
    date_range: {
      start: string
      end: string
    }
  }
}

class MLService {
  private async makeRequest<T>(endpoint: string, data?: any): Promise<T> {
    try {
      const response = await fetch(`${ML_API_URL}${endpoint}`, {
        method: data ? 'POST' : 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        body: data ? JSON.stringify(data) : undefined,
      })

      if (!response.ok) {
        throw new Error(`ML API error: ${response.status} ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error(`ML Service error for ${endpoint}:`, error)
      throw error
    }
  }

  async healthCheck(): Promise<{ status: string; models_loaded: any }> {
    return this.makeRequest('/health')
  }

  async analyzeSentiment(text: string): Promise<SentimentAnalysis> {
    return this.makeRequest('/sentiment', { text })
  }

  async predictMood(data: {
    emotions: string[]
    note?: string
    user_id?: string
  }): Promise<MoodPrediction> {
    return this.makeRequest('/predict-mood', data)
  }

  async getRecommendations(data: {
    mood: number
    emotions: string[]
    sentiment_data?: any
    user_id?: string
  }): Promise<{ recommendations: Recommendation[]; count: number }> {
    return this.makeRequest('/recommendations', data)
  }

  async analyzePatterns(data: {
    mood_entries: any[]
    journal_entries?: any[]
  }): Promise<PatternAnalysis> {
    return this.makeRequest('/patterns', data)
  }
}

export const mlService = new MLService()