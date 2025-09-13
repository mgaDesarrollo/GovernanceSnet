import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { prisma } from "@/lib/prisma"
import type { VoteType as PrismaVoteType } from "@prisma/client"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { endOfDay } from "date-fns"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

  const proposalId = params.id
  const body = (await request.json()) as { voteType: PrismaVoteType | string; comment?: string }
  const { voteType, comment } = body

  if (!["POSITIVE", "NEGATIVE", "ABSTAIN"].includes(voteType as string)) {
      return NextResponse.json({ error: "Invalid vote type" }, { status: 400 })
    }
  const voteTypeEnum = voteType as PrismaVoteType

    // Check if proposal exists and is not expired
    const proposal = await prisma.proposal.findUnique({
      where: { id: proposalId },
    })

    if (!proposal) {
      return NextResponse.json({ error: "Proposal not found" }, { status: 404 })
    }

    if (proposal.status !== "IN_REVIEW") {
      return NextResponse.json(
        {
          error:
            proposal.status === "EXPIRED"
              ? "Cannot vote on an expired proposal"
              : "Cannot vote on a proposal that is not in review",
        },
        { status: 400 },
      )
    }

  // Treat proposal as active until the end of the expiration date
  if (endOfDay(new Date(proposal.expiresAt)) < new Date()) {
      // Instead of just returning an error, update the proposal status to EXPIRED
      await prisma.proposal.update({
        where: { id: proposalId },
        data: { status: "EXPIRED" },
      })

      return NextResponse.json({ error: "Proposal has expired and has been marked as such" }, { status: 400 })
    }

    // Check if user has already voted
    const existingVote = await prisma.vote.findUnique({
      where: {
        userId_proposalId: {
          userId: session.user.id,
          proposalId,
        },
      },
    })

    // Start a transaction to update vote counts
    const result = await prisma.$transaction(async (tx) => {
  const newComment = typeof comment === "string" && comment.trim().length > 0 ? comment.trim() : undefined
      // If user has already voted, update their vote
      if (existingVote) {
        // Decrement the previous vote count
        if (existingVote.type === "POSITIVE") {
          await tx.proposal.update({
            where: { id: proposalId },
            data: { positiveVotes: { decrement: 1 } },
          })
        } else if (existingVote.type === "NEGATIVE") {
          await tx.proposal.update({
            where: { id: proposalId },
            data: { negativeVotes: { decrement: 1 } },
          })
        } else if (existingVote.type === "ABSTAIN") {
          await tx.proposal.update({
            where: { id: proposalId },
            data: { abstainVotes: { decrement: 1 } },
          })
        }

        // Update the vote
        const updateData = {
          type: voteTypeEnum,
          ...(newComment !== undefined ? { comment: newComment } : {}),
        }
        await tx.vote.update({
          where: { id: existingVote.id },
          data: updateData,
        })
      } else {
        // Create a new vote
        const createData = {
          type: voteTypeEnum,
          userId: session.user.id,
          proposalId,
          ...(newComment !== undefined ? { comment: newComment } : {}),
        }
        await tx.vote.create({
          data: createData,
        })
      }

      // Increment the new vote count
  if (voteTypeEnum === "POSITIVE") {
        await tx.proposal.update({
          where: { id: proposalId },
          data: { positiveVotes: { increment: 1 } },
        })
  } else if (voteTypeEnum === "NEGATIVE") {
        await tx.proposal.update({
          where: { id: proposalId },
          data: { negativeVotes: { increment: 1 } },
        })
  } else if (voteTypeEnum === "ABSTAIN") {
        await tx.proposal.update({
          where: { id: proposalId },
          data: { abstainVotes: { increment: 1 } },
        })
      }

  // Note: do not create or upsert a general proposal comment from a vote's comment.
  // The vote's reason stays in Vote.comment and is shown under Consent Tracking interactions.

      // Return the updated proposal
      return tx.proposal.findUnique({
        where: { id: proposalId },
        include: {
          votes: {
            include: {
              user: { select: { id: true, name: true, image: true } },
            },
            orderBy: { createdAt: "desc" },
          },
          comments: {
            include: {
              user: { select: { id: true, name: true, image: true } },
            },
            orderBy: { createdAt: "desc" },
          },
        },
      })
    })

    return NextResponse.json({
      proposal: result,
      userVote: voteTypeEnum,
    })
  } catch (error) {
    console.error("Error voting on proposal:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
