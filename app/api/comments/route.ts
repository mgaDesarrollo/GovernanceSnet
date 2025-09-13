import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { reportId, content, parentCommentId } = body;

    // Validaciones
    if (!reportId || !content) {
      return NextResponse.json({ 
        error: "Missing required fields: reportId, content" 
      }, { status: 400 });
    }

    if (content.trim().length < 5) {
      return NextResponse.json({ 
        error: "Comment must be at least 5 characters long" 
      }, { status: 400 });
    }

    if (content.trim().length > 1000) {
      return NextResponse.json({ 
        error: "Comment must be less than 1000 characters" 
      }, { status: 400 });
    }

    // Verificar que el reporte existe
    const report = await prisma.quarterlyReport.findUnique({
      where: { id: reportId }
    });

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    // Si es una respuesta a un comentario, verificar que el comentario padre existe
    if (parentCommentId) {
      const parentComment = await prisma.consensusComment.findUnique({
        where: { id: parentCommentId }
      });

      if (!parentComment) {
        return NextResponse.json({ error: "Parent comment not found" }, { status: 404 });
      }
    }

    // Crear el comentario
    const comment = await prisma.consensusComment.create({
      data: {
        userId: session.user.id,
        reportId,
        content: content.trim(),
        parentCommentId: parentCommentId || null,
        likes: [],
        dislikes: []
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        },
        parentComment: {
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
    });

    return NextResponse.json(comment);
  } catch (error) {
    console.error("Error creating comment:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 