export const dynamic = 'force-dynamic'
export const revalidate = 0

import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

// Get all proposals
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Parse query parameters
    const url = new URL(request.url)
    const status = url.searchParams.get("status")
    const limit = Number.parseInt(url.searchParams.get("limit") || "10")
    const page = Number.parseInt(url.searchParams.get("page") || "1")
    const skip = (page - 1) * limit

    // Build the query
    const where = status ? { status: status as any } : {}

    // Get proposals with pagination
    const proposals = await prisma.proposal.findMany({
      where,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        _count: {
          select: {
            votes: true,
            comments: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
    })

    // Get total count for pagination
    const total = await prisma.proposal.count({ where })

    return NextResponse.json({
      proposals,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit,
      },
    })
  } catch (error) {
    console.error("Error fetching proposals:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

// Create a new proposal
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    console.log("[API/Proposals] Sesión recibida:", session);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    // Solo ADMIN y SUPER_ADMIN pueden crear propuestas
    if (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN") {
      console.log("[API/Proposals] Rol insuficiente:", session.user.role);
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    let body;
    const contentType = request.headers.get('content-type') || '';
    if (contentType.includes('multipart/form-data')) {
      // No se soporta parseo de archivos en edge runtime, solo metadatos
      return NextResponse.json({ error: "File upload not supported yet. Adjunta solo metadatos." }, { status: 400 });
    } else {
      body = await request.json();
    }
  const { title, description, expiresAt, attachment, proposalType, budgetItems, workGroupIds, quarter, year, links } = body;

    // Validaciones mejoradas
    const errors = [];
  if (!title || title.length < 5) errors.push("The Title is mandatory and must be at least 5 characters long");
  if (!description || description.length < 10) errors.push("The Description is mandatory and must be at least 10 characters long");
  if (!expiresAt) errors.push("The Expiration date is mandatory");
  if (!proposalType) errors.push("The Proposal Type is mandatory");
    // Validaciones específicas para Quarterly Report
    if (proposalType === 'QUARTERLY_REPORT') {
  if (!quarter) errors.push("Select a quarter.");
      const y = Number(year)
      if (!Number.isInteger(y) || y < 2000 || y > 2100) {
        errors.push("Year must be between 2000 and 2100.")
      }
    }
    // Puedes agregar más validaciones aquí

    if (errors.length > 0) {
      console.warn("[API/Proposals] Validation errors:", errors)
      return NextResponse.json({ error: errors.join(' ') }, { status: 400 });
    }

    // Guardar la propuesta con los nuevos campos
    const proposal = await prisma.proposal.create({
      data: {
        title,
        description,
        expiresAt: new Date(expiresAt),
        authorId: session.user.id,
        attachment: attachment || null,
        proposalType: proposalType || "COMMUNITY_PROPOSAL",
        budgetItems: budgetItems || null,
        workGroupIds: workGroupIds || [],
        quarter: quarter || null,
        links: Array.isArray(links) ? links : links ? [links] : [], // Siempre guarda como array Json
      },
    });

    // Establecer 'year' mediante SQL crudo para evitar dependencia en prisma generate
    if (proposalType === 'QUARTERLY_REPORT' && Number.isInteger(Number(year))) {
      try {
        await prisma.$executeRaw`UPDATE "Proposal" SET "year" = ${Number(year)} WHERE "id" = ${proposal.id}`
      } catch (e) {
        console.error('Failed to set year via raw SQL:', e)
      }
    }

    // Devolver proposal con año si aplica
    try {
      const saved = await prisma.proposal.findUnique({ where: { id: proposal.id } })
      return NextResponse.json(saved ?? proposal, { status: 201 })
    } catch {
      return NextResponse.json(proposal, { status: 201 })
    }
  } catch (error) {
    console.error("Error creating proposal:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
