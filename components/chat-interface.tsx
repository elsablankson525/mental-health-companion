"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Send, Bot, User, Brain, AlertCircle, Wifi, WifiOff, MessageCircle, Lightbulb } from "lucide-react"
import { enhancedMLService } from "@/lib/enhanced-ml-service"
import { useSession } from "next-auth/react"

interface Message {
  id: string
  content: string
  sender: "user" | "ai"
  timestamp: string
  sentiment?: any
  context?: any
  suggestions?: string[]
  followUpQuestions?: string[]
}

export default function ChatInterface() {
  const { data: session } = useSession()
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [mlConnected, setMlConnected] = useState(false)
  const [isRealtimeConnected, setIsRealtimeConnected] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const eventSourceRef = useRef<EventSource | null>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (!session?.user?.id) return

    // Load chat messages from database
    const loadChatMessages = async () => {
      try {
        setIsLoading(true)
        const response = await fetch('/api/chat-messages')
        if (response.ok) {
          const messages = await response.json()
          setMessages(messages)
        } else {
          // If no messages, add welcome message
          setMessages([{
            id: "welcome",
            content: "Hello! I'm here to listen and support you. How are you feeling today?",
            sender: "ai",
            timestamp: new Date().toISOString(),
          }])
        }
      } catch (error) {
        console.error('Failed to load chat messages:', error)
        setMessage({ type: 'error', text: 'Failed to load chat messages' })
        // Add welcome message as fallback
        setMessages([{
          id: "welcome",
          content: "Hello! I'm here to listen and support you. How are you feeling today?",
          sender: "ai",
          timestamp: new Date().toISOString(),
        }])
      } finally {
        setIsLoading(false)
      }
    }

    loadChatMessages()

    // Check ML service connection
    enhancedMLService.healthCheck()
      .then((health) => {
        setMlConnected(health.status === 'healthy')
      })
      .catch(() => {
        setMlConnected(false)
      })

    // Setup real-time connection
    const setupRealtimeConnection = () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
      }

      const eventSource = new EventSource('/api/realtime')
      eventSourceRef.current = eventSource

      eventSource.onopen = () => {
        setIsRealtimeConnected(true)
      }

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          
          if (data.type === 'chat_message') {
            // Refresh chat messages when a new one is added
            loadChatMessages()
          } else if (data.type === 'crisis_alert') {
            setMessage({ 
              type: 'error', 
              text: `Crisis Alert: ${data.data.recommendations.join(', ')}` 
            })
          }
        } catch (error) {
          console.error('Error parsing real-time message:', error)
        }
      }

      eventSource.onerror = () => {
        setIsRealtimeConnected(false)
        // Attempt to reconnect after 5 seconds
        setTimeout(setupRealtimeConnection, 5000)
      }
    }

    setupRealtimeConnection()

    // Cleanup on unmount
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
      }
    }
  }, [session?.user?.id])

  const generateAIResponse = async (userMessage: string, conversationHistory: Message[], userProfile: any, currentMood: number, recentActivities: string[], goals: any[]) => {
    try {
      const personalizedResponse = await enhancedMLService.getPersonalizedResponse({
        userMessage,
        conversationHistory: conversationHistory.slice(-10), // Last 10 messages for context
        userProfile,
        currentMood,
        recentActivities,
        goals
      })

      return personalizedResponse
    } catch (error) {
      console.error('Error generating personalized response:', error)
      
      // Fallback to basic responses
      const responses = {
        positive: [
          "I'm so glad to hear you're feeling positive! It's wonderful when we can recognize and appreciate these moments. What's contributing to this good feeling?",
          "That's fantastic! Positive emotions are so important for our well-being. Is there anything specific that's making you feel this way?",
          "I love hearing about your positive experiences! These moments are precious. How can we help you maintain this positive energy?"
        ],
        negative: [
          "I hear you, and I want you to know that your feelings are completely valid. It's okay to not be okay. Can you tell me more about what's weighing on you?",
          "I'm sorry you're going through a difficult time. These feelings can be overwhelming, but they are temporary. What would help you feel a little better right now?",
          "Thank you for sharing this with me. It takes courage to express difficult emotions. You're not alone in this. What kind of support would be most helpful right now?"
        ],
        neutral: [
          "I hear you. Sometimes we just need to process our thoughts out loud. Can you tell me more about what's on your mind?",
          "Thank you for sharing that with me. Sometimes just talking about our experiences can help us understand them better. What else is going on for you?",
          "I appreciate you opening up. It sounds like you're in a reflective space. What would you like to explore or discuss further?"
        ]
      }

      // Fallback to keyword-based responses
      const lowerMessage = userMessage.toLowerCase()
      if (lowerMessage.includes("sad") || lowerMessage.includes("depressed")) {
        return {
          response: "I'm sorry you're feeling sad. These feelings can be overwhelming, but they are temporary. Have you tried any coping strategies that have helped before?",
          sentiment: 'negative',
          suggestions: ['Try deep breathing exercises', 'Connect with a friend', 'Engage in a favorite activity'],
          followUpQuestions: ['What coping strategies have worked for you before?', 'Would you like to talk about what\'s making you feel this way?']
        }
      }
      if (lowerMessage.includes("anxious") || lowerMessage.includes("worried")) {
        return {
          response: "Anxiety can feel very intense. Let's try a grounding technique: Can you name 5 things you can see, 4 things you can touch, 3 things you can hear, 2 things you can smell, and 1 thing you can taste?",
          sentiment: 'neutral',
          suggestions: ['Practice the 5-4-3-2-1 grounding technique', 'Try progressive muscle relaxation', 'Focus on slow, deep breathing'],
          followUpQuestions: ['How are you feeling after trying the grounding technique?', 'What usually helps when you feel anxious?']
        }
      }
      if (lowerMessage.includes("angry") || lowerMessage.includes("frustrated")) {
        return {
          response: "It's okay to feel angry. These emotions are telling us something important. What do you think might be at the root of these feelings?",
          sentiment: 'negative',
          suggestions: ['Take a walk to cool down', 'Write down your feelings', 'Practice mindfulness'],
          followUpQuestions: ['What triggered these feelings?', 'How can we work through this together?']
        }
      }

      return {
        response: responses.neutral[Math.floor(Math.random() * responses.neutral.length)],
        sentiment: 'neutral',
        suggestions: ['Share more about your thoughts', 'Try journaling', 'Practice self-care'],
        followUpQuestions: ['What else is on your mind?', 'How can I support you today?']
      }
    }
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !session?.user?.id) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: "user",
      timestamp: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setIsTyping(true)
    setIsAnalyzing(true)

    try {
      // Save user message to database
      const userResponse = await fetch('/api/chat-messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputValue,
          isUser: true,
        }),
      })

      if (!userResponse.ok) {
        throw new Error('Failed to save user message')
      }

      // Get user context for personalized response
      const [moodResponse, goalsResponse, activitiesResponse] = await Promise.all([
        fetch('/api/mood-entries?limit=1'),
        fetch('/api/goals?status=ACTIVE'),
        fetch('/api/wellness-activities?limit=5')
      ])

      const currentMood = moodResponse.ok ? (await moodResponse.json())[0]?.mood || 5 : 5
      const goals = goalsResponse.ok ? await goalsResponse.json() : []
      const activities = activitiesResponse.ok ? await activitiesResponse.json() : []

      setIsAnalyzing(false)

      // Generate AI response
      const aiResponseData = await generateAIResponse(
        inputValue,
        messages,
        { preferences: session.user },
        currentMood,
        activities.map((a: any) => a.name),
        goals
      )

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: aiResponseData.response,
        sender: "ai",
        timestamp: new Date().toISOString(),
        suggestions: aiResponseData.suggestions,
        followUpQuestions: aiResponseData.followUpQuestions
      }
      
      // Save AI response to database
      const aiResponseSave = await fetch('/api/chat-messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: aiResponseData.response,
          isUser: false,
        }),
      })

      if (!aiResponseSave.ok) {
        throw new Error('Failed to save AI response')
      }

      setMessages((prev) => [...prev, aiResponse])
      setIsTyping(false)
    } catch (error) {
      console.error('Error processing message:', error)
      setMessage({ type: 'error', text: 'Failed to send message. Please try again.' })
      setIsAnalyzing(false)
      setIsTyping(false)
    }
  }

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion)
  }

  const handleFollowUpClick = (question: string) => {
    setInputValue(question)
  }

  return (
    <div className="max-w-4xl mx-auto h-[600px] flex flex-col">
      {/* Message Display */}
      {message && (
        <Alert className={message.type === 'success' ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}>
          <AlertDescription className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>
            {message.text}
          </AlertDescription>
        </Alert>
      )}

      <div className="mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">AI Companion Chat</h1>
            <p className="text-muted-foreground">Share your thoughts and feelings in a safe, judgment-free space</p>
          </div>
          <div className="flex items-center space-x-2">
            {isRealtimeConnected ? (
              <Badge variant="default" className="flex items-center space-x-1">
                <Wifi className="h-3 w-3" />
                <span>Live</span>
              </Badge>
            ) : (
              <Badge variant="outline" className="flex items-center space-x-1">
                <WifiOff className="h-3 w-3" />
                <span>Offline</span>
              </Badge>
            )}
            {mlConnected ? (
              <Badge variant="default" className="flex items-center space-x-1">
                <Brain className="h-3 w-3" />
                <span>ML Enhanced</span>
              </Badge>
            ) : (
              <Badge variant="outline" className="flex items-center space-x-1">
                <AlertCircle className="h-3 w-3" />
                <span>Basic Mode</span>
              </Badge>
            )}
          </div>
        </div>
      </div>

      <Card className="flex-1 flex flex-col">
        <CardContent className="flex-1 p-4 overflow-y-auto space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-start space-x-3 ${
                message.sender === "user" ? "flex-row-reverse space-x-reverse" : ""
              }`}
            >
              <div className={`p-2 rounded-full ${message.sender === "user" ? "bg-primary" : "bg-secondary"}`}>
                {message.sender === "user" ? (
                  <User className="h-4 w-4 text-primary-foreground" />
                ) : (
                  <Bot className="h-4 w-4 text-secondary-foreground" />
                )}
              </div>
              <div
                className={`max-w-[70%] p-3 rounded-lg ${
                  message.sender === "user"
                    ? "bg-primary text-primary-foreground ml-auto"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                <p className="text-sm">{message.content}</p>
                
                {/* Show sentiment analysis for user messages */}
                {message.sender === "user" && message.sentiment && (
                  <div className="mt-2 flex items-center space-x-2">
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${
                        message.sentiment.sentiment === 'positive' ? 'border-green-500 text-green-500' :
                        message.sentiment.sentiment === 'negative' ? 'border-red-500 text-red-500' :
                        'border-gray-500 text-gray-500'
                      }`}
                    >
                      {message.sentiment.sentiment} ({Math.round(message.sentiment.confidence * 100)}%)
                    </Badge>
                  </div>
                )}

                {/* Show suggestions for AI messages */}
                {message.sender === "ai" && message.suggestions && message.suggestions.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <p className="text-xs font-medium opacity-80 flex items-center">
                      <Lightbulb className="h-3 w-3 mr-1" />
                      Suggestions:
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {message.suggestions.slice(0, 3).map((suggestion, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          className="text-xs h-6 px-2"
                          onClick={() => handleSuggestionClick(suggestion)}
                        >
                          {suggestion}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Show follow-up questions for AI messages */}
                {message.sender === "ai" && message.followUpQuestions && message.followUpQuestions.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <p className="text-xs font-medium opacity-80 flex items-center">
                      <MessageCircle className="h-3 w-3 mr-1" />
                      Follow-up questions:
                    </p>
                    <div className="space-y-1">
                      {message.followUpQuestions.slice(0, 2).map((question, index) => (
                        <Button
                          key={index}
                          variant="ghost"
                          size="sm"
                          className="text-xs h-auto p-2 text-left justify-start"
                          onClick={() => handleFollowUpClick(question)}
                        >
                          {question}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                <span className="text-xs opacity-70 mt-1 block">
                  {formatTime(message.timestamp)}
                </span>
              </div>
            </div>
          ))}

          {(isTyping || isAnalyzing) && (
            <div className="flex items-start space-x-3">
              <div className="p-2 rounded-full bg-secondary">
                <Bot className="h-4 w-4 text-secondary-foreground" />
              </div>
              <div className="bg-muted p-3 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {isAnalyzing ? "Analyzing..." : "Thinking..."}
                  </span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </CardContent>

        <div className="p-4 border-t border-border">
          <div className="flex space-x-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Share what's on your mind..."
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              className="flex-1"
            />
            <Button onClick={handleSendMessage} disabled={!inputValue.trim() || isTyping || isAnalyzing || isLoading}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
