import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const isPublic = searchParams.get("isPublic")
    const limit = searchParams.get("limit")

    const where: any = {}
    if (category) where.category = category
    if (isPublic !== null) where.isPublic = isPublic === "true"

    const posts = await prisma.communityPost.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true
          }
        },
        communityComments: {
          take: 3,
          orderBy: { createdAt: "desc" },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true
              }
            }
          }
        },
        communityLikes: {
          where: { userId: session.user.id },
          select: { id: true }
        }
      },
      orderBy: { createdAt: "desc" },
      ...(limit && { take: parseInt(limit) })
    })

    // Add user's like status to each post
    const postsWithLikeStatus = posts.map((post: any) => ({
      ...post,
      userLiked: post.communityLikes.length > 0
    }))

    return NextResponse.json(postsWithLikeStatus)
  } catch (error) {
    console.error("Error fetching community posts:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { 
      title, 
      content, 
      category, 
      tags, 
      isPublic 
    } = await request.json()

    if (!title || !content || !category) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const post = await prisma.communityPost.create({
      data: {
        userId: session.user.id,
        title,
        content,
        category,
        tags: tags || [],
        isPublic: isPublic !== false // Default to true
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true
          }
        }
      }
    })

    return NextResponse.json(post, { status: 201 })
  } catch (error) {
    console.error("Error creating community post:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
