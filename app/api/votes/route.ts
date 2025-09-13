import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    console.log("API: Processing vote submission");
    
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      console.log("API: Unauthorized - No session or user ID");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { reportId, voteType, comment } = body;
    
    console.log("API: Vote data received:", { reportId, voteType, commentLength: comment?.length });

    // Validaciones
    if (!reportId || !voteType) {
      console.log("API: Missing required fields:", { reportId, voteType });
      return NextResponse.json({ 
        error: "Missing required fields: reportId, voteType" 
      }, { status: 400 });
    }

    // Solo requerir comentario para OBJETAR
    if (voteType === "OBJETAR" && (!comment || comment.trim().length < 10)) {
      console.log("API: Insufficient comment length for objection:", comment?.trim().length);
      return NextResponse.json({ 
        error: "Objections require a minimum of 10 characters justification" 
      }, { status: 400 });
    }

    // Verificar que el reporte existe y está en estado de consenso
    const report = await prisma.quarterlyReport.findUnique({
      where: { id: reportId },
      include: {
        votingRounds: {
          where: { status: "ACTIVA" },
          orderBy: { roundNumber: "desc" },
          take: 1
        }
      }
    });

    if (!report) {
      console.log("API: Report not found:", reportId);
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    if (report.consensusStatus === "CONSENSED") {
      return NextResponse.json({ error: "Report already consensed" }, { status: 400 });
    }

    // Obtener la ronda activa
    let activeRound = report.votingRounds[0];
    console.log("API: Active round found:", activeRound?.id);
    
    // Si no hay ronda activa, crear una automáticamente
    if (!activeRound) {
      console.log("API: No active voting round found, creating new one");
      
      // Obtener el número de la siguiente ronda
      const lastRound = await prisma.votingRound.findFirst({
        where: { reportId },
        orderBy: { roundNumber: "desc" }
      });
      
      const nextRoundNumber = lastRound ? lastRound.roundNumber + 1 : 1;
      
      // Crear nueva ronda de votación
      activeRound = await prisma.votingRound.create({
        data: {
          reportId,
          roundNumber: nextRoundNumber,
          status: "ACTIVA",
          startedAt: new Date()
        }
      });
      
      // Actualizar el estado del reporte a IN_CONSENSUS
      await prisma.quarterlyReport.update({
        where: { id: reportId },
        data: { consensusStatus: "IN_CONSENSUS" }
      });
      
      console.log("API: Created new voting round:", activeRound.id);
    }

    // Verificar si el usuario ya votó en esta ronda
    const existingVote = await prisma.consensusVote.findFirst({
      where: {
        userId: session.user.id,
        roundId: activeRound.id
      }
    });

    if (existingVote) {
      // Actualizar el voto existente
      const updatedVote = await prisma.consensusVote.update({
        where: { id: existingVote.id },
        data: {
          voteType,
          comment: comment || "",
          updatedAt: new Date()
        },
        include: {
          user: true,
          objection: true
        }
      });

      // Si el voto es de tipo OBJETAR, crear o actualizar la objeción
      if (voteType === "OBJETAR") {
        await prisma.objection.upsert({
          where: { voteId: updatedVote.id },
          update: {},
          create: {
            voteId: updatedVote.id,
            status: "PENDIENTE"
          }
        });
      }

      return NextResponse.json(updatedVote);
    }

    // Crear nuevo voto
    const newVote = await prisma.consensusVote.create({
      data: {
        userId: session.user.id,
        reportId,
        voteType,
        comment: comment || "",
        roundId: activeRound.id
      },
      include: {
        user: true,
        objection: true
      }
    });

    // Si el voto es de tipo OBJETAR, crear la objeción
    if (voteType === "OBJETAR") {
      await prisma.objection.create({
        data: {
          voteId: newVote.id,
          status: "PENDIENTE"
        }
      });
    }

    return NextResponse.json(newVote);
  } catch (error) {
    console.error("Error creating vote:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 