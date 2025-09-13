import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const commentId = params.id
    const { voteType } = await request.json() // 'like' o 'dislike'
    const userId = session.user.id

    if (!['like', 'dislike'].includes(voteType)) {
      return NextResponse.json(
        { error: 'Invalid vote type. Must be "like" or "dislike"' },
        { status: 400 }
      )
    }

    // Obtener el comentario actual
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      select: {
        id: true,
        likes: true,
        dislikes: true,
        userId: true
      }
    })

    if (!comment) {
      return NextResponse.json(
        { error: 'Comment not found' },
        { status: 404 }
      )
    }

    // No permitir votar en tu propio comentario
    if (comment.userId === userId) {
      return NextResponse.json(
        { error: 'Cannot vote on your own comment' },
        { status: 400 }
      )
    }

    let updatedLikes = [...(comment.likes || [])]
    let updatedDislikes = [...(comment.dislikes || [])]

    if (voteType === 'like') {
      // Si ya dio like, removerlo
      if (updatedLikes.includes(userId)) {
        updatedLikes = updatedLikes.filter(id => id !== userId)
      } else {
        // Agregar like y remover dislike si existía
        updatedLikes.push(userId)
        updatedDislikes = updatedDislikes.filter(id => id !== userId)
      }
    } else if (voteType === 'dislike') {
      // Si ya dio dislike, removerlo
      if (updatedDislikes.includes(userId)) {
        updatedDislikes = updatedDislikes.filter(id => id !== userId)
      } else {
        // Agregar dislike y remover like si existía
        updatedDislikes.push(userId)
        updatedLikes = updatedLikes.filter(id => id !== userId)
      }
    }

    // Actualizar el comentario
    const updatedComment = await prisma.comment.update({
      where: { id: commentId },
      data: {
        likes: updatedLikes,
        dislikes: updatedDislikes
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true
          }
        },
        replies: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      comment: updatedComment,
      userVote: updatedLikes.includes(userId) ? 'like' : updatedDislikes.includes(userId) ? 'dislike' : null
    })

  } catch (error) {
    console.error('Error voting on comment:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}