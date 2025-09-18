"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Phone, MessageCircle, Globe, Heart } from "lucide-react"

interface CrisisModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function CrisisModal({ isOpen, onClose }: CrisisModalProps) {
  const crisisResources = [
    {
      name: "Ghana Mental Health Authority Crisis Line",
      phone: "+233 302 666 000",
      description: "24/7 crisis support and mental health emergency services in Ghana",
      icon: Phone,
    },
    {
      name: "Accra Psychiatric Hospital Emergency",
      phone: "+233 302 666 000",
      description: "Emergency psychiatric services and crisis intervention in Accra",
      icon: Phone,
    },
    {
      name: "988 Suicide & Crisis Lifeline (US)",
      phone: "988",
      description: "24/7 crisis support for anyone experiencing emotional distress",
      icon: Phone,
    },
    {
      name: "Crisis Text Line",
      phone: "Text HOME to 741741",
      description: "24/7 crisis support via text message",
      icon: MessageCircle,
    },
    {
      name: "Samaritans (UK)",
      phone: "116 123",
      description: "24/7 emotional support for anyone in distress",
      icon: Phone,
    },
    {
      name: "International Association for Suicide Prevention",
      phone: "Visit iasp.info/resources",
      description: "Crisis centers worldwide",
      icon: Globe,
    },
  ]

  const groundingExercises = [
    "Take 5 deep breaths: Inhale for 4 counts, hold for 4, exhale for 6",
    "Name 5 things you can see, 4 you can touch, 3 you can hear, 2 you can smell, 1 you can taste",
    "Hold an ice cube or splash cold water on your face",
    "Call a trusted friend or family member",
    "Go to your nearest emergency room if you're in immediate danger",
  ]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-destructive flex items-center space-x-2">
            <Heart className="h-6 w-6" />
            <span>Crisis Support Resources</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Important Notice */}
          <Card className="border-destructive">
            <CardContent className="pt-6">
              <p className="text-lg font-semibold text-destructive mb-2">
                If you're having thoughts of suicide or self-harm, please reach out for help immediately.
              </p>
              <p className="text-foreground">
                You are not alone, and there are people who want to help you through this difficult time. These feelings
                are temporary, but suicide is permanent.
              </p>
            </CardContent>
          </Card>

          {/* Crisis Hotlines */}
          <div>
            <h3 className="text-xl font-semibold text-foreground mb-4">Emergency Contacts</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {crisisResources.map((resource, index) => (
                <Card key={index}>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center space-x-2 text-lg">
                      <resource.icon className="h-5 w-5 text-primary" />
                      <span>{resource.name}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="font-semibold text-primary text-lg mb-2">{resource.phone}</p>
                    <p className="text-sm text-muted-foreground">{resource.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Grounding Exercises */}
          <div>
            <h3 className="text-xl font-semibold text-foreground mb-4">Immediate Coping Strategies</h3>
            <Card>
              <CardContent className="pt-6">
                <ul className="space-y-3">
                  {groundingExercises.map((exercise, index) => (
                    <li key={index} className="flex items-start space-x-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-semibold">
                        {index + 1}
                      </span>
                      <span className="text-foreground">{exercise}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Additional Resources */}
          <Card>
            <CardHeader>
              <CardTitle>Remember</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-foreground">
                • This AI companion is not a substitute for professional mental health care
              </p>
              <p className="text-foreground">
                • If you're in immediate danger, call 911 or go to your nearest emergency room
              </p>
              <p className="text-foreground">
                • Consider reaching out to a mental health professional for ongoing support
              </p>
              <p className="text-foreground">• You matter, and your life has value</p>
            </CardContent>
          </Card>

          <div className="flex justify-center">
            <Button onClick={onClose} size="lg">
              I'm Safe Now
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
