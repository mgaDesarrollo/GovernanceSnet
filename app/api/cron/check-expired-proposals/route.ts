export const dynamic = 'force-dynamic'
export const revalidate = 0

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// Esta función se puede llamar mediante un cron job o manualmente
export async function GET(request: Request) {
  try {
    // Verificar si la solicitud incluye una clave de API válida
    const url = new URL(request.url)
    const apiKey = url.searchParams.get("apiKey")

    // En producción, deberías verificar una clave de API real
    // Por ahora, usamos una clave simple para demostración
    if (apiKey !== process.env.CRON_API_KEY && apiKey !== "demo-key") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Buscar propuestas que han expirado pero siguen en estado IN_REVIEW
    const now = new Date()
    const expiredProposals = await prisma.proposal.findMany({
      where: {
        status: "IN_REVIEW",
        expiresAt: {
          lt: now,
        },
      },
    })

    // Actualizar el estado de las propuestas expiradas
    const updatePromises = expiredProposals.map((proposal) =>
      prisma.proposal.update({
        where: { id: proposal.id },
        data: { status: "EXPIRED" },
      }),
    )

    const updatedProposals = await Promise.all(updatePromises)

    return NextResponse.json({
      success: true,
      message: `${updatedProposals.length} proposals marked as expired`,
      updatedProposals: updatedProposals.map((p) => ({ id: p.id, title: p.title })),
    })
  } catch (error) {
    console.error("Error checking expired proposals:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
