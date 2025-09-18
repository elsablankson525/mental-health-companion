"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Users, 
  MessageCircle, 
  Heart, 
  Shield, 
  Search, 
  Plus, 
  ThumbsUp, 
  Reply, 
  Clock,
  Star,
  Filter,
  Globe,
  Lock,
  UserPlus,
  MessageSquare
} from "lucide-react"

interface ForumPost {
  id: string
  title: string
  content: string
  author: string
  avatar: string
  timestamp: string
  likes: number
  replies: number
  category: string
  isPinned?: boolean
}

interface SupportGroup {
  id: string
  name: string
  description: string
  memberCount: number
  category: string
  isPrivate: boolean
  tags: string[]
}

interface PeerConnection {
  id: string
  name: string
  avatar: string
  interests: string[]
  experience: string
  isOnline: boolean
  lastActive: string
}

export default function CommunitySupport() {
  const { data: session } = useSession()
  const [activeTab, setActiveTab] = useState("forums")
  const [searchQuery, setSearchQuery] = useState("")

  // Database-connected state
  const [forumPosts, setForumPosts] = useState<ForumPost[]>([])
  const [supportGroups, setSupportGroups] = useState<SupportGroup[]>([])
  const [peerConnections, setPeerConnections] = useState<PeerConnection[]>([])

  // Load data from API
  useEffect(() => {
    if (session?.user?.id) {
      loadCommunityData()
    }
  }, [session])

  const loadCommunityData = async () => {
    try {
      // Load forum posts
      const postsRes = await fetch('/api/community/posts')
      if (postsRes.ok) {
        const postsData = await postsRes.json()
        setForumPosts(postsData)
      } else {
        // Use fallback data if API fails
        setForumPosts(getDefaultForumPosts())
      }

      // For now, use default data for support groups and peer connections
      // In a real app, these would come from community APIs
      setSupportGroups(getDefaultSupportGroups())
      setPeerConnections(getDefaultPeerConnections())
    } catch (error) {
      console.error('Error loading community data:', error)
      // Use fallback data
      setForumPosts(getDefaultForumPosts())
      setSupportGroups(getDefaultSupportGroups())
      setPeerConnections(getDefaultPeerConnections())
    }
  }

  const getDefaultForumPosts = (): ForumPost[] => [
    {
      id: "1",
      title: "Mental Health Awareness in Ghana - Let's Break the Stigma",
      content: "I've noticed positive changes in how mental health is discussed in Ghana. The Mental Health Authority's initiatives are making a difference. Let's continue supporting each other and breaking down barriers. What are your experiences with mental health support in Ghana?",
      author: "Ama Serwaa",
      avatar: "/avatars/ama.jpg",
      timestamp: "2 hours ago",
      likes: 24,
      replies: 8,
      category: "Support",
      isPinned: true
    },
    {
      id: "2",
      title: "Traditional Healing and Modern Therapy - Finding Balance",
      content: "In Ghana, we have rich traditional healing practices that complement modern mental health care. How do you balance traditional approaches with contemporary therapy? I'd love to hear about your experiences.",
      author: "Kwame Asante",
      avatar: "/avatars/kwame.jpg",
      timestamp: "4 hours ago",
      likes: 18,
      replies: 12,
      category: "Wellness"
    },
    {
      id: "3",
      title: "Global Mental Health Resources - Sharing Knowledge",
      content: "I'm compiling a list of mental health resources from different countries. It's amazing how diverse approaches can be. From Ghana's community-based support to Nordic countries' social systems, each culture offers unique insights. What resources from your country would you recommend?",
      author: "Sarah Johnson",
      avatar: "/avatars/sarah.jpg",
      timestamp: "6 hours ago",
      likes: 31,
      replies: 15,
      category: "Resources"
    },
    {
      id: "4",
      title: "Cultural Perspectives on Mental Wellness",
      content: "Mental health is experienced differently across cultures. What cultural practices or beliefs about mental wellness do you find helpful? I'm particularly interested in learning about non-Western approaches to emotional wellbeing.",
      author: "Maria Rodriguez",
      avatar: "/avatars/maria.jpg",
      timestamp: "8 hours ago",
      likes: 22,
      replies: 19,
      category: "Discussion"
    },
    {
      id: "5",
      title: "Community Support Networks in West Africa",
      content: "The extended family system in West Africa provides incredible emotional support. How do you leverage your community connections for mental wellness? Share your experiences with family and community support.",
      author: "Fatou Diallo",
      avatar: "/avatars/fatou.jpg",
      timestamp: "1 day ago",
      likes: 16,
      replies: 7,
      category: "Community"
    },
    {
      id: "6",
      title: "Digital Mental Health Access in Developing Countries",
      content: "Access to mental health services can be challenging in developing countries. How has technology helped bridge the gap? What digital resources have been most helpful for you?",
      author: "David Kimani",
      avatar: "/avatars/david.jpg",
      timestamp: "1 day ago",
      likes: 28,
      replies: 11,
      category: "Technology"
    }
  ]

  const getDefaultSupportGroups = (): SupportGroup[] => [
    {
      id: "1",
      name: "Ghana Mental Health Advocates",
      description: "A supportive community for mental health advocates in Ghana. Share experiences, resources, and work together to reduce stigma and improve access to mental health services.",
      memberCount: 1247,
      category: "Advocacy",
      isPrivate: false,
      tags: ["ghana", "advocacy", "mental health", "community", "stigma"]
    },
    {
      id: "2",
      name: "Traditional Healing & Modern Therapy",
      description: "Exploring the integration of traditional healing practices with modern mental health approaches. Learn from different cultural perspectives on wellness and healing.",
      memberCount: 892,
      category: "Cultural Wellness",
      isPrivate: false,
      tags: ["traditional healing", "therapy", "cultural", "wellness", "integration"]
    },
    {
      id: "3",
      name: "Global Mental Health Network",
      description: "Connect with mental health advocates, professionals, and individuals from around the world. Share resources, experiences, and learn about different approaches to mental wellness.",
      memberCount: 2156,
      category: "International",
      isPrivate: false,
      tags: ["global", "international", "network", "resources", "support"]
    },
    {
      id: "4",
      name: "West African Mental Health Community",
      description: "A private, supportive community for West African individuals to discuss mental health challenges, cultural considerations, and find understanding within our shared cultural context.",
      memberCount: 423,
      category: "Regional",
      isPrivate: true,
      tags: ["west africa", "cultural", "support", "community", "regional"]
    },
    {
      id: "5",
      name: "Digital Mental Health Access",
      description: "Focusing on improving access to mental health resources through technology, especially in developing countries and underserved communities.",
      memberCount: 654,
      category: "Technology",
      isPrivate: false,
      tags: ["digital health", "access", "technology", "developing countries", "resources"]
    },
    {
      id: "6",
      name: "Cultural Perspectives on Wellness",
      description: "Learn and share different cultural approaches to mental wellness, from mindfulness practices to community support systems around the world.",
      memberCount: 789,
      category: "Cultural",
      isPrivate: false,
      tags: ["culture", "wellness", "perspectives", "global", "mindfulness"]
    }
  ]

  const getDefaultPeerConnections = (): PeerConnection[] => [
    {
      id: "1",
      name: "Ama Serwaa",
      avatar: "/avatars/ama.jpg",
      interests: ["Mental Health Advocacy", "Community Support", "Cultural Wellness"],
      experience: "5 years managing anxiety with traditional and modern approaches",
      isOnline: true,
      lastActive: "Online now"
    },
    {
      id: "2",
      name: "Kwame Asante",
      avatar: "/avatars/kwame.jpg",
      interests: ["Traditional Healing", "Psychology", "Ghana Mental Health"],
      experience: "Mental health professional specializing in cultural approaches",
      isOnline: false,
      lastActive: "2 hours ago"
    },
    {
      id: "3",
      name: "Sarah Johnson",
      avatar: "/avatars/sarah.jpg",
      interests: ["Global Mental Health", "International Resources", "Cross-cultural Therapy"],
      experience: "Therapist with experience in multiple countries",
      isOnline: true,
      lastActive: "Online now"
    },
    {
      id: "4",
      name: "Maria Rodriguez",
      avatar: "/avatars/maria.jpg",
      interests: ["Cultural Psychology", "Community Mental Health", "Latin American Perspectives"],
      experience: "Community mental health worker focusing on cultural integration",
      isOnline: false,
      lastActive: "1 day ago"
    },
    {
      id: "5",
      name: "Fatou Diallo",
      avatar: "/avatars/fatou.jpg",
      interests: ["West African Mental Health", "Family Systems", "Community Support"],
      experience: "Social worker specializing in family and community mental health",
      isOnline: true,
      lastActive: "Online now"
    },
    {
      id: "6",
      name: "David Kimani",
      avatar: "/avatars/david.jpg",
      interests: ["Digital Mental Health", "Technology Access", "Developing Countries"],
      experience: "Tech entrepreneur working on mental health accessibility solutions",
      isOnline: false,
      lastActive: "3 hours ago"
    }
  ]

  const categories = ["All", "Anxiety", "Depression", "Wellness", "Identity", "Recovery", "General"]

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-2">
          <Users className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">Community Support</h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Connect with others who understand your journey. Share experiences, find support, and build meaningful connections in a safe, moderated environment.
        </p>
        <div className="flex items-center justify-center space-x-4 text-sm text-muted-foreground">
          <div className="flex items-center space-x-1">
            <Shield className="h-4 w-4" />
            <span>Safe & Moderated</span>
          </div>
          <div className="flex items-center space-x-1">
            <Heart className="h-4 w-4" />
            <span>Peer Support</span>
          </div>
          <div className="flex items-center space-x-1">
            <Globe className="h-4 w-4" />
            <span>24/7 Available</span>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search discussions, groups, or topics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                New Post
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="forums" className="flex items-center space-x-2">
            <MessageCircle className="h-4 w-4" />
            <span>Discussion Forums</span>
          </TabsTrigger>
          <TabsTrigger value="groups" className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>Support Groups</span>
          </TabsTrigger>
          <TabsTrigger value="peers" className="flex items-center space-x-2">
            <UserPlus className="h-4 w-4" />
            <span>Peer Connections</span>
          </TabsTrigger>
        </TabsList>

        {/* Discussion Forums Tab */}
        <TabsContent value="forums" className="space-y-6">
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Badge
                key={category}
                variant={category === "All" ? "default" : "outline"}
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
              >
                {category}
              </Badge>
            ))}
          </div>

          {/* Forum Posts */}
          <div className="space-y-4">
            {forumPosts.map((post) => (
              <Card key={post.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={post.avatar} />
                        <AvatarFallback>{post.author[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center space-x-2">
                          <CardTitle className="text-lg">{post.title}</CardTitle>
                          {post.isPinned && (
                            <Badge variant="secondary" className="text-xs">
                              <Star className="h-3 w-3 mr-1" />
                              Pinned
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span>by {post.author}</span>
                          <span className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            {post.timestamp}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {post.category}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">{post.content}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Button variant="ghost" size="sm" className="text-muted-foreground">
                        <ThumbsUp className="h-4 w-4 mr-1" />
                        {post.likes}
                      </Button>
                      <Button variant="ghost" size="sm" className="text-muted-foreground">
                        <Reply className="h-4 w-4 mr-1" />
                        {post.replies} replies
                      </Button>
                    </div>
                    <Button size="sm">Join Discussion</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Support Groups Tab */}
        <TabsContent value="groups" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {supportGroups.map((group) => (
              <Card key={group.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <CardTitle className="text-lg">{group.name}</CardTitle>
                        {group.isPrivate ? (
                          <Lock className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Globe className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                      <CardDescription className="mt-2">
                        {group.description}
                      </CardDescription>
                    </div>
                    <Badge variant="outline">{group.category}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span className="flex items-center space-x-1">
                        <Users className="h-4 w-4" />
                        {group.memberCount.toLocaleString()} members
                      </span>
                      <span className={group.isPrivate ? "text-orange-500" : "text-green-500"}>
                        {group.isPrivate ? "Private" : "Public"}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {group.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" className="flex-1">
                        Join Group
                      </Button>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Peer Connections Tab */}
        <TabsContent value="peers" className="space-y-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {peerConnections.map((peer) => (
              <Card key={peer.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="text-center">
                  <div className="flex justify-center mb-4">
                    <div className="relative">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={peer.avatar} />
                        <AvatarFallback>{peer.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-background ${
                        peer.isOnline ? 'bg-green-500' : 'bg-gray-400'
                      }`} />
                    </div>
                  </div>
                  <CardTitle className="text-lg">{peer.name}</CardTitle>
                  <CardDescription>{peer.experience}</CardDescription>
                  <div className="text-sm text-muted-foreground">
                    {peer.lastActive}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-sm mb-2">Interests</h4>
                      <div className="flex flex-wrap gap-1">
                        {peer.interests.map((interest) => (
                          <Badge key={interest} variant="outline" className="text-xs">
                            {interest}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" className="flex-1">
                        <MessageSquare className="h-4 w-4 mr-1" />
                        Connect
                      </Button>
                      <Button variant="outline" size="sm">
                        <UserPlus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Community Guidelines */}
      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Community Guidelines</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-2">Be Respectful</h4>
              <p className="text-sm text-muted-foreground">
                Treat everyone with kindness and respect. We're all here to support each other.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Share Safely</h4>
              <p className="text-sm text-muted-foreground">
                Don't share personal information. Keep conversations focused on support and healing.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">No Medical Advice</h4>
              <p className="text-sm text-muted-foreground">
                Share experiences, not medical advice. Always consult professionals for treatment.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Report Concerns</h4>
              <p className="text-sm text-muted-foreground">
                If you see something concerning, report it. We're here to keep everyone safe.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
