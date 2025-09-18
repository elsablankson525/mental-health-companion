"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Timer, 
  Heart, 
  Brain, 
  Sun, 
  Wind, 
  Sparkles,
  CheckCircle,
  Clock,
  Volume2,
  VolumeX
} from "lucide-react"

interface Activity {
  id: string
  title: string
  description: string
  duration: number // in minutes
  category: 'meditation' | 'breathing' | 'mindfulness' | 'relaxation' | 'movement'
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  icon: React.ComponentType<{ className?: string | undefined }>
  steps: string[]
  benefits: string[]
}

const activities: Activity[] = [
  // Ghana-specific wellness activities
  {
    id: "ghana-drumming",
    title: "Traditional Ghanaian Drumming",
    description: "Connect with Ghanaian cultural heritage through traditional drumming for emotional expression and community bonding",
    duration: 30,
    category: "movement",
    difficulty: "beginner",
    icon: Heart,
    steps: [
      "Find a quiet space or join a community drumming group",
      "Use traditional Ghanaian drums like djembe or talking drum",
      "Start with simple rhythms and gradually build complexity",
      "Focus on the connection between rhythm and emotion",
      "Allow the music to express your feelings",
      "End with a moment of gratitude for cultural heritage"
    ],
    benefits: ["Cultural connection", "Emotional expression", "Community bonding", "Stress relief", "Rhythm therapy"]
  },
  {
    id: "ghana-storytelling",
    title: "Ananse Storytelling Meditation",
    description: "Use traditional Ghanaian storytelling techniques for mindfulness and wisdom reflection",
    duration: 20,
    category: "mindfulness",
    difficulty: "beginner",
    icon: Brain,
    steps: [
      "Find a comfortable, quiet space",
      "Recall a traditional Ananse story or folk tale",
      "Reflect on the wisdom and lessons in the story",
      "Consider how the story applies to your current situation",
      "Allow the story to guide your thoughts and emotions",
      "End with gratitude for ancestral wisdom"
    ],
    benefits: ["Cultural wisdom", "Mindfulness", "Emotional processing", "Ancestral connection", "Stress reduction"]
  },
  {
    id: "ghana-herbal-tea",
    title: "Traditional Herbal Tea Ceremony",
    description: "Practice mindfulness through traditional Ghanaian herbal tea preparation and consumption",
    duration: 15,
    category: "mindfulness",
    difficulty: "beginner",
    icon: Sun,
    steps: [
      "Prepare traditional herbs like moringa, hibiscus, or ginger",
      "Heat water mindfully, paying attention to the process",
      "Steep herbs slowly, observing colors and aromas",
      "Hold the warm cup and feel its energy",
      "Sip slowly, savoring each taste and sensation",
      "Reflect on the healing properties of nature"
    ],
    benefits: ["Natural healing", "Mindfulness", "Cultural connection", "Digestive health", "Stress relief"]
  },
  // Global wellness activities
  {
    id: "breathing-4-7-8",
    title: "4-7-8 Breathing",
    description: "A calming breathing technique to reduce anxiety and promote relaxation",
    duration: 5,
    category: "breathing",
    difficulty: "beginner",
    icon: Wind,
    steps: [
      "Sit comfortably with your back straight",
      "Place the tip of your tongue against the roof of your mouth",
      "Exhale completely through your mouth",
      "Close your mouth and inhale through your nose for 4 counts",
      "Hold your breath for 7 counts",
      "Exhale through your mouth for 8 counts",
      "Repeat this cycle 4 times"
    ],
    benefits: ["Reduces anxiety", "Improves sleep", "Calms the nervous system", "Enhances focus"]
  },
  {
    id: "body-scan",
    title: "Body Scan Meditation",
    description: "A mindfulness practice to bring awareness to different parts of your body",
    duration: 15,
    category: "meditation",
    difficulty: "beginner",
    icon: Brain,
    steps: [
      "Lie down comfortably or sit in a relaxed position",
      "Close your eyes and take a few deep breaths",
      "Start by focusing on your toes, noticing any sensations",
      "Slowly move your attention up through your body",
      "Pay attention to each body part for 30-60 seconds",
      "Notice any tension and allow it to release",
      "End by bringing awareness to your whole body"
    ],
    benefits: ["Reduces physical tension", "Improves body awareness", "Promotes relaxation", "Enhances mindfulness"]
  },
  {
    id: "progressive-relaxation",
    title: "Progressive Muscle Relaxation",
    description: "Systematically tense and relax different muscle groups to release tension",
    duration: 20,
    category: "relaxation",
    difficulty: "intermediate",
    icon: Heart,
    steps: [
      "Find a quiet, comfortable place to sit or lie down",
      "Start with your feet, tense the muscles for 5 seconds",
      "Release the tension and notice the relaxation for 10 seconds",
      "Move up to your calves and repeat the process",
      "Continue with thighs, abdomen, arms, shoulders, and face",
      "Take deep breaths throughout the exercise",
      "End with a few minutes of complete relaxation"
    ],
    benefits: ["Reduces muscle tension", "Improves sleep quality", "Decreases stress", "Enhances body awareness"]
  },
  {
    id: "mindful-walking",
    title: "Mindful Walking",
    description: "A moving meditation that combines physical activity with mindfulness",
    duration: 10,
    category: "movement",
    difficulty: "beginner",
    icon: Sun,
    steps: [
      "Choose a quiet path or walk in nature",
      "Start walking at a comfortable pace",
      "Focus on the sensation of your feet touching the ground",
      "Notice your breathing and the rhythm of your steps",
      "Observe your surroundings without judgment",
      "If your mind wanders, gently return to your walking",
      "End with a moment of gratitude for the experience"
    ],
    benefits: ["Improves mood", "Reduces stress", "Enhances mindfulness", "Increases physical activity", "Connects with nature"]
  },
  {
    id: "loving-kindness",
    title: "Loving-Kindness Meditation",
    description: "Cultivate compassion and positive emotions through directed well-wishing",
    duration: 15,
    category: "meditation",
    difficulty: "intermediate",
    icon: Heart,
    steps: [
      "Sit comfortably and close your eyes",
      "Take a few deep breaths to center yourself",
      "Begin by directing loving-kindness toward yourself",
      "Repeat phrases like 'May I be happy, may I be healthy'",
      "Extend these wishes to loved ones",
      "Include neutral people and even difficult people",
      "End by sending love to all beings everywhere"
    ],
    benefits: ["Increases compassion", "Reduces negative emotions", "Improves relationships", "Enhances emotional well-being"]
  },
  {
    id: "gratitude-practice",
    title: "Gratitude Reflection",
    description: "Focus on positive aspects of life to improve mood and perspective",
    duration: 10,
    category: "mindfulness",
    difficulty: "beginner",
    icon: Sparkles,
    steps: [
      "Find a quiet, comfortable space",
      "Take three deep breaths to center yourself",
      "Think of three things you're grateful for today",
      "Reflect on why each thing brings you joy",
      "Consider the people who have helped you",
      "Notice how gratitude feels in your body",
      "End with a commitment to notice gratitude daily"
    ],
    benefits: ["Improves mood", "Reduces depression", "Enhances relationships", "Increases life satisfaction"]
  }
]

export default function WellnessActivities() {
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null)
  const [isActive, setIsActive] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [currentStep, setCurrentStep] = useState(0)
  const [isMuted, setIsMuted] = useState(false)
  const [completedActivities, setCompletedActivities] = useState<string[]>([])

  useEffect(() => {
    // Load completed activities from localStorage
    const saved = localStorage.getItem('completedWellnessActivities')
    if (saved) {
      setCompletedActivities(JSON.parse(saved))
    }
  }, [])

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isActive && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((time) => {
          if (time <= 1) {
            setIsActive(false)
            if (selectedActivity && !completedActivities.includes(selectedActivity.id)) {
              const newCompleted = [...completedActivities, selectedActivity.id]
              setCompletedActivities(newCompleted)
              localStorage.setItem('completedWellnessActivities', JSON.stringify(newCompleted))
            }
            return 0
          }
          return time - 1
        })
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isActive, timeRemaining, selectedActivity, completedActivities])

  const startActivity = (activity: Activity) => {
    setSelectedActivity(activity)
    setTimeRemaining(activity.duration * 60) // Convert minutes to seconds
    setCurrentStep(0)
    setIsActive(true)
  }

  const pauseActivity = () => {
    setIsActive(false)
  }

  const resumeActivity = () => {
    setIsActive(true)
  }

  const resetActivity = () => {
    if (selectedActivity) {
      setTimeRemaining(selectedActivity.duration * 60)
      setCurrentStep(0)
      setIsActive(false)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800'
      case 'intermediate': return 'bg-yellow-100 text-yellow-800'
      case 'advanced': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'meditation': return Brain
      case 'breathing': return Wind
      case 'mindfulness': return Sun
      case 'relaxation': return Heart
      case 'movement': return Sparkles
      default: return Brain
    }
  }

  const filteredActivities = (category: string) => {
    return activities.filter(activity => activity.category === category)
  }

  if (selectedActivity && isActive) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground mb-2">{selectedActivity.title}</h1>
          <p className="text-muted-foreground">{selectedActivity.description}</p>
        </div>

        <Card className="text-center">
          <CardContent className="pt-6">
            <div className="mb-6">
              <div className="text-6xl font-bold text-primary mb-2">
                {formatTime(timeRemaining)}
              </div>
              <Progress 
                value={((selectedActivity.duration * 60 - timeRemaining) / (selectedActivity.duration * 60)) * 100} 
                className="w-full max-w-md mx-auto"
              />
            </div>

            <div className="flex justify-center space-x-4 mb-6">
              {isActive ? (
                <Button onClick={pauseActivity} size="lg" variant="outline">
                  <Pause className="h-5 w-5 mr-2" />
                  Pause
                </Button>
              ) : (
                <Button onClick={resumeActivity} size="lg">
                  <Play className="h-5 w-5 mr-2" />
                  Resume
                </Button>
              )}
              <Button onClick={resetActivity} size="lg" variant="outline">
                <RotateCcw className="h-5 w-5 mr-2" />
                Reset
              </Button>
              <Button 
                onClick={() => setIsMuted(!isMuted)} 
                size="lg" 
                variant="outline"
              >
                {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
              </Button>
            </div>

            <div className="text-sm text-muted-foreground">
              Step {currentStep + 1} of {selectedActivity.steps.length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Timer className="h-5 w-5" />
              <span>Current Step</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg mb-4">{selectedActivity.steps[currentStep]}</p>
            <div className="flex justify-between">
              <Button 
                onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                disabled={currentStep === 0}
                variant="outline"
              >
                Previous
              </Button>
              <Button 
                onClick={() => setCurrentStep(Math.min(selectedActivity.steps.length - 1, currentStep + 1))}
                disabled={currentStep === selectedActivity.steps.length - 1}
              >
                Next
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-center">
          <Button 
            onClick={() => {
              setSelectedActivity(null)
              setIsActive(false)
              setTimeRemaining(0)
              setCurrentStep(0)
            }}
            variant="outline"
          >
            Back to Activities
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Wellness Activities</h1>
        <p className="text-muted-foreground text-lg">
          Discover guided exercises, meditations, and mindfulness practices to support your mental well-being
        </p>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="meditation">Meditation</TabsTrigger>
          <TabsTrigger value="breathing">Breathing</TabsTrigger>
          <TabsTrigger value="mindfulness">Mindfulness</TabsTrigger>
          <TabsTrigger value="relaxation">Relaxation</TabsTrigger>
          <TabsTrigger value="movement">Movement</TabsTrigger>
        </TabsList>

        {['all', 'meditation', 'breathing', 'mindfulness', 'relaxation', 'movement'].map((category) => (
          <TabsContent key={category} value={category} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(category === 'all' ? activities : filteredActivities(category)).map((activity) => {
                const IconComponent = activity.icon
                const CategoryIcon = getCategoryIcon(activity.category)
                const isCompleted = completedActivities.includes(activity.id)
                
                return (
                  <Card key={activity.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <IconComponent className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{activity.title}</CardTitle>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                <CategoryIcon className="h-3 w-3 mr-1" />
                                {activity.category}
                              </Badge>
                              <Badge className={`text-xs ${getDifficultyColor(activity.difficulty)}`}>
                                {activity.difficulty}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        {isCompleted && (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground text-sm mb-4">{activity.description}</p>
                      
                      <div className="flex items-center space-x-4 mb-4 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>{activity.duration} min</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Heart className="h-4 w-4" />
                          <span>{activity.benefits.length} benefits</span>
                        </div>
                      </div>

                      <div className="space-y-2 mb-4">
                        <p className="text-sm font-medium">Benefits:</p>
                        <div className="flex flex-wrap gap-1">
                          {activity.benefits.slice(0, 2).map((benefit, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {benefit}
                            </Badge>
                          ))}
                          {activity.benefits.length > 2 && (
                            <Badge variant="secondary" className="text-xs">
                              +{activity.benefits.length - 2} more
                            </Badge>
                          )}
                        </div>
                      </div>

                      <Button 
                        onClick={() => startActivity(activity)} 
                        className="w-full"
                        disabled={isActive}
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Start Activity
                      </Button>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {completedActivities.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span>Completed Activities</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {completedActivities.map((activityId) => {
                const activity = activities.find(a => a.id === activityId)
                return activity ? (
                  <Badge key={activityId} variant="outline" className="text-green-600 border-green-600">
                    {activity.title}
                  </Badge>
                ) : null
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
