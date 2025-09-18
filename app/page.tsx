"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CalmingBackground } from "@/components/ui/calming-background"
import { MessageCircle, BookOpen, Heart, BarChart3, LogIn, UserPlus } from "lucide-react"
import Link from "next/link"

export default function Home() {
  const { data: _session, status } = useSession()
  const router = useRouter()

  // If user is authenticated, redirect to dashboard
  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard")
    }
  }, [status, router])

  if (status === "authenticated") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Redirecting to dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <CalmingBackground variant="gradient" intensity="low">
      {/* Navigation */}
      <nav className="glass border-b border-border/50 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Heart className="h-6 w-6 text-primary" />
            <span className="font-bold text-lg">Mental Health Companion</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/auth/signin">
              <Button variant="ghost" size="sm" className="hover-lift">
                <LogIn className="h-4 w-4 mr-2" />
                Sign In
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button size="sm" className="btn-support hover-lift">
                <UserPlus className="h-4 w-4 mr-2" />
                Sign Up
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        <PublicHomePage />
      </main>
    </CalmingBackground>
  )
}

function PublicHomePage() {
  return (
    <div className="max-w-6xl mx-auto space-y-12">
      {/* Hero Section */}
      <div className="text-center space-y-8 py-16">
        <div className="animate-float">
          <h1 className="text-6xl font-bold text-foreground bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent animate-soft-pulse">
            AI Mental Health Companion
          </h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed animate-breathe">
          A safe, empathetic space for mental health support. Track your mood, journal your thoughts, and chat with our
          AI companion. Remember, this is not a substitute for professional therapy.
        </p>
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
          <Link href="/auth/signup">
            <Button size="lg" className="w-full sm:w-auto btn-support hover-lift glow-soft">
              <UserPlus className="h-5 w-5 mr-2" />
              Get Started Free
            </Button>
          </Link>
          <Link href="/auth/signin">
            <Button variant="outline" size="lg" className="w-full sm:w-auto hover-lift glass">
              <LogIn className="h-5 w-5 mr-2" />
              Sign In
            </Button>
          </Link>
        </div>
        <Badge variant="outline" className="text-sm glass animate-soft-pulse">
          Not a medical professional • Seek professional help when needed
        </Badge>
      </div>

      {/* Feature Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
        <Card className="glass glow-soft">
          <CardHeader className="text-center">
            <MessageCircle className="h-14 w-14 text-primary mx-auto mb-4" />
            <CardTitle className="text-lg">AI Companion</CardTitle>
            <CardDescription>Chat with our empathetic AI for support and guidance</CardDescription>
          </CardHeader>
        </Card>

        <Card className="glass glow-calm">
          <CardHeader className="text-center">
            <BookOpen className="h-14 w-14 text-secondary mx-auto mb-4" />
            <CardTitle className="text-lg">Journal</CardTitle>
            <CardDescription>Write down your thoughts and feelings in a safe space</CardDescription>
          </CardHeader>
        </Card>

        <Card className="glass glow-peace">
          <CardHeader className="text-center">
            <Heart className="h-14 w-14 text-accent mx-auto mb-4" />
            <CardTitle className="text-lg">Mood Tracker</CardTitle>
            <CardDescription>Track your daily mood and emotional patterns</CardDescription>
          </CardHeader>
        </Card>

        <Card className="glass glow-soft">
          <CardHeader className="text-center">
            <BarChart3 className="h-14 w-14 text-chart-1 mx-auto mb-4" />
            <CardTitle className="text-lg">Insights</CardTitle>
            <CardDescription>View your mental health trends and progress</CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* Benefits Section */}
      <div className="glass rounded-2xl p-10 space-y-8 bg-gradient-calm">
        <h2 className="text-4xl font-semibold text-center text-card-foreground">Why Choose Our Platform?</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center space-y-4">
            <div className="h-16 w-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto glow-soft">
              <Heart className="h-8 w-8 text-primary" />
            </div>
            <h3 className="font-semibold text-lg">Safe & Private</h3>
            <p className="text-sm text-muted-foreground">Your data is encrypted and never shared</p>
          </div>
          <div className="text-center space-y-4">
            <div className="h-16 w-16 bg-secondary/20 rounded-full flex items-center justify-center mx-auto glow-calm">
              <MessageCircle className="h-8 w-8 text-secondary" />
            </div>
            <h3 className="font-semibold text-lg">24/7 Support</h3>
            <p className="text-sm text-muted-foreground">AI companion available whenever you need</p>
          </div>
          <div className="text-center space-y-4">
            <div className="h-16 w-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto glow-peace">
              <BarChart3 className="h-8 w-8 text-accent" />
            </div>
            <h3 className="font-semibold text-lg">Track Progress</h3>
            <p className="text-sm text-muted-foreground">Monitor your mental health journey</p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="text-center space-y-6 py-12">
        <h2 className="text-3xl font-semibold animate-soft-pulse">Ready to Start Your Mental Health Journey?</h2>
        <p className="text-muted-foreground text-lg">Join thousands of users who have found support and guidance</p>
        <Link href="/auth/signup">
          <Button size="lg" className="btn-hope hover-lift glow-soft animate-breathe">
            <UserPlus className="h-5 w-5 mr-2" />
            Create Your Account
          </Button>
        </Link>
      </div>
    </div>
  )
}
