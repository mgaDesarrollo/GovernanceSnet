import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const proposalId = params.id
    const { content, parentId } = await request.json()

    if (!content || content.trim() === "") {
      return NextResponse.json({ error: "Comment content is required" }, { status: 400 })
    }

    // Check if proposal exists
    const proposal = await prisma.proposal.findUnique({
      where: { id: proposalId },
    })

    if (!proposal) {
      return NextResponse.json({ error: "Proposal not found" }, { status: 404 })
    }

    // Si es una respuesta a un comentario, verificar que el comentario padre existe
    if (parentId) {
      const parentComment = await prisma.comment.findUnique({
        where: { id: parentId },
      })
      
      if (!parentComment) {
        return NextResponse.json({ error: "Parent comment not found" }, { status: 404 })
      }
  }

    // Create the comment
    const comment = await prisma.comment.create({
      data: {
        content,
        userId: session.user.id,
        proposalId,
        parentId: parentId || null,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    })

    return NextResponse.json(comment, { status: 201 })
  } catch (error) {
    console.error("Error creating comment:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

// Get all comments for a proposal
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const proposalId = params.id

    const comments = await prisma.comment.findMany({
      where: { 
        proposalId,
        parentId: null // Solo comentarios principales, no respuestas
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        replies: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
          orderBy: {
            createdAt: "asc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(comments)
  } catch (error) {
    console.error("Error fetching comments:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
