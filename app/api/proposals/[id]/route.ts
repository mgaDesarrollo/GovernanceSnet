import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

// Get a specific proposal with votes and comments
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id: proposalId } = await params

    // 1) Load proposal WITHOUT comments (we’ll load comments separately to build a tree)
    const proposal = await prisma.proposal.findUnique({
      where: { id: proposalId },
      include: {
        author: { select: { id: true, name: true, image: true } },
        votes: {
          include: { user: { select: { id: true, name: true, image: true } } },
          orderBy: { createdAt: "desc" },
        },
        _count: {
          select: {
            votes: true,
            comments: true,
          },
        },
        workgroup: {
          select: { id: true, name: true, type: true, status: true },
        },
      },
    })

    if (!proposal) {
      return NextResponse.json({ error: "Proposal not found" }, { status: 404 })
    }

    // 2) Load ALL comments flat (one query)
    const flatComments = await prisma.comment.findMany({
      where: { proposalId },
      include: {
        user: { select: { id: true, name: true, image: true } },
      },
      orderBy: { createdAt: "asc" }, // oldest first for stable child ordering
    })

    // 3) Build a tree (replies of replies ... infinitely)
    type C = typeof flatComments[number] & { replies?: C[] }
    const byId = new Map<string, C>()
    const roots: C[] = []

    for (const c of flatComments) {
      byId.set(c.id, { ...c, replies: [] })
    }
    for (const c of flatComments) {
      const node = byId.get(c.id)!
      if (c.parentId) {
        const parent = byId.get(c.parentId)
        if (parent) parent.replies!.push(node)
        else roots.push(node) // parent deleted? treat as root fallback
      } else {
        roots.push(node)
      }
    }

    // 4) Sort roots DESC and children ASC/DESC as you like
    const sortTree = (nodes: C[]): C[] => {
      const sorted = [...nodes].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime() // newest roots first
      )
      return sorted.map(n => ({
        ...n,
        replies: n.replies && n.replies.length ? sortChildren(n.replies) : [],
      }))
    }
    const sortChildren = (nodes: C[]): C[] => {
      const sorted = [...nodes].sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime() // oldest first inside threads
      )
      return sorted.map(n => ({
        ...n,
        replies: n.replies && n.replies.length ? sortChildren(n.replies) : [],
      }))
    }

    const commentsTree = sortTree(roots)

    // 5) Associated workgroups (unchanged)
    let associatedWorkGroups: { id: string; name: string; type: string; status: string }[] = []
    if (proposal.workGroupIds && proposal.workGroupIds.length > 0) {
      associatedWorkGroups = await prisma.workGroup.findMany({
        where: { id: { in: proposal.workGroupIds } },
        select: { id: true, name: true, type: true, status: true },
      })
    }

    // 6) User vote / commented
    const userVote = proposal.votes.find((v) => v.userId === session.user.id)
    const userHasCommented = flatComments.some((c) => c.userId === session.user.id)

    // 7) Return proposal with recursive comments
    return NextResponse.json({
      ...proposal,
      comments: commentsTree,
      associatedWorkGroups,
      userVote: userVote?.type || null,
      userHasCommented,
    })
  } catch (error) {
    console.error("Error fetching proposal:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

// Update a proposal (status change or edit content)
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id: proposalId } = await params
    const body = await request.json()

    // Find the proposal first
    const proposal = await prisma.proposal.findUnique({
      where: { id: proposalId },
      select: { authorId: true, status: true },
    })

    if (!proposal) {
      return NextResponse.json({ error: "Proposal not found" }, { status: 404 })
    }

    // Check if this is a status update (admin only) or content edit (author only)
    if (body.status) {
      // Status update - only ADMIN and SUPER_ADMIN can update status
      if (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }

      const updatedProposal = await prisma.proposal.update({
        where: { id: proposalId },
        data: { status: body.status },
      })

      return NextResponse.json(updatedProposal)
    } else {
      // Content edit - only the author can edit content
      if (proposal.authorId !== session.user.id) {
        return NextResponse.json({ error: "Only the author can edit this proposal" }, { status: 403 })
      }

      // Only allow editing if proposal is still IN_REVIEW
      if (proposal.status !== "IN_REVIEW") {
        return NextResponse.json({ error: "Cannot edit proposal that is not in review" }, { status: 400 })
      }

  const { title, description, expiresAt, attachment, proposalType, budgetItems, workGroupIds, quarter, year, links } = body

      // Validación para Quarterly Report si se especifica
      if (proposalType === 'QUARTERLY_REPORT') {
        if (!quarter) {
          return NextResponse.json({ error: 'Select a quarter.' }, { status: 400 })
        }
        const y = Number(year)
        if (!Number.isInteger(y) || y < 2000 || y > 2100) {
          return NextResponse.json({ error: 'Year must be between 2000 and 2100.' }, { status: 400 })
        }
      }

      const updatedProposal = await prisma.proposal.update({
        where: { id: proposalId },
        data: {
          title,
          description,
          expiresAt: expiresAt ? new Date(expiresAt) : undefined,
          attachment: attachment || undefined,
          proposalType: proposalType || undefined,
          quarter: quarter || undefined,
          budgetItems: budgetItems || undefined,
          workGroupIds: workGroupIds || undefined,
          links: links || undefined,
          updatedAt: new Date(),
        },
      })

      // Establecer 'year' mediante SQL crudo si corresponde
      if (proposalType === 'QUARTERLY_REPORT' && Number.isInteger(Number(year))) {
        try {
          await prisma.$executeRaw`UPDATE "Proposal" SET "year" = ${Number(year)} WHERE "id" = ${proposalId}`
        } catch (e) {
          console.error('Failed to set year via raw SQL (PATCH):', e)
        }
      } else if (proposalType && proposalType !== 'QUARTERLY_REPORT') {
        // Si el tipo cambia, limpiar year
        try {
          await prisma.$executeRaw`UPDATE "Proposal" SET "year" = NULL, "quarter" = NULL WHERE "id" = ${proposalId}`
        } catch {}
      }

      // Devolver la propuesta actualizada desde DB para incluir 'year'
      try {
        const saved = await prisma.proposal.findUnique({ where: { id: proposalId } })
        return NextResponse.json(saved ?? updatedProposal)
      } catch {
        return NextResponse.json(updatedProposal)
      }
    }
  } catch (error) {
    console.error("Error updating proposal:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

// Delete a proposal
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Only ADMIN and SUPER_ADMIN can delete proposals
    if (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { id: proposalId } = await params

    // Delete related votes and comments first
    await prisma.vote.deleteMany({ where: { proposalId } })
    await prisma.comment.deleteMany({ where: { proposalId } })

    // Delete the proposal
    await prisma.proposal.delete({ where: { id: proposalId } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting proposal:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
